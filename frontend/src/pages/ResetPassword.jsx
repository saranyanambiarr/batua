import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../api/config";

const inp = "w-full border border-white/10 bg-white/5 text-gray-100 rounded-lg px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition";

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

const RULES = [
  { id: "len",     label: "At least 8 characters",        test: p => p.length >= 8 },
  { id: "upper",   label: "One uppercase letter (A–Z)",    test: p => /[A-Z]/.test(p) },
  { id: "lower",   label: "One lowercase letter (a–z)",    test: p => /[a-z]/.test(p) },
  { id: "number",  label: "One number (0–9)",              test: p => /[0-9]/.test(p) },
  { id: "special", label: "One special character (!@#$…)", test: p => /[^A-Za-z0-9]/.test(p) },
];

function PasswordChecklist({ password }) {
  if (!password) return null;
  return (
    <ul className="mt-2.5 space-y-1.5">
      {RULES.map(r => {
        const ok = r.test(password);
        return (
          <li key={r.id} className={`flex items-center gap-2 text-xs ${ok ? "text-green-400" : "text-gray-600"}`}>
            <span className="w-3 text-center">{ok ? "✓" : "○"}</span>
            {r.label}
          </li>
        );
      })}
    </ul>
  );
}

export default function ResetPassword() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const token      = params.get("token");

  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState(false);

  const passwordValid = RULES.every(r => r.test(password));

  if (!token) {
    return (
      <div className="auth-bg min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="text-3xl">💰</div>
          <div className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm space-y-3">
            <p className="text-red-400 text-sm">Invalid or missing reset link.</p>
            <Link to="/forgot-password" className="text-gray-400 text-sm hover:text-white transition-colors">
              ← Request a new one
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!passwordValid) {
      setError("Password does not meet all requirements.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.detail || "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Choose a new password</h1>
          <p className="text-sm text-gray-500 mt-2">Enter a strong password to secure your account</p>
        </div>

        <div className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold text-gray-100">Password updated!</p>
              <p className="text-sm text-gray-500">Redirecting you to login…</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">New password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className={inp + " pr-11"}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                  <PasswordChecklist password={password} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Confirm password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your new password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                      className={inp + " pr-11"}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !passwordValid}
                  className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors text-sm"
                >
                  {loading ? "Updating…" : "Set new password"}
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
