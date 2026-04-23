import { useState, useEffect } from "react";
import { fetchTransactions } from "../api/transactionApi";

function ChevronLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDay(year, month)    { return new Date(year, month, 1).getDay(); }

export default function Calendar() {
  const today = new Date();

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetchTransactions()
      .then(setTransactions)
      .catch(() => setError("Failed to load transactions."))
      .finally(() => setLoading(false));
  }, []);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  // Build date → transactions map for the viewed month
  const txByDate = {};
  transactions.forEach(t => {
    const [y, m] = t.date.split("-").map(Number);
    if (y === viewYear && m === viewMonth + 1) {
      if (!txByDate[t.date]) txByDate[t.date] = [];
      txByDate[t.date].push(t);
    }
  });

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay    = getFirstDay(viewYear, viewMonth);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const isEmpty = transactions.length === 0 && !loading;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Calendar</h2>
        <p className="text-sm text-gray-400 mt-0.5">Your transactions at a glance</p>
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error   && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <ChevronLeft />
            </button>
            <p className="font-semibold text-gray-700 dark:text-gray-200">
              {MONTHS[viewMonth]} {viewYear}
            </p>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <ChevronRight />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;

              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const txs     = txByDate[dateStr] || [];
              const isToday = isCurrentMonth && day === today.getDate();

              return (
                <div
                  key={day}
                  className={`min-h-[72px] rounded-xl p-1.5 border text-xs flex flex-col ${
                    isToday
                      ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950"
                      : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className={`font-semibold mb-1 ${isToday ? "text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"}`}>
                    {day}
                  </span>
                  <div className="space-y-0.5 overflow-hidden">
                    {txs.slice(0, 2).map(t => (
                      <div
                        key={t.id}
                        className="truncate rounded px-1 py-0.5"
                        style={{
                          background: t.type === "income" ? "#dcfce7" : "#fee2e2",
                          color:      t.type === "income" ? "#15803d" : "#b91c1c",
                        }}
                      >
                        {t.type === "income" ? "+" : "−"}₹{t.amount.toLocaleString()}
                      </div>
                    ))}
                    {txs.length > 2 && (
                      <div className="text-gray-400 pl-1">+{txs.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state for this month */}
          {isEmpty && (
            <p className="text-center text-gray-400 text-sm py-6">
              No transactions yet. Add one to see it here.
            </p>
          )}

          {/* Month has data but none in viewed month */}
          {!isEmpty && Object.keys(txByDate).length === 0 && (
            <p className="text-center text-gray-400 text-sm py-6">
              No transactions in {MONTHS[viewMonth]} {viewYear}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
