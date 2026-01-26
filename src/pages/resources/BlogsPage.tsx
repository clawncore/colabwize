import { Check } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "../../components/ui/button";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { blogPosts } from "../../data/blogPosts";

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
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
              onClick={handleGetStarted}>
              Get Started
            </Button>
            <Button
              size="lg"
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

// FeatureDetail removed as it was unused

// Features Presentation Flow
function FeaturesPresentationFlow() {
  // blogPosts are now imported from shared data

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="space-y-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <article
                  key={index}
                  className="bg-white border border-gray-300 rounded-xl overflow-hidden hover:border-green-500/50 transition-all shadow-sm flex flex-col h-full">
                  <div className="p-8 flex flex-col h-full">
                    {/* Make Image Clickable */}
                    <RouterLink
                      to={`/resources/blogs/${post.id}`}
                      className="block mb-4 overflow-hidden rounded-lg group">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                    </RouterLink>

                    <span className="px-3 py-1 bg-green-600 rounded-full text-xs font-semibold text-white w-fit mb-4">
                      {post.category}
                    </span>

                    {/* Make Title Clickable */}
                    <RouterLink
                      to={`/resources/blogs/${post.id}`}
                      className="block">
                      <h2 className="text-2xl font-bold mb-3 text-gray-900 hover:text-green-600 transition-colors">
                        {post.title}
                      </h2>
                    </RouterLink>

                    <p className="text-gray-600 mb-6 flex-grow">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4">👤</span>
                        {post.author}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4">📅</span>
                        {post.date}
                      </div>
                    </div>

                    <Button
                      asChild
                      variant="link"
                      className="mt-4 p-0 text-green-600 justify-start w-fit group">
                      <RouterLink
                        to={`/resources/blogs/${post.id}`}
                        className="flex items-center gap-1">
                        Read more{" "}
                        <span className="transform group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </RouterLink>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
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
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
              onClick={handleGetStarted}>
              Start Your Free Trial
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
              <a
                href="https://docs.colabwize.com/quickstart"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
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
  return (
    <Layout>
      <IntroHero />
      <FeaturesPresentationFlow />
      <ClosingCTA />
    </Layout>
  );
}
