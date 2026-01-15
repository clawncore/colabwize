import {
  Check,
  Briefcase,
  Code,
  Users,
  TrendingUp,
  Heart,
  Zap,
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "../../components/ui/button";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";

// Intro Hero Section
function IntroHero() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/contact");
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
            Careers at{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              ColabWize
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Join Our Mission to Transform Academic Anxiety into Confidence.
            We're building the future of academic integrity. Join our team and
            help millions of students and researchers succeed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
              onClick={handleGetStarted}>
              View Open Positions
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              asChild>
              <RouterLink to="/company/about">
                Learn About Our Culture
              </RouterLink>
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
      icon: Briefcase,
      title: "Open Positions",
      description:
        "Join our growing team as a Software Engineer, Product Manager, or Customer Success Specialist.",
      benefits: [
        "Exciting roles in engineering",
        "Product management opportunities",
        "Customer success specialist positions",
        "Various growth opportunities",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      color: "from-green-600 to-green-800",
    },
    {
      icon: Code,
      title: "Remote-First",
      description:
        "Work from anywhere in the world. We're a fully distributed team across 10+ countries.",
      benefits: [
        "Work from anywhere globally",
        "Fully distributed team structure",
        "Flexible location options",
        "Global team collaboration",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      color: "from-green-600 to-green-800",
      reverse: true,
    },
    {
      icon: Users,
      title: "Great Culture",
      description:
        "Collaborative, supportive, and mission-driven. We care about each other and our users.",
      benefits: [
        "Collaborative team environment",
        "Supportive culture",
        "Mission-driven work",
        "Caring for each other and users",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      color: "from-green-600 to-green-800",
    },
    {
      icon: TrendingUp,
      title: "Growth Opportunities",
      description:
        "Learn, grow, and advance your career. We invest in our team's development.",
      benefits: [
        "Career advancement opportunities",
        "Learning and development programs",
        "Professional growth paths",
        "Investment in team development",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      color: "from-green-600 to-green-800",
      reverse: true,
    },
    {
      icon: Heart,
      title: "Competitive Benefits",
      description:
        "Health insurance, unlimited PTO, equity, and more. We take care of our team.",
      benefits: [
        "Health insurance coverage",
        "Unlimited PTO policy",
        "Equity packages",
        "Comprehensive benefits",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      color: "from-green-600 to-green-800",
    },
    {
      icon: Zap,
      title: "Make an Impact",
      description:
        "Help millions of students and researchers succeed with integrity.",
      benefits: [
        "Impact millions of students",
        "Support academic integrity",
        "Help researchers succeed",
        "Meaningful work impact",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      color: "from-green-600 to-green-800",
      reverse: true,
    },
  ];

  const benefits = [
    "Competitive salary and equity",
    "Health, dental, and vision insurance",
    "Unlimited PTO and flexible hours",
    "Remote work from anywhere",
    "Latest tech and tools",
    "Professional development budget",
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
              Why Join Us?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We offer competitive benefits and a supportive work environment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white border border-gray-300 rounded-lg p-6">
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
    navigate("/contact");
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
            Ready to Join Our Team?
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Help millions of students and researchers succeed with integrity.
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

export default function CareersPage() {
  return (
    <Layout>
      <IntroHero />
      <FeaturesPresentationFlow />
      <ClosingCTA />
    </Layout>
  );
}
