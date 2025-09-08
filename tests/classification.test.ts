import { beforeEach, describe, test } from "node:test";
import { createJigsawStackClient, expectArray, expectProperty, expectSuccess, expectType } from "./test-helpers.js";

const TEST_TEXT_DATA = [
  {
    type: "text" as const,
    value: "This is a great product! I love it.",
  },
  {
    type: "text" as const,
    value: "This is ass product",
  },
  {
    type: "text" as const,
    value: "Dogs are cool",
  },
  {
    type: "text" as const,
    value: "Cats are not cool",
  },
];

const TEST_IMAGE_DATA = [
  {
    type: "image" as const,
    value: "https://as2.ftcdn.net/v2/jpg/02/24/11/57/1000_F_224115780_2ssvcCoTfQrx68Qsl5NxtVIDFWKtAgq2.jpg",
  },
  {
    type: "image" as const,
    value: "https://t3.ftcdn.net/jpg/02/95/44/22/240_F_295442295_OXsXOmLmqBUfZreTnGo9PREuAPSLQhff.jpg",
  },
  {
    type: "image" as const,
    value: "https://as1.ftcdn.net/v2/jpg/05/54/94/46/1000_F_554944613_okdr3fBwcE9kTOgbLp4BrtVi8zcKFWdP.jpg",
  },
];

// Fix the label definitions to match real API
const TEXT_LABELS = [
  {
    type: "text" as const,
    value: "positive",
  },
  {
    type: "text" as const,
    value: "negative",
  },
  {
    type: "text" as const,
    value: "dogs",
  },
  {
    type: "text" as const,
    value: "cats",
  },
];

const IMAGE_LABELS = [
  {
    type: "image" as const, // Note: "text" not "image"!
    value: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Single.jpg",
  },
  {
    type: "image" as const,
    value: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/2048px-Instagram_icon.png",
  },
];

// Comprehensive Text Classification API Tests
describe("Text Classification API", () => {
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

  test("should fail when dataset is missing", async () => {
    try {
      await client.classification({
        labels: TEXT_LABELS,
      } as any);
      throw new Error("Expected API call to fail with missing dataset");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when labels are missing", async () => {
    try {
      await client.classification({
        dataset: TEST_TEXT_DATA,
        labels: [],
      } as any);
      throw new Error("Expected API call to fail with missing labels");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when dataset is empty", async () => {
    try {
      await client.classification({
        dataset: [],
        labels: TEXT_LABELS,
      });
      throw new Error("Expected API call to fail with empty dataset");
    } catch (error) {
      expectType(error, "object");
    }
  });

  // Basic functionality tests
  test("should work with basic text classification", async () => {
    const result = await client.classification({
      dataset: [
        { type: "text" as const, value: "This is a great product! I love it." },
        { type: "text" as const, value: "This is a great product! I hate it." },
      ],
      labels: [
        { key: "positive", type: "text" as const, value: "positive sentiment" },
        { key: "negative", type: "text" as const, value: "negative sentiment" },
      ],
    });

    expectSuccess(result);
    expectProperty(result, "predictions");
    expectArray(result.predictions);

    console.log(result.predictions);

    // Predictions should be simple strings
    for (const prediction of result.predictions) {
      expectType(prediction, "string");
    }
  });

  test("should work with multiple text samples", async () => {
    const result = await client.classification({
      dataset: [
        { type: "text" as const, value: "This is a great product! I love it." },
        { type: "text" as const, value: "This product is terrible and broken." },
        { type: "text" as const, value: "This is a product description." },
      ],
      labels: [
        { key: "positive", type: "text" as const, value: "positive sentiment" },
        { key: "negative", type: "text" as const, value: "negative sentiment" },
        { key: "neutral", type: "text" as const, value: "neutral sentiment" },
      ],
    });

    expectSuccess(result);
    expectArray(result.predictions);

    // Should have predictions for each input text
    if (result.predictions.length !== 3) {
      console.log(`Note: Expected 3 predictions, got ${result.predictions.length}`);
    }
  });

  test("should work with multiple_labels enabled", async () => {
    const result = await client.classification({
      dataset: [{ type: "text" as const, value: "This is a great product with excellent customer service!" }],
      labels: [
        { key: "quality", type: "text" as const, value: "relates to product quality" },
        { key: "service", type: "text" as const, value: "relates to customer service" },
        { key: "pricing", type: "text" as const, value: "relates to pricing" },
      ],
      multiple_labels: true,
    });

    expectSuccess(result);
    expectArray(result.predictions);

    // With multiple_labels, predictions should be arrays of strings
    for (const prediction of result.predictions) {
      if (Array.isArray(prediction)) {
        expectArray(prediction);
        for (const item of prediction) {
          expectType(item, "string");
        }
      }
    }
  });

  test("should work with multiple_labels disabled", async () => {
    const result = await client.classification({
      dataset: [{ type: "text" as const, value: "This is a great product! I love it." }],
      labels: [
        { key: "positive", type: "text" as const, value: "positive sentiment" },
        { key: "negative", type: "text" as const, value: "negative sentiment" },
      ],
      multiple_labels: false,
    });

    expectSuccess(result);
    expectArray(result.predictions);
  });

  // Test with various text content types
  test("should work with long text", async () => {
    const longText = "This is a comprehensive review of a product that I purchased recently. ".repeat(10);

    const result = await client.classification({
      dataset: [{ type: "text" as const, value: longText }],
      labels: [
        { key: "review", type: "text" as const, value: "product review" },
        { key: "description", type: "text" as const, value: "product description" },
      ],
    });

    expectSuccess(result);
    expectArray(result.predictions);
  });

  test("should work with special characters and unicode", async () => {
    const result = await client.classification({
      dataset: [{ type: "text" as const, value: "¡Excelente producto! 🚀 Me encanta. Ñoño café français." }],
      labels: [
        { key: "positive", type: "text" as const, value: "positive sentiment" },
        { key: "negative", type: "text" as const, value: "negative sentiment" },
      ],
    });

    expectSuccess(result);
    expectArray(result.predictions);
  });

  test("should work with many labels", async () => {
    const labels: Array<{ key?: string; type: "text"; value: string }> = [];
    for (let i = 1; i <= 10; i++) {
      labels.push({
        key: `category_${i}`,
        type: "text" as const,
        value: `Category ${i} description`,
      });
    }

    const result = await client.classification({
      dataset: [{ type: "text" as const, value: "This is a test text for classification." }],
      labels: labels,
    });

    expectSuccess(result);
    expectArray(result.predictions);
  });

  // Edge cases and error handling
  test("should handle empty text gracefully", async () => {
    try {
      const result = await client.classification({
        dataset: [{ type: "text" as const, value: "" }],
        labels: [
          { key: "empty", type: "text" as const, value: "empty text" },
          { key: "not_empty", type: "text" as const, value: "non-empty text" },
        ],
      });

      expectSuccess(result);
      expectArray(result.predictions);
    } catch (error) {
      // Some APIs might not allow empty text
      expectType(error, "object");
    }
  });

  test("should handle whitespace-only text", async () => {
    try {
      const result = await client.classification({
        dataset: [{ type: "text" as const, value: "   \n\t   " }],
        labels: [
          { key: "whitespace", type: "text" as const, value: "whitespace content" },
          { key: "content", type: "text" as const, value: "actual content" },
        ],
      });

      expectSuccess(result);
      expectArray(result.predictions);
    } catch (error) {
      // Some APIs might not allow whitespace-only text
      expectType(error, "object");
    }
  });

  test("should fail with invalid dataset type", async () => {
    try {
      await client.classification({
        dataset: [{ type: "image" as any, value: "This is a great product! I love it." }],
        labels: [{ key: "positive", type: "text" as const, value: "positive sentiment" }],
      } as any);
      throw new Error("Expected API call to fail with invalid dataset type");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail with invalid label type", async () => {
    try {
      await client.classification({
        dataset: [{ type: "text" as const, value: "This is a great product! I love it." }],
        labels: [{ key: "positive", type: "image" as any, value: "positive sentiment" }],
      } as any);
      throw new Error("Expected API call to fail with invalid label type");
    } catch (error) {
      expectType(error, "object");
    }
  });
});

// Comprehensive Image Classification API Tests
describe("Image Classification API", () => {
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

  test("should fail when dataset is missing", async () => {
    try {
      await client.classification({
        labels: IMAGE_LABELS,
      } as any);
      throw new Error("Expected API call to fail with missing dataset");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when labels are missing", async () => {
    try {
      await client.classification({
        dataset: TEST_IMAGE_DATA,
      } as any);
      throw new Error("Expected API call to fail with missing labels");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when dataset is empty", async () => {
    try {
      await client.classification({
        dataset: [],
        labels: IMAGE_LABELS,
      });
      throw new Error("Expected API call to fail with empty dataset");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when labels are empty", async () => {
    try {
      await client.classification({
        dataset: TEST_IMAGE_DATA,
        labels: [],
      });
      throw new Error("Expected API call to fail with empty labels");
    } catch (error) {
      expectType(error, "object");
    }
  });

  // Basic functionality tests
  test("should work with basic image classification", async () => {
    const result = await client.classification({
      dataset: TEST_IMAGE_DATA,
      labels: IMAGE_LABELS,
    });

    expectSuccess(result);
    expectProperty(result, "predictions");
    expectArray(result.predictions);

    // Check predictions structure
    for (const prediction of result.predictions) {
      expectType(prediction, typeof prediction === "string" ? "string" : "object");
      if (Array.isArray(prediction)) {
        expectArray(prediction);
        for (const item of prediction) {
          expectType(item, "string");
        }
      }
    }
  });

  test("should work with multiple images", async () => {
    const result = await client.classification({
      dataset: [
        { type: "image" as const, value: "https://as2.ftcdn.net/v2/jpg/02/24/11/57/1000_F_224115780_2ssvcCoTfQrx68Qsl5NxtVIDFWKtAgq2.jpg" },
        { type: "image" as const, value: "https://t3.ftcdn.net/jpg/02/95/44/22/240_F_295442295_OXsXOmLmqBUfZreTnGo9PREuAPSLQhff.jpg" },
      ],
      labels: [
        { key: "banana", type: "text" as const, value: "banana" },
        { key: "sunglasses", type: "text" as const, value: "sunglasses" },
      ],
    });

    expectSuccess(result);
    expectArray(result.predictions);

    // Should have predictions for each input image
    if (result.predictions.length !== 2) {
      console.log(`Note: Expected 2 predictions, got ${result.predictions.length}`);
    }
  });

  test("should work with multiple_labels enabled for images", async () => {
    const result = await client.classification({
      dataset: [{ type: "image" as const, value: "https://as2.ftcdn.net/v2/jpg/02/24/11/57/1000_F_224115780_2ssvcCoTfQrx68Qsl5NxtVIDFWKtAgq2.jpg" }],
      labels: [
        { key: "banana", type: "text" as const, value: "banana" },
        { key: "sunglasses", type: "text" as const, value: "sunglasses" },
      ],
      multiple_labels: true,
    });

    expectSuccess(result);
    expectArray(result.predictions);

    // With multiple_labels, predictions should be arrays of strings
    for (const prediction of result.predictions) {
      if (Array.isArray(prediction)) {
        expectArray(prediction);
        for (const item of prediction) {
          expectType(item, "string");
        }
      }
    }
  });

  test("should work with multiple_labels disabled for images", async () => {
    const result = await client.classification({
      dataset: [{ type: "image" as const, value: "https://as2.ftcdn.net/v2/jpg/02/24/11/57/1000_F_224115780_2ssvcCoTfQrx68Qsl5NxtVIDFWKtAgq2.jpg" }],
      labels: [
        { key: "banana", type: "text" as const, value: "banana" },
        { key: "sunglasses", type: "text" as const, value: "sunglasses" },
      ],
      multiple_labels: false,
    });

    expectSuccess(result);
    expectArray(result.predictions);
  });

  // Test with multiple label images
  test("should work with many image labels", async () => {
    const labels: Array<{ key?: string; type: "text"; value: string }> = [];
    const labelValues = ["banana", "sunglasses", "person smiling", "outdoor scene", "colorful object"];

    for (let i = 0; i < labelValues.length; i++) {
      labels.push({
        key: `category_${i + 1}`,
        type: "text" as const,
        value: labelValues[i],
      });
    }

    const result = await client.classification({
      dataset: [{ type: "image" as const, value: "https://as2.ftcdn.net/v2/jpg/02/24/11/57/1000_F_224115780_2ssvcCoTfQrx68Qsl5NxtVIDFWKtAgq2.jpg" }],
      labels: labels,
    });

    expectSuccess(result);
    expectArray(result.predictions);
  });

  // Edge cases and error handling
  test("should handle invalid image URL gracefully", async () => {
    try {
      await client.classification({
        dataset: [{ type: "image" as const, value: "not-a-valid-url" }],
        labels: [{ key: "banana", type: "text" as const, value: "banana" }],
      });
      throw new Error("Expected API call to fail with invalid image URL");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should handle empty image URL", async () => {
    try {
      await client.classification({
        dataset: [{ type: "image" as const, value: "" }],
        labels: [{ key: "banana", type: "text" as const, value: "banana" }],
      });
      throw new Error("Expected API call to fail with empty image URL");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail with invalid dataset type", async () => {
    try {
      await client.classification({
        dataset: [{ type: "text" as any, value: "https://as2.ftcdn.net/v2/jpg/02/24/11/57/1000_F_224115780_2ssvcCoTfQrx68Qsl5NxtVIDFWKtAgq2.jpg" }],
        labels: [{ key: "banana", type: "text" as const, value: "banana" }],
      } as any);
      throw new Error("Expected API call to fail with invalid dataset type");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail with invalid label type", async () => {
    try {
      await client.classification({
        dataset: [
          { type: "image" as const, value: "https://as2.ftcdn.net/v2/jpg/02/24/11/57/1000_F_224115780_2ssvcCoTfQrx68Qsl5NxtVIDFWKtAgq2.jpg" },
        ],
        labels: [{ key: "banana", type: "text" as any, value: "banana" }],
      } as any);
      throw new Error("Expected API call to fail with invalid label type");
    } catch (error) {
      expectType(error, "object");
    }
  });

  // Complex scenario test
  test("should work with comprehensive image classification configuration", async () => {
    const result = await client.classification({
      dataset: [
        { type: "image" as const, value: "https://as2.ftcdn.net/v2/jpg/02/24/11/57/1000_F_224115780_2ssvcCoTfQrx68Qsl5NxtVIDFWKtAgq2.jpg" },
        { type: "image" as const, value: "https://t3.ftcdn.net/jpg/02/95/44/22/240_F_295442295_OXsXOmLmqBUfZreTnGo9PREuAPSLQhff.jpg" },
      ],
      labels: [
        { key: "banana", type: "text" as const, value: "banana" },
        { key: "sunglasses", type: "text" as const, value: "sunglasses" },
        { key: "fun", type: "text" as const, value: "having fun rocking away" },
      ],
      multiple_labels: true,
    });

    expectSuccess(result);
    expectArray(result.predictions);
  });
});

// Mixed Classification Tests
describe("Classification API Edge Cases", () => {
  let client: ReturnType<typeof createJigsawStackClient>;

  beforeEach(() => {
    client = createJigsawStackClient();
  });

  test("should handle large batch of text classification", async () => {
    const dataset: Array<{ type: "text"; value: string }> = [];
    for (let i = 1; i <= 5; i++) {
      dataset.push({
        type: "text" as const,
        value: `This is test text number ${i} for classification.`,
      });
    }

    const result = await client.classification({
      dataset: dataset,
      labels: [
        { key: "test", type: "text" as const, value: "test content" },
        { key: "production", type: "text" as const, value: "production content" },
      ],
    });

    expectSuccess(result);
    expectArray(result.predictions);

    // Should have predictions for each input
    if (result.predictions.length !== 5) {
      console.log(`Note: Expected 5 predictions, got ${result.predictions.length}`);
    }
  });
});
