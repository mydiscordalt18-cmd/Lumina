import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useReaderStore } from '../store/useReaderStore';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, Heart } from 'lucide-react';
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
        className="fixed bottom-6 left-6 right-6 z-50"
      >
        <div className="glass-card p-6 nav-blur">
          <audio ref={audioRef} preload="metadata" />
          
          <div className="flex items-center gap-6">
            {/* Track Info */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-14 h-14 rounded-xl bg-surface overflow-hidden shrink-0">
                {currentTrack.artworkURL ? (
                  <img 
                    src={currentTrack.artworkURL} 
                    alt={currentTrack.title} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-6 h-6 text-text-muted" />
                  </div>
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-text truncate">{currentTrack.title}</h3>
                <p className="text-sm text-text-muted truncate">{currentTrack.artist}</p>
              </div>
              
              <button
                onClick={() => toggleMusicFavorite(currentTrack)}
                className={cn(
                  "glass-button p-3 transition-all duration-300",
                  isMusicFavorite(currentTrack.id) ? "text-primary" : "text-text-muted hover:text-text"
                )}
              >
                <Heart className={cn("w-5 h-5", isMusicFavorite(currentTrack.id) && "fill-current")} />
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={playPrevious}
                disabled={queueIndex <= 0}
                className="glass-button p-3 text-text-muted hover:text-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              
              <button
                onClick={handlePlayPause}
                className="glass-button p-4 text-primary hover:bg-primary/10 transition-all duration-300"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </button>
              
              <button
                onClick={playNext}
                disabled={queueIndex >= queue.length - 1}
                className="glass-button p-3 text-text-muted hover:text-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <span className="text-xs text-text-muted font-mono w-12 text-right">
                {formatTime(currentTime)}
              </span>
              
              <div 
                className="flex-1 h-2 bg-surface rounded-full cursor-pointer group overflow-hidden"
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full relative transition-all duration-300"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
                </div>
              </div>
              
              <span className="text-xs text-text-muted font-mono w-12">
                {formatTime(duration)}
              </span>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="glass-button p-3 text-text-muted hover:text-text transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              
              <div 
                className="w-24 h-2 bg-surface rounded-full cursor-pointer group overflow-hidden"
                onClick={handleVolumeChange}
              >
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full relative transition-all duration-300"
                  style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}