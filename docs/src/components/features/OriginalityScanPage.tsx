import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileSearch,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
} from "lucide-react";

const OriginalityScanPage = () => {
  return (
    <div className="min-h-screen px-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container-custom py-6">
          <Link to="/" className="inline-flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documentation
          </Link>
          <div className="text-center">
            <FileSearch className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h1 className="text-3xl font-bold mb-2">Originality Scanning</h1>
            <p className="text-lg text-gray-600">
              Detect similarity and ensure your work is original
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          What is Originality Scanning?
        </h2>
        <p className="text-gray-600 mb-4">
          Originality Scanning analyzes your document to detect similarities
          with existing content across the web and academic databases. It helps
          ensure your work is original and properly attributed.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold mb-2 text-blue-900">How it Works</h3>
          <p className="text-blue-800">
            Our AI-powered engine breaks down your document into sentences and
            compares each one against billions of web pages and academic sources
            to identify potential matches. Results are visualized in an
            easy-to-understand Originality Map.
          </p>
        </div>
      </div>

      {/* Plan-Based Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Scan Depth by Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Free Plan</h3>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                Basic Scan
              </span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Scans first <strong>30 sentences</strong> only
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>3 scans per month</strong>
                </span>
              </li>
              <li className="flex items-start">
                <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Limited to quick overview</span>
              </li>
            </ul>
          </div>

          {/* Paid Plans */}
          <div className="border border-blue-500 rounded-xl p-6 bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Student & Researcher</h3>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                Full Scan
              </span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Scans <strong>entire document</strong>
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  50+ scans/month (Student), Unlimited (Researcher)
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Comprehensive similarity analysis
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          How to Run an Originality Scan
        </h2>
        <div className="space-y-6">
          <div className="flex">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                <span className="text-blue-600 font-bold">1</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Upload Your Document
              </h3>
              <p className="text-gray-600">
                Navigate to the Originality page and upload your document or
                paste your text directly.
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                <span className="text-blue-600 font-bold">2</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Start Scan</h3>
              <p className="text-gray-600">
                Click "Scan for Originality" button. The scan typically takes
                30-60 seconds depending on document length.
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                <span className="text-blue-600 font-bold">3</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Review Results</h3>
              <p className="text-gray-600">
                Analyze the Originality Map to see which sentences have
                similarities. Sentences are color-coded by match level.
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                <span className="text-blue-600 font-bold">4</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Take Action</h3>
              <p className="text-gray-600">
                Use the rephrase suggestions to rewrite flagged content and
                improve your originality score.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Understanding Results */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Understanding Your Results</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Match Level Indicators</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
              <strong className="mr-2">Green (0-20%):</strong>
              <span className="text-gray-600">Original - No concerns</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
              <strong className="mr-2">Yellow (21-50%):</strong>
              <span className="text-gray-600">
                Moderate - Review recommended
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-500 rounded mr-3"></div>
              <strong className="mr-2">Orange (51-80%):</strong>
              <span className="text-gray-600">High - Rephrase needed</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
              <strong className="mr-2">Red (81-100%):</strong>
              <span className="text-gray-600">Very High - Action required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mb-3" />
            <h3 className="font-semibold mb-2">Scan Early and Often</h3>
            <p className="text-gray-600">
              Run scans during your writing process, not just at the end. This
              helps you catch and fix issues earlier.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <Zap className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold mb-2">Use Rephrase Wisely</h3>
            <p className="text-gray-600">
              Our AI rephrase suggestions maintain your meaning while improving
              originality. Always review suggestions before accepting.
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Need Full Document Scanning?
            </h3>
            <p className="opacity-90 mb-4">
              Upgrade to Student or Researcher plan for complete document
              analysis with no limits.
            </p>
            <Link
              to="/plans"
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              View Plans
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OriginalityScanPage;
