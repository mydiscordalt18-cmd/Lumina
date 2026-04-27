import { z } from 'zod';

export const AddonResourceSchema = z.enum(['search', 'read', 'book', 'manga', 'author', 'series', 'collection', 'chapter', 'stream', 'album', 'artist', 'playlist']);
export const ContentTypeSchema = z.enum(['book', 'manga', 'music', 'audiobook', 'podcast', 'mixed']);

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

// Music-specific schemas
export const TrackSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  album: z.string().optional(),
  duration: z.number().optional(),
  artworkURL: z.string().url().optional(),
  isrc: z.string().optional(),
  format: z.string().optional(),
  streamURL: z.string().url().optional(),
});

export const AlbumSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  artworkURL: z.string().url().optional(),
  trackCount: z.number().optional(),
  year: z.string().optional(),
  tracks: z.array(TrackSchema).optional(),
});

export const ArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  artworkURL: z.string().url().optional(),
  genres: z.array(z.string()).optional(),
  bio: z.string().optional(),
  topTracks: z.array(TrackSchema).optional(),
  albums: z.array(AlbumSchema).optional(),
});

export const PlaylistSchema = z.object({
  id: z.string(),
  title: z.string(),
  creator: z.string().optional(),
  description: z.string().optional(),
  artworkURL: z.string().url().optional(),
  trackCount: z.number().optional(),
  tracks: z.array(TrackSchema).optional(),
});

export const MusicSearchResponseSchema = z.object({
  tracks: z.array(TrackSchema).optional(),
  albums: z.array(AlbumSchema).optional(),
  artists: z.array(ArtistSchema).optional(),
  playlists: z.array(PlaylistSchema).optional(),
});

export const StreamResponseSchema = z.object({
  url: z.string().url(),
  format: z.string().optional(),
  quality: z.string().optional(),
  expiresAt: z.number().optional(),
});

export type Track = z.infer<typeof TrackSchema>;
export type Album = z.infer<typeof AlbumSchema>;
export type Artist = z.infer<typeof ArtistSchema>;
export type Playlist = z.infer<typeof PlaylistSchema>;
export type MusicSearchResponse = z.infer<typeof MusicSearchResponseSchema>;
export type StreamResponse = z.infer<typeof StreamResponseSchema>;

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
  history: { id: string; title: string; timestamp: number; type: 'book' | 'manga' | 'track' }[];
  favorites: string[]; // List of content IDs
  musicHistory: { id: string; title: string; artist: string; timestamp: number; cover?: string; type: 'track' | 'album' | 'playlist' }[];
  musicFavorites: (Track | Album | Artist | Playlist)[];
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  queueIndex: number;
}
