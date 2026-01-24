// Quota Management System for Researcher Plans
export interface QuotaLimits {
  citationChecks: number;
  documentExports: number;
  aiAssists: number;
  storageGB: number;
}

export interface CurrentUsage {
  citationChecksUsed: number;
  documentExportsUsed: number;
  aiAssistsUsed: number;
  storageUsedGB: number;
}

export interface QuotaStatus {
  plan: 'free' | 'researcher' | 'enterprise';
  limits: QuotaLimits;
  usage: CurrentUsage;
  remaining: {
    citationChecks: number;
    documentExports: number;
    aiAssists: number;
    storageGB: number;
  };
  isExceeded: boolean;
  nextResetDate?: string;
}

export class QuotaManager {
  static readonly PLANS = {
    free: {
      citationChecks: 50,
      documentExports: 10,
      aiAssists: 20,
      storageGB: 1
    },
    researcher: {
      citationChecks: 1000,
      documentExports: 100,
      aiAssists: 500,
      storageGB: 10
    },
    enterprise: {
      citationChecks: Infinity,
      documentExports: Infinity,
      aiAssists: Infinity,
      storageGB: 100
    }
  };

  static calculateRemaining(limits: QuotaLimits, usage: CurrentUsage): QuotaStatus['remaining'] {
    return {
      citationChecks: Math.max(0, limits.citationChecks - usage.citationChecksUsed),
      documentExports: Math.max(0, limits.documentExports - usage.documentExportsUsed),
      aiAssists: Math.max(0, limits.aiAssists - usage.aiAssistsUsed),
      storageGB: Math.max(0, limits.storageGB - usage.storageUsedGB)
    };
  }

  static checkIfExceeded(status: QuotaStatus): boolean {
    return (
      status.remaining.citationChecks <= 0 ||
      status.remaining.documentExports <= 0 ||
      status.remaining.aiAssists <= 0 ||
      status.remaining.storageGB <= 0
    );
  }

  static getQuotaStatus(plan: 'free' | 'researcher' | 'enterprise', usage: CurrentUsage): QuotaStatus {
    const limits = this.PLANS[plan];
    const remaining = this.calculateRemaining(limits, usage);
    
    return {
      plan,
      limits,
      usage,
      remaining,
      isExceeded: this.checkIfExceeded({ plan, limits, usage, remaining } as QuotaStatus)
    };
  }

  static getDaysUntilReset(resetDate?: string): number {
    if (!resetDate) return 30; // Default monthly cycle
    
    const reset = new Date(resetDate);
    const today = new Date();
    const diffTime = reset.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static getUsagePercentage(used: number, limit: number): number {
    if (limit === Infinity) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  }

  static shouldShowWarning(usage: number, limit: number): boolean {
    if (limit === Infinity) return false;
    const percentage = this.getUsagePercentage(usage, limit);
    return percentage >= 80; // Warn at 80% usage
  }

  static getQuotaMessage(status: QuotaStatus, resource: keyof QuotaLimits): string {
    const used = status.usage[`${resource}Used` as keyof CurrentUsage] as number;
    const limit = status.limits[resource];
    const remaining = status.remaining[resource];
    
    if (limit === Infinity) {
      return `${used} ${resource} used (unlimited)`;
    }
    
    if (remaining <= 0) {
      return `Quota exceeded: ${used}/${limit} ${resource}`;
    }
    
    const percentage = this.getUsagePercentage(used, limit);
    return `${used}/${limit} ${resource} (${percentage}% used)`;
  }
}

// Temporary quota bypass for researcher plan
export class TemporaryQuotaBypass {
  private static bypassKey = 'temp_quota_bypass_researcher';
  private static expirationHours = 24;

  static enableTemporaryBypass(): void {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + this.expirationHours);
    
    localStorage.setItem(this.bypassKey, expiration.toISOString());
  }

  static isBypassActive(): boolean {
    const expirationStr = localStorage.getItem(this.bypassKey);
    if (!expirationStr) return false;
    
    const expiration = new Date(expirationStr);
    const now = new Date();
    
    if (now > expiration) {
      this.disableBypass();
      return false;
    }
    
    return true;
  }

  static disableBypass(): void {
    localStorage.removeItem(this.bypassKey);
  }

  static getTimeRemaining(): number {
    const expirationStr = localStorage.getItem(this.bypassKey);
    if (!expirationStr) return 0;
    
    const expiration = new Date(expirationStr);
    const now = new Date();
    
    return Math.max(0, expiration.getTime() - now.getTime());
  }

  static getFormattedTimeRemaining(): string {
    const msRemaining = this.getTimeRemaining();
    if (msRemaining <= 0) return 'Expired';
    
    const hours = Math.floor(msRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  }
}