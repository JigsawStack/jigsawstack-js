import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { RequestClient } from "../../src/request";

describe("RequestClient.fetchJSSStream", () => {
  let origFetch: typeof fetch;
  let lastCall: { url: string; init: RequestInit } | null;

  beforeEach(() => {
    origFetch = globalThis.fetch;
    lastCall = null;
    globalThis.fetch = (async (url: any, init: any) => {
      lastCall = { url: String(url), init };
      return new Response("hello", { status: 200, headers: { "content-type": "text/plain" } });
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  test("returns raw Response without reading the body", async () => {
    const client = new RequestClient({ apiKey: "k", baseURL: "https://api.test" });
    const body = new Uint8Array([1, 2, 3]);
    const resp = await client.fetchJSSStream("/v1/stream", "POST", body, { stream: "true" }, { "Content-Type": "audio/wav" });
    assert.equal(resp.status, 200);
    assert.equal(resp.bodyUsed, false);
    assert.equal(lastCall!.url, "https://api.test/v1/stream?stream=true");
    const headers = lastCall!.init.headers as Record<string, string>;
    assert.equal(headers["x-api-key"], "k");
    assert.equal(headers["Content-Type"], "audio/wav");
  });

  test("forwards AbortSignal", async () => {
    const client = new RequestClient({ apiKey: "k", baseURL: "https://api.test" });
    const ac = new AbortController();
    await client.fetchJSSStream("/v1/stream", "POST", new Uint8Array([1]), undefined, undefined, ac.signal);
    assert.equal(lastCall!.init.signal, ac.signal);
  });

  test("omits undefined query params", async () => {
    const client = new RequestClient({ apiKey: "k", baseURL: "https://api.test" });
    await client.fetchJSSStream("/v1/stream", "POST", new Uint8Array([1]), { stream: "true", translate: undefined });
    assert.equal(lastCall!.url, "https://api.test/v1/stream?stream=true");
  });
});
