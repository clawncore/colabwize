import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Loader2,
  AlertCircle,
  FileText,
  ArrowRight,
  Coins,
  Check,

  Wallet,
  CalendarCheck,

  Zap,
  Activity,
  HeartHandshake
} from "lucide-react";
import {
  PaymentMethod,
  Invoice,
  Subscription,
  SubscriptionService,
} from "../../services/subscriptionService";
import { toast } from "../../hooks/use-toast";
import { useNavigate } from "react-router-dom";

import { CreditUsageHistory } from "./CreditUsageHistory"; // Import the new component
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch"; // Assuming we have shadcn switch

const BillingSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const statusParam = searchParams.get('status');
  const [plans, setPlans] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [limits, setLimits] = useState<any>({});
  const [usage, setUsage] = useState<any>({});
  const [totalDocuments, setTotalDocuments] = useState<number>(0);

  // NEW STATE
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [autoUseCredits, setAutoUseCredits] = useState<boolean>(true);
  const [creditHistory, setCreditHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation Wizard State
  const [cancelStep, setCancelStep] = useState<'start' | 'survey' | 'confirm'>('start');
  const [surveyReason, setSurveyReason] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (isMounted) setLoading(true);

        const [subscriptionData, paymentMethodsData, plansData] =
          await Promise.all([
            SubscriptionService.getCurrentSubscription().catch((err) => {
              console.error("Error fetching subscription data:", err);
              return null;
            }),
            SubscriptionService.getPaymentMethods().catch((err) => {
              console.error("Error fetching payment methods:", err);
              return [];
            }),
            SubscriptionService.getPlans().catch((err) => {
              console.error("Error fetching plans:", err);
              return [];
            }),
          ]);

        if (isMounted) {
          if (subscriptionData) {
            setSubscription(subscriptionData.subscription);
            setLimits(subscriptionData.limits || {});
            setUsage(subscriptionData.usage || {});
            setTotalDocuments((subscriptionData as any).totalDocuments || 0);

            // NEW STATE UPDATE
            setCreditBalance((subscriptionData as any).creditBalance || 0);
            setAutoUseCredits((subscriptionData as any).autoUseCredits ?? true);
          }
          setPaymentMethods(paymentMethodsData);
          setPlans(plansData || []);
        }
      } catch (err: any) {
        console.error("Error fetching billing data:", err);
        if (isMounted) {
          setError(err.message || "Failed to load billing data");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const fetchInvoices = async () => {
      try {
        setInvoicesLoading(true);
        setInvoicesError(null);
        const data = await SubscriptionService.getBillingHistory();
        if (isMounted) setInvoices(data);
      } catch (err) {
        console.error("Error fetching invoices:", err);
        if (isMounted) setInvoicesError("We couldn’t load your invoices right now. Please try again.");
      } finally {
        if (isMounted) setInvoicesLoading(false);
      }
    };

    // NEW FETCH: Credit History
    const fetchCreditHistory = async () => {
      try {
        setHistoryLoading(true);
        const history = await SubscriptionService.getCreditHistory();
        if (isMounted) setCreditHistory(history);
      } catch (err) {
        console.error("Error fetching credit history", err);
      } finally {
        if (isMounted) setHistoryLoading(false);
      }
    };

    fetchData();
    fetchInvoices();
    fetchCreditHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  // FRONTEND RECONCILIATION: Handle return from Lemon Squeezy Portal
  useEffect(() => {
    if (statusParam) {
      if (statusParam === 'updated') {
        toast({
          title: "Processing Update",
          description: "Verifying your payment method changes...",
          variant: "default",
        });
        // Re-fetch data immediately
        setTimeout(() => {
          // In a real app, you might want to force a harder refresh or wait a bit for webhook
          window.location.href = window.location.pathname; // Clean URL and refresh
        }, 1000);
      } else if (statusParam === 'cancelled') {
        toast({
          title: "No Changes",
          description: "No changes were made to your payment method.",
          variant: "default", // Neutral
        });
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [statusParam]);

  const handleAddPaymentMethod = async () => {
    try {
      const result = await SubscriptionService.updatePaymentMethod();
      if (result.success && result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to initiate payment method update",
        variant: "destructive",
      });
    }
  };

  const currentPlanId = typeof subscription?.plan === 'string' ? subscription.plan : subscription?.plan?.id;
  // If no subscription, default to free. If subscription exists but plan not found in list, still use subscription.plan (if object) or fallback.
  // Actually, backend returns plan as string.
  const currentPlan = plans.find(p => p.id === currentPlanId) ||
    (plans.find(p => p.id === 'free') || { name: 'Free Plan', price: 0, id: 'free' });

  const handleViewAllInvoices = async () => {
    try {
      const result = await SubscriptionService.getCustomerPortalUrl();
      if (result.success && result.portalUrl) {
        window.location.href = result.portalUrl;
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Could not open billing portal",
        variant: "destructive",
      });
    }
  };







  const handleToggleAutoUse = async (checked: boolean) => {
    try {
      // Optimistic Update
      setAutoUseCredits(checked);

      const success = await SubscriptionService.updateAutoUseCredits(checked);
      if (!success) {
        setAutoUseCredits(!checked); // Revert
        toast({ title: "Error", description: "Failed to update preference", variant: "destructive" });
      } else {
        toast({
          title: checked ? "Auto-Use Enabled" : "Auto-Use Disabled",
          description: checked
            ? "Credits will be used automatically when plan limits are reached."
            : "You will be asked for confirmation before using credits."
        });
      }
    } catch (err) {
      setAutoUseCredits(!checked);
      toast({ title: "Error", description: "Failed to update preference", variant: "destructive" });
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const result = await SubscriptionService.cancelSubscription(
        surveyReason || "User requested cancellation via wizard"
      );
      if (result.success) {
        const subscriptionResponse = await SubscriptionService.getCurrentSubscription();
        setSubscription(subscriptionResponse.subscription || null);
        toast({
          title: "Success",
          description: "Subscription cancelled successfully!",
        });
        // Reset step or navigate away
        setCancelStep('start');
      } else {
        throw new Error(result.message || "Failed to cancel subscription");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  };

  const getCardIcon = (type: string) => {
    // You can replace these with actual SVG components or images for better visuals
    switch (type) {
      case "visa": return "💳";
      case "mastercard": return "💳";
      case "amex": return "💳";
      case "paypal": return "🅿️";
      default: return "💳";
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-gray-100 text-gray-800 border-gray-200",
      unknown: "bg-gray-100 text-gray-800 border-gray-200"
    };
    const style = styles[status as keyof typeof styles] || styles.unknown;

    return (
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${style} capitalize`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-500 font-medium">Loading your billing details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-semibold text-lg">Unable to load billing info</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-colors">
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const nextBillingDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : null;



  return (
    <div className="w-full px-8 py-8 bg-white min-h-screen">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Billing & Subscription</h1>
          <p className="text-gray-500 mt-1 text-base">
            Manage your plan, track usage, and billing settings.
          </p>
        </div>

        {/* 2️⃣ SUMMARY CARDS (Documents / Cost / Payment Due) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Documents Processed</p>
              <div className="text-2xl font-bold text-gray-900 font-mono">{totalDocuments}</div>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <FileText className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: Estimated Cost */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Estimated Cost</p>
              <div className="text-2xl font-bold text-gray-900 font-mono">$0.00</div>
              <p className="text-[10px] text-gray-400 mt-1">Updates daily</p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-full">
              <Wallet className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Payment Due */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Next Payment</p>
              <div className="text-lg font-bold text-gray-900">
                {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'No payment due'}
              </div>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-transparent dark:bg-transparent gap-3 w-full justify-start rounded-none p-0 h-auto space-x-6 border-b-0 border-none">
            <TabsTrigger
              value="overview"
              className="px-1 py-3 bg-transparent border-none data-[state=active]:text-blue-600 rounded-none shadow-none font-medium text-sm text-gray-500 hover:text-gray-700 data-[state=active]:bg-transparent transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="px-1 py-3 bg-transparent border-none data-[state=active]:text-blue-600 rounded-none shadow-none font-medium text-sm text-gray-500 hover:text-gray-700 data-[state=active]:bg-transparent transition-all"
            >
              Billing Info
            </TabsTrigger>
            <TabsTrigger
              value="cancel"
              className="px-1 py-3 bg-transparent border-none data-[state=active]:text-red-600 rounded-none shadow-none font-medium text-sm text-gray-500 hover:text-red-600 data-[state=active]:bg-transparent transition-all"
            >
              Cancel Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* PANEL 1 & 2: PLAN & METERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PANEL 1: CURRENT PLAN & FEATURES */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Plan</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-bold text-gray-900 capitalize tracking-tight">
                            {currentPlan?.name || "Free Plan"}
                          </span>
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${subscription?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {subscription?.status || 'Active'}
                          </span>
                        </div>
                        {/* NEW: Action Buttons */}
                        <div className="flex items-center gap-3 mt-4">
                          <button
                            onClick={handleViewAllInvoices} // Reuse portal link
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-md px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                          >
                            Manage Subscription
                          </button>
                          <button
                            onClick={handleAddPaymentMethod}
                            className="text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md px-3 py-1.5 bg-white hover:bg-gray-50 transition-colors"
                          >
                            Update Payment
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {currentPlan?.price ? `$${currentPlan.price}` : 'Free'}
                          <span className="text-sm text-gray-400 font-normal">/{currentPlan?.interval || 'mo'}</span>
                        </div>
                      </div>
                    </div>

                    {/* 4️⃣ FREE FEATURES SIDEBAR (Re-integrated) */}
                    <div className="pt-6 border-t border-gray-100">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Zap className="h-3 w-3 text-indigo-500" />
                        Plan Features
                      </h4>

                      <div className="space-y-4">
                        {/* Group: Limits */}
                        <div>
                          <p className="text-[10px] uppercase text-gray-400 font-semibold mb-2">Daily Limits</p>
                          <ul className="space-y-2">
                            <li className="flex items-center text-sm text-gray-600">
                              <Check className="h-3.5 w-3.5 text-green-500 mr-2 flex-shrink-0" />
                              <span>{limits.scans_per_month || 3} document scans / mo</span>
                            </li>
                            <li className="flex items-center text-sm text-gray-600">
                              <Check className="h-3.5 w-3.5 text-green-500 mr-2 flex-shrink-0" />
                              <span>{limits.rephrases_per_month || 3} rephrases / mo</span>
                            </li>
                          </ul>
                        </div>

                        {/* Group: Capabilities */}
                        <div>
                          <p className="text-[10px] uppercase text-gray-400 font-semibold mb-2"> capabilities</p>
                          <ul className="space-y-2">
                            <li className="flex items-center text-sm text-gray-600">
                              <Check className="h-3.5 w-3.5 text-green-500 mr-2 flex-shrink-0" />
                              <span>Basic Originality Check</span>
                            </li>
                            <li className="flex items-center text-sm text-gray-600">
                              <Check className="h-3.5 w-3.5 text-green-500 mr-2 flex-shrink-0" />
                              <span>Max 100,000 characters</span>
                            </li>
                          </ul>
                        </div>

                        {/* Group: Certificates */}
                        <div>
                          <p className="text-[10px] uppercase text-gray-400 font-semibold mb-2">Certificates</p>
                          <ul className="space-y-2">
                            <li className="flex items-center text-sm text-gray-600">
                              <Check className="h-3.5 w-3.5 text-green-500 mr-2 flex-shrink-0" />
                              <span>Watermarked Verification</span>
                            </li>
                            <li className="flex items-center text-sm text-gray-600">
                              <Check className="h-3.5 w-3.5 text-green-500 mr-2 flex-shrink-0" />
                              <span>7-day retention</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/pricing?upgrade=true')}
                    className="w-full mt-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm shadow-sm"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>

              {/* PANEL 2: MONTHLY USAGE METERS (Strictly excluding credits) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-fit">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <Activity className="h-4 w-4 text-indigo-500" />
                    Monthly Plan Usage
                  </h3>
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                    Resets {usage.periodEnd ? new Date(usage.periodEnd).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'Monthly'}
                  </span>
                </div>

                <div className="space-y-8">
                  {/* Scans Meter */}
                  <div>
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-sm font-medium text-gray-700">Citation Audits</span>
                      <div className="text-right">
                        <span className={`text-lg font-bold font-mono ${(limits.scans_per_month !== -1 && (usage.scans || 0) >= (limits.scans_per_month || 1)) ? 'text-red-600' : 'text-gray-900'}`}>
                          {usage.scans || 0}
                        </span>
                        <span className="text-gray-400 text-sm font-mono mx-1">/</span>
                        <span className="text-gray-400 text-sm font-mono">
                          {(!limits.scans_per_month || limits.scans_per_month === -1) ? '∞' : limits.scans_per_month}
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${(limits.scans_per_month !== -1 && (usage.scans || 0) >= limits.scans_per_month)
                          ? 'bg-red-500' // Exceeded
                          : (limits.scans_per_month !== -1 && (usage.scans || 0) / limits.scans_per_month > 0.8)
                            ? 'bg-amber-400' // Near limit
                            : 'bg-green-500' // Normal or Infinite
                          }`}
                        style={{ width: `${limits.scans_per_month === -1 ? 100 : Math.min(100, ((usage.scans || 0) / (limits.scans_per_month || 1)) * 100)}%` }}
                      />
                    </div>
                    {(limits.scans_per_month !== -1 && (usage.scans || 0) >= limits.scans_per_month) && (
                      <div className="mt-2 flex items-center text-xs text-red-600 font-medium animate-pulse">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Limit reached. Use credits to continue.
                      </div>
                    )}
                  </div>

                  {/* Rephrases Meter */}
                  <div>
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-sm font-medium text-gray-700">Rephrases</span>
                      <div className="text-right">
                        <span className={`text-lg font-bold font-mono ${(limits.rephrases_per_month !== -1 && (usage.rephrases || 0) >= (limits.rephrases_per_month || 1)) ? 'text-red-600' : 'text-gray-900'}`}>
                          {usage.rephrases || 0}
                        </span>
                        <span className="text-gray-400 text-sm font-mono mx-1">/</span>
                        <span className="text-gray-400 text-sm font-mono">
                          {(!limits.rephrases_per_month || limits.rephrases_per_month === -1) ? '∞' : limits.rephrases_per_month}
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${(limits.rephrases_per_month !== -1 && (usage.rephrases || 0) >= limits.rephrases_per_month)
                          ? 'bg-red-500'
                          : (limits.rephrases_per_month !== -1 && (usage.rephrases || 0) / limits.rephrases_per_month > 0.8)
                            ? 'bg-amber-400'
                            : 'bg-purple-500'
                          }`}
                        style={{ width: `${limits.rephrases_per_month === -1 ? 100 : Math.min(100, ((usage.rephrases || 0) / (limits.rephrases_per_month || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 3: CREDITS BALANCE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                    <Coins className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Credits Balance</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-bold text-gray-900">{creditBalance}</span>
                      <span className="text-sm text-gray-500">credits available</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">~{creditBalance * 1000} words capacity</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Auto-Use Toggle */}
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <Switch
                      checked={autoUseCredits}
                      onCheckedChange={handleToggleAutoUse}
                      className="data-[state=checked]:bg-green-600"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Auto-Use Credits</div>
                      <div className="text-xs text-gray-500">When plan limits reached</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/purchase-credits')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Buy Credits
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById('credit-history');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      View Usage
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* PANEL 4: CREDIT USAGE HISTORY */}
            <div id="credit-history">
              {historyLoading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <CreditUsageHistory transactions={creditHistory} />
              )}
            </div>

          </TabsContent>

          {/* BILLING INFO TAB */}
          <TabsContent value="billing">
            <div className="space-y-8">
              {/* Credit Settings (Moved Here) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Coins className="h-5 w-5 text-gray-500" />
                    Credit Settings
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-medium text-gray-900">Auto-Use Credits</h4>
                      <p className="text-sm text-gray-500 mt-1">Automatically use credits when your monthly plan limits are reached.</p>
                    </div>
                    <Switch
                      checked={autoUseCredits}
                      onCheckedChange={handleToggleAutoUse}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-gray-500" />
                      Payment Methods
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Your payment details are securely stored and processed by Lemon Squeezy. We never store card information.
                  </p>
                </div>

                <div className="p-6">
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <p className="mb-4">No payment method on file.</p>
                      <button onClick={handleAddPaymentMethod} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                        + Add Payment Method
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paymentMethods.map((method, index) => (
                        <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-50 rounded-md border border-gray-100 text-2xl">
                              {getCardIcon(method.type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 capitalize">
                                  {method.type} •••• {method.lastFour}
                                </span>
                                {(index === 0 || method.isDefault) && (
                                  <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-600 font-medium px-1.5 py-0">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 mt-0.5">
                                Expires {method.expiryMonth}/{method.expiryYear}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleAddPaymentMethod()} // Using same handler since it goes to portal
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline px-2 py-1"
                            >
                              Update
                            </button>
                            {/* Remove button would go here if API supported direct removal, currently handled via portal */}
                          </div>
                        </div>
                      ))}

                      <div className="pt-2">
                        <button onClick={handleAddPaymentMethod} className="text-sm font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1">
                          + Add another card
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>



              {/* Invoice History */}
              {/* Invoice History */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    Invoice History
                  </h3>
                  {invoices.length > 0 && !invoicesLoading && (
                    <button onClick={handleViewAllInvoices} className="text-sm font-semibold text-gray-500 hover:text-gray-700">
                      View All
                    </button>
                  )}
                </div>

                <div className="w-full">
                  {invoicesLoading ? (
                    <div className="p-6 space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between items-center animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 rounded w-32 hidden md:block"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                      ))}
                    </div>
                  ) : invoicesError ? (
                    <div className="p-8 text-center">
                      <div className="text-red-500 mb-2">
                        <AlertCircle className="h-8 w-8 mx-auto" />
                      </div>
                      <p className="text-gray-900 font-medium mb-1">{invoicesError}</p>
                      <button
                        onClick={() => {
                          const fetchInvoices = async () => {
                            try {
                              setInvoicesLoading(true);
                              setInvoicesError(null);
                              const data = await SubscriptionService.getBillingHistory();
                              setInvoices(data);
                            } catch (err) {
                              setInvoicesError("We couldn’t load your invoices right now.");
                            } finally {
                              setInvoicesLoading(false);
                            }
                          };
                          fetchInvoices();
                        }}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm mt-2"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="text-center py-12 px-6">
                      <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>
                      <h4 className="text-gray-900 font-medium mb-1">No invoices yet</h4>
                      <p className="text-gray-500 text-sm">
                        Invoices will appear here once your first payment is processed.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                              <th className="px-6 py-3 font-medium text-gray-500">Date</th>
                              <th className="px-6 py-3 font-medium text-gray-500">Invoice</th>
                              <th className="px-6 py-3 font-medium text-gray-500">Amount</th>
                              <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                              <th className="px-6 py-3 font-medium text-gray-500 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {invoices.map((inv) => (
                              <tr key={inv.invoice_id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-gray-700 font-medium whitespace-nowrap">
                                  {new Date(inv.issued_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                                </td>
                                <td className="px-6 py-4 text-gray-500 font-mono text-xs uppercase">
                                  {inv.invoice_id.substring(0, 8)}...
                                </td>
                                <td className="px-6 py-4 font-semibold text-gray-900">
                                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: inv.currency || 'USD' }).format(inv.amount)}
                                </td>
                                <td className="px-6 py-4">
                                  {getStatusBadge(inv.status)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-3 text-xs font-medium">
                                    {inv.hosted_invoice_url && (
                                      <a
                                        href={inv.hosted_invoice_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-800 hover:underline"
                                      >
                                        View
                                      </a>
                                    )}
                                    {inv.pdf_url && (
                                      <a
                                        href={inv.pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-500 hover:text-gray-700 hover:underline"
                                      >
                                        PDF
                                      </a>
                                    )}
                                    {!inv.hosted_invoice_url && !inv.pdf_url && (
                                      <span className="text-gray-400">Unavailable</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="md:hidden divide-y divide-gray-100">
                        {invoices.map((inv) => (
                          <div key={inv.invoice_id} className="p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: inv.currency || 'USD' }).format(inv.amount)}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {new Date(inv.issued_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                                </div>
                              </div>
                              {getStatusBadge(inv.status)}
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <span className="text-xs font-mono text-gray-400 uppercase">
                                #{inv.invoice_id.substring(0, 8)}
                              </span>
                              <div className="flex gap-4">
                                {inv.hosted_invoice_url && (
                                  <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600">
                                    View
                                  </a>
                                )}
                                {inv.pdf_url && (
                                  <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-600">
                                    PDF
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* 3️⃣ "Find Your Invoices" Guidance (Safe Version) */}
                <div className="bg-gray-50 border-t border-gray-100 p-4 text-center">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-700">Looking for a receipt?</span> Billing confirmations and invoices are sent to your billing email after each successful payment.
                  </p>
                </div>
              </div>

              {/* Legal / Tax Note */}
              <div className="text-center pt-2 pb-6">
                <p className="text-xs text-gray-400">
                  Taxes are applied based on your billing location and local regulations.
                  <br />
                  Payment processing powered by Lemon Squeezy.
                </p>
              </div>

              {/* 4️⃣ Billing Policy & Help */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Refund Policy Summary */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Refund Policy</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    ColabWize operates on a non-refundable basis due to immediate access to digital services. We encourage users to review our policy before subscribing. Be assured, cancellation stops all future billing immediately.
                  </p>
                  <a href="/legal/refund-policy" target="_blank" className="text-blue-600 font-medium hover:underline text-sm flex items-center">
                    Read Full Refund Policy <FileText className="h-3 w-3 ml-1" />
                  </a>
                </div>

                {/* Need Help? */}
                <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Have a question about your invoice or subscription status? Visit our Help Center for instant answers.
                  </p>
                  <div className="flex flex-col gap-2">
                    <a href="/help" className="text-blue-600 font-medium hover:underline text-sm flex items-center">
                      Visit Help Center <ArrowRight className="h-3 w-3 ml-1" />
                    </a>
                    <span className="text-xs text-gray-400 mt-1">
                      For exceptional billing errors, please contact support from your billing email address.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* CANCEL SUBSCRIPTION TAB */}
          <TabsContent value="cancel">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
              {/* Step 1: Gratitude & Review (The Friendly Approach) */}
              {cancelStep === 'start' && (
                <div className="p-8 text-center space-y-8">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HeartHandshake className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Journey with ColabWize</h2>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">
                      We're sorry to see you consider cancelling. You've been doing great work, and we're proud to have supported your research.
                    </p>
                  </div>

                  {/* Impact Card */}
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-center gap-6 md:justify-around">
                    <div className="text-center">
                      <div className="text-3xl font-extrabold text-indigo-600 mb-1">{totalDocuments}</div>
                      <div className="text-sm text-indigo-900 font-medium opacity-80 uppercase tracking-wide">Documents Created</div>
                    </div>
                    <div className="hidden md:block w-px h-12 bg-blue-200"></div>
                    <div className="text-center">
                      <div className="text-3xl font-extrabold text-blue-600 mb-1">{creditBalance}</div>
                      <div className="text-sm text-blue-900 font-medium opacity-80 uppercase tracking-wide">Credits Available</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700 mt-1">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Did you know?</h4>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          You can <strong>pause</strong> your subscription instead of cancelling. This keeps your credits and documents safe until you're ready to write again.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse md:flex-row gap-4 justify-center pt-2">
                    <button
                      onClick={() => setCancelStep('survey')}
                      className="px-6 py-3 bg-transparent text-gray-400 font-medium hover:text-gray-600 transition-colors text-sm"
                    >
                      I still want to cancel
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 transform hover:-translate-y-0.5"
                    >
                      Keep My Subscription
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Survey */}
              {cancelStep === 'survey' && (
                <div className="p-8 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">We're sorry to see you go</h2>
                  <p className="text-gray-600">Please tell us why you are leaving so we can improve ColabWize.</p>

                  <div className="space-y-3">
                    {['Too expensive', 'Missing features', 'Found a better alternative', 'Technical issues', 'Other'].map((reason) => (
                      <label key={reason} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="cancelReason"
                          value={reason}
                          checked={surveyReason === reason}
                          onChange={(e) => setSurveyReason(e.target.value)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                        <span className="ml-3 text-gray-700 font-medium">{reason}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-6">
                    <button onClick={() => setCancelStep('start')} className="text-gray-500 hover:text-gray-700 font-medium">
                      Back
                    </button>
                    <button
                      disabled={!surveyReason}
                      onClick={() => setCancelStep('confirm')}
                      className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Final Confirm (Neutral & Respectful) */}
              {cancelStep === 'confirm' && (
                <div className="p-8 text-center space-y-6">
                  <div className="w-16 h-16 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mx-auto">
                    <CalendarCheck className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Confirm Cancellation</h2>

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 max-w-md mx-auto">
                    <p className="text-orange-800 text-sm font-medium">
                      Your access will remain active until <strong>{nextBillingDate?.toLocaleDateString()}</strong>.
                    </p>
                    <p className="text-orange-700 text-xs mt-1">
                      You will not be charged again after this date.
                    </p>
                  </div>

                  <p className="text-gray-500 max-w-md mx-auto text-sm">
                    We hope to see you again soon. Your documents will be saved in case you decide to return.
                  </p>

                  <div className="space-y-3 pt-2">
                    <button
                      onClick={handleCancelSubscription}
                      className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                      Confirm Cancellation
                    </button>

                    <button onClick={() => setCancelStep('start')} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium uppercase tracking-wide">
                      Wait, I changed my mind
                    </button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div >
  );
};

export default BillingSettingsPage;
