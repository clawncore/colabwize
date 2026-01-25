import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle,
  FileText,
  Zap,
  XCircle
} from "lucide-react";
import {
  PaymentMethod,
  Invoice,
  Subscription,
  SubscriptionService,
} from "../../services/subscriptionService";
import { toast } from "../../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { UsageChart } from "./UsageChart";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

const BillingSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [limits, setLimits] = useState<any>({});
  const [usage, setUsage] = useState<any>({});

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

        const [subscriptionData, invoicesData, paymentMethodsData, plansData] =
          await Promise.all([
            SubscriptionService.getCurrentSubscription().catch((err) => {
              console.error("Error fetching subscription data:", err);
              // Return mock data for testing if dev environment, otherwise null
              return null;
            }),
            SubscriptionService.getBillingHistory().catch((err) => {
              console.error("Error fetching billing history:", err);
              return [];
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
          }
          setInvoices(invoicesData);
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

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

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



  const handleChangePlan = async () => {
    navigate("/pricing");
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      const result = await SubscriptionService.updatePaymentMethod();
      if (result.success && result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update payment method",
        variant: "destructive",
      });
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

  const cycleStart = subscription?.current_period_start || '';
  const cycleEnd = subscription?.current_period_end || '';

  return (
    <div className="w-full px-8 py-8 bg-white min-h-screen">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Billing & Subscription</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Manage your plan, track usage, and billing settings.
          </p>
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

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <div className="grid gap-8">
              {/* Plan Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 flex items-center justify-between">
                  {/* Left Side: Plan Info */}
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${subscription?.status === 'active' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                      <Zap className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 capitalize">
                        {currentPlan?.name || "Free Plan"}
                      </h3>
                      <p className="text-gray-500">
                        {currentPlan?.price
                          ? `$${currentPlan.price}/${currentPlan.interval === 'year' ? 'yr' : 'mo'}`
                          : "Free Forever"}
                        {nextBillingDate && ` • Renews ${nextBillingDate.toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Change Plan Button (Hidden for Researcher) */}
                  {currentPlan?.id !== 'researcher' && (
                    <div className="flex gap-3">
                      <button onClick={handleChangePlan} className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                        Change Plan
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Usage Charts & Cycle Meter */}
              <UsageChart usage={usage} limits={limits} cycleStart={cycleStart} cycleEnd={cycleEnd} />
            </div>
          </TabsContent>

          {/* BILLING INFO TAB */}
          <TabsContent value="billing">
            <div className="space-y-8">
              {/* Payment Methods */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    Payment Methods
                  </h3>
                  <button onClick={handleAddPaymentMethod} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    + Add New
                  </button>
                </div>
                <div className="p-6">
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">No payment methods found.</div>
                  ) : (
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <span className="flex items-center gap-3">
                            <span className="text-2xl">{getCardIcon(method.type)}</span>
                            <span className="font-medium text-gray-700 capitalize">{method.type} •••• {method.lastFour}</span>
                          </span>
                          <button onClick={() => handleUpdatePaymentMethod()} className="text-gray-400 hover:text-gray-600"><Edit3 className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Invoices */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    Invoice History
                  </h3>
                  <button onClick={handleViewAllInvoices} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  {invoices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No invoices yet.</div>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 font-medium text-gray-500">Date</th>
                          <th className="px-6 py-4 font-medium text-gray-500">Amount</th>
                          <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                          <th className="px-6 py-4 font-medium text-gray-500 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4 text-gray-600">{new Date(inv.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 font-semibold text-gray-900">${inv.amount.toFixed(2)}</td>
                            <td className="px-6 py-4">{getStatusBadge(inv.status)}</td>
                            <td className="px-6 py-4 text-right">
                              {inv.receiptUrl && <a href={inv.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download</a>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* CANCEL SUBSCRIPTION TAB */}
          <TabsContent value="cancel">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
              {/* Step 1: Retention Warning */}
              {cancelStep === 'start' && (
                <div className="p-8 text-center space-y-6">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Are you sure you want to cancel?</h2>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">
                      If you cancel, you will lose access to premium features like **Unlimited Scans**, **Plagiarism Checking**, and **Priority Support** at the end of your billing period.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl text-left space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">What you will lose:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center text-gray-700"><XCircle className="h-4 w-4 text-red-500 mr-3" /> Unlimited Originality Scans</li>
                      <li className="flex items-center text-gray-700"><XCircle className="h-4 w-4 text-red-500 mr-3" /> Advanced Citation Analytics</li>
                      <li className="flex items-center text-gray-700"><XCircle className="h-4 w-4 text-red-500 mr-3" /> Priority Support Access</li>
                      <li className="flex items-center text-gray-700"><XCircle className="h-4 w-4 text-red-500 mr-3" /> Draft Comparison History</li>
                    </ul>
                  </div>

                  <div className="flex gap-4 justify-center pt-4">
                    <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                      Keep My Subscription
                    </button>
                    <button onClick={() => setCancelStep('survey')} className="px-6 py-2.5 bg-white border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors">
                      Continue to Cancel
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

              {/* Step 3: Final Confirm */}
              {cancelStep === 'confirm' && (
                <div className="p-8 text-center space-y-6">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <Trash2 className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Final Confirmation</h2>
                  <p className="text-gray-600">
                    By clicking "Confirm Cancellation" below, your subscription will be set to cancel at the end of the current billing period ({nextBillingDate?.toLocaleDateString()}).
                  </p>

                  <button
                    onClick={handleCancelSubscription}
                    className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
                    Confirm Cancellation
                  </button>

                  <button onClick={() => setCancelStep('start')} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                    Go Back
                  </button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BillingSettingsPage;
