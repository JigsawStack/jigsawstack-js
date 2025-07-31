import { z } from "zod";
import { BaseConfig } from "../types";
import { SupportedAccents } from "./audio/interfaces";
import { JigsawStack } from "./core";
import { tool } from "./vercel-tool";

export interface JigsawStackToolOptions {
  tools?: string[];
}

export class JigsawStackToolSet {
  private jigsawStack: ReturnType<typeof JigsawStack>;

  constructor(config?: BaseConfig) {
    this.jigsawStack = JigsawStack(config);
  }

  async getTools(options: JigsawStackToolOptions = {}) {
    const { tools: requestedTools = [] } = options;
    const availableTools = this.getAllTools();

    if (requestedTools.length === 0) {
      return availableTools; // Return ALL tools
    }

    // Return only requested tools
    const result: Record<string, any> = {};
    for (const toolName of requestedTools) {
      if (availableTools[toolName]) {
        result[toolName] = availableTools[toolName];
      }
    }
    return result;
  }

  private getAllTools() {
    return {
      // ========== GENERAL TOOLS ==========
      sentiment: tool({
        description: "Analyze sentiment and emotion from text",
        parameters: z.object({
          text: z.string().describe("The text to analyze sentiment for"),
        }),
        execute: async ({ text }) => {
          return await this.jigsawStack.sentiment({ text });
        },
      }),

      summary: tool({
        description: "Summarize text content",
        parameters: z.object({
          text: z.string().optional().describe("Text to summarize (max 300,000 characters)"),
          url: z.string().optional().describe("PDF URL to summarize"),
          file_store_key: z.string().optional().describe("File store key for uploaded file"),
          max_characters: z.number().optional().describe("Maximum characters in summary"),
        }),
        execute: async ({ text, url, file_store_key, max_characters }) => {
          return await this.jigsawStack.summary({
            text,
            url,
            file_store_key,
            type: "text",
            max_characters,
          });
        },
      }),

      translate_text: tool({
        description: "Translate text from one language to another",
        parameters: z.object({
          text: z.string().describe("The text to translate"),
          target_language: z.string().describe('Target language code (e.g., "en", "es", "fr")'),
          current_language: z.string().optional().describe("Current language code (auto-detected if not provided)"),
        }),
        execute: async ({ text, target_language, current_language }) => {
          return await this.jigsawStack.translate.text({
            text,
            target_language,
            current_language,
          });
        },
      }),

      translate_image: tool({
        description: "Translate text in images from one language to another",
        parameters: z.object({
          url: z.string().optional().describe("URL of the image to translate"),
          file_store_key: z.string().optional().describe("File store key of uploaded image"),
          target_language: z.string().describe('Target language code (e.g., "en", "es", "fr")'),
        }),
        execute: async ({ url, file_store_key, target_language }) => {
          if (url) {
            return await this.jigsawStack.translate.image({
              url,
              target_language,
              return_type: "url",
            });
          } else if (file_store_key) {
            return await this.jigsawStack.translate.image({
              file_store_key,
              target_language,
              return_type: "url",
            });
          }

          return {
            success: true,
            message: `Successfully translated image to ${target_language}`,
            target_language,
            note: "Image has been translated. Use jigsawStack.translate.image() directly to get the binary data.",
          };
        },
      }),

      embedding: tool({
        description: "Generate embeddings for text, images, audio, or PDF content",
        parameters: z.object({
          text: z.string().optional().describe("Text to generate embeddings for"),
          url: z.string().optional().describe("URL of content to generate embeddings for"),
          file_store_key: z.string().optional().describe("File store key of uploaded content"),
          type: z.enum(["text", "text-other", "image", "audio", "pdf"]).describe("Type of content"),
          token_overflow_mode: z.enum(["truncate", "error"]).optional().describe("How to handle token overflow"),
        }),
        execute: async ({ text, url, file_store_key, type, token_overflow_mode }) => {
          return await this.jigsawStack.embedding({
            text,
            url,
            file_store_key,
            type,
            token_overflow_mode,
          });
        },
      }),

      prediction: tool({
        description: "Make predictions based on historical data",
        parameters: z.object({
          dataset: z
            .array(
              z.object({
                value: z.union([z.number(), z.string()]).describe("Data value"),
                date: z.string().describe("Date in string format"),
              })
            )
            .describe("Historical dataset for prediction"),
          steps: z.number().describe("Number of prediction steps"),
        }),
        execute: async ({ dataset, steps }) => {
          return await this.jigsawStack.prediction({
            dataset: dataset as { value: string | number; date: string }[],
            steps,
          });
        },
      }),

      text_to_sql: tool({
        description: "Convert natural language to SQL queries",
        parameters: z.object({
          prompt: z.string().describe("Natural language description of the SQL query needed"),
          sql_schema: z.string().optional().describe("Database schema (optional)"),
          file_store_key: z.string().optional().describe("File store key for schema file"),
          database: z.enum(["postgresql", "mysql", "sqlite"]).optional().describe("Database type"),
        }),
        execute: async ({ prompt, sql_schema, file_store_key, database }) => {
          if (file_store_key) {
            return await this.jigsawStack.text_to_sql({
              prompt,
              file_store_key,
              database,
            });
          } else if (sql_schema) {
            return await this.jigsawStack.text_to_sql({
              prompt,
              sql_schema,
              database,
            });
          } else {
            return await this.jigsawStack.text_to_sql({
              prompt,
              database,
            });
          }
        },
      }),

      // ========== WEB TOOLS ==========
      ai_scrape: tool({
        description: "Scrape and extract data from websites using AI",
        parameters: z.object({
          url: z.string().describe("URL to scrape"),
          element_prompts: z.array(z.string()).describe("Prompts describing what to extract from the webpage"),
          selectors: z.array(z.string()).optional().describe("CSS selectors to extract"),
          root_element_selector: z.string().optional().describe("Root element selector to limit scraping scope"),
        }),
        execute: async ({ url, element_prompts, selectors, root_element_selector }) => {
          return await this.jigsawStack.web.ai_scrape({
            url,
            element_prompts,
            selectors,
            root_element_selector,
          });
        },
      }),

      html_to_any: tool({
        description: "Convert HTML content to various formats (PDF, PNG, etc.)",
        parameters: z.object({
          html: z.string().optional().describe("HTML content to convert"),
          url: z.string().optional().describe("URL of webpage to convert"),
          type: z.string().optional().describe("Output format type"),
          width: z.number().optional().describe("Output width"),
          height: z.number().optional().describe("Output height"),
          full_page: z.boolean().optional().describe("Capture full page"),
        }),
        execute: async ({ html, url, type, width, height, full_page }) => {
          await this.jigsawStack.web.html_to_any({
            html,
            url,
            type,
            width,
            height,
            full_page,
          });

          return {
            success: true,
            message: "Successfully converted HTML content",
            format: type || "default",
            note: "Content has been converted. Use jigsawStack.web.html_to_any() directly to get the binary data.",
          };
        },
      }),

      web_search: tool({
        description: "Search the web and get AI-powered results",
        parameters: z.object({
          query: z.string().describe("Search query"),
          safe_search: z.enum(["strict", "moderate", "off"]).default("moderate"),
        }),
        execute: async ({ query, safe_search }) => {
          return await this.jigsawStack.web.search({
            query,
            safe_search,
            ai_overview: false,
            auto_scrape: false,
          });
        },
      }),

      search_suggestions: tool({
        description: "Get search suggestions for a query",
        parameters: z.object({
          query: z.string().describe("Query to get suggestions for"),
        }),
        execute: async ({ query }) => {
          return await this.jigsawStack.web.search_suggestions(query);
        },
      }),

      // ========== VISION TOOLS ==========
      vocr: tool({
        description: "Extract text from images using Vision OCR",
        parameters: z.object({
          prompt: z.union([z.string(), z.array(z.string())]).describe("Prompt(s) for text extraction"),
          url: z.string().optional().describe("URL of image to process"),
          file_store_key: z.string().optional().describe("File store key of uploaded image"),
          page_range: z.array(z.number()).optional().describe("Page range for PDF files"),
        }),
        execute: async ({ prompt, url, file_store_key, page_range }) => {
          if (url) {
            return await this.jigsawStack.vision.vocr({
              prompt,
              url,
              page_range,
            });
          } else if (file_store_key) {
            return await this.jigsawStack.vision.vocr({
              prompt,
              file_store_key,
              page_range,
            });
          }
        },
      }),

      object_detection: tool({
        description: "Detect objects in images",
        parameters: z.object({
          url: z.string().optional().describe("URL of image to analyze"),
          file_store_key: z.string().optional().describe("File store key of uploaded image"),
        }),
        execute: async ({ url, file_store_key }) => {
          if (url) {
            return await this.jigsawStack.vision.object_detection({
              url,
              return_type: "url",
            });
          } else if (file_store_key) {
            return await this.jigsawStack.vision.object_detection({
              file_store_key,
              return_type: "url",
            });
          }
        },
      }),

      // ========== AUDIO TOOLS ==========
      speech_to_text: tool({
        description: "Convert speech/audio to text",
        parameters: z.object({
          url: z.string().optional().describe("URL of audio file"),
          file_store_key: z.string().optional().describe("File store key of uploaded audio"),
          language: z.string().optional().describe("Language code for transcription"),
          translate: z.boolean().optional().describe("Translate to English"),
          by_speaker: z.boolean().optional().describe("Separate by speaker"),
        }),
        execute: async ({ url, file_store_key, language, translate, by_speaker }) => {
          return await this.jigsawStack.audio.speech_to_text({
            url,
            file_store_key,
            language,
            translate,
            by_speaker,
          });
        },
      }),

      text_to_speech: tool({
        description: "Convert text to speech",
        parameters: z.object({
          text: z.string().describe("Text to convert to speech"),
          accent: z.string().optional().describe("Voice accent (see JigsawStack docs for supported accents)"),
          voice_clone_id: z.string().optional().describe("ID of cloned voice to use"),
        }),
        execute: async ({ text, accent, voice_clone_id }) => {
          await this.jigsawStack.audio.text_to_speech({
            text,
            accent: accent as SupportedAccents,
            voice_clone_id,
          });

          return {
            success: true,
            message: "Successfully converted text to speech",
            text_length: text.length,
            accent_used: accent || "default",
            note: "Audio has been generated. Use jigsawStack.audio.text_to_speech() directly to get the binary data.",
          };
        },
      }),

      // ========== VALIDATION TOOLS ==========
      nsfw_detection: tool({
        description: "Detect NSFW (Not Safe For Work) content in images",
        parameters: z.object({
          url: z.string().optional().describe("URL of image to check"),
          file_store_key: z.string().optional().describe("File store key of uploaded image"),
        }),
        execute: async ({ url, file_store_key }) => {
          return await this.jigsawStack.validate.nsfw({
            url,
            file_store_key,
          });
        },
      }),

      profanity_check: tool({
        description: "Check and filter profanity in text",
        parameters: z.object({
          text: z.string().describe("Text to check for profanity"),
          censor_replacement: z.string().optional().default("*").describe("Character to replace profanity with"),
        }),
        execute: async ({ text, censor_replacement }) => {
          return await this.jigsawStack.validate.profanity({
            text,
            censor_replacement,
          });
        },
      }),

      spell_check: tool({
        description: "Check spelling and get auto-corrected text",
        parameters: z.object({
          text: z.string().describe("Text to spell check"),
          language_code: z.string().optional().default("en").describe("Language code for spell checking"),
        }),
        execute: async ({ text, language_code }) => {
          return await this.jigsawStack.validate.spellcheck({
            text,
            language_code,
          });
        },
      }),

      spam_check: tool({
        description: "Check if text content is spam",
        parameters: z.object({
          text: z.string().describe("Text to check for spam"),
        }),
        execute: async ({ text }) => {
          return await this.jigsawStack.validate.spamcheck(text);
        },
      }),
    };
  }
}
