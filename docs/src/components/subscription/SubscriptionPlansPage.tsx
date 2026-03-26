import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Zap,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  CreditCard,
} from "lucide-react";

const SubscriptionPlansPage = () => {
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
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-indigo-600" />
            <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
            <p className="text-lg text-gray-600">
              Choose the plan that fits your academic needs
            </p>
          </div>
        </div>
      </div>

      {/* Plans Comparison */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Plan Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Free Plan */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-2">Free Tier</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>3 document scans/month</span>
              </li>
              <li className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Basic originality check</span>
              </li>
              <li className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>3 Rephrase Suggestions</span>
              </li>
              <li className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Max 100,000 characters</span>
              </li>
              <li className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Certificate included</span>
              </li>
            </ul>
          </div>

          {/* Plus Plan */}
          <div className="border-2 border-blue-500 rounded-xl p-6 bg-blue-50 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Most Popular
            </div>
            <h3 className="text-xl font-bold mb-2">Plus</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">$4.99</span>
              <span className="text-gray-600">/month</span>
              <p className="text-xs text-gray-500 mt-1">$47.90/year (Save 20%)</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>50 document scans/month</span>
              </li>
              <li className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Full originality map</span>
              </li>
              <li className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Citation confidence auditor</span>
              </li>
              <li className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>50 Rephrase Suggestions</span>
              </li>
              <li className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Max 300,000 characters</span>
              </li>
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="border border-purple-500 rounded-xl p-6 bg-purple-50">
            <h3 className="text-xl font-bold mb-2">Pro</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">$12.99</span>
              <span className="text-gray-600">/month</span>
              <p className="text-xs text-gray-500 mt-1">$124.70/year (Save 20%)</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Unlimited document scans</strong>
                </span>
              </li>
              <li className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Max 500,000 characters</span>
              </li>
              <li className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Priority scanning</span>
              </li>
              <li className="flex items-start text-sm">
                <TrendingUp className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Advanced Analytics</strong>
                </span>
              </li>
              <li className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Draft comparison</span>
              </li>
              <li className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Safe AI Integrity Assistant</span>
              </li>
            </ul>
          </div>

          {/* PAYG */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-2">Pay-As-You-Go</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-gray-600">/month</span>
              <p className="text-xs text-gray-500 mt-1">Credits from $4.99</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start text-sm">
                <Zap className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Buy credits, no subscription</span>
              </li>
              <li className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Full document originality</span>
              </li>
              <li className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Citation confidence</span>
              </li>
              <li className="flex items-start text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Credits never expire</span>
              </li>
              <li className="flex items-start text-sm">
                <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Instant certificate deletion</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed Comparison */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Detailed Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Feature</th>
                <th className="px-6 py-3 text-center font-semibold">Free</th>
                <th className="px-6 py-3 text-center font-semibold">Plus</th>
                <th className="px-6 py-3 text-center font-semibold">
                  Pro
                </th>
                <th className="px-6 py-3 text-center font-semibold">PAYG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 font-medium">Monthly Scans</td>
                <td className="px-6 py-4 text-center">3</td>
                <td className="px-6 py-4 text-center">50</td>
                <td className="px-6 py-4 text-center text-purple-600 font-bold">
                  Unlimited
                </td>
                <td className="px-6 py-4 text-center">Per credit</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium">
                  Originality Scan Depth
                </td>
                <td className="px-6 py-4 text-center">30 sentences</td>
                <td className="px-6 py-4 text-center">Full document</td>
                <td className="px-6 py-4 text-center">Full document</td>
                <td className="px-6 py-4 text-center">Full document</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">AI Detection</td>
                <td className="px-6 py-4 text-center">✓</td>
                <td className="px-6 py-4 text-center">✓</td>
                <td className="px-6 py-4 text-center">✓</td>
                <td className="px-6 py-4 text-center">✓</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium">Citation Confidence</td>
                <td className="px-6 py-4 text-center">✗</td>
                <td className="px-6 py-4 text-center">✓</td>
                <td className="px-6 py-4 text-center">✓</td>
                <td className="px-6 py-4 text-center">✓</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Certificate Watermark</td>
                <td className="px-6 py-4 text-center">Yes</td>
                <td className="px-6 py-4 text-center">No</td>
                <td className="px-6 py-4 text-center">No</td>
                <td className="px-6 py-4 text-center">No</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium">Certificate Retention</td>
                <td className="px-6 py-4 text-center">7 days</td>
                <td className="px-6 py-4 text-center">30 days</td>
                <td className="px-6 py-4 text-center font-bold text-purple-600">
                  Unlimited
                </td>
                <td className="px-6 py-4 text-center">Instant delete</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Advanced Analytics</td>
                <td className="px-6 py-4 text-center">✗</td>
                <td className="px-6 py-4 text-center">✗</td>
                <td className="px-6 py-4 text-center font-bold text-purple-600">
                  ✓
                </td>
                <td className="px-6 py-4 text-center">✗</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium">Export Formats</td>
                <td className="px-6 py-4 text-center">PDF only</td>
                <td className="px-6 py-4 text-center">All formats</td>
                <td className="px-6 py-4 text-center">All formats</td>
                <td className="px-6 py-4 text-center">All formats</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Which Plan is Right? */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">
          Which Plan is Right for You?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <Users className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold mb-2">Plus Users</h3>
            <p className="text-gray-600 text-sm mb-3">
              If you write 3-5 papers per month and need reliable plagiarism
              checking and citation analysis, the <strong>Plus plan</strong>{" "}
              offers the best value.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <TrendingUp className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold mb-2">Pro & Faculty</h3>
            <p className="text-gray-600 text-sm mb-3">
              For unlimited scanning, advanced analytics, and permanent
              certificate storage, the <strong>Pro plan</strong> is
              designed for you.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <Zap className="h-8 w-8 text-orange-600 mb-3" />
            <h3 className="font-semibold mb-2">Occasional Users</h3>
            <p className="text-gray-600 text-sm mb-3">
              If you only need occasional scans without monthly commitment,
              <strong>Pay-As-You-Go credits</strong> give you flexibility with
              no subscription.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <CheckCircle className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold mb-2">First-Time Users</h3>
            <p className="text-gray-600 text-sm mb-3">
              Start with the <strong>Free plan</strong> to test our features,
              then upgrade when you need more scans or advanced features.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white text-center">
        <h3 className="text-2xl font-semibold mb-2">Ready to Get Started?</h3>
        <p className="opacity-90 mb-6">
          Choose your plan and start improving your academic writing today.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="https://app.colabwize.com/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            View Pricing
          </a>
          <Link
            to="/limits"
            className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20">
            Learn About Limits
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;
