# multilingual-content-kit

Small, strictly typed helpers for publishing one story in several languages from a headless CMS.

I run a newsroom that publishes every piece in Turkish, Kurmanji Kurdish and English on Next.js and Strapi v5. The same three problems come up on every page:

1. **The CMS response must be trusted only after it is checked.** A renamed field or a bad slug should fail loudly at the boundary, not deep inside a React component.
2. **A reader may ask for a language that is not published yet.** The page should fall back along a defined chain and say that it did.
3. **Search engines need correct alternates.** Each language has its own translated slug, drafts must not leak into `hreflang`, and `x-default` should point at the default edition.

This repository solves those three problems in isolation. It is written from scratch as a public sample; the production code it is based on stays private.

## What is inside

| Module | Purpose |
|---|---|
| `schemas.ts` | Zod schemas for Strapi v5 articles (`documentId`, not numeric `id`), their localizations and the `{ data, meta }` envelope. |
| `locales.ts` | `defineLocales` validates the locale setup once at startup; `fallbackChain` gives the order to try. |
| `resolve.ts` | `resolveTranslation` picks the best published version and reports whether it is a fallback. |
| `alternates.ts` | `buildAlternates` returns `hreflang` links with each language's own slug, plus `x-default`. |
| `client.ts` | A read-only client that returns typed errors (`network`, `http`, `invalid-json`, `validation`) instead of throwing. |

## Usage

```ts
import { buildAlternates, createContentClient, defineLocales, resolveTranslation, rootDefaultPrefix } from "multilingual-content-kit";

const locales = defineLocales({
  locales: ["tr", "ku", "en"],
  defaultLocale: "tr",
  fallbacks: { ku: ["tr"], en: ["tr"] },
});

const cms = createContentClient({ baseUrl: process.env.CMS_URL ?? "", token: process.env.CMS_TOKEN });

const result = await cms.articleBySlug("two-banks-of-the-river", "en");
if (!result.ok) {
  // result.error is a discriminated union: handle "http" 404 differently from "validation"
  throw new Error(`CMS request failed: ${result.error.kind}`);
}

const article = result.value;
if (article) {
  const alternates = buildAlternates(locales, { origin: "https://example.com", prefix: rootDefaultPrefix }, article);
  // [{ hreflang: "tr", href: "https://example.com/..." }, { hreflang: "ku", ... }, { hreflang: "x-default", ... }]
}
```

## Design choices

- **Strict TypeScript.** `strict`, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are on. There is no `any`; unknown data is `unknown` until Zod has parsed it.
- **Errors are values.** Expected failures come back as a `Result`, so callers cannot forget the unhappy path. Configuration mistakes (an unknown fallback locale, a locale that falls back to itself) throw immediately, because they are programmer errors.
- **Validation messages keep their path.** A failure reads like `data.0.slug: slug must be lowercase words joined by hyphens`, which is what you want in a log.
- **No framework lock-in.** The helpers are plain functions; they work in Next.js route handlers, server components or a build script.

## Development

```bash
npm install
npm run verify   # tsc --noEmit + tests
npm run build
```

Tests use the built-in Node test runner and cover locale validation, fallback resolution, alternate links and every client error path.

## License

MIT © Kadir Can
