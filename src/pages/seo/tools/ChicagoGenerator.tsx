import React from "react";
import Layout from "../../../components/Layout";
import PageMetadata from "../../../components/PageMetadata";
import { Button } from "../../../components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, Zap, Shield, FileText, ArrowRight } from "lucide-react";

const ChicagoGenerator = () => {
  return (
    <Layout>
      <PageMetadata 
        title="Chicago Style Citation Generator (17th Edition)" 
        description="Generate Chicago style citations easily for footnotes, endnotes, and bibliographies. Perfect for history and social science research."
      />
      <div className="bg-white">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-red-50/30">
          <div className="container-custom relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Chicago Style <span className="text-red-600">Generator</span> (17th Edition)
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Support for both Notes/Bibliography and Author/Date systems. The only tool that guarantees professional-grade Chicago formatting.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white h-14 px-8 text-lg font-semibold rounded-xl shadow-lg shadow-red-200 transition-all">
                  <Link to="/signup" className="flex items-center">
                    Cite in Chicago <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-all">
                  <Link to="/features">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-red-100/10 -skew-x-12 translate-x-1/4 hidden lg:block" />
        </section>

        {/* Content Section */}
        <section className="py-24">
          <div className="container-custom max-w-4xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Professional Citation for History & Social Science</h2>
            <div className="prose prose-lg prose-slate max-w-none mb-16">
              <p>
                Chicago style is often considered the most complex citation system due to its extensive use of footnotes and specific punctuation rules. It remains the gold standard for historical research and many academic publications.
              </p>
              <p>
                ColabWize removes the headache from Chicago style. Our tool automatically creates the shortened note versions and provides the correct bibliographic formatting for every source type imaginable—from ancient manuscripts to modern podcasts.
              </p>
            </div>

            <div className="bg-slate-900 rounded-3xl p-12 text-white text-center relative overflow-hidden">
               <h2 className="text-3xl font-bold mb-6">Built for Serious Research</h2>
              <p className="text-red-100/80 text-lg mb-8 max-w-xl mx-auto">
                Advanced features for advanced scholars. Start your project on a solid foundation.
              </p>
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 h-14 px-10 text-lg font-bold rounded-xl transition-all">
                <Link to="/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ChicagoGenerator;
