import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useReaderStore } from '../store/useReaderStore';
import { AddonService, MetadataService } from '../services/addonService';
import { Search as SearchIcon, Loader2, BookOpen, User, Book, Star, Layers, Grid3x3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export default function SearchPage() {
  const { addons } = useReaderStore();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'books' | 'manga' | 'authors' | 'series' | 'collections'>('all');
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
    { id: 'all', name: 'All', icon: Grid3x3 },
    { id: 'books', name: 'Books', icon: Book },
    { id: 'manga', name: 'Manga', icon: BookOpen },
    { id: 'authors', name: 'Authors', icon: User },
    { id: 'series', name: 'Series', icon: Layers },
    { id: 'collections', name: 'Collections', icon: Star },
  ] as const;

  const getDisplayResults = () => {
    if (!results) return [];
    if (activeTab === 'all') {
      return [
        ...results.books.map((item: any) => ({ ...item, type: 'books' })),
        ...results.manga.map((item: any) => ({ ...item, type: 'manga' })),
        ...results.authors.map((item: any) => ({ ...item, type: 'authors' })),
        ...results.series.map((item: any) => ({ ...item, type: 'series' })),
        ...results.collections.map((item: any) => ({ ...item, type: 'collections' })),
      ];
    }
    return results[activeTab]?.map((item: any) => ({ ...item, type: activeTab })) || [];
  };

  const displayResults = getDisplayResults();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Search Input */}
      <div className="relative group max-w-3xl mx-auto">
        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by ISBN, title, or author..."
          className="w-full pl-14 pr-4 py-5 glass-card text-text placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 transition-all text-base"
        />
        {isLoading && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
        {!debouncedQuery ? (
          <div className="text-center py-32 space-y-4">
            <h2 className="text-4xl font-bold text-text-muted/10">Start Searching</h2>
            <p className="text-text-muted/50 text-base">Enter a query to discover content</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <div key={activeTab}>
              {displayResults.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
                >
                  {displayResults.map((item: any) => (
                    <SearchResultCard key={`${item.type}-${item.id}`} item={item} type={item.type} />
                  ))}
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

function SearchResultCard({ item, type }: { item: any, type: string }) {
  const isPerson = type === 'authors';
  
  return (
    <Link 
      to={`/reader?id=${item.id}&type=${type === 'manga' ? 'manga' : 'book'}`}
      className="group"
    >
      <motion.div
        whileHover={{ y: -4 }}
        className="space-y-3"
      >
        <div className={cn(
          "aspect-square relative overflow-hidden glass-card group-hover:shadow-2xl transition-all duration-500",
          isPerson && "rounded-full"
        )}>
          {(item.coverURL || item.imageURL) ? (
            <img 
              src={item.coverURL || item.imageURL} 
              alt={item.title || item.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface">
              <Book className="w-8 h-8 text-text-muted/20" />
            </div>
          )}
        </div>
        <div className={cn("space-y-1", isPerson && "text-center")}>
          <h3 className="font-semibold text-text group-hover:text-primary transition-colors line-clamp-2 text-base">
            {item.title || item.name}
          </h3>
          {(item.author || item.genres) && (
            <p className="text-text-muted/60 line-clamp-1 text-sm">{item.author || item.genres?.join(', ')}</p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
