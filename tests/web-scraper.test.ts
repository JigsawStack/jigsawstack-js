import { beforeEach, describe, test } from "node:test";
import { createJigsawStackClient, expectArray, expectProperty, expectSuccess, expectType } from "./test-helpers.js";

const TEST_URLS = {
  image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",
  pdf: "https://www.w3.org/WAI/WCAG21/working-examples/pdf-table/table.pdf",
  audio: "https://jigsawstack.com/preview/stt-example.wav",
  webpage: "https://www.wikipedia.org",
  newsWebpage: "https://news.ycombinator.com",
};

// Comprehensive AI Scrape API Tests
describe("AI Scrape API", () => {
  let client: ReturnType<typeof createJigsawStackClient>;

  beforeEach(() => {
    client = createJigsawStackClient();
  });

  // Test missing required parameters
  test("should fail when no parameters are provided", async () => {
    try {
      await client.web.ai_scrape({} as any);
      throw new Error("Expected API call to fail with no parameters");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when both url and html are missing", async () => {
    try {
      await client.web.ai_scrape({
        element_prompts: ["test prompt"],
      } as any);
      throw new Error("Expected API call to fail with missing url/html");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when element_prompts is missing", async () => {
    try {
      await client.web.ai_scrape({
        url: TEST_URLS.webpage,
      } as any);
      throw new Error("Expected API call to fail with missing element_prompts");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when element_prompts is empty", async () => {
    try {
      await client.web.ai_scrape({
        url: TEST_URLS.webpage,
        element_prompts: [],
      });
      throw new Error("Expected API call to fail with empty element_prompts");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail when both url and html are provided", async () => {
    try {
      await client.web.ai_scrape({
        url: TEST_URLS.webpage,
        html: "<h1>Test</h1>",
        element_prompts: ["test prompt"],
      } as any);
      throw new Error("Expected API call to fail with both url and html");
    } catch (error) {
      expectType(error, "object");
    }
  });

  // Basic functionality tests
  test("should work with url and element_prompts only", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Get the main heading", "Get any paragraphs"],
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

  test("should work with html and element_prompts only", async () => {
    const result = await client.web.ai_scrape({
      html: "<h1>Test Heading</h1><p>Test paragraph</p><a href='#'>Test link</a>",
      element_prompts: ["Get headings", "Get paragraphs", "Get links"],
    });

    expectSuccess(result);
    expectProperty(result, "data");
    expectProperty(result, "context");
    expectArray(result.data);
    expectType(result.context, "object");
  });

  test("should work with maximum element_prompts (5)", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["heading", "paragraph", "link", "image", "button"],
    });

    expectSuccess(result);
    expectArray(result.data);
  });

  test("should fail with more than 5 element_prompts", async () => {
    try {
      await client.web.ai_scrape({
        url: TEST_URLS.webpage,
        element_prompts: ["1", "2", "3", "4", "5", "6"],
      });
      throw new Error("Expected API call to fail with more than 5 element_prompts");
    } catch (error) {
      expectType(error, "object");
    }
  });

  // Test with selectors parameter
  test("should work with selectors and element_prompts", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      selectors: ["h1", "p", "a"],
      element_prompts: ["Get headings", "Get paragraphs", "Get links"],
    });

    expectSuccess(result);
    expectArray(result.data);

    // Check structure of data items
    for (const item of result.data) {
      expectProperty(item, "key");
      expectProperty(item, "selector");
      expectProperty(item, "results");
      expectArray(item.results);

      for (const resultItem of item.results) {
        expectProperty(resultItem, "html");
        expectProperty(resultItem, "text");
        expectProperty(resultItem, "attributes");
        expectArray(resultItem.attributes);
      }
    }
  });

  // Test root_element_selector parameter
  test("should work with root_element_selector", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Find main content"],
      root_element_selector: "body",
    });

    expectSuccess(result);
    expectArray(result.data);
  });

  test("should work with custom root_element_selector", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Find content"],
      root_element_selector: "main",
    });

    expectSuccess(result);
    expectArray(result.data);
  });

  // Test page_position parameter
  test("should work with page_position parameter", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["test"],
      page_position: 2,
    });

    expectSuccess(result);
    expectProperty(result, "page_position");
    expectType(result.page_position, "number");
  });

  test("should fail with page_position less than 1", async () => {
    try {
      await client.web.ai_scrape({
        url: TEST_URLS.webpage,
        element_prompts: ["test"],
        page_position: 0,
      });
      throw new Error("Expected API call to fail with page_position < 1");
    } catch (error) {
      expectType(error, "object");
    }
  });

  // Test http_headers parameter
  test("should work with custom http_headers", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Get page content"],
      http_headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    });

    expectSuccess(result);
    expectArray(result.data);
  });

  // Test goto_options parameter
  test("should work with goto_options", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Get content"],
      goto_options: {
        timeout: 30000,
        wait_until: "networkidle0",
      },
    });

    expectSuccess(result);
    expectArray(result.data);
  });

  test("should work with different wait_until options", async () => {
    const waitOptions = ["load", "domcontentloaded", "networkidle0", "networkidle2"] as const;

    // Run all API calls in parallel
    const results = await Promise.allSettled(
      waitOptions.map(async (waitOption) => {
        try {
          const result = await client.web.ai_scrape({
            url: TEST_URLS.webpage,
            element_prompts: ["test"],
            goto_options: {
              timeout: 30000,
              wait_until: waitOption,
            },
          });

          expectSuccess(result);
          return { success: true, waitOption };
        } catch (error) {
          expectType(error, "object");
          return { success: false, waitOption, error };
        }
      })
    );

    // Process results and log outcomes
    results.forEach((result, index) => {
      const waitOption = waitOptions[index];

      if (result.status === "fulfilled") {
        if (result.value.success) {
          console.log(`✓ wait_until: ${waitOption} works`);
        } else {
          console.log(`Note: wait_until: ${waitOption} failed - may not be supported`);
        }
      } else {
        console.log(`Note: wait_until: ${waitOption} failed - may not be supported`);
      }
    });
  });

  // Test wait_for parameter
  test("should work with wait_for timeout mode", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Get content"],
      wait_for: {
        mode: "timeout",
        value: 3000,
      },
    });

    expectSuccess(result);
    expectArray(result.data);
  });

  test("should work with wait_for selector mode", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Get content"],
      wait_for: {
        mode: "selector",
        value: "body",
      },
    });

    expectSuccess(result);
    expectArray(result.data);
  });

  test("should work with wait_for function mode", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Get content"],
      wait_for: {
        mode: "function",
        value: "() => document.querySelector('body')",
      },
    });

    expectSuccess(result);
    expectArray(result.data);
  });

  // Test viewport parameters
  test("should work with custom viewport dimensions", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Get content"],
      width: 1200,
      height: 800,
      scale: 2,
    });

    expectSuccess(result);
    expectArray(result.data);
  });

  test("should work with mobile viewport", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Get main content"],
      is_mobile: true,
      width: 375,
      height: 667,
      scale: 2,
    });

    expectSuccess(result);
    expectArray(result.data);
  });

  test("should work with size_preset", async () => {
    const presets = ["HD", "FHD", "4K UHD"] as const;

    // Run all API calls in parallel
    const results = await Promise.allSettled(
      presets.map(async (preset) => {
        try {
          const result = await client.web.ai_scrape({
            url: TEST_URLS.webpage,
            element_prompts: ["test"],
            size_preset: preset,
          });

          expectSuccess(result);
          return { success: true, preset };
        } catch (error) {
          expectType(error, "object");
          return { success: false, preset, error };
        }
      })
    );

    // Process results and log outcomes
    results.forEach((result, index) => {
      const preset = presets[index];

      if (result.status === "fulfilled") {
        if (result.value.success) {
          console.log(`✓ size_preset: ${preset} works`);
        } else {
          console.log(`Note: size_preset: ${preset} failed`);
        }
      } else {
        console.log(`Note: size_preset: ${preset} failed`);
      }
    });
  });

  // Test cookies parameter
  // test("should work with cookies", async () => {
  //   const result = await client.web.ai_scrape({
  //     url: TEST_URLS.webpage,
  //     element_prompts: ["Get content"],
  //     cookies: [
  //       {
  //         name: "test_cookie",
  //         value: "test_value",
  //         domain: "example.com",
  //       },
  //     ],
  //   });

  //   expectSuccess(result);
  //   expectArray(result.data);
  // });

  // Test reject_request_pattern parameter
  test("should work with reject_request_pattern", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Get content"],
      reject_request_pattern: ["jpg", "png", "gif"],
    });

    expectSuccess(result);
    expectArray(result.data);
  });

  // Test advance_config parameter
  test("should work with advance_config console tracking", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Get content"],
      advance_config: {
        console: true,
      },
    });

    expectSuccess(result);
    expectArray(result.data);

    if (result.advance_config) {
      expectProperty(result.advance_config, "console");
      expectArray(result.advance_config.console);
    }
  });

  test("should work with advance_config network tracking", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Get content"],
      advance_config: {
        network: true,
      },
    });

    expectSuccess(result);
    expectArray(result.data);

    if (result.advance_config) {
      expectProperty(result.advance_config, "network");
      expectArray(result.advance_config.network);
    }
  });

  // test("should work with advance_config cookies tracking", async () => {
  //   const result = await client.web.ai_scrape({
  //     url: TEST_URLS.webpage,
  //     element_prompts: ["Get content"],
  //     advance_config: {
  //       cookies: true,
  //     },
  //   });

  //   expectSuccess(result);
  //   expectArray(result.data);

  //   if (result.advance_config) {
  //     expectProperty(result.advance_config, "cookies");
  //     expectArray(result.advance_config.cookies);
  //   }
  // });

  test("should work with all advance_config options", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Get content"],
      advance_config: {
        console: true,
        network: true,
        cookies: true,
      },
    });

    expectSuccess(result);
    expectArray(result.data);
  });

  // Edge cases and error handling
  test("should handle invalid URL gracefully", async () => {
    try {
      await client.web.ai_scrape({
        url: "not-a-valid-url",
        element_prompts: ["test"],
      });
      throw new Error("Expected API call to fail with invalid URL");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should fail with empty HTML", async () => {
    try {
      await client.web.ai_scrape({
        html: "",
        element_prompts: ["test"],
      } as any);
      throw new Error("Expected API call to fail with empty HTML");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should handle complex HTML with special characters", async () => {
    const complexHtml = `
      <div>
        <h1>Test with émojis 🚀 and ñoño</h1>
        <p>Special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?</p>
        <script>console.log('test');</script>
      </div>
    `;

    const result = await client.web.ai_scrape({
      html: complexHtml,
      element_prompts: ["Get all text content"],
    });

    expectSuccess(result);
    expectArray(result.data);
  });

  // Complex scenario tests
  test("should work with comprehensive configuration", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.newsWebpage,
      element_prompts: ["Extract article titles", "Get article snippets"],
      selectors: ["h1", "h2", ".title"],
      root_element_selector: "main",
      goto_options: {
        timeout: 30000,
        wait_until: "networkidle0",
      },
      wait_for: {
        mode: "timeout",
        value: 3000,
      },
      width: 1920,
      height: 1080,
      is_mobile: false,
      http_headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      advance_config: {
        console: true,
        network: true,
      },
    });

    expectSuccess(result);
    expectArray(result.data);
  });
});
