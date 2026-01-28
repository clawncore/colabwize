import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Check,
  Loader2,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { SubscriptionService } from "../../services/subscriptionService";
import { useToast } from "../../hooks/use-toast";

// CREDIT PACKAGE DEFINITIONS
interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: string;
  featured?: boolean;
  savings?: string;
  wordCount: string;
  examples: string[];
  badge?: string;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "credits_trial",
    name: "Starter",
    credits: 5,
    price: 1.99,
    pricePerCredit: "$0.40",
    wordCount: "~5,000 words",
    badge: "Try it out",
    examples: [
      "1 short essay (5 pages)",
      "2-3 citation checks",
      "Quick AI assistance"
    ],
  },
  {
    id: "credits_standard",
    name: "Professional",
    credits: 25,
    price: 6.99,
    pricePerCredit: "$0.28",
    featured: true,
    savings: "Save 30%",
    wordCount: "~25,000 words",
    badge: "Most Popular",
    examples: [
      "5 research papers (10 pages each)",
      "Full thesis chapter review",
      "Multiple AI rewrites"
    ],
  },
  {
    id: "credits_power",
    name: "Enterprise",
    credits: 50,
    price: 12.99,
    pricePerCredit: "$0.26",
    savings: "Save 35%",
    wordCount: "~50,000 words",
    badge: "Best Value",
    examples: [
      "Complete dissertation review",
      "10+ research papers",
      "Unlimited AI assistance"
    ],
  },
];

export default function CreditsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchaseCredits = async (packageId: string) => {
    try {
      setLoading(packageId);
      const checkoutUrl = await SubscriptionService.createCheckout(packageId);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: "Failed to create checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-16 px-4 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Pay only for what you use
          </div>

          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Power Your Research with Credits
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Get instant access to AI-powered citation checking, plagiarism detection,
            and writing assistance. <span className="font-semibold text-gray-900">No subscriptions. No commitments.</span>
          </p>

          {/* Value Proposition Cards */}
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Never Expire</h3>
              <p className="text-sm text-gray-600">Use your credits anytime, no rush or deadlines</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Access</h3>
              <p className="text-sm text-gray-600">Credits activate immediately after purchase</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Better Value</h3>
              <p className="text-sm text-gray-600">Save up to 35% with larger packages</p>
            </div>
          </div>

        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl p-8 transition-all duration-300 ${pkg.featured
                ? "border-2 border-indigo-600 shadow-2xl shadow-indigo-200/50 scale-105 z-10"
                : "border border-gray-200 hover:border-indigo-300 hover:shadow-xl"
                }`}
            >
              {/* Badge */}
              {pkg.badge && (
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${pkg.featured
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "bg-gray-900 text-white"
                  }`}>
                  {pkg.badge}
                </div>
              )}

              {/* Savings Badge */}
              {pkg.savings && (
                <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  {pkg.savings}
                </div>
              )}

              {/* Package Name */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                <p className="text-gray-500 text-sm">{pkg.wordCount}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-extrabold text-gray-900">${pkg.price}</span>
                  <span className="text-gray-500 text-sm">one-time</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-xs text-gray-600">
                    {pkg.pricePerCredit} per credit
                  </span>
                </div>
              </div>

              {/* Credits */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 text-center border border-indigo-100">
                <div className="text-4xl font-bold text-indigo-600 mb-1">
                  {pkg.credits}
                </div>
                <div className="text-sm text-gray-600 font-medium">Credits</div>
              </div>

              {/* What You Get */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  Perfect for:
                </h4>
                <ul className="space-y-2.5">
                  {pkg.examples.map((example, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Features */}
              <div className="space-y-2.5 mb-8 pb-8 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  <span>Credits never expire</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  <span>No subscription required</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  <span>Instant activation</span>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => handlePurchaseCredits(pkg.id)}
                disabled={loading === pkg.id}
                className={`w-full py-6 text-base font-semibold transition-all duration-300 ${pkg.featured
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                  : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
              >
                {loading === pkg.id ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              {/* Fine Print */}
              <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
                Secure payment via Lemon Squeezy
              </p>
            </div>
          ))}
        </div>

        {/* Trust Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-12 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Trusted by Researchers Worldwide
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">99.9%</div>
              <p className="text-sm text-gray-600">Citation Accuracy</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">50K+</div>
              <p className="text-sm text-gray-600">Papers Analyzed</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">24/7</div>
              <p className="text-sm text-gray-600">Support Available</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
              <summary className="flex cursor-pointer items-center justify-between p-5 font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                <span>How are credits calculated?</span>
                <ArrowRight className="h-5 w-5 transition-transform group-open:rotate-90" />
              </summary>
              <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                Credits are consumed based on the amount of text processed. On average, <strong>1 credit = 1,000 words</strong>.
                For citation audits, we count your document length. For AI features, we count both input and output text.
              </div>
            </details>

            <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
              <summary className="flex cursor-pointer items-center justify-between p-5 font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                <span>Do credits really never expire?</span>
                <ArrowRight className="h-5 w-5 transition-transform group-open:rotate-90" />
              </summary>
              <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                Yes! Your credits remain in your account indefinitely. Use them whenever you need them,
                whether that's tomorrow or next year. No deadlines, no pressure.
              </div>
            </details>

            <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
              <summary className="flex cursor-pointer items-center justify-between p-5 font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                <span>Can I get a refund?</span>
                <ArrowRight className="h-5 w-5 transition-transform group-open:rotate-90" />
              </summary>
              <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                We offer a 7-day money-back guarantee if you're not satisfied with your purchase.
                Contact our support team and we'll process your refund promptly.
              </div>
            </details>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
