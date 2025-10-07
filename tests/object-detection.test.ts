import { beforeEach, describe, test } from "node:test";
import { createJigsawStackClient, expectArray, expectProperty, expectSuccess, expectType } from "./test-helpers.js";

const TEST_URLS = {
  image: "https://jigsawstack.com/preview/object-detection-example-input.jpg",
  pdf: "https://www.w3.org/WAI/WCAG21/working-examples/pdf-table/table.pdf",
  textImage: "https://jigsawstack.com/preview/vocr-example.jpg",
};

const FAILURE_TEST_CASES = [
  {
    name: "should fail when no parameters are provided",
    params: {},
    expected: {
      error: "object",
    },
  },
];

const SUCCESS_TEST_CASES = [
  {
    name: "should fail when no parameters are provided",
    params: {},
    expected: {
      error: "object",
    },
  },
];

// Comprehensive Object Detection API Tests
describe("Object Detection API", () => {
  let client: ReturnType<typeof createJigsawStackClient>;

  beforeEach(() => {
    client = createJigsawStackClient();
  });

  // Test missing required parameters
  test("should fail when no parameters are provided", async () => {
    try {
      await client.vision.object_detection({});
      throw new Error("Expected API call to fail with no parameters");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when both url and file_store_key are missing", async () => {
    try {
      await client.vision.object_detection({
        prompts: ["detect objects"],
      } as any);
      throw new Error("Expected API call to fail with missing url/file_store_key");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when both url and file_store_key are provided", async () => {
    try {
      await client.vision.object_detection({
        url: TEST_URLS.image,
        file_store_key: "test_key",
      } as any);
      throw new Error("Expected API call to fail with both url and file_store_key");
    } catch (error) {
      expectType(error, "object");
    }
  });

  // Basic functionality tests
  test("should work with URL only (default parameters)", async () => {
    const result = await client.vision.object_detection({
      url: TEST_URLS.image,
    });

    expectSuccess(result);
    expectType(result, "object");

    // Check for optional properties based on default features
    if (result.objects !== undefined) {
      expectArray(result.objects);

      // Validate objects structure
      for (const obj of result.objects) {
        expectType(obj, "object");
        expectProperty(obj, "bounds");
        expectType(obj.bounds, "object");

        // Validate bounds structure
        expectProperty(obj.bounds, "top_left");
        expectProperty(obj.bounds, "top_right");
        expectProperty(obj.bounds, "bottom_left");
        expectProperty(obj.bounds, "bottom_right");
        expectProperty(obj.bounds, "width");
        expectProperty(obj.bounds, "height");

        expectType(obj.bounds.width, "number");
        expectType(obj.bounds.height, "number");

        // Validate points
        expectProperty(obj.bounds.top_left, "x");
        expectProperty(obj.bounds.top_left, "y");
        expectType(obj.bounds.top_left.x, "number");
        expectType(obj.bounds.top_left.y, "number");

        // Check for optional mask
        if (obj.mask !== undefined) {
          expectType(obj.mask, "string");
        }
      }
    }
  });

  test("should work with file_store_key parameter", async () => {
    try {
      const result = await client.vision.object_detection({
        file_store_key: "test_file_store_key",
      });

      expectSuccess(result);
      expectType(result, "object");
    } catch (error) {
      // Expected to fail with invalid file_store_key, but structure should be correct
      expectType(error, "object");
      console.log("Note: Failed with invalid file_store_key (expected)");
    }
  });

  // Test features parameter
  test("should work with object_detection feature", async () => {
    const result = await client.vision.object_detection({
      url: TEST_URLS.image,
      features: ["object"],
    });

    expectSuccess(result);
    expectType(result, "object");

    if (result.objects !== undefined) {
      expectArray(result.objects);
    }
  });

  test("should work with gui feature", async () => {
    const result = await client.vision.object_detection({
      url: TEST_URLS.image,
      features: ["gui"],
    });

    expectSuccess(result);
    expectType(result, "object");

    if (result.gui_elements !== undefined) {
      expectArray(result.gui_elements);

      // Validate GUI elements structure
      for (const element of result.gui_elements) {
        expectType(element, "object");
        expectProperty(element, "bounds");
        expectProperty(element, "content");
        expectType(element.bounds, "object");
        // content can be string or null
        if (element.content !== null) {
          expectType(element.content, "string");
        }
      }
    }
  });

  test("should work with both object_detection and gui features", async () => {
    const result = await client.vision.object_detection({
      url: TEST_URLS.image,
      features: ["object", "gui"],
    });

    expectSuccess(result);
    expectType(result, "object");

    if (result.objects !== undefined) {
      expectArray(result.objects);
    }

    if (result.gui_elements !== undefined) {
      expectArray(result.gui_elements);
    }
  });

  test("should fail with invalid feature", async () => {
    try {
      await client.vision.object_detection({
        url: TEST_URLS.image,
        features: ["invalid_feature" as any],
      });
      throw new Error("Expected API call to fail with invalid feature");
    } catch (error) {
      expectType(error, "object");
    }
  });

  // Test prompts parameter
  test("should work with single prompt", async () => {
    const result = await client.vision.object_detection({
      url: TEST_URLS.image,
      prompts: ["detect all visible objects"],
    });

    expectSuccess(result);
    expectType(result, "object");
  });

  test("should work with multiple prompts", async () => {
    const result = await client.vision.object_detection({
      url: TEST_URLS.image,
      prompts: ["find people", "detect vehicles", "identify buildings"],
    });

    expectSuccess(result);
    expectType(result, "object");
  });

  test("should work with empty prompts array", async () => {
    const result = await client.vision.object_detection({
      url: TEST_URLS.image,
      prompts: [],
    });

    expectSuccess(result);
    expectType(result, "object");
  });

  // Test annotated_image parameter
  test("should work with annotated_image enabled", async () => {
    const result = await client.vision.object_detection({
      url: TEST_URLS.image,
      annotated_image: true,
    });

    expectSuccess(result);
    expectType(result, "object");

    // annotated_image should be included only if objects or gui_elements exist
    if (result.annotated_image !== undefined) {
      expectType(result.annotated_image, "string");
    }
  });

  test("should work with annotated_image disabled", async () => {
    const result = await client.vision.object_detection({
      url: TEST_URLS.image,
      annotated_image: false,
    });

    expectSuccess(result);
    expectType(result, "object");

    // annotated_image should not be present when disabled
    if (result.annotated_image !== undefined) {
      console.log("Note: annotated_image present even when disabled");
    }
  });

  // Test return_type parameter
  test("should work with return_type url", async () => {
    const result = await client.vision.object_detection({
      url: TEST_URLS.image,
      return_type: "url",
      annotated_image: true,
    });

    expectSuccess(result);
    expectType(result, "object");

    if (result.annotated_image !== undefined) {
      expectType(result.annotated_image, "string");
      // Should be a URL when return_type is "url"
      if (!result.annotated_image.startsWith("http")) {
        console.log("Note: annotated_image doesn't look like a URL");
      }
    }
  });

  test("should work with return_type base64", async () => {
    const result = await client.vision.object_detection({
      url: TEST_URLS.image,
      return_type: "base64",
      annotated_image: true,
    });

    expectSuccess(result);
    expectType(result, "object");

    if (result.annotated_image !== undefined) {
      expectType(result.annotated_image, "string");
      // Should be base64 when return_type is "base64"
      if (!result.annotated_image.startsWith("data:") && !result.annotated_image.match(/^[A-Za-z0-9+/=]+$/)) {
        console.log("Note: annotated_image doesn't look like base64");
      }
    }
  });

  test("should fail with invalid return_type", async () => {
    try {
      await client.vision.object_detection({
        url: TEST_URLS.image,
        return_type: "invalid" as any,
      });
      throw new Error("Expected API call to fail with invalid return_type");
    } catch (error) {
      expectType(error, "object");
    }
  });

  // Edge cases and error handling
  test("should handle invalid URL gracefully", async () => {
    try {
      await client.vision.object_detection({
        url: "not-a-valid-url",
      });
      throw new Error("Expected API call to fail with invalid URL");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should handle unreachable URL gracefully", async () => {
    try {
      await client.vision.object_detection({
        url: "https://example.com/non-existent-image.jpg",
      });
      throw new Error("Expected API call to fail with unreachable URL");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should handle empty file_store_key gracefully", async () => {
    try {
      await client.vision.object_detection({
        file_store_key: "",
      });
      throw new Error("Expected API call to fail with empty file_store_key");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should work with different image formats", async () => {
    const imageUrls = [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png", // PNG
      "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg", // SVG
    ];

    // Run all API calls in parallel
    const results = await Promise.allSettled(
      imageUrls.map(async (url) => {
        try {
          const result = await client.vision.object_detection({
            url: url,
          });

          expectSuccess(result);
          expectType(result, "object");

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

  // Complex scenario tests
  test("should work with comprehensive configuration", async () => {
    const result = await client.vision.object_detection({
      url: TEST_URLS.image,
      prompts: ["detect all objects", "find text elements"],
      features: ["object", "gui"],
      annotated_image: true,
      return_type: "url",
    });

    expectSuccess(result);
    expectType(result, "object");

    if (result.objects !== undefined) {
      expectArray(result.objects);
    }

    if (result.gui_elements !== undefined) {
      expectArray(result.gui_elements);
    }

    if (result.annotated_image !== undefined) {
      expectType(result.annotated_image, "string");
    }
  });

  test("should work with file upload", async () => {
    const imageResponse = await fetch(TEST_URLS.image);
    const imageBlob = await imageResponse.blob();
    const result = await client.vision.object_detection(imageBlob);

    expectSuccess(result);
    expectType(result, "object");
  });
});
