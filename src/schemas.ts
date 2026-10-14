import { z } from "zod";

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase words joined by hyphens");

/** One language version of a document, as returned inside `localizations`. */
export const localizationSchema = z.object({
  documentId: z.string().min(1),
  locale: z.string().min(2),
  slug,
  publishedAt: z.iso.datetime({ offset: true }).nullable(),
});

/** A Strapi v5 article. v5 identifies documents by `documentId`, not by numeric `id`. */
export const articleSchema = z.object({
  documentId: z.string().min(1),
  locale: z.string().min(2),
  slug,
  title: z.string().min(1),
  summary: z.string().nullable().default(null),
  publishedAt: z.iso.datetime({ offset: true }).nullable(),
  localizations: z.array(localizationSchema).default([]),
});

export type Article = z.infer<typeof articleSchema>;
export type Localization = z.infer<typeof localizationSchema>;

export const paginationSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  pageCount: z.number().int().min(0),
  total: z.number().int().min(0),
});

/** Wraps any item schema in Strapi's `{ data, meta }` collection envelope. */
export function collectionSchema<T extends z.ZodType>(item: T) {
  return z.object({
    data: z.array(item),
    meta: z.object({ pagination: paginationSchema }),
  });
}
