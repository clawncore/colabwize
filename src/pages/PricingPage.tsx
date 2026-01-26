import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Check, Zap } from "lucide-react";
import { SubscriptionService, Plan } from "../services/subscriptionService";
import { useToast } from "../hooks/use-toast";
import Layout from "../components/Layout";

import { useAuth } from "../hooks/useAuth";


function IntroHero() {
  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop')",
        }}></div>
      <div className="container-custom relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Plan
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Start free and upgrade as you grow. No credit card required for the
            free plan.
          </p>
        </div>
      </div>
    </section>
  );
}

// Features Presentation Flow
function FeaturesPresentationFlow() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [currentPlanId, setCurrentPlanId] = useState<string>("free");

  // Modal state


  const navigate = useNavigate();
  const { user } = useAuth(); // Use the hook for reactive auth state

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user) {
        try {
          const data = await SubscriptionService.getCurrentSubscription();
          const plan = data?.subscription?.plan;
          let planId = "free";
          if (typeof plan === "string") {
            planId = plan;
          } else if (plan && typeof plan === "object" && "id" in plan) {
            planId = (plan as any).id;
          }
          setCurrentPlanId(planId || "free");
        } catch (error) {
          console.error("Failed to fetch subscription", error);
        }
      }
    };
    fetchSubscription();
  }, [user]);

  const handleSelectPlan = useCallback(async (planId: string) => {
    // Handle free tier - redirect to signup
    if (planId === "free") {
      if (currentPlanId !== "free") {
        // Downgrade logic? For now redirect to dashboard
        navigate("/dashboard");
        return;
      }
      navigate("/signup");
      return;
    }

    // Handle pay-as-you-go - check authentication first
    if (planId === "payg") {
      // const isAuthenticated = authService.isAuthenticated();

      if (!user) {
        // Save intended action for after login
        localStorage.setItem(
          "intended_action",
          JSON.stringify({
            type: "credits",
            action: "/dashboard/billing/credits",
          })
        );

        toast({
          title: "Login Required",
          description: "Please login to purchase credits",
        });

        navigate("/login");
        return;
      }

      // User is authenticated, navigate to credits page
      toast({
        title: "Pay-As-You-Go",
        description: "Select credit package on the next page",
      });
      navigate("/dashboard/billing/credits");
      return;
    }

    // Check if user is authenticated using the hook which is reactive
    // const isAuthenticated = authService.isAuthenticated(); // DEPRECATED

    if (!user) { // useAuth provides user object if authenticated
      // Save intended subscription for after login
      localStorage.setItem(
        "intended_subscription",
        JSON.stringify({
          planId,
          billingPeriod,
        })
      );

      toast({
        title: "Login Required",
        description: "Please login to subscribe to this plan",
      });

      // Redirect to login
      navigate("/login");
      return;
    }

    // CHECK FOR DUPLICATE SUBSCRIPTION
    // If user already has a paid plan (not free, not payg), block new sub
    if (currentPlanId !== "free" && currentPlanId !== "payg") {
      toast({
        title: "Active Subscription Found",
        description: "You already have an active subscription. Please manage your plan from the billing dashboard.",
        variant: "destructive", // Use destructive or warning style
      });
      navigate("/dashboard/billing");
      return;
    }

    // User is authenticated, proceed to checkout logic
    try {
      setCheckoutLoading(planId);
      // Create checkout session directly
      const checkoutUrl = await SubscriptionService.createCheckout(
        planId,
        billingPeriod,
        true // Policy accepted (implied by clicking)
      );
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
      setCheckoutLoading(null);
    }
  }, [billingPeriod, navigate, toast, currentPlanId, user]);



  useEffect(() => {
    // Define base monthly plans
    const basePlans = [
      {
        id: "free",
        name: "Free Tier",
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
          "3 document scans per month",
          "3 Rephrase Suggestions",
          "Max 100,000 characters (~15k words)",
          "Basic originality check",
          "Certificate",
        ],
      },
      {
        id: "payg",
        name: "Pay-As-You-Go",
        monthlyPrice: 0,
        yearlyPrice: 0,
        oneTime: true,
        features: [
          "No subscription required",
          "Buy scan credits anytime",
          "Credits never expire",
          "Max 300,000 characters (~50k words)",
          "Full originality map",
          "Professional certificates",
          "10 scans: $4.99 | 25: $9.99 | 50: $17.99",
        ],
      },
      {
        id: "student",
        name: "Student",
        monthlyPrice: 4.99,
        yearlyPrice: 47.9, // 20% discount
        features: [
          "50 document scans per month",
          "50 Rephrase Suggestions",
          "Max 300,000 characters (~50k words)",
          "Full originality map",
          "Citation confidence auditor",
          "Professional certificate",
        ],
        popular: true,
      },
      {
        id: "researcher",
        name: "Researcher",
        monthlyPrice: 12.99,
        yearlyPrice: 124.7, // 20% discount
        features: [
          "Everything in Student Unlimited",
          "Max 500,000 characters (~80k words)",
          "Priority scanning",
          "Advanced Analytics",
          "Draft comparison",
          "Safe AI Integrity Assistant",
        ],
        researcher: true,
      },
    ];

    // Convert to Plan format with correct pricing based on billing period
    const convertedPlans: Plan[] = basePlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: billingPeriod === "yearly" ? plan.yearlyPrice : plan.monthlyPrice,
      interval: plan.oneTime
        ? "one-time"
        : billingPeriod === "yearly"
          ? "year"
          : "month",
      features: plan.features,
      popular: plan.popular,
      researcher: plan.researcher,
    }));

    setPlans(convertedPlans);
    setLoading(false);
  }, [billingPeriod]);

  // Check if user just logged in with intention to subscribe
  useEffect(() => {
    const resumeSubscription = async () => {
      const savedSubscription = localStorage.getItem("intended_subscription");

      if (savedSubscription) {
        try {
          const { planId, billingPeriod: savedPeriod } =
            JSON.parse(savedSubscription);

          // Clear saved subscription immediately to prevent loops
          localStorage.removeItem("intended_subscription");

          // Check if user is now authenticated
          // const isAuthenticated = authService.isAuthenticated();

          if (user) {
            // Update billing period unconditionally
            setBillingPeriod(savedPeriod);

            toast({
              title: "Resuming Subscription",
              description: "Redirecting to checkout...",
            });

            // Make sure we use the saved period for checkout, avoiding stale closures
            setTimeout(async () => {
              // Redirect to checkout or just let user click again
              // For now, we rely on the user clicking the button again as auto-checkout might be blocked
            }, 500);
          }
        } catch (error) {
          console.error("Error resuming subscription:", error);
          localStorage.removeItem("intended_subscription");
        }
      }
    };

    resumeSubscription();

    // Check for PAYG credits intent
    const resumeCredits = () => {
      const savedAction = localStorage.getItem("intended_action");

      if (savedAction) {
        try {
          const { type, action } = JSON.parse(savedAction);

          // Clear saved action immediately
          localStorage.removeItem("intended_action");

          if (type === "credits" && user) {
            toast({
              title: "Redirecting to Credits",
              description: "Taking you to purchase credits...",
            });

            setTimeout(() => {
              navigate(action);
            }, 500);
          }
        } catch (error) {
          console.error("Error resuming action:", error);
          localStorage.removeItem("intended_action");
        }
      }
    };

    resumeCredits();
  }, [navigate, toast, user]); // Only run once on mount (navigate and toast are stable)



  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading pricing...</div>
      </div>
    );
  }

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="space-y-12">
          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center bg-gray-100 rounded-full p-1 gap-1">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-8 py-2.5 rounded-full font-medium transition-all ${billingPeriod === "monthly"
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
                  }`}>
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-8 py-2.5 rounded-full font-medium transition-all relative ${billingPeriod === "yearly"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
                  }`}>
                Annual
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                  20% OFF
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="min-w-screen mx-auto">
            <div className="grid md:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border-2 p-8 ${plan.researcher
                    ? "border-red-500 shadow-xl scale-105"
                    : plan.popular
                      ? "border-green-500 shadow-xl scale-105"
                      : "border-gray-300"
                    }
                  hover:shadow-lg transition-all bg-white`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  )}
                  {plan.researcher && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                      For Researchers
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-5xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="text-gray-600">
                          {plan.interval === "one-time"
                            ? ""
                            : `/${plan.interval}`}
                        </span>
                      </div>
                      {billingPeriod === "yearly" &&
                        plan.id !== "free" &&
                        plan.id !== "payg" && (
                          <div className="text-sm text-gray-500">
                            ${(plan.price / 12).toFixed(2)}/month effective
                          </div>
                        )}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={checkoutLoading === plan.id || plan.id === currentPlanId}
                    className={`w-full ${plan.researcher
                      ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                      : plan.popular
                        ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                      }`}
                    size="lg">
                    {checkoutLoading === plan.id ? (
                      "Loading..."
                    ) : plan.id === currentPlanId ? (
                      "Current Plan"
                    ) : plan.id === "free" ? (
                      "Start Free"
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        {currentPlanId !== "free" && plan.id !== "payg" ? "Switch Plan" : "Get Started"}
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Plan Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">
                    Free
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">
                    Pay-As-You-Go
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">
                    Student
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">
                    Researcher
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    Document Scans
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">
                    3/month
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">
                    Credit-based
                  </td>
                  <td className="py-4 px-4 text-center text-gray-900">
                    50/month
                  </td>
                  <td className="py-4 px-4 text-center text-gray-900">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    Originality Check
                  </td>
                  <td className="py4 px-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    Citation Confidence
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    Certificate Generation
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      Watermarked
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Professional
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Professional
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Professional
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    Export Formats
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    Priority Scanning
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    Draft Comparison
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    Advanced Analytics
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    Support
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">Basic</td>
                  <td className="py-4 px-4 text-center text-gray-900">Email</td>
                  <td className="py-4 px-4 text-center text-gray-900">Email</td>
                  <td className="py-4 px-4 text-center text-gray-900">
                    Priority
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    Max Scan Size
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">
                    100k chars
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">
                    300k chars
                  </td>
                  <td className="py-4 px-4 text-center text-gray-900">
                    300k chars
                  </td>
                  <td className="py-4 px-4 text-center text-gray-900">
                    500k chars
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    Rephrase Suggestions
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">
                    3/month
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center text-gray-900">
                    50/month
                  </td>
                  <td className="py-4 px-4 text-center text-gray-900">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    Safe AI Integrity Assistant
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    Advanced Citation Suggestions
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            {[
              {
                q: "Can I switch plans later?",
                a: "Yes! You can upgrade or downgrade your plan at any time from your billing dashboard.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, debit cards, and PayPal through our secure payment processor LemonSqueezy.",
              },
              {
                q: "Is there a contract or commitment?",
                a: "No! All plans are month-to-month with no long-term commitment. Cancel anytime.",
              },
              {
                q: "What happens when I reach my scan limit?",
                a: "Free plan users will be prompted to upgrade. Paid plans have unlimited scans, so you'll never hit a limit.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg border border-gray-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.q}
                </h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Closing CTA
function ClosingCTA() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <section className="section-padding relative overflow-hidden bg-white">
      {/* Background with academic shapes */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-100/20 to-emerald-100/20 opacity-95"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-green-300/30 rounded-full"></div>
        <div className="absolute top-40 right-20 w-16 h-16 border-2 border-green-300/30 rotate-45"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 border-2 border-green-300/30 rounded-full"></div>
        <div className="absolute bottom-40 right-10 w-12 h-12 border-2 border-green-300/30 rotate-12"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Join thousands of students and researchers protecting their academic
            integrity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-green-500/20 transition-all duration-300"
              onClick={handleGetStarted}>
              Start Your Free Trial
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
              <a
                href="https://docs.colabwize.com/quickstart"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                See How It Works
              </a>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Available worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PricingPage() {
  return (
    <Layout>
      <IntroHero />
      <FeaturesPresentationFlow />
      <ClosingCTA />
    </Layout>
  );
}
