import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, User, Tag } from "lucide-react";

interface BlogProps {
    onWaitlistClick: () => void;
}

export default function Blog({ onWaitlistClick }: BlogProps) {
    // Blog post data
    const blogPosts = [
        {
            id: "1",
            title: "Best Citation Tools 2025 — A Comprehensive Guide for Students",
            excerpt: "Discover the top citation tools for 2025 that can save you hours on formatting and referencing. Learn what features to look for and how to choose the right tool for your academic needs.",
            date: "November 15, 2025",
            author: "Dr. Sarah Johnson",
            readTime: "8 min read",
            category: "Citation Tools",
            image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=400&fit=crop"
        },
        {
            id: "2",
            title: "Best Plagiarism Checkers for Students in 2025",
            excerpt: "Discover the top plagiarism checkers for 2025 that can help you maintain academic integrity. Learn what features matter most and how to use these tools effectively.",
            date: "November 10, 2025",
            author: "Dr. Michael Reyes",
            readTime: "10 min read",
            category: "Plagiarism Detection",
            image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop"
        },
        {
            id: "3",
            title: "Tools for Collaborating on Research Papers: A Student's Guide",
            excerpt: "Discover the best tools and strategies for effective collaboration on academic research papers with classmates and advisors.",
            date: "November 5, 2025",
            author: "Alex Morgan",
            readTime: "12 min read",
            category: "Collaboration",
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop"
        },
        {
            id: "4",
            title: "How to Avoid Plagiarism in University: Essential Tips for Students",
            excerpt: "Learn practical strategies to maintain academic integrity and avoid unintentional plagiarism in your university coursework.",
            date: "October 30, 2025",
            author: "Dr. Emily Rodriguez",
            readTime: "7 min read",
            category: "Academic Integrity",
            image: "https://www.runsensible.com/wp-content/uploads/2024/06/Plagiarism-vs-Copyright-Infringement-main.jpg"
        },
        {
            id: "5",
            title: "APA vs MLA vs Chicago Citation Styles: When to Use Each",
            excerpt: "Understand the key differences between major citation styles and learn when to use APA, MLA, or Chicago in your academic writing.",
            date: "October 25, 2025",
            author: "Prof. David Wilson",
            readTime: "9 min read",
            category: "Citation Styles",
            image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&h=400&fit=crop"
        }
    ];

    return (
        <div className="w-full">
            {/* SEO Meta Tags */}
            <Helmet>
                <title>ColabWize Blog - Academic Writing Tips & Resources</title>
                <meta name="description" content="Learn about academic writing, citation tools, plagiarism detection, and research collaboration with our expert blog posts designed for students and researchers." />
                <meta name="keywords" content="academic writing blog, citation tools, plagiarism detection, research collaboration, student resources" />
                <link rel="canonical" href="https://colabwize.com/blog" />

                {/* JSON-LD Schemas */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Blog",
                        "name": "ColabWize Blog",
                        "description": "Academic writing tips, citation tools, plagiarism detection, and research collaboration resources.",
                        "url": "https://colabwize.com/blog"
                    })}
                </script>
            </Helmet>

            <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        ColabWize Blog
                    </h1>
                    <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
                        Expert tips, guides, and resources for academic writing, citation tools, plagiarism detection, and research collaboration.
                    </p>
                    <button
                        onClick={onWaitlistClick}
                        className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold inline-flex items-center space-x-2"
                    >
                        <span>Join Waitlist</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {blogPosts.map((post) => (
                            <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                <Link to={`/blog/${post.id}`}>
                                    <img
                                        src={post.image}
                                        alt="Student reading academic books while preparing citations"
                                        className="w-full h-48 object-cover"
                                    />
                                </Link>
                                <div className="p-6">
                                    <div className="flex items-center text-sm text-gray-500 mb-3">
                                        <Tag className="w-4 h-4 mr-1" />
                                        <span>{post.category}</span>
                                        <span className="mx-2">•</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                    <h2 className="text-xl font-bold mb-3 hover:text-blue-600 transition-colors">
                                        <Link to={`/blog/${post.id}`} className="text-gray-900 hover:text-blue-600">
                                            {post.title}
                                        </Link>
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <User className="w-4 h-4 mr-1" />
                                        <span className="mr-3">{post.author}</span>
                                        <Calendar className="w-4 h-4 mr-1" />
                                        <span>{post.date}</span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                            Load More Articles
                        </button>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold mb-8 text-center">Popular Categories</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {["Citation Tools", "Plagiarism Detection", "Collaboration", "Academic Integrity", "Citation Styles", "Research Tips"].map((category, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-semibold">{category}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6">Stay Updated with Our Latest Posts</h2>
                    <p className="text-xl text-gray-700 mb-8">
                        Join our waitlist to receive notifications when we publish new articles.
                    </p>
                    <button
                        onClick={onWaitlistClick}
                        className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg inline-flex items-center space-x-2"
                    >
                        <span>Join Waitlist</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>
        </div>
    );
}