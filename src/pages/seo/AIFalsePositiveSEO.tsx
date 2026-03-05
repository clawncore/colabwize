import React from "react";
import {
    AlertTriangle,
    Shield,
    Search,
    FileWarning,
    ArrowRight,
    ShieldCheck,
    History,
    Scale
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import Layout from "../../components/Layout";
import { Helmet } from "react-helmet-async";

const AIFalsePositiveSEO: React.FC = () => {
    return (
        <Layout>
            <Helmet>
                <title>The AI False Positive Problem: Protecting Your Work | ColabWize</title>
                <meta
                    name="description"
                    content="AI detectors are wrongly accusing students of cheating. Learn why false positives happen and how to protect your academic reputation with proof of authorship."
                />
            </Helmet>

            <div className="bg-white min-h-screen font-primary">
                {/* Header */}
                <header className="py-20 border-b border-gray-100 bg-slate-50">
                    <div className="container-custom max-w-4xl mx-auto">
                        <div className="flex items-center gap-2 mb-6 outline-none">
                            <Link to="/academic-integrity" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                                <Shield className="w-4 h-4" /> Academic Integrity Hub
                            </Link>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-500 text-sm">Problem Spotlights</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight leading-tight">
                            The <span className="text-amber-600">AI False Positive</span> Crisis
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-3xl">
                            Universities are increasingly relying on flawed detection software.
                            The result? Innocent students are being wrongly accused of academic misconduct.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-bold flex items-center gap-2 border border-amber-200">
                                <FileWarning className="w-4 h-4" /> High Risk of False Flags
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <article className="py-20 container-custom max-w-4xl mx-auto tracking-normal">
                    <div className="prose prose-amber max-w-none prose-lg">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 font-primary">Why AI Detectors Get It Wrong</h2>
                        <p>
                            AI detectors do not actually "detect" AI. Instead, they calculate **perplexity** (complexity of text) and
                            **burstiness** (variation in sentence structure). If you write with high clarity, use standard academic
                            structures, or follow strict formatting guidelines, these tools often flag your work as "robotic."
                        </p>

                        <div className="my-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
                                    <Search className="w-6 h-6 text-amber-600" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2 font-primary uppercase tracking-wider">Perplexity Scoring</h4>
                                <p className="text-gray-500 text-sm">Detectors flag text that is too "predictable." Unfortunately, clear academic writing is *meant* to be structured and predictable.</p>
                            </div>
                            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
                                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2 font-primary uppercase tracking-wider">Language Bias</h4>
                                <p className="text-gray-500 text-sm">Studies show that non-native English speakers are flagged at significantly higher rates because their writing is often more formal and structured.</p>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-gray-900 mt-16 mb-6 font-primary">The Cost of a False Accusation</h2>
                        <p>
                            An academic misconduct charge isn't just a grade penalty. It stays on your record, can lead to loss of
                            scholarships, and may result in expulsion. Relying on "trust" is no longer a viable strategy when
                            automated algorithms are the gatekeepers.
                        </p>

                        <h2 className="text-3xl font-bold text-gray-900 mt-16 mb-6 font-primary text-center">How to Build Your Defense</h2>

                        <section className="space-y-12 my-12">
                            <div className="relative pl-10 border-l-2 border-amber-200">
                                <div className="absolute left-[-13px] top-0 w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold">1</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-primary">Timestamped Draft History</h3>
                                <p>
                                    Save every version of your work. While standard word processors have history, they often lack
                                    the granularity needed to prove you didn't just paste a complete block of text into the file.
                                </p>
                            </div>

                            <div className="relative pl-10 border-l-2 border-amber-200">
                                <div className="absolute left-[-13px] top-0 w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold">2</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-primary">Active Bibliography Interaction</h3>
                                <p>
                                    Proving you read the sources you cited is powerful evidence of human research. Keeping a log of
                                    when you opened PDFs, highlighted text, and added citations creates a context map that AI cannot fake.
                                </p>
                            </div>

                            <div className="relative pl-10 border-l-2 border-amber-200">
                                <div className="absolute left-[-13px] top-0 w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold">3</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-primary">The Authorship Certificate</h3>
                                <p>
                                    Use **ColabWize** to generate an irrefutable report of your writing effort. This report summarizes your
                                    active writing time, revision cycles, and source interaction—providing the "Academic Defensibility"
                                    standard recognized by progressive institutions.
                                </p>
                            </div>
                        </section>

                        <div className="mt-20 p-12 bg-gray-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-transparent"></div>
                            <div className="relative z-10 max-w-2xl text-center mx-auto">
                                <Scale className="w-16 h-16 text-amber-500 mx-auto mb-8" />
                                <h2 className="text-3xl font-bold mb-6 text-white font-primary">Take Control of Your Reputation.</h2>
                                <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                                    Don't let a flawed algorithm decide your future. ColabWize gives you the evidence you need
                                    to prove your work is authentically yours.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 font-bold px-10 h-14">
                                        <Link to="/signup">Start Your Defense Journal</Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" className="border-gray-700 text-white hover:bg-gray-800 font-bold px-10 h-14">
                                        <Link to="/how-to-prove-your-writing-is-not-ai">See the FAQ</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </Layout>
    );
};

export default AIFalsePositiveSEO;
