import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  BarChart3,
  Target,
  TrendingUp,
  Users,
  Clock,
  PieChart,
  Shield,
  Zap,
  Star,
  ArrowRight,
} from "lucide-react";

export default function AnalyticsMetricsPage() {
  // Intro Hero Section
  function IntroHero() {
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
              "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop')",
          }}></div>
        <div className="container-custom relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-blue-100 text-blue-700 font-bold text-xs uppercase mb-8 tracking-widest shadow-lg shadow-blue-900/5 backdrop-blur-sm">
              <BarChart3 className="h-4 w-4" /> Academic Performance Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-700 bg-clip-text text-transparent">
                Analytics & Metrics
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              Data-Driven Academic Success. Track your usage, monitor key
              performance indicators, and gain insights into your academic
              workflow. Make data-driven decisions to improve your writing and
              research process.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                asChild>
                <RouterLink to="/signup">View My Analytics</RouterLink>
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                asChild>
                <RouterLink to="/schedule-demo">Learn More</RouterLink>
              </Button>
            </div>

            <div className="mt-16 mx-auto max-w-5xl rounded-[3rem] border border-white bg-gradient-to-br from-blue-500/20 via-white/70 to-cyan-500/20 p-2 shadow-2xl shadow-blue-900/10 backdrop-blur-sm">
              <div className="rounded-[2.5rem] border border-blue-100 bg-white/85 p-6 md:p-8 shadow-xl shadow-blue-900/5">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="text-left">
                    <div className="text-sm font-black text-slate-900">
                      Academic Success Dashboard
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                      Live workflow signals and defensibility metrics
                    </div>
                  </div>
                  <div className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                    Live
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    ["Scans", "1,248", "from-blue-500 to-cyan-600"],
                    ["Citations Fixed", "482", "from-indigo-500 to-blue-600"],
                    ["Avg. Confidence", "96%", "from-cyan-500 to-blue-600"],
                    ["Certificates", "318", "from-amber-500 to-blue-600"],
                  ].map(([label, value, gradient]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-blue-100 bg-white p-4 text-left shadow-sm">
                      <div className={`mb-4 h-2 w-12 rounded-full bg-gradient-to-r ${gradient}`}></div>
                      <div className="text-2xl font-black text-slate-900">
                        {value}
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
      <div className="group h-full rounded-[2rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/40 p-6 shadow-lg shadow-blue-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-700 p-3 shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-110">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600 flex-shrink-0" />
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
        icon: BarChart3,
        title: "Feature Usage Tracking",
        description:
          "Track how often you use each feature: originality scans, citation checks, AI detection, certificates.",
        benefits: [
          "Track originality scans usage",
          "Monitor citation checks",
          "Measure AI detection usage",
        ],
      },
      {
        icon: Target,
        title: "KPI Monitoring",
        description:
          "Monitor key metrics: 60% click flagged sentences, 40% find missing links, 50% make edits, 30% download certificates.",
        benefits: [
          "Monitor key metrics",
          "Track flagged sentences",
          "Measure editing progress",
        ],
      },
      {
        icon: TrendingUp,
        title: "Journey Analytics",
        description:
          "See your complete journey: Upload → Scan → Review → Defend with time spent at each stage.",
        benefits: [
          "Complete journey tracking",
          "Time spent per stage",
          "Review process analytics",
        ],
      },
      {
        icon: Users,
        title: "User Metrics",
        description:
          "Track documents uploaded, total scans, features adopted, and engagement patterns.",
        benefits: [
          "Track documents uploaded",
          "Monitor total scans",
          "Measure feature adoption",
        ],
      },
      {
        icon: Clock,
        title: "Time Tracking",
        description:
          "Measure time spent per feature and total session duration for productivity insights.",
        benefits: [
          "Time spent per feature",
          "Total session duration",
          "Productivity insights",
        ],
      },
      {
        icon: PieChart,
        title: "Conversion Tracking",
        description:
          "Monitor your progress from free to paid, trial usage, and feature adoption rates.",
        benefits: [
          "Free to paid progress",
          "Trial usage tracking",
          "Feature adoption rates",
        ],
      },
    ];

    return (
      <section className="section-padding bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/40 to-white pointer-events-none"></div>
        <div className="container-custom">
          <div className="relative z-10 text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Analytics & Metrics
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Data-driven insights to help you optimize your academic workflow
              and track your progress
            </p>
          </div>

          <div className="relative z-10 grid md:grid-cols-2 gap-8">
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
      <section className="section-padding bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 opacity-95"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-blue-300/40 rounded-full"></div>
          <div className="absolute top-40 right-20 w-16 h-16 border-2 border-cyan-300/40 rotate-45"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 border-2 border-blue-300/40 rounded-full"></div>
          <div className="absolute bottom-40 right-10 w-12 h-12 border-2 border-cyan-300/40 rotate-12"></div>
        </div>
        <div className="container-custom">
          <div className="relative z-10 rounded-[3rem] border border-blue-100 bg-white/80 p-8 md:p-14 text-center shadow-2xl shadow-blue-900/10 backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Track Your Academic Success?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of researchers and students who are already using
              ColabWize to maintain academic integrity and defend their work.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                className="bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                asChild>
                <RouterLink to="/signup">
                  Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                </RouterLink>
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                asChild>
                <RouterLink to="/schedule-demo">Schedule Demo</RouterLink>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-2xl mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Trusted by 10,000+
                </h3>
                <p className="text-gray-600">
                  Students and researchers worldwide
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-2xl mb-4">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  4.9/5 Rating
                </h3>
                <p className="text-gray-600">Based on user reviews</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-2xl mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
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
    <>
      <IntroHero />
      <FeaturesPresentationFlow />
      <ClosingCTA />
    </>
  );
}
