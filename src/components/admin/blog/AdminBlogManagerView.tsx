import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../layout/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../../../services/apiClient';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Eye, 
  Globe, 
  Lock,
  FileText,
  Clock,
  Zap,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Loader2,
  X,
  Type,
  Image as ImageIcon,
  Tag,
  Send,
  Save
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image: string;
  is_published: boolean;
  created_at: string;
  views?: string;
}

export const AdminBlogManagerView: React.FC = () => {
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Editor State
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/admin/blogs');
      setBlogs(response.blogs || []);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog?.title || !editingBlog?.content) return;

    try {
      setIsSaving(true);
      if (editingBlog.id) {
        await apiClient.patch(`/api/admin/blogs/${editingBlog.id}`, editingBlog);
      } else {
        await apiClient.post('/api/admin/blogs', editingBlog);
      }
      await fetchBlogs();
      setView('list');
      setEditingBlog(null);
    } catch (error) {
      console.error('Failed to save blog:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await apiClient.delete(`/api/admin/blogs/${id}`);
      setBlogs(blogs.filter(b => b.id !== id));
    } catch (error) {
      console.error('Failed to delete blog:', error);
    }
  };


  const subSidebar = (
    <div className="flex flex-col gap-2 px-4">
      <div className="px-2 mb-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500 italic">Knowledge Array</h2>
        <p className="text-xl font-black text-foreground tracking-tighter">Content Matrix</p>
      </div>

      {[
        { id: 'all', label: 'All Postings', icon: FileText },
        { id: 'published', label: 'Live Entries', icon: Globe },
        { id: 'drafts', label: 'Unstable Drafts', icon: Lock },
        { id: 'stats', label: 'Matrix Flow', icon: Zap },
      ].map((item) => (
        <button
          key={item.id}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
            item.id === 'all'
              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30" 
              : "bg-card border border-border text-muted-foreground hover:text-sky-500 hover:border-sky-500/30 hover:bg-sky-500/5"
          }`}
        >
          <item.icon size={16} />
          <span>{item.label}</span>
        </button>
      ))}

      <div className="mt-8 pt-8 border-t border-border">
         <button 
           onClick={() => {
                setEditingBlog({
                  title: '',
                  excerpt: '',
                  content: '',
                  author: 'SimbiSai',
                  category: 'Innovation',
                  image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
                  is_published: false
                });
                setView('editor');
              }}
           className="w-full flex items-center justify-center gap-3 py-4 bg-sky-500 text-white font-black rounded-2xl shadow-lg hover:shadow-sky-500/30 transition-all text-[11px] uppercase tracking-widest italic"
         >
            <Plus size={16} strokeWidth={3} />
            Initialize Post
         </button>
      </div>
    </div>
  );

  return (
    <AdminLayout subSidebar={subSidebar}>
        {/* Header Section */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-5xl font-black text-foreground tracking-tighter italic">Content <span className="text-sky-500">Matrix</span></h2>
            <p className="text-muted-foreground mt-4 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
               <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
               Knowledge Transmission Array
            </p>
          </div>
        </div>

        {view === 'list' ? (
          <>
            {/* Search and Filters */}
            <div className="p-3 bg-card/40 border border-border rounded-3xl backdrop-blur-xl flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full translate-x-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="text" 
                  placeholder="Query the blog database..."
                  className="w-full pl-12 pr-4 py-3 bg-transparent text-foreground border-none focus:ring-0 text-sm font-bold placeholder:text-muted-foreground/40"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 pr-2">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-muted-foreground hover:text-foreground border border-border rounded-xl transition-all text-[10px] font-black uppercase tracking-widest">
                  <Filter size={14} />
                  Taxonomy
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-muted-foreground hover:text-foreground border border-border rounded-xl transition-all text-[10px] font-black uppercase tracking-widest">
                  <Clock size={14} />
                  Chrono
                </button>
              </div>
            </div>

            {/* Post Grid */}
            <div className="grid grid-cols-1 gap-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
                  <p className="text-muted-foreground font-black text-xs uppercase tracking-widest">Synchronizing Matrix...</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {blogs.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase())).map((post, i) => (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group relative bg-card/30 border border-border hover:border-sky-500/40 rounded-[3rem] p-6 flex flex-col md:flex-row items-center gap-10 transition-all hover:bg-secondary/20 overflow-hidden backdrop-blur-sm shadow-2xl shadow-black/10"
                    >
                      <div className="absolute top-0 right-0 p-12 text-sky-500 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none rotate-12">
                        <FileText size={180} />
                      </div>

                      <div className="w-full md:w-56 h-40 rounded-[2rem] overflow-hidden relative shrink-0 border border-border shadow-2xl skew-x-1 group-hover:skew-x-0 transition-all duration-700">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent opacity-60" />
                        <div className="absolute bottom-4 left-4">
                          <span className="px-3 py-1 bg-background/50 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-[0.2em] border border-white/10">
                            {post.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 space-y-4 relative z-10">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          <span className="text-sky-500 italic">{post.author}</span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span className="flex items-center gap-1.5 bg-secondary px-2 py-0.5 rounded border border-border">
                            <Eye size={12} className="text-sky-500" /> {post.views || 0} Views
                          </span>
                        </div>
                        
                        <h3 className="text-2xl font-black text-foreground group-hover:text-sky-500 transition-colors line-clamp-2 leading-none tracking-tighter">
                          {post.title}
                        </h3>

                        <div className="flex items-center gap-6">
                          <div className={`flex items-center gap-2 py-1.5 px-4 rounded-full text-[9px] font-black uppercase tracking-widest border ${post.is_published ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${post.is_published ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-orange-500'}`} />
                            {post.is_published ? 'published' : 'draft'}
                          </div>
                          {post.is_published && (
                             <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase">
                               <TrendingUp size={14} className="text-emerald-500" />
                               <span className="text-foreground">+12.4%</span> Velocity
                             </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 relative z-10">
                        <button 
                          onClick={() => {
                            setEditingBlog(post);
                            setView('editor');
                          }}
                          className="p-4 bg-secondary border border-border rounded-2xl text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-all shadow-lg shadow-black/5 active:scale-95"
                        >
                          <Edit3 size={20} />
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-4 bg-secondary border border-border rounded-2xl text-muted-foreground hover:text-red-400 hover:border-red-400/20 transition-all shadow-lg shadow-black/5 active:scale-95"
                        >
                          <Trash2 size={20} />
                        </button>
                        <div className="h-10 w-px bg-border mx-1" />
                        <button className="p-4 bg-sky-500 text-white rounded-2xl transition-all shadow-lg shadow-sky-500/20 hover:scale-105 active:scale-95">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card/30 border border-border rounded-[3rem] p-10 backdrop-blur-xl"
          >
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black italic tracking-tighter">
                {editingBlog?.id ? 'Edit' : 'Initialize'} <span className="text-sky-500">Transmission</span>
              </h3>
              <button 
                onClick={() => setView('list')}
                className="p-3 bg-secondary border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Type size={14} className="text-sky-500" /> Post Title
                  </label>
                  <input 
                    type="text" 
                    value={editingBlog?.title || ''}
                    onChange={(e) => setEditingBlog({...editingBlog, title: e.target.value})}
                    placeholder="Enter a compelling title..."
                    className="w-full bg-secondary/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Tag size={14} className="text-sky-500" /> Category
                  </label>
                  <select 
                    value={editingBlog?.category || ''}
                    onChange={(e) => setEditingBlog({...editingBlog, category: e.target.value})}
                    className="w-full bg-secondary/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all appearance-none"
                  >
                    <option value="Innovation">Innovation</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Research">Research</option>
                    <option value="Ecosystem">Ecosystem</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ImageIcon size={14} className="text-sky-500" /> Cover Matrix URI
                </label>
                <input 
                  type="text" 
                  value={editingBlog?.image || ''}
                  onChange={(e) => setEditingBlog({...editingBlog, image: e.target.value})}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-secondary/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <FileText size={14} className="text-sky-500" /> Content Payload (Excerpt)
                </label>
                <textarea 
                  value={editingBlog?.excerpt || ''}
                  onChange={(e) => setEditingBlog({...editingBlog, excerpt: e.target.value})}
                  placeholder="A brief summary for the preview grid..."
                  rows={2}
                  className="w-full bg-secondary/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Zap size={14} className="text-sky-500" /> Core Narrative (HTML/Markdown)
                </label>
                <textarea 
                  value={editingBlog?.content || ''}
                  onChange={(e) => setEditingBlog({...editingBlog, content: e.target.value})}
                  placeholder="Write your article core here..."
                  rows={8}
                  className="w-full bg-secondary/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all resize-none font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <div className="flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setEditingBlog({...editingBlog, is_published: !editingBlog?.is_published})}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${editingBlog?.is_published ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-secondary text-muted-foreground border-border'}`}
                  >
                    {editingBlog?.is_published ? <Globe size={14} /> : <Lock size={14} />}
                    {editingBlog?.is_published ? 'Public' : 'Draft'}
                  </button>
                </div>
                
                <div className="flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setView('list')}
                    className="px-8 py-4 text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-foreground"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-3 px-10 py-4 bg-sky-500 text-white font-black rounded-2xl shadow-[0_10px_30px_rgba(14,165,233,0.2)] hover:shadow-[0_15px_40px_rgba(14,165,233,0.3)] transition-all hover:-translate-y-1 active:scale-95 text-xs tracking-widest uppercase italic disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {editingBlog?.id ? 'Patch Matrix' : 'Initialize Transmission'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
    </AdminLayout>
  );
};
