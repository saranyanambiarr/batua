import {
  TRANSACTIONS, AREA_DATA, DAILY_SPEND, MONTHLY_TREND,
  getCategoryBreakdown, getSummary, PIE_COLORS,
} from "../data/mockData";
import CashFlowChart    from "../components/charts/CashFlowChart";
import SpendingBarChart from "../components/charts/SpendingBarChart";
import ExpensePieChart  from "../components/charts/ExpensePieChart";
import MonthlyTrendChart from "../components/charts/MonthlyTrendChart";

export default function Charts() {
  const { income, expense, balance } = getSummary(TRANSACTIONS);
  const pieData = getCategoryBreakdown(TRANSACTIONS);
  const monthLabel = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="p-8 space-y-7">

      <div>
        <h2 className="text-2xl font-bold text-gray-800">Charts</h2>
        <p className="text-sm text-gray-400 mt-0.5">Detailed visual analysis of your finances</p>
      </div>

      {/* ── Summary strip ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Income",   val: income,  color: "#22c55e" },
          { label: "Expense",  val: expense, color: "#ef4444" },
          { label: "Balance",  val: balance, color: "#6366f1" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{c.label}</p>
            <p className="text-xl font-bold" style={{ color: c.color }}>₹{c.val.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-0.5">{monthLabel}</p>
          </div>
        ))}
      </div>

      {/* ── Cash Flow (full size) ──────────────────────────────────────── */}
      <Section title="Cash Flow" subtitle="Cumulative income vs expense over the month">
        <CashFlowChart data={AREA_DATA} height={280} />
      </Section>

      {/* ── Monthly trend ─────────────────────────────────────────────── */}
      <Section title="Monthly Trend" subtitle="Income vs expense over the last 6 months">
        <MonthlyTrendChart data={MONTHLY_TREND} height={280} />
      </Section>

      {/* ── Daily spend + Pie side by side ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <Section title="Daily Spending" subtitle="Last 7 days" compact>
          <SpendingBarChart data={DAILY_SPEND} height={240} />
        </Section>

        <Section title="Expense Breakdown" subtitle="By category this month" compact>
          <ExpensePieChart data={pieData} height={200} />
          <div className="mt-4 space-y-2 px-1">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span>{d.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">
                    {Math.round((d.value / expense) * 100)}%
                  </span>
                  <span className="font-medium">₹{d.value.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

      </div>

      {/* ── Category table ────────────────────────────────────────────── */}
      <Section title="Category Summary" subtitle="All expense categories this month">
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-right">% of Total</th>
                <th className="px-5 py-3 text-right">Transactions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pieData.map((d, i) => {
                const count = TRANSACTIONS.filter(
                  t => t.category === d.name && t.type === "expense"
                ).length;
                return (
                  <tr key={d.name} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="font-medium text-gray-800">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-red-500">
                      ₹{d.value.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-500">
                      {Math.round((d.value / expense) * 100)}%
                    </td>
                    <td className="px-5 py-3 text-right text-gray-400">{count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

    </div>
  );
}

function Section({ title, subtitle, compact, children }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${compact ? "p-5" : "p-6"}`}>
      <div className="mb-4">
        <p className="font-semibold text-gray-700">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
