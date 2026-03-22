import React, { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
  SearchCheck,
  Users,
  History,
  Lock,
  Zap,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import Layout from "../../components/Layout";
import { Helmet } from "react-helmet-async";

interface CompetitorData {
  name: string;
  logo: string;
  primaryFocus: string;
  description: string;
  pros: string[];
  cons: string[];
  comparisonTable: {
    feature: string;
    colabwize: boolean | string;
    competitor: boolean | string;
  }[];
}

const COMPARISON_DATA: Record<string, CompetitorData> = {
  "google-docs": {
    name: "Google Docs",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Docs_icon_%282014-2020%29.svg",
    primaryFocus: "General Document Editing",
    description:
      "Google Docs is the industry standard for cloud-based collaboration, focusing on real-time editing and availability. However, it lacks the specific academic defensibility and citation auditing required for serious research.",
    pros: [
      "Free for most users",
      "Reliable real-time collaboration",
      "Deep Google ecosystem integration",
    ],
    cons: [
      "No granular authorship verification",
      "No built-in citation auditor",
      "Cannot prove human-originality against AI accusations",
    ],
    comparisonTable: [
      {
        feature: "Authorship Logs",
        colabwize: true,
        competitor: "Limited History",
      },
      { feature: "Citation Auditing", colabwize: true, competitor: false },
      { feature: "Keystroke Trail", colabwize: true, competitor: false },
      { feature: "Verified DOIs", colabwize: true, competitor: false },
      {
        feature: "Academic Integrity Certificates",
        colabwize: true,
        competitor: false,
      },
    ],
  },
  turnitin: {
    name: "Turnitin",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Turnitin_logo.svg/1200px-Turnitin_logo.svg.png",
    primaryFocus: "Plagiarism Detection",
    description:
      "Turnitin is the dominant force in academic plagiarism detection. While it is great at catching copied text, it often creates false positives with AI detection, putting students on the defensive without providing them the tools to prove their innocence.",
    pros: [
      "Massive database of student papers",
      "Industry-standard for institutions",
      "Accurate copy-plagiarism checks",
    ],
    cons: [
      "Unreliable AI detection scores",
      "Provides no proof for the student",
      "Expensive institutional-only pricing",
    ],
    comparisonTable: [
      { feature: "Student-Led Defense", colabwize: true, competitor: false },
      { feature: "Active Writing History", colabwize: true, competitor: false },
      {
        feature: "Integrated Research Tools",
        colabwize: true,
        competitor: false,
      },
      {
        feature: "Low False-Positive Guardrail",
        colabwize: true,
        competitor: "High False Positives",
      },
      {
        feature: "Individual Contribution Logs",
        colabwize: true,
        competitor: false,
      },
    ],
  },
  overleaf: {
    name: "Overleaf (LaTeX)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Overleaf_logo.svg/2560px-Overleaf_logo.svg.png",
    primaryFocus: "Technical STEM Research",
    description:
      "Overleaf is the premier LaTeX editor for STEM researchers. It excels at complex formatting but doesn't address the growing need for authorship verification and integrated citation auditing beyond BiBTeX management.",
    pros: [
      "Powerful for mathematical notation",
      "Great for LaTeX workflows",
      "Solid cloud versioning",
    ],
    cons: [
      "High learning curve",
      "No automated citation verification",
      "Lacks cryptographic defensibility logs",
    ],
    comparisonTable: [
      {
        feature: "Ease of Use",
        colabwize: "High (Rich Text)",
        competitor: "Medium (LaTeX)",
      },
      {
        feature: "Citation Verifier",
        colabwize: true,
        competitor: "Manual BiBTeX",
      },
      { feature: "Authorship Trail", colabwize: true, competitor: false },
      {
        feature: "Academic Integrity Shield",
        colabwize: true,
        competitor: false,
      },
      { feature: "Real-Time Collaboration", colabwize: true, competitor: true },
    ],
  },
};

const ComparePage: React.FC = () => {
  const { competitor } = useParams<{ competitor: string }>();

  const data = useMemo(() => {
    if (!competitor) return null;
    return COMPARISON_DATA[competitor.toLowerCase()];
  }, [competitor]);

  if (!data) {
    return <Navigate to="/pricing" replace />;
  }

  return (
    <Layout>
      <Helmet>
        <title>ColabWize vs {data.name} | Compare Academic Platforms</title>
        <meta
          name="description"
          content={`Detailed comparison of ColabWize and ${data.name}. Learn why ColabWize is the preferred platform for academic integrity, authorship verification, and citation credibility.`}
        />
      </Helmet>

      <div className="bg-white min-h-screen">
        {/* Hero Section */}
        <header className="py-24 border-b border-gray-100 bg-slate-50 relative overflow-hidden">
          <div className="container-custom max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 mb-16">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white font-bold text-4xl shadow-xl">
                  CW
                </div>
                <span className="font-extrabold text-2xl text-slate-900 border-b-2 border-blue-600">
                  ColabWize
                </span>
              </div>
              <div className="text-4xl font-black text-gray-300">VS</div>
              <div className="flex flex-col items-center gap-4 grayscale opacity-60">
                <div className="w-24 h-24 bg-gray-100 rounded-[2.5rem] flex items-center justify-center p-6 shadow-sm">
                  <img
                    src={data.logo}
                    alt={data.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-extrabold text-2xl text-slate-400">
                  {data.name}
                </span>
              </div>
            </div>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight leading-tight">
                Designed for{" "}
                <span className="text-blue-600">Academic Defensibility</span>.
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-10">
                {data.description}
              </p>
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 font-bold px-12 h-14 text-lg rounded-2xl">
                <Link to="/signup">Choose ColabWize - Free Trial</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* The Comparison Table */}
        <section className="py-24 container-custom max-w-5xl mx-auto font-primary">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center uppercase tracking-widest">
            The Breakdown
          </h2>
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden mt-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-primary uppercase tracking-wider text-xs">
                  <th className="p-8 font-bold">Feature Matrix</th>
                  <th className="p-8 font-extrabold text-blue-400">
                    ColabWize
                  </th>
                  <th className="p-8 font-bold">{data.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.comparisonTable.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-8 font-bold px-12 text-gray-700 border-r border-gray-50">
                      {row.feature}
                    </td>
                    <td className="p-8 bg-blue-50/30 border-r border-gray-50">
                      {typeof row.colabwize === "boolean" ? (
                        row.colabwize ? (
                          <CheckCircle2 className="w-6 h-6 text-blue-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-gray-300" />
                        )
                      ) : (
                        <span className="font-extrabold text-blue-600">
                          {row.colabwize}
                        </span>
                      )}
                    </td>
                    <td className="p-8 opacity-60">
                      {typeof row.competitor === "boolean" ? (
                        row.competitor ? (
                          <CheckCircle2 className="w-5 h-5 text-gray-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300" />
                        )
                      ) : (
                        <span className="font-bold text-gray-500">
                          {row.competitor}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pros and Cons */}
        <section className="py-20 bg-slate-50 border-y border-gray-100 tracking-normal leading-relaxed">
          <div className="container-custom max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="p-10 bg-white rounded-3xl border border-gray-100 shadow-sm shadow-blue-500/10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
                    The ColabWize Edge
                  </h3>
                </div>
                <div className="space-y-4">
                  {[
                    "Cryptographic Proof of Authorship",
                    "Integrated Citation Auditing System",
                    "Academic Integrity Certificates",
                    "Low false-positive barrier for AI detection",
                  ].map((pro, i) => (
                    <div
                      key={i}
                      className="flex gap-3 text-gray-900 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />{" "}
                      {pro}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-10 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8 opacity-40">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
                    {data.name} Limitations
                  </h3>
                </div>
                <div className="space-y-4">
                  {data.cons.map((con, i) => (
                    <div
                      key={i}
                      className="flex gap-3 text-gray-500 text-sm italic">
                      <XCircle className="w-5 h-5 text-gray-300 shrink-0" />{" "}
                      {con}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Teasers */}
        <section className="py-24 container-custom max-w-6xl mx-auto text-center leading-[1.6]">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-16 tracking-tight">
            Academic Integrity Requires More Than a Text Editor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <Link to="/citation-verification" className="group">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <SearchCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                Citation Verification
              </h4>
              <p className="text-gray-500 text-sm">
                Verify every source and avoid AI hallucinations with built-in
                database auditing.
              </p>
            </Link>
            <Link to="/prove-authorship" className="group">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <History className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                Authorship Trails
              </h4>
              <p className="text-gray-500 text-sm">
                Create a verifiably human process log to shield against false AI
                detection accusations.
              </p>
            </Link>
            <Link to="/academic-collaboration" className="group">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                Ethical Collaboration
              </h4>
              <p className="text-gray-500 text-sm">
                Co-author project while maintaining individual contribution logs
                for academic transparency.
              </p>
            </Link>
          </div>
        </section>

        {/* CTA Footer */}
        <footer className="py-20 bg-blue-600">
          <div className="container-custom max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tighter">
              Ready to protect your academic reputation?
            </h2>
            <p className="text-blue-100 text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
              Join thousands of students and researchers using the industry's
              first true academic integrity platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button
                asChild
                className="bg-white text-blue-600 hover:bg-blue-50 font-extrabold px-12 h-16 text-lg rounded-2xl shadow-2xl">
                <Link to="/signup">Start Free Trial</Link>
              </Button>
              <Button
                asChild
                className="border-blue-400 text-white hover:bg-white/10 font-bold px-12 h-16 text-lg rounded-2xl">
                <Link to="/pricing">View Pricing Plans</Link>
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default ComparePage;
