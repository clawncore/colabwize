import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Check, Loader2, Info, ChevronDown } from "lucide-react";
import { SubscriptionService } from "../../services/subscriptionService";
import { useToast } from "../../hooks/use-toast";

// STRICT PACK DEFINITIONS
interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  wordInfo: string;
  price: number;
  featured?: boolean;
  useCase: string; // New "What a credit can do" description
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "credits_trial",
    name: "Trial",
    credits: 5,
    wordInfo: "~5,000 words",
    price: 1.99,
    useCase: "Good for checking or editing a short document.",
  },
  {
    id: "credits_standard",
    name: "Standard",
    credits: 25,
    wordInfo: "~25,000 words",
    price: 6.99,
    featured: true,
    useCase: "Suitable for multiple assignments or medium-length papers.",
  },
  {
    id: "credits_power",
    name: "Power",
    credits: 50,
    wordInfo: "~50,000 words",
    price: 12.99,
    useCase: "Best for long documents or frequent usage.",
  },
];

export default function CreditsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchaseCredits = async (packageId: string) => {
    try {
      setLoading(packageId);
      // Create checkout for one-time payment
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Purchase Credits
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Buy credits to extend your usage. No monthly commitment.
          </p>

          {/* 1. CORE CREDIT STATEMENT */}
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-lg inline-block text-left max-w-2xl">
            <p className="font-semibold text-center mb-1">
              Credits are used based on how much text is processed.
            </p>
            <p className="text-center text-blue-700">
              On average, 1 credit covers about 1,000 words.
            </p>
          </div>
        </div>

        {/* 2. HOW CREDITS ARE USED (Simple Expandable) */}
        <div className="max-w-2xl mx-auto mb-10">
          <details className="group bg-white border border-gray-200 rounded-lg overflow-hidden">
            <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-gray-900 hover:bg-gray-50 transition-colors">
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4 text-indigo-500" />
                How credits are used
              </span>
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4 pb-4 pt-0 text-sm text-gray-600 space-y-2 border-t border-gray-100 mt-2 pt-3">
              <div className="grid grid-cols-[140px_1fr] gap-2 items-start">
                <span className="font-semibold text-gray-800">Citation audits:</span>
                <span>Credits are used based on the length of your document.</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2 items-start">
                <span className="font-semibold text-gray-800">Rephrasing:</span>
                <span>Credits depend on both the text you submit and the rewritten output.</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2 items-start">
                <span className="font-semibold text-gray-800">AI assistance:</span>
                <span>Credits are used based on the size of AI responses.</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2 items-start">
                <span className="font-semibold text-gray-800">Originality checks:</span>
                <span>Credits are used based on document length (if available on your plan).</span>
              </div>
            </div>
          </details>
        </div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-xl border-2 p-6 flex flex-col items-center text-center transition-all ${pkg.featured
                  ? "border-indigo-600 shadow-xl scale-105 z-10"
                  : "border-gray-200 hover:border-indigo-300 hover:shadow-md"
                }`}
            >
              {pkg.featured && (
                <div className="absolute -top-4 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wide">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>

              <div className="mb-2">
                <span className="text-4xl font-extrabold text-gray-900">
                  {pkg.credits}
                </span>
                <span className="text-gray-600 ml-2 font-medium">credits</span>
              </div>

              {/* 5. TOOLTIP / INFO ICON */}
              <div className="group relative mb-4 inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full cursor-help">
                <span className="text-sm text-gray-700 font-medium">
                  {pkg.wordInfo}
                </span>
                <Info className="h-3.5 w-3.5 text-gray-500" />

                {/* Tooltip Content */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-md py-2 px-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-center shadow-lg">
                  Word estimates are approximate.
                  <br />
                  Credit usage depends on how much text is processed during each action.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>

              {/* 3. WHAT A CREDIT CAN DO */}
              <p className="text-sm text-gray-500 mb-6 h-10 flex items-center justify-center px-2">
                {pkg.useCase}
              </p>

              <div className="text-3xl font-bold text-indigo-600 mb-1">
                ${pkg.price}
              </div>
              <div className="text-xs text-gray-500 mb-6 uppercase tracking-wider">
                One-time Payment
              </div>

              <div className="w-full space-y-3 mb-8 text-left pl-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-100 p-1 rounded-full shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">Credits never expire</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-100 p-1 rounded-full shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">No subscription required</span>
                </div>
              </div>

              <Button
                onClick={() => handlePurchaseCredits(pkg.id)}
                disabled={loading === pkg.id}
                className={`w-full py-6 text-lg ${pkg.featured
                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30"
                    : "bg-gray-900 hover:bg-gray-800"
                  }`}
              >
                {loading === pkg.id ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Purchase Credits"
                )}
              </Button>

              {/* 4. IMPORTANT DISCLAIMERS */}
              <div className="mt-4 text-[10px] text-gray-400 leading-tight px-1 space-y-1">
                <p>Credits extend usage limits on features available in your current plan.</p>
                <p>Credits do not unlock plan-restricted features.</p>
                <p className="font-medium text-gray-500">Credit usage may vary depending on document length and selected actions.</p>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900">
            Cancel / Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
