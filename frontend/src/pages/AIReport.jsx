import { useState } from "react";
import { generateReport } from "../api/agentApi";

// ── Date helpers ───────────────────────────────────────────────────────────────

function toISO(d) {
  return d.toISOString().split("T")[0];
}

function getRange(preset) {
  const now   = new Date();
  const y     = now.getFullYear();
  const m     = now.getMonth();
  if (preset === "this_month")    return { start: toISO(new Date(y, m, 1)),     end: toISO(new Date(y, m + 1, 0)) };
  if (preset === "last_month")    return { start: toISO(new Date(y, m - 1, 1)), end: toISO(new Date(y, m, 0)) };
  if (preset === "last_3_months") return { start: toISO(new Date(y, m - 2, 1)), end: toISO(new Date(y, m + 1, 0)) };
  if (preset === "last_6_months") return { start: toISO(new Date(y, m - 5, 1)), end: toISO(new Date(y, m + 1, 0)) };
  return null;
}

const PRESETS = [
  { label: "This month",    value: "this_month"    },
  { label: "Last month",    value: "last_month"    },
  { label: "Last 3 months", value: "last_3_months" },
  { label: "Last 6 months", value: "last_6_months" },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col gap-1">
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        ₹{Math.abs(value).toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function SparkBar({ pct }) {
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-1">
      <div
        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AIReport() {
  const [preset,    setPreset]    = useState("this_month");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [result,    setResult]    = useState(null);

  async function handleGenerate() {
    const range = getRange(preset);
    if (!range) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await generateReport({ start_date: range.start, end_date: range.end });
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const stats  = result?.stats;
  const report = result?.report;

  return (
    <div className="p-8 space-y-8 max-w-3xl">

      {/* ── Header ── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">AI Report</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Get a plain-English analysis of your spending, powered by Claude
        </p>
      </div>

      {/* ── Controls ── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-5">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Period</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => { setPreset(p.value); setResult(null); setError(""); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  preset === p.value
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:text-indigo-600"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <LoadingDots />
              <span>Analysing your spending…</span>
            </>
          ) : (
            <>
              <span>✦</span>
              <span>Generate Report</span>
            </>
          )}
        </button>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>

      {/* ── Report output ── */}
      {result && stats && report && (
        <div className="space-y-6 animate-fade-in">

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Income"   value={stats.total_income}  color="text-green-600 dark:text-green-400" />
            <StatCard label="Expenses" value={stats.total_expense} color="text-red-500 dark:text-red-400" />
            <StatCard
              label="Savings"
              value={stats.net_savings}
              color={stats.net_savings >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-red-500"}
            />
          </div>

          {/* Top categories */}
          {stats.top_categories.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Top Spending Categories
              </p>
              <div className="space-y-3">
                {stats.top_categories.map(cat => (
                  <div key={cat.category}>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{cat.category}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        ₹{cat.amount.toLocaleString("en-IN")}
                        <span className="text-xs ml-1 text-gray-400">({cat.pct}%)</span>
                      </span>
                    </div>
                    <SparkBar pct={cat.pct} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI narrative */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-indigo-500">✦</span>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">AI Analysis</p>
            </div>

            {/* Narrative paragraphs */}
            <div className="space-y-3">
              {report.narrative.split("\n\n").map((para, i) => (
                <p key={i} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {/* Insights */}
            {report.insights?.length > 0 && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Key Insights
                </p>
                <ul className="space-y-2">
                  {report.insights.map((insight, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-indigo-400 mt-0.5 flex-shrink-0">›</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tip */}
            {report.tip && (
              <div className="bg-indigo-50 dark:bg-indigo-950 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900">
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">
                  Suggestion
                </p>
                <p className="text-sm text-indigo-700 dark:text-indigo-300">{report.tip}</p>
              </div>
            )}
          </div>

          {/* Biggest expense + busiest day row */}
          {(stats.biggest_expense || stats.busiest_day) && (
            <div className="grid grid-cols-2 gap-4">
              {stats.biggest_expense && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Biggest Expense</p>
                  <p className="text-xl font-bold text-red-500">
                    ₹{stats.biggest_expense.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {stats.biggest_expense.category}
                    {stats.biggest_expense.note ? ` · ${stats.biggest_expense.note}` : ""}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{stats.biggest_expense.date}</p>
                </div>
              )}
              {stats.busiest_day && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Busiest Day</p>
                  <p className="text-xl font-bold text-orange-500">
                    ₹{stats.busiest_day.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{stats.busiest_day.date}</p>
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
