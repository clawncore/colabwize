import React from "react";
import Layout from "../../components/Layout";
import {
  SearchCheck,
  Link as LinkIcon,
  AlertCircle,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";

const CitationAuditorSEO = () => {
  return (
    <Layout>
      <div className="bg-white min-h-screen">
        {/* Feature Hero */}
        <section className="bg-green-50/30 overflow-hidden py-24">
          <div className="container-custom relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold mb-6">
                  <SearchCheck className="h-4 w-4" /> Feature: Citation
                  Verification
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
                  Strengthen Your <br />
                  <span className="text-green-600">Research Credibility</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  The ColabWize Citation Verification System automatically
                  audits every claim in your document, identifying missing
                  sources and ensuring your work stands up to academic scrutiny.
                </p>
                <div className="flex gap-4">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-xl font-bold"
                    asChild>
                    <Link to="/signup">Verify Your Citations</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 transform lg:rotate-2">
                  <div className="flex items-center gap-4 mb-6 border-b border-gray-50 pb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-xs text-gray-400 font-medium ml-auto tracking-wide">
                      CONFIDENCE REPORT
                    </span>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                        92
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          High Confidence
                        </div>
                        <div className="text-xs text-gray-500">
                          Source: Smith et al. (2024) verified
                        </div>
                      </div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                        45
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          Missing Link
                        </div>
                        <div className="text-xs text-gray-500">
                          Citation needed for biological claim
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Details */}
        <section className="section-padding py-24">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">
                How the Citation Verification System Works
              </h2>

              <div className="space-y-12">
                <div className="flex gap-8 items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                    <SearchCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">
                      Automatic Claim Detection
                    </h3>
                    <p className="text-gray-600">
                      Our engine scans your document in real-time to identify
                      factual claims and assertions that require support from
                      existing research.
                    </p>
                  </div>
                </div>

                <div className="flex gap-8 items-start">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                    <LinkIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">
                      Cross-Database Matching
                    </h3>
                    <p className="text-gray-600">
                      We cross-reference your citations against billions of
                      academic papers, journals, and books to ensure source
                      accuracy and relevance.
                    </p>
                  </div>
                </div>

                <div className="flex gap-8 items-start">
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">
                      Identification of Missing Links
                    </h3>
                    <p className="text-gray-600">
                      Never worry about an unsupported claim again. We flag
                      sections of your work that need stronger evidence before
                      you submit.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-20 p-12 bg-slate-50 rounded-3xl text-center border border-gray-100">
                <h3 className="text-2xl font-bold mb-4 italic">
                  "Submission anxiety eliminated."
                </h3>
                <p className="text-gray-500 mb-8">
                  ColabWize ensures your bibliography is perfect and your claims
                  are bulletproof.
                </p>
                <Link
                  to="/academic-integrity-platform"
                  className="text-blue-600 font-bold hover:underline inline-flex items-center gap-2">
                  Learn about the full Academic Integrity Platform{" "}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CitationAuditorSEO;
