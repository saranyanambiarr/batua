import { useState, useEffect } from "react";
import { fetchTransactions, fetchSummary } from "../api/transactionApi";
import CashFlowChart     from "../components/charts/CashFlowChart";
import SpendingBarChart  from "../components/charts/SpendingBarChart";
import ExpensePieChart   from "../components/charts/ExpensePieChart";
import MonthlyTrendChart from "../components/charts/MonthlyTrendChart";

const PIE_COLORS = [
  "#6366f1", "#f59e0b", "#ec4899", "#10b981",
  "#ef4444", "#3b82f6", "#8b5cf6", "#14b8a6",
  "#f97316", "#84cc16",
];

// ── Data builders ─────────────────────────────────────────────────────────────

function getCategoryBreakdown(transactions) {
  const map = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function buildCashFlow(transactions) {
  const map = {};
  transactions.forEach(t => {
    if (!map[t.date]) map[t.date] = { date: t.date, income: 0, expense: 0 };
    if (t.type === "income")  map[t.date].income  += t.amount;
    if (t.type === "expense") map[t.date].expense += t.amount;
  });
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

function buildDailySpend(transactions) {
  const map = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    map[t.date] = (map[t.date] || 0) + t.amount;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));
}

function buildMonthlyTrend(transactions) {
  // Group all transactions by YYYY-MM, compute income/expense per month
  const map = {};
  transactions.forEach(t => {
    const key = t.date.slice(0, 7); // "2026-04"
    if (!map[key]) map[key] = { month: key, income: 0, expense: 0 };
    if (t.type === "income")  map[key].income  += t.amount;
    if (t.type === "expense") map[key].expense += t.amount;
  });
  return Object.values(map)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6) // last 6 months
    .map(d => ({
      ...d,
      month: new Date(d.month + "-01").toLocaleString("default", { month: "short", year: "2-digit" }),
    }));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Charts() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary]           = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");

  const monthLabel = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  useEffect(() => {
    Promise.all([fetchTransactions(), fetchSummary()])
      .then(([txns, sum]) => { setTransactions(txns); setSummary(sum); })
      .catch(() => setError("Failed to load data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-8 text-gray-400 text-sm">Loading…</p>;
  if (error)   return <p className="p-8 text-red-500 text-sm">{error}</p>;

  const pieData      = getCategoryBreakdown(transactions);
  const cashFlow     = buildCashFlow(transactions);
  const dailySpend   = buildDailySpend(transactions);
  const monthlyTrend = buildMonthlyTrend(transactions);
  const { income, expense } = summary;

  const isEmpty = transactions.length === 0;

  return (
    <div className="p-8 space-y-7">

      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Charts</h2>
        <p className="text-sm text-gray-400 mt-0.5">Visual analysis of your finances</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Income",  val: income,           color: "#22c55e" },
          { label: "Expense", val: expense,           color: "#ef4444" },
          { label: "Balance", val: income - expense,  color: "#6366f1" },
        ].map(c => (
          <div key={c.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{c.label}</p>
            <p className="text-xl font-bold" style={{ color: c.color }}>₹{c.val.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-0.5">{monthLabel}</p>
          </div>
        ))}
      </div>

      {isEmpty ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-16 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No transactions yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first transaction to see charts here.</p>
        </div>
      ) : (
        <>
          {/* Cash Flow */}
          <Section title="Cash Flow" subtitle="Income vs expense by day">
            <CashFlowChart data={cashFlow} height={280} />
          </Section>

          {/* Monthly Trend */}
          {monthlyTrend.length > 1 && (
            <Section title="Monthly Trend" subtitle="Income vs expense over the last 6 months">
              <MonthlyTrendChart data={monthlyTrend} height={280} />
            </Section>
          )}

          {/* Daily Spend + Pie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Section title="Daily Spending" subtitle="Expense per day" compact>
              {dailySpend.length > 0
                ? <SpendingBarChart data={dailySpend} height={240} />
                : <Empty message="No expenses yet" />}
            </Section>

            <Section title="Expense Breakdown" subtitle={`By category — ${monthLabel}`} compact>
              {pieData.length > 0 ? (
                <>
                  <ExpensePieChart data={pieData} height={200} />
                  <div className="mt-4 space-y-2 px-1">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span>{d.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400">{expense > 0 ? Math.round((d.value / expense) * 100) : 0}%</span>
                          <span className="font-medium">₹{d.value.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <Empty message="No expenses yet" />
              )}
            </Section>
          </div>

          {/* Category table */}
          {pieData.length > 0 && (
            <Section title="Category Summary" subtitle="All expense categories">
              <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-400 uppercase">
                    <tr>
                      <th className="px-5 py-3 text-left">Category</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                      <th className="px-5 py-3 text-right">% of Total</th>
                      <th className="px-5 py-3 text-right">Transactions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {pieData.map((d, i) => {
                      const count = transactions.filter(t => t.category === d.name && t.type === "expense").length;
                      return (
                        <tr key={d.name} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span className="font-medium text-gray-800 dark:text-gray-100">{d.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right font-semibold text-red-500">₹{d.value.toLocaleString()}</td>
                          <td className="px-5 py-3 text-right text-gray-500">{expense > 0 ? Math.round((d.value / expense) * 100) : 0}%</td>
                          <td className="px-5 py-3 text-right text-gray-400">{count}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, subtitle, compact, children }) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 ${compact ? "p-5" : "p-6"}`}>
      <div className="mb-4">
        <p className="font-semibold text-gray-700 dark:text-gray-200">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Empty({ message }) {
  return <p className="text-center text-gray-400 text-sm py-10">{message}</p>;
}
