import { RequestClient } from "../../request";
import { LiveSTTConfig, LiveSTTEvents, LiveTranscriber } from "../interfaces";
import { Chunker } from "./chunker";
import { transcribeChunk } from "./sse";
import { Stitcher } from "./stitcher";

type State = "idle" | "open" | "closing" | "closed" | "errored";

const DEFAULTS = {
  sampleRate: 16000,
  translate: false,
  chunkSeconds: 5,
  overlapSeconds: 2,
  vad: true,
  vadThreshold: 0.4,
  maxBufferSeconds: 30,
};

const LANGUAGE = "en"; // streaming is English-only per JigsawStack docs
const CHANNELS = 1; // audio must be mono PCM16

const MAX_CONSECUTIVE_ERRORS = 3;
const CHUNK_TIMEOUT_MS = 30_000;

export class Transcriber implements LiveTranscriber {
  private readonly listeners = new Map<keyof LiveSTTEvents, Set<Function>>();
  private state: State = "idle";
  private readonly cfg: Required<LiveSTTConfig>;
  private readonly chunker: Chunker;
  private readonly stitcher = new Stitcher();
  private chunkIndex = 0;
  private consecutiveErrors = 0;
  private inFlight: Promise<void> | null = null;
  private readonly topAbort = new AbortController();
  private closePromise: Promise<void> | null = null;
  private sessionId = "";

  constructor(
    private readonly client: RequestClient,
    config?: LiveSTTConfig
  ) {
    this.cfg = { ...DEFAULTS, ...(config ?? {}) } as Required<LiveSTTConfig>;
    this.chunker = new Chunker({
      sampleRate: this.cfg.sampleRate,
      channels: CHANNELS,
      chunkSeconds: this.cfg.chunkSeconds,
      overlapSeconds: this.cfg.overlapSeconds,
      maxBufferSeconds: this.cfg.maxBufferSeconds,
    });
  }

  on<E extends keyof LiveSTTEvents>(event: E, handler: LiveSTTEvents[E]): this {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(handler as unknown as Function);
    return this;
  }

  off<E extends keyof LiveSTTEvents>(event: E, handler: LiveSTTEvents[E]): this {
    this.listeners.get(event)?.delete(handler as unknown as Function);
    return this;
  }

  private emit<E extends keyof LiveSTTEvents>(event: E, ...args: Parameters<LiveSTTEvents[E]>): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const h of set) {
      try {
        (h as (...a: any[]) => void)(...(args as any[]));
      } catch {
        // swallow listener errors to preserve session
      }
    }
  }

  async connect(): Promise<void> {
    if (this.state !== "idle") throw new Error("connect() called on transcriber that is not idle");
    if (!(this.cfg.sampleRate > 0)) throw new Error("sampleRate must be > 0");
    if (!(this.cfg.chunkSeconds > this.cfg.overlapSeconds && this.cfg.overlapSeconds > 0))
      throw new Error("chunkSeconds > overlapSeconds > 0 required");
    if (!(this.cfg.maxBufferSeconds > this.cfg.chunkSeconds)) throw new Error("maxBufferSeconds must be > chunkSeconds");
    this.sessionId = crypto.randomUUID();
    this.state = "open";
    this.emit("open", { id: this.sessionId });
  }

  stream(): WritableStream<Uint8Array> {
    if (this.state !== "open") throw new Error("stream() can only be called on an open transcriber");
    return new WritableStream<Uint8Array>({
      write: async (bytes) => {
        if (this.state !== "open") return;
        const { dropped } = this.chunker.push(bytes);
        if (dropped > 0) {
          this.emit("warning", {
            code: "buffer_overflow",
            message: `dropped ${dropped} bytes to stay under maxBufferSeconds`,
          });
        }
        this.pump();
      },
      close: async () => {
        await this.finalize();
      },
      abort: async (reason) => {
        this.fail(reason instanceof Error ? reason : new Error(String(reason ?? "stream aborted")));
      },
    });
  }

  private pump(): void {
    if (this.inFlight) return;
    if (this.state !== "open" && this.state !== "closing") return;
    const chunk = this.chunker.tryEmit();
    if (!chunk) return;
    const idx = this.chunkIndex++;
    this.inFlight = this.processChunk(chunk, idx, false).finally(() => {
      this.inFlight = null;
      if (this.state === "open" || this.state === "closing") this.pump();
    });
  }

  private async processChunk(wav: Uint8Array, idx: number, isFinal: boolean): Promise<void> {
    let committed = "";
    const chunkAbort = new AbortController();
    const onTop = () => chunkAbort.abort(this.topAbort.signal.reason ?? new Error("aborted"));
    this.topAbort.signal.addEventListener("abort", onTop);
    const timer = setTimeout(() => chunkAbort.abort(new Error("transcribe timeout")), CHUNK_TIMEOUT_MS);

    try {
      committed = await transcribeChunk(
        this.client,
        wav,
        {
          language: LANGUAGE,
          vad: this.cfg.vad,
          vadThreshold: this.cfg.vadThreshold,
          translate: this.cfg.translate,
        },
        (delta) => {
          if (this.state !== "open" && this.state !== "closing") return;
          const preview = this.stitcher.preview(delta);
          if (preview) this.emit("delta", { text: preview, chunkIndex: idx });
        },
        chunkAbort.signal
      );
      this.consecutiveErrors = 0;
    } catch (err: any) {
      if (this.topAbort.signal.aborted) {
        this.chunker.ackChunk();
        return;
      }
      this.consecutiveErrors++;
      this.emit("warning", { code: "chunk_error", message: err?.message ?? String(err) });
      this.chunker.ackChunk();
      if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        this.fail(new Error("live stt aborted after 3 consecutive chunk failures"));
      }
      return;
    } finally {
      clearTimeout(timer);
      this.topAbort.signal.removeEventListener("abort", onTop);
    }

    this.chunker.ackChunk();
    if (committed) {
      const stitched = this.stitcher.commit(committed);
      if (stitched) this.emit("turn", { text: stitched, chunkIndex: idx, isFinal });
    }
  }

  private async finalize(): Promise<void> {
    if (this.closePromise) return this.closePromise;
    this.closePromise = (async () => {
      if (this.state === "closed") return;
      if (this.state === "errored") {
        this.emitClose();
        return;
      }
      if (this.state !== "open") return;
      this.state = "closing";
      // Drain all remaining full chunks serially, then do a final flush.
      // pump() will keep scheduling chunks while buffer has >= chunkBytes.
      // We loop: kick pump, await inFlight, repeat until nothing more to schedule.
      this.pump();
      while (this.inFlight) {
        try {
          await this.inFlight;
        } catch {
          // errors already surfaced via events
        }
        if (this.state !== "closing") break;
      }
      if ((this.state as State) !== "closing") {
        this.emitClose();
        return;
      }
      const flush = this.chunker.flush();
      if (flush) {
        await this.processChunk(flush, this.chunkIndex++, true);
      }
      this.emitClose();
    })();
    return this.closePromise;
  }

  async close(): Promise<void> {
    return this.finalize();
  }

  private emitClose(): void {
    if (this.state === "closed") return;
    this.state = "closed";
    this.emit("close");
  }

  private fail(err: Error): void {
    if (this.state === "errored" || this.state === "closed") return;
    this.state = "errored";
    this.topAbort.abort(err);
    this.emit("error", err);
    this.emitClose();
  }
}
