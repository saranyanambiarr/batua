import { useState } from "react";

const INITIAL_BUDGETS = [
  { id: 1, category: "Food",          budget: 5000,  spent: 2150,  color: "#6366f1" },
  { id: 2, category: "Shopping",      budget: 4000,  spent: 3200,  color: "#f59e0b" },
  { id: 3, category: "Entertainment", budget: 2000,  spent: 1500,  color: "#ec4899" },
  { id: 4, category: "Transport",     budget: 1500,  spent: 800,   color: "#10b981" },
  { id: 5, category: "Utilities",     budget: 3000,  spent: 2100,  color: "#ef4444" },
];

const COLORS = ["#6366f1", "#f59e0b", "#ec4899", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6"];

export default function Budgets() {
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [form, setForm] = useState({ category: "", budget: "" });
  const [showForm, setShowForm] = useState(false);

  function addBudget() {
    if (!form.category || !form.budget) return;
    setBudgets([
      ...budgets,
      {
        id: Date.now(),
        category: form.category,
        budget: Number(form.budget),
        spent: 0,
        color: COLORS[budgets.length % COLORS.length],
      },
    ]);
    setForm({ category: "", budget: "" });
    setShowForm(false);
  }

  const totalBudget = budgets.reduce((a, b) => a + b.budget, 0);
  const totalSpent  = budgets.reduce((a, b) => a + b.spent,  0);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Budgets</h2>
          <p className="text-sm text-gray-400 mt-0.5">Set and track monthly spending limits</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Budget
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-indigo-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Total Budget</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">₹{totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Total Spent</p>
          <p className="text-2xl font-bold text-red-500 mt-1">₹{totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-green-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Remaining</p>
          <p className="text-2xl font-bold text-green-600 mt-1">₹{(totalBudget - totalSpent).toLocaleString()}</p>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">New Budget</h3>
          <div className="flex gap-3">
            <input
              placeholder="Category"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <input
              type="number"
              placeholder="Monthly limit (₹)"
              value={form.budget}
              onChange={e => setForm({ ...form, budget: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button onClick={addBudget} className="bg-indigo-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-indigo-700">
              Save
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Budget cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map(b => {
          const pct  = Math.min(100, Math.round((b.spent / b.budget) * 100));
          const over = b.spent > b.budget;
          return (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: b.color }} />
                  <span className="font-semibold text-gray-800">{b.category}</span>
                </div>
                <span className={`text-sm font-medium ${over ? "text-red-500" : "text-gray-500"}`}>
                  {over ? "Over budget!" : `${pct}% used`}
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: over ? "#ef4444" : b.color }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>₹{b.spent.toLocaleString()} spent</span>
                <span>₹{b.budget.toLocaleString()} limit</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
