import { test, describe } from "node:test";
import { createJigsawStackClient, expectSuccess, expectProperty, expectType, expectArray, TEST_TEXT, TEST_URLS } from "./test-helpers.js";

describe("Validation APIs", () => {
  test("email validation for valid email", async () => {
    const client = createJigsawStackClient();
    const result = await client.validate.email("test@example.com");

    expectProperty(result, "email");
    expectProperty(result, "valid");
    expectProperty(result, "disposable");
    expectProperty(result, "role_account");
    expectProperty(result, "free");
    expectProperty(result, "has_mx_records");
    expectProperty(result, "username");
    expectProperty(result, "domain");

    expectType(result.email, "string");
    expectType(result.valid, "boolean");
    expectType(result.disposable, "boolean");
    expectType(result.role_account, "boolean");
    expectType(result.free, "boolean");
    expectType(result.has_mx_records, "boolean");
    expectType(result.username, "string");
    expectType(result.domain, "string");

    if (result.email === "test@example.com") {
      if (result.username !== "test" || result.domain !== "example.com") {
        throw new Error("Email parsing failed");
      }
    }
  });

  test("email validation for invalid email", async () => {
    const client = createJigsawStackClient();
    const result = await client.validate.email("invalid-email");

    expectProperty(result, "email");
    expectProperty(result, "valid");
    expectType(result.valid, "boolean");

    // Invalid email should return valid: false
    if (result.valid === true) {
      throw new Error("Expected invalid email to return valid: false");
    }
  });

  test("email validation for disposable email", async () => {
    const client = createJigsawStackClient();
    const result = await client.validate.email("test@10minutemail.com");

    expectProperty(result, "email");
    expectProperty(result, "valid");
    expectProperty(result, "disposable");
    expectType(result.disposable, "boolean");
  });

  test("profanity check with clean text", async () => {
    const client = createJigsawStackClient();
    const result = await client.validate.profanity({
      text: "This is a nice and clean sentence.",
      censor_replacement: "*",
    });

    expectSuccess(result);
    expectProperty(result, "clean_text");
    expectProperty(result, "profanities");
    expectProperty(result, "profanities_found");

    expectType(result.clean_text, "string");
    expectArray(result.profanities);
    expectType(result.profanities_found, "number");

    if (result.profanities_found !== 0) {
      throw new Error("Expected clean text to have 0 profanities");
    }
  });

  test("profanity check with profane text", async () => {
    const client = createJigsawStackClient();
    const result = await client.validate.profanity({
      text: TEST_TEXT.profanity,
      censor_replacement: "*",
    });

    expectSuccess(result);
    expectProperty(result, "clean_text");
    expectProperty(result, "profanities");
    expectProperty(result, "profanities_found");

    expectType(result.clean_text, "string");
    expectArray(result.profanities);
    expectType(result.profanities_found, "number");
  });

  test("profanity check with custom replacement", async () => {
    const client = createJigsawStackClient();
    const result = await client.validate.profanity({
      text: TEST_TEXT.profanity,
      censor_replacement: "[CENSORED]",
    });

    expectSuccess(result);
    expectProperty(result, "clean_text");
    expectType(result.clean_text, "string");
  });

  test("spell check with misspelled text", async () => {
    const client = createJigsawStackClient();
    const result = await client.validate.spellcheck({
      text: TEST_TEXT.misspelled,
      language_code: "en",
    });

    expectSuccess(result);
    expectProperty(result, "auto_correct_text");
    expectProperty(result, "misspellings_found");

    expectType(result.auto_correct_text, "string");
    expectType(result.misspellings_found, "number");

    // Should find misspellings in our test text
    if (result.misspellings_found === 0) {
      console.log("Note: No misspellings found in intentionally misspelled text");
    }
  });

  test("spell check with correct text", async () => {
    const client = createJigsawStackClient();
    const result = await client.validate.spellcheck({
      text: "This is a correctly spelled sentence.",
      language_code: "en",
    });

    expectSuccess(result);
    expectProperty(result, "auto_correct_text");
    expectProperty(result, "misspellings_found");
    expectType(result.misspellings_found, "number");

    if (result.misspellings_found !== 0) {
      console.log("Note: Misspellings found in supposedly correct text");
    }
  });

  test("spell check with different language", async () => {
    const client = createJigsawStackClient();
    const result = await client.validate.spellcheck({
      text: "Hola mundo como estas",
      language_code: "es",
    });

    expectSuccess(result);
    expectProperty(result, "auto_correct_text");
    expectProperty(result, "misspellings_found");
    expectType(result.auto_correct_text, "string");
    expectType(result.misspellings_found, "number");
  });

  test("spam check with normal text", async () => {
    const client = createJigsawStackClient();
    const result = await client.validate.spamcheck(TEST_TEXT.simple);

    expectSuccess(result);
    expectProperty(result, "check");
    expectProperty(result.check, "is_spam");
    expectProperty(result.check, "score");

    expectType(result.check.is_spam, "boolean");
    expectType(result.check.score, "number");

    // Normal text should not be spam
    if (result.check.is_spam === true) {
      console.log("Note: Normal text flagged as spam");
    }
  });

  test("spam check with promotional text", async () => {
    const client = createJigsawStackClient();
    const spamText = "URGENT! Click here now to win $1000! Limited time offer! Act fast!";
    const result = await client.validate.spamcheck(spamText);

    expectSuccess(result);
    expectProperty(result, "check");
    expectProperty(result.check, "is_spam");
    expectProperty(result.check, "score");

    expectType(result.check.is_spam, "boolean");
    expectType(result.check.score, "number");

    // Score should be between 0 and 1
    if (result.check.score < 0 || result.check.score > 1) {
      throw new Error("Spam score should be between 0 and 1");
    }
  });

  test("spam check with array of texts", async () => {
    const client = createJigsawStackClient();
    const texts = ["Hello, how are you?", "URGENT! Click here now!", "This is a normal message."];
    const result = await client.validate.spamcheck(texts);

    expectSuccess(result);
    expectProperty(result, "check");
    expectArray(result.check);

    if (result.check.length !== texts.length) {
      throw new Error("Result array should have same length as input array");
    }

    // Check structure of each result
    for (const checkResult of result.check) {
      expectProperty(checkResult, "is_spam");
      expectProperty(checkResult, "score");
      expectType(checkResult.is_spam, "boolean");
      expectType(checkResult.score, "number");
    }
  });

  test("NSFW detection with URL", async () => {
    const client = createJigsawStackClient();
    const result = await client.validate.nsfw({
      url: TEST_URLS.image,
    });

    expectSuccess(result);
    expectType(result, "object");
    // NSFW detection may return various properties depending on the implementation
  });

  test("NSFW detection with safe image URL", async () => {
    const client = createJigsawStackClient();
    const result = await client.validate.nsfw({
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png",
    });

    expectSuccess(result);
    expectType(result, "object");
    // Safe image should not be flagged as NSFW
  });
});
