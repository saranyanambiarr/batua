import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/config";

export default function VerifyEmail() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const token      = params.get("token");
  const [status, setStatus]   = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(3);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    fetch(`${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async res => {
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully.");
        } else {
          setStatus("error");
          setMessage(data.detail || "Verification failed. The link may have expired.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Could not connect to the server. Please try again.");
      });
  }, [token]);

  // Auto-redirect countdown once verified
  useEffect(() => {
    if (status !== "success") return;
    if (countdown === 0) { navigate("/login"); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, navigate]);

  const bg = "min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950 transition-colors";

  return (
    <div className={bg}>
      <div className="w-full max-w-sm text-center">
        <div className="text-4xl mb-6">💰</div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-8 space-y-4">

          {status === "loading" && (
            <>
              <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Verifying your email…</p>
            </>
          )}

          {status === "success" && (
            <>
              {/* Animated checkmark */}
              <div className="w-16 h-16 bg-green-50 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Email verified!</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Your account is active. Redirecting to login in{" "}
                <span className="font-semibold text-gray-300">{countdown}s</span>…
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                Go to login now
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Verification failed</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500">{message}</p>
              <button
                onClick={() => navigate("/register")}
                className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                ← Back to registration
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
