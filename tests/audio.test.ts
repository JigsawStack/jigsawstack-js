import { test, describe, beforeEach } from "node:test";
import { createJigsawStackClient, expectSuccess, expectProperty, expectType } from "./test-helpers.js";

const audioUrl = "https://jigsawstack.com/preview/stt-example.wav";
const text = "Hello World";

describe("STT APIs", () => {
  let client: ReturnType<typeof createJigsawStackClient>;

  beforeEach(() => {
    client = createJigsawStackClient();
  });

  test("speech to text from URL", async () => {
    const result = await client.audio.speech_to_text({
      url: audioUrl,
      language: "en",
    });

    expectSuccess(result);
    expectProperty(result, "text");
    expectType(result.text, "string");
    expectProperty(result, "chunks");

    if (!Array.isArray(result.chunks)) {
      throw new Error("Expected chunks to be an array");
    }
  });

  test("speech to text with speaker separation", async () => {
    const result = await client.audio.speech_to_text({
      url: audioUrl,
      language: "en",
      by_speaker: true,
    });

    expectSuccess(result);
    expectProperty(result, "text");
    expectType(result.text, "string");
    expectProperty(result, "chunks");

    if (!Array.isArray(result.chunks)) {
      throw new Error("Expected chunks to be an array");
    }
  });

  test("speech to text with translation", async () => {
    const result = await client.audio.speech_to_text({
      url: audioUrl,
      translate: true,
    });

    expectSuccess(result);
    expectProperty(result, "text");
    expectType(result.text, "string");
  });

  test("speech to text with translation and speaker separation", async () => {
    const result = await client.audio.speech_to_text({
      url: audioUrl,
      translate: true,
      by_speaker: true,
    });

    expectSuccess(result);
    expectProperty(result, "text");
    expectType(result.text, "string");
  });
});

describe("TTS APIs", () => {
  let client: ReturnType<typeof createJigsawStackClient>;

  beforeEach(() => {
    client = createJigsawStackClient();
  });

  test("text to speech basic", async () => {
    const result = await client.audio.text_to_speech({
      text: text,
      accent: "en-US-female-3",
    });

    // TTS returns a file choice object
    expectProperty(result, "blob");
    expectType(result.blob, "function");
    expectProperty(result, "buffer");
    expectType(result.buffer, "function");
    expectProperty(result, "file");
    expectType(result.file, "function");
  });

  test("text to speech with different accent", async () => {
    const result = await client.audio.text_to_speech({
      text: text,
      accent: "en-GB-male-2",
    });

    // TTS returns a file choice object
    expectProperty(result, "blob");
    expectType(result.blob, "function");
  });

  test("text to speech with return type base64", async () => {
    const result = await client.audio.text_to_speech({
      text: text,
      accent: "en-US-female-3",
      return_type: "base64",
    });

    // TTS returns a file choice object
    expectProperty(result, "url");
    expectType(result.url, "string");
  });

  test("text to speech with return type binary", async () => {
    const result = await client.audio.text_to_speech({
      text: text,
      accent: "en-US-female-3",
      return_type: "binary",
    });

    // TTS returns a file choice object
    expectProperty(result, "blob");
    expectType(result.blob, "function");
  });

  test("get speaker voice accents", async () => {
    const result = await client.audio.speaker_voice_accents();

    expectSuccess(result);
    expectType(result, "object");
  });

  test("list voice clones", async () => {
    const result = await client.audio.list_clones({
      limit: 10,
      page: 0,
    });

    expectSuccess(result);
    expectType(result, "object");
  });

  test("list voice clones with default params", async () => {
    const result = await client.audio.list_clones();

    expectSuccess(result);
    expectType(result, "object");
  });
});
