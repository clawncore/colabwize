import React, { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "../../components/ui/button";
import LayoutWrapper from "../../components/Layout";
import {
  MessageSquareText,
  Shield,
  Zap,
  Bot,
  Sparkles,
  Layers,
  Search,
  ArrowRight,
  CheckCircle2,
  FileText,
  Quote,
} from "lucide-react";

export default function ChatWithPdfsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Hero Section with Glassmorphism
  function HeroSection() {
    return (
      <section className="relative pb-20 md:pt-48 md:pb-32 overflow-hidden bg-[#0A0C10]">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}></div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-medium mb-8 backdrop-blur-md animate-fade-in">
              <Sparkles className="h-4 w-4" />
              <span>Next-Gen Research Assistant</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-[1.1]">
              Stop Reading. <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Start Conversing.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed font-light">
              Transform your static PDFs into dynamic research partners. Ask
              complex questions, get instant citations, and synthesize knowledge
              across your entire library.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-10 py-7 text-xl rounded-2xl shadow-2xl shadow-blue-500/20 transition-all duration-300 hover:scale-105"
                asChild>
                <RouterLink to="/signup">Try Chat Free</RouterLink>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 font-bold px-10 py-7 text-xl rounded-2xl backdrop-blur-md transition-all duration-300"
                asChild>
                <RouterLink to="/schedule-demo">Watch Demo</RouterLink>
              </Button>
            </div>
          </div>
        </div>

        {/* Visual Preview / Mockup */}
        <div className="container-custom mt-20 relative px-4 md:px-0">
          <div className="relative mx-auto max-w-6xl rounded-3xl p-2 bg-gradient-to-b from-white/20 to-transparent backdrop-blur-sm border border-white/10 shadow-2xl overflow-hidden group">
            <div className="rounded-2xl bg-[#0F1218] overflow-hidden aspect-[16/9] relative">
              <img
                src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80"
                alt="Chat Interface Preview"
                className="w-full h-full object-cover opacity-60 group-hover:scale-[1.02] transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1016] via-transparent to-transparent"></div>

              {/* Floating UI Elements (Simulated) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl space-y-4 px-6 scale-90 md:scale-100">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl self-start max-w-[80%] animate-float">
                  <p className="text-white text-sm md:text-base">
                    "How does the methodology section justify the sample size?"
                  </p>
                </div>
                <div
                  className="bg-blue-600/80 backdrop-blur-xl border border-blue-400/30 p-5 rounded-2xl self-end ml-auto max-w-[85%] shadow-xl shadow-blue-900/20 animate-float"
                  style={{ animationDelay: "1s" }}>
                  <p className="text-white text-sm md:text-base font-medium">
                    "Based on page 14, the authors cite previous studies (Smith,
                    2022) to justify a 20% margin of error given the structural
                    constraints..."
                  </p>
                  <div className="mt-3 flex gap-2">
                    <span className="px-2 py-1 bg-white/20 rounded text-[10px] text-white">
                      Source: Page 14
                    </span>
                    <span className="px-2 py-1 bg-white/20 rounded text-[10px] text-white">
                      Confidence: High
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Value Props with Glassmorphism Cards
  function ValueProps() {
    const props = [
      {
        icon: MessageSquareText,
        title: "Contextual Dialogue",
        desc: "Ask follow-up questions and drill down into specific data points. Our AI remembers the conversation flow.",
        color: "blue",
      },
      {
        icon: Quote,
        title: "Exact Citations",
        desc: "Never lose track of where information came from. Every answer includes direct links to the source page.",
        color: "indigo",
      },
      {
        icon: Layers,
        title: "Multi-PDF Synthesis",
        desc: "Chat with up to 50 documents simultaneously to find patterns and connections across your library.",
        color: "purple",
      },
      {
        icon: Bot,
        title: "Deep Reasoning",
        desc: "Go beyond simple search. Ask for summaries, comparisons, and critical analyses of complex methodologies.",
        color: "cyan",
      },
    ];

    return (
      <section className="py-24 bg-[#0D1016]">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Built for Serious Research
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
              Designed by academics, for academics. We prioritize accuracy and
              verifiability above all else.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {props.map((prop, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300">
                <div
                  className={`p-3 rounded-2xl bg-${prop.color}-500/20 inline-block mb-6`}>
                  <prop.icon className={`h-8 w-8 text-${prop.color}-400`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {prop.title}
                </h3>
                <p className="text-gray-400 leading-relaxed font-light">
                  {prop.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Feature Showcase Section
  function FeatureShowcase() {
    return (
      <section className="py-24 bg-[#0A0C10] overflow-hidden">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Your Entire Library, <br />
                <span className="text-blue-500">Searchable by Thought.</span>
              </h2>
              <p className="text-xl text-gray-400 font-light leading-relaxed">
                Unlock the dark data trapped in your PDFs. ColabWize uses
                advanced semantic search to find not just keywords, but meanings
                and concepts.
              </p>

              <ul className="space-y-4">
                {[
                  "Semantic understanding across different terminologies",
                  "Support for complex tables and mathematical formulas",
                  "Automatic language translation and synthesis",
                  "Export summaries directly to your ColabWize Editor",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-white font-medium">
                    <CheckCircle2 className="h-6 w-6 text-blue-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-8">
                <Button
                  className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-4 rounded-xl transition-all"
                  asChild>
                  <RouterLink to="/features">Explore All Features</RouterLink>
                </Button>
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="relative z-10 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800"
                  alt="Deep Tech"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/40 via-transparent to-transparent"></div>

                {/* Overlay Card */}
                <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-white font-bold text-sm tracking-widest uppercase">
                      Live Verification
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm italic">
                    "Correlating findings from 12 distinct papers in
                    real-time..."
                  </p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/30 rounded-full blur-[60px]"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600/30 rounded-full blur-[60px]"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // CTA Section
  function FinalCTA() {
    return (
      <section className="py-32 bg-[#0D1016] border-t border-white/5">
        <div className="container-custom">
          <div className="rounded-[40px] bg-gradient-to-br from-blue-600 to-indigo-900 p-12 md:p-24 text-center relative overflow-hidden shadow-3xl">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
                Ready to Level Up Your Research?
              </h2>
              <p className="text-xl md:text-2xl text-blue-100 mb-12 font-light">
                Join a new generation of researchers who spend more time
                thinking and less time searching.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-blue-900 hover:bg-gray-100 font-black px-12 py-8 text-2xl rounded-2xl transition-all hover:scale-105 shadow-xl shadow-black/20"
                  asChild>
                  <RouterLink to="/signup">Get Started Free</RouterLink>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10 font-bold px-12 py-8 text-2xl rounded-2xl backdrop-blur-sm transition-all shadow-xl"
                  asChild>
                  <RouterLink to="/pricing">View Pricing</RouterLink>
                </Button>
              </div>

              <div className="mt-16 flex justify-center items-center gap-12 grayscale opacity-60">
                <span className="text-white font-black text-xl tracking-tighter">
                  UNIVERSITY PREFERRED
                </span>
                <span className="text-white font-black text-xl tracking-tighter">
                  RESEARCH READY
                </span>
                <span className="text-white font-black text-xl tracking-tighter">
                  CITATION SAFE
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-[#0A0C10] font-sans selection:bg-blue-500 selection:text-white">
        <HeroSection />
        <ValueProps />
        <FeatureShowcase />
        <FinalCTA />
      </div>

      {/* Visual Enhancements */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.5); }
      `,
        }}
      />
    </LayoutWrapper>
  );
}
