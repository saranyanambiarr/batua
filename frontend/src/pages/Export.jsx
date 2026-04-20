const MOCK_TRANSACTIONS = [
  { id: 1, type: "income",  category: "Salary",       amount: 55000, date: "2026-04-01" },
  { id: 2, type: "expense", category: "Food",          amount: 1200,  date: "2026-04-02" },
  { id: 3, type: "expense", category: "Shopping",      amount: 3200,  date: "2026-04-03" },
  { id: 4, type: "expense", category: "Transport",     amount: 800,   date: "2026-04-05" },
  { id: 5, type: "income",  category: "Freelance",     amount: 8000,  date: "2026-04-07" },
  { id: 6, type: "expense", category: "Entertainment", amount: 1500,  date: "2026-04-08" },
  { id: 7, type: "expense", category: "Food",          amount: 950,   date: "2026-04-09" },
  { id: 8, type: "expense", category: "Utilities",     amount: 2100,  date: "2026-04-10" },
];

function downloadCSV(data) {
  const header = "Date,Category,Type,Amount\n";
  const rows = data
    .map(t => `${t.date},${t.category},${t.type},${t.amount}`)
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "batua_transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Export() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Export</h2>
        <p className="text-sm text-gray-400 mt-0.5">Download your transaction data</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-md space-y-5">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Format</p>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="radio" name="format" defaultChecked className="accent-indigo-600" />
              CSV
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-not-allowed">
              <input type="radio" name="format" disabled />
              PDF (coming soon)
            </label>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Period</p>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option>This month</option>
            <option>Last month</option>
            <option>Last 3 months</option>
            <option>All time</option>
          </select>
        </div>

        <button
          onClick={() => downloadCSV(MOCK_TRANSACTIONS)}
          className="w-full bg-indigo-600 text-white text-sm py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Download CSV
        </button>
      </div>

      {/* Preview table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-w-2xl">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">Preview ({MOCK_TRANSACTIONS.length} transactions)</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-400 uppercase">
            <tr>
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-left">Category</th>
              <th className="px-5 py-3 text-left">Type</th>
              <th className="px-5 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_TRANSACTIONS.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-500">{t.date}</td>
                <td className="px-5 py-3 font-medium text-gray-800">{t.category}</td>
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
      </div>
    </div>
  );
}
