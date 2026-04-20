import { useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../api/config";


const inp = "w-full border border-white/10 bg-white/5 text-gray-100 rounded-lg px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition";

export default function ForgotPassword() {
  const [email, setEmail]           = useState("");
  const [submitted, setSubmitted]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) { setError("Something went wrong. Please try again."); return; }
      setSubmitted(true);
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="text-3xl mb-4">💰</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Reset password</h1>
          <p className="text-sm text-gray-500 mt-2">We'll send you a link to reset it</p>
        </div>

        <div className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto text-2xl">✉️</div>
              <div>
                <p className="font-semibold text-gray-100">Check your inbox</p>
                <p className="text-sm text-gray-500 mt-1">
                  We've sent a reset link to{" "}
                  <span className="font-medium text-gray-300">{email}</span>.
                </p>
              </div>
              <p className="text-xs text-gray-600 pt-1">
                Didn't receive it? Check your spam folder or{" "}
                <button onClick={() => { setSubmitted(false); setError(""); }} className="text-gray-300 font-medium hover:text-white hover:underline">
                  try again
                </button>.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}
              {/* autoComplete off + data-form-type prevents Chrome password manager alerts */}
              <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off" data-form-type="other">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="off"
                    className={inp}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors text-sm"
                >
                  {loading ? "Checking…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 mt-5">
          <Link to="/login" className="text-gray-400 font-medium hover:text-white transition-colors">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
