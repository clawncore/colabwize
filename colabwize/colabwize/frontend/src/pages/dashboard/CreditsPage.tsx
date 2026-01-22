import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Zap, Check, Loader2 } from "lucide-react";
import { SubscriptionService } from "../../services/subscriptionService";
import { useToast } from "../../hooks/use-toast";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  savings?: string;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "credits_10",
    name: "Starter",
    credits: 10,
    price: 4.99,
  },
  {
    id: "credits_25",
    name: "Basic",
    credits: 25,
    price: 9.99,
    popular: true,
  },
  {
    id: "credits_50",
    name: "Pro",
    credits: 50,
    price: 17.99,
  },
];

export default function CreditsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchaseCredits = async (packageId: string) => {
    try {
      setLoading(packageId);

      // Create checkout for one-time payment with specific package
      const checkoutUrl = await SubscriptionService.createCheckout(packageId);

      // Redirect to LemonSqueezy checkout
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Purchase Credits
          </h1>
          <p className="text-lg text-gray-600">
            Buy credits for pay-as-you-go scanning. No monthly commitment.
          </p>
        </div>

        {/* Credit Packages Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-2xl border-2 p-8 bg-white ${
                pkg.popular
                  ? "border-indigo-500 shadow-xl scale-105"
                  : "border-gray-200"
              } hover:shadow-lg transition-all`}>
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              {pkg.savings && (
                <div className="absolute -top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {pkg.savings}
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {pkg.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {pkg.credits}
                  </span>
                  <span className="text-gray-600 ml-2">credits</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-indigo-600">
                    ${pkg.price}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">one-time</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    No subscription required
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    Credits never expire
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    Full originality + AI detection
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    Professional certificates
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handlePurchaseCredits(pkg.id)}
                disabled={loading === pkg.id}
                className={`w-full ${
                  pkg.popular
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-gray-900 hover:bg-gray-800"
                } text-white`}>
                {loading === pkg.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Purchase Credits"
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How Credits Work
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Purchase Credits
              </h3>
              <p className="text-gray-600 text-sm">
                Buy any credit package that fits your needs. Credits never
                expire.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-indigo-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Use Anytime</h3>
              <p className="text-gray-600 text-sm">
                Each scan uses 1 credit. Use them whenever you need to check a
                document.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-indigo-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Buy More</h3>
              <p className="text-gray-600 text-sm">
                Running low? Purchase more credits at any time. They stack with
                your existing balance.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/billing")}
            className="text-gray-700">
            Back to Billing
          </Button>
        </div>
      </div>
    </div>
  );
}
