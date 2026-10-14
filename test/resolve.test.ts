import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveTranslation } from "../src/resolve.js";
import { enDraft, kuArticle, locales, trArticle } from "./fixtures.js";

describe("resolveTranslation", () => {
  it("serves the requested locale when it is published", () => {
    const result = resolveTranslation(locales, [trArticle, kuArticle], "ku");
    assert.equal(result?.servedLocale, "ku");
    assert.equal(result?.isFallback, false);
  });

  it("falls back to the default locale when the translation is still a draft", () => {
    const result = resolveTranslation(locales, [trArticle, kuArticle, enDraft], "en");
    assert.equal(result?.servedLocale, "tr");
    assert.equal(result?.isFallback, true);
    assert.equal(result?.article.slug, "nehrin-iki-yakasi");
  });

  it("returns null when nothing in the chain is published", () => {
    assert.equal(resolveTranslation(locales, [enDraft], "en"), null);
  });
});
