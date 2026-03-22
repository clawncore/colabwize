import React from "react";
import {
  History,
  Shield,
  Zap,
  CheckCircle2,
  FileText,
  ArrowRight,
  ShieldCheck,
  Search,
  Lock,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import Layout from "../../components/Layout";
import { Helmet } from "react-helmet-async";

const ProveAuthorshipSEO: React.FC = () => {
  return (
    <Layout>
      <Helmet>
        <title>How to Prove Authorship of Academic Work | ColabWize</title>
        <meta
          name="description"
          content="Learn the definitive framework for proving your academic work is original and human-written. Protect your career from false AI accusations."
        />
      </Helmet>

      <div className="bg-white min-h-screen">
        {/* Article Header */}
        <header className="py-20 border-b border-gray-100 bg-slate-50">
          <div className="container-custom max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6 outline-none">
              <Link
                to="/academic-integrity"
                className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                <Shield className="w-4 h-4" /> Academic Integrity Hub
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-500 text-sm">Expert Guides</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight leading-tight">
              The Definitive Guide to{" "}
              <span className="text-blue-600">Proving Authorship</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-10">
              When an AI detector flags your work "90% AI," the burden of proof
              is on you. Submitting the final document is no longer enough—you
              need to prove the *process* of creation.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=100&h=100&fit=crop`}
                      alt="Expert"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 font-medium font-primary uppercase tracking-wider">
                Reviewed by Academic Integrity Experts
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <article className="py-20 container-custom max-w-4xl mx-auto">
          <div className="prose prose-blue max-w-none prose-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Why "AI Detectors" Fail Students
            </h2>
            <p>
              Most AI detection software works by analyzing patterns in the
              final text. If your writing is too structured, concise, or
              perfectly formatted, it may trigger a false positive. This creates
              an unfair environment where high-performing students are often the
              ones targeted.
            </p>

            <div className="my-12 p-8 bg-amber-50 rounded-3xl border border-amber-200 flex gap-6">
              <div className="shrink-0">
                <ShieldCheck className="w-10 h-10 text-amber-600" />
              </div>
              <div>
                <h4 className="text-amber-900 font-bold mb-2">
                  The Defensibility Shift
                </h4>
                <p className="text-amber-800 mb-0">
                  Leading universities are moving away from relying on "AI
                  scores" and toward requiring "Defensibility Documents"—proof
                  of a student's actual research and writing journey.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mt-16 mb-6">
              3 Ways to Prove Original Authorship
            </h2>

            <section className="space-y-12 my-12">
              <div className="relative pl-10 border-l-2 border-blue-100">
                <div className="absolute left-[-13px] top-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Maintain Comprehensive Revision History
                </h3>
                <p>
                  A final paper appearing instantly looks like an AI copy-paste.
                  A paper that evolves over 15 hours with thousands of
                  documented edits proves human labor. Tools like ColabWize
                  capture every keystroke in a way that is far more granular
                  than standard document history.
                </p>
              </div>

              <div className="relative pl-10 border-l-2 border-blue-100">
                <div className="absolute left-[-13px] top-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Link Edits to Research Sources
                </h3>
                <p>
                  Proving authorship means showing where your ideas came from.
                  When your edits are timestamped alongside your interaction
                  with credible research PDFs, you build an ironclad case for
                  original thought.
                </p>
              </div>

              <div className="relative pl-10 border-l-2 border-blue-100">
                <div className="absolute left-[-13px] top-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Generate an Authorship Certificate
                </h3>
                <p>
                  Submitting a **ColabWize Authorship Certificate** with your
                  paper gives professors a direct link to your writing effort
                  metrics without sharing your private drafts.
                </p>
              </div>
            </section>

            <div className="mt-20 p-12 bg-gray-900 rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl">
              <div className="absolute top-0 right-0 p-10 opacity-20 rotate-12">
                <Zap className="w-48 h-48" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-3xl font-bold mb-6 text-white">
                  Turn your process into a shield.
                </h2>
                <p className="text-gray-400 mb-10 text-lg">
                  Stop worrying about AI detectors. ColabWize is the only
                  platform designed from the ground up to make your academic
                  work verifiably human.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    asChild
                    className="bg-blue-600 hover:bg-blue-700 font-bold px-10 h-14">
                    <Link to="/signup">Start Free Verification</Link>
                  </Button>
                  <Button
                    asChild
                    className="border-gray-700 text-white hover:bg-gray-800 font-bold px-10 h-14">
                    <Link to="/how-to-prove-your-writing-is-not-ai">
                      See the Student Guide
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Internal Linking Footer */}
        <footer className="py-20 border-t border-gray-100 bg-slate-50">
          <div className="container-custom max-w-4xl mx-auto">
            <h4 className="text-lg font-bold text-gray-900 mb-8 uppercase tracking-widest text-center">
              Related Topic Guides
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                to="/citation-verification"
                className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-500 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <Search className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900">
                      Citation Verification
                    </h5>
                    <p className="text-sm text-gray-500">
                      How to audit research claims.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </Link>
              <Link
                to="/academic-collaboration"
                className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-500 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900">
                      Collaboration Guides
                    </h5>
                    <p className="text-sm text-gray-500">
                      Working ethically in teams.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default ProveAuthorshipSEO;
