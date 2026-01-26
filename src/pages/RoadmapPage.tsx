import { Check, Calendar, Sparkles } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "../components/ui/button";
import Layout from "../components/Layout";
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
            Our{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Product Roadmap
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            See what we're building next. Vote on features and help shape the
            future of ColabWize.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
              onClick={handleGetStarted}>
              See Our Vision
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              asChild>
              <RouterLink to="/contact">Request a Feature</RouterLink>
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
  const roadmap = [
    {
      quarter: "Q1 2026",
      status: "In Progress",
      items: [
        {
          title: "Mobile App (iOS & Android)",
          description: "Scan on the go",
          icon: "📱",
        },
        {
          title: "Browser Extension",
          description: "Scan directly from your browser",
          icon: "🔌",
        },
        {
          title: "Team Collaboration",
          description: "Share projects with advisors",
          icon: "👥",
        },
      ],
    },
    {
      quarter: "Q2 2026",
      status: "Planned",
      items: [
        {
          title: "Institutional Dashboard",
          description: "Admin panel for universities",
          icon: "🏛️",
        },
        {
          title: "Advanced Plagiarism Detection",
          description: "Copyscape & Turnitin integration",
          icon: "🔍",
        },
        {
          title: "Multi-Language Support",
          description: "Support for 10+ languages",
          icon: "🌍",
        },
      ],
    },
    {
      quarter: "Q3 2026",
      status: "Planned",
      items: [
        {
          title: "AI Writing Assistant",
          description: "Context-aware suggestions",
          icon: "✍️",
        },
        {
          title: "Citation Library",
          description: "Manage all your references",
          icon: "📚",
        },
        {
          title: "Export Templates",
          description: "Journal-specific formatting",
          icon: "📄",
        },
      ],
    },
    {
      quarter: "Q4 2026",
      status: "Planned",
      items: [
        {
          title: "Peer Review System",
          description: "Get feedback from peers",
          icon: "🤝",
        },
        {
          title: "Version Control",
          description: "Track document history",
          icon: "📜",
        },
        {
          title: "API Marketplace",
          description: "Third-party integrations",
          icon: "🛒",
        },
      ],
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="space-y-24">
          {roadmap.map((quarter, index) => (
            <div
              key={index}
              className="bg-white border border-gray-300 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {quarter.quarter}
                </h2>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${quarter.status === "In Progress"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                    }`}>
                  {quarter.status}
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {quarter.items.map((item, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-300 rounded-lg p-6">
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Roadmap Information */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How We Build Our Roadmap
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our roadmap is shaped by our users and our vision for academic
              integrity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-300 rounded-xl p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 mb-6">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Community Feedback
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We actively gather feedback from our users to prioritize
                features that matter most to the academic community.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-green-600 to-green-800 mt-2.5 flex-shrink-0"></div>
                  <span className="text-gray-600">
                    User surveys and feedback forms
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-green-600 to-green-800 mt-2.5 flex-shrink-0"></div>
                  <span className="text-gray-600">Feature voting system</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-green-600 to-green-800 mt-2.5 flex-shrink-0"></div>
                  <span className="text-gray-600">Beta testing programs</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-300 rounded-xl p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 mb-6">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Innovation & Research
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We continuously research new technologies and methodologies to
                improve academic integrity tools.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-green-600 to-green-800 mt-2.5 flex-shrink-0"></div>
                  <span className="text-gray-600">AI and ML research</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-green-600 to-green-800 mt-2.5 flex-shrink-0"></div>
                  <span className="text-gray-600">
                    Academic partnership programs
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-green-600 to-green-800 mt-2.5 flex-shrink-0"></div>
                  <span className="text-gray-600">Industry best practices</span>
                </li>
              </ul>
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
            Ready to Shape Our Future?
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Join thousands of researchers who help shape our product roadmap.
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

export default function RoadmapPage() {
  return (
    <Layout>
      <IntroHero />
      <FeaturesPresentationFlow />
      <ClosingCTA />
    </Layout>
  );
}
