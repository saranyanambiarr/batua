import { useState, useEffect, useMemo } from "react";
import { fetchTransactions } from "../api/transactionApi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

const PERIODS = [
  { label: "This month",    value: "this_month" },
  { label: "Last month",    value: "last_month" },
  { label: "Last 3 months", value: "last_3_months" },
  { label: "All time",      value: "all_time" },
];

function getDateRange(period) {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();

  if (period === "this_month")   return { start: new Date(year, month, 1),     end: new Date(year, month + 1, 0) };
  if (period === "last_month")   return { start: new Date(year, month - 1, 1), end: new Date(year, month, 0) };
  if (period === "last_3_months") return { start: new Date(year, month - 2, 1), end: new Date(year, month + 1, 0) };
  return null;
}

function filterByPeriod(transactions, period) {
  const range = getDateRange(period);
  if (!range) return transactions;
  const { start, end } = range;
  return transactions.filter(t => {
    const d = new Date(t.date);
    return d >= start && d <= end;
  });
}

function periodLabel(period) {
  return PERIODS.find(p => p.value === period)?.label ?? "All time";
}

// ── CSV ────────────────────────────────────────────────────────────────────────

function downloadCSV(data, period) {
  const header = "Date,Category,Type,Amount,Note,Comment\n";
  const rows   = data.map(t => {
    const note    = (t.note    || "").replace(/,/g, " ");
    const comment = (t.comment || "").replace(/,/g, " ");
    return `${t.date},${t.category || ""},${t.type},${t.amount},${note},${comment}`;
  }).join("\n");

  const blob = new Blob([header + rows], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `batua_${period}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── PDF ────────────────────────────────────────────────────────────────────────

function downloadPDF(data, period) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  // Header bar
  doc.setFillColor(99, 102, 241); // indigo-500
  doc.rect(0, 0, pageW, 50, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Batua", 40, 32);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Transaction Report", 40, 46);

  // Meta info
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  const now = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  doc.text(`Period: ${periodLabel(period)}`, 40, 72);
  doc.text(`Generated: ${now}`, 40, 84);
  doc.text(`${data.length} transaction${data.length !== 1 ? "s" : ""}`, 40, 96);

  // Summary strip
  const totalIncome  = data.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = data.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance      = totalIncome - totalExpense;

  const summaryY = 110;
  const colW     = (pageW - 80) / 3;

  [
    { label: "Income",  val: totalIncome,  color: [34, 197, 94] },
    { label: "Expense", val: totalExpense, color: [239, 68, 68] },
    { label: "Balance", val: balance,      color: balance >= 0 ? [99, 102, 241] : [239, 68, 68] },
  ].forEach(({ label, val, color }, i) => {
    const x = 40 + i * colW;
    doc.setFillColor(248, 248, 252);
    doc.roundedRect(x, summaryY, colW - 8, 40, 4, 4, "F");
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(8);
    doc.text(label.toUpperCase(), x + 8, summaryY + 13);
    doc.setTextColor(...color);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Rs. ${val.toLocaleString("en-IN")}`, x + 8, summaryY + 30);
    doc.setFont("helvetica", "normal");
  });

  // Table
  autoTable(doc, {
    startY: summaryY + 54,
    head: [["Date", "Category", "Type", "Amount (Rs.)", "Note"]],
    body: data.map(t => [
      t.date,
      t.category || "—",
      t.type.charAt(0).toUpperCase() + t.type.slice(1),
      (t.type === "income" ? "+ " : "- ") + Number(t.amount).toLocaleString("en-IN"),
      t.note || "",
    ]),
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 248, 252] },
    columnStyles: {
      0: { cellWidth: 75 },
      1: { cellWidth: 100 },
      2: { cellWidth: 65 },
      3: { cellWidth: 90, halign: "right" },
      4: { cellWidth: "auto" },
    },
    didParseCell(hook) {
      // Color the Type cell text
      if (hook.section === "body" && hook.column.index === 2) {
        const raw = data[hook.row.index]?.type;
        hook.cell.styles.textColor = raw === "income" ? [22, 163, 74] : [220, 38, 38];
      }
      // Color Amount text
      if (hook.section === "body" && hook.column.index === 3) {
        const raw = data[hook.row.index]?.type;
        hook.cell.styles.textColor = raw === "income" ? [22, 163, 74] : [220, 38, 38];
      }
    },
  });

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(8);
    doc.text(`Page ${p} of ${totalPages}  •  Batua`, pageW / 2, doc.internal.pageSize.getHeight() - 20, { align: "center" });
  }

  doc.save(`batua_${period}.pdf`);
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Export() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [period,  setPeriod]  = useState("this_month");
  const [format,  setFormat]  = useState("csv");

  useEffect(() => {
    fetchTransactions()
      .then(setTransactions)
      .catch(() => setError("Failed to load transactions."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => filterByPeriod(transactions, period), [transactions, period]);
  const isEmpty  = !loading && !error && transactions.length === 0;

  function handleDownload() {
    if (format === "csv") downloadCSV(filtered, period);
    else downloadPDF(filtered, period);
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Export</h2>
        <p className="text-sm text-gray-400 mt-0.5">Download your transaction data</p>
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error   && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {/* Controls */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 max-w-md space-y-5">
            {/* Format */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</p>
              <div className="flex gap-4">
                {["csv", "pdf"].map(f => (
                  <label key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value={f}
                      checked={format === f}
                      onChange={() => setFormat(f)}
                      className="accent-indigo-600"
                    />
                    {f.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>

            {/* Period */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period</p>
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {PERIODS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={filtered.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <DownloadIcon />
              Download {format.toUpperCase()} ({filtered.length} transactions)
            </button>

            {/* PDF preview note */}
            {format === "pdf" && filtered.length > 0 && (
              <p className="text-xs text-gray-400 -mt-2">
                PDF includes a summary strip (income / expense / balance) and a formatted table.
              </p>
            )}
          </div>

          {/* Empty state */}
          {isEmpty && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-16 text-center max-w-2xl">
              <p className="text-4xl mb-3">📂</p>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No transactions yet</p>
              <p className="text-gray-400 text-sm mt-1">Add your first transaction to export data.</p>
            </div>
          )}

          {/* Preview table */}
          {!isEmpty && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden max-w-2xl">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Preview — {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
                </p>
              </div>

              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-10">
                  No transactions in this period.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-400 uppercase">
                    <tr>
                      <th className="px-5 py-3 text-left">Date</th>
                      <th className="px-5 py-3 text-left">Category</th>
                      <th className="px-5 py-3 text-left">Type</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {filtered.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{t.date}</td>
                        <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-100">{t.category || "—"}</td>
                        <td className="px-5 py-3">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: t.type === "income" ? "#dcfce7" : "#fee2e2",
                              color:      t.type === "income" ? "#15803d" : "#b91c1c",
                            }}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className={`px-5 py-3 text-right font-semibold ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                          {t.type === "income" ? "+" : "−"}₹{t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
