import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { CreditCard, Calendar, CheckCircle, BarChart } from "lucide-react";
import {
  SubscriptionService,
  Plan,
  Subscription,
  Usage,
  Invoice,
  PaymentMethod,
} from "../../services/subscriptionService";
import { useToast } from "../../hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

// Sub-components can be in the same file for MVP simplicity or separated later
const SubscriptionStatus = ({
  subscription,
  plan,
}: {
  subscription: Subscription;
  plan: Plan | null;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      await SubscriptionService.cancelSubscription(
        "User requested cancellation"
      );
      window.location.reload();
      toast({
        title: "Subscription Canceled",
        description:
          "Your subscription has been canceled and will end at the end of the billing period.",
        variant: "default",
      });
    } catch (error) {
      console.error("Cancel error:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowCancelDialog(false);
    }
  };

  const handleReactivate = async () => {
    setLoading(true);
    try {
      await SubscriptionService.reactivateSubscription();
      window.location.reload();
    } catch (error) {
      console.error("Reactivate error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const url = await SubscriptionService.getPortalUrl();
      window.open(url, "_blank");
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!plan) return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-8 mb-8 transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-gray-900">
              Current Subscription
            </h2>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5 ${subscription.status === "active"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : subscription.status === "canceled"
                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                  : "bg-gray-50 text-gray-700 border border-gray-100"
                }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${subscription.status === "active"
                ? "bg-emerald-500"
                : subscription.status === "canceled"
                  ? "bg-amber-500"
                  : "bg-gray-500"
                }`} />
              {subscription.status}
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            Manage your plan, billing details, and payment methods.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          {subscription.status === "active" &&
            !subscription.cancel_at_period_end && (
              <>
                <Button
                  onClick={handleManage}
                  variant="outline"
                  className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  disabled={loading}>
                  Payment Methods
                </Button>
                <AlertDialog
                  open={showCancelDialog}
                  onOpenChange={setShowCancelDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={loading}>
                      Cancel Plan
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white max-w-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                        Cancel Subscription
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-4 pt-2">
                        <p className="text-gray-600">
                          Your subscription will remain active until the end of
                          your current billing period. You will not be charged
                          again after this period.
                        </p>

                        <div className="bg-blue-50 p-4 rounded-lg break-words">
                          <p className="text-blue-800 font-medium">
                            Access ends on:{" "}
                            {subscription.current_period_end
                              ? new Date(
                                subscription.current_period_end
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                              : "End of current period"}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <p className="font-medium text-gray-900">What you'll lose:</p>
                          <ul className="space-y-2 text-sm text-gray-600">
                            {[
                              "Unlimited Originality Scans",
                              "Advanced Citation Analytics",
                              "Priority Support",
                              "Draft Comparison History",
                            ].map((item, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="text-red-500 flex-shrink-0">✕</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                          <p className="font-medium text-gray-900">What happens next?</p>
                          <ul className="space-y-1 text-gray-600 list-disc pl-4">
                            <li>No further payments will be charged</li>
                            <li>You keep full access until the date above</li>
                            <li>You can re-subscribe anytime</li>
                          </ul>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                      <AlertDialogCancel className="bg-gray-100 text-gray-900 hover:bg-gray-200 border-0 mt-2 sm:mt-0 rounded-lg">
                        Keep Subscription
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancel}
                        className="bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:text-red-700 shadow-none rounded-lg">
                        Confirm Cancellation
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}

          {subscription.cancel_at_period_end && (
            <Button
              onClick={handleReactivate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200"
              disabled={loading}>
              Reactivate Subscription
            </Button>
          )}

          {subscription.status === "expired" && (
            <Button
              asChild
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200">
              <Link to="/pricing">Renew Subscription</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Plan</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-extrabold text-gray-900">{plan.name}</p>
            <span className="text-gray-500 font-medium">${plan.price}/month</span>
          </div>

          <div className="pt-4 space-y-3">
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 w-fit px-3 py-1.5 rounded-lg border border-gray-100">
              <Calendar className="mr-2 h-4 w-4 text-gray-400" />
              {subscription.cancel_at_period_end
                ? <span className="text-amber-700 font-medium">Expires on {new Date(subscription.current_period_end!).toLocaleDateString()}</span>
                : <span>Renews on {new Date(subscription.current_period_end || Date.now()).toLocaleDateString()}</span>}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
              {subscription.cancel_at_period_end
                ? "Full access until end of period"
                : "Active subscription with auto-renewal"}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-50/50">
          <h4 className="font-semibold text-indigo-900 mb-3 text-sm uppercase tracking-wide">Included in {plan.name}</h4>
          <ul className="grid grid-cols-2 gap-3">
            {plan.features.slice(0, 6).map((feature, i) => (
              <li key={i} className="flex items-start text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Feature configuration for display and mapping
const FEATURE_CONFIG: Record<
  string,
  {
    label: string;
    usageKey?: string;
    type: "consumable" | "static" | "boolean";
  }
> = {
  scans_per_month: {
    label: "Monthly Scans",
    usageKey: "scan",
    type: "consumable",
  },
  originality_scan: {
    label: "Originality Scans",
    usageKey: "originality_scan",
    type: "consumable",
  },
  citation_check: {
    label: "Citation Checks",
    usageKey: "citation_check",
    type: "consumable",
  },
  certificate: {
    label: "Certificates Generated",
    usageKey: "certificate",
    type: "consumable",
  },
  max_scan_characters: {
    label: "Max Characters per Scan",
    type: "static",
  },
  certificate_retention_days: {
    label: "Certificate Retention",
    type: "static",
  },
  draft_comparison: {
    label: "Draft Comparison",
    type: "boolean",
  },
  priority_scanning: {
    label: "Priority Scanning",
    type: "boolean",
  },
  watermark: {
    label: "Watermark Removed",
    type: "boolean",
  },
  export_formats: {
    label: "Export Formats",
    type: "boolean",
  },
  advanced_citations: {
    label: "Advanced Citations",
    type: "boolean",
  },
  advanced_analytics: {
    label: "Advanced Analytics",
    type: "boolean",
  },
};

const UsageChart = ({ usage, limits }: { usage: Usage; limits: any }) => {
  // Filter for consumable features to show in progress bars
  const consumableFeatures = Object.keys(limits).filter((key) => {
    const config = FEATURE_CONFIG[key];
    return config && config.type === "consumable";
  });

  // Filter for static limits/info to show as simple stats
  const staticFeatures = Object.keys(limits).filter((key) => {
    const config = FEATURE_CONFIG[key];
    return config && config.type === "static";
  });

  return (
    <div className="grid md:grid-cols-3 gap-8 mb-8">
      {/* Usage Progress Bars */}
      <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-lg font-bold text-gray-900 flex items-center mb-6">
          <BarChart className="mr-2 h-5 w-5 text-indigo-500" />
          Feature Usage
        </h2>

        <div className="space-y-8">
          {consumableFeatures.map((feature) => {
            const config = FEATURE_CONFIG[feature];
            const limit = limits[feature];

            // Skip negative limits (unlimited) for progress bars, handle display
            const isUnlimited = limit < 0;

            // Get usage using the mapped key or fallback to feature name
            const usageKey = config?.usageKey || feature;
            let current = usage[usageKey] || 0;

            // Special handling for Scans Used - limits reached derived logic
            if (feature === "scans_per_month") {
              const origUsage = usage['originality_scan'] || 0;
              const origLimit = limits['originality_scan'] ?? 3;

              const citeUsage = usage['citation_check'] || 0;
              const citeLimit = typeof limits['citation_check'] === 'number' ? limits['citation_check'] : 0;

              const rephraseUsage = usage['rephrase'] || 0;
              const rephraseLimit = limits['rephrase_per_month'] ?? 3;

              current = (origUsage >= origLimit ? 1 : 0) +
                (citeUsage >= citeLimit ? 1 : 0) +
                (rephraseUsage >= rephraseLimit ? 1 : 0);
            }

            const percentage = isUnlimited
              ? 0
              : limit === Infinity
                ? 0
                : Math.min(100, (current / limit) * 100);

            return (
              <div key={feature}>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-medium text-gray-700 text-sm">
                    {config?.label || feature}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                    {current} / {isUnlimited ? "Unlimited" : limit}
                  </span>
                </div>
                {!isUnlimited && (
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${percentage > 90
                        ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                        : percentage > 75
                          ? "bg-amber-500"
                          : "bg-indigo-500"
                        }`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                )}
                {isUnlimited && (
                  <div className="h-2.5 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100">
                    <div className="h-full bg-emerald-500 w-full opacity-10" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Limits/Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 h-fit">
        <h2 className="text-lg font-bold text-gray-900 flex items-center mb-6">
          <CheckCircle className="mr-2 h-5 w-5 text-indigo-500" />
          Plan Limits
        </h2>

        <div className="space-y-0 divide-y divide-gray-50">
          {staticFeatures.map((feature) => {
            const config = FEATURE_CONFIG[feature];
            const limit = limits[feature];

            return (
              <div
                key={feature}
                className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                <span className="text-gray-500 text-sm">
                  {config?.label || feature}
                </span>
                <span className="font-semibold text-gray-900 text-sm">
                  {config?.label.includes("Retention")
                    ? `${limit} Days`
                    : limit.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PaymentHistory = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await SubscriptionService.getBillingHistory();
      setInvoices(data);
    } catch (error) {
      console.error("Failed to load invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <p className="text-gray-500">Loading payment history...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        Payment History
        <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 text-xs font-normal border border-gray-100">{invoices.length} records</span>
      </h2>

      {invoices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-sm">No payment history yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {invoices.map((invoice) => (
                <tr key={invoice.invoice_id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Invoice {invoice.invoice_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invoice.issued_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${invoice.status === "paid"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : invoice.status === "pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-red-50 text-red-700 border border-red-100"
                        }`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {invoice.hosted_invoice_url ? (
                      <a
                        href={invoice.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900 hover:underline">
                        Download
                      </a>
                    ) : (
                      <span className="text-gray-400">Unavailable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const PaymentMethodsDisplay = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const data = await SubscriptionService.getPaymentMethods();
      setPaymentMethods(data);
    } catch (error) {
      console.error("Failed to load payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <p className="text-gray-500">Loading payment methods...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        Payment Methods
        <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 text-xs font-normal border border-gray-100">
          Secure
        </span>
      </h2>

      {paymentMethods.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-sm">
            No payment methods on file. Payment methods are managed through
            LemonSqueezy.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex justify-between items-center p-5 border border-gray-100 rounded-xl hover:border-indigo-100 hover:shadow-sm transition-all bg-white group">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center mr-4 group-hover:bg-indigo-50 transition-colors">
                  <CreditCard className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 capitalize text-sm">
                    {method.type}{" "}
                    <span className="text-gray-400 font-normal">••••</span> {method.lastFour}
                  </p>
                  {method.expiryMonth && method.expiryYear && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </p>
                  )}
                </div>
              </div>
              {method.isDefault && (
                <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium border border-indigo-100">
                  Default
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function BillingPage() {
  const [data, setData] = useState<{
    subscription: Subscription;
    limits: any;
    usage: Usage;
  } | null>(null);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [subData, plans] = await Promise.all([
        SubscriptionService.getCurrentSubscription(),
        SubscriptionService.getPlans(),
      ]);

      setData(subData);
      const planId = typeof subData.subscription.plan === 'string'
        ? subData.subscription.plan
        : subData.subscription.plan.id;

      const plan = plans.find((p) => p.id === planId) || null;
      setActivePlan(plan);
    } catch (error) {
      console.error("Failed to load billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading billing info...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen p-6">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-gray-500">Manage your subscription plan and billing history.</p>
      </div>

      <SubscriptionStatus subscription={data.subscription} plan={activePlan} />

      <UsageChart usage={data.usage} limits={data.limits} />

      <PaymentHistory />

      <PaymentMethodsDisplay />
    </div>
  );
}
