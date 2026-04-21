import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Stitcher } from "../../src/audio/live/stitcher";

describe("Stitcher", () => {
  test("returns current text when there is no previous transcript", () => {
    const s = new Stitcher();
    assert.equal(s.preview("hello world"), "hello world");
    assert.equal(s.commit("hello world"), "hello world");
  });

  test("strips exact-match token overlap between commits", () => {
    const s = new Stitcher();
    s.commit("the quick brown fox jumps");
    const out = s.commit("brown fox jumps over the lazy dog");
    assert.equal(out, "over the lazy dog");
  });

  test("preview does not mutate state", () => {
    const s = new Stitcher();
    s.commit("hello world");
    s.preview("world there");
    const out = s.commit("world there");
    assert.equal(out, "there");
  });

  test("fuzzy match handles single-character substitution on long tokens", () => {
    const s = new Stitcher();
    s.commit("the quick brown foxes");
    const out = s.commit("foxxs jumped high");
    assert.equal(out, "jumped high");
  });

  test("fuzzy match handles single insertion/deletion on long tokens", () => {
    const s = new Stitcher();
    s.commit("hello international world");
    const out = s.commit("internationl world, how are you");
    assert.equal(out, ", how are you");
  });

  test("no overlap returns current unchanged", () => {
    const s = new Stitcher();
    s.commit("one two three");
    const out = s.commit("apple banana cherry");
    assert.equal(out, "apple banana cherry");
  });

  test("empty inputs are handled", () => {
    const s = new Stitcher();
    assert.equal(s.preview(""), "");
    s.commit("hello");
    assert.equal(s.commit(""), "");
  });

  test("returns empty string when current is entirely overlap", () => {
    const s = new Stitcher();
    s.commit("hello world foo bar");
    const out = s.commit("foo bar");
    assert.equal(out, "");
  });

  test("reset clears state", () => {
    const s = new Stitcher();
    s.commit("previous");
    s.reset();
    assert.equal(s.commit("previous again"), "previous again");
  });
});
