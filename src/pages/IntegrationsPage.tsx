import {
  FileText,
  Database,
  Check,
  Plug,
  Zap,
  Link2,
  Cloud,
  BookOpen,
} from "lucide-react";
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
            Connect With Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-700 bg-clip-text text-transparent">
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
              className="bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
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
      className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center rounded-[2.5rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50/40 to-cyan-50/50 p-6 md:p-10 shadow-xl shadow-blue-900/5 ${reverse ? "lg:grid-flow-col-dense" : ""}`}>
      {/* Content */}
      <div className={reverse ? "lg:col-start-2" : ""}>
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${color} mb-6 shadow-lg shadow-blue-900/10`}>
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
        <div className="relative rounded-[2rem] bg-gradient-to-br from-blue-500/20 via-white to-cyan-500/20 p-2 shadow-2xl shadow-blue-900/10">
          {imageUrl === "database-workflow-illustration" ? (
            <div className="relative min-h-[360px] rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-8 flex items-center justify-center">
              <div className="absolute top-8 left-8 w-20 h-20 rounded-full bg-blue-200/50 blur-2xl"></div>
              <div className="absolute bottom-8 right-8 w-24 h-24 rounded-full bg-cyan-200/60 blur-2xl"></div>

              <div className="relative w-full max-w-md">
                <div className="grid grid-cols-3 items-center gap-4 mb-8">
                  {["CrossRef", "PubMed", "ArXiv"].map((source) => (
                    <div
                      key={source}
                      className="rounded-2xl border border-blue-100 bg-white px-3 py-4 text-center shadow-lg shadow-blue-900/5">
                      <Database className="mx-auto mb-2 h-6 w-6 text-blue-600" />
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        {source}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative mx-auto mb-8 h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-700 shadow-xl shadow-blue-500/20 flex items-center justify-center">
                  <Plug className="h-7 w-7 text-white" />
                  <div className="absolute -left-28 top-1/2 h-0.5 w-28 bg-gradient-to-r from-transparent to-blue-300"></div>
                  <div className="absolute -right-28 top-1/2 h-0.5 w-28 bg-gradient-to-r from-blue-300 to-transparent"></div>
                </div>

                <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-2xl shadow-blue-900/10">
                  <div className="mx-auto mb-4 h-16 w-32 rounded-[50%] border-4 border-blue-200 bg-blue-100"></div>
                  <div className="mx-auto -mt-8 h-24 w-32 rounded-b-3xl border-x-4 border-b-4 border-blue-200 bg-gradient-to-b from-blue-50 to-cyan-50"></div>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <div className="h-2 rounded-full bg-blue-200"></div>
                    <div className="h-2 rounded-full bg-cyan-200"></div>
                    <div className="h-2 rounded-full bg-indigo-200"></div>
                  </div>
                  <p className="mt-4 text-center text-sm font-bold text-slate-700">
                    Verified Research Data
                  </p>
                </div>
              </div>
            </div>
          ) : imageUrl === "file-support-illustration" ? (
            <div className="relative min-h-[360px] rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-rose-50 via-white to-blue-50 p-8 flex items-center justify-center">
              <div className="absolute top-10 right-8 w-24 h-24 rounded-full bg-rose-200/60 blur-2xl"></div>
              <div className="absolute bottom-8 left-8 w-28 h-28 rounded-full bg-blue-200/60 blur-2xl"></div>

              <div className="relative w-full max-w-md">
                <div className="grid grid-cols-2 gap-5 mb-8">
                  <div className="rounded-3xl border border-rose-100 bg-white p-5 shadow-xl shadow-rose-900/5 rotate-[-3deg]">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="rounded-xl bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">
                        PDF
                      </div>
                      <FileText className="h-7 w-7 text-rose-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 rounded-full bg-slate-200"></div>
                      <div className="h-2 rounded-full bg-slate-200"></div>
                      <div className="h-2 w-2/3 rounded-full bg-slate-200"></div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-900/5 rotate-[3deg]">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="rounded-xl bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                        DOCX
                      </div>
                      <FileText className="h-7 w-7 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 rounded-full bg-slate-200"></div>
                      <div className="h-2 rounded-full bg-slate-200"></div>
                      <div className="h-2 w-3/4 rounded-full bg-slate-200"></div>
                    </div>
                  </div>
                </div>

                <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-blue-600 shadow-xl shadow-blue-500/20">
                  <Zap className="h-7 w-7 text-white" />
                </div>

                <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-2xl shadow-blue-900/10">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-cyan-100 flex items-center justify-center">
                      <Check className="h-5 w-5 text-cyan-700" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-800">
                        Metadata Extracted
                      </div>
                      <div className="text-xs font-medium text-slate-500">
                        DOI, authors, dates, references
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-rose-50 px-3 py-2 text-center text-[10px] font-black text-rose-700">
                      DOI
                    </div>
                    <div className="rounded-xl bg-blue-50 px-3 py-2 text-center text-[10px] font-black text-blue-700">
                      URL
                    </div>
                    <div className="rounded-xl bg-cyan-50 px-3 py-2 text-center text-[10px] font-black text-cyan-700">
                      CITE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : imageUrl === "reference-management-illustration" ? (
            <div className="relative min-h-[360px] rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-8 flex items-center justify-center">
              <div className="absolute top-8 left-10 w-24 h-24 rounded-full bg-indigo-200/60 blur-2xl"></div>
              <div className="absolute bottom-8 right-10 w-28 h-28 rounded-full bg-blue-200/60 blur-2xl"></div>

              <div className="relative w-full max-w-md">
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {["Vault", "Mendeley", "EndNote"].map((source, index) => (
                    <div
                      key={source}
                      className={`rounded-2xl border border-indigo-100 bg-white p-4 text-center shadow-lg shadow-indigo-900/5 ${index === 1 ? "translate-y-3" : ""}`}>
                      <BookOpen className="mx-auto mb-2 h-6 w-6 text-indigo-600" />
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        {source}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-blue-700 shadow-xl shadow-indigo-500/20">
                  <Plug className="h-7 w-7 text-white" />
                  <div className="absolute -top-12 left-1/2 h-12 w-0.5 -translate-x-1/2 bg-gradient-to-b from-indigo-200 to-indigo-400"></div>
                  <div className="absolute -left-24 top-1/2 h-0.5 w-24 bg-gradient-to-r from-transparent to-indigo-300"></div>
                  <div className="absolute -right-24 top-1/2 h-0.5 w-24 bg-gradient-to-r from-indigo-300 to-transparent"></div>
                </div>

                <div className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-2xl shadow-blue-900/10">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-slate-800">
                        Normalized Bibliography
                      </div>
                      <div className="text-xs font-medium text-slate-500">
                        Clean citations, ready for writing
                      </div>
                    </div>
                    <Check className="h-6 w-6 text-blue-600" />
                  </div>

                  <div className="space-y-3">
                    {["BibTeX", "RIS", "Citation Matrix"].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3">
                        <div className="h-2.5 w-2.5 rounded-full bg-indigo-500"></div>
                        <span className="text-sm font-bold text-slate-700">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : imageUrl === "authorship-engine-illustration" ? (
            <div className="relative min-h-[360px] rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-8 flex items-center justify-center">
              <div className="absolute top-8 right-10 w-24 h-24 rounded-full bg-cyan-200/60 blur-2xl"></div>
              <div className="absolute bottom-8 left-10 w-28 h-28 rounded-full bg-blue-200/60 blur-2xl"></div>

              <div className="relative w-full max-w-md">
                <div className="rounded-[2rem] border border-cyan-100 bg-white p-6 shadow-2xl shadow-blue-900/10">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-slate-800">
                        Writing Session
                      </div>
                      <div className="text-xs font-medium text-slate-500">
                        Live integrity and authorship tracking
                      </div>
                    </div>
                    <div className="rounded-2xl bg-cyan-100 p-3">
                      <Zap className="h-5 w-5 text-cyan-700" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-cyan-700">
                          Citation Auditor
                        </span>
                        <Check className="h-4 w-4 text-cyan-700" />
                      </div>
                      <div className="h-2 rounded-full bg-cyan-200"></div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-blue-700">
                          Authorship Log
                        </span>
                        <span className="text-xs font-black text-blue-700">84%</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {[0, 1, 2, 3, 4].map((item) => (
                          <div
                            key={item}
                            className="h-8 rounded-lg bg-blue-200"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mx-auto -mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 shadow-xl shadow-blue-500/20">
                  <Check className="h-7 w-7 text-white" />
                </div>

                <div className="mx-auto -mt-3 max-w-xs rounded-[2rem] border border-blue-100 bg-white p-5 text-center shadow-2xl shadow-blue-900/10">
                  <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                    <FileText className="h-7 w-7 text-blue-700" />
                  </div>
                  <div className="text-sm font-black text-slate-800">
                    Authorship Certificate
                  </div>
                  <div className="mt-2 text-xs font-medium text-slate-500">
                    Verified submission-safety proof
                  </div>
                </div>
              </div>
            </div>
          ) : imageUrl === "api-access-illustration" ? (
            <div className="relative min-h-[360px] rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-amber-50 via-white to-blue-50 p-8 flex items-center justify-center">
              <div className="absolute top-8 left-10 w-24 h-24 rounded-full bg-amber-200/60 blur-2xl"></div>
              <div className="absolute bottom-8 right-10 w-28 h-28 rounded-full bg-blue-200/60 blur-2xl"></div>

              <div className="relative w-full max-w-md">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {["GET /papers", "POST /audit", "GET /certs", "OAuth2"].map(
                    (endpoint, index) => (
                      <div
                        key={endpoint}
                        className={`rounded-2xl border bg-white p-4 shadow-lg shadow-blue-900/5 ${index === 3 ? "border-amber-100" : "border-blue-100"}`}>
                        <div
                          className={`mb-3 h-2 w-10 rounded-full ${index === 3 ? "bg-amber-400" : "bg-blue-400"}`}
                        ></div>
                        <div className="text-xs font-black text-slate-700">
                          {endpoint}
                        </div>
                      </div>
                    ),
                  )}
                </div>

                <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-blue-600 shadow-xl shadow-blue-500/20">
                  <Link2 className="h-7 w-7 text-white" />
                  <div className="absolute -left-24 top-1/2 h-0.5 w-24 bg-gradient-to-r from-transparent to-amber-300"></div>
                  <div className="absolute -right-24 top-1/2 h-0.5 w-24 bg-gradient-to-r from-blue-300 to-transparent"></div>
                </div>

                <div className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-2xl shadow-blue-900/10">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-slate-800">
                        Compliance Dashboard
                      </div>
                      <div className="text-xs font-medium text-slate-500">
                        Secure research data control
                      </div>
                    </div>
                    <div className="rounded-2xl bg-blue-100 p-3">
                      <Zap className="h-5 w-5 text-blue-700" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-blue-50 p-3 text-center">
                      <div className="text-lg font-black text-blue-700">99.9%</div>
                      <div className="text-[10px] font-bold uppercase text-slate-500">
                        Uptime
                      </div>
                    </div>
                    <div className="rounded-2xl bg-cyan-50 p-3 text-center">
                      <div className="text-lg font-black text-cyan-700">2.0</div>
                      <div className="text-[10px] font-bold uppercase text-slate-500">
                        OAuth
                      </div>
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-3 text-center">
                      <div className="text-lg font-black text-amber-700">API</div>
                      <div className="text-[10px] font-bold uppercase text-slate-500">
                        Docs
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <img
                src={imageUrl}
                alt={title}
                className="rounded-[1.5rem] w-full"
              />
              <div className="absolute inset-2 rounded-[1.5rem] bg-gradient-to-tr from-blue-600/10 via-transparent to-cyan-400/10 pointer-events-none"></div>
            </>
          )}
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
      imageUrl: "database-workflow-illustration",
      color: "from-blue-600 to-cyan-700",
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
      imageUrl: "file-support-illustration",
      color: "from-rose-500 to-blue-600",
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
      imageUrl: "reference-management-illustration",
      color: "from-indigo-600 to-blue-700",
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
      imageUrl: "authorship-engine-illustration",
      color: "from-cyan-600 to-blue-700",
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
      imageUrl: "api-access-illustration",
      color: "from-amber-500 to-blue-600",
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
    <section className="section-padding bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/40 to-white pointer-events-none"></div>
      <div className="container-custom">
        <div className="relative z-10 space-y-24">
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
        <div className="relative z-10 mt-24 rounded-[2.5rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-8 md:p-12 shadow-xl shadow-blue-900/5">
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
                className="bg-white/85 border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-600 to-cyan-700 mt-2.5 flex-shrink-0"></div>
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
            Ready to Integrate Your Tools?
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Join thousands of researchers who use our integrations to streamline
            their workflow.
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

export default function IntegrationsPage() {
  return (
    <>
      <IntroHero />
      <FeaturesPresentationFlow />
      <ClosingCTA />
    </>
  );
}
