export interface ChunkerConfig {
  sampleRate: number;
  channels: number;
  chunkSeconds: number;
  overlapSeconds: number;
  maxBufferSeconds: number;
  minFlushSeconds?: number;
}

const SAMPLE_WIDTH = 2; // 16-bit PCM

export class Chunker {
  private buffer = new Uint8Array(0);
  private pendingChunkBytes = 0;
  private readonly bytesPerSecond: number;
  private readonly chunkBytes: number;
  private readonly overlapBytes: number;
  private readonly maxBufferBytes: number;
  private readonly minFlushBytes: number;

  constructor(private readonly config: ChunkerConfig) {
    this.bytesPerSecond = config.sampleRate * config.channels * SAMPLE_WIDTH;
    this.chunkBytes = Math.floor(config.chunkSeconds * this.bytesPerSecond);
    this.overlapBytes = Math.floor(config.overlapSeconds * this.bytesPerSecond);
    this.maxBufferBytes = Math.floor(config.maxBufferSeconds * this.bytesPerSecond);
    this.minFlushBytes = Math.floor((config.minFlushSeconds ?? 0.5) * this.bytesPerSecond);
  }

  push(bytes: Uint8Array): { dropped: number } {
    const next = new Uint8Array(this.buffer.byteLength + bytes.byteLength);
    next.set(this.buffer, 0);
    next.set(bytes, this.buffer.byteLength);
    this.buffer = next;

    let dropped = 0;
    if (this.buffer.byteLength > this.maxBufferBytes) {
      dropped = this.buffer.byteLength - this.maxBufferBytes;
      this.buffer = this.buffer.slice(dropped);
    }
    return { dropped };
  }

  tryEmit(): Uint8Array | null {
    if (this.pendingChunkBytes > 0) return null;
    if (this.buffer.byteLength < this.chunkBytes) return null;
    this.pendingChunkBytes = this.chunkBytes;
    const pcm = this.buffer.slice(0, this.chunkBytes);
    return buildWav(pcm, this.config.sampleRate, this.config.channels);
  }

  ackChunk(): void {
    if (this.pendingChunkBytes === 0) return;
    const drop = Math.max(0, this.pendingChunkBytes - this.overlapBytes);
    this.buffer = drop >= this.buffer.byteLength ? new Uint8Array(0) : this.buffer.slice(drop);
    this.pendingChunkBytes = 0;
  }

  flush(): Uint8Array | null {
    if (this.buffer.byteLength < this.minFlushBytes) return null;
    const wav = buildWav(this.buffer, this.config.sampleRate, this.config.channels);
    this.buffer = new Uint8Array(0);
    this.pendingChunkBytes = 0;
    return wav;
  }
}

function buildWav(pcm: Uint8Array, sampleRate: number, channels: number): Uint8Array {
  const bitsPerSample = SAMPLE_WIDTH * 8;
  const byteRate = sampleRate * channels * SAMPLE_WIDTH;
  const blockAlign = channels * SAMPLE_WIDTH;
  const dataSize = pcm.byteLength;
  const out = new Uint8Array(44 + dataSize);
  const dv = new DataView(out.buffer);
  writeAscii(dv, 0, "RIFF");
  dv.setUint32(4, 36 + dataSize, true);
  writeAscii(dv, 8, "WAVE");
  writeAscii(dv, 12, "fmt ");
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true);
  dv.setUint16(22, channels, true);
  dv.setUint32(24, sampleRate, true);
  dv.setUint32(28, byteRate, true);
  dv.setUint16(32, blockAlign, true);
  dv.setUint16(34, bitsPerSample, true);
  writeAscii(dv, 36, "data");
  dv.setUint32(40, dataSize, true);
  out.set(pcm, 44);
  return out;
}

function writeAscii(dv: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) dv.setUint8(offset + i, str.charCodeAt(i));
}
