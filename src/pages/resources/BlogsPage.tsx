import { useEffect, useState } from "react";
import { Check, Bookmark, Share2, MoreHorizontal, ThumbsUp, Clock } from "lucide-react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/button";
import Layout from "../../components/Layout";
import PageMetadata from "../../components/PageMetadata";
import ConfigService from "../../services/ConfigService";

interface ApiBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  image: string | null;
  created_at: string;
  published_at?: string | null;
  read_time?: string | null;
}

// Intro Hero Section
function IntroHero() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop')",
        }}></div>
      <div className="container-custom relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            ColabWize{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Blog
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Insights, tips, and best practices for academic writing and research
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
              onClick={handleGetStarted}>
              Get Started
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              asChild>
              <RouterLink to="/signup">Subscribe to Newsletter</RouterLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function useBlogPosts() {
  const [posts, setPosts] = useState<ApiBlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const apiUrl = ConfigService.getApiUrl();
        const res = await fetch(`${apiUrl}/api/blogs`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (data.success && Array.isArray(data.blogs)) {
          setPosts(data.blogs);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return { posts, loading };
}

// Closing CTA
function ClosingCTA() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <section className="section-padding relative overflow-hidden bg-white">
      {/* Background with academic shapes */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-emerald-100/50 opacity-95"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-green-300/30 rounded-full"></div>
        <div className="absolute top-40 right-20 w-16 h-16 border-2 border-green-300/30 rotate-45"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 border-2 border-green-300/30 rounded-full"></div>
        <div className="absolute bottom-40 right-10 w-12 h-12 border-2 border-green-300/30 rotate-12"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Stay Updated with Our Insights
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Subscribe to our newsletter for the latest tips and best practices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
              onClick={handleGetStarted}>
              Start Your Free Trial
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
              <a
                href="https://docs.colabwize.com/quickstart"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center">
                See How It Works
              </a>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Available worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default function BlogsPage() {
  const { posts, loading } = useBlogPosts();
  const [activeTab, setActiveTab] = useState<'for-you' | 'featured'>('for-you');
  const navigate = useNavigate();

  const displayPosts = posts;

  const renderBlogCard = (post: any, index: number) => {
    // Generate some fake meta for the "Medium" feel if not present
    const claps = Math.floor(Math.random() * 500) + 50;
    const date = new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    return (
      <motion.article 
        key={post.id || index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="py-10 border-b border-gray-100 last:border-0 group"
      >
        <div className="flex flex-col-reverse md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-4">
            {/* Author Meta */}
            <div className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center text-[10px] font-bold text-sky-600 border border-sky-200">
                {post.author.charAt(0)}
              </div>
              <span className="font-semibold text-gray-900">{post.author}</span>
              <span className="text-gray-400">in</span>
              <span className="font-medium text-gray-700 hover:text-sky-600 transition-colors cursor-pointer">{post.category}</span>
            </div>

            {/* Title & Excerpt */}
            <RouterLink to={`/resources/blogs/${post.slug || post.id}`} className="block group">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight tracking-tight group-hover:text-gray-600 transition-colors mb-2">
                {post.title}
              </h2>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-3 font-medium">
                {post.excerpt}
              </p>
            </RouterLink>

            {/* Bottom Meta & Actions */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                <div className="flex items-center gap-1.5 bg-sky-50 text-sky-600 px-2 py-0.5 rounded-full border border-sky-100">
                   <Check size={12} strokeWidth={3} />
                   <span>Verified</span>
                </div>
                <span>{date}</span>
                <div className="flex items-center gap-1.5 text-gray-400">
                   <Clock size={14} />
                   <span>{post.read_time || "5 min read"}</span>
                </div>
                <div className="flex items-center gap-1 hover:text-gray-600 cursor-default">
                  <ThumbsUp size={14} />
                  <span>{claps}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-400">
                <button className="hover:text-sky-500 transition-colors"><Bookmark size={18} /></button>
                <button className="hover:text-sky-500 transition-colors"><MoreHorizontal size={18} /></button>
              </div>
            </div>
          </div>

          {/* Right Sized Image */}
          <div className="w-full md:w-40 h-28 md:h-32 rounded-lg overflow-hidden shrink-0 border border-gray-100 shadow-sm relative group">
             <RouterLink to={`/resources/blogs/${post.slug || post.id}`}>
               <img 
                 src={post.image || ""} 
                 alt={post.title} 
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
               />
             </RouterLink>
          </div>
        </div>
      </motion.article>
    );
  };

  return (
    <Layout>
      <PageMetadata
        title="Blog | Academic Integrity & Collaboration Insights"
        description="Discover insights, tips, and best practices for academic writing, authorship verification, and maintaining academic integrity in the AI era."
      />
      
      <div className="bg-white min-h-screen pt-20 pb-20">
        <div className="container-custom max-w-4xl mx-auto px-6">
          
          {/* Header */}
          <header className="mb-12 border-b border-gray-100 pb-12">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-4">
              Academic <span className="text-sky-500">Transmission</span>
            </h1>
            <p className="text-lg text-gray-500 font-medium">Insights from the forefront of integrity and collaboration.</p>
          </header>

          {/* Tab Navigation */}
          <div className="flex items-center gap-8 border-b border-gray-100 mb-4 overflow-x-auto no-scrollbar">
            {[
              { id: 'for-you', label: 'For you' },
              { id: 'featured', label: 'Featured' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 text-sm font-bold tracking-tight relative transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Feed Grid */}
          <div className="space-y-2">
            {loading ? (
              <div className="space-y-12 py-10">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-8 items-start animate-pulse">
                    <div className="flex-1 space-y-4">
                      <div className="h-4 bg-gray-100 rounded w-1/4" />
                      <div className="h-8 bg-gray-100 rounded w-3/4" />
                      <div className="h-20 bg-gray-100 rounded w-full" />
                    </div>
                    <div className="w-40 h-32 bg-gray-100 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {displayPosts.map((post, index) => renderBlogCard(post, index))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Load More or Footer */}
          {!loading && displayPosts.length > 0 && (
            <div className="mt-12 text-center pt-12 border-t border-gray-100">
               <Button 
                 variant="outline" 
                 size="lg"
                 className="rounded-full px-8 bg-white border-gray-200 text-gray-900 hover:bg-gray-50 font-bold"
                 onClick={() => navigate('/signup')}
               >
                 Discover more stories
               </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
