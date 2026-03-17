import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Check } from "lucide-react";
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
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "yearly",
  );
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
          else if (plan && typeof plan === "object" && "id" in plan)
            planId = (plan as any).id;

          setCurrentPlanId(planId || "free");
        } catch (error) {
          console.error("Failed to fetch subscription", error);
        }
      }
    };
    fetchSubscription();
  }, [user]);

  const handleSelectPlan = useCallback(
    async (planId: string) => {
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
          localStorage.setItem(
            "intended_action",
            JSON.stringify({ type: "credits", action: "/purchase-credits" }),
          );
          toast({
            title: "Login Required",
            description: "Please login to purchase credits",
          });
          navigate("/login");
          return;
        }
        navigate("/purchase-credits");
        return;
      }

      // 3. Handle Paid Subscriptions
      if (!user) {
        localStorage.setItem(
          "intended_subscription",
          JSON.stringify({ planId, billingPeriod }),
        );
        toast({
          title: "Login Required",
          description: "Please login to subscribe",
        });
        navigate("/login");
        return;
      }

      // Strict Upgrade Guard
      const canUpgrade =
        subscriptionId === null ||
        currentPlanId === "free" ||
        (currentPlanId !== planId && planId === "premium");

      if (!canUpgrade) {
        toast({
          title: "Active Subscription Found",
          description:
            "You already have an active subscription. Manage it from your dashboard.",
          variant: "destructive",
        });
        navigate("/dashboard/billing");
        return;
      }

      try {
        setCheckoutLoading(planId);
        const checkoutUrl = await SubscriptionService.createCheckout(
          planId,
          billingPeriod,
          true,
        );
        window.location.href = checkoutUrl;
      } catch (error) {
        console.error("Checkout error:", error);
        toast({
          title: "Checkout Error",
          description: "Failed to create checkout session.",
          variant: "destructive",
        });
        setCheckoutLoading(null);
      }
    },
    [billingPeriod, navigate, toast, currentPlanId, user, subscriptionId],
  );

  // Pricing Constants
  const PLUS_PRICE = billingPeriod === "yearly" ? 57.5 : 5.99;
  const PREMIUM_PRICE = billingPeriod === "yearly" ? 124.7 : 12.99;

  const PriceDisplay = ({ price }: { price: number }) => {
    const isYearly = billingPeriod === "yearly";
    const mainPrice = isYearly ? (price / 12).toFixed(2) : price;
    const subPrice = isYearly ? `$${price}/year billed annually` : null;

    return (
      <div className="flex flex-col items-center">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-gray-900">${mainPrice}</span>
          <span className="text-gray-500 font-medium">
            {isYearly ? "/mo effective" : "/mo"}
          </span>
        </div>
        {subPrice && (
          <div className="text-sm text-gray-500 mt-2 font-medium">
            {subPrice}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        {/* Billing Toggle */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex items-center bg-white rounded-full p-1 border border-gray-200 shadow-sm">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === "monthly"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}>
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative ${
                billingPeriod === "yearly"
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}>
              Yearly
              <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* SECTION 1: SUBSCRIPTION PLANS */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-24">
          {[
            {
              id: "free",
              name: "Free",
              subtitle: "Citation Preview",
              price: "$0",
              billingText: "Forever free",
              included: [
                "1 Team Workspace",
                "2 Collaborators per workspace",
                "3 rephrases / mo (1 variant)",
                "Preview certificate (watermarked)",
              ],
              locked: [
                "Chat with PDF & My Projects",
                "Full citation analysis",
                "Large academic papers",
              ],
              buttonText: "Start Free",
              buttonVariant: "outline" as const,
              footer: "Preview only. Upgrade for full access.",
            },
            {
              id: "plus",
              name: "Plus",
              subtitle: "Enhanced productivity for every user",
              price: PLUS_PRICE,
              popular: true,
              included: [
                "Chat with PDF",
                "5 Team Workspaces",
                "10 Collaborators per workspace",
                "25 rephrases (up to 3 variants)",
                "File Size Limit: 50MB",
                "Unlimited Chats with PDFs",
                "Citation confidence analysis",
              ],
              locked: [
                "Chat with My Projects",
                "Draft comparison",
                "Advanced analytics",
              ],
              buttonText:
                checkoutLoading === "plus"
                  ? "Processing..."
                  : "Upgrade to Plus",
              accentColor: "green",
              className:
                "border-green-500 border-2 shadow-xl transform lg:-translate-y-4",
            },
            {
              id: "premium",
              name: "Premium",
              subtitle: "Institutional-grade institutional power",
              price: PREMIUM_PRICE,
              included: [
                "Advanced analytics",
                {
                  text: "100 citation audits / month",
                  subtext: "(Max 200,000 chars/doc)",
                },
                "Chat with My Projects",
                "Unlimited Chats with My Projects",
                "Advanced Research",
                "Insight Map & Research Gaps",
                "Search Alerts",
              ],
              note: "Designed for rigorous academic standards and frequent analysis.",
              buttonText:
                checkoutLoading === "premium"
                  ? "Processing..."
                  : "Upgrade to Premium",
              accentColor: "blue",
              className: "border-blue-200 ring-1 ring-blue-100/50",
            },
          ].map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl p-8 flex flex-col relative border ${plan.className || "border-gray-200"}`}>
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p
                  className={`${
                    plan.accentColor === "green"
                      ? "text-green-600"
                      : plan.accentColor === "blue"
                        ? "text-blue-600"
                        : "text-gray-500"
                  } font-medium text-sm h-5`}>
                  {plan.subtitle}
                </p>
              </div>

              <div className="mb-8 text-center pt-4 border-t border-gray-100">
                {typeof plan.price === "string" ? (
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                ) : (
                  <PriceDisplay price={plan.price as number} />
                )}
                {plan.billingText && (
                  <p className="text-xs text-gray-400 mt-2 text-center w-full">
                    {plan.billingText}
                  </p>
                )}
              </div>

              <div className="space-y-4 flex-1 mb-8">
                <p className="font-semibold text-sm text-gray-900 uppercase tracking-wide">
                  {plan.id === "free"
                    ? "Included:"
                    : plan.id === "plus"
                      ? "Everything in Free, plus:"
                      : "Everything in Plus, plus:"}
                </p>
                <ul className="space-y-3 text-sm">
                  {plan.included.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check
                        className={`h-5 w-5 shrink-0 ${
                          plan.accentColor === "green"
                            ? "text-green-500"
                            : plan.accentColor === "blue"
                              ? "text-blue-600"
                              : "text-gray-400"
                        }`}
                      />
                      <div className="flex flex-col">
                        <span
                          className={`${
                            plan.id === "free"
                              ? "text-gray-600"
                              : "text-gray-700"
                          } ${plan.id === "plus" ? "font-medium" : ""}`}>
                          {typeof feature === "string" ? feature : feature.text}
                        </span>
                        {typeof feature === "object" && feature.subtext && (
                          <span className="text-xs text-gray-400 mt-1">
                            {feature.subtext}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {plan.locked && (
                  <div className="pt-4 border-t border-gray-50">
                    <p className="font-semibold text-sm text-gray-400 uppercase tracking-wide mb-3">
                      Locked:
                    </p>
                    <ul
                      className={`space-y-3 text-sm ${
                        plan.id === "free" ? "opacity-60" : "opacity-75"
                      }`}>
                      {plan.locked.map((lock, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="h-5 w-5 flex items-center justify-center bg-gray-100 rounded-full shrink-0">
                            <span className="text-xs">🔒</span>
                          </span>
                          <span className="text-gray-500">{lock}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {plan.note && (
                  <div className="pt-4 mt-6 bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                    <p className="text-xs text-blue-800 font-medium text-center">
                      {plan.note}
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                variant={plan.buttonVariant || "default"}
                className={`w-full font-semibold py-6 ${
                  plan.id === "free"
                    ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                    : plan.id === "plus"
                      ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-200 transition-all"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}>
                {plan.buttonText}
              </Button>
              {plan.footer && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  {plan.footer}
                </p>
              )}
            </div>
          ))}
        </div>

        {/*
        <div className="max-w-4xl mx-auto mt-20 border-t border-gray-200 pt-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Need more usage?
            </h3>
            <p className="text-gray-600">
              Buy credits to extend usage on your Free or paid plan. No
              subscription required.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Extend your usage
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />1 credit = 1,000
                  words processed
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
              {[
                { name: "Trial", price: "$1.99", credits: "5 Credits" },
                {
                  name: "Standard",
                  price: "$6.99",
                  credits: "25 Credits",
                  accent: true,
                  className:
                    "border-purple-200 bg-purple-50 hover:border-purple-400",
                },
                { name: "Power", price: "$12.99", credits: "50 Credits" },
              ].map((pack, idx) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 text-center transition-colors ${
                    pack.className || "border-gray-200 hover:border-gray-400"
                  }`}>
                  <div
                    className={`text-sm font-semibold mb-1 ${
                      pack.accent ? "text-purple-700" : "text-gray-500"
                    }`}>
                    {pack.name}
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {pack.price}
                  </div>
                  <div
                    className={`text-xs ${
                      pack.accent
                        ? "text-purple-600 font-medium"
                        : "text-gray-400"
                    }`}>
                    {pack.credits}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-3">
              <Button
                onClick={() => handleSelectPlan("credits")}
                variant="secondary"
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold px-8">
                Buy Credits
              </Button>
              <span className="text-[10px] text-gray-400 max-w-[150px] text-center leading-tight">
                Credits extend usage limits, not plan features.
              </span>
            </div>
          </div>
        </div>*/}

        {/* Comparison Table - Hidden on Mobile */}
        <div className="mt-24 hidden md:block">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Plan Comparison
          </h2>
          <div>
            <table className="w-full border-separate border-spacing-0">
              <thead className="z-40">
                <tr className="bg-white">
                  <th className="sticky top-[64px] bg-white text-left py-4 px-4 font-semibold text-gray-900 border-b border-gray-300 z-40 shadow-sm">
                    Feature
                  </th>
                  <th className="sticky top-[64px] bg-white text-center py-4 px-4 font-semibold text-gray-900 border-b border-gray-300 z-40 shadow-sm">
                    Free
                  </th>
                  <th className="sticky top-[64px] bg-white text-center py-4 px-4 font-semibold text-gray-900 border-b border-gray-300 z-40 shadow-sm">
                    Plus
                  </th>
                  <th className="sticky top-[64px] bg-white text-center py-4 px-4 font-semibold text-gray-900 border-b border-gray-300 z-40 shadow-sm">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { isHeader: true, name: "Collaboration & Teamwork" },
                  {
                    name: "Team Workspaces",
                    free: "1 Workspace",
                    plus: "5 Workspaces",
                    premium: "Unlimited",
                  },
                  {
                    name: "Collaborators per workspace",
                    free: "2 Collaborators",
                    plus: "10 Collaborators",
                    premium: "Unlimited",
                  },
                  {
                    name: "Templates",
                    free: true,
                    plus: true,
                    premium: true,
                  },
                  {
                    name: "Kanban",
                    free: true,
                    plus: true,
                    premium: true,
                  },
                  {
                    name: "Calendar View",
                    free: true,
                    plus: true,
                    premium: true,
                  },
                  {
                    name: "File Sharing",
                    free: true,
                    plus: true,
                    premium: true,
                  },
                  {
                    name: "File Attachments",
                    free: "5 Attachments",
                    plus: "50 Attachments",
                    premium: "Unlimited",
                  },
                  {
                    name: "Analytics",
                    free: true,
                    plus: true,
                    premium: true,
                  },
                  {
                    name: "Team Chat",
                    free: true,
                    plus: true,
                    premium: true,
                  },
                  {
                    name: "PDF Annotator",
                    free: true,
                    plus: true,
                    premium: true,
                  },
                  {
                    name: "Version History",
                    free: "-",
                    plus: true,
                    premium: true,
                  },
                  {
                    name: "Collaboration Logs",
                    free: "-",
                    plus: true,
                    premium: true,
                  },
                  {
                    name: "Draft Comparison",
                    free: "-",
                    plus: "-",
                    premium: true,
                  },
                  { isHeader: true, name: "Uploads" },
                  {
                    name: "File Size Limit",
                    free: "5MB",
                    plus: "50MB",
                    premium: "100MB",
                  },
                  {
                    name: "Chat with PDFs",
                    free: "❌",
                    plus: "10 pdfs",
                    premium: "30 pdfs",
                  },
                  { isHeader: true, name: "Integrity & AI Assistant" },
                  {
                    name: "Safe AI Integrity Assistant",
                    free: true,
                    plus: true,
                    premium: true,
                  },
                  {
                    name: "Chat with PDF",
                    free: "-",
                    plus: true,
                    premium: true,
                  },
                  {
                    name: "Chat with My Projects",
                    free: "-",
                    plus: "-",
                    premium: true,
                  },
                  { isHeader: true, name: "Citations Audit" },
                  {
                    name: "Document Scans",
                    free: "3/month",
                    plus: "25/month",
                    premium: "100/month",
                  },
                  {
                    name: "Max Scan Size",
                    free: "20k chars",
                    plus: "80k chars",
                    premium: "200k chars",
                  },
                  {
                    name: "Rephrase Suggestions",
                    free: "3/month",
                    plus: "25/month",
                    premium: "100/month",
                  },
                  { isHeader: true, name: "Advanced Research" },
                  {
                    name: "Insight Map",
                    free: "-",
                    plus: true,
                    premium: true,
                  },
                  {
                    name: "Advanced Citation Suggestions",
                    free: "-",
                    plus: true,
                    premium: true,
                  },
                  {
                    name: "Research Gaps",
                    free: "-",
                    plus: "-",
                    premium: true,
                  },
                  {
                    name: "Search Alerts",
                    free: "-",
                    plus: "-",
                    premium: true,
                  },
                  {
                    name: "Advanced Analytics",
                    free: "-",
                    plus: "-",
                    premium: true,
                  },
                  { isHeader: true, name: "Certificates & Export" },
                  {
                    name: "Certificate Generation",
                    free: { label: "Watermarked", color: "gray" },
                    plus: { label: "Professional", color: "green" },
                    premium: { label: "Institution-grade", color: "blue" },
                  },
                  {
                    name: "Export Formats",
                    free: "-",
                    plus: true,
                    premium: true,
                  },
                  { isHeader: true, name: "Support & Processing" },
                  {
                    name: "Support",
                    free: "Basic",
                    plus: "Email",
                    premium: "Priority",
                  },
                  {
                    name: "Priority Scanning",
                    free: "-",
                    plus: "-",
                    premium: true,
                  },
                ].map((feature, idx) =>
                  feature.isHeader ? (
                    <tr key={idx}>
                      <td
                        colSpan={4}
                        className="sticky top-[121px] bg-white/95 backdrop-blur-sm py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest z-30 border-b border-gray-100">
                        {feature.name}
                      </td>
                    </tr>
                  ) : (
                    <tr key={idx}>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {feature.name}
                      </td>
                      {[feature.free, feature.plus, feature.premium].map(
                        (val, i) => (
                          <td key={i} className="py-4 px-4 text-center">
                            {val === true ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : val === "-" ? (
                              <span className="text-gray-600">-</span>
                            ) : typeof val === "object" ? (
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  val.color === "gray"
                                    ? "bg-gray-200 text-gray-700"
                                    : val.color === "green"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-blue-100 text-blue-800"
                                }`}>
                                {val.label}
                              </span>
                            ) : (
                              <span className="text-gray-900">{val}</span>
                            )}
                          </td>
                        ),
                      )}
                    </tr>
                  ),
                )}
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
                className="flex items-center">
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
