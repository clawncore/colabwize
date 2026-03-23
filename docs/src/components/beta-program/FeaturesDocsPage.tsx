import {
  FileSearch,
  Bot,
  BookOpen,
  Award,
  BarChart3,
  Download,
  Lightbulb,
  Shield,
  Clock,
  CheckCircle,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

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
      className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
        reverse ? "lg:grid-flow-col-dense" : ""
      }`}>
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
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
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
      icon: FileSearch,
      title: "Originality Scanning",
      description:
        "Comprehensive plagiarism detection that scans your documents against billions of web pages and academic sources. Get detailed originality reports with sentence-level similarity detection.",
      benefits: [
        "Full document scanning (30 sentences for Free, unlimited for paid)",
        "Originality Map visualization with color-coded matches",
        "AI-powered rephrase suggestions for flagged content",
        "Scan against web pages and academic databases",
      ],
      imageUrl:
        "https://image2url.com/images/1766035339540-bbbba493-1dcb-4604-8f70-23c6a9a878a2.png?w=800&h=600&fit=crop",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Bot,
      title: "AI Detection",
      description:
        "Powered by GPTZero, our AI detection analyzes your documents to identify AI-generated content. Ensure academic integrity by detecting text from ChatGPT, Claude, and other language models.",
      benefits: [
        "Industry-leading GPTZero integration",
        "Pattern analysis and perplexity scoring",
        "Human, Mixed, or AI-Generated classification",
        "Low false-positive rates for accurate detection",
      ],
      imageUrl:
        "https://image2url.com/images/1766035335298-270bb4d5-1753-46ef-b984-91b47e54df1f.png?w=800&h=600&fit=crop",
      color: "from-purple-500 to-pink-500",
      reverse: true,
    },
    {
      icon: BookOpen,
      title: "Citation Confidence Auditor",
      description:
        "Analyze the quality and reliability of your citations with our advanced auditing system. Get confidence scores, recency analysis, and discover missing relevant papers with our AI-powered Missing Link feature.",
      benefits: [
        "Confidence scoring (0-100%) for each citation",
        "Recency analysis for publications older than 3 years",
        "Missing Link Finder suggests relevant papers you may have missed",
        "Field-specific recommendations and improvements",
      ],
      imageUrl:
        "https://image2url.com/images/1766041624051-57126843-7e86-487c-875c-682a621bbc6e.png?w=800&h=600&fit=crop",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Award,
      title: "Authorship Certificates",
      description:
        "Generate cryptographically-secure authorship certificates to prove you created a document at a specific time. Perfect for protecting intellectual property and establishing priority.",
      benefits: [
        "Unique verification codes and timestamps",
        "Online certificate verification system",
        "Professional certificates without watermarks (Student+ plans)",
        "Retention policies: 7 days (Free), 30 days (Student), unlimited (Researcher)",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop",
      color: "from-orange-500 to-red-500",
      reverse: true,
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Exclusive to Researcher plan subscribers. Track your writing productivity, identify your most active days, monitor citation fix rates, and visualize your verification times with comprehensive analytics.",
      benefits: [
        "Most Active Day detection",
        "Weekly Upload Velocity tracking",
        "Citation Fix Rate analysis",
        "Time to Verification metrics",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: Download,
      title: "Flexible Export Options",
      description:
        "Export your work in multiple formats for submission or sharing. Free users can export to PDF, while paid plans unlock additional formats for maximum flexibility.",
      benefits: [
        "PDF export (all plans)",
        "DOCX and other formats (Student+ plans)",
        "Maintain formatting across all formats",
        "Quick export from your dashboard",
      ],
      imageUrl:
        "https://image2url.com/images/1766041414714-d21fc2eb-7026-4d37-9bb7-2c564aed93ab.png?w=800&h=600&fit=crop",
      color: "from-teal-500 to-green-500",
      reverse: true,
    },
  ];

  return (
    <section className="w-full mb-24">
      <div className="max-w-full mx-0 px-4 sm:px-6 lg:px-8">
        <div className="space-y-24">
          {features.map((feature, index) => (
            <FeatureDetail key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Closing Mini-CTA
function ClosingCTA() {
  return (
    <>
      <section className="w-full bg-gray-50">
        <div className="max-w-full mx-0 px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-none overflow-hidden">
            <CardContent className="p-8 sm:p-12 text-center bg-gradient-to-br from-blue-600 to-purple-600">
              <Lightbulb className="h-16 w-16 text-yellow-300 mx-auto mb-6" />

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ensure Academic Integrity & Protect Your Work
              </h2>

              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Whether you're a student or a researcher, ColabWize helps you
                maintain originality, detect AI content, and prove authorship
                with confidence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-50 font-semibold px-8 py-6">
                  <Link to="/plans" className="flex items-center">
                    View Plans
                    <Zap className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6"
                  asChild>
                  <Link to="/quickstart">Get Started</Link>
                </Button>
              </div>

              <div className="flex justify-center items-center gap-6 mt-8 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Start scanning immediately</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Secure & confidential</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

// Main Component
const FeaturesDocsPage: React.FC = () => {
  return (
    <div className="w-full">
      <FeaturesPresentationFlow />
      <ClosingCTA />
    </div>
  );
};

export default FeaturesDocsPage;
