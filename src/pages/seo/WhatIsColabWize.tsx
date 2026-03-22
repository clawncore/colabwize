import React from "react";
import Layout from "../../components/Layout";
import { Shield, CheckCircle, Users, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";

const WhatIsColabWize = () => {
  return (
    <Layout>
      <div className="bg-white min-h-screen">
        {/* Hero Section */}
        <section className="section-padding bg-slate-50 relative overflow-hidden">
          <div className="container-custom relative z-10 py-12 lg:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight">
                What is <span className="text-blue-600">ColabWize</span>?
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed font-medium">
                ColabWize is an{" "}
                <strong>academic integrity and collaboration platform</strong>{" "}
                designed to help students and researchers produce credible,
                defensible academic work.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-7 rounded-full font-bold text-lg shadow-xl shadow-blue-500/20"
                  asChild>
                  <Link to="/signup">Get Started Free</Link>
                </Button>
                <Button
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-10 py-7 rounded-full font-bold text-lg"
                  asChild>
                  <Link to="/features">Explore Platform</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Definition Section */}
        <section className="section-padding py-20">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="bg-blue-50/50 border border-blue-100 p-8 md:p-12 rounded-3xl mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">
                  The Category Leader in Academic Defensibility
                </h2>
                <div className="prose prose-lg text-gray-600 max-w-none">
                  <p className="mb-4">
                    In a world where AI-generated content is becoming
                    ubiquitous, proving the <strong>originality</strong> and{" "}
                    <strong>authorship</strong> of your work has never been more
                    critical. ColabWize provides the tools necessary to create a
                    transparent, verifiable trail of your writing process.
                  </p>
                  <p>
                    The platform combines <strong>citation auditing</strong>,{" "}
                    <strong>authorship verification</strong>, and{" "}
                    <strong>collaborative writing tools</strong> to ensure
                    academic submissions are transparent, credible, and
                    verifiably human-created.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">
                    Integrity
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Verify every citation and claim to ensure your research
                    stands up to scrutiny and meets institutional standards.
                  </p>
                </div>
                <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">
                    Credibility
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Generate authorship certificates that prove your work is
                    original, properly sourced, and human-written.
                  </p>
                </div>
                <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">
                    Collaboration
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Work together in real-time while maintaining individual
                    contribution logs for full team transparency.
                  </p>
                </div>
              </div>

              <div className="mt-20 text-center">
                <p className="text-gray-500 font-medium mb-6 italic">
                  "Join thousands of researchers building defensible work with
                  ColabWize."
                </p>
                <Link
                  to="/academic-integrity-platform"
                  className="text-blue-600 font-bold hover:underline inline-flex items-center gap-2">
                  Learn more about our Academic Integrity Platform{" "}
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

export default WhatIsColabWize;
