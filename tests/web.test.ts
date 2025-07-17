import { test, describe } from "node:test";
import { createJigsawStackClient, expectSuccess, expectProperty, expectType, expectArray, TEST_URLS } from "./test-helpers.js";

describe("Web APIs", () => {
  test("AI scrape with element prompts only", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Get the main heading", "Get any paragraphs", "Find any links"],
    });

    expectSuccess(result);
    expectProperty(result, "data");
    expectProperty(result, "page_position");
    expectProperty(result, "page_position_length");
    expectProperty(result, "context");
    expectProperty(result, "selectors");
    expectProperty(result, "link");

    expectArray(result.data);
    expectType(result.page_position, "number");
    expectType(result.page_position_length, "number");
    expectType(result.context, "object");
    expectType(result.selectors, "object");
    expectArray(result.link);
  });

  test("AI scrape with selectors and prompts", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      selectors: ["h1", "p", "a"],
      element_prompts: ["Get headings", "Get paragraphs", "Get links"],
    });

    expectSuccess(result);
    expectProperty(result, "data");
    expectArray(result.data);

    // Check structure of data items
    for (const item of result.data) {
      expectProperty(item, "key");
      expectProperty(item, "selector");
      expectProperty(item, "results");
      expectArray(item.results);

      // Check structure of results
      for (const resultItem of item.results) {
        expectProperty(resultItem, "html");
        expectProperty(resultItem, "text");
        expectProperty(resultItem, "attributes");
        expectArray(resultItem.attributes);
      }
    }
  });

  test("AI scrape with advanced options", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.ai_scrape({
      url: TEST_URLS.newsWebpage,
      element_prompts: ["Extract article titles", "Get article snippets"],
      goto_options: {
        timeout: 30000,
        wait_until: "networkidle",
      },
      wait_for: {
        mode: "timeout",
        value: 3000,
      },
      width: 1920,
      height: 1080,
      is_mobile: false,
    });

    expectSuccess(result);
    expectProperty(result, "data");
    expectArray(result.data);
  });

  test("AI scrape with mobile viewport", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Get main content"],
      is_mobile: true,
      width: 375,
      height: 667,
      scale: 2,
    });

    expectSuccess(result);
    expectProperty(result, "data");
    expectArray(result.data);
  });

  test("AI scrape with custom headers", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Get page content"],
      http_headers: {
        "User-Agent": "JigsawStack-Test-Bot/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    expectSuccess(result);
    expectProperty(result, "data");
    expectArray(result.data);
  });

  test("AI scrape with root element selector", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      root_element_selector: "body",
      element_prompts: ["Find main content within body"],
    });

    expectSuccess(result);
    expectProperty(result, "data");
    expectArray(result.data);
  });

  test("HTML to PDF conversion", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.html_to_any({
      html: "<h1>Test HTML Document</h1><p>This is a test paragraph with some content.</p>",
      type: "pdf",
    });

    // HTML to any returns a file choice object
    expectProperty(result, "blob");
    expectType(result.blob, "function");
    expectProperty(result, "buffer");
    expectType(result.buffer, "function");
    expectProperty(result, "file");
    expectType(result.file, "function");
  });

  test("HTML to PNG conversion", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.html_to_any({
      html: '<div style="width:200px;height:100px;background:blue;color:white;padding:20px;">Test Image</div>',
      type: "png",
      width: 800,
      height: 600,
    });

    // HTML to any returns a file choice object
    expectProperty(result, "blob");
    expectType(result.blob, "function");
  });

  test("URL to PDF conversion", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.html_to_any({
      url: TEST_URLS.webpage,
      type: "pdf",
      full_page: true,
    });

    // HTML to any returns a file choice object
    expectProperty(result, "blob");
    expectType(result.blob, "function");
  });

  test("HTML to image with options", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.html_to_any({
      html: '<h1 style="color:red;">Styled Content</h1>',
      type: "png",
      width: 1200,
      height: 800,
      quality: 90,
      scale: 2,
      omit_background: false,
    });

    // HTML to any returns a file choice object
    expectProperty(result, "blob");
    expectType(result.blob, "function");
  });

  test("HTML conversion with goto options", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.html_to_any({
      url: TEST_URLS.webpage,
      type: "png",
      goto_options: {
        timeout: 20000,
        wait_until: "domcontentloaded",
      },
    });

    // HTML to any returns a file choice object
    expectProperty(result, "blob");
    expectType(result.blob, "function");
  });
});
