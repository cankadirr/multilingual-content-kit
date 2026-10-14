import { fallbackChain, type LocaleConfig } from "./locales.js";
import type { Article } from "./schemas.js";

export type Resolved = {
  readonly article: Article;
  readonly servedLocale: string;
  readonly isFallback: boolean;
};

/**
 * Picks the best published version of a document for a reader.
 * `versions` are the same document in different locales; drafts are ignored.
 */
export function resolveTranslation<L extends string>(
  config: LocaleConfig<L>,
  versions: readonly Article[],
  requested: L,
): Resolved | null {
  const published = new Map(
    versions.filter((v) => v.publishedAt !== null).map((v) => [v.locale, v] as const),
  );
  for (const locale of fallbackChain(config, requested)) {
    const article = published.get(locale);
    if (article) {
      return { article, servedLocale: locale, isFallback: locale !== requested };
    }
  }
  return null;
}
