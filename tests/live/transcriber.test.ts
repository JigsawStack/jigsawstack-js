import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { Transcriber } from "../../src/audio/live/transcriber";
import { RequestClient } from "../../src/request";

const RATE = 16000;
const BYTES_PER_SEC = RATE * 2;

function encode(events: string[]): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  return new ReadableStream({
    start(c) {
      for (const e of events) c.enqueue(enc.encode(e));
      c.close();
    },
  });
}

function mockFetchSequence(responses: Array<() => Response>): () => void {
  let i = 0;
  const original = globalThis.fetch;
  globalThis.fetch = (async () => {
    const idx = Math.min(i++, responses.length - 1);
    return responses[idx]();
  }) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

function successResponse(deltas: string[], final: string): Response {
  const evts = [
    ...deltas.map((d) => `data: ${JSON.stringify({ type: "transcript.delta", delta: d })}\n`),
    `data: ${JSON.stringify({ type: "transcript.done", text: final })}\n`,
  ];
  return new Response(encode(evts), { status: 200 });
}

function makeTranscriber() {
  const client = new RequestClient({ apiKey: "k", baseURL: "https://api.test" });
  return new Transcriber(client, { sampleRate: RATE, channels: 1, chunkSeconds: 5, overlapSeconds: 2, maxBufferSeconds: 30 });
}

async function writeBytes(writer: WritableStreamDefaultWriter<Uint8Array>, bytes: Uint8Array, chunkSize = 0) {
  if (chunkSize <= 0) {
    await writer.write(bytes);
    return;
  }
  for (let offset = 0; offset < bytes.byteLength; offset += chunkSize) {
    await writer.write(bytes.slice(offset, Math.min(offset + chunkSize, bytes.byteLength)));
  }
}

describe("Transcriber", () => {
  let restore: (() => void) | null = null;
  beforeEach(() => {
    restore = null;
  });
  afterEach(() => {
    restore?.();
  });

  test("connect() emits open once with a session id", async () => {
    const t = makeTranscriber();
    const opens: any[] = [];
    t.on("open", (p) => opens.push(p));
    await t.connect();
    assert.equal(opens.length, 1);
    assert.equal(typeof opens[0].id, "string");
    assert.ok(opens[0].id.length > 0);
  });

  test("stream() before connect() throws", () => {
    const t = makeTranscriber();
    assert.throws(() => t.stream(), /open/);
  });

  test("invalid config rejects connect()", async () => {
    const client = new RequestClient({ apiKey: "k", baseURL: "https://api.test" });
    const bad = new Transcriber(client, { chunkSeconds: 2, overlapSeconds: 3 });
    await assert.rejects(bad.connect(), /chunkSeconds/);
  });

  test("pipes PCM bytes, emits delta+turn+close, in order, with correct chunkIndex", async () => {
    restore = mockFetchSequence([() => successResponse(["hello"], "hello world"), () => successResponse(["bye"], "bye now")]);
    const t = makeTranscriber();
    const events: Array<{ kind: string; payload?: any }> = [];
    t.on("open", (p) => events.push({ kind: "open", payload: p }));
    t.on("delta", (p) => events.push({ kind: "delta", payload: p }));
    t.on("turn", (p) => events.push({ kind: "turn", payload: p }));
    t.on("close", () => events.push({ kind: "close" }));
    await t.connect();

    const writer = t.stream().getWriter();
    await writeBytes(writer, new Uint8Array(10 * BYTES_PER_SEC));
    await writer.close();
    await t.close();

    const kinds = events.map((e) => e.kind);
    assert.equal(kinds[0], "open");
    assert.equal(kinds[kinds.length - 1], "close");

    const turns = events.filter((e) => e.kind === "turn").map((e) => e.payload);
    assert.ok(turns.length >= 1);
    assert.equal(turns[0].chunkIndex, 0);
    assert.equal(typeof turns[0].text, "string");
  });

  test("empty transcripts are suppressed", async () => {
    restore = mockFetchSequence([() => successResponse([], "")]);
    const t = makeTranscriber();
    const turns: any[] = [];
    const deltas: any[] = [];
    t.on("delta", (p) => deltas.push(p));
    t.on("turn", (p) => turns.push(p));
    await t.connect();
    const writer = t.stream().getWriter();
    await writeBytes(writer, new Uint8Array(5 * BYTES_PER_SEC));
    await writer.close();
    await t.close();
    assert.equal(deltas.length, 0);
    assert.equal(turns.length, 0);
  });

  test("single chunk HTTP error emits warning and continues", async () => {
    restore = mockFetchSequence([() => new Response("boom", { status: 500 }), () => successResponse(["ok"], "ok")]);
    const t = makeTranscriber();
    const warnings: any[] = [];
    const turns: any[] = [];
    t.on("warning", (p) => warnings.push(p));
    t.on("turn", (p) => turns.push(p));
    await t.connect();
    const writer = t.stream().getWriter();
    await writeBytes(writer, new Uint8Array(10 * BYTES_PER_SEC));
    await writer.close();
    await t.close();
    assert.ok(warnings.some((w) => w.code === "chunk_error"));
    assert.ok(turns.some((tr) => tr.text === "ok"));
  });

  test("3 consecutive chunk errors escalate to fatal error", async () => {
    restore = mockFetchSequence([
      () => new Response("e", { status: 500 }),
      () => new Response("e", { status: 500 }),
      () => new Response("e", { status: 500 }),
    ]);
    const t = makeTranscriber();
    let errored: Error | null = null;
    let closed = false;
    t.on("error", (e) => {
      errored = e;
    });
    t.on("close", () => {
      closed = true;
    });
    await t.connect();
    const writer = t.stream().getWriter();
    await writeBytes(writer, new Uint8Array(15 * BYTES_PER_SEC));
    try {
      await writer.close();
    } catch {}
    await t.close();
    assert.ok(errored);
    assert.match((errored as Error).message, /3 consecutive/);
    assert.equal(closed, true);
  });

  test("close() flushes remaining ≥ 0.5s buffer as final chunk", async () => {
    restore = mockFetchSequence([() => successResponse(["tail"], "tail")]);
    const t = makeTranscriber();
    const turns: any[] = [];
    t.on("turn", (p) => turns.push(p));
    await t.connect();
    const writer = t.stream().getWriter();
    await writeBytes(writer, new Uint8Array(1 * BYTES_PER_SEC));
    await writer.close();
    await t.close();
    assert.equal(turns.length, 1);
    assert.equal(turns[0].isFinal, true);
    assert.equal(turns[0].text, "tail");
  });

  test("buffer overflow emits warning", async () => {
    restore = mockFetchSequence([() => successResponse([], "")]);
    const client = new RequestClient({ apiKey: "k", baseURL: "https://api.test" });
    const t = new Transcriber(client, { chunkSeconds: 5, overlapSeconds: 2, maxBufferSeconds: 6 });
    const warnings: any[] = [];
    t.on("warning", (p) => warnings.push(p));
    await t.connect();
    const writer = t.stream().getWriter();
    await writer.write(new Uint8Array(10 * BYTES_PER_SEC));
    try {
      await writer.close();
    } catch {}
    await t.close();
    assert.ok(warnings.some((w) => w.code === "buffer_overflow"));
  });

  test("jigsaw.audio.speech_to_text_live is exposed on the SDK", async () => {
    const { JigsawStack } = await import("../../index");
    const jigsaw = JigsawStack({ apiKey: "k", baseURL: "https://api.test" });
    const t = jigsaw.audio.speech_to_text_live({ chunkSeconds: 5, overlapSeconds: 2 });
    await t.connect();
    await t.close();
    assert.ok(t);
  });
});
