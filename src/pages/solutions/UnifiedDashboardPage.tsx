import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "../../components/ui/button";
import Layout from "../../components/Layout";

import {
  Layout as LayoutIcon,
  Zap,
  Eye,
  CheckSquare,
  TrendingUp,
  Layers,
  Users,
  Star,
  ArrowRight,
  Shield,
} from "lucide-react";

export default function UnifiedDashboardPage() {
  // Intro Hero Section
  function IntroHero() {
    return (
      <section className="section-padding bg-white relative overflow-hidden">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 z-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop')",
          }}></div>
        <div className="container-custom relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Unified Dashboard
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              Your Command Center for Academic Integrity. One dashboard to rule
              them all. Upload your document once and get originality, citation,
              AI detection, and authorship analysis in minutes. Your complete
              academic integrity solution.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
                asChild>
                <RouterLink to="/signup">Try Dashboard Free</RouterLink>
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                asChild>
                <RouterLink to="/schedule-demo">Watch Demo</RouterLink>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Feature Detail Component
  function FeatureDetail({
    icon: Icon,
    title,
    description,
    benefits,
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    benefits: string[];
  }) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 hover:border-green-500/50 transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-gray-600">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Features Presentation Flow
  function FeaturesPresentationFlow() {
    const features = [
      {
        icon: LayoutIcon,
        title: "All-in-One Interface",
        description:
          "Access all 4 MVP features from a single, intuitive dashboard. Upload once, scan everything.",
        benefits: [
          "Access all 4 MVP features",
          "Single intuitive dashboard",
          "Upload once, scan everything",
        ],
      },
      {
        icon: Zap,
        title: "One-Click Scan All",
        description:
          "Run originality, citation, AI detection, and authorship scans simultaneously with one button.",
        benefits: [
          "Run all scans simultaneously",
          "One-button operation",
          "Parallel processing",
        ],
      },
      {
        icon: Eye,
        title: "Results Summary Cards",
        description:
          "See all your scores at a glance: originality %, citation status, AI classification, authorship verified.",
        benefits: [
          "See all scores at a glance",
          "Originality percentage",
          "Comprehensive metrics",
        ],
      },
      {
        icon: CheckSquare,
        title: "Tab Navigation",
        description:
          "Seamlessly switch between features to dive deep into each analysis.",
        benefits: [
          "Seamless feature switching",
          "Dive deep into analysis",
          "Intuitive navigation",
        ],
      },
      {
        icon: TrendingUp,
        title: "Progress Tracking",
        description:
          "Monitor your document's improvement across all metrics in real-time.",
        benefits: [
          "Monitor document improvement",
          "Real-time tracking",
          "All metrics included",
        ],
      },
      {
        icon: Layers,
        title: "Document Upload Flow",
        description:
          "Drag-drop, paste, or browse files (PDF/DOCX/TXT) with instant processing.",
        benefits: [
          "Multiple upload options",
          "Drag-drop support",
          "Instant processing",
        ],
      },
    ];

    return (
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Dashboard Solution
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              All-in-one platform for academic integrity and document analysis
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <FeatureDetail
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                benefits={feature.benefits}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Closing CTA Section
  function ClosingCTA() {
    return (
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Access Your Command Center?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of researchers and students who are already using
              ColabWize to maintain academic integrity and defend their work.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
                asChild>
                <RouterLink to="/signup">
                  Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                </RouterLink>
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                asChild>
                <RouterLink to="/schedule-demo">Schedule Demo</RouterLink>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mb-4">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Trusted by 10,000+
                </h3>
                <p className="text-gray-600">
                  Students and researchers worldwide
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mb-4">
                  <Star className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  4.9/5 Rating
                </h3>
                <p className="text-gray-600">Based on user reviews</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mb-4">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Enterprise Security
                </h3>
                <p className="text-gray-600">GDPR compliant & secure</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <Layout>
      <IntroHero />
      <FeaturesPresentationFlow />
      <ClosingCTA />
    </Layout>
  );
}
