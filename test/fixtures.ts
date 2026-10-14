import { defineLocales } from "../src/locales.js";
import type { Article } from "../src/schemas.js";

export const locales = defineLocales({
  locales: ["tr", "ku", "en"],
  defaultLocale: "tr",
  fallbacks: { ku: ["tr"], en: ["tr"] },
});

const at = "2026-01-15T09:00:00.000Z";

export const trArticle: Article = {
  documentId: "doc1",
  locale: "tr",
  slug: "nehrin-iki-yakasi",
  title: "Nehrin iki yakası",
  summary: null,
  publishedAt: at,
  localizations: [
    { documentId: "doc1", locale: "ku", slug: "du-aliyen-cem", publishedAt: at },
    { documentId: "doc1", locale: "en", slug: "two-banks-of-the-river", publishedAt: null },
  ],
};

export const kuArticle: Article = { ...trArticle, locale: "ku", slug: "du-aliyen-cem", title: "Du aliyên çem" };
export const enDraft: Article = { ...trArticle, locale: "en", slug: "two-banks-of-the-river", title: "Two banks of the river", publishedAt: null };

export function strapiEnvelope(data: unknown[]) {
  return { data, meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: data.length } } };
}
