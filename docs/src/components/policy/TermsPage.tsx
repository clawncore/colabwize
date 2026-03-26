import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

const TermsPage = () => {
  // Mock plan styling classes
  const planDocContentClasses = {
    container: "prose prose-gray max-w-none",
    heading: "text-2xl font-bold text-gray-900 mb-4",
    subheading: "text-xl font-semibold text-gray-800 mb-3",
    paragraph: "text-gray-700 mb-4",
    listItem: "text-gray-700 mb-2",
  };

  const planDocHeadingClasses = "text-3xl font-bold text-gray-900 mb-6";
  const planDocLinkClasses = "text-blue-600 hover:text-blue-800 underline";

  return (
    <div className={`min-h-screen px-8 ${planDocContentClasses.container}`}>
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/"
              className={`text-sm font-medium ${planDocLinkClasses}`}>
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
                Terms of Service
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 rounded-2xl p-8 mb-12">
        <div className="text-center">
          <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1
            className={`text-3xl md:text-4xl font-bold mb-4 ${planDocHeadingClasses}`}>
            Terms of Service
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

      {/* Terms Content */}
      <div className="prose prose-lg max-w-none">
        <section className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8`}>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-600">
            By accessing and using ColabWize, you accept and agree to be bound
            by the terms and provision of this agreement.
          </p>
        </section>

        <section className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8`}>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">2. Use License</h2>
          <p className="text-gray-600 mb-4">
            Permission is granted to temporarily use ColabWize for personal,
            non-commercial transitory viewing only. This is the grant of a
            license, not a transfer of title, and under this license you may
            not:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software</li>
            <li>Remove any copyright or other proprietary notations</li>
          </ul>
        </section>

        <section className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8`}>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            3. User Responsibilities
          </h2>
          <p className="text-gray-600 mb-4">You are responsible for:</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Maintaining the confidentiality of your account</li>
            <li>All activities that occur under your account</li>
            <li>Ensuring your use complies with all applicable laws</li>
            <li>The content you upload to our platform</li>
          </ul>
        </section>

        <section className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8`}>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            4. Prohibited Uses
          </h2>
          <p className="text-gray-600 mb-4">You may not use ColabWize:</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>For any unlawful purpose</li>
            <li>
              To violate any international, federal, provincial or state
              regulations
            </li>
            <li>
              To infringe upon or violate our intellectual property rights
            </li>
            <li>
              To harass, abuse, insult, harm, defame, slander, disparage,
              intimidate, or discriminate
            </li>
          </ul>
        </section>

        <section className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8`}>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">5. Disclaimer</h2>
          <p className="text-gray-600">
            The materials on ColabWize are provided on an 'as is' basis.
            ColabWize makes no warranties, expressed or implied, and hereby
            disclaims and negates all other warranties including, without
            limitation, implied warranties or conditions of merchantability,
            fitness for a particular purpose, or non-infringement of
            intellectual property or other violation of rights.
          </p>
        </section>

        <section className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8`}>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">6. Limitations</h2>
          <p className="text-gray-600">
            In no event shall ColabWize or its suppliers be liable for any
            damages (including, without limitation, damages for loss of data or
            profit, or due to business interruption) arising out of the use or
            inability to use ColabWize.
          </p>
        </section>

        <section className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8`}>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            7. Governing Law
          </h2>
          <p className="text-gray-600">
            These terms and conditions are governed by and construed in
            accordance with the laws of the United States and you irrevocably
            submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </section>
      </div>

      {/* Contact Section */}
      <div className="bg-white border-b border-gray-200 rounded-2xl p-8 mt-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className={`text-2xl font-bold mb-2 ${planDocHeadingClasses}`}>
            Have Questions About Our Terms?
          </h2>
          <p className="text-gray-600 mb-6">
            If you have any questions about these Terms of Service, please
            contact our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact-support"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center">
              Contact Support
            </Link>
            <Link
              to="/"
              className={`px-6 py-3 border border-gray-300 rounded-lg font-medium text-center ${planDocLinkClasses} hover:underline`}>
              Back to Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
