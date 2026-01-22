import React, { useState } from "react";
import { AuthorshipService } from "../../services/authorshipService";
import { useToast } from "../../hooks/use-toast";

interface CertificateDownloadButtonProps {
  projectId: string;
  projectTitle: string;
  certificateType?: "authorship" | "originality" | "completion";
  variant?: "primary" | "secondary";
}

export const CertificateDownloadButton: React.FC<
  CertificateDownloadButtonProps
> = ({
  projectId,
  projectTitle,
  certificateType = "authorship",
  variant = "primary",
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const pdfBlob = await AuthorshipService.generateCertificate(
        projectId,
        projectTitle,
        certificateType,
        true // Include QR code
      );

      AuthorshipService.downloadCertificatePDF(pdfBlob, projectTitle);
      setSuccess(true);

      toast({
        title: "Certificate Generated!",
        description:
          "Your authorship certificate has been downloaded successfully.",
        variant: "default",
      });

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to generate certificate";
      const isUpgradeError = err.data?.upgrade === true;
      setError(errorMessage);

      toast({
        title: isUpgradeError ? "Limit Reached" : "Generation Failed",
        description: errorMessage,
        variant: "destructive",
        action: isUpgradeError ? (
          <button
            onClick={() =>
              (window.location.href = "/dashboard/billing/subscription")
            }
            className="px-3 py-2 bg-white text-red-600 text-sm font-semibold rounded hover:bg-gray-100 transition-colors">
            Upgrade Plan
          </button>
        ) : undefined,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const buttonClasses =
    variant === "primary"
      ? "px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
      : "px-4 py-2 bg-white text-indigo-600 font-medium border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed transition-colors";

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className={buttonClasses}>
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Certificate...
          </span>
        ) : success ? (
          <span className="flex items-center gap-2">
            <span>✓</span>
            Certificate Downloaded!
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span>📜</span>
            Download Authorship Certificate
          </span>
        )}
      </button>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};
