import React from "react";
import PageMetadata from "../../components/PageMetadata";
import { Link } from "react-router-dom";
import {
  Shield,
  BookOpen,
  AlertTriangle,
  Users,
  History,
  FileSearch,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../../components/ui/button";

export default function AcademicIntegrityGuide() {
  return (
    <>
      <PageMetadata
        title="The Complete Guide to Academic Integrity in 2026"
        description="Master academic integrity in the AI era. Learn plagiarism prevention, authorship verification, citation credibility, and how to combat false AI detection."
        ogType="article"
      />

      {/* Hero Section */}
      <header className="bg-slate-900 text-white pt-24 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-3xl z-0"></div>
        <div className="container-custom relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 text-sm font-bold uppercase tracking-wider mb-8 border border-blue-500/30">
            <BookOpen className="w-4 h-4" />
            Ultimate Guide
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
            The Complete Guide to <br className="hidden md:block" />
            <span className="text-blue-400">Academic Integrity</span> in 2026
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
            Generative AI changed everything. The rules of research have been
            rewritten. Learn how to navigate the new landscape of authorship,
            citations, and defensibility.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-gray-50 py-16">
        <div className="container-custom max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Introduction: The Shift in the Burden of Proof
            </h2>
            <div className="prose prose-lg text-gray-600 max-w-none">
              <p>
                Five years ago, academic integrity was primarily about avoiding
                the mechanical act of copying and pasting text. Universities
                utilized simple matching software to find identical strings of
                text across the internet. If you didn't copy, you were safe.
              </p>
              <p>
                Today, the emergence of Large Language Models (LLMs) has
                shattered that paradigm. Students are no longer just accused of
                copying; they are accused of using algorithms to simulate
                thought. Because of this, the burden of proof has shifted. It is
                no longer enough to simply <em>be</em> honest; you must be able
                to mathematically <em>prove</em> your honesty.
              </p>
              <p>
                This pillar guide serves as your comprehensive roadmap to
                surviving and thriving in this new, zero-trust academic
                environment. We break down the four core pillars of modern
                academic integrity, linking out to our deep-dive resources for
                further reading.
              </p>
            </div>
          </div>

          {/* Pillar 1: Plagiarism Prevention */}
          <div className="mb-12" id="plagiarism-prevention">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                1. Plagiarism Prevention & Originality
              </h2>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="prose prose-lg text-gray-600 max-w-none mb-8">
                <p>
                  Plagiarism has evolved. While direct copying still occurs, the
                  most common trap modern students fall into is{" "}
                  <strong>Mosaic Plagiarism</strong> (or Patchwriting). This
                  happens when a student changes the words of a source using
                  synonyms but retains the precise sentence structure and
                  intellectual framework of the original author.
                </p>
                <p>
                  To truly prevent plagiarism, researchers must adopt a
                  "synthesis-first" approach. This involves reading the
                  material, closing the source completely, and explaining the
                  concept from memory to ensure the structural output is
                  entirely original. Furthermore, understanding the difference
                  between "common knowledge" phrasing and actionable similarity
                  is crucial.
                </p>
              </div>

              {/* Cluster Links */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-indigo-500" />
                  Deep Dive Articles
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link
                      to="/resources/blogs/avoid-plagiarism-academic-writing"
                      className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium group">
                      <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      How to Avoid Plagiarism in Academic Writing: A
                      Comprehensive Guide
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/resources/blogs/understanding-mosaic-plagiarism"
                      className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium group">
                      <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      Understanding Mosaic Plagiarism: The 'Synonym Swap' Trap
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pillar 2: Authorship Verification */}
          <div className="mb-12" id="authorship-verification">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <History className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                2. Proving Authorship
              </h2>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="prose prose-lg text-gray-600 max-w-none mb-8">
                <p>
                  If you are accused of using generative AI, simply saying "I
                  didn't do it" is rarely sufficient. Universities require
                  evidence. This is where{" "}
                  <strong>Defensive Documentation</strong> comes into play.
                </p>
                <p>
                  Authorship verification relies on capturing the metadata of
                  human effort. Real human writing is chaotic: it involves long
                  pauses for thought, rapid bursts of typing, thousands of
                  backspaces, block rearrangements, and extended periods of
                  revision. By contrast, AI generates content instantaneously in
                  massive, perfect blocks. Capturing an irrefutable audit trail
                  of your keystrokes and session times is the only guaranteed
                  way to prove a document originated from your mind.
                </p>
              </div>

              {/* Cluster Links */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-blue-500" />
                  Deep Dive Articles
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link
                      to="/resources/blogs/proving-authorship"
                      className="flex items-center text-blue-600 hover:text-blue-800 font-medium group">
                      <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      Proving Your Authorship: Why It Matters in the AI Era
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/resources/blogs/defensive-documentation"
                      className="flex items-center text-blue-600 hover:text-blue-800 font-medium group">
                      <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      Defensive Documentation: Why 'Track Changes' Isn't Enough
                      Anymore
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pillar 3: Citation Credibility */}
          <div className="mb-12" id="citation-credibility">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                3. Citation Credibility & Auditing
              </h2>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="prose prose-lg text-gray-600 max-w-none mb-8">
                <p>
                  A citation is a promise to the reader that the claim you have
                  made is backed by verifiable data. However, the rise of AI
                  assistants has introduced the phenomenon of{" "}
                  <strong>Hallucinated Citations</strong>—instances where LLMs
                  invent entirely plausible (but factually non-existent)
                  academic papers.
                </p>
                <p>
                  Furthermore, natural "Link Rot" and the increasing rate of
                  retracted papers mean that a source that was valid three years
                  ago might be a dead-end today. Maintaining citation
                  credibility requires actively auditing your bibliography
                  against live DOIs and Retraction databases before submission.
                </p>
              </div>

              {/* Cluster Links */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-green-500" />
                  Deep Dive Articles
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link
                      to="/resources/blogs/citation-rot-integrity"
                      className="flex items-center text-green-600 hover:text-green-800 font-medium group">
                      <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      Citation Rot: The Silent Killer of Academic Credibility
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/resources/blogs/citation-best-practices-2026"
                      className="flex items-center text-green-600 hover:text-green-800 font-medium group">
                      <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      Citation Best Practices for 2026: Navigating Modern
                      Sources
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pillar 4: AI Detection */}
          <div className="mb-12" id="ai-detection">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                4. Navigating AI Detection False Positives
              </h2>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="prose prose-lg text-gray-600 max-w-none mb-8">
                <p>
                  Perhaps the most controversial aspect of modern academic
                  integrity is the deployment of AI detection tools by
                  universities. It is mathematically established that these
                  detectors are probabilistic, meaning they are prone to{" "}
                  <strong>False Positives</strong>.
                </p>
                <p>
                  Detectors measure metrics like "Perplexity" (predictability)
                  and "Burstiness" (variation in sentence structure).
                  Consequently, writers who utilize rigid, highly structured
                  grammar—such as non-native English speakers or students
                  writing highly technical lab reports—often trigger false
                  flags, simply because their writing lacks human "chaos."
                  Understanding how these tools function is the first step in
                  defending against them.
                </p>
              </div>

              {/* Cluster Links */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-red-500" />
                  Deep Dive Articles
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link
                      to="/resources/blogs/false-positive-nightmare"
                      className="flex items-center text-red-600 hover:text-red-800 font-medium group">
                      <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      The 'False Positive' Nightmare: Why Innocent Students Get
                      Flagged
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/resources/blogs/understanding-turnitin-ai-detection"
                      className="flex items-center text-red-600 hover:text-red-800 font-medium group">
                      <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      Understanding Turnitin's AI Detection: A Deep Dive Guide
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-blue-600 rounded-3xl p-10 text-center text-white mt-16">
            <Shield className="w-12 h-12 text-blue-200 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Protect Your Academic Career
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Don't leave your reputation up to chance. Use ColabWize to
              generate irrefutable Authorship Certificates and audit your
              citations automatically.
            </p>
            <Button
              asChild
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-10">
              <Link to="/signup">Start Writing with ColabWize</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
