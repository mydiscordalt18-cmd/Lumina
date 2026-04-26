import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useReaderStore } from '../store/useReaderStore';
import { History, TrendingUp, BookOpen, Star, ArrowRight, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LandingPage() {
  const { history, favorites, addons } = useReaderStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-20 py-4"
    >
      {/* Editorial Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center border-b border-line pb-20">
        <div className="space-y-6">
          <span className="meta-badge">Curation Spotlight</span>
          <h1 className="editorial-title text-6xl md:text-8xl">
            The Archive of <br />
            <span className="text-gold">Lost Echoes</span>
          </h1>
          <p className="text-muted leading-relaxed max-w-lg text-sm md:text-base">
            Discover a curated collection of literary artifacts and visual novels. 
            Enriched via Lumina's discovery system. Now available through your 
            connected addons.
          </p>
          <div className="pt-4 flex gap-6 items-center">
            <Link
              to="/search"
              className="bg-gold text-black px-10 py-3.5 font-bold text-xs tracking-widest hover:bg-gold/90 transition-all uppercase"
            >
              Start Reading
            </Link>
            <Link to="/settings" className="text-gold text-xs font-mono uppercase tracking-[1px] hover:underline underline-offset-4">
              Add Addons →
            </Link>
          </div>
        </div>

        <div className="hidden lg:flex gap-6 justify-center">
          <div 
            className="w-48 h-72 border border-line shadow-[0_20px_50px_rgba(0,0,0,0.5)] -rotate-6 transition-transform hover:rotate-0 duration-700 bg-cover bg-center"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1543004471-2406836ea8d0?auto=format&fit=crop&q=80&w=400')` }}
          />
          <div 
            className="w-48 h-72 border border-line shadow-[0_20px_50px_rgba(0,0,0,0.5)] rotate-3 mt-12 transition-transform hover:rotate-0 duration-700 bg-cover bg-center"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400')` }}
          />
        </div>
      </section>

      {/* Stats/Status */}
      {addons.length === 0 && (
        <div className="bg-surface border border-line rounded-sm p-8 text-center max-w-2xl mx-auto">
          <Globe className="w-10 h-10 text-gold/20 mx-auto mb-4" />
          <p className="text-gold font-mono text-xs uppercase tracking-widest">No Addons Connected</p>
          <p className="text-muted text-sm mt-3 font-light">
            Your library is empty. Please add an addon to begin.
          </p>
          <Link to="/settings" className="inline-flex items-center gap-2 text-xs font-bold text-gold mt-6 border-b border-gold/30 pb-1 hover:border-gold transition-colors">
            Add Addons <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Recent History */}
      {history.length > 0 && (
        <section className="space-y-8 bg-gradient-to-b from-transparent to-gold/[0.02] p-8 -mx-8">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <h2 className="editorial-title text-3xl italic">Reading History</h2>
            <Link to="/library" className="text-gold text-[10px] uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {history.slice(0, 6).map((item) => (
              <Link 
                key={item.id} 
                to={`/reader?id=${item.id}&type=${item.type}`}
                className="group block"
              >
                <div className="aspect-[2/3] relative border border-line shadow-[0_12px_24px_rgba(0,0,0,0.4)] overflow-hidden">
                  {item.cover ? (
                    <img 
                      src={item.cover} 
                      alt={item.title} 
                      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full bg-surface flex items-center justify-center p-4">
                      <BookOpen className="w-8 h-8 text-muted/20" />
                    </div>
                  )}
                  <div className="addon-tag absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    RESUME
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <h3 className="font-semibold text-ink text-sm line-clamp-1 group-hover:text-gold transition-colors">{item.title}</h3>
                  <p className="text-[10px] text-muted uppercase tracking-widest">{item.type}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured/Favorites Section */}
      {favorites.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <h2 className="editorial-title text-3xl italic">Curated Collection</h2>
            <span className="text-muted text-[10px] uppercase tracking-widest">{favorites.length} Items</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {favorites.slice(0, 6).map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}

function ContentCard({ item }: { item: any }) {
  return (
    <Link to={`/reader?id=${item.id}&type=${item.manga ? 'manga' : 'book'}`} className="group block">
      <div className="aspect-[2/3] relative border border-line shadow-[0_8px_16px_rgba(0,0,0,0.3)] overflow-hidden">
        {item.coverURL ? (
          <img 
            src={item.coverURL} 
            alt={item.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          />
        ) : (
          <div className="w-full h-full bg-surface flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-muted/20" />
          </div>
        )}
        <div className="addon-tag absolute bottom-2 left-2 truncate max-w-[80%]">
          {item.author || 'Local'}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold text-ink text-sm line-clamp-1 group-hover:text-gold transition-colors">{item.title}</h3>
        <p className="text-[10px] text-muted italic mt-0.5">{item.author || 'Unknown Author'}</p>
      </div>
    </Link>
  );
}
