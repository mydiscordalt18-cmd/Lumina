import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useReaderStore } from '../store/useReaderStore';
import { AddonService, MetadataService } from '../services/addonService';
import { Search as SearchIcon, Play, Pause, SkipBack, SkipForward, Volume2, Music as MusicIcon, Album as AlbumIcon, User, ListMusic, Loader2, Grid3x3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Track, Album, Artist, Playlist } from '../types';

export default function MusicPage() {
  const { addons, currentTrack, isPlaying, setCurrentTrack, setIsPlaying, addToMusicHistory, toggleMusicFavorite, isMusicFavorite } = useReaderStore();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'tracks' | 'albums' | 'artists' | 'playlists'>('all');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Filter music addons only
  const musicAddons = addons.filter(addon => addon.contentType === 'music');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['music-search', debouncedQuery, musicAddons.map(a => a.id)],
    queryFn: async () => {
      if (!debouncedQuery) return null;
      const allResults = await Promise.all(
        musicAddons.map(addon => AddonService.musicSearch(addon, debouncedQuery))
      );
      return allResults.reduce((acc, current) => ({
        tracks: [...(acc.tracks || []), ...(current.tracks || [])],
        albums: [...(acc.albums || []), ...(current.albums || [])],
        artists: [...(acc.artists || []), ...(current.artists || [])],
        playlists: [...(acc.playlists || []), ...(current.playlists || [])],
      }), { tracks: [], albums: [], artists: [], playlists: [] });
    },
    enabled: !!debouncedQuery && musicAddons.length > 0,
  });

  const categories = [
    { id: 'all', name: 'All', icon: Grid3x3 },
    { id: 'tracks', name: 'Tracks', icon: MusicIcon },
    { id: 'albums', name: 'Albums', icon: AlbumIcon },
    { id: 'artists', name: 'Artists', icon: User },
    { id: 'playlists', name: 'Playlists', icon: ListMusic },
  ] as const;

  const getDisplayResults = () => {
    if (!results) return [];
    if (activeTab === 'all') {
      return [
        ...results.tracks.map((item: any) => ({ ...item, type: 'tracks' })),
        ...results.albums.map((item: any) => ({ ...item, type: 'albums' })),
        ...results.artists.map((item: any) => ({ ...item, type: 'artists' })),
        ...results.playlists.map((item: any) => ({ ...item, type: 'playlists' })),
      ];
    }
    return results[activeTab]?.map((item: any) => ({ ...item, type: activeTab })) || [];
  };

  const displayResults = getDisplayResults();

  const handlePlayTrack = async (track: Track) => {
    try {
      // Find the addon that provided this track
      const addon = musicAddons[0]; // For demo, use first addon
      
      // Get stream URL if not already provided
      let streamUrl = track.streamURL;
      if (!streamUrl) {
        const streamResponse = await AddonService.stream(addon, track.id);
        streamUrl = streamResponse.url;
      }

      // Create enhanced track with stream URL
      const enhancedTrack = { ...track, streamURL: streamUrl };
      
      setCurrentTrack(enhancedTrack);
      setIsPlaying(true);
      
      // Add to history
      addToMusicHistory({
        id: track.id,
        title: track.title,
        artist: track.artist,
        type: 'track',
        cover: track.artworkURL,
      });
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      {/* Search Input */}
      <div className="relative group max-w-3xl mx-auto">
        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for music, artists, albums..."
          className="w-full pl-14 pr-4 py-5 glass-card text-text placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 transition-all text-base"
        />
        {isLoading && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-3xl mx-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap",
              activeTab === cat.id 
                ? "text-primary bg-primary/10" 
                : "text-text-muted hover:text-text hover:bg-surface"
            )}
          >
            <cat.icon className="w-4 h-4" />
            {cat.name}
            {results && cat.id !== 'all' && results[cat.id]?.length > 0 && (
              <span className="text-xs text-text-muted">({results[cat.id].length})</span>
            )}
            {results && cat.id === 'all' && displayResults.length > 0 && (
              <span className="text-xs text-text-muted">({displayResults.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="min-h-[400px]">
        {musicAddons.length === 0 ? (
          <div className="text-center py-32 space-y-4">
            <h2 className="text-4xl font-bold text-text-muted/10">No Music Sources</h2>
            <p className="text-text-muted/50 text-base">Add Eclipse Music addons to start streaming music</p>
          </div>
        ) : !debouncedQuery ? (
          <div className="text-center py-32 space-y-4">
            <h2 className="text-4xl font-bold text-text-muted/10">Discover Music</h2>
            <p className="text-text-muted/50 text-base">Search for tracks, albums, and artists</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <div key={activeTab}>
              {displayResults.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {activeTab === 'all' ? (
                    <div className="space-y-8">
                      {results?.tracks && results.tracks.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-text-muted">Tracks</h3>
                          {results.tracks.slice(0, 5).map((track: Track) => (
                            <TrackCard 
                              key={track.id} 
                              track={track} 
                              onPlay={() => handlePlayTrack(track)}
                              isPlaying={currentTrack?.id === track.id && isPlaying}
                              isFavorite={isMusicFavorite(track.id)}
                              onToggleFavorite={() => toggleMusicFavorite(track)}
                            />
                          ))}
                        </div>
                      )}
                      
                      {results?.albums && results.albums.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-text-muted">Albums</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {results.albums.slice(0, 6).map((album: Album) => (
                              <AlbumCard key={album.id} album={album} />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {results?.artists && results.artists.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-text-muted">Artists</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {results.artists.slice(0, 6).map((artist: Artist) => (
                              <ArtistCard key={artist.id} artist={artist} />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {results?.playlists && results.playlists.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-text-muted">Playlists</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {results.playlists.slice(0, 6).map((playlist: Playlist) => (
                              <PlaylistCard key={playlist.id} playlist={playlist} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {activeTab === 'tracks' && results?.tracks && (
                        <div className="space-y-2">
                          {results.tracks.map((track: Track) => (
                            <TrackCard 
                              key={track.id} 
                              track={track} 
                              onPlay={() => handlePlayTrack(track)}
                              isPlaying={currentTrack?.id === track.id && isPlaying}
                              isFavorite={isMusicFavorite(track.id)}
                              onToggleFavorite={() => toggleMusicFavorite(track)}
                            />
                          ))}
                        </div>
                      )}
                      
                      {activeTab === 'albums' && results?.albums && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                          {results.albums.map((album: Album) => (
                            <AlbumCard key={album.id} album={album} />
                          ))}
                        </div>
                      )}
                      
                      {activeTab === 'artists' && results?.artists && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                          {results.artists.map((artist: Artist) => (
                            <ArtistCard key={artist.id} artist={artist} />
                          ))}
                        </div>
                      )}
                      
                      {activeTab === 'playlists' && results?.playlists && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                          {results.playlists.map((playlist: Playlist) => (
                            <PlaylistCard key={playlist.id} playlist={playlist} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-32"
                >
                  <p className="text-text-muted/50 text-base">No results found for "{debouncedQuery}"</p>
                </motion.div>
              )}
            </div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

function TrackCard({ track, onPlay, isPlaying, isFavorite, onToggleFavorite }: {
  track: Track;
  onPlay: () => void;
  isPlaying: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-surface/40 border-l border-line hover:border-gold hover:bg-gold/[0.03] transition-all group">
      <button
        onClick={onPlay}
        className="w-12 h-12 rounded-sm bg-gold/10 border border-gold/30 flex items-center justify-center hover:bg-gold/20 transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-gold" />
        ) : (
          <Play className="w-5 h-5 text-gold ml-0.5" />
        )}
      </button>
      
      <div className="w-12 h-12 rounded-sm bg-surface border border-line overflow-hidden shrink-0">
        {track.artworkURL ? (
          <img src={track.artworkURL} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MusicIcon className="w-5 h-5 text-muted/20" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-ink text-sm group-hover:text-gold transition-colors truncate">
          {track.title}
        </h3>
        <p className="text-sm text-text-muted truncate">{track.artist}</p>
        {track.album && (
          <p className="text-sm text-text-muted/60 truncate">{track.album}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {track.duration && (
          <span className="text-sm text-text-muted">
            {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
          </span>
        )}
        <button
          onClick={onToggleFavorite}
          className={cn(
            "p-2 transition-colors",
            isFavorite ? "text-gold" : "text-muted hover:text-gold"
          )}
        >
          <MusicIcon className={cn("w-4 h-4", isFavorite && "fill-current")} />
        </button>
      </div>
    </div>
  );
}

function AlbumCard({ album }: { album: Album }) {
  return (
    <div className="group block">
      <div className="aspect-square relative border border-line shadow-lg group-hover:shadow-[0_20px_40px_rgba(212,175,55,0.1)] transition-all duration-500 overflow-hidden">
        {album.artworkURL ? (
          <img 
            src={album.artworkURL} 
            alt={album.title} 
            className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface">
            <AlbumIcon className="w-8 h-8 text-muted/20" />
          </div>
        )}
        <div className="content-tag absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          Album
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="font-bold text-ink text-sm group-hover:text-gold transition-colors line-clamp-1">
          {album.title}
        </h3>
        <p className="text-sm text-text-muted line-clamp-1">{album.artist}</p>
        {album.year && (
          <p className="text-sm text-text-muted/60">{album.year}</p>
        )}
      </div>
    </div>
  );
}

function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <div className="group block">
      <div className="aspect-square relative border border-line shadow-lg group-hover:shadow-[0_20px_40px_rgba(212,175,55,0.1)] transition-all duration-500 overflow-hidden rounded-full">
        {artist.artworkURL ? (
          <img 
            src={artist.artworkURL} 
            alt={artist.name} 
            className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface">
            <User className="w-8 h-8 text-muted/20" />
          </div>
        )}
      </div>
      <div className="mt-4 text-center">
        <h3 className="font-bold text-ink text-sm group-hover:text-gold transition-colors line-clamp-1">
          {artist.name}
        </h3>
        {artist.genres && artist.genres.length > 0 && (
          <p className="text-sm text-text-muted line-clamp-1">{artist.genres.join(', ')}</p>
        )}
      </div>
    </div>
  );
}

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <div className="group block">
      <div className="aspect-square relative border border-line shadow-lg group-hover:shadow-[0_20px_40px_rgba(212,175,55,0.1)] transition-all duration-500 overflow-hidden">
        {playlist.artworkURL ? (
          <img 
            src={playlist.artworkURL} 
            alt={playlist.title} 
            className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface">
            <ListMusic className="w-8 h-8 text-muted/20" />
          </div>
        )}
        <div className="content-tag absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          Playlist
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="font-bold text-ink text-sm group-hover:text-gold transition-colors line-clamp-1">
          {playlist.title}
        </h3>
        <p className="text-sm text-text-muted line-clamp-1">{playlist.creator}</p>
        {playlist.trackCount && (
          <p className="text-sm text-text-muted/60">{playlist.trackCount} tracks</p>
        )}
      </div>
    </div>
  );
}