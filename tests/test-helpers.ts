// tests/test-helpers.ts - Fix the client structure
import Audio from "../src/audio/audio";
import Classification from "../src/classification/index";
import General from "../src/general/index";
import { RequestClient } from "../src/request";
import Validate from "../src/validate/index";
import Vision from "../src/vision/vision";
import Web from "../src/web/web";

export function createJigsawStackClient() {
  const apiKey = process.env.JIGSAWSTACK_API_KEY;

  if (!apiKey) {
    throw new Error("JIGSAWSTACK_API_KEY environment variable is required for testing");
  }

  const client = new RequestClient({ apiKey });

  return {
    // General APIs
    sentiment: (params: any) => new General(client).sentiment(params),
    translate: {
      text: (params: any) => new General(client).translate.text(params),
      image: (params: any) => new General(client).translate.image(params),
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
    web: new Web(client),

    // Classification APIs
    classification: new Classification(client),

    // Validation APIs
    validate: new Validate(client),
  };
}

export function expectSuccess(result: any): void {
  if (!result || result.success !== true) {
    throw new Error(`Expected successful response with success: true, got: ${JSON.stringify(result)}`);
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
