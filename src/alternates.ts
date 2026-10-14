import { isLocale, type LocaleConfig } from "./locales.js";
import type { Article } from "./schemas.js";

export type Alternate = { readonly hreflang: string; readonly href: string };

export type UrlOptions = {
  readonly origin: string;
  /** Path segment per locale. The default locale usually lives at the root. */
  readonly prefix: (locale: string, isDefault: boolean) => string;
};

export const rootDefaultPrefix = (locale: string, isDefault: boolean): string =>
  isDefault ? "" : `/${locale}`;

export function articleUrl<L extends string>(
  config: LocaleConfig<L>,
  options: UrlOptions,
  locale: L,
  slug: string,
): string {
  const origin = options.origin.replace(/\/+$/, "");
  return `${origin}${options.prefix(locale, locale === config.defaultLocale)}/${slug}`;
}

/**
 * Builds hreflang alternates from an article and its localizations.
 * Each language keeps its own translated slug. Unpublished or unknown locales are skipped,
 * and `x-default` points at the default-locale version when it exists.
 */
export function buildAlternates<L extends string>(
  config: LocaleConfig<L>,
  options: UrlOptions,
  article: Article,
): Alternate[] {
  const versions = [article, ...article.localizations];
  const seen = new Set<string>();
  const alternates: Alternate[] = [];

  for (const version of versions) {
    if (version.publishedAt === null) continue;
    if (!isLocale(config, version.locale)) continue;
    if (seen.has(version.locale)) continue;
    seen.add(version.locale);
    alternates.push({
      hreflang: version.locale,
      href: articleUrl(config, options, version.locale, version.slug),
    });
  }

  const fallback = alternates.find((a) => a.hreflang === config.defaultLocale);
  if (fallback) alternates.push({ hreflang: "x-default", href: fallback.href });

  return alternates.sort((a, b) => order(config, a.hreflang) - order(config, b.hreflang));
}

function order<L extends string>(config: LocaleConfig<L>, hreflang: string): number {
  if (hreflang === "x-default") return Number.MAX_SAFE_INTEGER;
  return (config.locales as readonly string[]).indexOf(hreflang);
}
