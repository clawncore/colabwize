import { apiClient } from "./apiClient";

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  popular?: boolean;
  researcher?: boolean;
  monthlyPrice?: number;
  yearlyPrice?: number;
  oneTime?: boolean;
}

export interface Subscription {
  id?: string;
  plan: Plan | string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}

export interface Usage {
  [feature: string]: number;
}

export interface PaymentMethod {
  id: string;
  type: "visa" | "mastercard" | "amex" | "paypal";
  lastFour: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface Invoice {
  invoice_id: string;
  issued_at: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded";
  hosted_invoice_url?: string;
  pdf_url?: string;
}

/**
 * Subscription Service for frontend API calls
 */
export class SubscriptionService {
  /**
   * Get all available pricing plans
   */
  static async getPlans(): Promise<Plan[]> {
    const response = await apiClient.get("/api/subscription/plans");
    return response.plans;
  }

  /**
   * Get current user subscription
   */
  static async getCurrentSubscription(): Promise<{
    subscription: Subscription;
    limits: any;
    usage: Usage;
    creditBalance: number;
  }> {
    const response = await apiClient.get("/api/subscription/current");
    return response;
  }

  /**
   * Create checkout session
   */
  static async createCheckout(
    plan: string,
    billingPeriod: string = "monthly"
  ): Promise<string> {
    const response = await apiClient.post("/api/subscription/checkout", {
      plan,
      billingPeriod,
    });
    return response.checkoutUrl;
  }

  /**
   * Get customer portal URL
   */
  static async getPortalUrl(): Promise<string> {
    const response = await apiClient.post("/api/subscription/portal", {});
    return response.portalUrl;
  }

  /**
   * Get customer portal URL (Full response)
   */
  static async getCustomerPortalUrl(): Promise<{
    success: boolean;
    portalUrl: string;
  }> {
    const response = await apiClient.post("/api/subscription/portal", {});
    return response;
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(
    reason: string
  ): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.post("/api/subscription/cancel", {
      reason,
    });
    return response;
  }

  /**
   * Reactivate subscription
   */
  static async reactivateSubscription(): Promise<void> {
    await apiClient.post("/api/subscription/reactivate", {});
  }

  /**
   * Get usage history
   */
  static async getUsageHistory(months: number = 3): Promise<any[]> {
    const response = await apiClient.get(
      `/api/subscription/usage?months=${months}`
    );
    return response.usage;
  }

  /**
   * Get user's payment methods
   */
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiClient.get("/api/subscription/payment-methods");
    return response.paymentMethods;
  }

  /**
   * Get billing history
   */
  static async getBillingHistory(): Promise<Invoice[]> {
    const response = await apiClient.get("/api/subscription/invoices");
    return response.invoices;
  }

  /**
   * Add a payment method
   */
  static async addPaymentMethod(paymentMethod: {
    type: string;
    lastFour: string;
    expiryMonth: number;
    expiryYear: number;
  }): Promise<PaymentMethod> {
    const response = await apiClient.post(
      "/api/subscription/payment-methods",
      paymentMethod
    );
    return response.paymentMethod;
  }

  /**
   * Set default payment method
   */
  static async setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
    const response = await apiClient.post(
      `/api/subscription/payment-methods/${id}/default`,
      {}
    );
    return response.paymentMethod;
  }

  /**
   * Remove a payment method
   */
  static async removePaymentMethod(id: string): Promise<void> {
    await apiClient.delete(`/api/subscription/payment-methods/${id}`, null);
  }

  /**
   * Update payment method
   */
  static async updatePaymentMethod(): Promise<{
    success: boolean;
    redirectUrl?: string;
  }> {
    const response = await apiClient.post(
      "/api/subscription/payment-methods/update",
      {}
    );
    return response;
  }

  /**
   * Get current usage statistics
   */
  static async getUsageStats(): Promise<{
    plan: string;
    usage: { scans: number };
    limits: {
      scans_per_month: number | string;
      certificate_retention_days: number;
    };
    remaining: number | string;
    creditBalance: number;
  }> {
    const response = await apiClient.get("/api/subscription/current");
    const { subscription, limits, usage, creditBalance } = response;

    // Calculate remaining scans
    const currentScans = usage.scan || 0;
    const scanLimit = limits.scans_per_month;

    let remaining: number | string = 0;
    if (typeof scanLimit === "number") {
      remaining =
        scanLimit < 0 ? "Unlimited" : Math.max(0, scanLimit - currentScans);
    } else {
      remaining = "Unlimited";
    }

    return {
      plan: subscription?.plan?.id || "free",
      usage: {
        scans: currentScans,
      },
      limits: limits,
      remaining,
      creditBalance: creditBalance || 0,
    };
  }

  /**
   * Get comprehensive billing overview with real metrics
   * Single source of truth for billing page
   */
  static async getBillingOverview(): Promise<{
    plan: {
      name: string;
      price: number;
      interval?: string;
      status: string;
      renewsAt: string | null;
    };
    usage: {
      monthlyScans: { used: number; limit: number | null };
      originalityScans: { used: number; limit: number | null };
      citationChecks: { used: number; limit: number | null };
      certificates: { used: number; limit: number | null };
    };
    metrics: {
      documentsThisMonth: number;
      documentsLastMonth: number;
    };
    trends: {
      documentsDaily: number[];
    };
    paymentMethod: {
      brand: string;
      last4: string;
    } | null;
  }> {
    const response = await apiClient.get("/api/subscription/billing/overview");
    return response;
  }

  /**
   * Check if user has feature access
   */
  static async hasFeatureAccess(feature: string): Promise<boolean> {
    const response = await apiClient.get(
      `/api/subscription/features/${feature}`
    );
    return response.hasAccess || false;
  }
}
