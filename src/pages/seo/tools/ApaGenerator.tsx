import React from "react";
import Layout from "../../../components/Layout";
import PageMetadata from "../../../components/PageMetadata";
import { Button } from "../../../components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, Zap, Shield, FileText, ArrowRight } from "lucide-react";

const ApaGenerator = () => {
  return (
    <Layout>
      <PageMetadata
        title="Free APA Citation Generator (7th Edition)"
        description="Generate accurate APA citations for your research papers instantly. Our tool supports journals, books, websites, and more with 100% precision."
      />
      <div className="bg-white">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-slate-50">
          <div className="container-custom relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Free APA Citation{" "}
                <span className="text-blue-600">Generator</span> (7th Edition)
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Create flawless APA citations in seconds. Join thousands of
                students and researchers who use ColabWize to ensure academic
                integrity and save time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-8 text-lg font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all">
                  <Link to="/signup" className="flex items-center">
                    Start Citing Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button className="h-14 px-8 text-lg font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-all">
                  <Link to="/features">How it works</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/50 -skew-x-12 translate-x-1/4 hidden lg:block" />
        </section>

        {/* Value Props */}
        <section className="py-20 border-y border-slate-100">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Instant Generation
                </h3>
                <p className="text-slate-600">
                  Enter a DOI, URL, or ISBN and get a perfectly formatted APA
                  citation automatically.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Audit-Ready
                </h3>
                <p className="text-slate-600">
                  Every citation is verified against our credibility index to
                  protect you from retracted papers.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Full Export
                </h3>
                <p className="text-slate-600">
                  Export your bibliography directly to Word, PDF, or Google Docs
                  with one click.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-24">
          <div className="container-custom max-w-4xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              Why use ColabWize's APA Generator?
            </h2>
            <div className="prose prose-lg prose-slate max-w-none mb-16">
              <p>
                APA style (American Psychological Association) is the standard
                for social sciences, education, and psychology. Accuracy in
                citation is not just about avoiding plagiarism—it's about
                building a foundation of credible research that can be defended.
              </p>
              <p>
                Our generator goes beyond simple formatting. While other tools
                just move commas and periods, ColabWize audits the source
                itself. We check if the journal is reputable and if the citation
                actually supports your claims through our advanced AI engine.
              </p>
            </div>

            <div className="bg-slate-900 rounded-3xl p-12 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <h2 className="text-3xl font-bold mb-6">
                Ready to cite like a pro?
              </h2>
              <p className="text-blue-100/80 text-lg mb-8 max-w-xl mx-auto">
                Join 10,000+ students and academics who have already generated
                over 1 million verifiable citations.
              </p>
              <Button className="bg-white text-slate-900 hover:bg-slate-100 h-14 px-10 text-lg font-bold rounded-xl transition-all">
                <Link to="/signup">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ApaGenerator;
