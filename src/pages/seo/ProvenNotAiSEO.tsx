import React from "react";
import {
  ShieldCheck,
  History,
  SearchCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  FileText,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import Layout from "../../components/Layout";
import { Helmet } from "react-helmet-async";

const ProvenNotAiSEO: React.FC = () => {
  return (
    <Layout>
      <Helmet>
        <title>
          How to Prove Your Writing is Not AI | Step-by-Step Guide | ColabWize
        </title>
        <meta
          name="description"
          content="Accused of using AI? Follow this step-by-step guide to prove your academic work is 100% human-created using evidence trails and authorship logs."
        />
      </Helmet>

      <div className="bg-white min-h-screen">
        {/* Header */}
        <header className="py-20 border-b border-gray-100 bg-slate-50">
          <div className="container-custom max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 tracking-tight">
              Accused of using <span className="text-blue-600">AI?</span> <br />
              <span className="text-gray-900">
                Here's exactly how to prove your case.
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              When a professor flags your work, "I promise I wrote it" isn't
              enough. You need **Academic Defensibility**.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 font-bold px-8 h-12 shadow-lg">
                <Link to="/signup">Get Your Authorship Proof</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* The 5-Step Proof Framework */}
        <section className="py-24 container-custom max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            The 5-Step Defensibility Framework
          </h2>

          <div className="space-y-16">
            <div className="flex gap-8">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Export Full Revision History
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Start by showing the time you spent. A 10-page paper shouldn't
                  appear in one 2-minute session. Use **ColabWize's session
                  logs** to show that you worked on the draft over a period of
                  days or weeks.
                </p>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Show Sentence-Level Evolution
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  AI generates text in large, perfect blocks. Humans rewrite.
                  Show the "messy" middle where you deleted words, rephrased
                  sentences, and fixed typos. This behavior proves human
                  trial-and-error.
                </p>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Link Edits to Research PDFs
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Prove you engaged with the material. Showing that you opened a
                  specific research PDF at 2:05 PM and added a citation related
                  to that PDF at 2:10 PM is irrefutable proof of your research
                  process.
                </p>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                4
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Provide Citation Audit Reports
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  AI often makes up citations. Use the **ColabWize Citation
                  Audit** to show that every single reference in your work is
                  verified, real, and contextually accurate to the sources.
                </p>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                5
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Submit the Authorship Certificate
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Instead of arguing, provide a **ColabWize Certificate**. It
                  gives the professor a cryptographic summary of your process,
                  from total writing time to unique research interactions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-blue-600">
          <div className="container-custom max-w-4xl mx-auto text-center">
            <ShieldCheck className="w-20 h-20 text-blue-200 mx-auto mb-8" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              The only thing stronger than a detector is an evidence trail.
            </h2>
            <p className="text-blue-100 text-lg mb-10">
              Start your next assignment in ColabWize and ensure you never have
              to face a false accusation alone.
            </p>
            <Button
              asChild
              className="bg-white text-blue-600 hover:bg-blue-50 font-extrabold px-12 h-16 text-lg rounded-2xl">
              <Link to="/signup">Begin Your Authenticity Trail</Link>
            </Button>
          </div>
        </section>

        {/* Internal Linking */}
        <section className="py-20 bg-slate-50 border-t border-gray-100">
          <div className="container-custom max-w-4xl mx-auto text-center">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-10">
              Frequently Asked Questions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <Link
                to="/ai-false-positive-problem"
                className="p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all">
                <h5 className="font-bold text-gray-900 mb-2">
                  Why was my human writing flagged?
                </h5>
                <p className="text-sm text-gray-500">
                  Learn why academic writing styles often trigger AI detectors
                  wrongly.
                </p>
              </Link>
              <Link
                to="/what-is-authorship-verification"
                className="p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all">
                <h5 className="font-bold text-gray-900">
                  What is Authorship Verification?
                </h5>
                <p className="text-sm text-gray-500">
                  A detailed look at the new standard for academic honesty.
                </p>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ProvenNotAiSEO;
