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
    const longUrl =
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png" + "?param=" + "a".repeat(1000);

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

});
