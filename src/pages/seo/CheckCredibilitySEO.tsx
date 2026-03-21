import React from "react";
import {
  SearchCheck,
  BookOpen,
  ShieldCheck,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  Database,
  CheckCircle2,
  FileSearch,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import Layout from "../../components/Layout";
import { Helmet } from "react-helmet-async";

const CheckCredibilitySEO: React.FC = () => {
  return (
    <Layout>
      <Helmet>
        <title>
          How to Check Citation Credibility | Research Guide | ColabWize
        </title>
        <meta
          name="description"
          content="Learn the professional way to verify research citations. Check for hallucinated sources, verify DOIs, and ensure your bibliography is academically sound."
        />
      </Helmet>

      <div className="bg-white min-h-screen">
        {/* Header */}
        <header className="py-20 border-b border-gray-100 bg-slate-50">
          <div className="container-custom max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 tracking-tight">
              How to Check{" "}
              <span className="text-green-600">Citation Credibility</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              Don't let a "hallucinated" citation ruin your research. Use this
              professional auditing checklist to verify every source in your
              project.
            </p>
            <div className="flex justify-center">
              <Button
                asChild
                className="bg-green-600 hover:bg-green-700 font-bold px-10 h-12 shadow-lg">
                <Link to="/signup">Verify Your Bibliography Free</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* The Checklist */}
        <section className="py-24 container-custom max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Researcher's Citation Checklist
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
              <SearchCheck className="mx-auto w-12 h-12 text-green-600 mb-6" />
              <h3 className="text-xl font-bold mb-4 font-primary">
                Verify the DOI
              </h3>
              <p className="text-gray-500 text-sm">
                Every real academic paper has a unique Digital Object
                Identifier. If it doesn't exist on CrossRef or DataCite, the
                paper might be a hallucination.
              </p>
            </div>
            <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
              <BookOpen className="mx-auto w-12 h-12 text-green-600 mb-6" />
              <h3 className="text-xl font-bold mb-4 font-primary">
                Check the Publisher
              </h3>
              <p className="text-gray-500 text-sm">
                Is the source from a recognized publisher like Nature, IEEE, or
                JSTOR? Be wary of predatory journals or "sponsored" content that
                lacks peer review.
              </p>
            </div>
            <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
              <Database className="mx-auto w-12 h-12 text-green-600 mb-6" />
              <h3 className="text-xl font-bold mb-4 font-primary">
                Cross-Reference Metadata
              </h3>
              <p className="text-gray-500 text-sm">
                Ensure the author names, publication year, and volume numbers
                match across multiple databases. Discrepancies often signal
                generated text.
              </p>
            </div>
            <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
              <FileSearch className="mx-auto w-12 h-12 text-green-600 mb-6" />
              <h3 className="text-xl font-bold mb-4 font-primary">
                Contextual Relevance
              </h3>
              <p className="text-gray-500 text-sm">
                Does the paper's abstract actually support the point you are
                making? Misquoting real sources is just as dangerous as using
                fake ones.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Spotlight */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute right-0 top-0 p-20 opacity-10">
            <SearchCheck className="w-64 h-64 text-green-400 -rotate-12" />
          </div>
          <div className="container-custom max-w-5xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-primary">
                  Automate Your Audit with ColabWize
                </h2>
                <p className="text-gray-400 text-lg mb-8">
                  Manual verification takes hours. ColabWize's **Citation
                  Confidence Auditor** scans your document in seconds, flagging
                  missing DOIs and semantic context mismatches instantly.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300 font-bold">
                      200M+ Academic Records
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300 font-bold">
                      Semantic Accuracy Check
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300 font-bold">
                      Instant Replacement Suggestions
                    </span>
                  </li>
                </ul>
                <Button
                  asChild
                  className="bg-green-600 hover:bg-green-700 font-bold px-10 h-14 min-w-[200px]">
                  <Link to="/signup">Verify My Work Now</Link>
                </Button>
              </div>
              <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm shadow-2xl">
                <div className="bg-white rounded-2xl p-6 text-slate-900 border border-green-200">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                    <span className="font-bold text-sm uppercase text-gray-400">
                      Audit Status
                    </span>
                    <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-0.5 rounded">
                      PASSED
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0">
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate max-w-[200px]">
                          Quantum Computing Ethics...
                        </p>
                        <p className="text-[10px] text-gray-400">
                          DOI: 10.1038/s41586-023-0123-x
                        </p>
                      </div>
                    </div>
                    <div className="h-2 bg-green-100 rounded-full w-full">
                      <div className="h-full bg-green-500 w-[100%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guide Footer */}
        <section className="py-24 container-custom max-w-4xl mx-auto text-center">
          <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-8" />
          <h2 className="text-3xl font-bold mb-6 font-primary">
            Protecting Every Project
          </h2>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
            Citation integrity is the foundation of academic trust. Join
            thousands of researchers who use ColabWize to maintain irrefutable
            bibliographies.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <Link
              to="/citation-verification"
              className="group p-6 bg-white border border-gray-200 rounded-2xl hover:border-green-500 transition-colors">
              <h4 className="font-bold mb-2 group-hover:text-green-600 transition-colors">
                Expert Guide: Citation Verification
              </h4>
              <p className="text-sm text-gray-500">
                Go deeper into the technical patterns of citation auditing.
              </p>
            </Link>
            <Link
              to="/academic-integrity"
              className="group p-6 bg-white border border-gray-200 rounded-2xl hover:border-green-500 transition-colors">
              <h4 className="font-bold mb-2 group-hover:text-green-600 transition-colors">
                Academic Integrity Hub
              </h4>
              <p className="text-sm text-gray-500">
                Explore all tools for proving your work's authenticity.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CheckCredibilitySEO;
