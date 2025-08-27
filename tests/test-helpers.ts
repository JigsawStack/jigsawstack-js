// tests/test-helpers.ts - Fix the client structure
import { JigsawStack } from "jigsawstack";

export function createJigsawStackClient() {
  const apiKey = process.env.JIGSAWSTACK_API_KEY;

  if (!apiKey) {
    throw new Error("JIGSAWSTACK_API_KEY environment variable is required for testing");
  }

  return JigsawStack({ apiKey });
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
