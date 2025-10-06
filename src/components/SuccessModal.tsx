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
    ? `https://colabwize.vercel.app?ref=${user.referralCode}`
    : "";
  const shareText =
    "🚀 I just joined the @ColabWize waitlist! The future of academic writing is coming Q1 2025. Join me and get early access to revolutionize your research workflow! 🎓✨";

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
    )}&quote=${encodeURIComponent(shareText)}`;
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-sm">Facebook</span>
                </button>
              </div>

              {/* WhatsApp Sharing Button */}
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() =>
                    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + referralLink)}`, "_blank")
                  }
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.480-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.361.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="text-sm">WhatsApp</span>
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
