import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Calendar, Clock, Share2 } from "lucide-react";
import Layout from "../../components/Layout";
import { Button } from "../../components/ui/button";
import { blogPosts } from "../../data/blogPosts";

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const post = blogPosts.find((p) => p.id === id);

  useEffect(() => {
    // Scroll to top when loading a new post
    window.scrollTo(0, 0);
  }, [id]);

  if (!post) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Post Not Found</h1>
          <p className="text-gray-600">The blog post you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/resources/blogs")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blogs
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="min-h-screen bg-white">
        {/* Header / Hero */}
        <div className="relative h-[400px] w-full bg-gray-900">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white container-custom">
            <Link 
              to="/resources/blogs" 
              className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blogs
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-green-600 rounded-full text-xs font-semibold">
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-300">
                <Clock className="h-4 w-4" /> {post.readTime}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 max-w-4xl leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-6 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border border-gray-500">
                  <User className="h-5 w-5" />
                </div>
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span>{post.date}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-custom max-w-3xl py-12 md:py-16">
          <div 
            className="prose prose-lg prose-indigo max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Footer Share */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Share this article</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
}
