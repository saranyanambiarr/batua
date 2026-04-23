import { useState, useEffect } from "react";
import { fetchBudgets, createBudget, deleteBudget } from "../api/budgetApi";

const CATEGORIES = [
  "Food", "Transport", "Shopping", "Entertainment", "Movie",
  "Netflix", "Amazon Prime", "Claude", "ChatGPT", "Cursor",
  "Gemini", "Google One", "WiFi", "Water", "Electricity", "Gas",
  "Land Tax", "Home Loan EMI", "Edu Loan EMI", "Personal Loan EMI",
  "Other EMI", "Salon", "Gym", "Yoga", "SIP", "Stocks",
  "Investments", "Repairs", "Gifts", "Groceries", "Utilities",
  "Health", "Travel", "Other",
];

const COLORS = [
  "#6366f1", "#f59e0b", "#ec4899", "#10b981",
  "#ef4444", "#3b82f6", "#8b5cf6", "#14b8a6",
  "#f97316", "#84cc16",
];

function categoryColor(category) {
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = category.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Budgets() {
  const [budgets, setBudgets]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ category: "", amount: "" });
  const [formError, setFormError]   = useState("");
  const [saving, setSaving]         = useState(false);

  async function load() {
    try {
      setLoading(true);
      setBudgets(await fetchBudgets());
      setError("");
    } catch {
      setError("Could not load budgets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!form.category || !form.amount) { setFormError("Both fields are required."); return; }
    setSaving(true);
    setFormError("");
    try {
      const created = await createBudget({ category: form.category, amount: Number(form.amount) });
      setBudgets(prev => [...prev, created]);
      setForm({ category: "", amount: "" });
      setShowForm(false);
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this budget?")) return;
    try {
      await deleteBudget(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch {
      setError("Failed to delete budget.");
    }
  }

  const totalBudget    = budgets.reduce((a, b) => a + b.amount, 0);
  const totalSpent     = budgets.reduce((a, b) => a + b.spent,  0);
  const overBudgetList = budgets.filter(b => b.spent > b.amount);

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Budgets</h2>
          <p className="text-sm text-gray-400 mt-0.5">Set and track monthly spending limits</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setFormError(""); }}
          className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Budget
        </button>
      </div>

      {/* Over-budget alert */}
      {overBudgetList.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-red-500 text-lg mt-0.5">⚠</span>
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              {overBudgetList.length} {overBudgetList.length === 1 ? "category is" : "categories are"} over budget this month
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              {overBudgetList.map(b => b.category).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-indigo-100 dark:border-indigo-900 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Total Budget</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">₹{totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-900 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Total Spent</p>
          <p className="text-2xl font-bold text-red-500 mt-1">₹{totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-green-100 dark:border-green-900 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Remaining</p>
          <p className={`text-2xl font-bold mt-1 ${totalBudget - totalSpent < 0 ? "text-red-500" : "text-green-600"}`}>
            ₹{(totalBudget - totalSpent).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">New Budget</h3>
          <div className="flex gap-3 flex-wrap">
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="number"
              placeholder="Monthly limit (₹)"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              onClick={handleAdd}
              disabled={saving}
              className="bg-indigo-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => { setShowForm(false); setFormError(""); }}
              className="text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              Cancel
            </button>
          </div>
          {formError && <p className="text-xs text-red-500 mt-2">{formError}</p>}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 text-red-500 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Budget cards */}
      {loading ? (
        <p className="text-center text-gray-400 text-sm py-12">Loading…</p>
      ) : budgets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">◎</p>
          <p className="text-sm">No budgets yet. Click <strong>+ New Budget</strong> to set a monthly limit.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(b => {
            const color = categoryColor(b.category);
            const pct   = Math.min(100, Math.round((b.spent / b.amount) * 100));
            const over  = b.spent > b.amount;
            return (
              <div key={b.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 group relative">

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(b.id)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all text-lg leading-none"
                  title="Delete budget"
                >
                  ×
                </button>

                <div className="flex items-center justify-between mb-3 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{b.category}</span>
                  </div>
                  <span className={`text-sm font-medium ${over ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}>
                    {over ? "Over budget!" : `${pct}% used`}
                  </span>
                </div>

                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: over ? "#ef4444" : color }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-400">
                  <span>₹{b.spent.toLocaleString()} spent</span>
                  <span>₹{b.amount.toLocaleString()} limit</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
