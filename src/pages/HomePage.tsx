import {
  Shield,
  Users,
  Bot,
  Search,
  FileText,
  Zap,
  CheckCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
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

  const phrases = React.useMemo(() => [
    {
      text: "Your Academic Success, Defended.",
      gradientWord: "Defended.",
    },
    {
      text: "A Platform for Original, Credible, and Human Work.",
      gradientWord: "Human Work.",
    },
  ], []);

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
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-white">
      {/* Content */}
      <div className="relative z-10 container-custom text-center mt-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-500 mb-6 leading-tight">
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

          <p className="text-lg md:text-xl text-gray-500 font-semibold mb-8 max-w-2xl mx-auto leading-relaxed">
            A comprehensive academic integrity and defensibility platform
            designed to transform the writing process from a source of anxiety
            into a source of confidence.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
              <Link to="/signup" className="flex items-center">
                Start Writing Free
                <ArrowRight className="ml-2 h-5 w-5" />
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
            src="https://i.ibb.co/sdHVBb82/editor.png?w=1920&h=1080&fit=crop&crop=center"
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
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            See ColabWize in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the power of integrated academic writing tools.
          </p>
        </div>

        <div className="relative mt-16">
          {/* Hero Image/Preview */}
          <div className="mt-16 relative">
            <div className="relative rounded-2xl border border-border bg-white shadow-2xl overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
              <div className="p-8 bg-white relative">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                  <span className="ml-4 text-xl font-semibold text-muted-foreground">
                    Climate_Research_Paper.docx
                  </span>
                </div>
                <div className="space-y-3 font-sans text-sm leading-relaxed text-foreground/90">
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
                    The Impact of Climate Change on Marine Ecosystems
                  </h3>
                  <p>
                    Climate change represents one of the most significant
                    challenges facing marine ecosystems today.
                    <span
                      className="bg-red-100 text-red-800 px-1 rounded border-b-2 border-red-500 cursor-pointer"
                      title="Originality Alert: 89% match found in 'Journal of Marine Biology'">
                      Rising ocean temperatures have led to widespread coral
                      bleaching events, threatening biodiversity across tropical
                      reef systems.
                    </span>
                  </p>
                  <p>
                    Recent studies indicate that
                    <span
                      className="bg-green-100 text-green-800 px-1 rounded border-b-2 border-green-500 cursor-pointer"
                      title="Authorship Verified: High confidence this is human-written">
                      the acidification of seawater is occuring at an
                      unprecedented rate
                    </span>
                    , with pH levels dropping by 0.1 units since the industrial
                    revolution.
                  </p>
                  <p className="text-muted-foreground">
                    Furthermore, the migration patterns of numerous species have
                    been
                    <span
                      className="bg-yellow-100 px-1 rounded border-b-2 border-yellow-500 cursor-pointer"
                      title="Citation Gap: Claim lacks supporting evidence. Recommended source: NOAA">
                      significantly altered
                    </span>
                    , disrupting established food chains and ecological
                    relationships...
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -left-4 top-1/4 bg-white rounded-lg shadow-xl border border-border p-4 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Citation Confidence</p>
                  <p className="text-xs text-muted-foreground">
                    Strong (85/100)
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 top-1/3 bg-white rounded-lg shadow-xl border border-border p-4 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Originality Map</p>
                  <p className="text-xs text-muted-foreground">
                    Need Attention
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Grid Component
function FeaturesGrid() {
  const features = [
    {
      icon: Search,
      title: "Explainable Originality Map",
      description:
        "Color-coded heatmap shows exactly which parts of your document need attention, with clear safety classifications (Green/Yellow/Red).",
      color: "from-purple-600 to-purple-800",
      href: "/solutions/originality-map",
      image: "https://i.ibb.co/sdHVBb82/editor.png?w=800&q=80",
    },
    {
      icon: FileText,
      title: "Citation Confidence Auditor",
      description:
        "Get confidence scores for each section and warnings about outdated or unsupported claims with suggestions for missing links.",
      color: "from-green-600 to-green-800",
      href: "/solutions/citation-confidence",
      image:
        "https://i.ibb.co/sY9F6B3/Screenshot-2026-01-13-203136.png?w=800&q=80",
    },
    {
      icon: Bot,
      title: "Smart Citation Builder",
      description:
        "Instantly find credible sources and add accurate citations without leaving your workflow.",
      color: "from-blue-600 to-blue-800",
      href: "/solutions/smart-citations",
      image:
        "https://i.ibb.co/7djtzT8g/Screenshot-2026-01-13-193634.png?w=800&q=80",
    },
    {
      icon: Shield,
      title: "Defensibility Log",
      description:
        "Generate authorship certificates proving your work is original with time tracking and manual effort verification.",
      color: "from-amber-600 to-amber-800",
      href: "/solutions/authorship-certificate",
      image:
        "https://i.ibb.co/Pv7B5kmy/Screenshot-2026-01-14-092154.png?w=800&q=80",
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Four Core Features for Academic Success and Beyond
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From proof of authorship to publication, all essential tools in one
            platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              onClick={() => (window.location.href = feature.href)}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group bg-white border border-gray-200 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-8">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                </div>
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
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
      title: "End the AI Paradox",
      description:
        "Stop choosing between falling behind or risking expulsion. Use AI tools responsibly without the constant fear of false flags.",
    },
    {
      icon: Shield,
      title: "Defensibility-First",
      description:
        "We don't just help you write better—we prove your work is original, properly cited, and authentically human-created.",
    },
    {
      icon: CheckCircle,
      title: "Eliminate Submission Anxiety",
      description:
        "Stop asking 'Will Turnitin flag me?'. Get irrefutable proof of authorship and silence the uncertainty before you submit.",
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
            Say goodbye to the fear of false positives and career uncertainty.
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
        "The Originality Map gave me peace of mind. I could finally submit my thesis knowing exactly where every similarity came from and why it was safe.",
      author: "Dr. Sarah Johnson",
      role: "PhD Candidate, MIT",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop",
    },
    {
      quote:
        "The Authorship Certificate feature is a game-changer. My students can now prove their work is original with a verifiable paper trail of their writing process.",
      author: "Prof. Michael Chen",
      role: "Department of Literature, Stanford University",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    {
      quote:
        "I used to be terrified of AI detectors flagging my work. The Submission-Safe Writing Mode helped me maintain my voice while staying completely safe.",
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
            Ready to Upgrade Your Academic Life?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Stop worrying about false positives. Start building your
            defensibility log today and submit with 100% confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
              <Link to="/signup" className="flex items-center">
                Get Started Free Today
                <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
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
              size="lg"
              variant="outline"
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
      <PreviewSection />
      <ComparisonSection />
      <FeaturesGrid />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
}
