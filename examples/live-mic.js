import { Readable } from "stream";
import recorder from "node-record-lpcm16";
import { JigsawStack } from "jigsawstack";

const jigsaw = JigsawStack({ apiKey: process.env.JIGSAWSTACK_API_KEY });

const transcriber = jigsaw.audio.speech_to_text_live({
  language: "en",
  sampleRate: 16000,
  channels: 1,
});

transcriber.on("open", ({ id }) => console.log("session", id));
transcriber.on("delta", ({ text }) => process.stdout.write(`\r… ${text}`));
transcriber.on("turn", ({ text }) => console.log(`\n${text}`));
transcriber.on("warning", ({ code, message }) => console.warn("\n[warn]", code, message));
transcriber.on("error", (err) => console.error("\n[error]", err));
transcriber.on("close", () => console.log("\n[done]"));

await transcriber.connect();

const rec = recorder.record({
  sampleRate: 16000,
  channels: 1,
  audioType: "raw",
  recorder: "sox",
  encoding: "signed-integer",
  endianness: "little",
  bits: 16,
});

Readable.toWeb(rec.stream()).pipeTo(transcriber.stream());

process.on("SIGINT", async () => {
  rec.stop();
  await transcriber.close();
  process.exit(0);
});
