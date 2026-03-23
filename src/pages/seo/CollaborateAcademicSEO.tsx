import React from "react";
import {
  Users,
  ShieldCheck,
  MessageSquare,
  History,
  ArrowRight,
  CheckCircle2,
  Lock,
  Zap,
  Layout as LayoutIcon,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import Layout from "../../components/Layout";
import { Helmet } from "react-helmet-async";

const CollaborateAcademicSEO: React.FC = () => {
  return (
    <Layout>
      <Helmet>
        <title>
          How to Collaborate on Academic Papers Ethically | ColabWize
        </title>
        <meta
          name="description"
          content="Master the art of collaborative academic writing. Learn how to co-author papers while maintaining individual contribution logs and academic integrity."
        />
      </Helmet>

      <div className="bg-white min-h-screen font-primary">
        {/* Header */}
        <header className="py-20 border-b border-gray-100 bg-slate-50">
          <div className="container-custom max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-widest mb-6">
              <Users className="w-3.5 h-3.5" /> Collaboration Guide
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 tracking-tight">
              Ethical{" "}
              <span className="text-purple-600">Academic Collaboration</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-3xl mx-auto">
              Working in groups is a cornerstone of modern research, but it
              shouldn't compromise your academic integrity. Learn how to
              co-author with confidence.
            </p>
            <div className="flex justify-center">
              <Button
                asChild
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-10 h-12 shadow-lg">
                <Link to="/signup">Start a Shared Workspace</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* The Collaboration Dilemma */}
        <section className="py-24 container-custom max-w-4xl mx-auto">
          <div className="prose prose-purple max-w-none prose-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 font-primary uppercase tracking-tight">
              The "Contract Cheating" Trap
            </h2>
            <p>
              When students collaborate on WhatsApp or Google Docs, professors
              often have no way of knowing who contributed what. If one student
              uses AI, the entire group risks being flagged for academic
              misconduct.
            </p>
            <p>**Ethical collaboration requires transparency.**</p>

            <div className="my-12 p-8 bg-purple-50 rounded-3xl border border-purple-100 flex gap-6">
              <div className="shrink-0">
                <ShieldCheck className="w-10 h-10 text-purple-600" />
              </div>
              <div>
                <h4 className="text-purple-900 font-bold mb-2 uppercase tracking-wide">
                  Contribution Transparency
                </h4>
                <p className="text-purple-800 mb-0">
                  ColabWize solves the collaboration dilemma by providing
                  individual contribution logs within a unified research
                  workspace.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mt-16 mb-10 font-primary uppercase tracking-tight text-center">
              3 Pillars of Ethical Co-Authoring
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                  <History className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">
                  Individual Trails
                </h3>
                <p className="text-gray-500 text-sm">
                  Every member's unique writing activity is captured separately,
                  protecting innocent co-authors from rogue AI use.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">
                  Contextual Chat
                </h3>
                <p className="text-gray-500 text-sm">
                  Keep discussions about research within the document context.
                  No more hunting through email or messaging apps.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">
                  Shared Resources
                </h3>
                <p className="text-gray-500 text-sm">
                  ColabWize workspaces allow teams to highlight and annotate
                  shared PDFs, ensuring everyone is on the same research page.
                </p>
              </div>
            </div>

            <div className="mt-20 p-12 bg-gray-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Users className="w-48 h-48" />
              </div>
              <h2 className="text-3xl font-bold mb-6 text-white font-primary uppercase tracking-tight">
                Collaboration Optimized for Integrity.
              </h2>
              <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                Step into a professional research environment that values your
                individual work as much as the final group outcome.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  className="bg-purple-600 hover:bg-purple-700 font-bold px-10 h-14">
                  <Link to="/signup">Create Team Workspace</Link>
                </Button>
                <Button
                  asChild
                  className="border-gray-700 text-white hover:bg-gray-800 font-bold px-10 h-14">
                  <Link to="/academic-collaboration">
                    Read the Full Strategy
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Related Hub Links */}
        <section className="py-20 bg-slate-50 border-t border-gray-100">
          <div className="container-custom max-w-4xl mx-auto">
            <h4 className="text-sm font-bold text-gray-400 mb-12 uppercase tracking-[0.2em] text-center">
              Part of the Academic Integrity Cluster
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Link
                to="/prove-authorship"
                className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-gray-100 group-hover:border-purple-500">
                  <Lock className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <h5 className="font-bold text-gray-900 leading-tight">
                    Authorship Verification
                  </h5>
                  <p className="text-xs text-gray-400">Prove it's your work.</p>
                </div>
              </Link>
              <Link
                to="/citation-verification"
                className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-gray-100 group-hover:border-purple-500">
                  <Search className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <h5 className="font-bold text-gray-900 leading-tight">
                    Citation Auditing
                  </h5>
                  <p className="text-xs text-gray-400">Verify every claim.</p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CollaborateAcademicSEO;
