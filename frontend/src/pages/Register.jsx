import { useState } from "react";
import { registerUser } from "../api/userApi";
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

function LegalModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#111111] rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col border border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-200 text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-5 overflow-y-auto text-sm text-gray-400 leading-relaxed space-y-3">{children}</div>
        <div className="px-6 py-4 border-t border-white/10">
          <button onClick={onClose} className="w-full bg-white text-gray-900 text-sm py-2.5 rounded-lg hover:bg-gray-100 transition-colors font-semibold">Got it</button>
        </div>
      </div>
    </div>
  );
}


const inp = "w-full border border-white/10 bg-white/5 text-gray-100 rounded-lg px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [modal, setModal]   = useState(null);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));
  const passwordValid = RULES.every(r => r.test(form.password));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!passwordValid) { setError("Password does not meet all requirements."); return; }
    setLoading(true);
    try {
      await registerUser({ email: form.email, password: form.password });
      navigate("/verify-email-sent", { state: { email: form.email } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {modal === "terms" && (
        <LegalModal title="Terms of Service" onClose={() => setModal(null)}>
          <p><strong className="text-gray-200">1. Acceptance</strong><br />By creating an account you agree to these terms.</p>
          <p><strong className="text-gray-200">2. Use of Service</strong><br />Batua is a personal finance tracking tool. You are responsible for the accuracy of data you enter.</p>
          <p><strong className="text-gray-200">3. Account Security</strong><br />You are responsible for keeping your credentials confidential.</p>
          <p><strong className="text-gray-200">4. Data</strong><br />We store your transaction data to provide the service. We do not sell your data to third parties.</p>
          <p><strong className="text-gray-200">5. Termination</strong><br />We reserve the right to terminate accounts that violate these terms.</p>
        </LegalModal>
      )}
      {modal === "privacy" && (
        <LegalModal title="Privacy Policy" onClose={() => setModal(null)}>
          <p><strong className="text-gray-200">1. What we collect</strong><br />Your email and financial transactions you enter. HTTP-only cookies for authentication.</p>
          <p><strong className="text-gray-200">2. How we use it</strong><br />Solely to provide and improve the Batua service.</p>
          <p><strong className="text-gray-200">3. Third parties</strong><br />We do not share, sell, or rent your personal data.</p>
          <p><strong className="text-gray-200">4. Data retention</strong><br />Retained while your account is active. You may request deletion at any time.</p>
        </LegalModal>
      )}

      <div className="auth-bg min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <Link to="/" className="inline-block text-3xl mb-4 hover:opacity-80 transition-opacity">💰</Link>
            <h1 className="text-3xl font-bold text-white tracking-tight">Create an account</h1>
            <p className="text-sm text-gray-500 mt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-gray-300 font-semibold hover:text-white transition-colors">Log in</Link>
            </p>
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
                <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required autoComplete="email" className={inp} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={set("password")}
                    required
                    className={inp + " pr-11"}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    <EyeIcon open={showPw} />
                  </button>
                </div>
                <PasswordChecklist password={form.password} />
              </div>

              <label className="flex items-start gap-3 text-xs text-gray-500 cursor-pointer pt-1">
                <input type="checkbox" required className="mt-0.5 flex-shrink-0 accent-white" />
                <span>
                  I agree to the{" "}
                  <button type="button" onClick={() => setModal("terms")} className="text-gray-300 font-medium hover:text-white hover:underline">Terms of Service</button>
                  {" "}and{" "}
                  <button type="button" onClick={() => setModal("privacy")} className="text-gray-300 font-medium hover:text-white hover:underline">Privacy Policy</button>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm mt-1"
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>
          </div>
        <p className="text-center mt-3">
          <Link to="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            ← Back to homepage
          </Link>
        </p>
        </div>
      </div>
    </>
  );
}
