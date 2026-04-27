import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useReaderStore } from '../store/useReaderStore';
import { AddonService, MetadataService } from '../services/addonService';
import { Search as SearchIcon, Play, Pause, SkipBack, SkipForward, Volume2, Music as MusicIcon, Album as AlbumIcon, User, ListMusic, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Track, Album, Artist, Playlist } from '../types';

export default function MusicPage() {
  const { addons, currentTrack, isPlaying, setCurrentTrack, setIsPlaying, addToMusicHistory, toggleMusicFavorite, isMusicFavorite } = useReaderStore();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'tracks' | 'albums' | 'artists' | 'playlists'>('tracks');
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
    { id: 'tracks', name: 'Tracks', icon: MusicIcon },
    { id: 'albums', name: 'Albums', icon: AlbumIcon },
    { id: 'artists', name: 'Artists', icon: User },
    { id: 'playlists', name: 'Playlists', icon: ListMusic },
  ] as const;

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
      className="space-y-10"
    >
      <div className="space-y-2">
        <h1 className="editorial-title text-4xl italic">Music Library</h1>
        <p className="text-text-muted text-sm">
          Searching {musicAddons.length} music sources
        </p>
      </div>

      {musicAddons.length === 0 && (
        <div className="bg-surface border border-line rounded-sm p-8 text-center max-w-2xl mx-auto">
          <MusicIcon className="w-10 h-10 text-gold/20 mx-auto mb-4" />
          <p className="text-primary text-sm font-semibold">No Music Sources Connected</p>
          <p className="text-muted text-sm mt-3 font-light">
            Add Eclipse Music addons to start streaming music.
          </p>
        </div>
      )}

      {musicAddons.length > 0 && (
        <>
          {/* Search Input */}
          <div className="relative group max-w-2xl">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/40 group-focus-within:text-gold transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH FOR MUSIC, ARTISTS, ALBUMS..."
              className="w-full pl-12 pr-4 py-4 bg-surface border border-line rounded-sm focus:outline-none focus:border-gold transition-all text-xs font-mono text-gold placeholder:text-gold/20 tracking-wider"
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-gold" />
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-8 overflow-x-auto pb-4 border-b border-line scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={cn(
                  "flex items-center gap-2 pb-2 text-sm font-medium transition-all relative",
                  activeTab === cat.id 
                    ? "text-gold after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1px] after:bg-gold" 
                    : "text-muted hover:text-ink"
                )}
              >
                {cat.name}
                {results && results[cat.id]?.length > 0 && (
                  <span className="text-xs text-text-muted">({results[cat.id].length})</span>
                )}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="min-h-[400px]">
            {!debouncedQuery ? (
              <div className="text-center py-32 space-y-4">
                <h2 className="editorial-title text-3xl opacity-20">Discover Music</h2>
                <p className="text-text-muted text-base">Search for tracks, albums, and artists</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <div key={activeTab}>
                  {results?.[activeTab]?.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      {activeTab === 'tracks' && (
                        <div className="space-y-2">
                          {results.tracks?.map((track: Track) => (
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
                      
                      {activeTab === 'albums' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12">
                          {results.albums?.map((album: Album) => (
                            <AlbumCard key={album.id} album={album} />
                          ))}
                        </div>
                      )}
                      
                      {activeTab === 'artists' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12">
                          {results.artists?.map((artist: Artist) => (
                            <ArtistCard key={artist.id} artist={artist} />
                          ))}
                        </div>
                      )}
                      
                      {activeTab === 'playlists' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12">
                          {results.playlists?.map((playlist: Playlist) => (
                            <PlaylistCard key={playlist.id} playlist={playlist} />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-32"
                    >
                      <p className="text-muted italic">No {activeTab} found for "{debouncedQuery}"</p>
                    </motion.div>
                  )}
                </div>
              </AnimatePresence>
            )}
          </div>
        </>
      )}
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
      
      <div className="w-12 h-12 rounded-sm bg-surface border border-line overflow-hidden flex-shrink-0">
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