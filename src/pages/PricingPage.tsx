import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Check, Zap } from "lucide-react";
import { SubscriptionService } from "../services/subscriptionService";
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
  // Simplified loading logic as plans are now static-ish
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
  const [currentPlanId, setCurrentPlanId] = useState<string>("free");
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user) {
        try {
          const data = await SubscriptionService.getCurrentSubscription();
          const plan = data?.subscription?.plan;
          setSubscriptionId(data?.subscription?.id || null);

          let planId = "free";
          if (typeof plan === "string") planId = plan;
          else if (plan && typeof plan === "object" && "id" in plan) planId = (plan as any).id;

          setCurrentPlanId(planId || "free");
        } catch (error) {
          console.error("Failed to fetch subscription", error);
        }
      }
    };
    fetchSubscription();
  }, [user]);

  const handleSelectPlan = useCallback(async (planId: string) => {
    // 1. Handle Free Plan
    if (planId === "free") {
      if (currentPlanId !== "free") {
        // Already on paid plan, redirect to dashboard to manage
        navigate("/dashboard/billing");
        return;
      }
      navigate("/signup");
      return;
    }

    // 2. Handle Credits (PAYG)
    if (planId === "credits") {
      if (!user) {
        localStorage.setItem("intended_action", JSON.stringify({ type: "credits", action: "/purchase-credits" }));
        toast({ title: "Login Required", description: "Please login to purchase credits" });
        navigate("/login");
        return;
      }
      navigate("/purchase-credits");
      return;
    }

    // 3. Handle Paid Subscriptions
    if (!user) {
      localStorage.setItem("intended_subscription", JSON.stringify({ planId, billingPeriod }));
      toast({ title: "Login Required", description: "Please login to subscribe" });
      navigate("/login");
      return;
    }

    // Strict Upgrade Guard
    const canUpgrade =
      subscriptionId === null ||
      currentPlanId === "free" ||
      (currentPlanId !== planId && planId === "researcher");

    if (!canUpgrade) {
      toast({
        title: "Active Subscription Found",
        description: "You already have an active subscription. Manage it from your dashboard.",
        variant: "destructive",
      });
      navigate("/dashboard/billing");
      return;
    }

    try {
      setCheckoutLoading(planId);
      const checkoutUrl = await SubscriptionService.createCheckout(planId, billingPeriod, true);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      toast({ title: "Checkout Error", description: "Failed to create checkout session.", variant: "destructive" });
      setCheckoutLoading(null);
    }
  }, [billingPeriod, navigate, toast, currentPlanId, user, subscriptionId]);

  // Pricing Constants
  const STUDENT_PRICE = billingPeriod === "yearly" ? 47.9 : 4.99;
  const RESEARCHER_PRICE = billingPeriod === "yearly" ? 124.7 : 12.99;

  const PriceDisplay = ({ price }: { price: number }) => (
    <div className="flex items-baseline justify-center gap-1 mb-1">
      <span className="text-4xl font-bold text-gray-900">${price}</span>
      <span className="text-gray-500">{billingPeriod === "yearly" ? "/year" : "/mo"}</span>
    </div>
  );

  const EffectiveMonthly = ({ price }: { price: number }) => {
    if (billingPeriod !== "yearly") return null;
    return <div className="text-sm text-gray-500 mb-4">${(price / 12).toFixed(2)}/mo effective</div>;
  };

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">

        {/* Billing Toggle */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex items-center bg-white rounded-full p-1 border border-gray-200 shadow-sm">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingPeriod === "monthly" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative ${billingPeriod === "yearly" ? "bg-green-600 text-white" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Yearly
              <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* SECTION 1: SUBSCRIPTION PLANS */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-24">

          {/* FREE PLAN */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col relative">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-500 text-sm h-5">Citation Preview</p>
            </div>

            <div className="mb-8 text-center pt-4 border-t border-gray-100">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <p className="text-xs text-gray-400 mt-2">Forever free</p>
            </div>

            <div className="space-y-4 flex-1 mb-8">
              <p className="font-semibold text-sm text-gray-900 uppercase tracking-wide">Included:</p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-gray-400 shrink-0" />
                  <span className="text-gray-600">3 basic citation audits / mo</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-gray-400 shrink-0" />
                  <span className="text-gray-600">Max 20,000 characters (~3k words)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-gray-400 shrink-0" />
                  <span className="text-gray-600">3 rephrases / mo (1 variant)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-gray-400 shrink-0" />
                  <span className="text-gray-600">Preview certificate (watermarked)</span>
                </li>
              </ul>

              <div className="pt-4 border-t border-gray-50">
                <p className="font-semibold text-sm text-gray-400 uppercase tracking-wide mb-3">Locked:</p>
                <ul className="space-y-3 text-sm opacity-60">
                  <li className="flex items-start gap-3">
                    <span className="h-5 w-5 flex items-center justify-center bg-gray-100 rounded-full shrink-0">
                      <span className="text-xs">🔒</span>
                    </span>
                    <span className="text-gray-500">Full citation analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-5 w-5 flex items-center justify-center bg-gray-100 rounded-full shrink-0">
                      <span className="text-xs">🔒</span>
                    </span>
                    <span className="text-gray-500">Large academic papers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-5 w-5 flex items-center justify-center bg-gray-100 rounded-full shrink-0">
                      <span className="text-xs">🔒</span>
                    </span>
                    <span className="text-gray-500">Submission-ready reports</span>
                  </li>
                </ul>
              </div>
            </div>

            <Button
              onClick={() => handleSelectPlan("free")}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Start Free
            </Button>
            <p className="text-center text-xs text-gray-400 mt-3">Preview only. Upgrade for full access.</p>
          </div>

          {/* STUDENT PLAN */}
          <div className="bg-white rounded-2xl border-2 border-green-500 p-8 flex flex-col relative shadow-xl transform lg:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
              Most Popular
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Student</h3>
              <p className="text-green-600 font-medium text-sm h-5">Coursework, assignments, projects</p>
            </div>

            <div className="mb-8 text-center pt-4 border-t border-gray-100">
              <PriceDisplay price={STUDENT_PRICE} />
              <EffectiveMonthly price={STUDENT_PRICE} />
            </div>

            <div className="space-y-4 flex-1 mb-8">
              <p className="font-semibold text-sm text-gray-900 uppercase tracking-wide">Everything in Free, plus:</p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-gray-700 font-medium">25 verified citation audits / mo</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-gray-700">Max 80,000 characters (~12k words)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-gray-700">25 rephrases (up to 3 variants)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-gray-700 font-medium">Citation confidence analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-gray-700">Verified academic certificate</span>
                </li>
              </ul>

              <div className="pt-4 border-t border-gray-50">
                <p className="font-semibold text-sm text-gray-400 uppercase tracking-wide mb-3">Locked:</p>
                <ul className="space-y-3 text-sm opacity-75">
                  <li className="flex items-start gap-3">
                    <span className="h-5 w-5 flex items-center justify-center bg-gray-100 rounded-full shrink-0">
                      <span className="text-xs">🔒</span>
                    </span>
                    <span className="text-gray-500">Priority scanning</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-5 w-5 flex items-center justify-center bg-gray-100 rounded-full shrink-0">
                      <span className="text-xs">🔒</span>
                    </span>
                    <span className="text-gray-500">Draft comparison</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-5 w-5 flex items-center justify-center bg-gray-100 rounded-full shrink-0">
                      <span className="text-xs">🔒</span>
                    </span>
                    <span className="text-gray-500">Advanced analytics</span>
                  </li>
                </ul>
              </div>
            </div>

            <Button
              onClick={() => handleSelectPlan("student")}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 shadow-lg hover:shadow-green-200 transition-all"
            >
              {checkoutLoading === "student" ? "Processing..." : "Upgrade to Student"}
            </Button>
          </div>

          {/* RESEARCHER PLAN */}
          <div className="bg-white rounded-2xl border border-blue-200 p-8 flex flex-col relative ring-1 ring-blue-100/50">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Researcher</h3>
              <p className="text-blue-600 font-medium text-sm h-5">Theses, publications, serious research</p>
            </div>

            <div className="mb-8 text-center pt-4 border-t border-gray-100">
              <PriceDisplay price={RESEARCHER_PRICE} />
              <EffectiveMonthly price={RESEARCHER_PRICE} />
            </div>

            <div className="space-y-4 flex-1 mb-8">
              <p className="font-semibold text-sm text-gray-900 uppercase tracking-wide">Everything in Student, plus:</p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-blue-600 shrink-0" />
                  <span className="text-gray-900 font-semibold">100 citation audits / month</span>
                  <span className="text-xs text-gray-400 mt-1">(Max 200,000 chars/doc)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-blue-600 shrink-0" />
                  <span className="text-gray-700">Research Gaps & Insight Map</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-blue-600 shrink-0" />
                  <span className="text-gray-700">100 rephrases / month (Advanced)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-blue-600 shrink-0" />
                  <span className="text-gray-700">Priority scanning (Queue Jump)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-blue-600 shrink-0" />
                  <span className="text-gray-700">Draft comparison</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-blue-600 shrink-0" />
                  <span className="text-gray-700">Certified institutional-grade reports</span>
                </li>
              </ul>
              <div className="pt-4 mt-6 bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                <p className="text-xs text-blue-800 font-medium text-center">
                  Designed for rigorous academic standards and frequent analysis.
                </p>
              </div>
            </div>

            <Button
              onClick={() => handleSelectPlan("researcher")}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6"
            >
              {checkoutLoading === "researcher" ? "Processing..." : "Upgrade to Researcher"}
            </Button>
          </div>
        </div>

        {/* SECTION 2: USAGE ADD-ONS */}
        <div className="max-w-4xl mx-auto mt-20 border-t border-gray-200 pt-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Need more usage?</h3>
            <p className="text-gray-600">Buy credits to extend usage on your Free or paid plan. No subscription required.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900 mb-2">Extend your usage</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  1 credit = 1,000 words processed
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Credits never expire
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Applies to features on your current plan
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
              <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <div className="text-sm font-semibold text-gray-500 mb-1">Trial</div>
                <div className="text-xl font-bold text-gray-900">$1.99</div>
                <div className="text-xs text-gray-400">5 Credits</div>
              </div>
              <div className="border border-purple-200 bg-purple-50 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                <div className="text-sm font-semibold text-purple-700 mb-1">Standard</div>
                <div className="text-xl font-bold text-gray-900">$6.99</div>
                <div className="text-xs text-purple-600 font-medium">25 Credits</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <div className="text-xs font-semibold text-gray-500 mb-1">Power</div>
                <div className="text-xl font-bold text-gray-900">$12.99</div>
                <div className="text-xs text-gray-400">50 Credits</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <Button
                onClick={() => handleSelectPlan("credits")}
                variant="secondary"
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold px-8"
              >
                Buy Credits
              </Button>
              <span className="text-[10px] text-gray-400 max-w-[150px] text-center leading-tight">
                Credits extend usage limits, not plan features.
              </span>
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
                  <td className="py-4 px-4 text-center text-gray-900">
                    25/month
                  </td>
                  <td className="py-4 px-4 text-center text-gray-900">
                    100/month
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
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Institution-grade
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
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    Priority Scanning
                  </td>
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
                  <td className="py-4 px-4 text-center text-gray-900">
                    Priority
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    Max Scan Size
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">
                    20k chars
                  </td>
                  <td className="py-4 px-4 text-center text-gray-900">
                    80k chars
                  </td>
                  <td className="py-4 px-4 text-center text-gray-900">
                    200k chars
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    Rephrase Suggestions
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">
                    3/month
                  </td>
                  <td className="py-4 px-4 text-center text-gray-900">
                    25/month
                  </td>
                  <td className="py-4 px-4 text-center text-gray-900">
                    100/month
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    Research Gaps & Insights
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center text-gray-600">-</td>
                  <td className="py-4 px-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    Safe AI Integrity Assistant
                  </td>
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
