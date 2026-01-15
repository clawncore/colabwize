import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Search,
} from "lucide-react";

const CitationsPage = () => {
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
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-indigo-600" />
            <h1 className="text-3xl font-bold mb-2">
              Citation Confidence Auditor
            </h1>
            <p className="text-lg text-gray-600">
              Analyze and improve your citation quality
            </p>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-12">
        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">
              Student Plan or Higher Required
            </h3>
            <p className="text-yellow-800">
              Citation Confidence features are <strong>NOT available</strong> on
              the Free plan. Upgrade to Student, Researcher, or purchase PAYG
              credits to access citation analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          What is Citation Confidence?
        </h2>
        <p className="text-gray-600 mb-4">
          Citation Confidence analyzes the quality and reliability of your
          citations, helping you strengthen your references and identify
          potential issues like outdated sources, questionable citations, or
          missing links.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <CheckCircle className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold mb-2">Confidence Scoring</h3>
            <p className="text-gray-600 text-sm">
              Each citation receives a reliability score based on source
              quality, publication date, and verification status.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <TrendingUp className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold mb-2">Recency Analysis</h3>
            <p className="text-gray-600 text-sm">
              Identifies citations older than 3 years and suggests more recent
              alternatives when available.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <Search className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold mb-2">Missing Link Finder</h3>
            <p className="text-gray-600 text-sm">
              Suggests relevant academic papers you may have missed based on
              your topic and keywords.
            </p>
          </div>
        </div>
      </div>

      {/* Plan Access */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">
          Feature Availability by Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Plan - Blocked */}
          <div className="border-2 border-red-300 rounded-xl p-6 bg-red-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Free Plan</h3>
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Not Available
              </span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start">
                <XCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Citation Confidence <strong>NOT included</strong>
                </span>
              </li>
              <li className="flex items-start">
                <XCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Missing Link Finder <strong>NOT available</strong>
                </span>
              </li>
              <li className="flex items-start">
                <XCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Recency Analysis <strong>NOT available</strong>
                </span>
              </li>
            </ul>
            <div className="mt-4">
              <Link
                to="/plans"
                className="block text-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                Upgrade to Access
              </Link>
            </div>
          </div>

          {/* Paid Plans - Available */}
          <div className="border-2 border-indigo-500 rounded-xl p-6 bg-indigo-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Student, Researcher, PAYG
              </h3>
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Full Access
              </span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Full Citation Confidence analysis
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Missing Link Finder with AI suggestions
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Citation recency breakdown
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Field-specific recommendations
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          How to Use Citation Confidence
        </h2>
        <div className="space-y-4">
          <div className="flex items-start border border-gray-200 rounded-lg p-4">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100">
                <span className="text-indigo-600 font-bold text-sm">1</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Upload Document with Citations
              </h3>
              <p className="text-gray-600 text-sm">
                Upload your document that includes citations. Our AI will
                automatically extract them.
              </p>
            </div>
          </div>

          <div className="flex items-start border border-gray-200 rounded-lg p-4">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100">
                <span className="text-indigo-600 font-bold text-sm">2</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Run Citation Analysis</h3>
              <p className="text-gray-600 text-sm">
                Navigate to Citations → Confidence and select your project to
                analyze.
              </p>
            </div>
          </div>

          <div className="flex items-start border border-gray-200 rounded-lg p-4">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100">
                <span className="text-indigo-600 font-bold text-sm">3</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Review Confidence Scores</h3>
              <p className="text-gray-600 text-sm">
                Examine each citation's reliability score and identify flagged
                or low-confidence citations.
              </p>
            </div>
          </div>

          <div className="flex items-start border border-gray-200 rounded-lg p-4">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100">
                <span className="text-indigo-600 font-bold text-sm">4</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Use Missing Link Finder</h3>
              <p className="text-gray-600 text-sm">
                Enter keywords to discover relevant papers you may have missed.
                Add suggested citations to strengthen your work.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Scoring */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          Understanding Confidence Scores
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center mb-2">
                <div className="w-24 h-2 bg-green-500 rounded mr-3"></div>
                <strong>High (80-100%):</strong>
              </div>
              <p className="text-gray-600 text-sm ml-27">
                Verified, reliable sources from reputable publishers. Recent
                publications preferred.
              </p>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <div className="w-24 h-2 bg-yellow-500 rounded mr-3"></div>
                <strong>Medium (50-79%):</strong>
              </div>
              <p className="text-gray-600 text-sm ml-27">
                Acceptable sources but may be older or less authoritative.
                Consider updating if possible.
              </p>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <div className="w-24 h-2 bg-red-500 rounded mr-3"></div>
                <strong>Low (0-49%):</strong>
              </div>
              <p className="text-gray-600 text-sm ml-27">
                Questionable or unverified sources. Replacement strongly
                recommended.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
        <h3 className="text-xl font-semibold mb-2">
          Strengthen Your Citations
        </h3>
        <p className="opacity-90 mb-4">
          Upgrade to Student plan or purchase credits to access Citation
          Confidence and improve your academic writing quality.
        </p>
        <div className="flex gap-3">
          <Link
            to="/plans"
            className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            View Plans
          </Link>
          <Link
            to="/credits"
            className="inline-flex items-center px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20">
            Buy Credits
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CitationsPage;
