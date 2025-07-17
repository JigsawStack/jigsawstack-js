import { test, describe } from "node:test";
import { createJigsawStackClient, expectSuccess, expectProperty, expectType, expectNonEmpty, TEST_TEXT } from "./test-helpers.js";

describe("General APIs", () => {
  test("sentiment analysis", async () => {
    const client = createJigsawStackClient();
    const result = await client.sentiment({ text: TEST_TEXT.sentiment });

    expectSuccess(result);
    expectProperty(result, "sentiment");
    expectProperty(result.sentiment, "emotion");
    expectProperty(result.sentiment, "sentiment");
    expectProperty(result.sentiment, "score");
    expectType(result.sentiment.score, "number");
    expectType(result.sentiment.emotion, "string");
    expectType(result.sentiment.sentiment, "string");
  });

  test("text translation", async () => {
    const client = createJigsawStackClient();
    const result = await client.translate.text({
      text: TEST_TEXT.simple,
      target_language: "es",
    });

    expectSuccess(result);
    expectProperty(result, "translated_text");
    expectType(result.translated_text, "string");
    expectNonEmpty(result.translated_text);
  });

  test("text translation with current language specified", async () => {
    const client = createJigsawStackClient();
    const result = await client.translate.text({
      text: TEST_TEXT.simple,
      current_language: "en",
      target_language: "fr",
    });

    expectSuccess(result);
    expectProperty(result, "translated_text");
    expectType(result.translated_text, "string");
    expectNonEmpty(result.translated_text);
  });

  test("text summary", async () => {
    const client = createJigsawStackClient();
    const result = await client.summary({
      text: TEST_TEXT.summary,
      type: "text",
      max_characters: 100,
    });

    expectSuccess(result);
    expectProperty(result, "summary");
    expectType(result.summary, "string");
    expectNonEmpty(result.summary);
  });

  test("text summary as points", async () => {
    const client = createJigsawStackClient();
    const result = await client.summary({
      text: TEST_TEXT.summary,
      type: "points",
      max_points: 3,
    });

    expectSuccess(result);
    expectProperty(result, "summary");

    if (!Array.isArray(result.summary)) {
      throw new Error("Expected summary to be an array for points type");
    }

    if (result.summary.length === 0) {
      throw new Error("Expected non-empty summary points array");
    }
  });

  test("text embedding", async () => {
    const client = createJigsawStackClient();
    const result = await client.embedding({
      text: TEST_TEXT.simple,
      type: "text",
    });

    expectSuccess(result);
    expectProperty(result, "embeddings");

    if (!Array.isArray(result.embeddings)) {
      throw new Error("Expected embeddings to be an array");
    }

    if (result.embeddings.length === 0) {
      throw new Error("Expected non-empty embeddings array");
    }

    // Check that embeddings are numbers
    for (const embedding of result.embeddings) {
      if (typeof embedding !== "number") {
        throw new Error("Expected all embeddings to be numbers");
      }
    }
  });

  test("text to SQL conversion", async () => {
    const client = createJigsawStackClient();
    const result = await client.text_to_sql({
      prompt: "Get all users from the users table where age is greater than 18",
      database: "postgresql",
    });

    expectSuccess(result);
    expectProperty(result, "sql");
    expectType(result.sql, "string");
    expectNonEmpty(result.sql);

    // Basic check that it looks like SQL
    if (!result.sql.toLowerCase().includes("select")) {
      throw new Error("Expected SQL to contain SELECT statement");
    }
  });

  test("prediction from historical data", async () => {
    const client = createJigsawStackClient();
    const dataset = [
      { value: 100, date: "2024-01-01" },
      { value: 110, date: "2024-01-02" },
      { value: 120, date: "2024-01-03" },
      { value: 130, date: "2024-01-04" },
      { value: 140, date: "2024-01-05" },
    ];

    const result = await client.prediction({
      dataset,
      steps: 3,
    });

    expectSuccess(result);
    expectProperty(result, "prediction");

    if (!Array.isArray(result.prediction)) {
      throw new Error("Expected prediction to be an array");
    }

    if (result.prediction.length !== 3) {
      throw new Error("Expected prediction array to have 3 elements");
    }

    // Check structure of prediction items
    for (const item of result.prediction) {
      expectProperty(item, "value");
      expectProperty(item, "date");
      expectType(item.date, "string");
    }
  });

  test("image generation", async () => {
    const client = createJigsawStackClient();
    const result = await client.image_generation({
      prompt: "A simple blue circle",
      aspect_ratio: "1:1",
      return_type: "url",
    });

    // Image generation returns a file choice object
    expectProperty(result, "blob");
    expectType(result.blob, "function");
  });
});
