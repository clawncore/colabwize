import { Helmet } from "react-helmet";
import { Check, ArrowRight } from "lucide-react";

interface PricingProps {
    onWaitlistClick: () => void;
}

export default function Pricing({ onWaitlistClick }: PricingProps) {
    const pricingPlans = [
        {
            name: "Free Forever",
            price: "$0",
            period: "/month",
            description: "Perfect for trying ColabWize",
            features: [
                "1 active project",
                "5,000 words/month",
                "Basic AI writing assistance",
                "APA, MLA, Chicago citations"
            ],
            cta: "Get Started Free",
            popular: false
        },
        {
            name: "Student Pro",
            price: "$12",
            period: "/month",
            description: "Everything students need",
            originalPrice: "$15",
            features: [
                "Unlimited projects",
                "Unlimited words",
                "Advanced AI writing assistant",
                "Comprehensive plagiarism reports",
                "All citation styles",
                "Real-time collaboration",
                "Export to all formats",
                "Priority support"
            ],
            cta: "Join Waitlist for Early Access",
            popular: true
        },
        {
            name: "Researcher",
            price: "$25",
            period: "/month",
            description: "For serious researchers",
            originalPrice: "$30",
            features: [
                "Everything in Student Pro",
                "Advanced analytics",
                "Journal-specific formatting",
                "Version history",
                "Team management",
                "API access"
            ],
            cta: "Join Waitlist for Early Access",
            popular: false
        }
    ];

    return (
        <div className="w-full">
            {/* SEO Meta Tags */}
            <Helmet>
                <title>ColabWize Pricing - Academic Writing Platform Plans</title>
                <meta name="description" content="Transparent pricing for ColabWize academic writing platform. Choose from Free, Student Pro, or Researcher plans designed for students and researchers." />
                <meta name="keywords" content="ColabWize pricing, academic writing pricing, student writing tool pricing, researcher tools pricing" />
                <link rel="canonical" href="https://colabwize.com/pricing" />

                {/* JSON-LD Schemas */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "ColabWize",
                        "description": "All-in-one academic writing platform with AI writing assistant, plagiarism detection, citation generator, and collaboration tools.",
                        "applicationCategory": "EducationalApplication",
                        "operatingSystem": "Web",
                        "offers": [
                            {
                                "@type": "Offer",
                                "name": "Free Forever",
                                "price": "0",
                                "priceCurrency": "USD"
                            },
                            {
                                "@type": "Offer",
                                "name": "Student Pro",
                                "price": "12",
                                "priceCurrency": "USD"
                            },
                            {
                                "@type": "Offer",
                                "name": "Researcher",
                                "price": "25",
                                "priceCurrency": "USD"
                            }
                        ]
                    })}
                </script>
            </Helmet>

            <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
                        Choose the perfect plan for your academic writing needs. All plans include core features with no hidden fees.
                    </p>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        {pricingPlans.map((plan, index) => (
                            <div
                                key={index}
                                className={`border-2 rounded-2xl p-8 relative ${plan.popular
                                    ? "border-4 border-blue-600 shadow-xl"
                                    : "border-gray-200"
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                        Most Popular
                                    </div>
                                )}

                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <div className="mb-6">
                                    <div className="flex items-baseline space-x-2">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        {plan.originalPrice && (
                                            <span className="text-lg text-gray-500 line-through">{plan.originalPrice}</span>
                                        )}
                                        <span className="text-lg text-gray-500">{plan.period}</span>
                                    </div>
                                    {plan.originalPrice && (
                                        <p className="text-sm text-blue-600 font-semibold mt-1">
                                            Save {Math.round(((parseFloat(plan.originalPrice.replace('$', '')) - parseFloat(plan.price.replace('$', ''))) / parseFloat(plan.originalPrice.replace('$', ''))) * 100)}% as an early supporter
                                        </p>
                                    )}
                                </div>
                                <p className="text-gray-600 mb-6">{plan.description}</p>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start space-x-2">
                                            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={onWaitlistClick}
                                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${plan.popular
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                                        }`}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 bg-blue-50 rounded-xl p-8">
                        <h2 className="text-3xl font-bold text-center mb-6">Frequently Asked Questions</h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-bold mb-3">Can I change plans later?</h3>
                                <p className="text-gray-700">
                                    Yes, you can upgrade, downgrade, or cancel your subscription at any time.
                                    Changes take effect at the start of your next billing cycle.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-3">Do you offer institutional pricing?</h3>
                                <p className="text-gray-700">
                                    Yes, we offer special pricing for universities and research institutions.
                                    Contact our partnerships team for more information.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-3">Is there a free trial?</h3>
                                <p className="text-gray-700">
                                    Our Free Forever plan gives you access to core features indefinitely.
                                    For premium features, join our waitlist to get early access pricing.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-3">What payment methods do you accept?</h3>
                                <p className="text-gray-700">
                                    We accept all major credit cards and PayPal. For institutional purchases,
                                    we also support purchase orders and invoicing.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
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