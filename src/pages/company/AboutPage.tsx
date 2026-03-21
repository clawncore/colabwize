import { Check, Users, Target, Heart } from "lucide-react";
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
            Powering the Future of{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Collaborative Research
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            We're on a mission to unify academic team efforts, transforming
            fragmented research into a seamless, intelligent, and
            integrity-first collaborative experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
              onClick={handleGetStarted}>
              Join Our Mission
            </Button>
            <Button
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

// Features Presentation Flow
function FeaturesPresentationFlow() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="space-y-24">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white border border-gray-300 rounded-2xl p-8">
              <Target className="h-12 w-12 text-green-500 mb-6" />
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Our Mission: Unified Intelligence
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                In an increasingly complex academic landscape, the greatest
                breakthroughs happen through collaboration. However, team-based
                research often suffers from data silos, attribution confusion,
                and integrity risks.
              </p>
              <p className="text-gray-600 leading-relaxed">
                ColabWize solves this by providing a unified workspace where
                real-time collaboration meets intelligent research
                protection—ensuring every contribution is tracked, every
                citation is verified, and every team succeeds together.
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
                    <strong>Collaboration First:</strong> We believe teamwork is
                    the ultimate multiplier of individual genius.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-green-600 to-green-800 mt-2.5 flex-shrink-0"></div>
                  <span>
                    <strong>Unwavering Integrity:</strong> Every word is backed
                    by transparent authorship and verified research.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-green-600 to-green-800 mt-2.5 flex-shrink-0"></div>
                  <span>
                    <strong>Academic Empowerment:</strong> Built specifically to
                    help students and researchers reach their highest potential.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-green-600 to-green-800 mt-2.5 flex-shrink-0"></div>
                  <span>
                    <strong>Radical Transparency:</strong> Clear workflows,
                    honest communication, and open research practices.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Stats Section */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
              Empowering Teams Everywhere
            </h2>
            <div className="grid md:grid-cols-4 gap-8 mb-16">
              <div className="bg-white border border-gray-300 rounded-2xl p-6">
                <div className="text-xl font-bold text-green-500 mb-2">
                  Global Teams
                </div>
                <div className="text-gray-600">
                  Thousands of research squads collaborating worldwide.
                </div>
              </div>
              <div className="bg-white border border-gray-300 rounded-2xl p-6">
                <div className="text-xl font-bold text-green-500 mb-2">
                  Active Workspaces
                </div>
                <div className="text-gray-600">
                  Seamlessly organized projects at every scale.
                </div>
              </div>
              <div className="bg-white border border-gray-300 rounded-2xl p-6">
                <div className="text-xl font-bold text-green-500 mb-2">
                  Real-time Sync
                </div>
                <div className="text-gray-600">
                  Million+ collaborative interactions recorded.
                </div>
              </div>
              <div className="bg-white border border-gray-300 rounded-2xl p-6">
                <div className="text-xl font-bold text-green-500 mb-2">
                  Verified Integrity
                </div>
                <div className="text-gray-600">
                  Ensuring confidence in every shared document.
                </div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-white border border-gray-300 rounded-3xl p-12">
            <div className="text-center mb-16">
              <Users className="h-14 w-14 text-green-500 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                The Architects of ColabWize
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                ColabWize is built by a specialized team of engineers and
                research veterans dedicated to redefining the infrastructure of
                academic collaboration.
              </p>
            </div>
          </div>

          {/* The ColabWize Difference */}
          <div className="mt-24 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
              The ColabWize Difference
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Team Workspaces",
                  desc: "Shared environments where permissions, assets, and discussions are consolidated.",
                  icon: "TeamIcon",
                },
                {
                  title: "Real-time Sync",
                  desc: "Engineered for zero-latency editing across continents, ensuring teams stay aligned.",
                  icon: "SyncIcon",
                },
                {
                  title: "Verified Attribution",
                  desc: "Deep tracking of every contribution, providing clear proof of individual and collective effort.",
                  icon: "VerifyIcon",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-200 text-left">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 text-green-600">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Our Culture Section */}
          <div className="mt-32">
            <div className="text-center mb-16">
              <Heart className="h-14 w-14 text-green-500 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Our Culture
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                At ColabWize, we believe that the way we work together is just
                as important as the product we build. Our culture is the engine
                that drives our innovation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: "Radical Transparency",
                  desc: "We believe in open communication and sharing information broadly. Transparency builds trust and empowers everyone to make better decisions.",
                },
                {
                  title: "Collaborative Spirit",
                  desc: "We are better together. We foster an environment where diverse perspectives are valued and teamwork is the standard, not the exception.",
                },
                {
                  title: "Continuous Learning",
                  desc: "The world is always changing, and so are we. We embrace curiosity, encourage experimentation, and view every challenge as an opportunity to grow.",
                },
                {
                  title: "User-Obsessed",
                  desc: "Everything we do starts and ends with our users. We are dedicated to solving real problems for students and researchers around the globe.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-10 bg-white border border-gray-200 rounded-3xl hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/5 transition-all duration-300">
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {item.desc}
                  </p>
                </div>
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
      <div className="absolute inset-0 bg-gradient-to-r from-green-100/20 to-emerald-100/20 opacity-95"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-green-300/30 rounded-full"></div>
        <div className="absolute top-40 right-20 w-16 h-16 border-2 border-green-300/30 rotate-45"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 border-2 border-green-300/30 rounded-full"></div>
        <div className="absolute bottom-40 right-10 w-12 h-12 border-2 border-green-300/30 rotate-12"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 transition-all duration-300 hover:scale-105">
            Ready to Empower Your Research Team?
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Whether you're a small study group or a global research institution,
            ColabWize provides the tools you need to collaborate with absolute
            confidence and integrity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-xl hover:shadow-green-500/30 transition-all duration-300 text-lg rounded-xl"
              onClick={handleGetStarted}>
              Launch Your Workspace
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
