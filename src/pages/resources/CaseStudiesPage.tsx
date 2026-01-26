import {
  Check,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
  Star,
  Target,
  ArrowRight,
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "../../components/ui/button";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { caseStudies } from "../../data/caseStudies";

// Intro Hero Section
function IntroHero() {
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
            Case{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Studies
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Real Success Stories from Real Users. See how students, researchers,
            and institutions use ColabWize to transform academic anxiety into
            career confidence. Learn from their experiences and apply their
            strategies.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
              onClick={() => {
                document
                  .getElementById("case-studies-list")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}>
              Read Case Studies
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              asChild>
              <RouterLink to="/contact">Share Your Story</RouterLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Feature Detail Component
interface FeatureDetailProps {
  icon: React.ElementType;
  title: string;
  description: string;
  benefits: string[];
  imageUrl: string;
  reverse?: boolean;
  color: string;
}

function FeatureDetail({
  icon: Icon,
  title,
  description,
  benefits,
  imageUrl,
  reverse = false,
  color,
}: FeatureDetailProps) {
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${reverse ? "lg:grid-flow-col-dense" : ""}`}>
      {/* Content */}
      <div className={reverse ? "lg:col-start-2" : ""}>
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${color} mb-6`}>
          <Icon className="h-8 w-8 text-white" />
        </div>

        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          {title}
        </h3>

        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
          {description}
        </p>

        <ul className="space-y-3">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-3">
              <div
                className={`w-2 h-2 rounded-full bg-gradient-to-br ${color} mt-2.5 flex-shrink-0`}></div>
              <span className="text-gray-600">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Image */}
      <div className={reverse ? "lg:col-start-1" : ""}>
        <div className="relative">
          <img
            src={imageUrl}
            alt={title}
            className="rounded-2xl shadow-2xl w-full"
          />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-black/10 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}

// Features Presentation Flow
function FeaturesPresentationFlow() {
  const features = [
    {
      icon: Users,
      title: "PhD Students",
      description:
        "See how doctoral candidates use ColabWize to defend their dissertations with confidence.",
      benefits: [
        "Dissertation defense strategies",
        "Originality verification",
        "Citation validation",
        "Academic integrity tools",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      color: "from-green-600 to-green-800",
    },
    {
      icon: TrendingUp,
      title: "Research Teams",
      description:
        "Learn how research groups collaborate and maintain integrity across multiple projects.",
      benefits: [
        "Team collaboration workflows",
        "Project integrity management",
        "Multi-project tracking",
        "Team-based validation",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      color: "from-green-600 to-green-800",
      reverse: true,
    },
    {
      icon: Award,
      title: "Universities",
      description:
        "Discover how institutions implement ColabWize for academic integrity at scale.",
      benefits: [
        "Institutional implementation",
        "Academic integrity programs",
        "Large-scale validation",
        "Educational tools",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      color: "from-green-600 to-green-800",
    },
    {
      icon: CheckCircle,
      title: "Success Stories",
      description:
        "Read testimonials from students who successfully defended their work using ColabWize.",
      benefits: [
        "Student testimonials",
        "Defense success stories",
        "Real user experiences",
        "Proven effectiveness",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      color: "from-green-600 to-green-800",
      reverse: true,
    },
    {
      icon: Star,
      title: "Best Practices",
      description:
        "Learn from top researchers about their workflows and strategies for maintaining originality.",
      benefits: [
        "Research best practices",
        "Workflow optimization",
        "Originality strategies",
        "Expert insights",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      color: "from-green-600 to-green-800",
    },
    {
      icon: Target,
      title: "Results & Metrics",
      description:
        "See the data: 95% success rate, 4-minute average scan time, 30% download certificates.",
      benefits: [
        "Performance metrics",
        "Success statistics",
        "Usage analytics",
        "Data-driven insights",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      color: "from-green-600 to-green-800",
      reverse: true,
    },
  ];

  const benefits = [
    "Real stories from real users",
    "Proven strategies for academic success",
    "Data-driven results and metrics",
    "Learn from peer experiences",
    "Discover new use cases",
    "Get inspired for your own work",
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="space-y-24">
          {features.map((feature, index) => (
            <FeatureDetail
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              benefits={feature.benefits}
              imageUrl={feature.imageUrl}
              reverse={feature.reverse}
              color={feature.color}
            />
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Case Study Benefits
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn from successful case studies and apply proven strategies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gray-100 border border-gray-300 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-green-600 to-green-800 mt-2.5 flex-shrink-0"></div>
                  <span className="text-gray-600">{benefit}</span>
                </div>
              </div>
            ))}
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
            Learn from Success Stories
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            See how students and researchers use ColabWize to achieve academic
            success.
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

function CaseStudyList() {
  const navigate = useNavigate();

  return (
    <section id="case-studies-list" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Success Stories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Deep dives into how our users are ensuring integrity and quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((study) => (
            <div
              key={study.id}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full cursor-pointer"
              onClick={() => navigate(`/resources/case-studies/${study.id}`)}>
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={study.image}
                  alt={study.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-900">
                  {study.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 font-medium uppercase tracking-wider">
                  <span>{study.client}</span>
                  <span>•</span>
                  <span>{study.date}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {study.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                  {study.excerpt}
                </p>

                {/* Metrics Preview */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" /> Results inside
                  </span>
                  <span className="text-blue-600 text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform">
                    Read Story <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CaseStudiesPage() {
  return (
    <Layout>
      <IntroHero />
      <CaseStudyList />
      <FeaturesPresentationFlow />
      <ClosingCTA />
    </Layout>
  );
}
