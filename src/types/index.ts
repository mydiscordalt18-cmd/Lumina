import { z } from 'zod';

export const AddonResourceSchema = z.enum(['search', 'read', 'book', 'manga', 'author', 'series', 'collection', 'chapter']);
export const ContentTypeSchema = z.enum(['book', 'manga', 'mixed']);

export const AddonManifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  icon: z.string().url().optional(),
  resources: z.array(AddonResourceSchema),
  types: z.array(z.string()),
  contentType: z.string(),
  baseURL: z.string().url(), // Internal field for management
});

export type AddonManifest = z.infer<typeof AddonManifestSchema>;

export const ContentItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string().optional(),
  coverURL: z.string().url().optional(),
  description: z.string().optional(),
  genres: z.array(z.string()).optional(),
  year: z.string().optional(),
  language: z.string().optional(),
  format: z.string().optional(),
  status: z.string().optional(),
  readURL: z.string().url().optional(),
  itemCount: z.number().optional(),
  bookCount: z.number().optional(),
  creator: z.string().optional(),
  imageURL: z.string().url().optional(),
});

export type ContentItem = z.infer<typeof ContentItemSchema>;

export const SearchResponseSchema = z.object({
  books: z.array(ContentItemSchema).optional(),
  manga: z.array(ContentItemSchema).optional(),
  authors: z.array(ContentItemSchema).optional(),
  series: z.array(ContentItemSchema).optional(),
  collections: z.array(ContentItemSchema).optional(),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

export const ReadResponseSchema = z.union([
  z.object({
    type: z.literal('book'),
    format: z.string(),
    url: z.string().url(),
  }),
  z.object({
    type: z.literal('manga'),
    pages: z.array(z.string().url()),
  }),
]);

export type ReadResponse = z.infer<typeof ReadResponseSchema>;

export interface AppState {
  addons: AddonManifest[];
  history: { id: string; title: string; timestamp: number; type: 'book' | 'manga' }[];
  favorites: string[]; // List of content IDs
}
