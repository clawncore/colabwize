import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Zap,
} from "lucide-react";

const UsageLimitsPage = () => {
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
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h1 className="text-3xl font-bold mb-2">Usage Limits</h1>
            <p className="text-lg text-gray-600">
              Understanding scan limits and how they work
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Limits */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Monthly Scan Limits by Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Free</h3>
            <div className="text-4xl font-bold text-gray-900 mb-2">3</div>
            <p className="text-sm text-gray-600">scans per month</p>
          </div>

          <div className="border border-blue-500 rounded-lg p-6 bg-blue-50">
            <h3 className="text-lg font-semibold mb-3">Student</h3>
            <div className="text-4xl font-bold text-blue-600 mb-2">50</div>
            <p className="text-sm text-gray-600">scans per month</p>
          </div>

          <div className="border border-purple-500 rounded-lg p-6 bg-purple-50">
            <h3 className="text-lg font-semibold mb-3">Researcher</h3>
            <div className="text-4xl font-bold text-purple-600 mb-2">∞</div>
            <p className="text-sm text-gray-600">unlimited scans</p>
          </div>

          <div className="border border-orange-500 rounded-lg p-6 bg-orange-50">
            <h3 className="text-lg font-semibold mb-3">PAYG</h3>
            <div className="text-4xl font-bold text-orange-600 mb-2">1:1</div>
            <p className="text-sm text-gray-600">scan per credit</p>
          </div>
        </div>
      </div>

      {/* How Limits Work */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">How Usage Limits Work</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold mb-4 text-blue-900">Important Points</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <RefreshCw className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-blue-900">
                <strong>Monthly Reset:</strong> Limits reset on the 1st of each
                month (not from your billing date)
              </span>
            </li>
            <li className="flex items-start">
              <Zap className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-blue-900">
                <strong>Per Scan:</strong> Each Originality, AI Detection, or
                combined scan counts as 1 scan toward your limit
              </span>
            </li>
            <li className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-blue-900">
                <strong>Citation checks:</strong> Do NOT count toward scan
                limits for Student+ plans (counted separately for Free users - 0
                allowed)
              </span>
            </li>
            <li className="flex items-start">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-blue-900">
                <strong>Unused scans:</strong> Do not roll over to the next
                month
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Feature Access Matrix */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Feature Access by Plan</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Feature</th>
                <th className="px-6 py-3 text-center font-semibold">Free</th>
                <th className="px-6 py-3 text-center font-semibold">Student</th>
                <th className="px-6 py-3 text-center font-semibold">
                  Researcher
                </th>
                <th className="px-6 py-3 text-center font-semibold">PAYG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 font-medium">Originality Scan</td>
                <td className="px-6 py-4 text-center text-sm">
                  3/month (Partial)
                </td>
                <td className="px-6 py-4 text-center text-sm">
                  50/month (Full)
                </td>
                <td className="px-6 py-4 text-center text-sm">
                  Unlimited (Full)
                </td>
                <td className="px-6 py-4 text-center text-sm">
                  Per credit (Full)
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium">AI Detection</td>
                <td className="px-6 py-4 text-center text-sm">
                  Included in scans
                </td>
                <td className="px-6 py-4 text-center text-sm">
                  Included in scans
                </td>
                <td className="px-6 py-4 text-center text-sm">
                  Included in scans
                </td>
                <td className="px-6 py-4 text-center text-sm">
                  Included in scans
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Citation Confidence</td>
                <td className="px-6 py-4 text-center text-sm text-red-600 font-semibold">
                  Not Available
                </td>
                <td className="px-6 py-4 text-center text-sm">✓ Not limited</td>
                <td className="px-6 py-4 text-center text-sm">✓ Not limited</td>
                <td className="px-6 py-4 text-center text-sm">✓ Not limited</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium">Certificates</td>
                <td className="px-6 py-4 text-center text-sm">3/month</td>
                <td className="px-6 py-4 text-center text-sm">50/month</td>
                <td className="px-6 py-4 text-center text-sm">Unlimited</td>
                <td className="px-6 py-4 text-center text-sm">Per credit</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Advanced Analytics</td>
                <td className="px-6 py-4 text-center text-sm text-red-600 font-semibold">
                  Not Available
                </td>
                <td className="px-6 py-4 text-center text-sm text-red-600 font-semibold">
                  Not Available
                </td>
                <td className="px-6 py-4 text-center text-sm text-green-600 font-semibold">
                  ✓ Exclusive
                </td>
                <td className="px-6 py-4 text-center text-sm text-red-600 font-semibold">
                  Not Available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tracking Usage */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">How to Track Your Usage</h2>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Dashboard</h3>
            <p className="text-gray-600 text-sm">
              Your remaining scans are displayed on the main dashboard. Check it
              before running scans.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Billing Page</h3>
            <p className="text-gray-600 text-sm">
              Visit Dashboard → Billing to see detailed usage statistics and
              history for the current month.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Scan Warnings</h3>
            <p className="text-gray-600 text-sm">
              You'll receive a warning when attempting to scan after reaching
              your monthly limit.
            </p>
          </div>
        </div>
      </div>

      {/* What Happens When You Hit the Limit */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          What Happens When You Reach Your Limit?
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <AlertCircle className="h-8 w-8 text-red-600 mb-3" />
          <h3 className="font-semibold mb-2 text-red-900">Scans Blocked</h3>
          <p className="text-red-800 mb-4">
            Once you've used all your monthly scans, you won't be able to run
            new scans until:
          </p>
          <ul className="space-y-2 text-red-900">
            <li>• The next month begins (automatic reset on the 1st)</li>
            <li>• You upgrade to a higher plan with more scans</li>
            <li>• You purchase PAYG credits for immediate access</li>
          </ul>
        </div>
      </div>

      {/* Upgrade Options */}
      <div className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
        <h3 className="text-xl font-semibold mb-2">Need More Scans?</h3>
        <p className="opacity-90 mb-4">
          Upgrade your plan or buy credits to continue scanning without waiting
          for the monthly reset.
        </p>
        <div className="flex gap-3">
          <Link
            to="/plans"
            className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Compare Plans
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

export default UsageLimitsPage;
