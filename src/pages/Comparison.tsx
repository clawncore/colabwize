import { Helmet } from "react-helmet";
import React from "react";
import { ArrowRight, Check, X } from "lucide-react";

interface ComparisonProps {
    onWaitlistClick: () => void;
}

export default function Comparison({ onWaitlistClick }: ComparisonProps) {
    // Comparison data
    const tools = [
        { name: "ColabWize", logo: "CW", color: "blue" },
        { name: "Grammarly", logo: "G", color: "green" },
        { name: "QuillBot", logo: "Q", color: "purple" },
    ];

    const features = [
        {
            category: "Writing Assistance",
            items: [
                {
                    name: "AI Writing Assistant",
                    cw: true,
                    grammarly: true,
                    quillbot: true
                },
                {
                    name: "Grammar & Spelling Check",
                    cw: true,
                    grammarly: true,
                    quillbot: true
                },
                {
                    name: "Tone & Style Suggestions",
                    cw: true,
                    grammarly: true,
                    quillbot: false
                },
                {
                    name: "Paraphrasing Tool",
                    cw: true,
                    grammarly: false,
                    quillbot: true
                },
            ]
        },
        {
            category: "Academic Features",
            items: [
                {
                    name: "Plagiarism Detection",
                    cw: true,
                    grammarly: "Premium",
                    quillbot: "Premium"
                },
                {
                    name: "Citation Generator",
                    cw: true,
                    grammarly: false,
                    quillbot: false
                },
                {
                    name: "Academic Templates",
                    cw: true,
                    grammarly: false,
                    quillbot: false
                },
                {
                    name: "Research Paper Organization",
                    cw: true,
                    grammarly: false,
                    quillbot: false
                },
            ]
        },
        {
            category: "Collaboration",
            items: [
                {
                    name: "Real-time Collaboration",
                    cw: true,
                    grammarly: false,
                    quillbot: false
                },
                {
                    name: "Comment System",
                    cw: true,
                    grammarly: "Limited",
                    quillbot: false
                },
                {
                    name: "Version History",
                    cw: true,
                    grammarly: false,
                    quillbot: false
                },
                {
                    name: "Role-based Permissions",
                    cw: true,
                    grammarly: false,
                    quillbot: false
                },
            ]
        },
        {
            category: "Export & Integration",
            items: [
                {
                    name: "Export to DOCX/PDF",
                    cw: true,
                    grammarly: true,
                    quillbot: true
                },
                {
                    name: "LaTeX Support",
                    cw: true,
                    grammarly: false,
                    quillbot: false
                },
                {
                    name: "Browser Extension",
                    cw: true,
                    grammarly: true,
                    quillbot: true
                },
                {
                    name: "Microsoft Office Integration",
                    cw: true,
                    grammarly: true,
                    quillbot: false
                },
            ]
        },
    ];

    return (
        <div className="w-full">
            {/* SEO Meta Tags */}
            <Helmet>
                <title>ColabWize vs Grammarly vs QuillBot - Academic Writing Tool Comparison</title>
                <meta name="description" content="Compare ColabWize with Grammarly and QuillBot for academic writing. See how our all-in-one platform stacks up against popular writing assistants for students and researchers." />
                <meta name="keywords" content="ColabWize comparison, grammarly vs ColabWize, quillbot vs ColabWize, academic writing tools comparison" />
                <link rel="canonical" href="https://colabwize.com/comparison" />

                {/* JSON-LD Schemas */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "ColabWize",
                        "description": "All-in-one academic writing platform with AI writing assistant, plagiarism detection, citation generator, and collaboration tools.",
                        "applicationCategory": "EducationalApplication",
                        "operatingSystem": "Web",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD"
                        }
                    })}
                </script>
            </Helmet>

            <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        ColabWize vs Grammarly vs QuillBot
                    </h1>
                    <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
                        See how our all-in-one academic writing platform compares to popular writing assistants. Built specifically for students and researchers.
                    </p>
                    <button
                        onClick={onWaitlistClick}
                        className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold inline-flex items-center space-x-2"
                    >
                        <span>Join Waitlist</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold mb-8 text-center">Complete Feature Comparison</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left p-4 font-semibold">Feature</th>
                                    {tools.map((tool, index) => (
                                        <th key={index} className="p-4 font-semibold text-center">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-12 h-12 rounded-full bg-${tool.color}-100 flex items-center justify-center mb-2`}>
                                                    <span className={`font-bold text-${tool.color}-600`}>{tool.logo}</span>
                                                </div>
                                                <span>{tool.name}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {features.map((category, categoryIndex) => (
                                    <React.Fragment key={categoryIndex}>
                                        <tr className="bg-gray-50">
                                            <td colSpan={4} className="p-4 font-bold text-lg">
                                                {category.category}
                                            </td>
                                        </tr>
                                        {category.items.map((feature, featureIndex) => (
                                            <tr key={featureIndex} className="border-b border-gray-200">
                                                <td className="p-4">{feature.name}</td>
                                                <td className="p-4 text-center">
                                                    {feature.cw === true ? (
                                                        <Check className="w-6 h-6 text-green-600 mx-auto" />
                                                    ) : feature.cw === false ? (
                                                        <X className="w-6 h-6 text-red-600 mx-auto" />
                                                    ) : (
                                                        <span className="text-sm">{feature.cw}</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {feature.grammarly === true ? (
                                                        <Check className="w-6 h-6 text-green-600 mx-auto" />
                                                    ) : feature.grammarly === false ? (
                                                        <X className="w-6 h-6 text-red-600 mx-auto" />
                                                    ) : (
                                                        <span className="text-sm">{feature.grammarly}</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {feature.quillbot === true ? (
                                                        <Check className="w-6 h-6 text-green-600 mx-auto" />
                                                    ) : feature.quillbot === false ? (
                                                        <X className="w-6 h-6 text-red-600 mx-auto" />
                                                    ) : (
                                                        <span className="text-sm">{feature.quillbot}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-12 bg-blue-50 border-l-4 border-blue-600 p-6">
                        <h3 className="text-xl font-bold mb-3">Why Choose ColabWize?</h3>
                        <ul className="space-y-2 mb-4">
                            <li className="flex items-start">
                                <Check className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                                <span><strong>All-in-one solution:</strong> Writing, citations, plagiarism, and collaboration in one platform</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                                <span><strong>Academic-focused:</strong> Built specifically for students and researchers, not general writers</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                                <span><strong>Collaboration features:</strong> Real-time editing and commenting designed for academic work</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                                <span><strong>Affordable pricing:</strong> Student-friendly plans with early bird discounts</span>
                            </li>
                        </ul>
                        <button
                            onClick={onWaitlistClick}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold mt-4"
                        >
                            Join Waitlist
                        </button>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold mb-8 text-center">Pricing Comparison</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-2xl font-bold mb-4 text-center">ColabWize</h3>
                            <div className="text-center mb-6">
                                <span className="text-3xl font-bold">$12</span>
                                <span className="text-gray-600">/month</span>
                                <p className="text-sm text-gray-500 mt-1">Student Pro (Early Bird)</p>
                            </div>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center">
                                    <Check className="w-5 h-5 text-green-600 mr-2" />
                                    <span>All features included</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="w-5 h-5 text-green-600 mr-2" />
                                    <span>Unlimited projects</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="w-5 h-5 text-green-600 mr-2" />
                                    <span>Real-time collaboration</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="w-5 h-5 text-green-600 mr-2" />
                                    <span>Advanced plagiarism detection</span>
                                </li>
                            </ul>
                            <button
                                onClick={onWaitlistClick}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                            >
                                Join Waitlist
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-2xl font-bold mb-4 text-center">Grammarly</h3>
                            <div className="text-center mb-6">
                                <span className="text-3xl font-bold">$15</span>
                                <span className="text-gray-600">/month</span>
                                <p className="text-sm text-gray-500 mt-1">Premium Plan</p>
                            </div>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center">
                                    <Check className="w-5 h-5 text-green-600 mr-2" />
                                    <span>Grammar & spelling</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="w-5 h-5 text-green-600 mr-2" />
                                    <span>Tone adjustments</span>
                                </li>
                                <li className="flex items-center">
                                    <X className="w-5 h-5 text-red-600 mr-2" />
                                    <span className="text-gray-400 line-through">Plagiarism detection</span>
                                </li>
                                <li className="flex items-center">
                                    <X className="w-5 h-5 text-red-600 mr-2" />
                                    <span className="text-gray-400 line-through">Citation generator</span>
                                </li>
                            </ul>
                            <a
                                href="https://grammarly.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition font-semibold text-center block"
                            >
                                Visit Grammarly
                            </a>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-2xl font-bold mb-4 text-center">QuillBot</h3>
                            <div className="text-center mb-6">
                                <span className="text-3xl font-bold">$25</span>
                                <span className="text-gray-600">/month</span>
                                <p className="text-sm text-gray-500 mt-1">Premium Plan</p>
                            </div>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center">
                                    <Check className="w-5 h-5 text-green-600 mr-2" />
                                    <span>Paraphrasing tool</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="w-5 h-5 text-green-600 mr-2" />
                                    <span>Grammar checker</span>
                                </li>
                                <li className="flex items-center">
                                    <X className="w-5 h-5 text-red-600 mr-2" />
                                    <span className="text-gray-400 line-through">Plagiarism detection</span>
                                </li>
                                <li className="flex items-center">
                                    <X className="w-5 h-5 text-red-600 mr-2" />
                                    <span className="text-gray-400 line-through">Citation generator</span>
                                </li>
                            </ul>
                            <a
                                href="https://quillbot.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition font-semibold text-center block"
                            >
                                Visit QuillBot
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6">Ready to Try the All-in-One Academic Writing Solution?</h2>
                    <p className="text-xl text-gray-700 mb-8">
                        Join thousands of students and researchers preparing for launch.
                    </p>
                    <button
                        onClick={onWaitlistClick}
                        className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg inline-flex items-center space-x-2"
                    >
                        <span>Join Waitlist</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>
        </div>
    );
}