import { Check, Calendar, Sparkles, Users } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

// Intro Hero Section
function IntroHero() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <section className="section-padding bg-gradient-to-br from-white via-blue-50 to-cyan-50 relative overflow-hidden">
      <div className="absolute top-[-8rem] right-[-6rem] w-[34rem] h-[34rem] bg-blue-300/35 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10rem] left-[-8rem] w-[36rem] h-[36rem] bg-cyan-300/30 rounded-full blur-[120px]"></div>
      <div className="absolute top-1/3 left-1/2 w-[24rem] h-[24rem] bg-indigo-200/25 rounded-full blur-[100px]"></div>
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 z-0 mix-blend-multiply"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop')",
        }}></div>
      <div className="container-custom relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Our{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-700 bg-clip-text text-transparent">
              Product Roadmap
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            See what we're building next. Vote on features and help shape the
            future of ColabWize.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              onClick={handleGetStarted}>
              See Our Vision
            </Button>
            <Button
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
    <section className="section-padding bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/40 to-white pointer-events-none"></div>
      <div className="container-custom">
        <div className="relative z-10 grid gap-8">
          {roadmap.map((quarter, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-[2.5rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50/40 to-cyan-50/50 p-6 md:p-8 shadow-xl shadow-blue-900/5">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl"></div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-700 text-white shadow-lg shadow-blue-500/20">
                    <Calendar className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {quarter.quarter}
                  </h2>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    quarter.status === "In Progress"
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-white/80 text-slate-700 border border-blue-100"
                  }`}>
                  {quarter.status}
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {quarter.items.map((item, i) => (
                  <div
                    key={i}
                    className="group rounded-3xl border border-blue-100 bg-white/85 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-3xl ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-110">
                      {item.icon}
                    </div>
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
        <div className="relative z-10 mt-24 rounded-[2.5rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-8 md:p-12 shadow-xl shadow-blue-900/5">
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
            <div className="bg-white/85 border border-blue-100 rounded-[2rem] p-8 shadow-lg shadow-blue-900/5">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-700 mb-6 shadow-lg shadow-blue-500/20">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Community Feedback
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We actively gather feedback from our users to prioritize
                features that matter most to the academic community.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-600 to-cyan-700 mt-2.5 flex-shrink-0"></div>
                  <span className="text-gray-600">
                    User surveys and feedback forms
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-600 to-cyan-700 mt-2.5 flex-shrink-0"></div>
                  <span className="text-gray-600">Feature voting system</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-600 to-cyan-700 mt-2.5 flex-shrink-0"></div>
                  <span className="text-gray-600">Beta testing programs</span>
                </li>
              </ul>
              <Button
                asChild
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white font-semibold shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                <a
                  href="https://discord.gg/2MMSdX3Uee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center">
                  <Users className="mr-2 h-5 w-5" />
                  Join Our Community
                </a>
              </Button>
            </div>

            <div className="bg-white/85 border border-blue-100 rounded-[2rem] p-8 shadow-lg shadow-blue-900/5">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 mb-6 shadow-lg shadow-blue-500/20">
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
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-600 to-cyan-700 mt-2.5 flex-shrink-0"></div>
                  <span className="text-gray-600">AI and ML research</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-600 to-cyan-700 mt-2.5 flex-shrink-0"></div>
                  <span className="text-gray-600">
                    Academic partnership programs
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-600 to-cyan-700 mt-2.5 flex-shrink-0"></div>
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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 opacity-95"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-blue-300/40 rounded-full"></div>
        <div className="absolute top-40 right-20 w-16 h-16 border-2 border-cyan-300/40 rotate-45"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 border-2 border-blue-300/40 rounded-full"></div>
        <div className="absolute bottom-40 right-10 w-12 h-12 border-2 border-cyan-300/40 rotate-12"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto rounded-[3rem] border border-blue-100 bg-white/80 p-8 md:p-14 shadow-2xl shadow-blue-900/10 backdrop-blur-sm">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Shape Our Future?
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Join thousands of researchers who help shape our product roadmap.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              className="bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
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
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-600" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-600" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-600" />
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
    <>
      <IntroHero />
      <FeaturesPresentationFlow />
      <ClosingCTA />
    </>
  );
}
