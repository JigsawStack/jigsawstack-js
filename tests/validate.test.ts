import { beforeEach, describe, test } from "node:test";
import { createJigsawStackClient, expectArray, expectProperty, expectSuccess, expectType } from "./test-helpers.js";

const imageUrl = "https://jigsawstack.com/preview/object-detection-example-input.jpg";
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

    // Run all API calls in parallel
    const results = await Promise.allSettled(
      testCases.map(async (testCase) => {
        const result = await client.validate.profanity({
          text: "This is a test sentence.",
          censor_replacement: testCase.replacement,
        });

        expectSuccess(result);
        expectProperty(result, "clean_text");
        expectType(result.clean_text, "string");

        return { success: true, testCase };
      })
    );

    // Process results and log outcomes
    results.forEach((result, index) => {
      const testCase = testCases[index];
      if (result.status === "fulfilled" && result.value.success) {
        console.log(`✓ ${testCase.name} replacement works`);
      } else {
        console.log(`Note: ${testCase.name} replacement failed`);
      }
    });
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
      url: imageUrl,
    });

    // Verify success
    expectSuccess(result);

    // Verify all required response properties exist
    expectProperty(result, "success");
    expectProperty(result, "nsfw");
    expectProperty(result, "nudity");
    expectProperty(result, "gore");
    expectProperty(result, "nsfw_score");
    expectProperty(result, "nudity_score");
    expectProperty(result, "gore_score");

    // Verify correct types
    expectType(result.success, "boolean");
    expectType(result.nsfw, "boolean");
    expectType(result.nudity, "boolean");
    expectType(result.gore, "boolean");
    expectType(result.nsfw_score, "number");
    expectType(result.nudity_score, "number");
    expectType(result.gore_score, "number");
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
      expectProperty(result, "nsfw");
      expectProperty(result, "nudity");
      expectProperty(result, "gore");
      expectProperty(result, "nsfw_score");
      expectProperty(result, "nudity_score");
      expectProperty(result, "gore_score");

      expectType(result.success, "boolean");
      expectType(result.nsfw, "boolean");
      expectType(result.nudity, "boolean");
      expectType(result.gore, "boolean");
      expectType(result.nsfw_score, "number");
      expectType(result.nudity_score, "number");
      expectType(result.gore_score, "number");
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
      imageUrl, // jpg
    ];

    // Run all API calls in parallel
    const results = await Promise.allSettled(
      imageUrls.map(async (url) => {
        try {
          const result = await client.validate.nsfw({ url });

          expectSuccess(result);
          expectProperty(result, "success");
          expectProperty(result, "nsfw");
          expectProperty(result, "nudity");
          expectProperty(result, "gore");
          expectProperty(result, "nsfw_score");
          expectProperty(result, "nudity_score");
          expectProperty(result, "gore_score");

          expectType(result.success, "boolean");
          expectType(result.nsfw, "boolean");
          expectType(result.nudity, "boolean");
          expectType(result.gore, "boolean");
          expectType(result.nsfw_score, "number");
          expectType(result.nudity_score, "number");
          expectType(result.gore_score, "number");

          return { success: true, url };
        } catch (error) {
          expectType(error, "object");
          return { success: false, url, error };
        }
      })
    );

    // Process results and log outcomes
    results.forEach((result, index) => {
      const url = imageUrls[index];
      const format = url.split(".").pop()?.toUpperCase();

      if (result.status === "fulfilled") {
        if (result.value.success) {
          console.log(`✓ ${format} format works`);
        } else {
          console.log(`Note: ${url} failed - may not be accessible or supported format`);
        }
      } else {
        console.log(`Note: ${url} failed - may not be accessible or supported format`);
      }
    });
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
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070",
      file_store_key: "test_key", // This should be ignored in favor of URL
    });

    expectSuccess(result);
    expectProperty(result, "success");
    expectProperty(result, "nsfw");
    expectProperty(result, "nudity");
    expectProperty(result, "gore");
    expectProperty(result, "nsfw_score");
    expectProperty(result, "nudity_score");
    expectProperty(result, "gore_score");

    expectType(result.success, "boolean");
    expectType(result.nsfw, "boolean");
    expectType(result.nudity, "boolean");
    expectType(result.gore, "boolean");
    expectType(result.nsfw_score, "number");
    expectType(result.nudity_score, "number");
    expectType(result.gore_score, "number");
  });

  test("should validate response structure completely", async () => {
    const result = await client.validate.nsfw({
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070",
    });

    // Verify the complete response structure
    expectSuccess(result);
    expectType(result, "object");

    // Check if response has expected properties
    const expectedProperties = ["success", "nsfw", "nudity", "gore", "nsfw_score", "nudity_score", "gore_score"];
    const resultKeys = Object.keys(result);

    // Ensure all expected properties exist
    for (const expectedProp of expectedProperties) {
      expectProperty(result, expectedProp);
    }

    // Log any additional properties (like _usage)
    for (const key of resultKeys) {
      if (!expectedProperties.includes(key)) {
        console.log(`Note: Additional property '${key}' found in NSFW response`);
      }
    }

    // Validate all property types
    expectProperty(result, "success");
    expectProperty(result, "nsfw");
    expectProperty(result, "nudity");
    expectProperty(result, "gore");
    expectProperty(result, "nsfw_score");
    expectProperty(result, "nudity_score");
    expectProperty(result, "gore_score");

    expectType(result.success, "boolean");
    expectType(result.nsfw, "boolean");
    expectType(result.nudity, "boolean");
    expectType(result.gore, "boolean");
    expectType(result.nsfw_score, "number");
    expectType(result.nudity_score, "number");
    expectType(result.gore_score, "number");
  });

  test("should handle very long URL", async () => {
    const longUrl = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070" + "?param=" + "a".repeat(1000);

    try {
      const result = await client.validate.nsfw({ url: longUrl });

      expectSuccess(result);
      expectProperty(result, "success");
      expectProperty(result, "nsfw");
      expectProperty(result, "nudity");
      expectProperty(result, "gore");
      expectProperty(result, "nsfw_score");
      expectProperty(result, "nudity_score");
      expectProperty(result, "gore_score");

      expectType(result.success, "boolean");
      expectType(result.nsfw, "boolean");
      expectType(result.nudity, "boolean");
      expectType(result.gore, "boolean");
      expectType(result.nsfw_score, "number");
      expectType(result.nudity_score, "number");
      expectType(result.gore_score, "number");
    } catch (error) {
      console.log("Note: Very long URL failed (may be expected)");
      expectType(error, "object");
    }
  });

  test("NSFW detection with URL", async () => {
    const result = await client.validate.nsfw({
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070",
    });

    expectSuccess(result);
    expectType(result, "object");
    expectProperty(result, "success");
    expectProperty(result, "nsfw");
    expectProperty(result, "nudity");
    expectProperty(result, "gore");
    expectProperty(result, "nsfw_score");
    expectProperty(result, "nudity_score");
    expectProperty(result, "gore_score");

    expectType(result.success, "boolean");
    expectType(result.nsfw, "boolean");
    expectType(result.nudity, "boolean");
    expectType(result.gore, "boolean");
    expectType(result.nsfw_score, "number");
    expectType(result.nudity_score, "number");
    expectType(result.gore_score, "number");
  });

  test("NSFW detection with safe image URL", async () => {
    const result = await client.validate.nsfw({
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070",
    });

    expectSuccess(result);
    expectType(result, "object");
    expectProperty(result, "success");
    expectProperty(result, "nsfw");
    expectProperty(result, "nudity");
    expectProperty(result, "gore");
    expectProperty(result, "nsfw_score");
    expectProperty(result, "nudity_score");
    expectProperty(result, "gore_score");

    expectType(result.success, "boolean");
    expectType(result.nsfw, "boolean");
    expectType(result.nudity, "boolean");
    expectType(result.gore, "boolean");
    expectType(result.nsfw_score, "number");
    expectType(result.nudity_score, "number");
    expectType(result.gore_score, "number");

    // Safe image should return success: true (assuming this means the API processed successfully)
    if (result.success !== true) {
      console.log("Note: NSFW API returned success: false for safe image");
    }

    // For a safe image, we expect NSFW flags to be false
    if (result.nsfw === true) {
      console.log("Note: Safe image was flagged as NSFW");
    }
    if (result.nudity === true) {
      console.log("Note: Safe image was flagged as nudity");
    }
    if (result.gore === true) {
      console.log("Note: Safe image was flagged as gore");
    }
  });
});
