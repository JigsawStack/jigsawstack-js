import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Chunker } from "../../src/audio/live/chunker";

const RATE = 16000;
const BYTES_PER_SEC = RATE * 1 * 2; // mono 16-bit = 32000 bytes/s

function makeChunker(overrides: Partial<ConstructorParameters<typeof Chunker>[0]> = {}) {
  return new Chunker({
    sampleRate: RATE,
    channels: 1,
    chunkSeconds: 5,
    overlapSeconds: 2,
    maxBufferSeconds: 30,
    ...overrides,
  });
}

describe("Chunker", () => {
  test("buffers bytes and emits nothing before chunkSeconds is reached", () => {
    const c = makeChunker();
    const { dropped } = c.push(new Uint8Array(BYTES_PER_SEC)); // 1s
    assert.equal(dropped, 0);
    assert.equal(c.tryEmit(), null);
  });

  test("emits a WAV chunk once chunkSeconds of audio is buffered", () => {
    const c = makeChunker();
    c.push(new Uint8Array(5 * BYTES_PER_SEC)); // 5s of silence
    const wav = c.tryEmit();
    assert.ok(wav);
    assert.equal(wav!.byteLength, 44 + 5 * BYTES_PER_SEC);
    const dv = new DataView(wav!.buffer, wav!.byteOffset, wav!.byteLength);
    assert.equal(String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3)), "RIFF");
    assert.equal(String.fromCharCode(dv.getUint8(8), dv.getUint8(9), dv.getUint8(10), dv.getUint8(11)), "WAVE");
    assert.equal(String.fromCharCode(dv.getUint8(12), dv.getUint8(13), dv.getUint8(14), dv.getUint8(15)), "fmt ");
    assert.equal(String.fromCharCode(dv.getUint8(36), dv.getUint8(37), dv.getUint8(38), dv.getUint8(39)), "data");
    assert.equal(dv.getUint32(24, true), RATE);
    assert.equal(dv.getUint16(22, true), 1);
    assert.equal(dv.getUint16(34, true), 16);
    assert.equal(dv.getUint32(40, true), 5 * BYTES_PER_SEC);
  });

  test("tryEmit returns null while a chunk is pending ack", () => {
    const c = makeChunker();
    c.push(new Uint8Array(5 * BYTES_PER_SEC));
    assert.ok(c.tryEmit());
    c.push(new Uint8Array(5 * BYTES_PER_SEC));
    assert.equal(c.tryEmit(), null);
  });

  test("ackChunk trims the emitted chunk but keeps overlapSeconds at front", () => {
    const c = makeChunker();
    c.push(new Uint8Array(5 * BYTES_PER_SEC));
    c.tryEmit();
    c.ackChunk();
    c.push(new Uint8Array(2 * BYTES_PER_SEC));
    assert.equal(c.tryEmit(), null);
    c.push(new Uint8Array(1 * BYTES_PER_SEC));
    const wav = c.tryEmit();
    assert.ok(wav);
    assert.equal(wav!.byteLength, 44 + 5 * BYTES_PER_SEC);
  });

  test("buffer overflow drops oldest bytes and reports count", () => {
    const c = makeChunker({ maxBufferSeconds: 4 });
    const { dropped } = c.push(new Uint8Array(10 * BYTES_PER_SEC));
    assert.equal(dropped, 6 * BYTES_PER_SEC);
    assert.equal(c.tryEmit(), null);
  });

  test("flush returns remaining audio as WAV when ≥ minFlushSeconds, else null", () => {
    const c = makeChunker();
    c.push(new Uint8Array(Math.floor(0.3 * BYTES_PER_SEC)));
    assert.equal(c.flush(), null);

    const c2 = makeChunker();
    c2.push(new Uint8Array(Math.floor(1 * BYTES_PER_SEC)));
    const wav = c2.flush();
    assert.ok(wav);
    const dv = new DataView(wav!.buffer, wav!.byteOffset, wav!.byteLength);
    assert.equal(dv.getUint32(40, true), 1 * BYTES_PER_SEC);
  });
});
