export { defineLocales, fallbackChain, isLocale, type LocaleConfig } from "./locales.js";
export {
  articleSchema,
  collectionSchema,
  localizationSchema,
  paginationSchema,
  type Article,
  type Localization,
} from "./schemas.js";
export { resolveTranslation, type Resolved } from "./resolve.js";
export { articleUrl, buildAlternates, rootDefaultPrefix, type Alternate, type UrlOptions } from "./alternates.js";
export { createContentClient, type ClientError, type ClientOptions } from "./client.js";
export { err, ok, type Err, type Ok, type Result } from "./result.js";
