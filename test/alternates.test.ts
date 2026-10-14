import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { articleUrl, buildAlternates, rootDefaultPrefix } from "../src/alternates.js";
import { locales, trArticle } from "./fixtures.js";

const options = { origin: "https://example.com/", prefix: rootDefaultPrefix };

describe("articleUrl", () => {
  it("keeps the default locale at the root and prefixes the others", () => {
    assert.equal(articleUrl(locales, options, "tr", "a"), "https://example.com/a");
    assert.equal(articleUrl(locales, options, "ku", "b"), "https://example.com/ku/b");
  });
});

describe("buildAlternates", () => {
  it("uses each language's own slug and adds x-default", () => {
    assert.deepEqual(buildAlternates(locales, options, trArticle), [
      { hreflang: "tr", href: "https://example.com/nehrin-iki-yakasi" },
      { hreflang: "ku", href: "https://example.com/ku/du-aliyen-cem" },
      { hreflang: "x-default", href: "https://example.com/nehrin-iki-yakasi" },
    ]);
  });

  it("skips unpublished translations and unknown locales", () => {
    const withExtra = {
      ...trArticle,
      localizations: [
        ...trArticle.localizations,
        { documentId: "doc1", locale: "de", slug: "zwei-ufer", publishedAt: trArticle.publishedAt },
      ],
    };
    const langs = buildAlternates(locales, options, withExtra).map((a) => a.hreflang);
    assert.deepEqual(langs, ["tr", "ku", "x-default"]);
  });

  it("omits x-default when the default-locale version is not published", () => {
    const kuOnly = { ...trArticle, publishedAt: null };
    const langs = buildAlternates(locales, options, kuOnly).map((a) => a.hreflang);
    assert.deepEqual(langs, ["ku"]);
  });
});
