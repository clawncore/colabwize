import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

interface UpgradePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature:
  | "originality_scan"
  | "citation_check"
  | "certificate"
  | "rephrase_suggestions";
  limit?: number;
}

const FEATURE_MESSAGES = {
  originality_scan: {
    title: "Originality Scan Limit Reached",
    description: "You've used all your scans this month.",
    featureName: "Originality Scanning",
    benefits: [
      "50 originality scans/month with Student plan",
      "Unlimited scans with Researcher plan",
      "Advanced similarity detection",
      "Priority scanning",
    ],
  },
  citation_check: {
    title: "Citation Auditor Not Available",
    description: "Citation Confidence Auditor is only available on paid plans.",
    featureName: "Citation Confidence Auditor",
    benefits: [
      "Detect potentially fake citations",
      "Confidence scoring for each citation",
      "Source verification",
      "Academic field-specific analysis",
    ],
  },
  certificate: {
    title: "Certificate Limit Reached",
    description: "You've generated all your certificates this month.",
    featureName: "Authorship Certificates",
    benefits: [
      "50 certificates/month with Student plan",
      "Unlimited certificates with Researcher plan",
      "No watermarks on paid plans",
      "Professional PDF format with QR codes",
    ],
  },
  rephrase_suggestions: {
    title: "Rephrase Limit Reached",
    description: "You've used all your rephrase suggestions for this month.",
    featureName: "Rephrase Suggestions",
    benefits: [
      "3 suggestions/month on Free plan",
      "50 suggestions/month on Student plan",
      "Unlimited suggestions on Researcher plan",
      "Advanced AI paraphrasing",
    ],
  },
};

export const UpgradePromptDialog: React.FC<UpgradePromptDialogProps> = ({
  open,
  onOpenChange,
  feature,
  limit = 3,
}) => {
  const navigate = useNavigate();
  const config = FEATURE_MESSAGES[feature];

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/pricing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl p-4 sm:p-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🔒</span>
          </div>

          <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
            {config.title}
          </DialogTitle>

          <DialogDescription className="text-gray-600 mb-6">
            {config.description} Upgrade your plan, buy more credits, or wait for your monthly reset.
          </DialogDescription>
        </div>

        {/* Current Limit Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-600 mb-1">
            Current Plan: <span className="font-semibold">Free</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {limit}{" "}
            <span className="text-base font-normal text-gray-600">
              scans/month
            </span>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            Upgrade to unlock:
          </h3>
          <ul className="space-y-2">
            {config.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={handleUpgrade}
            className="w-full px-4 py-3 sm:py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-md hover:shadow-lg">
            Upgrade Plan
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onOpenChange(false);
                navigate("/credits");
              }}
              className="flex-1 px-4 py-2 border border-purple-200 text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors font-medium">
              Buy Credits
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
              Wait
            </button>
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-gray-900">Free</div>
              <div className="text-gray-600">{limit}/month</div>
            </div>
            <div className="border-l border-r border-gray-200">
              <div className="font-semibold text-indigo-600">Student</div>
              <div className="text-gray-600">50/month</div>
              <div className="text-xs text-gray-500">$4.99/mo</div>
            </div>
            <div>
              <div className="font-semibold text-purple-600">Researcher</div>
              <div className="text-gray-600">Unlimited</div>
              <div className="text-xs text-gray-500">$12.99/mo</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
