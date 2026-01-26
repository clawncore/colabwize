import React from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";

const RefundPolicyPage = () => {
    return (
        <Layout>
            <div className="section-padding bg-white min-h-[60vh]">
                <div className="container-custom max-w-3xl">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Refunds & Cancellations</h1>

                    <div className="prose prose-lg text-gray-600">
                        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Cancellation Policy</h3>
                        <p className="mb-4">
                            You can cancel your ColabWize subscription at any time. Cancellation stops the auto-renewal of your subscription, ensuring you will not be charged for the next billing cycle.
                        </p>

                        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Access After Cancellation</h3>
                        <p className="mb-4">
                            If you cancel, you will retain full access to all paid features until the end of your current billing period. We do not terminate access early.
                        </p>

                        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">No-Refund Policy</h3>
                        <p className="mb-4">
                            ColabWize operates on a strict non-refundable basis. Because our software provides immediate access to digital tools and server resources, we do not offer refunds for:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mb-8">
                            <li>Partial use of the service</li>
                            <li>Changing your mind after purchase</li>
                            <li>Forgotten cancellations</li>
                            <li>Inactivity</li>
                        </ul>
                        <p className="mb-8 font-medium italic text-gray-700">
                            This policy applies regardless of usage level, subscription duration, or reason for purchase.
                        </p>

                        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Payment Processing & Billing Issues</h3>
                        <p className="mb-4">
                            Payments for ColabWize subscriptions are securely processed by our third-party payment provider, Lemon Squeezy. ColabWize does not store or have access to your payment card details.
                        </p>
                        <p className="mb-4">
                            In rare cases involving verified billing errors or platform malfunctions, ColabWize may review the issue and take appropriate action at its sole discretion.
                        </p>

                        <hr className="my-8 border-gray-200" />

                        <p>
                            For help with billing or subscriptions, please visit our <Link to="/contact" className="text-blue-600 hover:underline">Help Center</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RefundPolicyPage;
