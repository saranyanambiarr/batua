import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../api/userApi";
import { fetchTransactions, fetchSummary } from "../api/transactionApi";
import { fetchBudgets } from "../api/budgetApi";
import { useAuth } from "../context/AuthContext";
import CashFlowChart    from "../components/charts/CashFlowChart";
import SpendingBarChart from "../components/charts/SpendingBarChart";
import ExpensePieChart  from "../components/charts/ExpensePieChart";

const PIE_COLORS = [
  "#6366f1", "#f59e0b", "#ec4899", "#10b981",
  "#ef4444", "#3b82f6", "#8b5cf6", "#14b8a6",
  "#f97316", "#84cc16",
];

function getCategoryBreakdown(transactions) {
  const expenses = transactions.filter(t => t.type === "expense");
  const map = {};
  for (const t of expenses) {
    map[t.category] = (map[t.category] || 0) + t.amount;
  }
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function buildCashFlowData(transactions) {
  // Group income and expense by date for the area chart
  const map = {};
  for (const t of transactions) {
    if (!map[t.date]) map[t.date] = { date: t.date, income: 0, expense: 0 };
    if (t.type === "income")  map[t.date].income  += t.amount;
    if (t.type === "expense") map[t.date].expense += t.amount;
  }
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

function buildDailySpend(transactions) {
  const map = {};
  for (const t of transactions.filter(t => t.type === "expense")) {
    map[t.date] = (map[t.date] || 0) + t.amount;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));
}

export default function Dashboard() {
  const [user, setUser]                 = useState(null);
  const [summary, setSummary]           = useState({ income: 0, expense: 0, balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const { logout } = useAuth();
  const navigate   = useNavigate();

  useEffect(() => {
    Promise.all([
      fetchCurrentUser(),
      fetchSummary(),
      fetchTransactions(),
      fetchBudgets().catch(() => []),   // budget service optional — don't fail dashboard if it's down
    ])
      .then(([userData, summaryData, txnData, budgetData]) => {
        setUser(userData);
        setSummary(summaryData);
        setTransactions(txnData);
        setBudgets(budgetData);
      })
      .catch(() => { setError("Session expired"); logout(); })
      .finally(() => setLoading(false));
  }, []);

  if (error)   return <p className="text-red-500 p-8">{error}</p>;
  if (loading) return <p className="p-8 text-gray-500">Loading…</p>;

  const pieData    = getCategoryBreakdown(transactions);
  const areaData   = buildCashFlowData(transactions);
  const dailySpend = buildDailySpend(transactions);
  const recent     = [...transactions].slice(0, 5);
  const monthLabel = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="p-8 space-y-7">

      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Overview</h2>
      </div>

      {/* ── Summary cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <SummaryCard label="Balance"  value={`₹${summary.balance.toLocaleString()}`} accent="#6366f1" bg="#eef2ff" sub={monthLabel} />
        <SummaryCard label="Income"   value={`₹${summary.income.toLocaleString()}`}  accent="#22c55e" bg="#f0fdf4" sub="This month" />
        <SummaryCard label="Expenses" value={`₹${summary.expense.toLocaleString()}`} accent="#ef4444" bg="#fef2f2" sub="This month" />
      </div>

      {/* ── Charts row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ChartCard title="Cash Flow" onExpand={() => navigate("/charts")}>
          {areaData.length > 0
            ? <CashFlowChart data={areaData} height={200} />
            : <Empty message="No transactions yet" />}
        </ChartCard>

        <ChartCard title="Spending by Day" onExpand={() => navigate("/charts")}>
          {dailySpend.length > 0
            ? <SpendingBarChart data={dailySpend} height={200} />
            : <Empty message="No expenses yet" />}
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
          {recent.length === 0 ? (
            <Empty message="No transactions yet" />
          ) : (
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
          )}
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
          {pieData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <Empty message="No expenses yet" />
            </div>
          ) : (
            <>
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
            </>
          )}
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
          {budgets.length === 0 ? (
            <Empty message="No budgets set yet" />
          ) : (
            <div className="space-y-3">
              {budgets.slice(0, 4).map(b => {
                const pct  = Math.min(100, Math.round((b.spent / b.amount) * 100));
                const over = b.spent > b.amount;
                const color = over ? "#ef4444" : "#6366f1";
                return (
                  <div key={b.id}>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span className="font-medium">{b.category}</span>
                      <span className={over ? "text-red-500" : ""}>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
              {budgets.length > 4 && (
                <p className="text-xs text-gray-400 text-center pt-1">+{budgets.length - 4} more</p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function Empty({ message }) {
  return (
    <p className="text-center text-gray-400 dark:text-gray-600 text-sm py-6">{message}</p>
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
