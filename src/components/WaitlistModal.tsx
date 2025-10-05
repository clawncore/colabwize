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
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [institution, setInstitution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [position, setPosition] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [emailExists, setEmailExists] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data: existingUser } = await supabase
      .from("waitlist")
      .select("email")
      .eq("email", email);

    if (existingUser && existingUser.length > 0) {
      setEmailExists(true);
      setIsSubmitting(false);
      return;
    }

    // Generate a proper referral code based on email and timestamp
    const generateReferralCode = () => {
      const timestamp = Date.now().toString(36);
      const emailPart = email.substring(0, Math.min(5, email.indexOf('@') !== -1 ? email.indexOf('@') : email.length));
      return `${emailPart}_${timestamp}`.substring(0, 10);
    };

    const code = generateReferralCode();

    // Insert the user first
    const { data: insertedData, error: insertError } = await supabase.from("waitlist").insert([
      {
        name,
        email,
        role,
        institution,
        position: null, // Will be calculated based on created_at
        referral_code: code,
      },
    ]).select();

    if (insertError) {
      console.error("Error inserting user:", insertError);
      setIsSubmitting(false);
      return;
    }

    // Get the actual position by counting users who joined before this user
    // We'll use the created_at timestamp to determine the position
    const insertedUserId = insertedData[0].id;

    // Get the created_at timestamp for the inserted user
    const { data: userData, error: userError } = await supabase
      .from("waitlist")
      .select("created_at")
      .eq("id", insertedUserId)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      setIsSubmitting(false);
      return;
    }

    // Count how many users joined before this user
    const { count, error: countError } = await supabase
      .from("waitlist")
      .select("*", { count: "exact" })
      .lt("created_at", userData.created_at);

    if (countError) {
      console.error("Error counting waitlist users:", countError);
      setIsSubmitting(false);
      return;
    }

    // The position is the count of users who joined before + 1
    const newPosition = (count || 0) + 1;

    // Update the user's position
    const { error: updateError } = await supabase
      .from("waitlist")
      .update({ position: newPosition })
      .eq("id", insertedUserId);

    if (updateError) {
      console.error("Error updating user position:", updateError);
      // Continue anyway as we have the user in the database
    }

    setReferralCode(code);
    setPosition(newPosition);
    onSuccess({ name, email, position: newPosition, referralCode: code });
    setShowSuccess(true);
    setIsSubmitting(false);

    // Send immediate welcome email
    try {
      console.log("Invoking waitlist function with data:", {
        type: "immediateWelcome",
        entry: {
          name,
          email,
          position: newPosition,
          referralCode: code
        }
      });

      const { data, error } = await supabase.functions.invoke("waitlist-automation", {
        body: {
          type: "immediateWelcome",
          entry: {
            name,
            email,
            position: newPosition,
            referralCode: code
          }
        },
      });

      if (error) {
        console.error("Error invoking waitlist function:", error);
        console.error("Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      } else {
        console.log("Waitlist function response:", data);
      }
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      console.error("Email error details:", {
        message: emailError instanceof Error ? emailError.message : 'Unknown error',
        name: emailError instanceof Error ? emailError.name : 'Unknown',
        stack: emailError instanceof Error ? emailError.stack : 'No stack'
      });
      // Don't prevent success modal from showing if email fails
    }
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

  const shareUrl = `https://colabwize.vercel.app?ref=${referralCode}`;
  const shareText = `I just joined the @ColabWize waitlist! The future of academic writing is coming Q1 2025 🚀`;

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
          Join the ColabWize Waitlist
        </h2>
        <p className="text-gray-600 mb-6">
          Be among the first to experience the future of academic writing with ColabWize
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
              "Join the Waitlist"
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
