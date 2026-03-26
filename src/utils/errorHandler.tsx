/**
 * Parses raw error objects or strings and returns a user-friendly error message.
 * This ensures that backend database constraints or raw system errors are not exposed
 * directly to the user.
 * 
 * @param error Any type of error object (Error, string, or API response)
 * @param fallback A default safe message to return if the error is entirely opaque
 * @returns A safe, user-friendly string
 */
import React from "react";

const buildErrorNode = (messageString: string, actionLabel?: string, actionHref?: string) => {
  const errorNode = (
    <div className="flex flex-col gap-2 p-1">
      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
        {messageString}
      </p>
      {actionLabel && actionHref && (
        <a 
          href={actionHref} 
          className="mt-1 inline-flex flex-shrink-0 items-center justify-center px-4 py-1.5 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 w-fit transition-colors pointer-events-auto cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          {actionLabel}
        </a>
      )}
    </div>
  );
  // Polyfill toString so that error logging or `throw new Error()` casts
  // it properly rather than outputting [object Object].
  (errorNode as any).toString = () => messageString;

  return errorNode as any;
};

export const getErrorMessage = (
  error: unknown,
  fallback = "We have detected an issue, our team is working to restore normal activity. Please check after some time."
): any => {
  if (!error) return buildErrorNode(fallback);

  // Extract the string message from the error object
  let message = "";
  if (typeof error === "string") {
    message = error;
  } else if (typeof error === "object" && error !== null) {
    // Cast to an any-record just to safely access properties
    const err = error as Record<string, any>;
    message = err.message || err.error || err.description || err.details || "";
  }

  if (!message || typeof message !== "string") {
    return buildErrorNode(fallback);
  }

  const lowerMsg = message.toLowerCase();

  // 1. Network / Connection errors
  if (
    lowerMsg.includes("failed to fetch") ||
    lowerMsg.includes("network error") ||
    lowerMsg.includes("load failed") ||
    lowerMsg.includes("timeout") ||
    lowerMsg.includes("econnrefused") ||
    lowerMsg.includes("socket")
  ) {
    return buildErrorNode(
      "Unable to connect to the server. Please check your internet connection and try again.",
      "Contact Support",
      "mailto:support@colabwize.com"
    );
  }

  // 2. Authentication / Session errors
  if (
    lowerMsg.includes("jwt") ||
    lowerMsg.includes("auth session missing") ||
    lowerMsg.includes("unauthorized") ||
    lowerMsg.includes("invalid login credentials")
  ) {
    return buildErrorNode(
      "Your session may have expired or credentials are invalid. Please log in again.",
      "Go to Login",
      "/login"
    );
  }
  
  // Specific auth edge-cases safely handled
  if (lowerMsg.includes("email not confirmed")) {
    return buildErrorNode(
      "Please confirm your email address before logging in.", 
      "Contact Support", 
      "mailto:support@colabwize.com"
    );
  }

  // 3. Database Constraints / Validation
  if (
    lowerMsg.includes("duplicate key value") ||
    lowerMsg.includes("violates unique constraint") ||
    lowerMsg.includes("already exists")
  ) {
    return buildErrorNode("This record already exists. Please choose a different name or detail.");
  }

  if (
    lowerMsg.includes("violates foreign key constraint") ||
    lowerMsg.includes("reference")
  ) {
    return buildErrorNode("Operation failed because it relates to missing or linked data.");
  }

  // 4. Raw Backend Errors
  if (
    lowerMsg.includes("internal server error") ||
    lowerMsg.includes("500") ||
    lowerMsg.includes("prisma") ||
    lowerMsg.includes("sql") ||
    lowerMsg.includes("stack trace") ||
    message.length > 150
  ) {
    return buildErrorNode(
      "We have detected an issue, our team is working to restore normal activity. Please check after some time.",
      "Contact Support",
      "mailto:support@colabwize.com"
    );
  }

  // 6. reCAPTCHA / Security errors
  if (
    lowerMsg.includes("recaptcha") ||
    lowerMsg.includes("automated activity") ||
    lowerMsg.includes("security verification") ||
    lowerMsg.includes("low security score")
  ) {
    return buildErrorNode(
      "Security verification failed. If you're using a privacy browser or ad-blocker (like Brave Shields), please try disabling it or completing the manual challenge.",
      "Contact Support",
      "mailto:support@colabwize.com"
    );
  }

  // General Fallback for standard application messages
  // This applies the layout box to ANY error, providing visual consistency.
  return buildErrorNode(message || fallback);
};
