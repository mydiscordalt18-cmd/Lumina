import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AddonManifest, ContentItem, Track, Album, Artist, Playlist } from '../types';

interface ReaderState {
  addons: AddonManifest[];
  history: { id: string; title: string; type: 'book' | 'manga'; timestamp: number; cover?: string }[];
  favorites: ContentItem[];
  
  // Music-specific state
  musicHistory: { id: string; title: string; artist: string; timestamp: number; cover?: string; type: 'track' | 'album' | 'playlist' }[];
  musicFavorites: (Track | Album | Artist | Playlist)[];
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  queueIndex: number;
  
  // Actions
  addAddon: (addon: AddonManifest) => void;
  removeAddon: (id: string) => void;
  addToHistory: (item: { id: string; title: string; type: 'book' | 'manga', cover?: string }) => void;
  toggleFavorite: (item: ContentItem) => void;
  isFavorite: (id: string) => boolean;
  
  // Music actions
  addToMusicHistory: (item: { id: string; title: string; artist: string; type: 'track' | 'album' | 'playlist'; cover?: string }) => void;
  toggleMusicFavorite: (item: Track | Album | Artist | Playlist) => void;
  isMusicFavorite: (id: string) => boolean;
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setQueue: (queue: Track[]) => void;
  setQueueIndex: (index: number) => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      addons: [],
      history: [],
      favorites: [],
      
      // Music state
      musicHistory: [],
      musicFavorites: [],
      currentTrack: null,
      isPlaying: false,
      volume: 1,
      queue: [],
      queueIndex: 0,
      
      // Existing actions
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
      
      // Music actions
      addToMusicHistory: (item) => set((state) => {
        const newHistory = [
          { ...item, timestamp: Date.now() },
          ...state.musicHistory.filter(h => h.id !== item.id)
        ].slice(0, 50);
        return { musicHistory: newHistory };
      }),
      toggleMusicFavorite: (item) => set((state) => {
        const exists = state.musicFavorites.some(f => f.id === item.id);
        if (exists) {
          return { musicFavorites: state.musicFavorites.filter(f => f.id !== item.id) };
        }
        return { musicFavorites: [...state.musicFavorites, item] };
      }),
      isMusicFavorite: (id) => get().musicFavorites.some(f => f.id === id),
      setCurrentTrack: (track) => set({ currentTrack: track }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setVolume: (volume) => set({ volume }),
      setQueue: (queue) => set({ queue }),
      setQueueIndex: (index) => set({ queueIndex: index }),
      playNext: () => set((state) => {
        const nextIndex = state.queueIndex + 1;
        if (nextIndex < state.queue.length) {
          return { 
            queueIndex: nextIndex,
            currentTrack: state.queue[nextIndex]
          };
        }
        return state;
      }),
      playPrevious: () => set((state) => {
        const prevIndex = state.queueIndex - 1;
        if (prevIndex >= 0) {
          return { 
            queueIndex: prevIndex,
            currentTrack: state.queue[prevIndex]
          };
        }
        return state;
      }),
    }),
    {
      name: 'lumina-reader-storage',
    }
  )
);
