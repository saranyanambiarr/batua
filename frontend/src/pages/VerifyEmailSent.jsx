import { useState } from "react";
import { useLocation, Link } from "react-router-dom";


export default function VerifyEmailSent() {
  const { state }  = useLocation();
  const email      = state?.email || "your email";
  const [resent, setResent]   = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    setLoading(true);
    // TODO: wire to real resend endpoint
    await new Promise(r => setTimeout(r, 800));
    setResent(true);
    setLoading(false);
  }

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="text-3xl mb-4">💰</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Check your inbox</h1>
        </div>

        <div className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm text-center space-y-5">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto text-3xl">✉️</div>
          <div>
            <p className="font-semibold text-gray-100">Verify your email address</p>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              We sent a verification link to{" "}
              <span className="font-medium text-gray-300">{email}</span>.
              Click the link to activate your account.
            </p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-xs text-amber-400 text-left">
            ⚠️ You must verify your email before logging in. Check your spam folder if you don't see it.
          </div>
          {resent ? (
            <p className="text-sm text-green-400 font-medium">Verification email resent!</p>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-sm text-gray-400 hover:text-white font-medium disabled:opacity-50 transition-colors underline"
            >
              {loading ? "Sending…" : "Resend verification email"}
            </button>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 mt-5">
          Already verified?{" "}
          <Link to="/login" className="text-gray-300 font-semibold hover:text-white transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
