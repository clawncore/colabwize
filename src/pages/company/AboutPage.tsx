import {
  Check,
  Users,
  Target,
  Heart,
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "../../components/ui/button";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";

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
            About{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              ColabWize
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            We're on a mission to transform academic anxiety into career
            confidence by helping students and researchers defend their work
            with integrity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
              onClick={handleGetStarted}>
              Join Our Mission
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              asChild>
              <RouterLink to="/company/careers">Join Our Team</RouterLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Feature Detail Component


// Features Presentation Flow
function FeaturesPresentationFlow() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="space-y-24">
          {/* Mission and Values Section */}
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white border border-gray-300 rounded-2xl p-8">
              <Target className="h-12 w-12 text-green-500 mb-6" />
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                In an age of AI-generated content, students and researchers face
                a high-stakes academic paradox: use AI tools and risk getting flagged,
                or don't use them and fall behind peers who do.
              </p>
              <p className="text-gray-600 leading-relaxed">
                ColabWize solves this by providing a defensibility-first
                platform that doesn't just help you write better—it proves your
                work is original, properly cited, and authentically authored.
              </p>
            </div>

            <div className="bg-white border border-gray-300 rounded-2xl p-8">
              <Heart className="h-12 w-12 text-green-500 mb-6" />
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Our Values
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-green-600 to-green-800 mt-2.5 flex-shrink-0"></div>
                  <span>
                    <strong>Integrity First:</strong> Academic honesty is
                    non-negotiable
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-green-600 to-green-800 mt-2.5 flex-shrink-0"></div>
                  <span>
                    <strong>Student-Centric:</strong> Built for students, by
                    people who care
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-green-600 to-green-800 mt-2.5 flex-shrink-0"></div>
                  <span>
                    <strong>Transparency:</strong> Clear pricing, no hidden
                    fees, honest communication
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-green-600 to-green-800 mt-2.5 flex-shrink-0"></div>
                  <span>
                    <strong>Innovation:</strong> Constantly improving to serve
                    you better
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Stats Section */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
              Built for Academia
            </h2>
            <div className="grid md:grid-cols-4 gap-8 mb-16">
              <div className="bg-white border border-gray-300 rounded-2xl p-6">
                <div className="text-xl font-bold text-green-500 mb-2">
                  Global Reach
                </div>
                <div className="text-gray-600">Used by students across multiple institutions</div>
              </div>
              <div className="bg-white border border-gray-300 rounded-2xl p-6">
                <div className="text-xl font-bold text-green-500 mb-2">
                  Proven Scale
                </div>
                <div className="text-gray-600">Thousands of documents processed</div>
              </div>
              <div className="bg-white border border-gray-300 rounded-2xl p-6">
                <div className="text-xl font-bold text-green-500 mb-2">
                  Accuracy First
                </div>
                <div className="text-gray-600">Designed for precision and explainability</div>
              </div>
              <div className="bg-white border border-gray-300 rounded-2xl p-6">
                <div className="text-xl font-bold text-green-500 mb-2">
                  Real-Time
                </div>
                <div className="text-gray-600">Instant analysis and feedback</div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-white border border-gray-300 rounded-2xl p-8">
            <div className="text-center mb-8">
              <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                The People Behind ColabWize
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                ColabWize is built and maintained by a small, technically focused team committed to academic integrity and transparency.
              </p>
              <div className="flex flex-col gap-2">
                <p className="text-xl font-semibold text-gray-800">Simbisai Chinhema</p>
                <p className="text-xl font-semibold text-gray-800">Craig Marowa</p>
              </div>
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
      <div className="absolute inset-0 bg-gradient-to-r from-green-100/20 to-emerald-100/20 opacity-95"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-green-300/30 rounded-full"></div>
        <div className="absolute top-40 right-20 w-16 h-16 border-2 border-green-300/30 rotate-45"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 border-2 border-green-300/30 rounded-full"></div>
        <div className="absolute bottom-40 right-10 w-12 h-12 border-2 border-green-300/30 rotate-12"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Join Us on Our Mission
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Whether you're a student, researcher, or institution, we're here to
            help you succeed with integrity.
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
              <RouterLink to="/docs/quickstart" className="flex items-center">
                See How It Works
              </RouterLink>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-gray-600 text-sm">
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

export default function AboutPage() {
  return (
    <Layout>
      <IntroHero />
      <FeaturesPresentationFlow />
      <ClosingCTA />
    </Layout>
  );
}
