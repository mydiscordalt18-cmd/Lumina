import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useReaderStore } from '../store/useReaderStore';
import { AddonService, MetadataService } from '../services/addonService';
import { Search as SearchIcon, Filter, Layers, LayoutGrid, List, Loader2, BookOpen, User, Book, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export default function SearchPage() {
  const { addons } = useReaderStore();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'books' | 'manga' | 'authors' | 'series' | 'collections'>('books');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery, addons.map(a => a.id)],
    queryFn: async () => {
      if (!debouncedQuery) return null;
      const allResults = await Promise.all(
        addons.map(addon => AddonService.search(addon, debouncedQuery))
      );
      return allResults.reduce((acc, current) => ({
        books: [...(acc.books || []), ...(current.books || [])],
        manga: [...(acc.manga || []), ...(current.manga || [])],
        authors: [...(acc.authors || []), ...(current.authors || [])],
        series: [...(acc.series || []), ...(current.series || [])],
        collections: [...(acc.collections || []), ...(current.collections || [])],
      }), { books: [], manga: [], authors: [], series: [], collections: [] });
    },
    enabled: !!debouncedQuery && addons.length > 0,
  });

  const categories = [
    { id: 'books', name: 'Books', icon: Book },
    { id: 'manga', name: 'Manga', icon: BookOpen },
    { id: 'authors', name: 'Authors', icon: User },
    { id: 'series', name: 'Series', icon: Layers },
    { id: 'collections', name: 'Collections', icon: Star },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="space-y-2">
        <h1 className="editorial-title text-4xl italic">Search Catalog</h1>
        <p className="text-muted text-xs uppercase tracking-[2px] font-mono">Searching {addons.length} addons</p>
      </div>

      {/* Search Input */}
      <div className="relative group max-w-2xl">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/40 group-focus-within:text-gold transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SEARCH BY ISBN, TITLE, OR AUTHOR..."
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
              "flex items-center gap-2 pb-2 text-[11px] uppercase tracking-[2px] font-bold transition-all relative",
              activeTab === cat.id 
                ? "text-gold after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1px] after:bg-gold" 
                : "text-muted hover:text-ink"
            )}
          >
            {cat.name}
            {results && results[cat.id]?.length > 0 && (
              <span className="text-[9px] text-muted opacity-50">({results[cat.id].length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="min-h-[400px]">
        {!debouncedQuery ? (
          <div className="text-center py-32 space-y-4">
            <h2 className="editorial-title text-3xl opacity-20">Awaiting your search</h2>
            <p className="text-muted font-mono text-[10px] uppercase tracking-[2px]">Enter a query to search your addons</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <div key={activeTab}>
              {results?.[activeTab]?.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12"
                >
                  {results[activeTab].map((item: any) => (
                    <SearchResultCard key={item.id} item={item} type={activeTab} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-32"
                >
                  <p className="text-muted italic">No findings for "{debouncedQuery}" in {activeTab}</p>
                </motion.div>
              )}
            </div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

function SearchResultCard({ item, type }: { item: any, type: string }) {
  const isPerson = type === 'authors';
  
  return (
    <Link 
      to={`/reader?id=${item.id}&type=${type === 'manga' ? 'manga' : 'book'}`}
      className="group block"
    >
      <div className={cn(
        "aspect-[2/3] relative overflow-hidden bg-surface border border-line shadow-lg group-hover:shadow-[0_20px_40px_rgba(212,175,55,0.1)] transition-all duration-500",
        isPerson ? "rounded-full" : "rounded-sm"
      )}>
        {(item.coverURL || item.imageURL) ? (
          <img 
            src={item.coverURL || item.imageURL} 
            alt={item.title || item.name} 
            className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface">
            <Book className="w-8 h-8 text-muted/20" />
          </div>
        )}
        <div className="addon-tag absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          EXPLORE
        </div>
      </div>
      <div className={cn("mt-4 space-y-1", isPerson ? "text-center" : "")}>
        <h3 className="font-bold text-ink text-sm group-hover:text-gold transition-colors line-clamp-1">
          {item.title || item.name}
        </h3>
        <p className="text-[10px] text-muted italic line-clamp-1">{item.author || item.genres?.join(', ')}</p>
      </div>
    </Link>
  );
}
