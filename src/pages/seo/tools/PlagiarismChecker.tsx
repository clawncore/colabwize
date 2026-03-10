import React from "react";
import Layout from "../../../components/Layout";
import PageMetadata from "../../../components/PageMetadata";
import { Button } from "../../../components/ui/button";
import { Link } from "react-router-dom";
import { ShieldAlert, Search, RefreshCw, Lock, ArrowRight } from "lucide-react";

const PlagiarismChecker = () => {
  return (
    <Layout>
      <PageMetadata 
        title="Accurate Plagiarism Checker for Students" 
        description="Verify the originality of your work with our advanced plagiarism detection engine. Scan against billions of web pages and academic databases."
      />
      <div className="bg-white">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-indigo-50/40">
          <div className="container-custom relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Academic <span className="text-indigo-600">Plagiarism</span> Checker
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Don't just check for matches—prove your originality. ColabWize combines plagiarism detection with authorship verification to give you a complete defensibility report.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white h-14 px-8 text-lg font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all">
                  <Link to="/signup" className="flex items-center">
                    Scan My Paper <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-all">
                  <Link to="/features">See Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-100/10 -skew-x-12 translate-x-1/4 hidden lg:block" />
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-8 border border-slate-100 rounded-3xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all group">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                  <Search className="h-6 w-6 text-indigo-600 group-hover:text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">Deep Web Scan</h3>
                <p className="text-sm text-slate-600">Scans billions of websites, journals, and private repositories.</p>
              </div>
              <div className="p-8 border border-slate-100 rounded-3xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all group">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
                  <ShieldAlert className="h-6 w-6 text-green-600 group-hover:text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">AI Detection</h3>
                <p className="text-sm text-slate-600">Industry-leading detection for ChatGPT, Claude, and Gemini content.</p>
              </div>
              <div className="p-8 border border-slate-100 rounded-3xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all group">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
                  <RefreshCw className="h-6 w-6 text-orange-600 group-hover:text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">Source Linking</h3>
                <p className="text-sm text-slate-600">Get direct links to matching sources for easy correction.</p>
              </div>
              <div className="p-8 border border-slate-100 rounded-3xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all group">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                  <Lock className="h-6 w-6 text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">Privacy First</h3>
                <p className="text-sm text-slate-600">Your documents are never stored in public databases or resold.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-24 bg-slate-50">
          <div className="container-custom max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Academic Success Depends on Originality</h2>
            <div className="prose prose-lg prose-slate max-w-none mb-16 mx-auto">
              <p>
                In an era where AI can generate content in seconds, proving that your work is original has never been more important. ColabWize doesn't just look for matches—it provides the evidence you need to show that the thinking and writing behind your paper are yours.
              </p>
            </div>
            <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 h-14 px-12 text-lg font-bold rounded-xl transition-all shadow-xl">
              <Link to="/signup text-white">Create Your Free Account</Link>
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default PlagiarismChecker;
