import { useNavigate } from "react-router-dom";

const FEATURES = [
  {
    icon: "📊",
    title: "Smart Dashboard",
    desc: "Get a bird's-eye view of your income, expenses, and balance at a glance.",
  },
  {
    icon: "🎯",
    title: "Budget Tracking",
    desc: "Set monthly limits per category and get notified before you overspend.",
  },
  {
    icon: "📅",
    title: "Calendar View",
    desc: "See every transaction mapped to the day it happened — no surprises.",
  },
  {
    icon: "📤",
    title: "Easy Export",
    desc: "Download your data as CSV any time. Your money, your data.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya S.",
    role: "Freelancer",
    text: "Batua finally made me understand where my money goes each month. Couldn't live without it!",
  },
  {
    name: "Arjun M.",
    role: "Software Engineer",
    text: "The budget tracker alone saved me ₹8,000 last month by catching my impulse shopping early.",
  },
  {
    name: "Divya R.",
    role: "Student",
    text: "Super simple to use. Set up in 2 minutes and immediately saw my spending patterns.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="auth-bg min-h-screen font-sans text-gray-100">

      {/* ── Navbar ── */}
      <header className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span className="text-xl font-bold text-white tracking-tight">Batua</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => navigate("/register")}
            className="text-sm bg-white text-gray-900 px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-sm"
          >
            Get started
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-8 pt-20 pb-24 text-center">
        <div className="inline-block bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
          Free personal finance tracker
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          Take control of<br />
          <span className="text-gray-400">your money</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Track income, set budgets, spot trends — all in one clean dashboard.
          No spreadsheets, no chaos.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate("/register")}
            className="bg-white text-gray-900 px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-base shadow-md"
          >
            Start for free
          </button>
          <button
            onClick={() => navigate("/login")}
            className="text-gray-300 border border-white/15 bg-white/5 px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors font-semibold text-base"
          >
            Log in
          </button>
        </div>

        {/* Hero mockup card */}
        <div className="mt-16 bg-gray-900 rounded-3xl shadow-2xl border border-white/10 p-6 text-left max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-3 text-xs text-gray-600 font-mono">batua · overview</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Balance",  val: "₹52,050", color: "#e2e8f0", bg: "rgba(255,255,255,0.05)" },
              { label: "Income",   val: "₹63,000", color: "#4ade80", bg: "rgba(74,222,128,0.08)"  },
              { label: "Expenses", val: "₹10,950", color: "#f87171", bg: "rgba(248,113,113,0.08)" },
            ].map(c => (
              <div key={c.label} className="rounded-xl p-3" style={{ background: c.bg }}>
                <p className="text-xs text-gray-500 mb-1">{c.label}</p>
                <p className="text-lg font-bold" style={{ color: c.color }}>{c.val}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[
              { cat: "Salary",   amount: "+₹55,000", type: "income",  date: "Apr 1" },
              { cat: "Shopping", amount: "−₹3,200",  type: "expense", date: "Apr 3" },
              { cat: "Food",     amount: "−₹1,200",  type: "expense", date: "Apr 2" },
            ].map(t => (
              <div key={t.cat} className="flex items-center justify-between py-2 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <span>{t.type === "income" ? "💰" : "💸"}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-300">{t.cat}</p>
                    <p className="text-xs text-gray-600">{t.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${t.type === "income" ? "text-green-400" : "text-red-400"}`}>
                  {t.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-5xl mx-auto px-8 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-3">Everything you need</h2>
        <p className="text-gray-500 text-center mb-12 text-sm">Built for individuals who want clarity without complexity.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:bg-white/8 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-200 mb-1.5 text-sm">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="max-w-4xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">People love Batua</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-sm text-gray-400 leading-relaxed mb-5">"{t.text}"</p>
              <div>
                <p className="font-semibold text-gray-200 text-sm">{t.name}</p>
                <p className="text-xs text-gray-600">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-2xl mx-auto px-8 py-20 text-center">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to get started?</h2>
          <p className="text-gray-500 mb-8 text-sm">It's free. No credit card required.</p>
          <button
            onClick={() => navigate("/register")}
            className="bg-white text-gray-900 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors text-sm"
          >
            Create your free account
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} Batua. Built with care.
      </footer>
    </div>
  );
}
