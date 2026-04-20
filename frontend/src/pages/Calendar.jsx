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

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function Calendar() {
  const today = new Date();
  const year  = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDay(year, month);

  // Map date string → transactions
  const txByDate = {};
  MOCK_TRANSACTIONS.forEach(t => {
    const d = t.date;
    if (!txByDate[d]) txByDate[d] = [];
    txByDate[d].push(t);
  });

  const cells = [];
  // Empty leading cells
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Calendar</h2>
        <p className="text-sm text-gray-400 mt-0.5">{MONTHS[month]} {year}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
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

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const txs = txByDate[dateStr] || [];
            const isToday = day === today.getDate();

            return (
              <div
                key={day}
                className={`min-h-[72px] rounded-xl p-1.5 border text-xs flex flex-col ${
                  isToday
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <span className={`font-semibold mb-1 ${isToday ? "text-indigo-700" : "text-gray-700"}`}>
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
      </div>
    </div>
  );
}
