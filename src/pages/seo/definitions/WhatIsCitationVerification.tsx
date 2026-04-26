import React from "react";
import { SearchCheck, Shield, Database, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const WhatIsCitationVerification: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>What is Citation Verification? | Academic Research Terminology | ColabWize</title>
                <meta
                    name="description"
                    content="Define citation verification in academic writing. Learn why it is critical for research integrity and how modern tools prevent citation hallucination."
                />
            </Helmet>

            <div className="bg-white min-h-screen">
                <article className="py-20 container-custom max-w-3xl mx-auto">
                    <div className="flex items-center gap-2 mb-8 uppercase tracking-widest text-xs font-bold text-green-600">
                        <SearchCheck className="w-4 h-4" /> Academic Definitions
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 tracking-tight">
                        What is Citation Verification?
                    </h1>

                    <div className="prose prose-lg prose-slate max-w-none font-primary">
                        <p className="text-xl text-gray-700 leading-relaxed bg-slate-50 p-8 rounded-3xl border border-slate-100 italic">
                            "Citation verification is the process of confirming that an academic reference accurately
                            represents the existing source material and is not 'hallucinated' or mischaracterized
                            within the context of a research paper."
                        </p>

                        <h2 className="text-2xl font-bold mt-12 mb-4">Why It Matters</h2>
                        <p>
                            In the context of modern research, citation verification serves three primary purposes:
                        </p>
                        <ul className="space-y-4">
                            <li className="flex gap-4 p-4 rounded-xl border border-gray-100">
                                <Database className="w-6 h-6 text-green-600 shrink-0" />
                                <div>
                                    <h4 className="font-bold">Fact-Checking</h4>
                                    <p className="text-sm text-gray-500">Ensuring the cited work actually says what the author claims it does.</p>
                                </div>
                            </li>
                            <li className="flex gap-4 p-4 rounded-xl border border-gray-100">
                                <Shield className="w-6 h-6 text-green-600 shrink-0" />
                                <div>
                                    <h4 className="font-bold">Provenance</h4>
                                    <p className="text-sm text-gray-500">Verifying the source is from a credible, peer-reviewed publisher with a valid DOI.</p>
                                </div>
                            </li>
                            <li className="flex gap-4 p-4 rounded-xl border border-gray-100">
                                <SearchCheck className="w-6 h-6 text-green-600 shrink-0" />
                                <div>
                                    <h4 className="font-bold">Combat AI Errors</h4>
                                    <p className="text-sm text-gray-500">Providing a safeguard against Large Language Models (LLMs) that generate plausible but fake bibliographies.</p>
                                </div>
                            </li>
                        </ul>

                        <h2 className="text-2xl font-bold mt-12 mb-4">Modern Implementation</h2>
                        <p>
                            While citation verification was traditionally a manual task for peer-reviewers,
                            modern tools like **ColabWize** automate this by checking thousands of database
                            records in real-time as you write.
                        </p>

                        <div className="mt-16 p-8 bg-green-600 rounded-3xl text-white">
                            <h3 className="text-xl font-bold mb-4 text-white">Verify Your Research</h3>
                            <p className="text-green-100 mb-8">
                                Eliminate citation errors and hallucinations from your bibliography today.
                                Experience the world's most advanced citation auditing system.
                            </p>
                            <Link to="/signup" className="inline-flex items-center font-bold text-white hover:underline">
                                Audit Your Citations Now <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </article>
            </div>
        </>
    );
};

export default WhatIsCitationVerification;
