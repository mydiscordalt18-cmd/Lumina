import { useState } from 'react';
import { motion } from 'motion/react';
import { useReaderStore } from '../store/useReaderStore';
import { AddonService } from '../services/addonService';
import { Plus, Trash2, Globe, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function SettingsPage() {
  const { addons, addAddon, removeAddon } = useReaderStore();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cleanUrl = url.replace(/\/$/, '');
      const manifest = await AddonService.fetchManifest(cleanUrl);
      addAddon(manifest);
      setUrl('');
    } catch (err) {
      setError('Neural link failed. Verify provider manifest and connectivity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-3xl mx-auto space-y-12"
    >
      <div className="space-y-2 border-b border-line pb-8">
        <h1 className="editorial-title text-4xl">Addons</h1>
        <p className="text-muted text-xs uppercase tracking-[2px] font-mono">Add and manage your book sources</p>
      </div>

      <div className="bg-surface rounded-sm border border-line p-8 space-y-6 shadow-2xl">
        <h2 className="text-[10px] uppercase tracking-[3px] font-bold text-gold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add new addon
        </h2>
        <form onSubmit={handleAddAddon} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/30" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="PROVIDER_URL"
              className="w-full pl-12 pr-4 py-4 bg-app-bg border border-line rounded-sm focus:outline-none focus:border-gold transition-all text-xs font-mono text-gold placeholder:text-gold/20 tracking-widest"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-4 bg-gold text-black text-xs font-bold uppercase tracking-[2px] hover:bg-gold/90 disabled:bg-muted disabled:cursor-not-allowed transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Add'}
          </button>
        </form>
        {error && (
          <div className="flex items-center gap-3 text-red-400 text-[10px] font-mono uppercase tracking-widest bg-red-400/5 p-4 border border-red-400/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Connection failed. Please check the addon URL.</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="editorial-title text-3xl italic">Installed Addons</h2>
        {addons.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-dashed border-line rounded-sm">
            <p className="text-muted font-mono text-[10px] uppercase tracking-widest">No addons yet</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {addons.map((addon) => (
              <div
                key={addon.id}
                className="flex items-center justify-between p-6 bg-surface border border-line hover:border-gold/50 transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-sm bg-app-bg border border-line overflow-hidden flex items-center justify-center shadow-lg">
                    {addon.icon ? (
                      <img src={addon.icon} alt={addon.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    ) : (
                      <Globe className="w-6 h-6 text-muted/20" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-ink text-sm tracking-tight">{addon.name}</h3>
                    <p className="text-[10px] text-muted font-mono mt-1 opacity-50">{addon.baseURL}</p>
                    <div className="flex gap-2 mt-3">
                      {addon.resources.map(res => (
                        <span key={res} className="addon-tag">
                          {res}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeAddon(addon.id)}
                  className="p-3 text-muted hover:text-red-400 hover:bg-red-400/5 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gold/[0.03] p-8 border border-gold/10 space-y-4">
        <div className="flex items-center gap-3 text-gold text-[10px] font-bold uppercase tracking-[3px]">
          <CheckCircle className="w-4 h-4" />
          Addon Setup
        </div>
        <p className="text-[12px] text-muted leading-relaxed font-light">
          Lumina Reader supports external addons. 
          Sources must provide a <code>../manifest.json</code> file and 
          search endpoints to work.
        </p>
      </div>
    </motion.div>
  );
}
