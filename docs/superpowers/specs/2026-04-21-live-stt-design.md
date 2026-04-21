# Live Speech-to-Text — Design

## Goal

Expose a live streaming speech-to-text transcriber on the JigsawStack JS SDK so users can pipe real-time audio (microphone, WebRTC, file stream) and receive incremental + committed transcripts. The SDK must internally handle chunking, overlap stitching, and SSE parsing because the transcribe endpoint is HTTP/SSE, not WebSocket.

## Non-goals

- Mic capture helper (users bring their own audio source).
- Official browser support (the implementation is WHATWG-stream-based so it will likely work, but v1 is Node-tested only).
- Parallel chunk transcription.
- Custom pluggable stitcher/chunker.
- Automatic mid-stream language switching.
- Persistent server-side session state.
- Retry of failed chunks (a failed chunk is dropped; the next chunk picks up from retained overlap audio).

## Public API

```ts
const transcriber = jigsaw.audio.speech_to_text_live(config?: LiveSTTConfig);
```

### `LiveSTTConfig`

| Field                  | Type                                | Default | Purpose |
|------------------------|-------------------------------------|---------|---------|
| `language`             | `LanguageCodes \| "auto"`           | `"en"`  | Forwarded to transcribe endpoint |
| `sampleRate`           | `number`                            | `16000` | PCM16 sample rate of piped bytes |
| `channels`             | `1 \| 2`                            | `1`     | PCM16 channel count |
| `translate`            | `boolean`                           | `false` | Server-side translation to English |
| `chunkSeconds`         | `number`                            | `5`     | Chunk size sent per transcribe request |
| `overlapSeconds`       | `number`                            | `2`     | Audio retained between chunks for stitching |
| `vadThreshold`         | `number`                            | `0.4`   | Forwarded as `vad_threshold` query param |
| `maxBufferSeconds`     | `number`                            | `30`    | Upper bound on internal buffer before oldest frames are dropped |

### `LiveTranscriber`

```ts
interface LiveTranscriber {
  on<E extends keyof LiveSTTEvents>(event: E, handler: LiveSTTEvents[E]): this;
  off<E extends keyof LiveSTTEvents>(event: E, handler: LiveSTTEvents[E]): this;
  connect(): Promise<void>;
  stream(): WritableStream<Uint8Array>;
  close(): Promise<void>;
}
```

- `connect()` validates config (`sampleRate > 0`, `channels ∈ {1,2}`, `chunkSeconds > overlapSeconds > 0`, `maxBufferSeconds > chunkSeconds`), generates a session id via `crypto.randomUUID()` (Node ≥18 built-in), transitions to `open`, emits `open`. No network call. Throws if called twice.
- `stream()` returns the sink. Calling before `connect()` throws. Users pipe raw PCM16 little-endian bytes at the configured sample rate/channel count.
- `close()` stops accepting writes, awaits the in-flight chunk, flushes any remaining buffered audio ≥ 0.5s as a final chunk (`isFinal: true`), emits `close`. Idempotent — repeated calls return the same promise.

### Events

```ts
interface LiveSTTEvents {
  open:    (payload: { id: string }) => void;
  delta:   (payload: { text: string; chunkIndex: number }) => void;
  turn:    (payload: { text: string; chunkIndex: number; isFinal: boolean }) => void;
  warning: (payload: { code: "buffer_overflow" | "chunk_error"; message: string }) => void;
  error:   (err: Error) => void;
  close:   () => void;
}
```

- `open` fires exactly once after `connect()`. `id` is a locally-generated UUID for user-side logging/correlation (no server session exists).
- `delta` fires as SSE `transcript.delta` events stream in during a chunk. `text` is the preview already stitched against the last committed transcript. Drives ephemeral preview UI.
- `turn` fires once per chunk on `transcript.done`/`transcript.final`, after stitching. `isFinal` is true only on the flush-on-close chunk.
- `warning` fires for non-fatal issues (buffer overflow drops, single-chunk HTTP errors). Session continues.
- `error` fires for fatal issues (invalid config, 3 consecutive chunk failures, stream aborted). Terminates session.
- `close` fires exactly once — either after clean flush or after a fatal error.

**Ordering guarantees:** `delta` events for chunk N precede `turn` for chunk N; `turn` for chunk N precedes any event for chunk N+1; `close` is always last. Empty deltas/turns (silent chunks) are suppressed.

### Example

```ts
import { Readable } from "stream";
import recorder from "node-record-lpcm16";
import { JigsawStack } from "jigsawstack";

const jigsaw = JigsawStack({ apiKey: process.env.JIGSAWSTACK_API_KEY });
const transcriber = jigsaw.audio.speech_to_text_live({ language: "en" });

transcriber.on("open", ({ id }) => console.log("session", id));
transcriber.on("delta", ({ text }) => process.stdout.write(`\r… ${text}`));
transcriber.on("turn",  ({ text }) => console.log(`\n${text}`));
transcriber.on("warning", ({ code, message }) => console.warn(code, message));
transcriber.on("error", (err) => console.error(err));
transcriber.on("close", () => console.log("done"));

await transcriber.connect();

const rec = recorder.record({ sampleRate: 16000, channels: 1, audioType: "raw" });
Readable.toWeb(rec.stream()).pipeTo(transcriber.stream());

process.on("SIGINT", async () => {
  rec.stop();
  await transcriber.close();
  process.exit();
});
```

## Internal architecture

```
src/audio/
├── audio.ts                  # existing, gains speech_to_text_live method
├── interfaces.ts             # existing, gains LiveSTT types
└── live/
    ├── transcriber.ts        # public class: event emitter, lifecycle, WritableStream sink
    ├── chunker.ts            # PCM buffer → WAV chunks with overlap retention
    ├── stitcher.ts           # token overlap detection, fuzzy match
    └── sse.ts                # POST + SSE parser via RequestClient.fetchJSSStream
```

### Data flow per chunk

```
user pipe
  → WritableStream (transcriber.stream())
    → Chunker.push(bytes)
      → when buffered ≥ chunkSeconds: Chunker.emit(wavBuf)
        → SSE.transcribe(wavBuf, onDelta)
          → each delta: Stitcher.preview(delta) → emit "delta"
          → on done:     Stitcher.commit(text)  → emit "turn"
        → Chunker.trimToOverlap()
```

### Components

**`Chunker`** — maintains a rolling `Uint8Array` buffer of PCM16 bytes; knows sample rate, channels, chunk size, overlap. `push(bytes) → wavBuf | null` appends and returns a complete WAV when the buffer crosses `chunkSeconds`. `trimToOverlap()` retains only the last `overlapSeconds` worth of audio. `flush() → wavBuf | null` returns remaining audio if ≥ 0.5s, otherwise null. Pure — no I/O, no events.

**`Stitcher`** — holds `prevTranscript` state. `preview(deltaStreamText) → string` returns the stitched preview (does not mutate state). `commit(chunkText) → string` returns the stitched committed text and updates state. Fuzzy token match handles minor diffs in the overlap region (exact match, single-char substitution, single insertion/deletion on tokens ≥ 4 chars). Pure.

**`SSE`** — `transcribe(wavBuf, onDelta) → Promise<string>`. Calls `RequestClient.fetchJSSStream("/v1/ai/transcribe", "POST", wavBuf, { stream: true, vad: true, vad_threshold, language }, { "Content-Type": "audio/wav" })`. Iterates `resp.body`, parses SSE lines (`data: ...`, `[DONE]` sentinel, malformed JSON skipped not thrown). Invokes `onDelta(text)` for each `transcript.delta`, resolves with final text on `transcript.done`/`transcript.final`. 30s `AbortSignal.timeout` per request.

**`Transcriber`** — owns lifecycle state machine, emits events, implements the `WritableStream` sink via `new WritableStream({ write, close, abort })`. Serializes chunk processing: only one in-flight SSE request at a time (stitching state requires strict chunk ordering). Owns the buffer-overflow drop policy. Tracks consecutive chunk error count for fatal escalation.

### Why serial requests

Overlap stitching needs `prevTranscript` from chunk N to stitch chunk N+1. Parallel requests would produce out-of-order stitches and duplicated overlap regions. Serial is also cheaper on the server and fine in practice (5s chunks, typical transcribe latency < 2s).

### Buffer overflow

If a `push` would extend the buffer past `maxBufferSeconds` of audio, drop the oldest frames (shift the buffer forward by the overflow amount) and emit one `warning { code: "buffer_overflow" }`. Prevents OOM when the server lags or transcribe requests back up.

### RequestClient extension

Add `fetchJSSStream(path, method, body?, searchParams?, headers?): Promise<Response>` to `src/request.ts`. Same auth/base-URL logic as `fetchJSS`, but returns the raw `Response` without reading the body, so the SSE module can iterate `response.body`. Keeps auth/header handling in one place.

## Lifecycle + error handling

```
idle → connecting → open → closing → closed
                       ↓
                    errored → closed
```

| Source                                   | Classification | Behavior |
|------------------------------------------|----------------|----------|
| Invalid config at `connect()`            | fatal          | throw + `error` + `close` |
| Single chunk HTTP failure (4xx/5xx/timeout) | warning     | emit `warning { code: "chunk_error" }`, continue |
| 3 consecutive chunk failures (hardcoded) | fatal          | `error` + `close`; abort in-flight |
| Network aborted / stream `abort()`       | fatal          | `error` + `close` |
| Buffer overflow                          | warning        | drop oldest frames, emit `warning` |
| User calls `close()`                     | normal         | flush ≥ 0.5s remainder, emit `close` |

One `AbortController` per in-flight request for the 30s timeout; one top-level `AbortController` aborted on fatal error or explicit close to unwind pending work.

The SDK installs no signal handlers — users own `SIGINT`/`SIGTERM` and call `close()` themselves, matching the AssemblyAI example.

## TypeScript surface

New types exported from `src/audio/interfaces.ts`:

```ts
export interface LiveSTTConfig {
  language?: LanguageCodes | "auto";
  sampleRate?: number;
  channels?: 1 | 2;
  translate?: boolean;
  chunkSeconds?: number;
  overlapSeconds?: number;
  vadThreshold?: number;
  maxBufferSeconds?: number;
}

export interface LiveSTTDelta   { text: string; chunkIndex: number; }
export interface LiveSTTTurn    { text: string; chunkIndex: number; isFinal: boolean; }
export interface LiveSTTWarning { code: "buffer_overflow" | "chunk_error"; message: string; }

export interface LiveSTTEvents {
  open:    (payload: { id: string }) => void;
  delta:   (payload: LiveSTTDelta) => void;
  turn:    (payload: LiveSTTTurn) => void;
  warning: (payload: LiveSTTWarning) => void;
  error:   (err: Error) => void;
  close:   () => void;
}

export interface LiveTranscriber {
  on<E extends keyof LiveSTTEvents>(event: E, handler: LiveSTTEvents[E]): this;
  off<E extends keyof LiveSTTEvents>(event: E, handler: LiveSTTEvents[E]): this;
  connect(): Promise<void>;
  stream(): WritableStream<Uint8Array>;
  close(): Promise<void>;
}
```

New method on `AudioApis`:

```ts
speech_to_text_live(config?: LiveSTTConfig): LiveTranscriber;
```

Existing `speech_to_text` overloads, `SpeechToTextParams`, `SpeechToTextResponse` are unchanged.

Since `jigsaw.audio` is exposed as the full `AudioApis` instance, no `core.ts` changes are required — the new method appears automatically.

## Testing strategy

**Unit (pure, fast, no network):**

- `tests/live/chunker.test.ts` — push various sizes, assert chunk boundaries sample-aligned, WAV header validity (RIFF/WAVE/fmt/data magic, correct byte sizes, little-endian), overlap retention, `flush()` returns sub-chunk remainder, `flush()` drops <0.5s.
- `tests/live/stitcher.test.ts` — exact token overlap, fuzzy single-char diff, insertion/deletion within tolerance, no overlap returns current unchanged, empty inputs, trailing punctuation.
- `tests/live/sse.test.ts` — line parser handles `data:` prefix, `[DONE]`, malformed JSON (skip, not throw), events split across network chunks. Uses a fake `Response` with a `ReadableStream` body.

**Integration (mocked HTTP, tests wiring):**

- `tests/live/transcriber.test.ts` — pipe synthetic PCM16 into `transcriber.stream()`, stub `global.fetch` to emit a canned SSE transcript, assert event sequence `open → delta* → turn → close` with correct `chunkIndex`.
- Lifecycle edges: `close()` mid-chunk flushes then closes; buffer overflow emits warning; 3 consecutive chunk errors escalate to fatal.

**Live (opt-in, real API):**

- `tests/audio-live.test.ts` — feed a recorded 16kHz PCM16 WAV file into `speech_to_text_live`, assert `turn` events contain expected keywords. Uses `JIGSAWSTACK_API_KEY`. Gated behind `test:audio:live` script; not part of default `yarn test`.

**No mic in tests** — mic capture isn't part of the SDK. Tests feed bytes directly for determinism.

**Infra:** reuses `node:test` and `tests/test-helpers.ts`. HTTP mocking stubs `global.fetch` per test, no new dependency.

## Dependencies + cleanup

- No new runtime dependencies.
- Remove `node-record-lpcm16` from `package.json` `dependencies` — it's a user-side concern, not SDK surface.
- Move `node-record.js` → `examples/live-mic.js` as a reference for users wiring a Node mic to the new transcriber.

## Backward compatibility

No breaking changes. All existing exports, types, and methods remain. The new method is additive on `AudioApis`.
