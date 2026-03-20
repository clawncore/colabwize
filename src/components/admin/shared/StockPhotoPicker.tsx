import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ExternalLink, Check, Loader2, ImageOff, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { apiClient } from "../../../services/apiClient";

interface UnsplashPhoto {
  id: string;
  urls: { regular: string; small: string; thumb: string };
  alt_description: string | null;
  description: string | null;
  user: { name: string; links: { html: string } };
  links: { download_location: string };
  width: number;
  height: number;
}

interface StockPhotoPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, credit?: string) => void;
  title?: string;
}

const SUGGESTED_QUERIES = [
  "academic writing", "research", "education", "technology",
  "collaboration", "university", "AI", "books",
];

export const StockPhotoPicker: React.FC<StockPhotoPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = "Insert Stock Imagery",
}) => {
  const [query, setQuery] = useState("academic writing");
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string, p = 1) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(
        `/api/integrations/unsplash/search?query=${encodeURIComponent(q)}&per_page=12&page=${p}`
      );
      if (res.success && res.data?.results) {
        setPhotos(res.data.results);
        setTotalPages(Math.ceil(res.data.total / 12));
        setPage(p);
      } else {
        setError("Synchronizing with Unsplash failed.");
        setPhotos([]);
      }
    } catch {
      setError("Visual database currently offline.");
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelected(null);
      search(query, 1);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      search(query, 1);
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const handleSelect = (photo: UnsplashPhoto) => {
    setSelected(photo.id);
    apiClient.get(`/api/integrations/unsplash/download?url=${encodeURIComponent(photo.links.download_location)}`).catch(() => {});
  };

  const handleConfirm = () => {
    const photo = photos.find((p) => p.id === selected);
    if (!photo) return;
    const credit = `Photo by ${photo.user.name} on Unsplash`;
    onSelect(photo.urls.regular, credit);
    onClose();
    setSelected(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Soft Backdrop */}
        <motion.div
           initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
           className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
           onClick={onClose}
        />

        {/* Clean White Card Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-[#ffffff] border border-slate-200 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col"
        >
          {/* Email-Style Header */}
          <div className="px-8 pt-8 pb-4 text-center">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 text-center">
                <img src="https://colabwize.com/email_logo.png" alt="ColabWize" className="h-10 w-auto inline-block mb-3" />
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 -mt-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Premium Search Bar */}
            <div className="relative group max-w-2xl mx-auto mb-4">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              </div>
              <input 
                ref={inputRef}
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search(query, 1)}
                placeholder="Search thousands of stock photos..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium placeholder:text-slate-400 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all"
              />
            </div>

            {/* Simple Tags */}
            <div className="flex flex-wrap justify-center gap-2 pb-2">
              {SUGGESTED_QUERIES.map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setQuery(tag); search(tag, 1); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    query === tag
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Container */}
          <div className="flex-1 overflow-y-auto px-8 pb-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center min-h-[300px] gap-4">
                  <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                  <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Fetching Imagery...</p>
                </motion.div>
              ) : error ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center min-h-[300px] gap-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
                    <ImageOff className="w-8 h-8 text-orange-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500 max-w-xs">{error}</p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => handleSelect(photo)}
                      className={`relative group aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all ${
                        selected === photo.id
                          ? "border-sky-500 ring-4 ring-sky-500/10 scale-[0.98]"
                          : "border-transparent hover:border-slate-200"
                      }`}
                    >
                      <img 
                        src={photo.urls.small} 
                        alt={photo.alt_description || "asset"} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      
                      {/* Simple Gradient Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <p className="text-[10px] font-bold text-white truncate">{photo.user.name}</p>
                      </div>

                      {/* Selection UI */}
                      {selected === photo.id && (
                        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center shadow-lg border-2 border-white">
                          <Check size={14} className="text-white" strokeWidth={4} />
                        </div>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clean Light Footer */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <a
                href="https://unsplash.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1.5 transition-colors uppercase tracking-widest"
              >
                <ExternalLink size={12} /> Unsplash Database
              </a>

              {/* Minimal Pagination */}
              {!loading && !error && photos.length > 0 && (
                <div className="hidden md:flex items-center bg-white rounded-lg border border-slate-200 px-2 py-1">
                  <button
                    onClick={() => search(query, page - 1)}
                    disabled={page <= 1}
                    className="p-1.5 text-slate-400 hover:text-sky-500 disabled:opacity-20 transition-all"
                  >
                    <ChevronLeft size={18} strokeWidth={3} />
                  </button>
                  <span className="text-[10px] font-black text-slate-400 px-3 tracking-widest">
                    {page} / {Math.min(totalPages, 20)}
                  </span>
                  <button
                    onClick={() => search(query, page + 1)}
                    disabled={page >= Math.min(totalPages, 20)}
                    className="p-1.5 text-slate-400 hover:text-sky-500 disabled:opacity-20 transition-all"
                  >
                    <ChevronRight size={18} strokeWidth={3} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={onClose}
                className="flex-1 md:flex-none px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selected}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-sky-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-500/20 hover:bg-sky-400 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <ImageIcon size={18} />
                Insert Photo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
