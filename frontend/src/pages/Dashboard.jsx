import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import {
  TRANSACTIONS, BUDGETS, AREA_DATA, DAILY_SPEND,
  getCategoryBreakdown, getSummary, PIE_COLORS,
} from "../data/mockData";
import CashFlowChart    from "../components/charts/CashFlowChart";
import SpendingBarChart from "../components/charts/SpendingBarChart";
import ExpensePieChart  from "../components/charts/ExpensePieChart";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const { logout } = useAuth();
  const navigate   = useNavigate();

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => { setError("Session expired"); logout(); });
  }, []);

  if (error) return <p className="text-red-500 p-8">{error}</p>;
  if (!user)  return <p className="p-8 text-gray-500">Loading…</p>;

  const { income, expense, balance } = getSummary(TRANSACTIONS);
  const pieData  = getCategoryBreakdown(TRANSACTIONS);
  const recent   = [...TRANSACTIONS].sort((a, b) => b.id - a.id).slice(0, 5);
  const monthLabel = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="p-8 space-y-7">

      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Overview</h2>
      </div>

      {/* ── Summary cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <SummaryCard label="Balance"  value={`₹${balance.toLocaleString()}`} accent="#6366f1" bg="#eef2ff" sub={monthLabel} />
        <SummaryCard label="Income"   value={`₹${income.toLocaleString()}`}  accent="#22c55e" bg="#f0fdf4" sub="This month" />
        <SummaryCard label="Expenses" value={`₹${expense.toLocaleString()}`} accent="#ef4444" bg="#fef2f2" sub="This month" />
      </div>

      {/* ── Charts row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ChartCard
          title="Cash Flow"
          onExpand={() => navigate("/charts")}
        >
          <CashFlowChart data={AREA_DATA} height={200} />
        </ChartCard>

        <ChartCard
          title="Spending by Day"
          onExpand={() => navigate("/charts")}
        >
          <SpendingBarChart data={DAILY_SPEND} height={200} />
        </ChartCard>
      </div>

      {/* ── Bottom row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Recent transactions */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-gray-700 dark:text-gray-200">Recent Transactions</p>
            <button
              onClick={() => navigate("/transactions")}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {recent.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{t.type === "income" ? "💰" : "💸"}</span>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200 leading-tight">{t.category}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs">{t.date}</p>
                  </div>
                </div>
                <span className={`font-semibold ${t.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                  {t.type === "income" ? "+" : "−"}₹{t.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense pie */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-gray-700 dark:text-gray-200">Expense Breakdown</p>
            <button
              onClick={() => navigate("/charts")}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Details →
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <ExpensePieChart data={pieData} height={170} />
          </div>
          <div className="mt-2 space-y-1.5">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {d.name}
                </div>
                <span className="font-medium">₹{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budgets summary */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-gray-700 dark:text-gray-200">Budgets</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">{monthLabel}</span>
              <button
                onClick={() => navigate("/budgets")}
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Manage →
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {BUDGETS.map((b) => {
              const pct  = Math.min(100, Math.round((b.spent / b.budget) * 100));
              const over = b.spent > b.budget;
              return (
                <div key={b.category}>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span className="font-medium">{b.category}</span>
                    <span className={over ? "text-red-500 font-semibold" : ""}>
                      ₹{b.spent.toLocaleString()} / ₹{b.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: over ? "#ef4444" : b.color }}
                    />
                  </div>
                  <p className="text-right text-xs text-gray-400 dark:text-gray-500 mt-0.5">{pct}%</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

function SummaryCard({ label, value, accent, bg, sub }) {
  return (
    <div className="rounded-2xl p-5 shadow-sm border" style={{ background: bg, borderColor: accent + "33" }}>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <h3 className="text-2xl font-bold" style={{ color: accent }}>{value}</h3>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, onExpand, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-gray-700 dark:text-gray-200">{title}</p>
        <button
          onClick={onExpand}
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Full view →
        </button>
      </div>
      {children}
    </div>
  );
}
