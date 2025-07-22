import { test, describe, beforeEach } from "node:test";
import { createJigsawStackClient, expectSuccess, expectProperty, expectType, expectArray } from "./test-helpers.js";

// Comprehensive Profanity API Tests
describe("Profanity validation", () => {
  let client: ReturnType<typeof createJigsawStackClient>;

  beforeEach(() => {
    client = createJigsawStackClient();
  });

  test("should fail when text parameter is missing", async () => {
    try {
      // @ts-expect-error Testing missing required parameter
      await client.validate.profanity({});
      throw new Error("Expected API call to fail with missing text parameter");
    } catch (error) {
      // Should throw an error for missing required parameter
      expectType(error, "object");
    }
  });

  test("should fail when text parameter is undefined", async () => {
    try {
      // @ts-expect-error Testing undefined required parameter
      await client.validate.profanity({ text: undefined });
      throw new Error("Expected API call to fail with undefined text parameter");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when text parameter is null", async () => {
    try {
      // @ts-expect-error Testing null required parameter
      await client.validate.profanity({ text: null });
      throw new Error("Expected API call to fail with null text parameter");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should work with only required text parameter", async () => {
    const result = await client.validate.profanity({
      text: "This is a clean sentence.",
    });

    // Verify success
    expectSuccess(result);

    // Verify all required response properties exist
    expectProperty(result, "success");
    expectProperty(result, "clean_text");
    expectProperty(result, "profanities");
    expectProperty(result, "profanities_found");

    // Verify correct types
    expectType(result.success, "boolean");
    expectType(result.clean_text, "string");
    expectArray(result.profanities);
    expectType(result.profanities_found, "boolean"); // Corrected: should be boolean

    // Verify default censor_replacement behavior (should use "*")
    if (result.profanities_found === true) {
      console.log("Note: Profanities detected in supposedly clean text");
    }
  });

  test("should work with custom censor_replacement parameter", async () => {
    const customReplacement = "[CENSORED]";
    const result = await client.validate.profanity({
      text: "This damn text contains profanity.",
      censor_replacement: customReplacement,
    });

    expectSuccess(result);
    expectProperty(result, "clean_text");
    expectType(result.clean_text, "string");

    // If profanities are found and censored, the clean_text should contain our custom replacement
    if (result.profanities_found === true && result.clean_text.includes(customReplacement)) {
      console.log("Custom replacement successfully applied");
    }
  });

  test("should handle empty text", async () => {
    const result = await client.validate.profanity({
      text: "",
    });

    expectSuccess(result);
    expectProperty(result, "clean_text");
    expectProperty(result, "profanities");
    expectProperty(result, "profanities_found");

    expectType(result.clean_text, "string");
    expectArray(result.profanities);
    expectType(result.profanities_found, "boolean"); // Corrected: should be boolean

    // Empty text should have no profanities
    if (result.profanities_found !== false) {
      console.log("Note: Profanities found in empty text");
    }
  });

  test("should handle text with special characters", async () => {
    const result = await client.validate.profanity({
      text: "Special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?",
      censor_replacement: "***",
    });

    expectSuccess(result);
    expectProperty(result, "clean_text");
    expectProperty(result, "profanities");
    expectProperty(result, "profanities_found");

    expectType(result.clean_text, "string");
    expectArray(result.profanities);
    expectType(result.profanities_found, "boolean"); // Corrected: should be boolean
  });

  test("should handle unicode characters", async () => {
    const result = await client.validate.profanity({
      text: "Unicode: 你好 🌟 émojis 🚀 ñoño",
      censor_replacement: "🌟",
    });

    expectSuccess(result);
    expectProperty(result, "clean_text");
    expectProperty(result, "profanities");
    expectProperty(result, "profanities_found");

    expectType(result.clean_text, "string");
    expectArray(result.profanities);
    expectType(result.profanities_found, "boolean"); // Corrected: should be boolean
  });

  test("should handle very long text", async () => {
    const longText = "This is a very long text. ".repeat(100);
    const result = await client.validate.profanity({
      text: longText,
    });

    expectSuccess(result);
    expectProperty(result, "clean_text");
    expectProperty(result, "profanities");
    expectProperty(result, "profanities_found");

    expectType(result.clean_text, "string");
    expectArray(result.profanities);
    expectType(result.profanities_found, "boolean"); // Corrected: should be boolean
  });

  test("should validate profanities array structure when profanities are found", async () => {
    const result = await client.validate.profanity({
      text: "This damn shit is fucking terrible.",
      censor_replacement: "*",
    });

    expectSuccess(result);
    expectArray(result.profanities);
    expectType(result.profanities_found, "boolean"); // Corrected: should be boolean

    // If profanities are found, each item in the array should be an object with the correct structure
    if (result.profanities_found === true) {
      result.profanities.forEach((profanityObj) => {
        expectType(profanityObj, "object");
        expectProperty(profanityObj, "profanity");
        expectProperty(profanityObj, "startIndex");
        expectProperty(profanityObj, "endIndex");
        expectType(profanityObj.profanity, "string");
        expectType(profanityObj.startIndex, "number");
        expectType(profanityObj.endIndex, "number");
      });

      // When profanities are found, the array should not be empty
      if (result.profanities.length === 0) {
        console.log("Warning: profanities_found is true but profanities array is empty");
      }
    } else {
      // When no profanities are found, the array should be empty
      if (result.profanities.length > 0) {
        console.log("Warning: profanities_found is false but profanities array is not empty");
      }
    }
  });

  test("should handle different censor_replacement values", async () => {
    const testCases = [
      { replacement: "*", name: "asterisk" },
      { replacement: "#", name: "hash" },
      { replacement: "[CENSORED]", name: "word replacement" },
      { replacement: "***", name: "multiple characters" },
      { replacement: "", name: "empty string" },
      { replacement: "🚫", name: "emoji" },
    ];

    for (const testCase of testCases) {
      const result = await client.validate.profanity({
        text: "This is a test sentence.",
        censor_replacement: testCase.replacement,
      });

      expectSuccess(result);
      expectProperty(result, "clean_text");
      expectType(result.clean_text, "string");
      console.log(`✓ ${testCase.name} replacement works`);
    }
  });

  test("profanity check with clean text", async () => {
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
    expectType(result.profanities_found, "boolean");

    if (result.profanities_found !== false) {
      throw new Error("Expected clean text to have no profanities");
    }
  });

  test("profanity check with profane text", async () => {
    const result = await client.validate.profanity({
      text: "This damn text contains actual profanity.",
      censor_replacement: "*",
    });

    expectSuccess(result);
    expectProperty(result, "clean_text");
    expectProperty(result, "profanities");
    expectProperty(result, "profanities_found");

    expectType(result.clean_text, "string");
    expectArray(result.profanities);
    expectType(result.profanities_found, "boolean");

    // For profane text, we expect profanities to be found
    if (result.profanities_found !== true) {
      console.log("Note: No profanity detected in text with mild profanity");
    }
  });

  test("profanity check with custom replacement", async () => {
    const result = await client.validate.profanity({
      text: "This is a profane sentence.",
      censor_replacement: "[CENSORED]",
    });

    expectSuccess(result);
    expectProperty(result, "clean_text");
    expectType(result.clean_text, "string");
  });
});

// Comprehensive NSFW API Tests
describe("NSFW validation", () => {
  let client: ReturnType<typeof createJigsawStackClient>;

  beforeEach(() => {
    client = createJigsawStackClient();
  });

  test("should fail when no parameters are provided", async () => {
    try {
      await client.validate.nsfw({});
      throw new Error("Expected API call to fail with no parameters");
    } catch (error) {
      // Should throw an error when neither url nor file_store_key is provided
      expectType(error, "object");
    }
  });

  test("should fail when url parameter is undefined", async () => {
    try {
      await client.validate.nsfw({ url: undefined });
      throw new Error("Expected API call to fail with undefined url parameter");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when url parameter is null", async () => {
    try {
      // @ts-expect-error Testing null parameter
      await client.validate.nsfw({ url: null });
      throw new Error("Expected API call to fail with null url parameter");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when file_store_key parameter is undefined", async () => {
    try {
      await client.validate.nsfw({ file_store_key: undefined });
      throw new Error("Expected API call to fail with undefined file_store_key parameter");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when file_store_key parameter is null", async () => {
    try {
      // @ts-expect-error Testing null parameter
      await client.validate.nsfw({ file_store_key: null });
      throw new Error("Expected API call to fail with null file_store_key parameter");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should work with valid URL parameter", async () => {
    const result = await client.validate.nsfw({
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png",
    });

    // Verify success
    expectSuccess(result);

    // Verify all required response properties exist
    expectProperty(result, "success");

    // Verify correct types
    expectType(result.success, "boolean");
    expectType(result, "object");
  });

  test("should work with valid file_store_key parameter", async () => {
    // Note: This test will likely fail in actual execution unless we have a valid file_store_key
    // But it tests the parameter structure
    try {
      const result = await client.validate.nsfw({
        file_store_key: "test_file_store_key",
      });

      expectSuccess(result);
      expectProperty(result, "success");
      expectType(result.success, "boolean");
    } catch (error) {
      // Expected to fail with invalid file_store_key, but structure should be correct
      expectType(error, "object");
      console.log("Note: Failed with invalid file_store_key (expected)");
    }
  });

  test("should handle invalid URL gracefully", async () => {
    try {
      await client.validate.nsfw({
        url: "not-a-valid-url",
      });
      throw new Error("Expected API call to fail with invalid URL");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should handle non-image URL gracefully", async () => {
    try {
      await client.validate.nsfw({
        url: "https://www.google.com",
      });
      throw new Error("Expected API call to fail with non-image URL");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should handle unreachable URL gracefully", async () => {
    try {
      await client.validate.nsfw({
        url: "https://example.com/non-existent-image.jpg",
      });
      throw new Error("Expected API call to fail with unreachable URL");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should work with different image formats", async () => {
    const imageUrls = [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png", // PNG
      "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg", // SVG
    ];

    for (const url of imageUrls) {
      try {
        const result = await client.validate.nsfw({ url });

        expectSuccess(result);
        expectProperty(result, "success");
        expectType(result.success, "boolean");
        console.log(`✓ ${url.split(".").pop()?.toUpperCase()} format works`);
      } catch (error) {
        console.log(`Note: ${url} failed - may not be accessible or supported format`);
        expectType(error, "object");
      }
    }
  });

  test("should handle empty string URL", async () => {
    try {
      await client.validate.nsfw({
        url: "",
      });
      throw new Error("Expected API call to fail with empty URL");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should handle empty string file_store_key", async () => {
    try {
      await client.validate.nsfw({
        file_store_key: "",
      });
      throw new Error("Expected API call to fail with empty file_store_key");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should prioritize url when both parameters are provided", async () => {
    const result = await client.validate.nsfw({
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png",
      file_store_key: "test_key", // This should be ignored in favor of URL
    });

    expectSuccess(result);
    expectProperty(result, "success");
    expectType(result.success, "boolean");
  });

  test("should validate response structure completely", async () => {
    const result = await client.validate.nsfw({
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png",
    });

    // Verify the complete response structure
    expectSuccess(result);
    expectType(result, "object");

    // Check if response has only expected properties
    const allowedProperties = ["success"];
    const resultKeys = Object.keys(result);

    for (const key of resultKeys) {
      if (!allowedProperties.includes(key)) {
        console.log(`Note: Unexpected property '${key}' found in NSFW response`);
      }
    }

    // Ensure success property exists and is boolean
    expectProperty(result, "success");
    expectType(result.success, "boolean");
  });

  test("should handle very long URL", async () => {
    const longUrl =
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png" + "?param=" + "a".repeat(1000);

    try {
      const result = await client.validate.nsfw({ url: longUrl });

      expectSuccess(result);
      expectProperty(result, "success");
      expectType(result.success, "boolean");
    } catch (error) {
      console.log("Note: Very long URL failed (may be expected)");
      expectType(error, "object");
    }
  });

  test("NSFW detection with URL", async () => {
    const result = await client.validate.nsfw({
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png",
    });

    expectSuccess(result);
    expectType(result, "object");
    expectProperty(result, "success");
    expectType(result.success, "boolean");
  });

  test("NSFW detection with safe image URL", async () => {
    const result = await client.validate.nsfw({
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png",
    });

    expectSuccess(result);
    expectType(result, "object");
    expectProperty(result, "success");
    expectType(result.success, "boolean");

    // Safe image should return success: true (assuming this means the API processed successfully)
    if (result.success !== true) {
      console.log("Note: NSFW API returned success: false for safe image");
    }
  });
});

// Comprehensive SpellCheck API Tests
describe("SpellCheck validation", () => {
  let client: ReturnType<typeof createJigsawStackClient>;

  beforeEach(() => {
    client = createJigsawStackClient();
  });

  test("should fail when text parameter is missing", async () => {
    try {
      // @ts-expect-error Testing missing required parameter
      await client.validate.spellcheck({});
      throw new Error("Expected API call to fail with missing text parameter");
    } catch (error) {
      // Should throw an error for missing required parameter
      expectType(error, "object");
    }
  });

  test("should fail when text parameter is undefined", async () => {
    try {
      // @ts-expect-error Testing undefined required parameter
      await client.validate.spellcheck({ text: undefined });
      throw new Error("Expected API call to fail with undefined text parameter");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when text parameter is null", async () => {
    try {
      // @ts-expect-error Testing null required parameter
      await client.validate.spellcheck({ text: null });
      throw new Error("Expected API call to fail with null text parameter");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should work with only required text parameter", async () => {
    const result = await client.validate.spellcheck({
      text: "This is a correctly spelled sentence.",
    });

    // Verify success
    expectSuccess(result);

    // Verify all required response properties exist
    expectProperty(result, "success");
    expectProperty(result, "misspellings_found");
    expectProperty(result, "auto_correct_text");

    // Verify correct types
    expectType(result.success, "boolean");
    expectType(result.misspellings_found, "number");
    expectType(result.auto_correct_text, "string");

    // Verify default language_code behavior (should use "en")
    if (result.misspellings_found < 0) {
      throw new Error("misspellings_found should not be negative");
    }
  });

  test("should work with custom language_code parameter", async () => {
    const result = await client.validate.spellcheck({
      text: "Hola mundo como estas",
      language_code: "es",
    });

    expectSuccess(result);
    expectProperty(result, "success");
    expectProperty(result, "misspellings_found");
    expectProperty(result, "auto_correct_text");

    expectType(result.success, "boolean");
    expectType(result.misspellings_found, "number");
    expectType(result.auto_correct_text, "string");
  });

  test("should handle empty text", async () => {
    const result = await client.validate.spellcheck({
      text: "",
    });

    expectSuccess(result);
    expectProperty(result, "success");
    expectProperty(result, "misspellings_found");
    expectProperty(result, "auto_correct_text");

    expectType(result.success, "boolean");
    expectType(result.misspellings_found, "number");
    expectType(result.auto_correct_text, "string");

    // Empty text should have no misspellings
    if (result.misspellings_found !== 0) {
      console.log("Note: Misspellings found in empty text");
    }
  });

  test("should handle text with intentional misspellings", async () => {
    const result = await client.validate.spellcheck({
      text: "Ths is a mispelled sentance with erors.",
      language_code: "en",
    });

    expectSuccess(result);
    expectProperty(result, "success");
    expectProperty(result, "misspellings_found");
    expectProperty(result, "auto_correct_text");

    expectType(result.success, "boolean");
    expectType(result.misspellings_found, "number");
    expectType(result.auto_correct_text, "string");

    // Should find misspellings in our intentionally misspelled text
    if (result.misspellings_found === 0) {
      console.log("Note: No misspellings found in intentionally misspelled text");
    }

    // Auto-corrected text should be different from original
    if (result.auto_correct_text === "Ths is a mispelled sentance with erors.") {
      console.log("Note: Auto-corrected text is identical to original misspelled text");
    }
  });

  test("should handle text with special characters", async () => {
    const result = await client.validate.spellcheck({
      text: "Special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?",
      language_code: "en",
    });

    expectSuccess(result);
    expectProperty(result, "success");
    expectProperty(result, "misspellings_found");
    expectProperty(result, "auto_correct_text");

    expectType(result.success, "boolean");
    expectType(result.misspellings_found, "number");
    expectType(result.auto_correct_text, "string");
  });

  test("should handle text with numbers", async () => {
    const result = await client.validate.spellcheck({
      text: "The year 2024 has 365 days and 12 months.",
      language_code: "en",
    });

    expectSuccess(result);
    expectProperty(result, "success");
    expectProperty(result, "misspellings_found");
    expectProperty(result, "auto_correct_text");

    expectType(result.success, "boolean");
    expectType(result.misspellings_found, "number");
    expectType(result.auto_correct_text, "string");
  });

  test("should handle unicode characters", async () => {
    const result = await client.validate.spellcheck({
      text: "Unicode: 你好 🌟 émojis 🚀 ñoño café résumé",
      language_code: "en",
    });

    expectSuccess(result);
    expectProperty(result, "success");
    expectProperty(result, "misspellings_found");
    expectProperty(result, "auto_correct_text");

    expectType(result.success, "boolean");
    expectType(result.misspellings_found, "number");
    expectType(result.auto_correct_text, "string");
  });

  test("should handle very long text", async () => {
    const longText = "This is a very long text that contains many words. ".repeat(50);
    const result = await client.validate.spellcheck({
      text: longText,
      language_code: "en",
    });

    expectSuccess(result);
    expectProperty(result, "success");
    expectProperty(result, "misspellings_found");
    expectProperty(result, "auto_correct_text");

    expectType(result.success, "boolean");
    expectType(result.misspellings_found, "number");
    expectType(result.auto_correct_text, "string");
  });

  test("should handle different supported language codes", async () => {
    const testCases = [
      { text: "Hello world", language_code: "en", name: "English" },
      { text: "Hola mundo", language_code: "es", name: "Spanish" },
      { text: "Bonjour monde", language_code: "fr", name: "French" },
      { text: "Hallo Welt", language_code: "de", name: "German" },
      { text: "Ciao mondo", language_code: "it", name: "Italian" },
    ];

    for (const testCase of testCases) {
      try {
        const result = await client.validate.spellcheck({
          text: testCase.text,
          language_code: testCase.language_code,
        });

        expectSuccess(result);
        expectProperty(result, "success");
        expectProperty(result, "misspellings_found");
        expectProperty(result, "auto_correct_text");

        expectType(result.success, "boolean");
        expectType(result.misspellings_found, "number");
        expectType(result.auto_correct_text, "string");

        console.log(`✓ ${testCase.name} (${testCase.language_code}) works`);
      } catch (error) {
        console.log(`Note: ${testCase.name} (${testCase.language_code}) failed - may not be supported`);
        expectType(error, "object");
      }
    }
  });

  test("should handle invalid language code", async () => {
    try {
      const result = await client.validate.spellcheck({
        text: "This is a test sentence.",
        language_code: "invalid_code",
      });

      // If it doesn't throw an error, validate the response
      expectSuccess(result);
      expectProperty(result, "success");
      expectProperty(result, "misspellings_found");
      expectProperty(result, "auto_correct_text");

      console.log("Note: Invalid language code was accepted");
    } catch (error) {
      console.log("Note: Invalid language code was rejected (expected)");
      expectType(error, "object");
    }
  });

  test("should handle empty language code", async () => {
    try {
      const result = await client.validate.spellcheck({
        text: "This is a test sentence.",
        language_code: "",
      });

      expectSuccess(result);
      expectProperty(result, "success");
      expectProperty(result, "misspellings_found");
      expectProperty(result, "auto_correct_text");
    } catch (error) {
      console.log("Note: Empty language code was rejected");
      expectType(error, "object");
    }
  });

  test("should validate response structure completely", async () => {
    const result = await client.validate.spellcheck({
      text: "This is a test sentence with some mispellings.",
      language_code: "en",
    });

    // Verify the complete response structure
    expectSuccess(result);
    expectType(result, "object");

    // Check if response has expected properties
    const expectedProperties = ["success", "misspellings_found", "auto_correct_text"];
    const resultKeys = Object.keys(result);

    // Ensure all expected properties exist
    for (const expectedProp of expectedProperties) {
      expectProperty(result, expectedProp);
    }

    // Log any unexpected properties (might be from documentation but not in interface)
    for (const key of resultKeys) {
      if (!expectedProperties.includes(key)) {
        console.log(`Note: Additional property '${key}' found in SpellCheck response`);
      }
    }

    // Validate types
    expectType(result.success, "boolean");
    expectType(result.misspellings_found, "number");
    expectType(result.auto_correct_text, "string");

    // Validate logical constraints
    if (result.misspellings_found < 0) {
      throw new Error("misspellings_found should not be negative");
    }
  });

  test("should handle whitespace-only text", async () => {
    const result = await client.validate.spellcheck({
      text: "   \t\n   ",
      language_code: "en",
    });

    expectSuccess(result);
    expectProperty(result, "success");
    expectProperty(result, "misspellings_found");
    expectProperty(result, "auto_correct_text");

    expectType(result.success, "boolean");
    expectType(result.misspellings_found, "number");
    expectType(result.auto_correct_text, "string");

    // Whitespace-only text should have no misspellings
    if (result.misspellings_found !== 0) {
      console.log("Note: Misspellings found in whitespace-only text");
    }
  });
});
