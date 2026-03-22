import React from "react";
// Forced re-parse to resolve import error
import Layout from "../../../components/Layout";
import PageMetadata from "../../../components/PageMetadata";
import { Button } from "../../../components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, Zap, Shield, FileText, ArrowRight } from "lucide-react";

const MlaGenerator = () => {
  return (
    <Layout>
      <PageMetadata
        title="Free MLA Citation Generator (9th Edition)"
        description="Create perfect MLA citations for your essays and research papers. Our MLA generator handles books, websites, and articles with extreme precision."
      />
      <div className="bg-white">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-orange-50/30">
          <div className="container-custom relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Free MLA Citation{" "}
                <span className="text-orange-600">Generator</span> (9th Edition)
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                The most advanced MLA citation tool for students of literature
                and humanities. Fast, accurate, and completely verifiable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white h-14 px-8 text-lg font-semibold rounded-xl shadow-lg shadow-orange-200 transition-all">
                  <Link to="/signup" className="flex items-center">
                    Generate MLA Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button className="h-14 px-8 text-lg font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-all">
                  <Link to="/features">See Features</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-100/20 -skew-x-12 translate-x-1/4 hidden lg:block" />
        </section>

        {/* Content Section */}
        <section className="py-24">
          <div className="container-custom max-w-4xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              Master MLA Format Instantly
            </h2>
            <div className="prose prose-lg prose-slate max-w-none mb-16">
              <p>
                MLA (Modern Language Association) style is widely used in the
                humanities, especially in writing on language and literature.
                Keeping track of containers, publishers, and versions can be
                exhausting.
              </p>
              <p>
                ColabWize simplifies this process. Our generator is built on the
                latest 9th edition guidelines, ensuring that your core elements
                are correctly placed every time. Beyond formatting, ColabWize
                provides evidence of your research process, helping you defend
                against false AI accusations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="bg-slate-50 p-8 rounded-3xl">
                <CheckCircle className="h-8 w-8 text-orange-600 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-slate-900">
                  Works Cited Lists
                </h3>
                <p className="text-slate-600">
                  Automatically alphabetized and formatted with proper hanging
                  indents for easy export.
                </p>
              </div>
              <div className="bg-slate-50 p-8 rounded-3xl">
                <CheckCircle className="h-8 w-8 text-orange-600 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-slate-900">
                  In-Text Citations
                </h3>
                <p className="text-slate-600">
                  Get the exact parenthetical format needed for your specific
                  source type.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-12 text-white text-center relative overflow-hidden">
              <h2 className="text-3xl font-bold mb-6">
                Stop Worrying About Formats
              </h2>
              <p className="text-orange-100/80 text-lg mb-8 max-w-xl mx-auto">
                Focus on your analysis. We'll handle the bibliography.
              </p>
              <Button className="bg-white text-slate-900 hover:bg-slate-100 h-14 px-10 text-lg font-bold rounded-xl transition-all">
                <Link to="/signup">Try it Free</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default MlaGenerator;
