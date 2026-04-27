import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, Settings, Home, Heart, Music, Menu, X } from 'lucide-react';
import { cn } from './lib/utils';
import { useReaderStore } from './store/useReaderStore';

// Lazy load pages for better performance
import LandingPage from './app/LandingPage';
import SearchPage from './app/SearchPage';
import ReaderPage from './app/ReaderPage';
import SettingsPage from './app/SettingsPage';
import LibraryPage from './app/LibraryPage';
import MusicPage from './app/MusicPage';
import MusicPlayer from './components/MusicPlayer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function Navigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Discover', path: '/', icon: Home },
    { name: 'Search', path: '/search', icon: SearchIcon },
    { name: 'Music', path: '/music', icon: Music },
    { name: 'Library', path: '/library', icon: Heart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-card px-8 py-4">
          <div className="flex items-center gap-12">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-gradient tracking-tight">
              UtaVerse
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                    location.pathname === item.path 
                      ? "text-primary bg-primary/10" 
                      : "text-text-muted hover:text-text hover:bg-surface"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden glass-button p-2"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-app-bg/80 backdrop-blur-xl" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-20 left-4 right-4"
            >
              <div className="glass-card p-6 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300",
                      location.pathname === item.path 
                        ? "text-primary bg-primary/10" 
                        : "text-text-muted hover:text-text hover:bg-surface"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/Lumina">
        <div className="min-h-screen bg-app-bg text-text font-sans">
          <Navigation />
          
          {/* Main Content */}
          <main className="pt-24 pb-32">
            <div className="max-w-7xl mx-auto px-6">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/music" element={<MusicPage />} />
                  <Route path="/reader" element={<ReaderPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AnimatePresence>
            </div>
          </main>
          
          {/* Music Player */}
          <MusicPlayer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
