import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useReaderStore } from '../store/useReaderStore';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, Heart, Shuffle, Repeat } from 'lucide-react';
import { cn } from '../lib/utils';

export default function MusicPlayer() {
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    queue, 
    queueIndex,
    setIsPlaying, 
    setVolume,
    playNext,
    playPrevious,
    isMusicFavorite,
    toggleMusicFavorite
  } = useReaderStore();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      playNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playNext, setIsPlaying]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.streamURL) return;

    audio.src = currentTrack.streamURL;
    audio.load();
    
    if (isPlaying) {
      audio.play().catch(console.error);
    }
  }, [currentTrack, isPlaying]);

  // Handle volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, percent));
    
    setVolume(newVolume);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-t border-line shadow-2xl"
      >
        <audio ref={audioRef} preload="metadata" />
        
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-sm bg-surface border border-line overflow-hidden flex-shrink-0">
                {currentTrack.artworkURL ? (
                  <img 
                    src={currentTrack.artworkURL} 
                    alt={currentTrack.title} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-5 h-5 text-muted/20" />
                  </div>
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-ink text-sm truncate">{currentTrack.title}</h3>
                <p className="text-[10px] text-muted truncate">{currentTrack.artist}</p>
              </div>
              
              <button
                onClick={() => toggleMusicFavorite(currentTrack)}
                className={cn(
                  "p-2 transition-colors",
                  isMusicFavorite(currentTrack.id) ? "text-gold" : "text-muted hover:text-gold"
                )}
              >
                <Heart className={cn("w-4 h-4", isMusicFavorite(currentTrack.id) && "fill-current")} />
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={playPrevious}
                disabled={queueIndex <= 0}
                className="p-2 text-muted hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              
              <button
                onClick={handlePlayPause}
                className="w-10 h-10 rounded-full bg-gold text-black flex items-center justify-center hover:bg-gold/90 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
              
              <button
                onClick={playNext}
                disabled={queueIndex >= queue.length - 1}
                className="p-2 text-muted hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <span className="text-[10px] text-muted font-mono w-10 text-right">
                {formatTime(currentTime)}
              </span>
              
              <div 
                className="flex-1 h-1 bg-surface rounded-full cursor-pointer group"
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-gold rounded-full relative group-hover:bg-gold/80 transition-colors"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              
              <span className="text-[10px] text-muted font-mono w-10">
                {formatTime(duration)}
              </span>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 text-muted hover:text-gold transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              
              <div 
                className="w-20 h-1 bg-surface rounded-full cursor-pointer group"
                onClick={handleVolumeChange}
              >
                <div 
                  className="h-full bg-gold rounded-full relative group-hover:bg-gold/80 transition-colors"
                  style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}