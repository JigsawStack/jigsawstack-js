import { test, describe } from "node:test";
import { createJigsawStackClient, expectSuccess, expectProperty, expectType, expectArray } from "./test-helpers.js";

describe("Search APIs", () => {
  test("basic web search", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.search({
      query: "artificial intelligence",
      safe_search: "moderate",
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
      expectProperty(searchResult, "title");
      expectProperty(searchResult, "url");
      expectProperty(searchResult, "description");
      expectProperty(searchResult, "content");
      expectProperty(searchResult, "is_safe");
      expectProperty(searchResult, "site_name");
      expectProperty(searchResult, "language");

      expectType(searchResult.title, "string");
      expectType(searchResult.url, "string");
      expectType(searchResult.description, "string");
      expectType(searchResult.is_safe, "boolean");
    }
  });

  test("web search with AI overview", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.search({
      query: "machine learning basics",
      safe_search: "moderate",
      ai_overview: true,
    });

    expectSuccess(result);
    expectProperty(result, "query");
    expectProperty(result, "results");
    expectArray(result.results);

    // AI overview may or may not be present
    if (result.ai_overview !== undefined) {
      expectType(result.ai_overview, "string");
    }
  });

  test("web search with spell check", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.search({
      query: "artifical inteligence", // intentionally misspelled
      safe_search: "moderate",
      spell_check: true,
    });

    expectSuccess(result);
    expectProperty(result, "query");
    expectProperty(result, "results");
    expectProperty(result, "spell_fixed");
    expectArray(result.results);
    expectType(result.spell_fixed, "boolean");
  });

  test("web search with country code", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.search({
      query: "news today",
      safe_search: "moderate",
      country_code: "US",
    });

    expectSuccess(result);
    expectProperty(result, "query");
    expectProperty(result, "results");
    expectArray(result.results);
  });

  test("web search with strict safe search", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.search({
      query: "family friendly content",
      safe_search: "strict",
    });

    expectSuccess(result);
    expectProperty(result, "query");
    expectProperty(result, "results");
    expectProperty(result, "is_safe");
    expectArray(result.results);
    expectType(result.is_safe, "boolean");
  });

  test("web search with auto scrape", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.search({
      query: "weather today",
      safe_search: "moderate",
      auto_scrape: true,
    });

    expectSuccess(result);
    expectProperty(result, "query");
    expectProperty(result, "results");
    expectArray(result.results);

    // When auto_scrape is enabled, results may have additional content
    for (const searchResult of result.results) {
      expectProperty(searchResult, "content");
      expectType(searchResult.content, "string");
    }
  });

  test("web search with custom URLs", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.search({
      query: "programming tutorials",
      safe_search: "moderate",
      byo_urls: ["https://stackoverflow.com", "https://github.com"],
    });

    expectSuccess(result);
    expectProperty(result, "query");
    expectProperty(result, "results");
    expectArray(result.results);
  });

  test("search suggestions", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.search_suggestions("artificial int");

    expectSuccess(result);
    expectProperty(result, "suggestions");
    expectArray(result.suggestions);

    // Check that suggestions are strings
    for (const suggestion of result.suggestions) {
      expectType(suggestion, "string");
    }
  });

  test("search suggestions for partial query", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.search_suggestions("machine learn");

    expectSuccess(result);
    expectProperty(result, "suggestions");
    expectArray(result.suggestions);

    if (result.suggestions.length > 0) {
      // Suggestions should contain the partial query
      const hasMatchingSuggestion = result.suggestions.some((suggestion) => suggestion.toLowerCase().includes("machine learn"));
      if (!hasMatchingSuggestion) {
        // This is not a strict requirement, so we'll just log it
        console.log("Note: No matching suggestions found for partial query");
      }
    }
  });

  test("search suggestions for empty string", async () => {
    const client = createJigsawStackClient();
    const result = await client.web.search_suggestions("");

    expectSuccess(result);
    expectProperty(result, "suggestions");
    expectArray(result.suggestions);
    // Empty query may return empty suggestions or popular queries
  });
});
