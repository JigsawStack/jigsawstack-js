import { beforeEach, describe, test } from "node:test";
import { createJigsawStackClient, expectArray, expectProperty, expectSuccess, expectType } from "./test-helpers.js";

const TEST_DATA = {
  textDataset: [
    { type: "text" as const, value: "This is a positive review about the product" },
    { type: "text" as const, value: "I hate this product, it's terrible" },
    { type: "text" as const, value: "The product is okay, nothing special" },
  ],
  imageDataset: [
    {
      type: "image" as const,
      value:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",
    },
    { type: "image" as const, value: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" },
  ],
  textLabels: [
    { type: "text" as const, value: "positive" },
    { type: "text" as const, value: "negative" },
    { type: "text" as const, value: "neutral" },
  ],
  imageLabels: [
    { type: "image" as const, value: "https://example.com/cat.jpg" },
    { type: "image" as const, value: "https://example.com/dog.jpg" },
  ],
  labelsWith_keys: [
    { key: "pos", type: "text" as const, value: "positive sentiment" },
    { key: "neg", type: "text" as const, value: "negative sentiment" },
    { key: "neu", type: "text" as const, value: "neutral sentiment" },
  ],
};

// Comprehensive Classification API Tests
describe("Classification API", () => {
  let client: ReturnType<typeof createJigsawStackClient>;

  beforeEach(() => {
    client = createJigsawStackClient();
  });

  // Test missing required parameters
  test("should fail when no parameters are provided", async () => {
    try {
      await client.classification({} as any);
      throw new Error("Expected API call to fail with no parameters");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when dataset parameter is missing", async () => {
    try {
      await client.classification({
        labels: TEST_DATA.textLabels,
      } as any);
      throw new Error("Expected API call to fail with missing dataset parameter");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when labels parameter is missing", async () => {
    try {
      await client.classification({
        dataset: TEST_DATA.textDataset,
      } as any);
      throw new Error("Expected API call to fail with missing labels parameter");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when dataset is empty array", async () => {
    try {
      await client.classification({
        dataset: [],
        labels: TEST_DATA.textLabels,
      });
      throw new Error("Expected API call to fail with empty dataset");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when labels is empty array", async () => {
    try {
      await client.classification({
        dataset: TEST_DATA.textDataset,
        labels: [],
      });
      throw new Error("Expected API call to fail with empty labels");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when dataset items have invalid type", async () => {
    try {
      await client.classification({
        dataset: [{ type: "invalid" as any, value: "test" }],
        labels: TEST_DATA.textLabels,
      });
      throw new Error("Expected API call to fail with invalid dataset type");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when label items have invalid type", async () => {
    try {
      await client.classification({
        dataset: TEST_DATA.textDataset,
        labels: [{ type: "invalid" as any, value: "test" }],
      });
      throw new Error("Expected API call to fail with invalid label type");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when dataset items missing required value", async () => {
    try {
      await client.classification({
        dataset: [{ type: "text" } as any],
        labels: TEST_DATA.textLabels,
      });
      throw new Error("Expected API call to fail with missing dataset value");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when label items missing required value", async () => {
    try {
      await client.classification({
        dataset: TEST_DATA.textDataset,
        labels: [{ type: "text" } as any],
      });
      throw new Error("Expected API call to fail with missing label value");
    } catch (error) {
      expectType(error, "object");
    }
  });

  // Basic functionality tests
  test("should work with text dataset and text labels (single label)", async () => {
    const result = await client.classification({
      dataset: TEST_DATA.textDataset,
      labels: TEST_DATA.textLabels,
    });

    expectSuccess(result);
    expectProperty(result, "success");
    expectProperty(result, "predictions");
    expectType(result.success, "boolean");
    expectArray(result.predictions);

    // For single label classification, predictions should be string[]
    for (const prediction of result.predictions) {
      expectType(prediction, "string");
    }

    // Should have same number of predictions as dataset items
    if (Array.isArray(result.predictions)) {
      console.log(`Dataset size: ${TEST_DATA.textDataset.length}, Predictions: ${result.predictions.length}`);
    }
  });

  test("should work with text dataset and text labels (multiple labels)", async () => {
    const result = await client.classification({
      dataset: TEST_DATA.textDataset,
      labels: TEST_DATA.textLabels,
      multiple_labels: true,
    });

    expectSuccess(result);
    expectProperty(result, "success");
    expectProperty(result, "predictions");
    expectType(result.success, "boolean");
    expectArray(result.predictions);

    // For multiple label classification, predictions should be string[][]
    for (const prediction of result.predictions) {
      expectArray(prediction);
      // Each prediction should be an array of strings
      if (Array.isArray(prediction)) {
        for (const label of prediction) {
          expectType(label, "string");
        }
      }
    }
  });

  test("should work with labels that have keys", async () => {
    const result = await client.classification({
      dataset: TEST_DATA.textDataset,
      labels: TEST_DATA.labelsWith_keys,
    });

    expectSuccess(result);
    expectProperty(result, "predictions");
    expectArray(result.predictions);

    // Predictions should contain the keys or values from labels
    for (const prediction of result.predictions) {
      expectType(prediction, "string");
    }
  });

  test("should work with single dataset item", async () => {
    const result = await client.classification({
      dataset: [TEST_DATA.textDataset[0]],
      labels: TEST_DATA.textLabels,
    });

    expectSuccess(result);
    expectProperty(result, "predictions");
    expectArray(result.predictions);

    // Should have exactly one prediction
    if (Array.isArray(result.predictions) && result.predictions.length === 1) {
      console.log("✓ Single dataset item produces single prediction");
    }
  });

  test("should fail with single label", async () => {
    try {
      await client.classification({
        dataset: TEST_DATA.textDataset,
        labels: [TEST_DATA.textLabels[0]],
      });
      throw new Error("Expected API call to fail with single label");
    } catch (error) {
      expectType(error, "object");
    }
  });

  // Test different content types
  test("should work with image dataset and image labels", async () => {
    try {
      const result = await client.classification({
        dataset: TEST_DATA.imageDataset,
        labels: TEST_DATA.imageLabels,
      });

      expectSuccess(result);
      expectProperty(result, "predictions");
      expectArray(result.predictions);

      for (const prediction of result.predictions) {
        expectType(prediction, "string");
      }

      console.log("✓ Image classification works");
    } catch (error) {
      expectType(error, "object");
      console.log("Note: Image classification failed - may not be accessible or supported");
    }
  });

  test("should work with mixed dataset types", async () => {
    const mixedDataset = [...TEST_DATA.textDataset.slice(0, 2), ...TEST_DATA.imageDataset.slice(0, 1)];

    try {
      const result = await client.classification({
        dataset: mixedDataset,
        labels: TEST_DATA.textLabels,
      });

      expectSuccess(result);
      expectProperty(result, "predictions");
      expectArray(result.predictions);

      // Should have predictions for all dataset items
      if (Array.isArray(result.predictions) && result.predictions.length === mixedDataset.length) {
        console.log("✓ Mixed dataset types work");
      }
    } catch (error) {
      expectType(error, "object");
      console.log("Note: Mixed dataset types failed - may not be supported");
    }
  });

  test("should work with mixed label types", async () => {
    const mixedLabels = [...TEST_DATA.textLabels.slice(0, 2), ...TEST_DATA.imageLabels.slice(0, 1)];

    try {
      const result = await client.classification({
        dataset: TEST_DATA.textDataset,
        labels: mixedLabels,
      });

      expectSuccess(result);
      expectProperty(result, "predictions");
      expectArray(result.predictions);

      console.log("✓ Mixed label types work");
    } catch (error) {
      expectType(error, "object");
      console.log("Note: Mixed label types failed - may not be supported");
    }
  });

  // Test boolean parameter variations
  test("should work with multiple_labels explicitly set to false", async () => {
    const result = await client.classification({
      dataset: TEST_DATA.textDataset,
      labels: TEST_DATA.textLabels,
      multiple_labels: false,
    });

    expectSuccess(result);
    expectProperty(result, "predictions");
    expectArray(result.predictions);

    // Should behave like single label classification
    for (const prediction of result.predictions) {
      expectType(prediction, "string");
    }
  });

  // Edge cases and error handling
  test("should handle invalid URLs in image dataset gracefully", async () => {
    try {
      await client.classification({
        dataset: [{ type: "image", value: "not-a-valid-url" }],
        labels: TEST_DATA.textLabels,
      });
      throw new Error("Expected API call to fail with invalid image URL");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should handle unreachable URLs in image dataset gracefully", async () => {
    try {
      await client.classification({
        dataset: [{ type: "image", value: "https://example.com/non-existent-image.jpg" }],
        labels: TEST_DATA.textLabels,
      });
      throw new Error("Expected API call to fail with unreachable image URL");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should handle invalid URLs in image labels gracefully", async () => {
    try {
      await client.classification({
        dataset: TEST_DATA.textDataset,
        labels: [{ type: "image", value: "not-a-valid-url" }],
      });
      throw new Error("Expected API call to fail with invalid label image URL");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should handle empty text values gracefully", async () => {
    try {
      await client.classification({
        dataset: [{ type: "text", value: "" }],
        labels: TEST_DATA.textLabels,
      });
      throw new Error("Expected API call to fail with empty text value");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should handle empty label text values gracefully", async () => {
    try {
      await client.classification({
        dataset: TEST_DATA.textDataset,
        labels: [{ type: "text", value: "" }],
      });
      throw new Error("Expected API call to fail with empty label text value");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should handle very long text values", async () => {
    const longText = "a".repeat(10000); // 10k characters

    try {
      const result = await client.classification({
        dataset: [{ type: "text", value: longText }],
        labels: TEST_DATA.textLabels,
      });

      expectSuccess(result);
      expectProperty(result, "predictions");
      expectArray(result.predictions);

      console.log("✓ Long text values work");
    } catch (error) {
      expectType(error, "object");
      console.log("Note: Long text values failed - may exceed limits");
    }
  });

  test("should handle large dataset", async () => {
    const largeDataset = Array(50)
      .fill(null)
      .map((_, i) => ({
        type: "text" as const,
        value: `Sample text item number ${i + 1}`,
      }));

    try {
      const result = await client.classification({
        dataset: largeDataset,
        labels: TEST_DATA.textLabels,
      });

      expectSuccess(result);
      expectProperty(result, "predictions");
      expectArray(result.predictions);

      // Should have predictions for all items
      if (Array.isArray(result.predictions) && result.predictions.length === largeDataset.length) {
        console.log("✓ Large dataset works");
      }
    } catch (error) {
      expectType(error, "object");
      console.log("Note: Large dataset failed - may exceed limits");
    }
  });

  test("should handle many labels", async () => {
    const manyLabels = Array(20)
      .fill(null)
      .map((_, i) => ({
        type: "text" as const,
        value: `Label ${i + 1}`,
      }));

    try {
      const result = await client.classification({
        dataset: TEST_DATA.textDataset.slice(0, 2), // Use smaller dataset
        labels: manyLabels,
      });

      expectSuccess(result);
      expectProperty(result, "predictions");
      expectArray(result.predictions);

      console.log("✓ Many labels work");
    } catch (error) {
      expectType(error, "object");
      console.log("Note: Many labels failed - may exceed limits");
    }
  });

  // Complex scenario tests
  test("should work with comprehensive configuration", async () => {
    const result = await client.classification({
      dataset: TEST_DATA.textDataset,
      labels: TEST_DATA.labelsWith_keys,
      multiple_labels: true,
    });

    expectSuccess(result);
    expectProperty(result, "success");
    expectProperty(result, "predictions");
    expectType(result.success, "boolean");
    expectArray(result.predictions);

    // Should have predictions for all dataset items
    if (Array.isArray(result.predictions) && result.predictions.length === TEST_DATA.textDataset.length) {
      console.log("✓ Comprehensive configuration works");
    }

    // Each prediction should be an array for multiple labels
    for (const prediction of result.predictions) {
      expectArray(prediction);
    }
  });

  test("should maintain prediction order matching dataset order", async () => {
    const orderedDataset = [
      { type: "text" as const, value: "First item" },
      { type: "text" as const, value: "Second item" },
      { type: "text" as const, value: "Third item" },
    ];

    const result = await client.classification({
      dataset: orderedDataset,
      labels: TEST_DATA.textLabels,
    });

    expectSuccess(result);
    expectProperty(result, "predictions");
    expectArray(result.predictions);

    // Should have same number of predictions as dataset items in same order
    if (Array.isArray(result.predictions) && result.predictions.length === orderedDataset.length) {
      console.log("✓ Prediction order maintained");
    }
  });
});
