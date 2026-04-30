import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Calendar, Clock, Share2, Bookmark, MessageSquare, ChevronRight, Check } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Button } from "../../components/ui/button";
import PageMetadata from "../../components/PageMetadata";
import ConfigService from "../../services/ConfigService";
import { useToast } from "../../hooks/use-toast";

interface ApiBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image: string | null;
  read_time?: string | null;
  created_at: string;
}

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [post, setPost] = useState<ApiBlogPost | null>(null);
  const [nextPost, setNextPost] = useState<ApiBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;

    const fetchPostData = async () => {
      setLoading(true);
      try {
        const apiUrl = ConfigService.getApiUrl();
        
        // Fetch current post
        const res = await fetch(`${apiUrl}/api/blogs/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.blog) {
            setPost(data.blog);
            
            // Fetch all posts to find the next one
            const allRes = await fetch(`${apiUrl}/api/blogs`);
            if (allRes.ok) {
              const allData = await allRes.json();
              if (allData.success && Array.isArray(allData.blogs)) {
                const currentIndex = allData.blogs.findIndex((b: ApiBlogPost) => b.id === data.blog.id || b.slug === data.blog.slug);
                if (currentIndex !== -1) {
                  // Get the next post, or the first one if current is last
                  const nextIdx = (currentIndex + 1) % allData.blogs.length;
                  if (allData.blogs.length > 1) {
                    setNextPost(allData.blogs[nextIdx]);
                  }
                }
              }
            }
            
            setLoading(false);
            return;
          }
        }
        setNotFound(true);
      } catch (error) {
        console.error("Fetch error:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [id]);

  const handleShare = async () => {
    if (!post) return;

    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully",
          description: "Thank you for spreading the word!",
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied to clipboard",
          description: "You can now paste and share it anywhere.",
        });
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: !isBookmarked ? "Added to bookmarks" : "Removed from bookmarks",
      description: !isBookmarked ? "You can access this article from your dashboard later." : "Article removed from your reading list.",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full" 
        />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Initializing Article...</p>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4 text-center">
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Transmission Lost</h1>
        <p className="text-gray-500 max-w-md font-medium">
          The article you are looking for has been moved or deleted from our database.
        </p>
        <Button 
          className="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-8 py-6 font-bold transition-all shadow-lg shadow-sky-500/20"
          onClick={() => navigate("/resources/blogs")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog Feed
        </Button>
      </div>
    );
  }

  const displayDate = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "ColabWize",
    },
    datePublished: post.created_at,
    mainEntityOfPage: `https://app.colabwize.com/resources/blogs/${post.slug}`,
  };

  return (
    <>
      <PageMetadata
        title={`${post.title} | ColabWize Blog`}
        description={post.excerpt}
        ogType="article">
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </PageMetadata>

      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-16 left-0 right-0 h-1 bg-sky-500 z-50 origin-left"
        style={{ scaleX }}
      />

      <article className="min-h-screen bg-slate-50/30">
        {/* Cinematic Hero */}
        <div className="relative h-[50vh] min-h-[400px] w-full bg-gray-900 overflow-hidden">
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 1.5 }}
            src={post.image || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&h=900&fit=crop"}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-50/30" />
        </div>

        {/* Article Header Card */}
        <div className="container-custom max-w-4xl -mt-40 relative z-10">
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white border border-slate-100 rounded-3xl p-8 md:p-12 shadow-2xl shadow-slate-200/50"
          >
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="px-4 py-1.5 bg-sky-50 text-sky-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-sky-100">
                {post.category}
              </span>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <Clock className="h-3 w-3" />
                <span>{post.read_time || "6 min read"}</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-sky-600">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-slate-900 font-bold text-sm">{post.author}</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{displayDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full text-slate-400 hover:text-sky-500 transition-colors"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full transition-colors ${isBookmarked ? 'text-sky-500 bg-sky-50' : 'text-slate-400 hover:text-sky-500'}`}
                  onClick={handleBookmark}
                >
                  <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-sky-500' : ''}`} />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Body */}
        <div className="container-custom max-w-4xl py-16 md:py-24">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="prose prose-lg md:prose-xl prose-slate max-w-none 
                  prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-slate-900
                  prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium
                  prose-a:text-sky-500 prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-4 prose-blockquote:border-sky-500 prose-blockquote:bg-sky-50/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:italic
                  prose-img:rounded-2xl prose-img:shadow-lg
                  prose-strong:text-slate-900 prose-strong:font-bold"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags or Bottom Meta */}
              <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posted in:</p>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-slate-600 border-slate-200 hover:bg-slate-50 transition-all gap-2 px-4"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`rounded-full transition-all gap-2 px-4 ${isBookmarked ? 'text-sky-600 border-sky-200 bg-sky-50' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                      onClick={handleBookmark}
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-sky-600' : ''}`} />
                      {isBookmarked ? 'Saved' : 'Save for later'}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <button className="flex items-center gap-2 text-slate-400 hover:text-sky-500 transition-colors text-xs font-bold uppercase tracking-widest">
                     <MessageSquare className="h-4 w-4" />
                     Comments (0)
                   </button>
                </div>
              </div>
            </div>

            {/* Sidebar (Optional) */}
            <aside className="lg:w-64 shrink-0 space-y-12">
               <div className="sticky top-24 space-y-12">
                 <div className="space-y-4">
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">About Author</h4>
                   <p className="text-sm text-slate-500 leading-relaxed font-medium">
                     {post.author} is a senior contributor to ColabWize, focusing on academic integrity and the intersection of AI and education.
                   </p>
                 </div>

                 {nextPost && (
                   <div className="space-y-6">
                     <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Next in Series</h4>
                     <Link to={`/resources/blogs/${nextPost.slug || nextPost.id}`} className="group block space-y-3">
                       <div className="aspect-video rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                          <img 
                            src={nextPost.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"} 
                            alt={nextPost.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                       </div>
                       <p className="text-xs font-bold text-slate-900 group-hover:text-sky-500 transition-colors line-clamp-2 leading-tight">
                         {nextPost.title}
                       </p>
                       <p className="flex items-center gap-1 text-[10px] font-bold text-sky-500 uppercase tracking-widest">
                         Read Next <ChevronRight className="h-3 w-3" />
                       </p>
                     </Link>
                   </div>
                 )}
               </div>
            </aside>
          </div>
        </div>

        {/* Premium Bottom CTA */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-50/50" />
          
          {/* Animated Background Gradients */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-400/20 blur-[100px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-400/20 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="container-custom max-w-5xl relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-slate-200"
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
                Ready to elevate <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">your research?</span>
              </h2>
              
              <p className="text-slate-400 mb-12 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                Join thousands of academics using ColabWize to maintain integrity and enhance collaboration.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                 <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-12 py-8 text-xl font-black shadow-2xl shadow-sky-500/40 transition-all hover:scale-105 active:scale-95">
                   Start Free Trial
                 </Button>
                 <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5 rounded-full px-10 py-8 text-lg font-bold transition-all underline underline-offset-8 decoration-sky-500/30">
                   View Pricing Plan
                 </Button>
              </div>

              {/* Verified Badge */}
              <div className="mt-12 flex items-center justify-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-800 bg-slate-700 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                    </div>
                  ))}
                </div>
                <span>Trusted by 2,000+ researchers</span>
              </div>
            </motion.div>
          </div>
        </section>
      </article>
    </>
  );
}
