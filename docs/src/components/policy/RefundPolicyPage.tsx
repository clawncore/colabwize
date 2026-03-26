import { Link } from "react-router-dom";
import { CreditCard, Mail } from "lucide-react";

const RefundPolicyPage = () => {
    return (
        <div className="min-h-screen px-8">
            {/* Breadcrumb */}
            <nav className="flex mb-6" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                        <Link to="/" className="text-sm font-medium">
                            Documentation
                        </Link>
                    </li>
                    <li aria-current="page">
                        <div className="flex items-center">
                            <svg
                                className="w-5 h-5 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="text-gray-500 text-sm font-medium ml-1 md:ml-2">
                                Refund Policy
                            </span>
                        </div>
                    </li>
                </ol>
            </nav>

            {/* Hero Section */}
            <div className="bg-white border-b border-gray-200 rounded-2xl p-8 mb-12">
                <div className="text-center">
                    <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Refunds & Cancellations
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Policy regarding cancellations, refunds, and payments.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">

                <section className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Cancellation Policy</h3>
                    <p className="mb-4 text-gray-600">
                        You can cancel your ColabWize subscription at any time. Cancellation stops the auto-renewal of your subscription, ensuring you will not be charged for the next billing cycle.
                    </p>
                </section>

                <section className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Access After Cancellation</h3>
                    <p className="mb-4 text-gray-600">
                        If you cancel, you will retain full access to all paid features until the end of your current billing period. We do not terminate access early.
                    </p>
                </section>

                <section className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">No-Refund Policy</h3>
                    <p className="mb-4 text-gray-600">
                        ColabWize operates on a strict non-refundable basis. Because our software provides immediate access to digital tools and server resources, we do not offer refunds for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-8 text-gray-600">
                        <li>Partial use of the service</li>
                        <li>Changing your mind after purchase</li>
                        <li>Forgotten cancellations</li>
                        <li>Inactivity</li>
                    </ul>
                    <p className="mb-8 font-medium italic text-gray-700">
                        This policy applies regardless of usage level, subscription duration, or reason for purchase.
                    </p>
                </section>

                <section className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Processing & Billing Issues</h3>
                    <p className="mb-4 text-gray-600">
                        Payments for ColabWize subscriptions are securely processed by our third-party payment provider, Lemon Squeezy. ColabWize does not store or have access to your payment card details.
                    </p>
                    <p className="mb-4 text-gray-600">
                        In rare cases involving verified billing errors or platform malfunctions, ColabWize may review the issue and take appropriate action at its sole discretion.
                    </p>
                </section>

            </div>

            {/* Contact Section */}
            <div className="bg-white border-b border-gray-200 rounded-2xl p-8 mt-12">
                <div className="text-center max-w-2xl mx-auto">
                    <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Billing Questions?</h2>
                    <p className="text-gray-600 mb-6">
                        For help with billing or subscriptions, please visit our Help Center.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/help"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center">
                            Visit Help Center
                        </Link>
                        <Link
                            to="/"
                            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-center hover:underline">
                            Back to Documentation
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicyPage;
