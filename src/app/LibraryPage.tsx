import { motion } from 'motion/react';
import { useReaderStore } from '../store/useReaderStore';
import { BookOpen, History, Heart, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function LibraryPage() {
  const { history, favorites, toggleFavorite } = useReaderStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-16"
    >
      <div className="space-y-2 border-b border-line pb-8">
        <h1 className="text-4xl font-bold">Library</h1>
        <p className="text-text-muted text-sm">Your saved content and reading history</p>
      </div>

      {/* Favorites */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Favorites</h2>
          <span className="text-primary text-sm font-medium">{favorites.length} items</span>
        </div>
        
        {favorites.length === 0 ? (
          <div className="bg-surface rounded-sm p-12 text-center border border-line">
            <Heart className="w-10 h-10 text-primary/10 mx-auto mb-4" />
            <p className="text-text-muted text-sm">Your bookmarks are currently empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {favorites.map((item) => (
              <div key={item.id} className="group relative">
                <Link to={`/reader?id=${item.id}&type=${item.format ? 'book' : 'manga'}`}>
                  <div className="aspect-[2/3] rounded-sm relative border border-line shadow-lg group-hover:shadow-[0_20px_40px_rgba(211,175,55,0.1)] transition-all duration-500 overflow-hidden">
                    {item.coverURL ? (
                      <img src={item.coverURL} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface">
                        <BookOpen className="w-8 h-8 text-muted/20" />
                      </div>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => toggleFavorite(item)}
                  className="absolute top-2 right-2 p-2 bg-black/80 backdrop-blur rounded-sm opacity-0 group-hover:opacity-100 transition-all text-red-500 hover:text-red-400 border border-line"
                  title="Remove artifact"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="mt-4">
                  <h3 className="font-bold text-ink text-sm line-clamp-1 group-hover:text-gold transition-colors">{item.title}</h3>
                  <p className="text-sm text-text-muted mt-0.5">{item.author || 'Unknown'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">History</h2>
          <span className="text-text-muted text-sm font-medium">{history.length} items</span>
        </div>

        {history.length === 0 ? (
          <div className="bg-surface rounded-sm p-12 text-center border border-line">
            <History className="w-10 h-10 text-muted/10 mx-auto mb-4" />
            <p className="text-muted italic text-sm">No activity recorded in the neural link.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <Link
                key={item.id}
                to={`/reader?id=${item.id}&type=${item.type}`}
                className="flex items-center gap-6 p-4 bg-surface/40 border-l border-line hover:border-gold hover:bg-gold/[0.03] transition-all group"
              >
                <div className="w-12 h-16 rounded-sm bg-surface border border-line overflow-hidden flex-shrink-0 grayscale-[0.5] group-hover:grayscale-0 transition-all">
                  {item.cover ? (
                    <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-muted/20" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-ink text-sm group-hover:text-gold transition-colors tracking-tight">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="content-tag opacity-60">
                      {item.type}
                    </span>
                    <span className="text-sm text-text-muted">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted group-hover:text-gold group-hover:translate-x-2 transition-all" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
