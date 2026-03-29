import {
  FileText,
  Database,
  Check,
  Plug,
  Zap,
  Link2,
  Cloud,
} from "lucide-react";
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
            Connect With Your{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Favorite Tools
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            ColabWize connects with the global research infrastructure. From
            massive academic databases to your favorite reference managers,
            we've built the bridges you need for a defensible workflow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
              onClick={handleGetStarted}>
              View All Integrations
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              asChild>
              <RouterLink to="/resources/documentation">
                API Documentation
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
  const integrations = [
    {
      icon: Database,
      title: "Global Research Databases",
      description:
        "Directly query millions of papers across CrossRef, PubMed, ArXiv, and OpenAlex. No crawling or scraping—just pure, verified academic data.",
      benefits: [
        "Real-time access to CrossRef and PubMed",
        "ArXiv preprint integration",
        "OpenAlex semantic search",
        "Factual verification against peer-reviewed sources",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=600&fit=crop",
      color: "from-blue-600 to-blue-800",
    },
    /*
    {
      icon: Cloud,
      title: "Google Drive & Workspace",
      description:
        "Import your existing PDF libraries and research documents directly from Google Drive for immediate analysis and co-authoring.",
      benefits: [
        "Seamless document import and export",
        "Direct PDF library synchronization",
        "Collaborative research environments",
        "Cloud-native storage and version control",
      ],
      imageUrl:
        "https://lh3.googleusercontent.com/2erv0vmuBi-qH6eLd9nOvjeHTR8eupRBL55dHf1hWc4myVSATZnk-Cfg15I7dRv7LxHFZ1LjLuTeNPg9THsuZRD2eCLYsSYGc3AY=e365-pa-nu-rw-w527?w=800&h=600&fit=crop",
      color: "from-green-600 to-emerald-700",
      reverse: true,
    },
    */
    {
      icon: FileText,
      title: "Advanced File Support",
      description:
        "Upload and analyze PDF and DOCX files with high-fidelity preservation. Our engine extracts deep metadata for precise citation building.",
      benefits: [
        "High-fidelity PDF & DOCX parsing",
        "Fuzzy-match metadata extraction",
        "Automatic DOI and URL discovery",
        "Batch processing of research material",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&h=600&fit=crop",
      color: "from-rose-600 to-rose-800",
    },
    {
      icon: Plug,
      title: "Reference Management",
      description:
        "Import your existing bibliographies from our Research Vault, Mendeley, and EndNote via standard BibTeX and RIS formats.",
      benefits: [
        "Vault & Mendeley compatibility",
        "BibTeX and RIS format support",
        "Intelligent citation normalization",
        "Literature matrix generation",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=600&fit=crop",
      color: "from-indigo-600 to-indigo-800",
      reverse: true,
    },
    {
      icon: Zap,
      title: "Authorship Engine",
      description:
        "Integrate your writing process with our proprietary Citation Auditor and Authorship Certificate system.",
      benefits: [
        "Real-time citation integrity checks",
        "Immutable authorship audit logs",
        "Manual effort verification",
        "Verifiable submission-safety certificates",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
      color: "from-cyan-600 to-cyan-800",
    },
    {
      icon: Link2,
      title: "RESTful API Access",
      description:
        "Build institutional compliance tools and custom dashboards with our comprehensive REST API for research data control.",
      benefits: [
        "Enterprise-grade security and uptime",
        "Full documentation for developers",
        "Secure OAuth2 authentication",
        "Advanced citation analysis endpoints",
      ],
      imageUrl:
        "https://cdn.prod.website-files.com/63eab091d2e4cb36843a37be/654a6f699c023825f78a627d_Just-in-time-access-Rest%20API-logo.jpeg?w=800&h=600&fit=crop",
      color: "from-amber-600 to-amber-700",
      reverse: true,
    },
  ];

  const benefits = [
    "Native connectivity with major academic databases",
    "Verified sources through CrossRef and PubMed APIs",
    "Standardized import/export via BibTeX and RIS",
    "Secure document handling with Google Drive",
    "Enterprise-grade API with 99.9% uptime",
    "Designed for institutional and personal research workflows",
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="space-y-24">
          {integrations.map((integration, index) => (
            <FeatureDetail
              key={index}
              icon={integration.icon}
              title={integration.title}
              description={integration.description}
              benefits={integration.benefits}
              imageUrl={integration.imageUrl}
              reverse={integration.reverse}
              color={integration.color}
            />
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Integrations?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our integrations are designed to work seamlessly with your
              existing workflow.
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
            Ready to Integrate Your Tools?
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Join thousands of researchers who use our integrations to streamline
            their workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
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

export default function IntegrationsPage() {
  return (
    <Layout>
      <IntroHero />
      <FeaturesPresentationFlow />
      <ClosingCTA />
    </Layout>
  );
}
