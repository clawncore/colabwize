import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileSearch,
  CheckCircle,
  Clock,
  Sparkles,
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
            <div className="relative inline-block">
              <FileSearch className="h-16 w-16 mx-auto mb-4 text-blue-600" />
              <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                BETA
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Originality Scanning</h1>
            <p className="text-lg text-gray-600">
              Detect similarity and ensure your work is original
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center mb-2">
              <Clock className="h-6 w-6 mr-2" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Coming Soon
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Originality Scanning is in Beta
            </h2>
            <p className="opacity-90 max-w-xl">
              We're currently refining our originality scanning engine. This
              feature will be available soon with powerful similarity detection
              across billions of sources.
            </p>
          </div>
          <div className="flex-shrink-0">
            <a
              href="https://discord.gg/2MMSdX3Uee"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              <Sparkles className="h-5 w-5 mr-2" />
              Join Beta Waitlist
            </a>
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

      {/* Planned Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Planned Features</h2>
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
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Quick overview of matches</span>
              </li>
            </ul>
          </div>

          {/* Paid Plans */}
          <div className="border border-blue-500 rounded-xl p-6 bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Plus & Pro</h3>
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
                  50+ scans/month (Plus), Unlimited (Pro)
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

      {/* Match Indicators Preview */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          Match Level Indicators (Preview)
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <p className="text-gray-600 mb-4">
            When launched, sentences will be color-coded by similarity level:
          </p>
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

      {/* CTA */}
      <div className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-semibold mb-2">
              Get Notified When It Launches
            </h3>
            <p className="opacity-90">
              Join our community to be the first to know when Originality
              Scanning goes live.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="https://discord.gg/2MMSdX3Uee"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Join Discord
            </a>
            <Link
              to="/plans"
              className="inline-flex items-center px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20">
              View Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OriginalityScanPage;
