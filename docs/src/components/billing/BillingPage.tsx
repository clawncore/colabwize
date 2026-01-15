import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Receipt,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
const BillingPage = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for testing ColabWize features",
      features: [
        "3 scans per month",
        "Basic originality (30 sentences only)",
        "AI detection included",
        "Watermarked certificates",
        "7-day certificate retention",
        "PDF export only",
      ],
      limitations: [
        "No citation confidence",
        "No advanced analytics",
        "Limited scan depth",
      ],
    },
    {
      name: "Student",
      price: "$9.99",
      period: "per month",
      description: "Ideal for students writing papers",
      features: [
        "50 scans per month",
        "Full document originality",
        "AI detection included",
        "Citation confidence auditor",
        "Professional certificates",
        "30-day certificate retention",
        "All export formats",
      ],
      limitations: ["No advanced analytics"],
    },
    {
      name: "Researcher",
      price: "$29.99",
      period: "per month",
      description: "For serious researchers and academics",
      features: [
        "Unlimited scans",
        "Full document originality",
        "AI detection included",
        "Citation confidence auditor",
        "Advanced Analytics (Exclusive)",
        "Professional certificates",
        "Unlimited certificate retention",
        "All export formats",
        "Priority support",
      ],
      limitations: [],
    },
  ];

  const billingSections = [
    {
      title: "Payment Methods",
      description: "Manage your payment information securely",
      icon: <CreditCard className="h-6 w-6 text-blue-600" />,
    },
    {
      title: "Billing History",
      description: "View past invoices and payment records",
      icon: <Receipt className="h-6 w-6 text-green-600" />,
    },
    {
      title: "Subscription Management",
      description: "Upgrade, downgrade, or cancel your subscription",
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
    },
    {
      title: "Usage Tracking",
      description: "Monitor your resource consumption",
      icon: <Calendar className="h-6 w-6 text-orange-600" />,
    },
  ];

  return (
    <div className="min-h-screen px-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-6">
          <Link to="/" className="inline-flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documentation
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Billing & Plans</h1>
            <p className="text-lg text-gray-600">
              Understand our pricing plans and manage your subscription
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white mb-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex-1 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">
                Flexible Pricing Options
              </h2>
              <p className="opacity-90">
                Choose the plan that best fits your academic needs and budget
              </p>
            </div>
            <div className="flex space-x-2">
              <div className="bg-white/20 p-3 rounded-lg">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Subscription Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-lg p-6 ${
                  index === 1
                    ? "border-blue-300 ring-2 ring-blue-100 relative"
                    : "border-gray-200"
                }`}>
                {index === 1 && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, limitationIndex) => (
                    <li key={limitationIndex} className="flex items-start">
                      <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500 line-through">
                        {limitation}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-2 rounded-lg font-medium ${
                    index === 1
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}>
                  {index === 0 ? "Current Plan" : "Select Plan"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Plans */}
        <section className="mb-8">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Team & Institutional Plans
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Designed for universities and research institutes to empower
                entire teams with advanced academic writing tools.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-white">
                      For Universities & Research Institutes
                    </h3>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-300">
                      Unlimited everything - Projects, words, storage (1TB), and
                      AI usage
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-300">
                      Custom templates and citation styles
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-300">
                      Advanced analytics and reporting
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-300">
                      SSO integration (SAML/OAuth)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-300">
                      Dedicated premium support and account management
                    </span>
                  </li>
                </ul>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-2xl font-bold text-white">
                    Custom Pricing
                  </div>
                  <a
                    href="/contact-support"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Contact Sales
                  </a>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-purple-600 flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-white">
                      Enterprise Features
                    </h3>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-300">
                      White-label options
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-300">
                      Compliance-ready (FERPA/GDPR)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-300">
                      Bulk user provisioning
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-300">
                      Multi-year contract options
                    </span>
                  </li>
                </ul>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-lg text-gray-300">
                    Tailored solutions for your organization
                  </div>
                  <a
                    href="/contact-support"
                    className="inline-flex items-center px-3 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                    Learn More
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-400">
                Need a custom solution?{" "}
                <a
                  href="/contact-support"
                  className="text-blue-400 hover:text-blue-300 font-medium">
                  Contact our sales team
                </a>{" "}
                for a personalized consultation.
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Billing Management</h2>
            <div className="space-y-4">
              {billingSections.map((section, index) => (
                <div key={index} className="p-5">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0 mr-3">{section.icon}</div>
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                  </div>
                  <p className="text-gray-600">{section.description}</p>
                  <div className="mt-4">
                    <Link
                      to="/dashboard/settings/billing"
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      Manage {section.title}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Billing FAQ</h2>
            <div className="space-y-4">
              <div className="p-5">
                <h3 className="font-semibold mb-2">
                  How do I upgrade my plan?
                </h3>
                <p className="text-gray-600">
                  You can upgrade at any time from your billing settings. The
                  change will take effect immediately and you'll be charged a
                  prorated amount for the remainder of your billing cycle.
                </p>
              </div>
              <div className="p-5">
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-600">
                  Yes, you can cancel your subscription at any time. Your access
                  will continue until the end of your current billing period.
                </p>
              </div>
              <div className="p-5">
                <h3 className="font-semibold mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600">
                  We accept all major credit cards including Visa, Mastercard,
                  American Express, and Discover. We also support PayPal and
                  bank transfers for annual plans.
                </p>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-5">
              <div className="flex items-center mb-3">
                <AlertCircle className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold">Student Discount</h3>
              </div>
              <p className="text-blue-800">
                Students can get 25% off any paid plan with a valid .edu email
                address. Contact support with your student ID to apply the
                discount.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Need Help with Billing?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mb-3">
                <Receipt className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">View Invoices</h3>
              <p className="text-sm text-gray-600 mt-1">
                Access all your billing records
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mb-3">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Update Payment</h3>
              <p className="text-sm text-gray-600 mt-1">
                Change your payment method
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mb-3">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Contact Support</h3>
              <p className="text-sm text-gray-600 mt-1">
                Get help with billing issues
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
