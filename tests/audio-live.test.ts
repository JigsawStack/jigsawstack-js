import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createJigsawStackClient } from "./test-helpers.js";

const PREVIEW_WAV_URL = "https://jigsawstack.com/preview/stt-example.wav";

async function fetchPcm16(url: string): Promise<{ pcm: Uint8Array; sampleRate: number; channels: number }> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`fixture fetch failed ${resp.status}`);
  const buf = new Uint8Array(await resp.arrayBuffer());
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const channels = dv.getUint16(22, true);
  const sampleRate = dv.getUint32(24, true);
  let offset = 12;
  while (offset < buf.byteLength - 8) {
    const id = String.fromCharCode(buf[offset], buf[offset + 1], buf[offset + 2], buf[offset + 3]);
    const size = dv.getUint32(offset + 4, true);
    if (id === "data") {
      return { pcm: buf.slice(offset + 8, offset + 8 + size), sampleRate, channels };
    }
    offset += 8 + size;
  }
  throw new Error("data chunk not found");
}

describe("Live STT (integration)", { skip: !process.env.JIGSAWSTACK_API_KEY }, () => {
  test("streams PCM through transcriber and receives at least one turn", async () => {
    const client = createJigsawStackClient();
    const { pcm, sampleRate, channels } = await fetchPcm16(PREVIEW_WAV_URL);

    const transcriber = client.audio.speech_to_text_live({
      language: "en",
      sampleRate,
      channels: channels === 2 ? 2 : 1,
    });

    const turns: string[] = [];
    transcriber.on("turn", ({ text }) => turns.push(text));

    await transcriber.connect();
    const writer = transcriber.stream().getWriter();
    const sliceBytes = sampleRate * channels * 2 * 0.5;
    for (let off = 0; off < pcm.byteLength; off += sliceBytes) {
      await writer.write(pcm.slice(off, Math.min(off + sliceBytes, pcm.byteLength)));
    }
    await writer.close();
    await transcriber.close();

    assert.ok(turns.length > 0, "expected at least one turn");
    assert.ok(turns.join(" ").length > 0, "expected non-empty transcript");
  });
});
