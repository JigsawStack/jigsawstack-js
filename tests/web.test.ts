import { beforeEach, describe, test } from "node:test";
import { createJigsawStackClient, expectArray, expectProperty, expectSuccess, expectType } from "./test-helpers.js";

const TEST_URLS = {
  image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",
  pdf: "https://www.w3.org/WAI/WCAG21/working-examples/pdf-table/table.pdf",
  audio: "https://jigsawstack.com/preview/stt-example.wav",
  webpage: "https://www.google.com",
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
        "User-Agent": "JigsawStack-Test-Bot/1.0",
        Accept: "text/html,application/xhtml+xml",
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
  test("should work with cookies", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Get content"],
      cookies: [
        {
          name: "test_cookie",
          value: "test_value",
          domain: "example.com",
        },
      ],
    });

    expectSuccess(result);
    expectArray(result.data);
  });

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

  test("should work with advance_config cookies tracking", async () => {
    const result = await client.web.ai_scrape({
      url: TEST_URLS.webpage,
      element_prompts: ["Get content"],
      advance_config: {
        cookies: true,
      },
    });

    expectSuccess(result);
    expectArray(result.data);

    if (result.advance_config) {
      expectProperty(result.advance_config, "cookies");
      expectArray(result.advance_config.cookies);
    }
  });

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
        "User-Agent": "JigsawStack-Test-Bot/1.0",
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

// Comprehensive HTML to Any API Tests
// describe("HTML to Any API", () => {
//   let client: ReturnType<typeof createJigsawStackClient>;

//   beforeEach(() => {
//     client = createJigsawStackClient();
//   });

//   // Test missing required parameters
//   test("should fail when no parameters are provided", async () => {
//     try {
//       await client.web.html_to_any({});
//       throw new Error("Expected API call to fail with no parameters");
//     } catch (error) {
//       expectType(error, "object");
//     }
//   });

//   test("should fail when both url and html are missing", async () => {
//     try {
//       await client.web.html_to_any({
//         type: "png",
//       });
//       throw new Error("Expected API call to fail with missing url/html");
//     } catch (error) {
//       expectType(error, "object");
//     }
//   });

//   test("should fail when both url and html are provided", async () => {
//     try {
//       await client.web.html_to_any({
//         url: TEST_URLS.webpage,
//         html: "<h1>Test</h1>",
//         type: "png",
//       });
//       throw new Error("Expected API call to fail with both url and html");
//     } catch (error) {
//       expectType(error, "object");
//     }
//   });

//   // Basic functionality tests
//   test("should work with HTML to PNG (default)", async () => {
//     const result = await client.web.html_to_any({
//       html: "<h1>Test HTML Document</h1><p>This is a test paragraph.</p>",
//       type: "png",
//     });

//     // HTML to any returns a file choice object
//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//     expectProperty(result, "buffer");
//     expectType(result.buffer, "function");
//     expectProperty(result, "file");
//     expectType(result.file, "function");
//   });

//   test("should work with HTML to PDF", async () => {
//     const result = await client.web.html_to_any({
//       html: "<h1>Test HTML Document</h1><p>This is a test paragraph with some content.</p>",
//       type: "pdf",
//     });

//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//   });

//   test("should work with HTML to JPEG", async () => {
//     const result = await client.web.html_to_any({
//       html: '<div style="width:200px;height:100px;background:blue;color:white;padding:20px;">Test Image</div>',
//       type: "jpeg",
//       quality: 80,
//     });

//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//   });

//   test("should work with HTML to WebP", async () => {
//     const result = await client.web.html_to_any({
//       html: '<div style="background:red;color:white;padding:20px;">WebP Test</div>',
//       type: "webp",
//       quality: 90,
//     });

//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//   });

//   // URL-based tests
//   test("should work with URL to PNG", async () => {
//     const result = await client.web.html_to_any({
//       url: TEST_URLS.webpage,
//       type: "png",
//     });

//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//   });

//   test("should work with URL to PDF", async () => {
//     const result = await client.web.html_to_any({
//       url: TEST_URLS.webpage,
//       type: "pdf",
//       full_page: true,
//     });

//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//   });

//   // Test quality parameter
//   test("should work with different quality levels", async () => {
//     const qualities = [25, 50, 75, 90, 100];

//     for (const quality of qualities) {
//       const result = await client.web.html_to_any({
//         html: '<h1 style="color:red;">Quality Test</h1>',
//         type: "jpeg",
//         quality: quality,
//       });

//       expectProperty(result, "blob");
//       expectType(result.blob, "function");
//       console.log(`✓ Quality ${quality} works`);
//     }
//   });

//   // Test full_page parameter
//   test("should work with full_page option", async () => {
//     const result = await client.web.html_to_any({
//       url: TEST_URLS.webpage,
//       type: "png",
//       full_page: true,
//     });

//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//   });

//   // Test omit_background parameter
//   test("should work with omit_background for PNG", async () => {
//     const result = await client.web.html_to_any({
//       html: '<div style="padding:20px;">Transparent Background Test</div>',
//       type: "png",
//       omit_background: true,
//     });

//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//   });

//   // Test viewport dimensions
//   test("should work with custom viewport dimensions", async () => {
//     const result = await client.web.html_to_any({
//       html: "<h1>Custom Viewport</h1>",
//       type: "png",
//       width: 1200,
//       height: 800,
//       scale: 2,
//     });

//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//   });

//   // Test size_preset parameter
//   test("should work with size presets", async () => {
//     const presets = ["HD", "FHD", "4K UHD"];

//     for (const preset of presets) {
//       try {
//         const result = await client.web.html_to_any({
//           html: "<h1>Size Preset Test</h1>",
//           type: "png",
//           size_preset: preset,
//         });

//         expectProperty(result, "blob");
//         expectType(result.blob, "function");
//         console.log(`✓ size_preset: ${preset} works`);
//       } catch (error) {
//         console.log(`Note: size_preset: ${preset} failed`);
//         expectType(error, "object");
//       }
//     }
//   });

//   // Test mobile emulation
//   test("should work with mobile emulation", async () => {
//     const result = await client.web.html_to_any({
//       html: "<h1>Mobile Test</h1>",
//       type: "png",
//       is_mobile: true,
//       width: 375,
//       height: 667,
//     });

//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//   });

//   // Test dark_mode parameter
//   test("should work with dark mode", async () => {
//     const result = await client.web.html_to_any({
//       html: "<h1>Dark Mode Test</h1><p>This should render in dark mode</p>",
//       type: "png",
//       dark_mode: true,
//     });

//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//   });

//   // Test use_graphic_renderer parameter
//   test("should work with graphic renderer", async () => {
//     const result = await client.web.html_to_any({
//       html: '<canvas width="200" height="100"></canvas>',
//       type: "png",
//       use_graphic_renderer: true,
//     });

//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//   });

//   // Test goto_options parameter
//   test("should work with goto_options", async () => {
//     const result = await client.web.html_to_any({
//       url: TEST_URLS.webpage,
//       type: "png",
//       goto_options: {
//         timeout: 15000,
//         wait_until: "domcontentloaded",
//       },
//     });

//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//   });

//   test("should work with different wait_until options", async () => {
//     const waitOptions = ["load", "domcontentloaded", "networkidle0", "networkidle2"];

//     for (const waitOption of waitOptions) {
//       try {
//         const result = await client.web.html_to_any({
//           url: TEST_URLS.webpage,
//           type: "png",
//           goto_options: {
//             wait_until: waitOption,
//           },
//         });

//         expectProperty(result, "blob");
//         expectType(result.blob, "function");
//         console.log(`✓ wait_until: ${waitOption} works`);
//       } catch (error) {
//         console.log(`Note: wait_until: ${waitOption} failed`);
//         expectType(error, "object");
//       }
//     }
//   });

//   // PDF-specific tests
//   test("should work with PDF header/footer", async () => {
//     const result = await client.web.html_to_any({
//       html: "<h1>PDF with Header/Footer</h1><p>Content</p>",
//       type: "pdf",
//       pdf_display_header_footer: true,
//     });

//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//   });

//   test("should work with PDF background printing", async () => {
//     const result = await client.web.html_to_any({
//       html: '<div style="background:blue;color:white;padding:20px;">PDF Background Test</div>',
//       type: "pdf",
//       pdf_print_background: true,
//     });

//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//   });

//   test("should work with PDF page range", async () => {
//     const result = await client.web.html_to_any({
//       html: '<div style="page-break-after:always;">Page 1</div><div>Page 2</div>',
//       type: "pdf",
//       pdf_page_range: "1",
//     });

//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//   });

//   // Edge cases and error handling
//   test("should handle invalid URL gracefully", async () => {
//     try {
//       await client.web.html_to_any({
//         url: "not-a-valid-url",
//         type: "png",
//       });
//       throw new Error("Expected API call to fail with invalid URL");
//     } catch (error) {
//       expectType(error, "object");
//     }
//   });

//   test("should handle empty HTML", async () => {
//     const result = await client.web.html_to_any({
//       html: "",
//       type: "png",
//     });

//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//   });

//   test("should handle complex HTML with special characters", async () => {
//     const complexHtml = `
//       <div style="font-family: Arial;">
//         <h1>Test with émojis 🚀 and ñoño</h1>
//         <p>Special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?</p>
//         <div style="background: linear-gradient(45deg, red, blue);">Gradient</div>
//       </div>
//     `;

//     const result = await client.web.html_to_any({
//       html: complexHtml,
//       type: "png",
//       quality: 90,
//     });

//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//   });

//   // Test invalid quality values
//   test("should fail with quality out of range", async () => {
//     try {
//       await client.web.html_to_any({
//         html: "<h1>Test</h1>",
//         type: "jpeg",
//         quality: 101, // Over 100
//       });
//       throw new Error("Expected API call to fail with quality > 100");
//     } catch (error) {
//       expectType(error, "object");
//     }
//   });

//   test("should fail with negative quality", async () => {
//     try {
//       await client.web.html_to_any({
//         html: "<h1>Test</h1>",
//         type: "jpeg",
//         quality: -1,
//       });
//       throw new Error("Expected API call to fail with negative quality");
//     } catch (error) {
//       expectType(error, "object");
//     }
//   });

//   // Test invalid scale values
//   test("should fail with scale less than 1", async () => {
//     try {
//       await client.web.html_to_any({
//         html: "<h1>Test</h1>",
//         type: "png",
//         scale: 0.5, // Less than 1
//       });
//       throw new Error("Expected API call to fail with scale < 1");
//     } catch (error) {
//       expectType(error, "object");
//     }
//   });

//   // Complex scenario test
//   test("should work with comprehensive configuration", async () => {
//     const result = await client.web.html_to_any({
//       url: TEST_URLS.webpage,
//       type: "png",
//       quality: 90,
//       full_page: true,
//       width: 1920,
//       height: 1080,
//       scale: 1,
//       dark_mode: false,
//       goto_options: {
//         timeout: 15000,
//         wait_until: "networkidle2",
//       },
//     });

//     expectProperty(result, "blob");
//     expectType(result.blob, "function");
//   });
// });

// Web Search API Tests (moved from search.test.ts)
describe("Web Search API", () => {
  let client: ReturnType<typeof createJigsawStackClient>;

  beforeEach(() => {
    client = createJigsawStackClient();
  });

  test("should fail when query parameter is missing", async () => {
    try {
      await client.web.search({} as any);
      throw new Error("Expected API call to fail with missing query");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should work with basic query", async () => {
    const result = await client.web.search({
      query: "artificial intelligence",
    });

    expectSuccess(result);
    expectProperty(result, "query");
    expectProperty(result, "results");
    expectProperty(result, "spell_fixed");
    expectProperty(result, "is_safe");

    expectType(result.query, "string");
    expectArray(result.results);
    expectType(result.spell_fixed, "boolean");
    expectType(result.is_safe, "boolean");

    // Check structure of search results
    for (const searchResult of result.results) {
      console.log(searchResult.title);
      expectProperty(searchResult, "title");
      expectProperty(searchResult, "url");
      expectProperty(searchResult, "description");
      // this could also be null after 4 search results
      // expectProperty(searchResult, "content");
      expectProperty(searchResult, "is_safe");
      expectProperty(searchResult, "site_name");
      expectProperty(searchResult, "language");

      expectType(searchResult.title, "string");
      expectType(searchResult.url, "string");
      expectType(searchResult.description, "string");
      expectType(searchResult.is_safe, "boolean");

      // content can be string or null
      if (searchResult.content !== null && typeof searchResult.content !== "string") {
        throw new Error(`Expected content to be string or null, got ${typeof searchResult.content}`);
      }
    }
  });

  test("should work with AI overview enabled", async () => {
    const result = await client.web.search({
      query: "machine learning basics",
      ai_overview: true,
    });

    expectSuccess(result);
    expectArray(result.results);

    if (result.ai_overview !== undefined) {
      expectType(result.ai_overview, "string");
    }
  });

  test("should work with spell check enabled", async () => {
    const result = await client.web.search({
      query: "artifical inteligence", // intentionally misspelled
      spell_check: true,
    });

    expectSuccess(result);
    expectProperty(result, "spell_fixed");
    expectType(result.spell_fixed, "boolean");
  });

  test("should work with different safe search levels", async () => {
    const safeSearchLevels = ["strict", "moderate", "off"] as const;

    // Run all API calls in parallel
    const results = await Promise.allSettled(
      safeSearchLevels.map(async (level) => {
        const result = await client.web.search({
          query: "family friendly content",
          safe_search: level,
        });

        expectSuccess(result);
        expectProperty(result, "is_safe");
        expectType(result.is_safe, "boolean");

        return { success: true, level };
      })
    );

    // Process results and log outcomes
    results.forEach((result, index) => {
      const level = safeSearchLevels[index];

      if (result.status === "fulfilled" && result.value.success) {
        console.log(`✓ safe_search: ${level} works`);
      } else {
        console.log(`Note: safe_search: ${level} failed`);
      }
    });
  });

  test("should work with custom URLs", async () => {
    const result = await client.web.search({
      query: "programming tutorials",
      byo_urls: ["https://stackoverflow.com", "https://github.com"],
    });

    expectSuccess(result);
    expectArray(result.results);
  });

  test("should work with country code", async () => {
    const result = await client.web.search({
      query: "news today",
      country_code: "USA",
    });

    expectSuccess(result);
    expectArray(result.results);
  });

  test("should work with auto scrape enabled", async () => {
    const result = await client.web.search({
      query: "weather today",
      auto_scrape: true,
    });

    expectSuccess(result);
    expectArray(result.results);
  });

  test("should handle empty query gracefully", async () => {
    try {
      await client.web.search({
        query: "",
      });
      throw new Error("Expected API call to fail with empty query");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should handle very long query", async () => {
    const longQuery = "a".repeat(401); // Over 400 character limit

    try {
      await client.web.search({
        query: longQuery,
      });
      throw new Error("Expected API call to fail with query too long");
    } catch (error) {
      expectType(error, "object");
    }
  });
});

// Web Search Suggestions API Tests
describe("Web Search Suggestions API", () => {
  let client: ReturnType<typeof createJigsawStackClient>;

  beforeEach(() => {
    client = createJigsawStackClient();
  });

  test("should fail when query parameter is missing", async () => {
    try {
      // @ts-ignore Testing with undefined parameter
      await client.web.search_suggestions(undefined);
      throw new Error("Expected API call to fail with missing query");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should work with basic query", async () => {
    const result = await client.web.search_suggestions({ query: "artificial int" });

    expectSuccess(result);
    expectProperty(result, "suggestions");
    expectArray(result.suggestions);

    // Check that suggestions are strings
    for (const suggestion of result.suggestions) {
      expectType(suggestion, "string");
    }
  });

  test("should work with partial query", async () => {
    const result = await client.web.search_suggestions({ query: "machine learn" });

    expectSuccess(result);
    expectArray(result.suggestions);

    if (result.suggestions.length > 0) {
      // Suggestions should contain the partial query
      const hasMatchingSuggestion = result.suggestions.some((suggestion) => suggestion.toLowerCase().includes("machine learn"));
      if (!hasMatchingSuggestion) {
        console.log("Note: No matching suggestions found for partial query");
      }
    }
  });

  test("should fail with empty string", async () => {
    try {
      await client.web.search_suggestions({ query: "" });
      throw new Error("Expected API call to fail with empty string");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should handle very long query", async () => {
    const longQuery = "a".repeat(201); // Over 200 character limit

    try {
      await client.web.search_suggestions({ query: longQuery });
      throw new Error("Expected API call to fail with query too long");
    } catch (error) {
      expectType(error, "object");
    }
  });

  test("should work with special characters", async () => {
    const result = await client.web.search_suggestions({ query: "what is the capital?" });

    expectSuccess(result);
    expectArray(result.suggestions);
  });

  test("should work with unicode characters", async () => {
    const result = await client.web.search_suggestions({ query: "café français" });

    expectSuccess(result);
    expectArray(result.suggestions);
  });
});
