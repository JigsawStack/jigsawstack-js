import { beforeEach, describe, test } from "node:test";
import { createJigsawStackClient, expectProperty, expectSuccess, expectType } from "./test-helpers.js";

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

  test("speech to text with file upload", async () => {
    const audioResponse = await fetch("https://jigsawstack.com/preview/stt-example.wav");
    const audioBlob = await audioResponse.blob();
    const result = await client.audio.speech_to_text(audioBlob);

    expectSuccess(result);
    expectProperty(result, "text");
    expectType(result.text, "string");
  });
});
