import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AddonManifest, ContentItem } from '../types';

interface ReaderState {
  addons: AddonManifest[];
  history: { id: string; title: string; type: 'book' | 'manga'; timestamp: number; cover?: string }[];
  favorites: ContentItem[];
  addAddon: (addon: AddonManifest) => void;
  removeAddon: (id: string) => void;
  addToHistory: (item: { id: string; title: string; type: 'book' | 'manga', cover?: string }) => void;
  toggleFavorite: (item: ContentItem) => void;
  isFavorite: (id: string) => boolean;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      addons: [],
      history: [],
      favorites: [],
      addAddon: (addon) => set((state) => ({
        addons: [...state.addons.filter(a => a.id !== addon.id), addon]
      })),
      removeAddon: (id) => set((state) => ({
        addons: state.addons.filter(a => a.id !== id)
      })),
      addToHistory: (item) => set((state) => {
        const newHistory = [
          { ...item, timestamp: Date.now() },
          ...state.history.filter(h => h.id !== item.id)
        ].slice(0, 50);
        return { history: newHistory };
      }),
      toggleFavorite: (item) => set((state) => {
        const exists = state.favorites.some(f => f.id === item.id);
        if (exists) {
          return { favorites: state.favorites.filter(f => f.id !== item.id) };
        }
        return { favorites: [...state.favorites, item] };
      }),
      isFavorite: (id) => get().favorites.some(f => f.id === id),
    }),
    {
      name: 'lumina-reader-storage',
    }
  )
);
