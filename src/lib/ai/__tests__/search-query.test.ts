import test from "node:test";
import assert from "node:assert/strict";
import {
  buildLocalSearchQuery,
  buildSearchQuery,
  extractSearchTokens,
  hasNewSignificantTokens,
} from "../search-query.ts";
import type { UIMessage } from "ai";

test("extractSearchTokens should keep marathon entity in chinese questions", () => {
  const tokens = extractSearchTokens("你跑过哪些马拉松？");

  assert.ok(tokens.includes("马拉松"));
  assert.ok(!tokens.includes("哪些"));
});

test("buildSearchQuery should normalize conjunctions and punctuation", () => {
  const query = buildSearchQuery("长沙和珠海马拉松呢？");

  const tokenSet = new Set(query.split(/\s+/).filter(Boolean));
  assert.ok(tokenSet.has("长沙"));
  assert.ok(tokenSet.has("珠海"));
  assert.ok(tokenSet.has("马拉松"));
});

test("hasNewSignificantTokens should detect topic shifts", () => {
  assert.equal(hasNewSignificantTokens("长沙 珠海 马拉松", "跑步 马拉松"), true);
  assert.equal(hasNewSignificantTokens("马拉松 跑步", "跑步 马拉松"), false);
});

test("buildLocalSearchQuery should use latest user message", () => {
  const messages: Array<Omit<UIMessage, "id">> = [
    {
      role: "user",
      parts: [{ type: "text", text: "你跑过哪些马拉松？" }],
    },
    {
      role: "assistant",
      parts: [{ type: "text", text: "我跑过几场。" }],
    },
    {
      role: "user",
      parts: [{ type: "text", text: "长沙和珠海马拉松呢？" }],
    },
  ];

  const query = buildLocalSearchQuery(messages);
  const tokenSet = new Set(query.split(/\s+/).filter(Boolean));
  assert.ok(tokenSet.has("长沙"));
  assert.ok(tokenSet.has("珠海"));
  assert.ok(tokenSet.has("马拉松"));
});
