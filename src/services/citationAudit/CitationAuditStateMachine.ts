// Citation Audit State Machine
export type CitationAuditState =
  | 'IDLE'
  | 'VALIDATING'
  | 'SCANNING'
  | 'COMPLETED_SUCCESS'
  | 'COMPLETED_NO_ISSUES'
  | 'FAILED_QUOTA_EXCEEDED'
  | 'FAILED_SUBSCRIPTION_ERROR'
  | 'FAILED_NETWORK_ERROR'
  | 'FAILED_SCAN_ABORTED';

export interface CitationAuditResult {
  state: CitationAuditState;
  violations: any[];
  verificationResults?: any[];  // Verification results for sidebar display
  errorMessage?: string;
  quotaInfo?: {
    used: number;
    limit: number;
    resetTime?: string;
  };
  processingStats?: {
    totalChunks: number;
    totalCharacters: number;
    citationsFound: number;
    flagsDetected: number;
  };
}

// State transition handlers
export class CitationAuditStateMachine {
  private currentState: CitationAuditState = 'IDLE';

  static validateInitialState(): CitationAuditResult {
    return {
      state: 'VALIDATING',
      violations: []
    };
  }

  static handleQuotaExceeded(error: any): CitationAuditResult {
    return {
      state: 'FAILED_QUOTA_EXCEEDED',
      violations: [],
      errorMessage: 'Citation check usage limit reached. Please upgrade your plan or wait for quota reset.',
      quotaInfo: {
        used: error.used || 0,
        limit: error.limit || 0,
        resetTime: error.resetTime
      }
    };
  }

  static handleSubscriptionError(error: any): CitationAuditResult {
    return {
      state: 'FAILED_SUBSCRIPTION_ERROR',
      violations: [],
      errorMessage: 'Subscription verification failed. Please check your account status.'
    };
  }

  static handleNetworkError(error: any): CitationAuditResult {
    return {
      state: 'FAILED_NETWORK_ERROR',
      violations: [],
      errorMessage: 'Network connection failed. Please check your internet connection.'
    };
  }

  static handleSuccessfulScan(violations: any[], processingStats?: any, verificationResults?: any[]): CitationAuditResult {
    const state = violations.length > 0 ? 'COMPLETED_SUCCESS' : 'COMPLETED_NO_ISSUES';

    return {
      state,
      violations,
      verificationResults,  // Include verification results for sidebar
      processingStats
    };
  }

  static getUserFriendlyMessage(result: CitationAuditResult): string {
    switch (result.state) {
      case 'COMPLETED_SUCCESS':
        return `Audit complete! Found ${result.violations.length} citation issues.`;
      case 'COMPLETED_NO_ISSUES':
        return 'Audit complete! No citation issues found.';
      case 'FAILED_QUOTA_EXCEEDED':
        return result.errorMessage || 'Usage limit exceeded. Please upgrade.';
      case 'FAILED_SUBSCRIPTION_ERROR':
        return result.errorMessage || 'Account verification required.';
      case 'FAILED_NETWORK_ERROR':
        return result.errorMessage || 'Connection failed. Please try again.';
      default:
        return 'Audit completed.';
    }
  }

  static shouldShowToast(result: CitationAuditResult): boolean {
    // Always show toast for completion states
    // Only show for failures if they're user-actionable
    return [
      'COMPLETED_SUCCESS',
      'COMPLETED_NO_ISSUES',
      'FAILED_QUOTA_EXCEEDED',
      'FAILED_SUBSCRIPTION_ERROR'
    ].includes(result.state);
  }

  static getToastVariant(result: CitationAuditResult): 'default' | 'destructive' {
    switch (result.state) {
      case 'COMPLETED_SUCCESS':
        return 'destructive'; // Highlight issues found
      case 'COMPLETED_NO_ISSUES':
        return 'default'; // Positive reinforcement (using default styling)
      case 'FAILED_QUOTA_EXCEEDED':
      case 'FAILED_SUBSCRIPTION_ERROR':
      case 'FAILED_NETWORK_ERROR':
        return 'destructive'; // Error states
      default:
        return 'default';
    }
  }
}