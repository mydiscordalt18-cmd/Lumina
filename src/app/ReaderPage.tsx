import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useReaderStore } from '../store/useReaderStore';
import { AddonService, MetadataService } from '../services/addonService';
import { ChevronLeft, ChevronRight, Settings, Maximize2, Minimize2, Loader2, BookOpen, Heart, Share2, Info, List as ListIcon, X, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';
import ePub, { Rendition } from 'epubjs';

export default function ReaderPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const type = searchParams.get('type') as 'book' | 'manga';
  const navigate = useNavigate();

  const { addons, addToHistory, toggleFavorite, isFavorite } = useReaderStore();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUI, setShowUI] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mangaMode, setMangaMode] = useState<'vertical' | 'horizontal'>('vertical');
  
  // EPUB Refs
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);

  useEffect(() => {
    async function loadContent() {
      if (!id || addons.length === 0) {
        setError('No content ID or addons found');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Find which addon has this content (checking first addon for demo)
        const addon = addons[0]; 
        const readData = await AddonService.read(addon, id);
        
        // Enrich with metadata if possible
        const details = await AddonService.getDetails(addon, type, id);
        const enriched = details ? await MetadataService.enrichBook(details.title, details.author) : null;
        
        const finalContent = {
          ...details,
          ...readData,
          ...enriched,
        };

        setContent(finalContent);
        addToHistory({
          id: id,
          title: finalContent.title || 'Untitled',
          type: type,
          cover: finalContent.coverURL
        });

        if (readData.type === 'book' && readData.format === 'epub') {
          // Initialization of EPUB is handled in separate effect
        }
      } catch (err) {
        setError('Failed to load content from provider.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [id, addons]);

  // EPUB Handlers
  useEffect(() => {
    if (content?.type === 'book' && content?.format === 'epub' && viewerRef.current) {
      const book = ePub(content.url);
      const rendition = book.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        manager: 'default',
        flow: 'paginated',
      });
      renditionRef.current = rendition;
      rendition.display();

      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') rendition.prev();
        if (e.key === 'ArrowRight') rendition.next();
      };
      window.addEventListener('keydown', handleKeydown);
      return () => {
        window.removeEventListener('keydown', handleKeydown);
        book.destroy();
      };
    }
  }, [content]);

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium">Opening your adventure...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
          <X className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Error</h2>
        <p className="text-slate-500">{error}</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col">
      {/* Top Bar */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            exit={{ y: -60 }}
            className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black to-transparent flex items-center justify-between px-8 z-10 border-b border-white/5"
          >
            <div className="flex items-center gap-6">
              <button onClick={() => navigate(-1)} className="text-white hover:text-gold transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="max-w-[200px] md:max-w-md">
                <h1 className="editorial-title text-xl text-white truncate italic">{content.title}</h1>
                <p className="text-primary text-sm font-medium truncate">{content.author}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => toggleFavorite(content)}
                className={cn("transition-colors", isFavorite(id!) ? "text-gold" : "text-white/40 hover:text-white")}
              >
                <Heart className={cn("w-5 h-5", isFavorite(id!) && "fill-current")} />
              </button>
              <button onClick={() => setSettingsOpen(true)} className="text-white/40 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div 
        className="flex-1 overflow-auto bg-[#050505]"
        onClick={() => setShowUI(!showUI)}
      >
        {content.type === 'book' ? (
          <div className="h-full bg-white flex items-center justify-center relative">
            <div ref={viewerRef} className="w-full h-full max-w-3xl mx-auto" />
            <button 
              onClick={(e) => { e.stopPropagation(); renditionRef.current?.prev(); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-4 text-slate-200 hover:text-gold transition-all hidden md:block"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); renditionRef.current?.next(); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-4 text-slate-200 hover:text-gold transition-all hidden md:block"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          </div>
        ) : (
          <div className={cn(
            "bg-[#050505] min-h-full",
            mangaMode === 'vertical' ? "flex flex-col items-center" : "flex overflow-x-auto snap-x snap-mandatory"
          )}>
            {content.pages?.map((page: string, idx: number) => (
              <img 
                key={idx} 
                src={page} 
                className={cn(
                  "max-w-full h-auto shadow-[0_40px_80px_rgba(0,0,0,0.8)]",
                  mangaMode === 'vertical' ? "mb-4 lg:max-w-3xl border-y border-white/5" : "h-screen w-auto snap-center border-x border-white/5"
                )}
                alt={`Page ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reader Settings Modal */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-6"
            onClick={() => setSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-surface rounded-sm w-full max-w-lg p-10 space-y-10 border border-line shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-line pb-6">
                <h3 className="editorial-title text-3xl italic text-ink">Navigation & Visuals</h3>
                <button onClick={() => setSettingsOpen(false)} className="text-muted hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {type === 'manga' && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-primary">Reading Mode</p>
                  <div className="grid grid-cols-2 gap-6">
                    <button 
                      onClick={() => setMangaMode('vertical')}
                      className={cn(
                        "p-6 border rounded-sm flex flex-col items-center gap-4 transition-all group",
                        mangaMode === 'vertical' ? "border-gold bg-gold/10 text-gold" : "border-line text-muted hover:border-muted"
                      )}
                    >
                      <LayoutGrid className="w-5 h-5" />
                      <span className="text-sm font-medium">Vertical</span>
                    </button>
                    <button 
                      onClick={() => setMangaMode('horizontal')}
                      className={cn(
                        "p-6 border rounded-sm flex flex-col items-center gap-4 transition-all group",
                        mangaMode === 'horizontal' ? "border-gold bg-gold/10 text-gold" : "border-line text-muted hover:border-muted"
                      )}
                    >
                      <Maximize2 className="w-5 h-5 rotate-90" />
                      <span className="text-sm font-medium">Horizontal</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="flex gap-8 items-start">
                  <div className="w-24 h-36 border border-line shadow-2xl overflow-hidden flex-shrink-0">
                    {content.coverURL && <img src={content.coverURL} className="w-full h-full object-cover grayscale-[0.3]" />}
                  </div>
                  <div className="space-y-3">
                    <span className="content-tag">Content Info</span>
                    <h4 className="font-bold text-ink text-lg leading-tight uppercase tracking-tighter">{content.title}</h4>
                    <p className="text-xs text-muted font-light leading-relaxed line-clamp-3 italic">
                      {content.description || 'Primary archive description missing.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-line flex justify-between items-center text-sm text-text-muted">
                <span>Node: {type} Provider</span>
                <span>System: Enriched</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
