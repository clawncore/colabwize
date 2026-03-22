import {
  Shield,
  Users,
  Bot,
  Zap,
  CheckCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  SearchCheck,
  History,
  LayoutDashboard,
  Database,
  PenTool,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import Layout from "../components/Layout";
import React, { useState, useEffect } from "react";
import ConfigService from "../services/ConfigService";

function HeroSection() {
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(50);

  const phrases = React.useMemo(
    () => [
      {
        text: "The Ultimate Fortress for Academic Integrity.",
        gradientWord: "Integrity.",
      },
      {
        text: "Write with Authority. Defend with Proof.",
        gradientWord: "Proof.",
      },
      {
        text: "Master Your Research. Secure Your Success.",
        gradientWord: "Success.",
      },
    ],
    [],
  );

  useEffect(() => {
    const currentPhrase = phrases[loopNum % phrases.length];
    const fullText = currentPhrase.text;

    const handleType = () => {
      if (isDeleting) {
        // Erasing
        setTypedText(fullText.substring(0, typedText.length - 1));
        setTypingSpeed(100); // Faster erasing

        if (typedText === "") {
          setIsDeleting(false);
          setLoopNum(loopNum + 1);
          setTypingSpeed(2500); // Pause before typing next phrase
        }
      } else {
        // Typing
        setTypedText(fullText.substring(0, typedText.length + 1));
        setTypingSpeed(50); // Normal typing speed

        if (typedText === fullText) {
          // Pause at end of phrase before deleting
          setTimeout(() => setIsDeleting(true), 2500);
        }
      }
    };

    const timer = setTimeout(handleType, typingSpeed);

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, loopNum, typingSpeed, phrases]);

  // Get current phrase for gradient handling
  const currentPhrase = phrases[loopNum % phrases.length];

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-white font-primary">
      {/* Content */}
      <div className="relative z-10 container-custom text-center mt-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-6 leading-tight">
            {typedText.includes(currentPhrase.gradientWord)
              ? typedText.replace(currentPhrase.gradientWord, "")
              : typedText}
            {typedText.includes(currentPhrase.gradientWord) && (
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                {currentPhrase.gradientWord}
              </span>
            )}
            {typedText && (
              <span className="animate-pulse ml-1 text-blue-400">|</span>
            )}
          </h1>

          <p className="text-lg md:text-xl text-gray-500 font-medium mb-8 max-w-2xl mx-auto leading-relaxed">
            A comprehensive academic integrity and defensibility platform
            designed to transform the writing process from a source of anxiety
            into a source of confidence. Collaborate seamlessly, cite with
            precision, and prove the authenticity of your work with ColabWize.
          </p>

          {/* CTAs */}
          <div className="flex flex-row gap-3 justify-center items-center mb-8 px-2 max-w-[100vw]">
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-4 py-4 md:px-8 md:py-6 text-sm md:text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300 whitespace-nowrap">
              <Link to="/signup" className="flex items-center">
                Start Free
                <ArrowRight className="ml-1 h-4 w-4 md:ml-2 md:h-5 md:w-5" />
              </Link>
            </Button>

            <Button
              asChild
              className="bg-gradient-to-r from-green-600 to-blue-700 text-white hover:from-green-700 hover:to-blue-800 font-semibold px-4 py-4 md:px-8 md:py-6 text-sm md:text-lg shadow-lg hover:shadow-green-500/20 transition-all duration-300 whitespace-nowrap">
              <Link to="/schedule-demo#demo-form" className="flex items-center">
                Request demo
                <ArrowRight className="ml-1 h-4 w-4 md:ml-2 md:h-5 md:w-5" />
              </Link>
            </Button>
          </div>

          {/* Enhanced Trust Indicator with People Icons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-400 text-sm">
            <div className="flex items-center gap-1">
              {/* User Icon Group */}
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Users className="h-3 w-3 text-white" />
                </div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Users className="h-3 w-3 text-white" />
                </div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Users className="h-3 w-3 text-white" />
                </div>
              </div>
              <span className="ml-2">Used by 10,000+ students</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-gray-500 rounded-full"></div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-blue-400 mr-1" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>

        {/* Editor Image */}
        <div className="mt-12 max-w-6xl mx-auto px-4">
          <img
            src="https://image2url.com/r2/default/gifs/1772299539496-34bfb324-dfb3-495e-bbac-029572fc2676.gif?w=1920&h=1080&fit=crop&crop=center"
            alt="Editor"
            className="w-full rounded-lg shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}

// Preview Section Component
function PreviewSection() {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      id: "citation-auditor",
      icon: SearchCheck,
      title: "Scientific Citation Auditor",
      description:
        "Protect your academic reputation. Our advanced engine cross-references every claim against millions of peer-reviewed sources to ensure 100% factual accuracy.",
      image:
        "https://i.ibb.co/sY9F6B3/Screenshot-2026-01-13-203136.png?w=800&q=80",
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      previewBg: "bg-green-50",
    },
    {
      id: "smart-citations",
      icon: Sparkles,
      title: "Intelligent Citation Engine",
      description:
        "Source with confidence. Instantly discover authoritative research and generate perfect citations in any format (APA, MLA, Chicago) without ever breaking your focus.",
      image:
        "https://i.ibb.co/7djtzT8g/Screenshot-2026-01-13-193634.png?w=800&q=80",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      previewBg: "bg-blue-50",
    },
    {
      id: "unified-workspace",
      icon: Users,
      title: "Unified Research Workspace",
      description:
        "The ultimate hub for academic teams. Experience seamless co-authoring with real-time sync, deep authorship verification, and intuitive version control for complex papers.",
      image:
        "https://cdn.prod.website-files.com/5faba41eb4068c069dd32804/67d0731a50881146d37ac482_Real-Time%20Collaboration%20Tools%20for%20Design%20Teams.png?w=800&q=80",
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-100",
      previewBg: "bg-indigo-50",
    },
  ];

  return (
    <section className="section-padding bg-white overflow-hidden">
      <div className="container-custom max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch">
          {/* Left Column - Texts & Actions */}
          <div className="w-full lg:w-[40%] flex flex-col justify-center py-8">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-gray-900 font-semibold uppercase tracking-wider text-xs">
                  Next-Gen Research Infrastructure
                </span>
                <span className="bg-blue-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                  New
                </span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Master the art of integrity and impact.
              </h2>
              <button className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-all shadow-xl hover:scale-110">
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col">
              {features.map((feature, index) => {
                const isActive = activeTab === index;
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.id}
                    className="border-b border-gray-100 last:border-0">
                    <button
                      onClick={() => setActiveTab(index)}
                      className="w-full text-left py-6 flex items-start gap-5 group transition-all outline-none">
                      <div
                        className={`mt-1 p-2.5 rounded-xl ${feature.iconBg} transition-all duration-300 ${
                          isActive
                            ? "scale-110 shadow-md ring-2 ring-white"
                            : "group-hover:scale-105"
                        }`}>
                        <Icon
                          strokeWidth={2.5}
                          className={`w-5 h-5 ${feature.iconColor}`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`text-xl font-bold ${
                            isActive
                              ? "text-gray-900"
                              : "text-gray-400 group-hover:text-gray-600"
                          } transition-colors`}>
                          {feature.title}
                        </h3>
                        {/* Smooth expand/collapse using grid */}
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${
                            isActive
                              ? "grid-rows-[1fr] opacity-100 mt-3"
                              : "grid-rows-[0fr] opacity-0"
                          }`}>
                          <div className="overflow-hidden">
                            <p className="text-gray-500 text-sm leading-relaxed pr-6 font-medium">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Preview Area */}
          <div className="w-full lg:w-[60%] relative min-h-[450px] lg:min-h-[650px] rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`absolute inset-0 transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) flex items-center justify-center p-8 lg:p-16 ${
                  feature.previewBg
                } ${
                  activeTab === index
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0 pointer-events-none"
                }`}>
                <div
                  className={`w-full h-full relative rounded-2xl overflow-hidden shadow-2xl border border-black/5 bg-white transition-all duration-700 ease-out transform ${
                    activeTab === index
                      ? "translate-y-0 scale-100 opacity-100 delay-200"
                      : "translate-y-12 scale-95 opacity-0"
                  }`}>
                  {/* MacOS like window header */}
                  <div className="h-12 bg-gray-50/90 backdrop-blur-md border-b border-gray-100 flex items-center px-5 gap-2.5 absolute top-0 w-full z-10">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                  </div>
                  {/* The image should cover the rest of the window */}
                  <div className="absolute inset-0 pt-12">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover object-left-top"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Logo Ticker Component
function LogoTicker() {
  const logos = [
    {
      name: "Vignan University",
      url: "https://vignan.ac.in/newvignan/assets/images/Logo%20with%20Deemed.svg",
    },
    {
      name: "University of Cambridge",
      url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/University_of_Cambridge_logo.png",
    },
    {
      name: "University of Guelph",
      url: "https://logowik.com/content/uploads/images/university-of-guelph5416.logowik.com.webp",
    },
    {
      name: "Harvard",
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Harvard_University_logo.svg/2560px-Harvard_University_logo.svg.png",
    },
    {
      name: "Stanford",
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Stanford_Cardinal_logo.svg/1200px-Stanford_Cardinal_logo.svg.png",
    },
    {
      name: "MIT",
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/1200px-MIT_logo.svg.png",
    },
    {
      name: "Oxford",
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/1200px-Oxford-University-Circlet.svg.png",
    },
    {
      name: "Waterloo",
      url: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6e/University_of_Waterloo_seal.svg/1200px-University_of_Waterloo_seal.svg.png",
    },
    {
      name: "University of Zimbabwe",
      url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7P8adgf_pitULgaACniwnpnGa_TVbUAZitA&s",
    },
  ];

  return (
    <section className="py-12 bg-gray-50/50 border-y border-gray-100 overflow-hidden">
      <div className="container-custom">
        <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">
          Trusted by researchers from the world's leading institutions
        </p>
        <div className="relative flex overflow-hidden group">
          <div className="animate-scroll whitespace-nowrap flex items-center gap-24 py-6">
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <img
                  src={logo.url}
                  alt={logo.name}
                  className="h-16 w-auto object-contain max-w-[180px]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Grid Component
function FeaturesGrid() {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      id: "team-workspaces",
      icon: LayoutDashboard,
      title: "Unified Team Environments",
      description:
        "Centralize research materials and co-author complex papers with granular contribution tracking and role-based permissions.",
      image:
        "https://image2url.com/r2/default/gifs/1772349529885-091865dd-d9dc-40c6-bbc4-92dff5ccc409.gif?w=800&q=80",
      iconColor: "text-rose-600",
      iconBg: "bg-rose-100",
      previewBg: "bg-rose-50",
    },
    {
      id: "real-time-collaboration",
      icon: Users,
      title: "Live Sync & Authorship",
      description:
        "Write together seamlessly with conflict-free co-editing and real-time visualization of peer contributions.",
      image:
        "https://cdn.prod.website-files.com/5faba41eb4068c069dd32804/67d0731a50881146d37ac482_Real-Time%20Collaboration%20Tools%20for%20Design%20Teams.png?w=800&q=80",
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-100",
      previewBg: "bg-indigo-50",
    },
    {
      id: "chat-with-pdf",
      icon: Bot,
      title: "AI Research Assistant",
      description:
        "Extract deep insights from dense academic materials through interactive, context-aware dialogues with your PDF library.",
      image:
        "https://image2url.com/r2/default/images/1772735474020-d9c7d34e-7639-4013-a694-1ea2ee785d20.png?w=800&q=80",
      iconColor: "text-cyan-600",
      iconBg: "bg-cyan-100",
      previewBg: "bg-cyan-50",
    },
    {
      id: "citation-auditor",
      icon: SearchCheck,
      title: "Scientific Integrity Audit",
      description:
        "Score every claim against millions of peer-reviewed sources to identify missing links and ensure total factual defensibility.",
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      previewBg: "bg-green-50",
    },
    {
      id: "smart-citations",
      icon: Sparkles,
      title: "Intelligent Sourcing Engine",
      description:
        "Discover high-impact references and generate flawless citations in any academic style without ever leaving the editor.",
      image:
        "https://www.vaslou.com/wp-content/uploads/2024/03/what-is-a-citation-audit-in-SEO-1600x900-featured.webp?w=800&q=80",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      previewBg: "bg-blue-50",
    },
    {
      id: "authorship-certification",
      icon: History,
      title: "Authorship Certification",
      description:
        "Generate irrefutable proof of your writing process with time tracking and manual effort verification for complete academic defensibility.",
      image:
        "https://i.ibb.co/Pv7B5kmy/Screenshot-2026-01-14-092154.png?w=800&q=80",
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
      previewBg: "bg-amber-50",
    },
  ];

  return (
    <section className="section-padding bg-slate-50 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50/50 -z-10"></div>
      <div className="container-custom max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            The Future of Academic Infrastructure
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From discovery to defense. Experience a unified ecosystem designed
            to eliminate research friction and maximize academic impact.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-stretch bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100">
          {/* Left Column - Texts */}
          <div className="w-full lg:w-[45%] flex flex-col justify-start pr-4">
            <div className="flex flex-col">
              {features.map((feature, index) => {
                const isActive = activeTab === index;
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.id}
                    className="border-b border-gray-50 last:border-0">
                    <button
                      onClick={() => setActiveTab(index)}
                      className="w-full text-left py-4 flex items-center gap-4 group transition-all outline-none">
                      <div
                        className={`p-2.5 rounded-xl ${feature.iconBg} transition-transform duration-300 shrink-0 ${
                          isActive
                            ? "scale-110 shadow-sm"
                            : "group-hover:scale-105"
                        }`}>
                        <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`text-base font-bold ${
                            isActive
                              ? "text-gray-900"
                              : "text-gray-400 group-hover:text-gray-600"
                          } transition-colors tracking-tight`}>
                          {feature.title}
                          {feature.id === "originality-map" && (
                            <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-200 uppercase tracking-tighter">
                              Under Dev
                            </span>
                          )}
                        </h4>
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${
                            isActive
                              ? "grid-rows-[1fr] opacity-100 mt-1"
                              : "grid-rows-[0fr] opacity-0"
                          }`}>
                          <div className="overflow-hidden">
                            <p className="text-gray-500 text-sm leading-relaxed pr-2 font-medium">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="flex-1 relative min-h-[400px] lg:min-h-full rounded-2xl overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center border border-gray-100">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out flex flex-col ${
                  feature.previewBg
                } ${
                  activeTab === index
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0 pointer-events-none"
                }`}>
                <img
                  src={feature.image}
                  alt={feature.title}
                  className={`w-full h-full object-cover object-left-top transition-transform duration-700 ease-out flex-1 ${
                    activeTab === index ? "scale-100" : "scale-105"
                  }`}
                />

                {/* Decorative fade at the bottom to blend */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-gray-900/40 to-transparent pointer-events-none mix-blend-multiply"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-white/20 inline-flex items-center gap-3">
                    <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                    <span className="font-bold text-gray-900 text-sm tracking-tight">
                      {feature.title}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Comparison Section Component
function ComparisonSection() {
  const highlights = [
    {
      icon: Bot,
      title: "Neutralize the AI Paradox",
      description:
        "Eliminate the conflict between leveraging AI and risking academic integrity. ColabWize provides the guardrails to use modern tools responsibly.",
    },
    {
      icon: Shield,
      title: "Architected for Defensibility",
      description:
        "We go beyond stylistic assistance. Our platform generates an audit trail that proves your work is original, meticulously cited, and authentically your own.",
    },
    {
      icon: CheckCircle,
      title: "Submit with Absolute Certainty",
      description:
        "Silencing the fear of false positives. Obtain an Authorship Certificate before submission to pre-emptively defend your work against any automated detection.",
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Defeat Academic Anxiety with Defensibility
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We don't just help you write better—we prove your work is original.
            Say goodbye to the fear of false flags and career uncertainty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((highlight, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 mb-6">
                  <highlight.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {highlight.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {highlight.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section Component
function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "The Citation Auditor gave me total peace of mind. I could finally submit my thesis knowing exactly where every similarity came from and why it was safe.",
      author: "Dr. Sarah Johnson",
      role: "PhD Candidate, MIT",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop",
    },
    {
      quote:
        "The Authorship Certificate is a complete game-changer. My students can now prove their work is original with a verifiable paper trail of their writing process.",
      author: "Prof. Michael Chen",
      role: "Department of Literature, Stanford University",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    {
      quote:
        "I used to be terrified of AI detectors flagging my work. The Scientific Integrity Audit helped me maintain my voice while staying completely safe.",
      author: "Alex Rivera",
      role: "Graduate Student, UC Berkeley",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Loved by Academics Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of students and researchers who've transformed their
            workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg bg-white border border-gray-200">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {testimonial.author}
                    </h3>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Workflow Section Component
function WorkflowSection() {
  const steps = [
    {
      title: "01. Curate & Connect",
      description:
        "Centralize your research by importing PDF libraries and syncing team assets into a unified environment.",
      icon: Database,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "02. Author & Verify",
      description:
        "Write with the surgical precision of the Citation Auditor and real-time insights from your AI Research Assistant.",
      icon: PenTool,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "03. Certify & Defend",
      description:
        "Generate verifiable Authorship Certificates and irrefutable audit logs to prove the integrity of your work.",
      icon: ShieldCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <section className="section-padding bg-slate-900 text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            How ColabWize Works
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            A seamless three-step lifecycle designed for modern scholarly
            excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/0 via-gray-700 to-purple-500/0 -z-0"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative z-10 group">
              <div
                className={`w-20 h-20 rounded-3xl ${step.bg} flex items-center justify-center mb-8 mx-auto md:mx-0 transform transition-transform group-hover:scale-110 duration-300 ring-4 ring-slate-800 shadow-2xl shadow-black/40`}>
                <step.icon className={`w-10 h-10 ${step.color}`} />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-4 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full border border-slate-700 text-blue-400 text-sm font-bold animate-bounce">
            <TrendingUp className="w-4 h-4" />
            <span>Built for Institutional Standards</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// CTA Section Component
function CTASection() {
  return (
    <section className="section-padding relative overflow-hidden bg-white">
      {/* Background with academic shapes */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20 opacity-95"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-blue-500/30 rounded-full"></div>
        <div className="absolute top-40 right-20 w-16 h-16 border-2 border-blue-500/30 rotate-45"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 border-2 border-blue-500/30 rounded-full"></div>
        <div className="absolute bottom-40 right-10 w-12 h-12 border-2 border-blue-500/30 rotate-12"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Ready to Master Your Research?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Silence the fear of false flags. Build your Authorship Certificate
            today and submit your research with absolute confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
              <Link to="/signup" className="flex items-center">
                Get Started Free Today
                <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-green-500/20 transition-all duration-300">
              <a
                href={ConfigService.getDocsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center">
                See How It Works
                <BookOpen className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-gray-500/20 transition-all duration-300">
              <a
                href="https://discord.gg/2MMSdX3Uee"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center">
                Join Our Community
                <Users className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-400" />
              <span>Available worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Main HomePage Component
export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
      <FeaturesGrid />
      <ComparisonSection />
      <WorkflowSection />
      <PreviewSection />
      <TestimonialsSection />
      <LogoTicker />
      <CTASection />
    </Layout>
  );
}
