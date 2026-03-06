import React from 'react';
import Layout from '../../components/Layout';
import { Shield, BookOpen, Clock, FileText, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';

const AcademicIntegrityPlatform = () => {
    const pillars = [
        {
            title: "Citation Verification System",
            description: "Advanced auditing that scores every claim in your document against credible research databases.",
            icon: BookOpen,
            link: "/citation-auditor",
            badge: "Verification"
        },
        {
            title: "Proof of Authorship System",
            description: "A continuous, passive log of your writing workflow that creates an immutable record of your work.",
            icon: Clock,
            link: "/proof-of-authorship",
            badge: "Authorship"
        },
        {
            title: "Academic Collaboration Platform",
            description: "Real-time co-authoring with individual contribution tracking and team-based integrity checks.",
            icon: FileText,
            link: "/academic-collaboration",
            badge: "Collaboration"
        }
    ];

    return (
        <Layout>
            <div className="bg-slate-50 min-h-screen">
                {/* Category Hero */}
                <section className="bg-white border-b border-gray-100 py-20 lg:py-32">
                    <div className="container-custom">
                        <div className="max-w-4xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-bold mb-6">
                                <Shield className="h-4 w-4" /> Academic Integrity Solutions
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight">
                                The Platform for <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-6xl lg:text-8xl">
                                    Academic Defensibility
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
                                ColabWize is the first integrity-first workspace built specifically for the challenges of modern academia. We help you produce work that is transparent, credible, and defensible.
                            </p>
                            <div className="flex items-center gap-6">
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-xl font-bold" asChild>
                                    <Link to="/signup">Start Free Trial</Link>
                                </Button>
                                <Link to="/what-is-colabwize" className="text-gray-900 font-bold hover:text-blue-600 transition-colors">
                                    Learn how it works &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pillar Sections */}
                <section className="section-padding py-24">
                    <div className="container-custom">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">A Multi-Layered Integrity Approach</h2>
                            <p className="text-gray-500 max-w-xl mx-auto">Building academic trust requires more than just a scan. It requires a continuous record of effort and evidence.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {pillars.map((pillar, idx) => (
                                <div key={idx} className="group p-10 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-blue-600 transition-colors">
                                            <pillar.icon className="h-8 w-8 text-blue-600 group-hover:text-white" />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-blue-500 bg-blue-50 px-2 py-1 rounded-md">{pillar.badge}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{pillar.title}</h3>
                                    <p className="text-gray-500 leading-relaxed mb-8">{pillar.description}</p>
                                    <Link to={pillar.link} className="inline-flex items-center gap-2 text-blue-600 font-bold group-hover:gap-3 transition-all">
                                        Explore technology <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="section-padding py-24 bg-[#050B14] text-white">
                    <div className="container-custom">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to prove your credibility?</h2>
                            <p className="text-gray-400 text-xl mb-12">Join the academic community using ColabWize to defend their work and streamline their research.</p>
                            <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-12 py-8 rounded-full font-black text-xl" asChild>
                                <Link to="/signup">GET STARTED FOR FREE</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default AcademicIntegrityPlatform;
