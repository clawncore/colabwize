import React, { useState } from "react";
import { AuthorshipService } from "../../services/authorshipService";
import { useToast } from "../../hooks/use-toast";
import { Download } from "lucide-react";

interface CertificateDownloadButtonProps {
  projectId: string;
  projectTitle: string;
  certificateType?: "authorship" | "originality" | "completion";
  variant?: "primary" | "secondary";
  className?: string; // Allow custom styling
  disabled?: boolean;
}

export const CertificateDownloadButton: React.FC<
  CertificateDownloadButtonProps
> = ({
  projectId,
  projectTitle,
  certificateType = "authorship",
  variant = "primary",
  className = "",
  disabled = false,
}) => {
    const [downloadStep, setDownloadStep] = useState<"idle" | "generating" | "signing" | "downloading">("idle");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const { toast } = useToast();

    const handleDownload = async () => {
      setDownloadStep("generating");
      setError(null);
      setSuccess(false);

      try {
        // Step 1: Simulate generation delay if needed, or actual generation
        // Wait briefly to show "Generating" state
        await new Promise(r => setTimeout(r, 600));

        setDownloadStep("signing");
        // Step 2: Sign
        await new Promise(r => setTimeout(r, 800));

        setDownloadStep("downloading");

        const pdfBlob = await AuthorshipService.generateCertificate(
          projectId,
          projectTitle,
          certificateType,
          true // Include QR code
        );

        AuthorshipService.downloadCertificatePDF(pdfBlob, projectTitle);

        setDownloadStep("idle");
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
        setDownloadStep("idle");

        toast({
          title: isUpgradeError ? "Limit Reached" : "Generation Failed",
          description: errorMessage,
          variant: "destructive",
          action: isUpgradeError ? (
            <button
              onClick={() =>
                (window.location.href = "/pricing")
              }
              className="px-3 py-2 bg-white text-red-600 text-sm font-semibold rounded hover:bg-gray-100 transition-colors">
              Upgrade Plan
            </button>
          ) : undefined,
        });
      } finally {
        // setIsGenerating(false); // Handled by step reset
      }
    };

    const baseClasses =
      variant === "primary"
        ? "flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-md font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        : "flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm";

    const buttonClasses = className ? `${baseClasses} ${className}` : baseClasses;

    return (
      <div>
        <button
          onClick={handleDownload}
          disabled={disabled || downloadStep !== "idle"}
          className={buttonClasses}>
          {downloadStep !== "idle" ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {downloadStep === 'generating' && 'Generating...'}
              {downloadStep === 'signing' && 'Signing...'}
              {downloadStep === 'downloading' && 'Downloading...'}
            </>
          ) : success ? (
            <>
              <span className="font-bold">✓</span>
              Downloaded
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Certificate
            </>
          )}
        </button>

        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>
    );
  };
