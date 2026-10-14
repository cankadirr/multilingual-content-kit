import { z } from "zod";
import { err, ok, type Result } from "./result.js";
import { articleSchema, collectionSchema, type Article } from "./schemas.js";

export type ClientError =
  | { readonly kind: "network"; readonly message: string }
  | { readonly kind: "http"; readonly status: number }
  | { readonly kind: "invalid-json" }
  | { readonly kind: "validation"; readonly issues: readonly string[] };

export type ClientOptions = {
  readonly baseUrl: string;
  readonly token?: string | undefined;
  readonly fetch?: typeof globalThis.fetch | undefined;
};

const articleCollection = collectionSchema(articleSchema);

/**
 * A small read-only client. It never throws for expected failures: network errors,
 * HTTP errors, broken JSON and schema mismatches all come back as typed `ClientError`s.
 */
export function createContentClient(options: ClientOptions) {
  const doFetch = options.fetch ?? globalThis.fetch;
  const base = options.baseUrl.replace(/\/+$/, "");

  async function getJson<T>(path: string, schema: z.ZodType<T>): Promise<Result<T, ClientError>> {
    let response: Response;
    try {
      response = await doFetch(`${base}${path}`, {
        headers: options.token ? { Authorization: `Bearer ${options.token}` } : {},
      });
    } catch (cause) {
      return err({ kind: "network", message: cause instanceof Error ? cause.message : String(cause) });
    }
    if (!response.ok) return err({ kind: "http", status: response.status });

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return err({ kind: "invalid-json" });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return err({
        kind: "validation",
        issues: parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
      });
    }
    return ok(parsed.data);
  }

  return {
    /** Fetches every locale version of an article by its slug in one locale. */
    async articleBySlug(slug: string, locale: string): Promise<Result<Article | null, ClientError>> {
      const params = new URLSearchParams({
        "filters[slug][$eq]": slug,
        locale,
        "populate[localizations][fields][0]": "slug",
        "populate[localizations][fields][1]": "locale",
        "populate[localizations][fields][2]": "publishedAt",
        "populate[localizations][fields][3]": "documentId",
      });
      const result = await getJson(`/api/articles?${params.toString()}`, articleCollection);
      if (!result.ok) return result;
      return ok(result.value.data[0] ?? null);
    },
  };
}
