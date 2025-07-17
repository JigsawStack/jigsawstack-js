import { test, describe } from "node:test";
import { createJigsawStackClient, expectSuccess, expectProperty, expectType, expectArray, TEST_URLS } from "./test-helpers.js";

describe("Vision APIs", () => {
  test("vision OCR with single prompt", async () => {
    const client = createJigsawStackClient();
    const result = await client.vision.vocr({
      prompt: "Extract all text from this image",
      url: TEST_URLS.image,
    });

    expectSuccess(result);
    expectProperty(result, "context");
    expectProperty(result, "has_text");
    expectProperty(result, "sections");
    expectProperty(result, "width");
    expectProperty(result, "height");
    expectProperty(result, "tags");

    expectType(result.has_text, "boolean");
    expectType(result.width, "number");
    expectType(result.height, "number");
    expectType(result.context, "string");
    expectArray(result.sections);
    expectArray(result.tags);
  });

  test("vision OCR with multiple prompts", async () => {
    const client = createJigsawStackClient();
    const result = await client.vision.vocr({
      prompt: ["Extract any text you can see", "Describe what is in the image", "Find any numbers or symbols"],
      url: TEST_URLS.image,
    });

    expectSuccess(result);
    expectProperty(result, "context");
    expectProperty(result, "has_text");
    expectProperty(result, "sections");
    expectType(result.has_text, "boolean");
    expectArray(result.sections);
  });

  test("vision OCR with PDF and page range", async () => {
    const client = createJigsawStackClient();
    const result = await client.vision.vocr({
      prompt: "Extract text from this PDF page",
      url: TEST_URLS.pdf,
      page_range: [1],
    });

    expectSuccess(result);
    expectProperty(result, "context");
    expectProperty(result, "has_text");
    expectProperty(result, "sections");
    expectType(result.has_text, "boolean");

    // For PDFs, should have total_pages and page_range info
    if (result.total_pages !== undefined) {
      expectType(result.total_pages, "number");
    }
    if (result.page_range !== undefined) {
      expectArray(result.page_range);
    }
  });

  test("object detection basic", async () => {
    const client = createJigsawStackClient();
    const result = await client.vision.object_detection({
      url: TEST_URLS.image,
    });

    expectType(result, "object");
    // Object detection may or may not find objects, so we just verify the structure
    // The response can have objects, gui_elements, and/or annotated_image properties
  });

  test("object detection with features specified", async () => {
    const client = createJigsawStackClient();
    const result = await client.vision.object_detection({
      url: TEST_URLS.image,
      features: ["object_detection"],
    });

    expectType(result, "object");
    // When features are specified, check for the corresponding properties
    if (result.objects !== undefined) {
      expectArray(result.objects);
    }
  });

  test("object detection with GUI features", async () => {
    const client = createJigsawStackClient();
    const result = await client.vision.object_detection({
      url: TEST_URLS.image,
      features: ["gui"],
    });

    expectType(result, "object");
    // When GUI features are requested, check for gui_elements
    if (result.gui_elements !== undefined) {
      expectArray(result.gui_elements);
    }
  });

  test("object detection with annotated image", async () => {
    const client = createJigsawStackClient();
    const result = await client.vision.object_detection({
      url: TEST_URLS.image,
      features: ["object_detection"],
      annotated_image: true,
      return_type: "url",
    });

    expectType(result, "object");
    // When annotated_image is true and objects are found, should include annotated_image
    if (result.annotated_image !== undefined) {
      expectType(result.annotated_image, "string");
    }
  });

  test("object detection with custom prompts", async () => {
    const client = createJigsawStackClient();
    const result = await client.vision.object_detection({
      url: TEST_URLS.image,
      prompts: ["Find any circular objects", "Look for text elements"],
    });

    expectType(result, "object");
    // With custom prompts, the response structure may vary
  });
});
