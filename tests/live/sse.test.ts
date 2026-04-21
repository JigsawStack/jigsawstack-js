import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { RequestClient } from "../../src/request";
import { transcribeChunk } from "../../src/audio/live/sse";

function sseResponse(events: string[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const e of events) controller.enqueue(encoder.encode(e));
      controller.close();
    },
  });
  return new Response(stream, { status: 200, headers: { "content-type": "text/event-stream" } });
}

describe("transcribeChunk (SSE)", () => {
  let origFetch: typeof fetch;
  beforeEach(() => {
    origFetch = globalThis.fetch;
  });
  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  test("invokes onDelta for each transcript.delta and returns final text on transcript.done", async () => {
    globalThis.fetch = (async () =>
      sseResponse([
        'data: {"type":"transcript.delta","delta":"hello"}\n',
        'data: {"type":"transcript.delta","delta":" world"}\n',
        'data: {"type":"transcript.done","text":"hello world"}\n',
        "data: [DONE]\n",
      ])) as typeof fetch;

    const client = new RequestClient({ apiKey: "k", baseURL: "https://api.test" });
    const deltas: string[] = [];
    const final = await transcribeChunk(client, new Uint8Array([1, 2, 3]), { language: "en", vadThreshold: 0.4 }, (d) => deltas.push(d));
    assert.deepEqual(deltas, ["hello", " world"]);
    assert.equal(final, "hello world");
  });

  test("handles events split across network chunks", async () => {
    globalThis.fetch = (async () =>
      sseResponse(['data: {"type":"transcript.delt', 'a","delta":"hi"}\n', 'data: {"type":"transcript.done","text":"hi"}\n'])) as typeof fetch;

    const client = new RequestClient({ apiKey: "k", baseURL: "https://api.test" });
    const deltas: string[] = [];
    const final = await transcribeChunk(client, new Uint8Array([1]), { language: "en", vadThreshold: 0.4 }, (d) => deltas.push(d));
    assert.deepEqual(deltas, ["hi"]);
    assert.equal(final, "hi");
  });

  test("skips malformed JSON lines without throwing", async () => {
    globalThis.fetch = (async () =>
      sseResponse([
        "data: {not valid json}\n",
        'data: {"type":"transcript.delta","delta":"ok"}\n',
        'data: {"type":"transcript.done","text":"ok"}\n',
      ])) as typeof fetch;

    const client = new RequestClient({ apiKey: "k", baseURL: "https://api.test" });
    const deltas: string[] = [];
    const final = await transcribeChunk(client, new Uint8Array([1]), { language: "en", vadThreshold: 0.4 }, (d) => deltas.push(d));
    assert.deepEqual(deltas, ["ok"]);
    assert.equal(final, "ok");
  });

  test("throws on non-2xx with truncated body in message", async () => {
    globalThis.fetch = (async () => new Response("server on fire".repeat(50), { status: 500 })) as typeof fetch;
    const client = new RequestClient({ apiKey: "k", baseURL: "https://api.test" });
    await assert.rejects(transcribeChunk(client, new Uint8Array([1]), { language: "en", vadThreshold: 0.4 }, () => {}), /Transcribe failed 500/);
  });

  test("forwards query params including translate when set", async () => {
    let captured = "";
    globalThis.fetch = (async (url: any) => {
      captured = String(url);
      return sseResponse(['data: {"type":"transcript.done","text":""}\n']);
    }) as typeof fetch;

    const client = new RequestClient({ apiKey: "k", baseURL: "https://api.test" });
    await transcribeChunk(client, new Uint8Array([1]), { language: "fr", vadThreshold: 0.5, translate: true }, () => {});
    assert.match(captured, /stream=true/);
    assert.match(captured, /vad=true/);
    assert.match(captured, /vad_threshold=0\.5/);
    assert.match(captured, /language=fr/);
    assert.match(captured, /translate=true/);
  });
});
