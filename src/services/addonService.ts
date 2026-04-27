import { AddonManifest, SearchResponse, ReadResponse, ContentItemSchema, MusicSearchResponse, StreamResponse, Track, Album, Artist, Playlist } from '../types';

export class AddonService {
  static async fetchManifest(baseURL: string): Promise<AddonManifest> {
    const response = await fetch(`${baseURL}/manifest.json`);
    if (!response.ok) throw new Error('Failed to fetch manifest');
    const data = await response.json();
    return { ...data, baseURL };
  }

  static async search(addon: AddonManifest, query: string): Promise<SearchResponse> {
    const response = await fetch(`${addon.baseURL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) return {};
    return await response.json();
  }

  static async musicSearch(addon: AddonManifest, query: string): Promise<MusicSearchResponse> {
    const response = await fetch(`${addon.baseURL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) return {};
    return await response.json();
  }

  static async read(addon: AddonManifest, id: string): Promise<ReadResponse> {
    const response = await fetch(`${addon.baseURL}/read/${id}`);
    if (!response.ok) throw new Error('Failed to fetch read content');
    return await response.json();
  }

  static async stream(addon: AddonManifest, id: string): Promise<StreamResponse> {
    const response = await fetch(`${addon.baseURL}/stream/${id}`);
    if (!response.ok) throw new Error('Failed to fetch stream');
    return await response.json();
  }

  static async getDetails(addon: AddonManifest, type: string, id: string) {
    const response = await fetch(`${addon.baseURL}/${type}/${id}`);
    if (!response.ok) return null;
    return await response.json();
  }

  static async getAlbum(addon: AddonManifest, id: string): Promise<Album | null> {
    const response = await fetch(`${addon.baseURL}/album/${id}`);
    if (!response.ok) return null;
    return await response.json();
  }

  static async getArtist(addon: AddonManifest, id: string): Promise<Artist | null> {
    const response = await fetch(`${addon.baseURL}/artist/${id}`);
    if (!response.ok) return null;
    return await response.json();
  }

  static async getPlaylist(addon: AddonManifest, id: string): Promise<Playlist | null> {
    const response = await fetch(`${addon.baseURL}/playlist/${id}`);
    if (!response.ok) return null;
    return await response.json();
  }
}

export class MetadataService {
  static async enrichBook(title: string, author?: string) {
    try {
      const q = `${title}${author ? `+inauthor:${author}` : ''}`;
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=1`);
      const data = await response.json();
      if (data.items?.[0]) {
        const info = data.items[0].volumeInfo;
        return {
          coverURL: info.imageLinks?.thumbnail?.replace('http:', 'https:'),
          description: info.description,
          year: info.publishedDate?.split('-')[0],
          genres: info.categories,
          pageCount: info.pageCount,
        };
      }
    } catch (e) {
      console.error('Metadata enrichment failed', e);
    }
    return null;
  }

  static async enrichMusic(track: { title: string; artist: string; isrc?: string }) {
    try {
      // Use Apple Music API for metadata enrichment
      // Note: This would require Apple Music API key and proper authentication
      // For now, we'll return enhanced metadata structure
      
      if (track.isrc) {
        // If ISRC is available, we could query Apple Music directly
        // This is a placeholder for the actual Apple Music API integration
        return {
          artworkURL: `https://via.placeholder.com/300x300?text=${encodeURIComponent(track.title)}`,
          genres: ['Pop'], // Would come from Apple Music
          lyrics: null, // Would come from Apple Music
          explicit: false,
          releaseDate: '2024',
        };
      }

      // Fallback to search-based enrichment
      const searchQuery = `${track.title} ${track.artist}`;
      // This would be replaced with actual Apple Music API calls
      return {
        artworkURL: `https://via.placeholder.com/300x300?text=${encodeURIComponent(searchQuery)}`,
        genres: ['Unknown'],
        lyrics: null,
        explicit: false,
      };
    } catch (e) {
      console.error('Music metadata enrichment failed', e);
    }
    return null;
  }
}
