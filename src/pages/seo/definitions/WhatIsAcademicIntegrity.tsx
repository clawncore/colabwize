import React from "react";
import { Shield, BookOpen, Search, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../../../components/Layout";
import { Helmet } from "react-helmet-async";

const WhatIsAcademicIntegrity: React.FC = () => {
    return (
        <Layout>
            <Helmet>
                <title>What is Academic Integrity? | Definition & Importance | ColabWize</title>
                <meta
                    name="description"
                    content="Define academic integrity. Learn why honest research and authorship are the foundation of academic success and how to maintain high standards."
                />
            </Helmet>

            <div className="bg-white min-h-screen">
                <article className="py-20 container-custom max-w-3xl mx-auto">
                    <div className="flex items-center gap-2 mb-8 uppercase tracking-widest text-xs font-bold text-blue-600">
                        <Shield className="w-4 h-4" /> Academic Definitions
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 tracking-tight">
                        What is Academic Integrity?
                    </h1>

                    <div className="prose prose-lg prose-slate max-w-none font-primary">
                        <p className="text-xl text-gray-700 leading-relaxed bg-slate-50 p-8 rounded-3xl border border-slate-100 italic">
                            "Academic integrity is the moral code or ethical policy of academia. This includes values such as
                            avoidance of plagiarism or cheating; maintenance of academic standards; honesty and rigor in
                            research and academic publishing."
                        </p>

                        <h2 className="text-2xl font-bold mt-12 mb-4">The 6 Fundamental Values</h2>
                        <p>According to the International Center for Academic Integrity (ICAI), there are six core values:</p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none pl-0">
                            <li className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> **Honesty**
                            </li>
                            <li className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> **Trust**
                            </li>
                            <li className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> **Fairness**
                            </li>
                            <li className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> **Respect**
                            </li>
                            <li className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> **Responsibility**
                            </li>
                            <li className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> **Courage**
                            </li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-12 mb-4">Modern Challenges: AI and Integrity</h2>
                        <p>
                            In the modern classroom, academic integrity extends to the ethical use of artificial intelligence.
                            The key is not simply "not using AI," but being transparent about the tools used and ensuring that
                            the final intellectual contribution remains uniquely human.
                        </p>

                        <div className="mt-16 p-8 bg-blue-600 rounded-3xl text-white">
                            <h3 className="text-xl font-bold mb-4 text-white">Protect Your Integrity</h3>
                            <p className="text-blue-100 mb-8">
                                ColabWize is built to help students uphold these values by providing the tools to
                                verifiably prove their original research and writing process.
                            </p>
                            <Link to="/signup" className="inline-flex items-center font-bold text-white hover:underline">
                                Start Writing with Integrity <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </article>
            </div>
        </Layout>
    );
};

export default WhatIsAcademicIntegrity;
