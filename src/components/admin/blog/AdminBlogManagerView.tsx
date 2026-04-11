import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { apiClient } from '../../../services/apiClient';
import { StockPhotoPicker } from '../shared/StockPhotoPicker';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Globe, 
  Lock,
  FileText,
  Clock,
  Zap,
  ChevronRight,
  TrendingUp, 
  Loader2,
  X,
  Type,
  Image as ImageIcon,
  Tag,
  Save,
  Eye
} from 'lucide-react';
import { EmailComposerEditor } from '../email/EmailComposerEditor';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  views?: string;
}

export const AdminBlogManagerView: React.FC = () => {
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'published' | 'drafts' | 'stats'>('all');
  
  // Editor State
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const { setSubSidebar } = useOutletContext<{ setSubSidebar: (node: React.ReactNode) => void }>();

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
    
    // Detailed validation
    const missing = [];
    if (!editingBlog?.title) missing.push('Title');
    if (!editingBlog?.content) missing.push('Content');
    if (!editingBlog?.excerpt) missing.push('Excerpt');
    if (!editingBlog?.author) missing.push('Author');
    if (!editingBlog?.category) missing.push('Category');

    if (missing.length > 0) {
      alert(`Missing required fields: ${missing.join(', ')}`);
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        ...editingBlog,
        published_at: editingBlog.published_at || null
      };

      if (editingBlog.id) {
        await apiClient.patch(`/api/admin/blogs/${editingBlog.id}`, payload);
      } else {
        await apiClient.post('/api/admin/blogs', payload);
      }
      await fetchBlogs();
      setView('list');
      setEditingBlog(null);
    } catch (error: any) {
      console.error('Failed to save blog:', error);
      alert(error.message || 'Failed to save blog post');
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
      <div className="px-2 mb-6">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-sky-600">Blog Management</h2>
        <p className="text-lg font-bold text-slate-900 tracking-tight">Blog Content</p>
      </div>

      {[
        { id: 'all', label: 'All Postings', icon: FileText },
        { id: 'published', label: 'Live Entries', icon: Globe },
        { id: 'drafts', label: 'Unstable Drafts', icon: Lock },
        { id: 'stats', label: 'Engagement Stats', icon: Zap },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveFilter(item.id as any)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
            activeFilter === item.id
              ? "bg-sky-50 text-sky-600 border border-sky-100" 
              : "bg-white border border-slate-100 text-slate-500 hover:text-sky-600 hover:border-sky-200 hover:bg-slate-50/50"
          }`}
        >
          <item.icon size={14} />
          <span>{item.label}</span>
        </button>
      ))}

      <div className="mt-8 pt-8 border-t border-slate-100">
         <button 
           onClick={() => {
                setEditingBlog({
                  title: '',
                  excerpt: '',
                  content: '',
                  author: 'CLAWNCORE',
                  category: 'Academic Writing',
                  published_at: new Date().toISOString().split('T')[0],
                  image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
                  is_published: false
                });
                setView('editor');
              }}
           className="w-full flex items-center justify-center gap-3 py-3.5 bg-sky-500 text-white font-bold rounded-xl shadow-sm hover:bg-sky-600 transition-all text-[11px] uppercase tracking-widest"
         >
            <Plus size={16} />
            Create New Post
         </button>
      </div>
    </div>
  );

  // Mount sidebar into the layout — must be AFTER subSidebar is defined
  useEffect(() => {
    setSubSidebar(subSidebar);
    return () => setSubSidebar(null);
  }, [view, activeFilter, editingBlog, setSubSidebar, subSidebar]);

  return (
    <>
        {/* Header Section */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Blog <span className="text-sky-500">Manager</span></h2>
            <p className="text-slate-400 mt-2 font-semibold text-[10px] uppercase tracking-widest flex items-center gap-2">
               <span className="h-1.5 w-1.5 rounded-full bg-sky-500/60" />
               Manage your articles and publications
            </p>
          </div>
        </div>

        {view === 'list' ? (
          <>
            {/* Search and Filters */}
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full translate-x-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search articles..."
                  className="w-full pl-12 pr-4 py-2.5 bg-transparent text-slate-900 border-none focus:ring-0 text-sm font-semibold placeholder:text-slate-300 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 pr-1">
                <button className="flex items-center gap-2 px-5 py-2 bg-white text-slate-500 hover:text-slate-900 border border-slate-200 rounded-xl transition-all text-[10px] font-bold uppercase tracking-wider">
                  <Filter size={12} />
                  Category
                </button>
                <button className="flex items-center gap-2 px-5 py-2 bg-white text-slate-500 hover:text-slate-900 border border-slate-200 rounded-xl transition-all text-[10px] font-bold uppercase tracking-wider">
                  <Clock size={12} />
                  Date
                </button>
              </div>
            </div>

            {/* Post Grid */}
            <div className="grid grid-cols-1 gap-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Loading articles...</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {blogs
                    .filter(b => {
                      const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase());
                      if (activeFilter === 'all') return matchesSearch;
                      if (activeFilter === 'published') return matchesSearch && b.is_published;
                      if (activeFilter === 'drafts') return matchesSearch && !b.is_published;
                      return matchesSearch;
                    })
                    .map((post, i) => (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group relative bg-white border border-slate-100 hover:border-sky-200 rounded-xl p-5 flex flex-col md:flex-row items-center gap-8 transition-all hover:shadow-sm overflow-hidden"
                    >
                      <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden relative shrink-0 border border-slate-100 transition-all duration-500">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-md text-[9px] font-bold text-slate-800 uppercase tracking-wider border border-white/20">
                            {post.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 space-y-3 relative z-10">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <span className="text-sky-600">{post.author}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-200" />
                          <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-200" />
                          <span className="flex items-center gap-1.5 opacity-80">
                            <Clock size={11} className="text-sky-500" /> {Math.ceil((post.content?.split(' ').length || 1) / 200)} min
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-2 leading-tight tracking-tight">
                          {post.title}
                        </h3>

                        <div className="flex items-center gap-4">
                          <div className={`flex items-center gap-1.5 py-1 px-3 rounded-full text-[9px] font-bold uppercase tracking-wider border ${post.is_published ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                            <div className={`h-1 w-1 rounded-full ${post.is_published ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {post.is_published ? 'published' : 'draft'}
                          </div>
                          {post.is_published && (
                             <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                               <TrendingUp size={12} className="text-emerald-500" />
                               <span className="text-slate-600">+12%</span> Growth
                             </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 relative z-10 border-l border-slate-50 pl-6">
                        <button 
                          onClick={() => {
                            setEditingBlog(post);
                            setView('editor');
                          }}
                          className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all active:scale-95"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-100 transition-all active:scale-95"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button className="p-3 bg-sky-50 text-sky-600 border border-sky-100 rounded-xl hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all active:scale-95 ml-2">
                          <ChevronRight size={18} />
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm"
          >
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                {editingBlog?.id ? 'Edit' : 'New'} <span className="text-sky-500">Post</span>
              </h3>
              <button 
                onClick={() => setView('list')}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                {/* Left Column: Editor Section */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Type size={14} className="text-sky-500" /> Post Title
                      </label>
                      <input 
                        type="text" 
                        value={editingBlog?.title || ''}
                        onChange={(e) => setEditingBlog({...editingBlog, title: e.target.value})}
                        placeholder="Enter a compelling title..."
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Tag size={14} className="text-sky-500" /> Category
                      </label>
                      <select 
                        value={editingBlog?.category || ''}
                        onChange={(e) => setEditingBlog({...editingBlog, category: e.target.value})}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all appearance-none text-slate-700 font-bold uppercase tracking-wider"
                      >
                        <option value="Academic Writing">Academic Writing</option>
                        <option value="AI & Education">AI & Education</option>
                        <option value="AI Ethics">AI Ethics</option>
                        <option value="Citations">Citations</option>
                        <option value="Authorship">Authorship</option>
                        <option value="Research">Research</option>
                        <option value="Academic Integrity">Academic Integrity</option>
                        <option value="Productivity">Productivity</option>
                        <option value="Innovation">Innovation</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Ecosystem">Ecosystem</option>
                        <option value="Research Skills">Research Skills</option>
                        <option value="AI Safety">AI Safety</option>
                        <option value="Writing Skills">Writing Skills</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Edit3 size={14} className="text-sky-500" /> Professional Author
                      </label>
                      <input 
                        type="text" 
                        value={editingBlog?.author || ''}
                        onChange={(e) => setEditingBlog({...editingBlog, author: e.target.value})}
                        placeholder="Author name..."
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Clock size={14} className="text-sky-500" /> Published Date
                      </label>
                      <input 
                        type="date" 
                        value={editingBlog?.published_at ? new Date(editingBlog.published_at).toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditingBlog({...editingBlog, published_at: e.target.value})}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <ImageIcon size={14} className="text-sky-500" /> Post Image URL
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={editingBlog?.image || ''}
                          onChange={(e) => setEditingBlog({...editingBlog, image: e.target.value})}
                          placeholder="Image URL..."
                          className="flex-1 bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-300"
                        />
                        <button
                          type="button"
                          onClick={() => setIsPickerOpen(true)}
                          className="px-4 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all shadow-sm"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <FileText size={14} className="text-sky-500" /> Brief Excerpt
                    </label>
                    <textarea 
                      value={editingBlog?.excerpt || ''}
                      onChange={(e) => setEditingBlog({...editingBlog, excerpt: e.target.value})}
                      placeholder="Transmission summary..."
                      rows={2}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all resize-none placeholder:text-slate-300 leading-relaxed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-2">
                      <Zap size={14} className="text-sky-500" /> Main Content
                    </label>
                    <div className="relative group">
                      <EmailComposerEditor 
                        value={editingBlog?.content || ''}
                        onChange={(html) => setEditingBlog(prev => ({ ...prev, content: html }))}
                        onImageClick={() => setIsPickerOpen(true)}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Transmission Preview */}
                <div className="hidden lg:block sticky top-8 space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Live Preview</p>
                  <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-200px)]">
                    <div className="p-10 overflow-y-auto custom-scrollbar">
                      {/* Preview Header */}
                      <div className="max-w-2xl mx-auto mb-10 text-center">
                        <div className="flex justify-center mb-6">
                          <span className="px-3 py-1 bg-sky-100 text-sky-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-sky-200/50">
                            {editingBlog?.category || 'General'}
                          </span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                          {editingBlog?.title || 'Initializing Transmission...'}
                        </h1>
                        <div className="flex items-center justify-center gap-6 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                          <span className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200" /> 
                            {editingBlog?.author || 'CLAWNCORE'}
                          </span>
                          <span>•</span>
                          <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      </div>
                      
                      {editingBlog?.image && (
                        <div className="max-w-4xl mx-auto mb-12 rounded-xl overflow-hidden border border-slate-100 shadow-sm aspect-[21/9]">
                          <img src={editingBlog.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div 
                        className="max-w-2xl mx-auto prose prose-slate prose-sm focus:outline-none leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: editingBlog?.content || '<p class="text-slate-300 italic">Content pending initialization...</p>' }}
                      />
                    </div>
                    
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">Official ColabWize Transmission Alpha</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Array */}
              <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setEditingBlog({...editingBlog, is_published: !editingBlog?.is_published})}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${editingBlog?.is_published ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}
                  >
                    {editingBlog?.is_published ? <Globe size={14} /> : <Lock size={14} />}
                    {editingBlog?.is_published ? 'Public Release' : 'Secure Draft'}
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setView('list')}
                    className="px-6 py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-3 px-10 py-4 bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 hover:bg-sky-600 hover:-translate-y-0.5 active:scale-95 text-[11px] tracking-widest uppercase transition-all disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {editingBlog?.id ? 'Commit Changes' : 'Create Post'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      <StockPhotoPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(url) => {
          setEditingBlog((prev) => ({ ...prev, image: url }));
          setIsPickerOpen(false);
        }}
        title="Pick a Cover Photo"
      />
    </>
  );
};
