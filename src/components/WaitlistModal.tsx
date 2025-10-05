import { X, Check, Loader } from "lucide-react";
import { useState } from "react";
import { User } from "../types/user";
import { supabase } from "../lib/supabaseClient";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export default function WaitlistModal({
  isOpen,
  onClose,
  onSuccess,
}: WaitlistModalProps) {
  // ...rest of the component
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [institution, setInstitution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [position, setPosition] = useState(1235);
  const [referralCode, setReferralCode] = useState("");
  const [emailExists, setEmailExists] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data } = await supabase
      .from("waitlist")
      .select("email")
      .eq("email", email);

    if (data && data.length > 0) {
      setEmailExists(true);
      setIsSubmitting(false);
      return;
    }

    const code = Math.random().toString(36).substring(2, 10);
    const newPosition = Math.floor(Math.random() * 1500) + 1000;

    const { error: insertError } = await supabase.from("waitlist").insert([
      {
        name,
        email,
        role,
        institution,
        position: newPosition,
        referral_code: code,
      },
    ]);

    if (insertError) {
      console.error("Error inserting user:", insertError);
      setIsSubmitting(false);
      return;
    }

    setReferralCode(code);
    setPosition(newPosition);
    onSuccess({ name, email, position: newPosition, referralCode: code });
    setShowSuccess(true);
    setIsSubmitting(false);

    // Send email
    await supabase.functions.invoke("waitlist-automation", {
      body: { name, email, position: newPosition, referralCode: code },
    });
  };

  const handleReset = () => {
    setEmail("");
    setName("");
    setRole("");
    setInstitution("");
    setShowSuccess(false);
    setReferralCode("");
    onClose();
  };

  const shareUrl = `https://collaboratewise.com?ref=${referralCode}`;
  const shareText = `I just joined the @CollaborateWise waitlist! The future of academic writing is coming Q1 2025 🚀`;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative animate-in fade-in duration-300">
          <button
            onClick={handleReset}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome to the Waitlist!
            </h2>
            <p className="text-gray-600 mb-6">
              You're{" "}
              <span className="font-bold text-blue-600">#{position}</span> on
              the list
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold mb-2">
                Share with friends to move up:
              </p>
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(shareUrl)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-semibold"
                >
                  Copy
                </button>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        shareText
                      )}&url=${encodeURIComponent(shareUrl)}`
                    )
                  }
                  className="flex-1 bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 transition text-sm font-semibold"
                >
                  Share on Twitter
                </button>
                <button
                  onClick={() =>
                    window.open(
                      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                        shareUrl
                      )}`
                    )
                  }
                  className="flex-1 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition text-sm font-semibold"
                >
                  Share on LinkedIn
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Each referral moves you up +10 spots!
            </p>

            <button
              onClick={handleReset}
              className="w-full bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative animate-in fade-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold mb-2">
          Join the CollaborateWise Waitlist
        </h2>
        <p className="text-gray-600 mb-6">
          Be among the first to experience the future of academic writing
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm">
              Early access when we launch in Q1 2025
            </span>
          </div>
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm">Exclusive 30% lifetime discount</span>
          </div>
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm">
              Vote on features and shape the product
            </span>
          </div>
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm">No spam, unsubscribe anytime</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                setEmailExists(false);
              }}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@university.edu"
            />
            {emailExists && (
              <p className="text-red-500 text-sm mt-1">
                This email has already been subscribed.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              I am a (Optional)
            </label>
            <select
              value={role}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setRole(e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select your role</option>
              <option value="student">Student</option>
              <option value="researcher">Researcher</option>
              <option value="professor">Professor</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              University/Institution (Optional)
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your institution"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Joining...
              </>
            ) : (
              "Join 1,234 Others on the Waitlist"
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
