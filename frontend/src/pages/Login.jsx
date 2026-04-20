import { useState } from "react";
import { loginUser } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

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


const inp = "w-full border border-white/10 bg-white/5 text-gray-100 rounded-lg px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser({ email, password });
      login();
      navigate("/dashboard");
    } catch (err) {
      if (err.message?.toLowerCase().includes("verify your email")) {
        setError(
          <span>
            Your email isn't verified yet.{" "}
            <Link to="/verify-email-sent" state={{ email }} className="underline font-semibold">
              Resend verification email
            </Link>
          </span>
        );
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-3xl mb-4 hover:opacity-80 transition-opacity">💰</Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">Batua</h1>
          <p className="text-sm text-gray-500 mt-2">Sign in to your account</p>
        </div>

        <div className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inp}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-400">Password</label>
                <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className={inp + " pr-11"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm mt-1"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-5">
          Don't have an account?{" "}
          <Link to="/register" className="text-gray-300 font-semibold hover:text-white transition-colors">
            Create one
          </Link>
        </p>
        <p className="text-center mt-3">
          <Link to="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            ← Back to homepage
          </Link>
        </p>
      </div>
    </div>
  );
}
