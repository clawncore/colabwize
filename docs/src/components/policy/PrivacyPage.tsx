import { Link } from "react-router-dom";
import { Shield, Mail } from "lucide-react";

const PrivacyPage = () => {
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
                Privacy Policy
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 rounded-2xl p-8 mb-12">
        <div className="text-center">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Privacy Content */}
      <div className="prose prose-lg max-w-none">
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
          <p className="text-gray-600 mb-4">
            We collect information you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Account information (name, email, password)</li>
            <li>Documents you upload for analysis</li>
            <li>Usage data and analytics</li>
            <li>Payment information (processed securely by Stripe)</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">
            2. How We Use Your Information
          </h2>
          <p className="text-gray-600 mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process your documents and generate reports</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Analyze usage patterns to improve our platform</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">3. Data Security</h2>
          <p className="text-gray-600">
            We implement industry-standard security measures to protect your
            data:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
            <li>End-to-end encryption for all data transmission</li>
            <li>Encrypted storage of documents and personal information</li>
            <li>Regular security audits and penetration testing</li>
            <li>SOC 2 Type II compliance</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">4. Data Retention</h2>
          <p className="text-gray-600">
            We retain your documents for 30 days after deletion. You can
            permanently delete your data at any time from your account settings.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
          <p className="text-gray-600 mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">6. Contact Us</h2>
          <p className="text-gray-600">
            If you have questions about this Privacy Policy, please contact us at{" "}
            <a
              href="mailto:privacy@colabwize.com"
              className="text-blue-600 hover:underline">
              privacy@colabwize.com
            </a>
          </p>
        </section>
      </div>

      {/* Contact Section */}
      <div className="bg-white border-b border-gray-200 rounded-2xl p-8 mt-12">
        <div className="text-center max-w-2xl mx-auto">
          <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Contact Us About Privacy</h2>
          <p className="text-gray-600 mb-6">
            If you have any questions about this Privacy Policy or our data
            practices, please contact our privacy team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:privacy@colabwize.com"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center">
              Email Privacy Team
            </a>
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

export default PrivacyPage;
