// Central mock data store — replace with API calls when backend is ready.
// Dashboard and Charts both import from here so they always show the same numbers.

export const TRANSACTIONS = [
  { id: 1,  type: "income",  category: "Salary",       amount: 55000, date: "2026-04-01", proof: null },
  { id: 2,  type: "expense", category: "Food",          amount: 1200,  date: "2026-04-02", proof: null },
  { id: 3,  type: "expense", category: "Shopping",      amount: 3200,  date: "2026-04-03", proof: null },
  { id: 4,  type: "expense", category: "Transport",     amount: 800,   date: "2026-04-05", proof: null },
  { id: 5,  type: "income",  category: "Freelance",     amount: 8000,  date: "2026-04-07", proof: null },
  { id: 6,  type: "expense", category: "Entertainment", amount: 1500,  date: "2026-04-08", proof: null },
  { id: 7,  type: "expense", category: "Food",          amount: 950,   date: "2026-04-09", proof: null },
  { id: 8,  type: "expense", category: "Utilities",     amount: 2100,  date: "2026-04-10", proof: null },
];

export const BUDGETS = [
  { id: 1, category: "Food",          budget: 5000,  spent: 2150,  color: "#6366f1" },
  { id: 2, category: "Shopping",      budget: 4000,  spent: 3200,  color: "#f59e0b" },
  { id: 3, category: "Entertainment", budget: 2000,  spent: 1500,  color: "#ec4899" },
  { id: 4, category: "Transport",     budget: 1500,  spent: 800,   color: "#10b981" },
  { id: 5, category: "Utilities",     budget: 3000,  spent: 2100,  color: "#ef4444" },
];

export const AREA_DATA = [
  { day: "1 Apr",  income: 55000, expense: 1200  },
  { day: "3 Apr",  income: 55000, expense: 4400  },
  { day: "5 Apr",  income: 55000, expense: 5200  },
  { day: "7 Apr",  income: 63000, expense: 5200  },
  { day: "9 Apr",  income: 63000, expense: 6150  },
  { day: "11 Apr", income: 63000, expense: 8250  },
];

export const DAILY_SPEND = [
  { day: "5 Apr",  amount: 800  },
  { day: "6 Apr",  amount: 0    },
  { day: "7 Apr",  amount: 0    },
  { day: "8 Apr",  amount: 1500 },
  { day: "9 Apr",  amount: 950  },
  { day: "10 Apr", amount: 2100 },
  { day: "11 Apr", amount: 0    },
];

export const MONTHLY_TREND = [
  { month: "Nov", income: 52000, expense: 18000 },
  { month: "Dec", income: 58000, expense: 24000 },
  { month: "Jan", income: 55000, expense: 20000 },
  { month: "Feb", income: 55000, expense: 16000 },
  { month: "Mar", income: 61000, expense: 22000 },
  { month: "Apr", income: 63000, expense: 9750  },
];

export const PIE_COLORS = ["#6366f1", "#f59e0b", "#ec4899", "#10b981", "#ef4444"];

// Derived helpers
export function getCategoryBreakdown(transactions) {
  const map = {};
  transactions
    .filter(t => t.type === "expense")
    .forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
  return Object.entries(map).map(([name, value], i) => ({
    name, value, fill: PIE_COLORS[i % PIE_COLORS.length],
  }));
}

export function getSummary(transactions) {
  const income  = transactions.filter(t => t.type === "income").reduce((a, t) => a + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((a, t) => a + t.amount, 0);
  return { income, expense, balance: income - expense };
}
