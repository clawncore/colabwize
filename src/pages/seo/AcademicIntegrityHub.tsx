import React from "react";
import {
    Shield,
    SearchCheck,
    Users,
    ArrowRight,
    BookOpen,
    History,
    AlertTriangle,
    CheckCircle2,
    FileSearch,
    MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import Layout from "../../components/Layout";
import { Helmet } from "react-helmet-async";

const AcademicIntegrityHub: React.FC = () => {
    const sections = [
        {
            id: "authorship",
            title: "How to Prove Authorship",
            description: "Learn how to maintain a verifiable trail of your writing process to defend against AI accusations.",
            icon: History,
            link: "/prove-authorship",
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            id: "citations",
            title: "Verifying Citation Credibility",
            description: "Stop 'hallucinated' citations. Ensure every claim in your research is backed by a real, credible source.",
            icon: SearchCheck,
            link: "/citation-verification",
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            id: "collaboration",
            title: "Collaboration in Writing",
            description: "How to work with peers while maintaining individual contribution logs for full transparency.",
            icon: Users,
            link: "/academic-collaboration",
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            id: "ai-problem",
            title: "The AI False Positive Problem",
            description: "Why AI detectors fail and how students can protect themselves with academic defensibility.",
            icon: AlertTriangle,
            link: "/ai-false-positive-problem",
            color: "text-amber-600",
            bg: "bg-amber-50"
        }
    ];

    const definitions = [
        {
            title: "What is Academic Integrity?",
            link: "/what-is-academic-integrity",
            description: "The ethical policy of academia to maintain honest and responsible research standards."
        },
        {
            title: "What is Authorship Verification?",
            link: "/what-is-authorship-verification",
            description: "The process of proving that a specific piece of text was indeed created by the stated author."
        },
        {
            title: "What is Citation Auditing?",
            link: "/what-is-citation-verification",
            description: "Checking every reference in a document to ensure it accurately supports the claims made."
        }
    ];

    return (
        <Layout>
            <Helmet>
                <title>Academic Integrity Tools & Guides | ColabWize</title>
                <meta
                    name="description"
                    content="The central hub for academic integrity resources. Learn how to prove authorship, verify citations, and protect your academic career from false AI accusations."
                />
            </Helmet>

            <div className="bg-white min-h-screen">
                {/* Banner */}
                <div className="bg-slate-50 border-b border-gray-100 py-16">
                    <div className="container-custom max-w-5xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
                            <Shield className="w-3.5 h-3.5" />
                            Authority Hub
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
                            Academic Integrity <span className="text-blue-600">Hub</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Equipping students and researchers with the tools and knowledge to prove the authenticity,
                            originality, and credibility of their work in the age of AI.
                        </p>
                    </div>
                </div>

                {/* Core Pillars */}
                <section className="py-20 container-custom max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {sections.map((section) => (
                            <Link
                                key={section.id}
                                to={section.link}
                                className="group p-8 rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${section.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <section.icon className={`w-7 h-7 ${section.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                    {section.title}
                                </h3>
                                <p className="text-gray-500 leading-relaxed mb-6">
                                    {section.description}
                                </p>
                                <div className="flex items-center text-blue-600 font-bold text-sm">
                                    Read the Guide
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-20 bg-slate-50">
                    <div className="container-custom max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                                    Why Academic Defensibility is the New Standard
                                </h2>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="shrink-0 mt-1">
                                            <CheckCircle2 className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">Combat False positives</h4>
                                            <p className="text-gray-600 text-sm">AI detectors are unreliable. Having a verifiable log of your writing process is the only way to prove your voice is your own.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="shrink-0 mt-1">
                                            <CheckCircle2 className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">Verify Every Claim</h4>
                                            <p className="text-gray-600 text-sm">Citations aren't just about formatting. It's about knowing your sources exist and accurately support your research.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="shrink-0 mt-1">
                                            <CheckCircle2 className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">Transparent Collaboration</h4>
                                            <p className="text-gray-600 text-sm">When working with teams, clear contribution tracking protects everyone's academic reputation.</p>
                                        </div>
                                    </div>
                                </div>
                                <Button asChild className="mt-10 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-6 h-auto">
                                    <Link to="/signup">Start Writing with Confidence</Link>
                                </Button>
                            </div>
                            <div className="relative">
                                <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 flex flex-col gap-6">
                                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Essential Definitions</h3>
                                    {definitions.map((def, i) => (
                                        <Link key={i} to={def.link} className="block group">
                                            <h4 className="text-blue-600 font-bold mb-1 group-hover:underline">{def.title}</h4>
                                            <p className="text-gray-500 text-sm">{def.description}</p>
                                        </Link>
                                    ))}
                                    <Link to="/what-is-colabwize" className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <FileSearch className="w-5 h-5 text-gray-400" />
                                            <span className="text-sm font-semibold text-gray-700">How ColabWize Helps</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Problem Pages */}
                <section className="py-24 container-custom max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Problem-Solving Resources</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">Specific guides for the most common challenges in modern academic writing.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col items-center text-center">
                            <History className="w-10 h-10 text-blue-500 mb-6" />
                            <h3 className="text-lg font-bold mb-3">How to prove your writing is not AI</h3>
                            <p className="text-gray-500 text-sm mb-6">A step-by-step guide on creating an evidence trail for your writing process.</p>
                            <Button variant="link" asChild className="mt-auto text-blue-600 font-bold p-0">
                                <Link to="/how-to-prove-your-writing-is-not-ai">Learn More</Link>
                            </Button>
                        </div>
                        <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col items-center text-center">
                            <SearchCheck className="w-10 h-10 text-green-500 mb-6" />
                            <h3 className="text-lg font-bold mb-3">Check Citation Credibility</h3>
                            <p className="text-gray-500 text-sm mb-6">Techniques for verifying research papers and avoiding hallucinated sources.</p>
                            <Button variant="link" asChild className="mt-auto text-blue-600 font-bold p-0">
                                <Link to="/how-to-check-citation-credibility">Learn More</Link>
                            </Button>
                        </div>
                        <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col items-center text-center">
                            <Users className="w-10 h-10 text-purple-500 mb-6" />
                            <h3 className="text-lg font-bold mb-3">Academic Collaboration</h3>
                            <p className="text-gray-500 text-sm mb-6">Working ethically on shared research without compromising individual integrity.</p>
                            <Button variant="link" asChild className="mt-auto text-blue-600 font-bold p-0">
                                <Link to="/how-to-collaborate-on-academic-papers">Learn More</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Strategic Article Callout */}
                <section className="py-20 bg-blue-600 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <History className="w-64 h-64 text-white rotate-12" />
                    </div>
                    <div className="container-custom max-w-4xl mx-auto text-center relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Accused of using AI? Here's what to do.</h2>
                        <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                            Read our deep dive into why false AI detection happens and how universities are evolving their policies.
                        </p>
                        <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-extrabold px-10 py-4 h-auto rounded-full">
                            <Link to="/false-ai-detection-in-academia">Read the Full Article</Link>
                        </Button>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default AcademicIntegrityHub;
