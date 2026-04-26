import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Library, Search as SearchIcon, Settings, History, Home, Heart, Menu, X } from 'lucide-react';
import { cn } from './lib/utils';
import { useReaderStore } from './store/useReaderStore';

// Lazy load pages for better performance
import LandingPage from './app/LandingPage';
import SearchPage from './app/SearchPage';
import ReaderPage from './app/ReaderPage';
import SettingsPage from './app/SettingsPage';
import LibraryPage from './app/LibraryPage';

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
  const { addons } = useReaderStore();

  const navItems = [
    { name: 'Discover', path: '/', icon: Home },
    { name: 'Search', path: '/search', icon: SearchIcon },
    { name: 'My Collection', path: '/library', icon: Heart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[240px] fixed top-0 left-0 bottom-0 bg-app-bg border-r border-line p-8 z-50">
        <div className="font-serif italic text-3xl font-black mb-12 tracking-tighter">LUMINA</div>
        
        <nav className="flex-1 space-y-8">
          <div>
            <div className="text-[10px] uppercase tracking-[2px] text-muted mb-4">Library</div>
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "block py-2 text-[13px] tracking-wide transition-colors hover:text-gold",
                    location.pathname === item.path ? "text-ink font-semibold" : "text-muted"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {addons.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-[2px] text-muted mb-4">Addons</div>
              <div className="space-y-2">
                {addons.map(addon => (
                  <div key={addon.id} className="text-[13px] text-muted line-clamp-1 py-1">
                    {addon.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="pt-8 border-t border-line">
          <div className="flex items-center gap-2 font-mono text-[10px] text-green-400">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_8px_#4ade80]" />
            {addons.length} Addons Ready
          </div>
          <p className="text-[10px] text-muted mt-2">v1.1.0</p>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-line shadow-2xl">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                location.pathname === item.path ? "text-gold" : "text-muted"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-app-bg text-ink font-sans selection:bg-gold/30">
          <Navigation />
          <main className="md:ml-[240px] relative">
            {/* Editorial Header (Desktop only or shared) */}
            <header className="hidden md:flex h-20 border-b border-line items-center justify-between px-10 sticky top-0 bg-app-bg/80 backdrop-blur-md z-40">
              <div className="flex items-center gap-4 text-xs font-mono text-muted uppercase tracking-[1px]">
                 <span className="text-gold">Status:</span> Enriched & Connected
              </div>
              <div className="flex items-center gap-6">
                <Link to="/search" className="flex items-center gap-2 text-xs font-mono text-muted hover:text-gold transition-colors italic">
                  Search catalog...
                </Link>
                <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40" />
              </div>
            </header>

            <div className="max-w-7xl mx-auto p-6 md:p-10 pb-24 md:pb-10">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/reader" element={<ReaderPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                </Routes>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
