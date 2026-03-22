import React from "react";
import Layout from "../../components/Layout";
import { Clock, Shield, Award, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";

const ProofOfAuthorshipSEO = () => {
  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen">
        {/* Feature Hero */}
        <section className="bg-white border-b border-gray-100 py-24 mb-16 overflow-hidden">
          <div className="container-custom relative">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-bold mb-6">
                <Clock className="h-4 w-4" /> Feature: Proof of Authorship
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight">
                Prove Your Work is <br />
                <span className="text-blue-600">Verifiably Human-Created</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
                In the age of AI, submitting your work isn't enough. You need to
                prove you wrote it. Our Proof of Authorship System creates an
                immutable log of your writing process, turning every keystroke
                into evidence of your original work.
              </p>
              <div className="flex gap-4">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-xl font-bold"
                  asChild>
                  <Link to="/signup">Start Your Authorship Log</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem & Solution */}
        <section className="section-padding py-24">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 font-primary">
                  The "AI Detection" Problem
                </h2>
                <div className="prose text-gray-600 space-y-4">
                  <p>
                    False positives in AI detection software are a growing
                    threat to students and researchers. A simple "90% AI" flag
                    can derail a career, even if the work is 100% original.
                  </p>
                  <p>
                    <strong>
                      Traditional detection is focused on the result. ColabWize
                      is focused on the process.
                    </strong>
                  </p>
                </div>

                <div className="mt-12 space-y-6">
                  <div className="flex gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Shield className="h-6 w-6 text-green-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900">
                        Academic Defensibility
                      </h4>
                      <p className="text-sm text-gray-500">
                        Provide incontrovertible proof of your writing
                        progression over time.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Award className="h-6 w-6 text-purple-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900">
                        Authorship Certificate
                      </h4>
                      <p className="text-sm text-gray-500">
                        Generate a verifiable certificate link to include with
                        your submissions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#050B14] rounded-3xl p-10 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <CheckCircle className="text-blue-400" /> Authorship
                  Verification Log
                </h3>
                <div className="space-y-4">
                  <div className="font-mono text-sm text-blue-300">
                    # Logging Active Process
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full w-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[65%]"></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 font-mono">
                    <span>MAR 06 14:20:01</span>
                    <span>1,240 KEYSTROKES</span>
                  </div>
                  <div className="pt-8 space-y-2">
                    <div className="text-sm text-gray-400">
                      Total Writing Time:{" "}
                      <span className="text-white">4h 12m</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Revision Cycles: <span className="text-white">12</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Sources Cited: <span className="text-white">8</span>
                    </div>
                  </div>
                  <div className="pt-10">
                    <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-xl text-center">
                      <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">
                        Verified Identity Matched
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="container-custom text-center">
            <h3 className="text-3xl font-extrabold mb-4">
              Never fear an AI detector again.
            </h3>
            <p className="text-gray-500 mb-10">
              ColabWize turns your writing effort into academic evidence.
            </p>
            <Link
              to="/what-is-colabwize"
              className="text-blue-600 font-bold hover:underline inline-flex items-center gap-2">
              Explore the Categories of Academic Integrity{" "}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ProofOfAuthorshipSEO;
