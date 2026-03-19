import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, X, Loader2, AlertTriangle, Mail, Shield, Bell, Key } from "lucide-react";

type Step = "info" | "feedback" | "loading" | "done" | "already" | "error";

export const UnsubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [step, setStep] = useState<Step>("info");
  const [reasons, setReasons] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!email) setStep("error");
  }, [email]);

  const toggleReason = (reason: string) => {
    setReasons(prev => 
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const handleConfirm = async () => {
    setStep("loading");
    try {
      const res = await fetch(
        `/api/unsubscribe/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email,
            reasons,
            feedback
          }),
        }
      );
      const data = await res.json();
      if (data.alreadyUnsubscribed) {
        setStep("already");
      } else {
        setStep("done");
      }
    } catch {
      setStep("error");
    }
  };

  const UNSub_REASONS = [
    "I'm receiving too many emails",
    "The content is no longer relevant",
    "I didn't sign up for this list",
    "I'm using a different email now",
    "Technical issues / Broken links"
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)", maxWidth: "560px", width: "100%", padding: "48px 40px", textAlign: "center" }}>

        {/* Logo */}
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <img src="https://colabwize.com/images/Colabwize-logo.png" alt="ColabWize" style={{ height: "48px", width: "auto", display: "inline-block" }} />
        </div>

        {/* Step 1: Info */}
        {step === "info" && (
          <>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", marginBottom: "12px", letterSpacing: "-0.5px" }}>Email Preferences</h1>
            <p style={{ fontSize: "15px", color: "#64748b", marginBottom: "24px", lineHeight: "1.6" }}>
              Are you sure you want to stop receiving original updates and academic research tips?
            </p>
            
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 20px", display: "inline-block", fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "32px" }}>
              {email}
            </div>

            <button
              onClick={() => setStep("feedback")}
              style={{ background: "#ef4444", color: "white", border: "none", padding: "16px 32px", borderRadius: "14px", fontSize: "16px", fontWeight: "700", cursor: "pointer", width: "100%", transition: "transform 0.2s" }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#dc2626")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#ef4444")}
            >
              Unsubscribe from all
            </button>
            
            <Link to="/" style={{ textDecoration: "none" }}>
              <button style={{ background: "transparent", border: "none", color: "#64748b", padding: "16px 32px", fontSize: "14px", fontWeight: "600", cursor: "pointer", width: "100%", marginTop: "8px" }}>
                Keep my subscription
              </button>
            </Link>
          </>
        )}

        {/* Step 2: Feedback (Sorry to see you go) */}
        {step === "feedback" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>👋</div>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", marginBottom: "12px" }}>Sorry to see you go!</h1>
            <p style={{ fontSize: "15px", color: "#64748b", marginBottom: "28px", lineHeight: "1.6" }}>
              Would you mind telling us why you're unsubscribing? Your feedback helps us build a better platform.
            </p>

            <div style={{ textAlign: "left", marginBottom: "28px" }}>
              <p style={{ fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "12px" }}>Select any that apply:</p>
              {UNSub_REASONS.map(reason => (
                <label key={reason} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", cursor: "pointer", fontSize: "14px", color: "#475569" }}>
                  <input 
                    type="checkbox" 
                    checked={reasons.includes(reason)} 
                    onChange={() => toggleReason(reason)}
                    style={{ width: "18px", height: "18px", borderRadius: "4px", border: "2px solid #cbd5e1" }}
                  />
                  {reason}
                </label>
              ))}
            </div>

            <div style={{ textAlign: "left", marginBottom: "32px" }}>
              <p style={{ fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "12px" }}>Other comments (optional):</p>
              <textarea 
                placeholder="How can we improve?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                style={{ width: "100%", minHeight: "100px", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "14px", fontFamily: "inherit", resize: "vertical", background: "#fcfdfe" }}
              />
            </div>

            <button
              onClick={handleConfirm}
              style={{ background: "#111827", color: "white", border: "none", padding: "16px 32px", borderRadius: "14px", fontSize: "16px", fontWeight: "700", cursor: "pointer", width: "100%" }}
            >
              Submit & Confirm Unsubscribe
            </button>
            
            <button 
              onClick={() => setStep("info")}
              style={{ background: "transparent", border: "none", color: "#64748b", padding: "16px 32px", fontSize: "14px", fontWeight: "600", cursor: "pointer", width: "100%", marginTop: "8px" }}
            >
              &larr; Go back
            </button>
          </>
        )}

        {/* LOADING step */}
        {step === "loading" && (
          <div style={{ padding: "40px 0" }}>
            <Loader2 size={48} className="animate-spin" style={{ margin: "0 auto 24px", color: "#0ea5e9" }} />
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}>Processing...</h1>
            <p style={{ color: "#64748b", marginTop: "8px", fontSize: "14px" }}>Updating your email preferences.</p>
          </div>
        )}

        {/* DONE step */}
        {step === "done" && (
          <>
            <div style={{ fontSize: "52px", marginBottom: "20px" }}>🛡️</div>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", marginBottom: "12px" }}>Unsubscribed successfully</h1>
            <p style={{ fontSize: "15px", color: "#64748b", lineHeight: "1.7", marginBottom: "32px" }}>
              We've removed <strong>{email}</strong> from all broadcast lists. You've also stopped receiving marketing updates.
            </p>
            <Link to="/" style={{ textDecoration: "none" }}>
              <button style={{ background: "#0ea5e9", color: "white", border: "none", padding: "16px 32px", borderRadius: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer", width: "100%" }}>
                Return to ColabWize
              </button>
            </Link>
          </>
        )}

        {/* ALREADY step */}
        {step === "already" && (
          <>
            <CheckCircle2 size={52} color="#10b981" style={{ margin: "0 auto 20px" }} />
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", marginBottom: "12px" }}>Already opted out</h1>
            <p style={{ fontSize: "15px", color: "#64748b", marginBottom: "32px" }}>
              This email address <strong>{email}</strong> is already removed from our lists.
            </p>
            <Link to="/" style={{ textDecoration: "none" }}>
              <button style={{ background: "#111827", color: "white", border: "none", padding: "16px 32px", borderRadius: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer", width: "100%" }}>
                Go to Homepage
              </button>
            </Link>
          </>
        )}

        {/* ERROR step */}
        {step === "error" && (
          <>
            <AlertTriangle size={52} color="#f59e0b" style={{ margin: "0 auto 20px" }} />
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", marginBottom: "12px" }}>Invalid Link</h1>
            <p style={{ fontSize: "15px", color: "#64748b", marginBottom: "32px" }}>
              This link is invalid. Please contact <a href="mailto:support@colabwize.com" style={{ color: "#0ea5e9", fontWeight: "600" }}>support@colabwize.com</a> if you're having trouble.
            </p>
            <Link to="/" style={{ textDecoration: "none" }}>
              <button style={{ background: "#111827", color: "white", border: "none", padding: "16px 32px", borderRadius: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer", width: "100%" }}>
                Return to Home
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default UnsubscribePage;
