import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Zap,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const CreditsPage = () => {
  const creditPackages = [
    { credits: 10, price: 4.99, perCredit: 0.5 },
    { credits: 25, price: 9.99, perCredit: 0.4, popular: true },
    { credits: 50, price: 17.99, perCredit: 0.36 },
  ];

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
            <Zap className="h-16 w-16 mx-auto mb-4 text-orange-600" />
            <h1 className="text-3xl font-bold mb-2">Pay-As-You-Go Credits</h1>
            <p className="text-lg text-gray-600">
              Flexible scanning without monthly subscriptions
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">How PAYG Credits Work</h2>
        <p className="text-gray-600 mb-6">
          Pay-As-You-Go (PAYG) credits let you scan documents without a
          subscription. Buy credits when you need them, use them at your own
          pace - they never expire.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <DollarSign className="h-8 w-8 text-orange-600 mb-3" />
            <h3 className="font-semibold mb-2 text-orange-900">
              No Subscription
            </h3>
            <p className="text-orange-800 text-sm">
              One-time purchase. No recurring charges or commitments.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <Clock className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold mb-2 text-purple-900">Never Expire</h3>
            <p className="text-purple-800 text-sm">
              Credits remain in your account indefinitely. Use them whenever you
              need.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold mb-2 text-green-900">Stack Credits</h3>
            <p className="text-green-800 text-sm">
              Buy multiple packages. Credits accumulate for bigger projects.
            </p>
          </div>
        </div>
      </div>

      {/* Credit Packages */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Available Credit Packages
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.credits}
              className={`border rounded-xl p-6 ${
                pkg.popular
                  ? "border-orange-500 bg-orange-50 relative"
                  : "border-gray-200"
              }`}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <div className="text-center mb-4">
                <div className="text-4xl font-bold mb-2">{pkg.credits}</div>
                <div className="text-gray-600 text-sm">Credits</div>
              </div>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  ${pkg.price}
                </div>
                <div className="text-xs text-gray-500">
                  ${pkg.perCredit.toFixed(2)} per credit
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Full document scans</span>
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Citation confidence</span>
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Professional certificates</span>
                </li>
              </ul>
              <a
                href="https://app.colabwize.com/dashboard/billing/credits"
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  pkg.popular
                    ? "bg-orange-600 text-white hover:bg-orange-700"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}>
                Purchase Credits
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* What You Get */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          What's Included with Credits
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <ul className="space-y-3">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Full Document Scanning:</strong>
                <span className="text-gray-600 ml-2">
                  Unlike Free plan, PAYG credits give you full document
                  originality scans (not limited to 30 sentences)
                </span>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong>AI Detection:</strong>
                <span className="text-gray-600 ml-2">
                  Included with every scan
                </span>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Citation Confidence:</strong>
                <span className="text-gray-600 ml-2">
                  Full access to citation analysis (not available on Free plan)
                </span>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Professional Certificates:</strong>
                <span className="text-gray-600 ml-2">
                  No watermarks (certificates deleted immediately after
                  download)
                </span>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Export Formats:</strong>
                <span className="text-gray-600 ml-2">
                  All formats available (PDF, DOCX, etc.)
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Credit Usage */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">How Credits Are Used</h2>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2">1 Credit = 1 Scan</h3>
            <p className="text-gray-600 text-sm">
              Each Originality + AI Detection scan uses 1 credit. You can run as
              many scans as you have credits.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Citation Confidence is Free</h3>
            <p className="text-gray-600 text-sm">
              Citation analysis does NOT consume credits. Run unlimited citation
              checks once you have credits.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Certificate Generation</h3>
            <p className="text-gray-600 text-sm">
              Certificate generation may require 1 credit. Certificates are
              deleted immediately after download for PAYG users.
            </p>
          </div>
        </div>
      </div>

      {/* When to Choose Credits */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">When to Choose PAYG Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold mb-3 text-green-900">Perfect For:</h3>
            <ul className="space-y-2 text-green-800 text-sm">
              <li>✓ Occasional users (1-5 papers per year)</li>
              <li>✓ One-time projects or assignments</li>
              <li>✓ Users who don't want monthly billing</li>
              <li>✓ Testing premium features before subscribing</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-semibold mb-3 text-yellow-900">
              Not Ideal For:
            </h3>
            <ul className="space-y-2 text-yellow-800 text-sm">
              <li>
                • Regular users (3+ scans/month) - Student plan is cheaper
              </li>
              <li>• Users needing Advanced Analytics (Researcher only)</li>
              <li>• Users wanting long certificate retention</li>
              <li>• High-volume scanning (Researcher plan better value)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl text-white">
        <h3 className="text-xl font-semibold mb-2">Ready to Buy Credits?</h3>
        <p className="opacity-90 mb-4">
          Get started with pay-as-you-go scanning. No subscription required.
        </p>
        <div className="flex gap-3">
          <a
            href="https://app.colabwize.com/dashboard/billing/credits"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-white text-orange-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Purchase Credits
          </a>
          <Link
            to="/plans"
            className="inline-flex items-center px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20">
            Compare Plans
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreditsPage;
