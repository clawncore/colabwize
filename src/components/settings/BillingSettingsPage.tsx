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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-gray-500" />
          Current Subscription
        </h2>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            subscription.status === "active"
              ? "bg-green-100 text-green-800"
              : subscription.status === "canceled"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
          }`}>
          {subscription.status.toUpperCase()}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <p className="text-sm text-gray-500 mb-1">Current Plan</p>
          <p className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</p>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="mr-2 h-4 w-4" />
              {subscription.cancel_at_period_end
                ? `Expires on ${new Date(subscription.current_period_end!).toLocaleDateString()}`
                : `Renews on ${new Date(subscription.current_period_end || Date.now()).toLocaleDateString()}`}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="mr-2 h-4 w-4" />
              {subscription.cancel_at_period_end
                ? "Access until end of period"
                : "Active subscription"}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 justify-center">
          {subscription.status === "active" &&
            !subscription.cancel_at_period_end && (
              <>
                <Button
                  onClick={handleManage}
                  variant="outline"
                  disabled={loading}>
                  Manage Payment Method
                </Button>
                <AlertDialog
                  open={showCancelDialog}
                  onOpenChange={setShowCancelDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={loading}>
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel your subscription? You
                        will lose access to premium features at the end of your
                        billing period.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancel}
                        className="bg-red-600 hover:bg-red-700">
                        Cancel Subscription
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}

          {subscription.cancel_at_period_end && (
            <Button
              onClick={handleReactivate}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}>
              Reactivate Subscription
            </Button>
          )}

          {subscription.status === "expired" && (
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link to="/pricing">Renew Subscription</Link>
            </Button>
          )}
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
      <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
          <BarChart className="mr-2 h-5 w-5 text-gray-500" />
          Feature Usage
        </h2>

        <div className="space-y-6">
          {consumableFeatures.map((feature) => {
            const config = FEATURE_CONFIG[feature];
            const limit = limits[feature];

            // Skip negative limits (unlimited) for progress bars, handle display
            const isUnlimited = limit < 0;

            // Get usage using the mapped key or fallback to feature name
            const usageKey = config?.usageKey || feature;
            const current = usage[usageKey] || 0;

            const percentage = isUnlimited
              ? 0
              : limit === Infinity
                ? 0
                : Math.min(100, (current / limit) * 100);

            return (
              <div key={feature}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">
                    {config?.label || feature}
                  </span>
                  <span className="text-gray-500">
                    {current} / {isUnlimited ? "Unlimited" : limit}
                  </span>
                </div>
                {!isUnlimited && (
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        percentage > 90
                          ? "bg-red-500"
                          : percentage > 75
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                      }`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                )}
                {isUnlimited && (
                  <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-full opacity-20" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Limits/Info */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
          <CheckCircle className="mr-2 h-5 w-5 text-gray-500" />
          Plan Limits
        </h2>

        <div className="space-y-4">
          {staticFeatures.map((feature) => {
            const config = FEATURE_CONFIG[feature];
            const limit = limits[feature];

            return (
              <div
                key={feature}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-600 text-sm">
                  {config?.label || feature}
                </span>
                <span className="font-semibold text-gray-900">
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Payment History
      </h2>

      {invoices.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No payment history yet</p>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {invoice.description}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(invoice.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold text-gray-900">
                  ${invoice.amount.toFixed(2)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      invoice.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : invoice.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}>
                    {invoice.status.toUpperCase()}
                  </span>
                  {invoice.receiptUrl && (
                    <a
                      href={invoice.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                      Receipt
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Payment Methods
      </h2>

      {paymentMethods.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No payment methods on file. Payment methods are managed through
          LemonSqueezy.
        </p>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {method.type}{" "}
                    {method.lastFour ? `•••• ${method.lastFour}` : ""}
                  </p>
                  {method.expiryMonth && method.expiryYear && (
                    <p className="text-sm text-gray-500">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </p>
                  )}
                </div>
              </div>
              {method.isDefault && (
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium">
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
      const plan =
        plans.find((p) => p.id === subData.subscription.plan.id) || null;
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Billing & Subscription
      </h1>

      <SubscriptionStatus subscription={data.subscription} plan={activePlan} />

      <UsageChart usage={data.usage} limits={data.limits} />

      <PaymentHistory />

      <PaymentMethodsDisplay />
    </div>
  );
}
