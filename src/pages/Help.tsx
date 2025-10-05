"use client";

import { useState } from "react";
import {
  Search,
  Rocket,
  Sparkles,
  HelpCircle,
  TestTube,
  Shield,
  Download,
  MessageCircle,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Target,
  Lightbulb,
} from "lucide-react";

interface Category {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  articles: string[];
}

interface FeaturedArticle {
  title: string;
  description: string;
  icon: React.ElementType;
  readTime: string;
}

interface HelpPageProps {
  onWaitlistClick: () => void;
}

export default function HelpPage({ onWaitlistClick }: HelpPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const categories: Category[] = [
    {
      icon: Rocket,
      title: "Getting Started (When We Launch)",
      description:
        "Everything you need to know for your first ColabWize project",
      color: "blue",
      articles: [
        "How to create your first project",
        "Importing from Word/Overleaf",
        "Setting up your dashboard",
        "Understanding the interface",
      ],
    },
    {
      icon: Sparkles,
      title: "Feature Previews",
      description: "Deep dives into ColabWize's powerful features",
      color: "purple",
      articles: [
        "Using the AI Writing Assistant",
        "Smart Citations explained",
        "Real-time collaboration overview",
        "Advanced formatting options",
      ],
    },
    {
      icon: HelpCircle,
      title: "Waitlist & Launch FAQ",
      description:
        "Common questions about our launch timeline and early access",
      color: "green",
      articles: [
        "When will ColabWize launch?",
        "What are the benefits of joining the waitlist?",
        "Is there a free plan available at launch?",
        "How do referrals work?",
      ],
    },
    {
      icon: TestTube,
      title: "Beta Testing Info",
      description: "Information for beta testers and early access users",
      color: "orange",
      articles: [
        "How to qualify for the private beta",
        "Reporting bugs and giving feedback",
        "The beta tester community",
        "Beta testing timeline",
      ],
    },
  ];

  const featuredArticles: FeaturedArticle[] = [
    {
      title: "5 Tips to Get the Most Out of ColabWize",
      description:
        "Maximize your productivity with these expert recommendations",
      icon: Target,
      readTime: "5 min read",
    },
    {
      title: "How Our Plagiarism Detection Works",
      description: "Understanding our advanced originality checking system",
      icon: Shield,
      readTime: "8 min read",
    },
    {
      title: "Exporting Projects to DOCX, PDF, and LaTeX",
      description: "Seamlessly export your work in any format you need",
      icon: Download,
      readTime: "3 min read",
    },
  ];

  const filteredCategories = categories.filter(
    (category) =>
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.articles.some((article) =>
        article.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20 px-6">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=800&fit=crop')",
          }}
        ></div>

        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Learn What's Coming
          </h1>

          <p className="text-xl lg:text-2xl mb-12 text-blue-100 leading-relaxed">
            Explore ColabWize features, read launch FAQs, and see how
            we're building the future of academic writing.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search
                className="absolute left-4 top-4 text-gray-400"
                size={24}
              />
              <input
                type="text"
                placeholder="Search features, launch details, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Early Access Info Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 py-4 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="font-semibold flex items-center justify-center">
            <Lightbulb className="mr-2" size={20} />
            📢 Early Access Info: These documents and articles are for waitlist
            members to understand the features and platform structure that will
            be available upon launch.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Help Categories
          </h2>
          <p className="text-xl text-center text-gray-600 mb-16">
            Find answers organized by topic and launch phase.
          </p>

          <div className="grid lg:grid-cols-2 gap-8">
            {filteredCategories.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer group"
              >
                <div className="flex items-start mb-6">
                  <div
                    className={`w-16 h-16 bg-${category.color}-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-${category.color}-200 transition-colors`}
                  >
                    <category.icon
                      className={`text-${category.color}-600`}
                      size={32}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {category.articles
                    .slice(0, 4)
                    .map((article, articleIndex) => (
                      <div
                        key={articleIndex}
                        className="flex items-center text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <ArrowRight className="mr-2 flex-shrink-0" size={16} />
                        <span className="text-sm">{article}</span>
                      </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    className={`text-${category.color}-600 hover:text-${category.color}-700 font-semibold text-sm flex items-center`}
                  >
                    View All Articles
                    <ArrowRight className="ml-1" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {searchQuery && filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-gray-400" size={48} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600 mb-6">
                Try searching with different keywords or browse our categories
                above.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Featured Articles
          </h2>

          <div className="grid lg:grid-cols-3 gap-8">
            {featuredArticles.map((article, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <article.icon className="text-blue-600" size={24} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>

                <p className="text-gray-600 mb-4 leading-relaxed">
                  {article.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {article.readTime}
                  </span>
                  <ArrowRight
                    className="text-blue-600 group-hover:translate-x-1 transition-transform"
                    size={16}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community & Feedback Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Didn't Find What You Were Looking For?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Our community and support team are here to help you succeed.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-purple-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ask the Community
              </h3>
              <p className="text-gray-600 mb-6">
                Connect with other students and researchers in our growing
                community forum.
              </p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                Join Community
              </button>
              <p className="text-sm text-gray-500 mt-3">
                Coming with launch in Q1 2025
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="text-blue-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Support
              </h3>
              <p className="text-gray-600 mb-6">
                Get personalized help from our support team. We typically
                respond within 24 hours.
              </p>
              <a
                href="/contact"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors inline-block"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Teaser */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Our Beta Testers Are Saying
          </h2>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "ColabWize feels like the tool I've been waiting for my entire PhD.",
                author: "Sarah M., PhD Student",
                role: "Biology, Stanford University",
                rating: 5,
              },
              {
                quote:
                  "Finally, I can focus on writing instead of switching between apps.",
                author: "Marcus T., Researcher",
                role: "Computer Science, MIT",
                rating: 5,
              },
              {
                quote:
                  "The plagiarism detection caught issues I completely missed.",
                author: "Elena R., Undergraduate",
                role: "Psychology, UC Berkeley",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="text-yellow-400 fill-current"
                      size={16}
                    />
                  ))}
                </div>

                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.quote}"
                </p>

                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Your Success is Our Mission
          </h2>

          <p className="text-xl mb-12 text-blue-100">
            ColabWize is built to help you focus on learning and creating.
            If you need help, we've got your back.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                Early Access Support
              </h3>
              <p className="text-blue-100 mb-4">
                Get priority support as an early access member when we launch.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Community Driven</h3>
              <p className="text-blue-100 mb-4">
                Join a community of students and researchers building the future
                together.
              </p>
            </div>
          </div>

          <button
            onClick={onWaitlistClick}
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-xl px-12 py-4 rounded-xl transition-colors"
          >
            Join Waitlist
          </button>

          <p className="text-sm text-blue-200 mt-6">
            Get early access to help resources and priority support when we
            launch.
          </p>
        </div>
      </section>
    </div>
  );
}