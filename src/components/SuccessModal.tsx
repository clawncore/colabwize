import { useState, useEffect } from "react";
import { X, Copy, Check, Twitter, Facebook } from "lucide-react";
import "./SuccessModal.css";
import { User } from "../types/user";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function SuccessModal({
  isOpen,
  onClose,
  user,
}: SuccessModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Trigger confetti animation
      const confetti = document.createElement("div");
      confetti.className = "confetti-container";
      confetti.innerHTML = `
        <div class="confetti"></div>
        <div class="confetti"></div>
        <div class="confetti"></div>
        <div class="confetti"></div>
        <div class="confetti"></div>
      `;
      document.body.appendChild(confetti);

      setTimeout(() => {
        if (document.body.contains(confetti)) {
          document.body.removeChild(confetti);
        }
      }, 3000);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const referralLink = user
    ? `https://colabwize.com?ref=${user.referralCode}`
    : "";
  const shareText =
    "I just joined the @ColabWize waitlist! The future of academic writing is coming Q1 2025 🚀";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(referralLink)}`;
    window.open(url, "_blank");
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      referralLink
    )}`;
    window.open(url, "_blank");
  };

  if (!isOpen || !user) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full">
          <div className="p-6 text-center">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  You're In! 🎉
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Position */}
            <div className="mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                #{user.position}
              </div>
              <p className="text-gray-600">
                You're #{user.position} on the waitlist
              </p>
            </div>

            {/* Next Steps */}
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Check your email to confirm your spot!
              </p>
            </div>

            {/* Referral Section */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Share with 3 friends to move to top 500
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Each referral moves you up 10 spots on the waitlist
              </p>

              {/* Referral Link */}
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span className="text-sm">
                      {copied ? "Copied!" : "Copy"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={shareToTwitter}
                  className="flex-1 px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <Twitter size={16} />
                  <span className="text-sm">Twitter</span>
                </button>
                <button
                  onClick={shareToFacebook}
                  className="flex-1 px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors flex items-center justify-center space-x-2"
                >
                  <Facebook size={16} />
                  <span className="text-sm">Facebook</span>
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
