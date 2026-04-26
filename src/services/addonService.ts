import { AddonManifest, SearchResponse, ReadResponse, ContentItemSchema } from '../types';

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

  static async read(addon: AddonManifest, id: string): Promise<ReadResponse> {
    const response = await fetch(`${addon.baseURL}/read/${id}`);
    if (!response.ok) throw new Error('Failed to fetch read content');
    return await response.json();
  }

  static async getDetails(addon: AddonManifest, type: string, id: string) {
    const response = await fetch(`${addon.baseURL}/${type}/${id}`);
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
}
