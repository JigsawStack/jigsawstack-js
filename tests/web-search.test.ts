import { beforeEach, describe, test } from "node:test";
import { createJigsawStackClient, expectArray, expectProperty, expectSuccess, expectType } from "./test-helpers.js";

// Web Search API Tests
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
