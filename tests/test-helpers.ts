// tests/test-helpers.ts - Fix the client structure
import Audio from "../src/audio/audio";
import General from "../src/general/index";
import { RequestClient } from "../src/request";
import Search from "../src/search/search";
import Validate from "../src/validate/index";
import Vision from "../src/vision/vision";
import Web from "../src/web/web";

export function createJigsawStackClient() {
  const apiKey = process.env.JIGSAWSTACK_API_KEY;

  if (!apiKey) {
    throw new Error("JIGSAWSTACK_API_KEY environment variable is required for testing");
  }

  const client = new RequestClient({ apiKey });
  const search = new Search(client);
  const web = new Web(client);

  return {
    // General APIs
    sentiment: (params: any) => new General(client).sentiment(params),
    translate: {
      text: (params: any) => new General(client).translate.text(params),
    },
    summary: (params: any) => new General(client).summary(params),
    embedding: (params: any) => new General(client).embedding(params),
    text_to_sql: (params: any) => new General(client).text_to_sql(params),
    prediction: (params: any) => new General(client).prediction(params),
    image_generation: (params: any) => new General(client).image_generation(params),

    // Audio APIs
    audio: new Audio(client),

    // Vision APIs
    vision: new Vision(client),

    // Web APIs - Include both web scraping AND search
    web: {
      // Web scraping methods
      ai_scrape: (params: any) => web.ai_scrape(params),
      html_to_any: (params: any) => web.html_to_any(params),

      // Search methods (from Search module)
      search: (params: any) => search.search(params),
      search_suggestions: (query: string) => search.suggestion(query),
    },

    // Validation APIs
    validate: new Validate(client),
  };
}

export function expectSuccess(result: any): void {
  if (!result || result.success === false) {
    throw new Error(`Expected successful response, got: ${JSON.stringify(result)}`);
  }
}

export function expectProperty(obj: any, property: string): void {
  if (!(property in obj)) {
    throw new Error(`Expected property '${property}' in response`);
  }
}

export function expectType(value: any, expectedType: string): void {
  const actualType = typeof value;
  if (actualType !== expectedType) {
    throw new Error(`Expected type '${expectedType}', got '${actualType}'`);
  }
}

export function expectArray(value: any): void {
  if (!Array.isArray(value)) {
    throw new Error(`Expected array, got ${typeof value}`);
  }
}

export function expectNonEmpty(value: any): void {
  if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === "string" && value.trim() === "")) {
    throw new Error("Expected non-empty value");
  }
}

// Test data helpers
export const TEST_URLS = {
  image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",
  pdf: "https://www.w3.org/WAI/WCAG21/working-examples/pdf-table/table.pdf",
  audio: "https://jigsawstack.com/preview/stt-example.wav",
  webpage: "https://example.com",
  newsWebpage: "https://news.ycombinator.com",
};

export const TEST_TEXT = {
  simple: "Hello world",
  sentiment: "I love this amazing product! It makes me so happy.",
  profanity: "This is a damn good test",
  misspelled: "Ths is a tst with som mispelled wrods",
  spanish: "Hola mundo, ¿cómo estás?",
  summary:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
};
