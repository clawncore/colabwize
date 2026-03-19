import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, X, Loader2, AlertTriangle, Mail, Shield, Bell, Key } from "lucide-react";

type Step = "info" | "loading" | "done" | "already" | "error";

export const UnsubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [step, setStep] = useState<Step>("info");

  useEffect(() => {
    if (!email) setStep("error");
  }, [email]);

  const handleConfirm = async () => {
    setStep("loading");
    try {
      const res = await fetch(
        `/api/unsubscribe/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
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

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 8px 40px rgba(0,0,0,0.10)", maxWidth: "520px", width: "100%", padding: "48px 40px", textAlign: "center" }}>

        {/* Logo */}
        <img src="https://colabwize.com/email_logo.png" alt="ColabWize" style={{ height: "44px", width: "auto", marginBottom: "28px" }} />

        {/* INFO step */}
        {step === "info" && (
          <>
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", marginBottom: "8px" }}>Email Preferences</h1>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px", lineHeight: "1.6" }}>
              You are managing email preferences for:
            </p>
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "10px 20px", display: "inline-block", fontSize: "14px", fontWeight: "bold", color: "#0369a1", marginBottom: "28px" }}>
              {email}
            </div>

            <div style={{ background: "#fafafa", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", textAlign: "left", marginBottom: "20px" }}>
              <p style={{ fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "12px" }}>If you unsubscribe, you will stop receiving:</p>
              {["Platform news & feature announcements", "Research tips and tutorials", "Promotional offers and discounts", "Mass broadcast communications"].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 0", fontSize: "13px", color: "#6b7280" }}>
                  <X size={14} color="#ef4444" strokeWidth={2.5} /> {item}
                </div>
              ))}
            </div>

            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "20px", textAlign: "left", marginBottom: "28px" }}>
              <p style={{ fontSize: "13px", fontWeight: "700", color: "#065f46", marginBottom: "12px" }}>You will always still receive:</p>
              {[
                { icon: <Key size={14} color="#10b981" />, text: "Verification codes (OTP)" },
                { icon: <Shield size={14} color="#10b981" />, text: "Password reset emails" },
                { icon: <Bell size={14} color="#10b981" />, text: "Security & login alerts" },
                { icon: <Mail size={14} color="#10b981" />, text: "Direct support replies" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 0", fontSize: "13px", color: "#374151" }}>
                  {icon} {text}
                </div>
              ))}
            </div>

            <button
              onClick={handleConfirm}
              style={{ background: "#ef4444", color: "white", border: "none", padding: "14px 32px", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer", width: "100%", marginBottom: "12px" }}
            >
              Confirm Unsubscribe
            </button>
            <Link to="/">
              <button style={{ background: "#f9fafb", border: "1px solid #d1d5db", color: "#6b7280", padding: "13px 32px", borderRadius: "12px", fontSize: "14px", cursor: "pointer", width: "100%" }}>
                Keep my subscription
              </button>
            </Link>

            <p style={{ marginTop: "20px", fontSize: "11px", color: "#9ca3af" }}>
              Need help? <a href="mailto:support@colabwize.com" style={{ color: "#0ea5e9" }}>support@colabwize.com</a>
            </p>
          </>
        )}

        {/* LOADING step */}
        {step === "loading" && (
          <>
            <Loader2 size={48} color="#0ea5e9" style={{ margin: "0 auto 20px", animation: "spin 1s linear infinite" }} />
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}>Processing...</h1>
            <p style={{ color: "#6b7280", marginTop: "8px", fontSize: "14px" }}>Updating your email preferences.</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {/* DONE step */}
        {step === "done" && (
          <>
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>👋</div>
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", marginBottom: "8px" }}>You've been unsubscribed</h1>
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "10px 20px", display: "inline-block", fontSize: "14px", fontWeight: "bold", color: "#0369a1", marginBottom: "20px" }}>
              {email}
            </div>
            <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.7", marginBottom: "28px" }}>
              We've removed you from our broadcast list. You won't receive any more marketing emails from ColabWize.<br /><br />
              If you have feedback on how we can improve, we'd love to hear it at <a href="mailto:support@colabwize.com" style={{ color: "#0ea5e9" }}>support@colabwize.com</a>.
            </p>
            <Link to="/">
              <button style={{ background: "#0ea5e9", color: "white", border: "none", padding: "14px 32px", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", width: "100%" }}>
                Return to ColabWize
              </button>
            </Link>
          </>
        )}

        {/* ALREADY step */}
        {step === "already" && (
          <>
            <CheckCircle2 size={52} color="#10b981" style={{ margin: "0 auto 16px" }} />
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", marginBottom: "8px" }}>Already opted out</h1>
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "10px 20px", display: "inline-block", fontSize: "14px", fontWeight: "bold", color: "#0369a1", margin: "10px 0 20px" }}>
              {email}
            </div>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "28px" }}>
              This email address is already removed from our broadcast list.
            </p>
            <Link to="/">
              <button style={{ background: "#0ea5e9", color: "white", border: "none", padding: "14px 32px", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", width: "100%" }}>
                Return to ColabWize
              </button>
            </Link>
          </>
        )}

        {/* ERROR step */}
        {step === "error" && (
          <>
            <AlertTriangle size={48} color="#f59e0b" style={{ margin: "0 auto 16px" }} />
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", marginBottom: "8px" }}>Invalid Link</h1>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "28px" }}>
              This unsubscribe link appears to be invalid or expired. Please use the link from your email, or contact us at <a href="mailto:support@colabwize.com" style={{ color: "#0ea5e9" }}>support@colabwize.com</a>.
            </p>
            <Link to="/">
              <button style={{ background: "#0ea5e9", color: "white", border: "none", padding: "14px 32px", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", width: "100%" }}>
                Return to ColabWize
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default UnsubscribePage;
