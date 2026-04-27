import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useReaderStore } from '../store/useReaderStore';
import { Play, BookOpen, Music, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LandingPage() {
  const { history, favorites, addons, musicHistory } = useReaderStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-16"
    >
      {/* Hero Section */}
      <section className="text-center space-y-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm text-text-muted">
            <Sparkles className="w-4 h-4 text-primary" />
            Where stories find their frequency
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-gradient leading-tight">
            Discover
            <br />
            Everything
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
            Books, music, and stories from across the web. All in one beautiful, connected experience.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            to="/search"
            className="glass-button px-8 py-4 text-primary font-semibold hover:neon-glow transition-all duration-300 flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Exploring
          </Link>
          <Link
            to="/settings"
            className="text-text-muted hover:text-text transition-colors flex items-center gap-2"
          >
            Add Sources
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* No Sources State */}
      {addons.length === 0 && (
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass-card p-12 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">Ready to Connect</h3>
              <p className="text-text-muted">
                Add your first source to start discovering books and music from across the web.
              </p>
            </div>
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 glass-button px-6 py-3 text-primary font-medium hover:neon-glow transition-all duration-300"
            >
              Add Sources
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.section>
      )}

      {/* Recent Activity */}
      {(history.length > 0 || musicHistory.length > 0) && (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Continue Where You Left Off</h2>
            <Link
              to="/library"
              className="text-text-muted hover:text-primary transition-colors flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Recent Books */}
            {history.slice(0, 4).map((item) => (
              <ContentCard key={`book-${item.id}`} item={item} type="book" />
            ))}
            
            {/* Recent Music */}
            {musicHistory.slice(0, 4).map((item) => (
              <ContentCard key={`music-${item.id}`} item={item} type="music" />
            ))}
          </div>
        </section>
      )}

      {/* Favorites */}
      {favorites.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Your Favorites</h2>
            <span className="text-text-muted">{favorites.length} items</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.slice(0, 8).map((item) => (
              <ContentCard key={`fav-${item.id}`} item={item} type="book" />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}

function ContentCard({ item, type }: { item: any; type: 'book' | 'music' }) {
  const linkTo = type === 'music' ? '/music' : `/reader?id=${item.id}&type=${item.type || 'book'}`;
  
  return (
    <Link to={linkTo} className="group">
      <motion.div
        whileHover={{ y: -4 }}
        className="glass-card p-6 space-y-4 group-hover:neon-glow transition-all duration-300"
      >
        <div className="aspect-square bg-surface rounded-xl overflow-hidden relative">
          {item.cover || item.artworkURL ? (
            <img
              src={item.cover || item.artworkURL}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {type === 'music' ? (
                <Music className="w-12 h-12 text-text-muted" />
              ) : (
                <BookOpen className="w-12 h-12 text-text-muted" />
              )}
            </div>
          )}
          
          <div className="absolute top-3 right-3">
            <div className="glass-card px-2 py-1">
              <span className="text-xs font-mono text-text-muted uppercase">
                {type}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-text group-hover:text-primary transition-colors line-clamp-2">
            {item.title}
          </h3>
          <p className="text-sm text-text-muted line-clamp-1">
            {item.artist || item.author || 'Unknown'}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
