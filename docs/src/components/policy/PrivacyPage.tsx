import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Database, User, Mail } from "lucide-react";

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
        <div className="rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">1. Information We Collect</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <User className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Personal Information
                </h3>
                <p className="text-gray-600">
                  When you register for an account, we collect information such
                  as your name, email address, institution, and academic level.
                  This information is used to personalize your experience and
                  provide academic-specific features.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Database className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Usage Data</h3>
                <p className="text-gray-600">
                  We collect information about how you interact with our
                  Service, including features used, time spent on the platform,
                  and documents created. This data helps us improve our Service
                  and develop new academic tools.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Eye className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Document Content</h3>
                <p className="text-gray-600">
                  We process the content of your documents to provide features
                  such as plagiarism detection, citation suggestions, and AI
                  writing assistance. Your documents are encrypted and securely
                  stored with strict access controls.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            2. How We Use Your Information
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
              </div>
              <span className="text-gray-600">
                To provide and maintain our Service
              </span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
              </div>
              <span className="text-gray-600">
                To personalize your academic experience
              </span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
              </div>
              <span className="text-gray-600">
                To improve our AI writing and research tools
              </span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
              </div>
              <span className="text-gray-600">
                To communicate with you about your account and updates
              </span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
              </div>
              <span className="text-gray-600">
                To detect and prevent academic misconduct
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            3. Data Protection and Security
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <Lock className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Encryption</h3>
                <p className="text-gray-600">
                  All data is encrypted in transit using industry-standard TLS
                  protocols and at rest using AES-256 encryption. Document
                  content is additionally encrypted with user-specific keys.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Shield className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Access Controls</h3>
                <p className="text-gray-600">
                  Access to your data is strictly limited to authorized
                  personnel who require it for legitimate business purposes. All
                  access is logged and regularly audited.
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Data Retention</h3>
              <p className="text-gray-600">
                We retain your information for as long as your account is active
                or as needed to provide services. You may delete your account at
                any time, which will remove your personal information within 30
                days.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">4. Information Sharing</h2>
          <p className="text-gray-600 mb-4">
            We do not sell, trade, or rent your personal information to third
            parties. We may share your information only in the following
            circumstances:
          </p>
          <ul className="space-y-3 mb-4">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
              </div>
              <span className="text-gray-600">With your consent</span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
              </div>
              <span className="text-gray-600">
                To comply with legal obligations
              </span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
              </div>
              <span className="text-gray-600">
                To protect the rights and safety of our users
              </span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
              </div>
              <span className="text-gray-600">
                With service providers who assist in operating our Service
              </span>
            </li>
          </ul>
          <p className="text-gray-600">
            Our service providers are contractually obligated to protect your
            information and may only use it for the purposes we specify.
          </p>
        </div>

        <div className="rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            5. Your Rights and Choices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold mb-2">Access and Update</h3>
              <p className="text-gray-600 text-sm">
                You can access and update your personal information through your
                account settings.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold mb-2">Data Portability</h3>
              <p className="text-gray-600 text-sm">
                You can export your documents and data in standard formats at
                any time.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold mb-2">Deletion</h3>
              <p className="text-gray-600 text-sm">
                You can delete your account and all associated data through your
                account settings.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold mb-2">Opt-Out</h3>
              <p className="text-gray-600 text-sm">
                You can opt out of marketing communications at any time.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">6. Children's Privacy</h2>
          <p className="text-gray-600">
            Our Service is not intended for use by children under the age of 13.
            We do not knowingly collect personal information from children under
            13. If we become aware that we have collected personal information
            from a child under 13, we will take steps to delete such
            information.
          </p>
        </div>

        <div className="rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">
            7. Changes to This Privacy Policy
          </h2>
          <p className="text-gray-600">
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last updated" date. You are advised to review this
            Privacy Policy periodically for any changes.
          </p>
        </div>
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
