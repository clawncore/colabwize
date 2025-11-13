import { Helmet } from "react-helmet";
import { ArrowRight, CheckCircle } from "lucide-react";

interface FAQProps {
    onWaitlistClick: () => void;
}

export default function FAQ({ onWaitlistClick }: FAQProps) {
    const faqItems = [
        {
            question: "What is ColabWize?",
            answer: "ColabWize is an all-in-one academic writing platform designed to help students and researchers write smarter, cite faster, and check originality — all in one beautiful workspace. It combines an AI writing assistant, plagiarism detection, citation generator, real-time collaboration, and project management tools."
        },
        {
            question: "When will ColabWize launch?",
            answer: "We're launching on November 25, 2025. Join our waitlist to get notified when we launch and be among the first to try it."
        },
        {
            question: "Is ColabWize free to start?",
            answer: "Yes! Our Free Plan gives you 1 active project, 5,000 words/month, and basic plagiarism checks. For more features, we offer affordable paid plans starting at $12/month for students."
        },
        {
            question: "Do I need a credit card to sign up?",
            answer: "No, you can start free without payment info. We only require payment information if you upgrade to a paid plan."
        },
        {
            question: "How does the AI writing assistant work?",
            answer: "Our AI writing assistant provides real-time grammar and spelling corrections, tone and style suggestions, sentence restructuring recommendations, and academic vocabulary enhancement — all within your document editor."
        },
        {
            question: "How does plagiarism detection work with ColabWize?",
            answer: "We scan your text against billions of web sources, academic papers, and publications to flag similarities with detailed reports. You'll get a clear originality percentage and highlighted similar text passages."
        },
        {
            question: "Can I generate citations automatically?",
            answer: "Yes! Our Smart Citations feature auto-generates citations from DOI or URL in APA, MLA, Chicago, or journal-specific formats. It also automatically formats bibliographies and reference lists."
        },
        {
            question: "Can I collaborate with classmates in real-time?",
            answer: "Absolutely. Our real-time collaboration features include live cursor tracking, inline comments and suggestions, sharing via link or email, and role-based permissions for different access levels."
        },
        {
            question: "Can I use ColabWize offline?",
            answer: "Yes, you can write offline and sync your work once you're back online. This is especially useful for students who may not always have reliable internet access."
        },
        {
            question: "Do you offer student discounts with ColabWize?",
            answer: "Yes, our Student Pro plan is designed to be affordable at just $12/month. We also offer special pricing for researchers at $25/month and institutions."
        },
        {
            question: "What file formats does ColabWize support?",
            answer: "You can import and export in DOCX, PDF, TXT, and LaTeX formats. We also support journal-specific templates for direct submission to academic publications."
        },
        {
            question: "Is my data secure with ColabWize?",
            answer: "We take data security seriously. All data is encrypted in transit and at rest. We comply with GDPR and FERPA regulations, and we never sell or share your data with third parties."
        }
    ];

    return (
        <div className="w-full">
            {/* SEO Meta Tags */}
            <Helmet>
                <title>FAQ - Frequently Asked Questions About ColabWize</title>
                <meta name="description" content="Find answers to common questions about ColabWize, our academic writing platform with AI citation generation, plagiarism checking, and team collaboration features." />
                <meta name="keywords" content="ColabWize faq, academic writing faq, citation tool faq, plagiarism checker faq" />
                <link rel="canonical" href="https://colabwize.com/faq" />

                {/* JSON-LD Schemas */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": faqItems.map(item => ({
                            "@type": "Question",
                            "name": item.question,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": item.answer
                            }
                        }))
                    })}
                </script>
            </Helmet>

            <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
                        Everything you need to know about ColabWize, our academic writing platform.
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
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-8">
                        {faqItems.map((item, index) => (
                            <div key={index} className="border-b border-gray-200 pb-8">
                                <h2 className="text-2xl font-bold mb-4">{item.question}</h2>
                                <p className="text-gray-700 text-lg leading-relaxed">{item.answer}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 bg-blue-50 rounded-xl p-8 text-center">
                        <CheckCircle className="w-16 h-16 text-blue-600 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
                        <p className="text-xl text-gray-700 mb-8">
                            Our support team is here to help. Join our waitlist and get priority support when we launch.
                        </p>
                        <button
                            onClick={onWaitlistClick}
                            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg inline-flex items-center space-x-2"
                        >
                            <span>Join Waitlist</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}