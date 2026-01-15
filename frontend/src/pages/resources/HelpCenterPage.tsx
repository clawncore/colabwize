import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Book,
  CreditCard,
  Settings,
  MessageCircle,
  Zap,
  ArrowRight,
  LifeBuoy,
  Mail,
  Shield,
  FileCheck,
} from "lucide-react";
import Layout from "../../components/Layout";
import ConfigService from "../../services/ConfigService";

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const docsUrl = ConfigService.getDocsUrl();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to external docs search with query parameter
      window.open(
        `${docsUrl}/search?q=${encodeURIComponent(searchQuery)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  const categories = [
    {
      icon: Zap,
      title: "Getting Started",
      description:
        "New to ColabWize? Learn the basics, set up your account, and start your first project.",
      link: `${docsUrl}/quickstart`,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      borderColor: "border-yellow-100",
    },
    {
      icon: FileCheck,
      title: "Features & Guides",
      description:
        "Deep dives into Originality Scanning, AI Detection, and Citation tools.",
      link: `${docsUrl}/features`,
      color: "text-blue-600",
      bg: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      icon: CreditCard,
      title: "Billing & Plans",
      description:
        "Manage your subscription, view invoices, and understand pricing tiers.",
      link: `${docsUrl}/billing`,
      color: "text-green-600",
      bg: "bg-green-50",
      borderColor: "border-green-100",
    },
    {
      icon: Settings,
      title: "Account Management",
      description:
        "Update your profile settings, security preferences, and team members.",
      link: `${docsUrl}/account`,
      color: "text-purple-600",
      bg: "bg-purple-50",
      borderColor: "border-purple-100",
    },
    {
      icon: LifeBuoy,
      title: "Troubleshooting",
      description:
        "Solutions to common errors, connection issues, and account problems.",
      link: `${docsUrl}/troubleshooting`,
      color: "text-red-600",
      bg: "bg-red-50",
      borderColor: "border-red-100",
    },
    {
      icon: Shield,
      title: "Privacy & Policy",
      description:
        "Read about our Terms of Service, Privacy Policy, and Data Security.",
      link: `${docsUrl}/privacy`,
      color: "text-gray-600",
      bg: "bg-gray-50",
      borderColor: "border-gray-100",
    },
  ];

  const popularArticles = [
    {
      title: "How to interpret Originality Reports",
      link: `${docsUrl}/originality`,
      readTime: "5 min read",
    },
    {
      title: "How to upgrade or downgrade your plan",
      link: `${docsUrl}/billing`,
      readTime: "2 min read",
    },
    {
      title: "Generating an Authorship Certificate",
      link: `${docsUrl}/certificate`,
      readTime: "3 min read",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen px-8 bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-blue-50 to-white pb-16 pt-16">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                How can we help you?
              </h1>
              <p className="text-xl text-gray-600 mb-10">
                Find answers, read guides, or get in touch with our support
                team.
              </p>

              {/* Search Bar */}
              <form
                onSubmit={handleSearch}
                className="relative max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for articles, guides, and help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-shadow hover:shadow-md"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="container-custom py-12">
          {/* Help Categories */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Browse by Category
              </h2>
              <a
                href="https://docs.colabwize.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium hover:text-blue-800 flex items-center">
                View all documentation
                <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <a
                  key={index}
                  href={category.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block p-6 rounded-xl border ${category.borderColor} hover:shadow-lg transition-all duration-300 group bg-white`}>
                  <div
                    className={`w-12 h-12 rounded-lg ${category.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <category.icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {category.description}
                  </p>
                </a>
              ))}
            </div>
          </section>

          {/* Popular Articles */}
          <section className="mb-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Popular Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularArticles.map((article, index) => (
                <a
                  key={index}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col p-5 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                  <div className="flex items-start mb-2">
                    <Book className="h-5 w-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                    <h3 className="font-semibold text-gray-900 leading-snug">
                      {article.title}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-500 ml-8">
                    {article.readTime}
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* Contact/Support CTA */}
          <section className="bg-gray-50 rounded-2xl p-8 md:p-12 border border-gray-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide mb-4">
                  Still need help?
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Can't find what you're looking for?
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Our support team is here to help you. We typically respond
                  within 24 hours during business days.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
                    <Mail className="h-5 w-5 mr-2" />
                    Contact Support
                  </Link>
                  <a
                    href="https://discord.gg/2MMSdX3Uee"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                    <MessageCircle className="h-5 w-5 mr-2 text-[#5865F2]" />
                    Join Community
                  </a>
                </div>
              </div>

              <div className="flex-shrink-0 relative">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-yellow-400 rounded-full opacity-10 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-32 h-32 bg-blue-400 rounded-full opacity-10 blur-2xl"></div>
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=80"
                  alt="Support Team"
                  className="relative rounded-xl shadow-lg w-full max-w-sm object-cover h-64 border border-gray-100"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default HelpCenterPage;
