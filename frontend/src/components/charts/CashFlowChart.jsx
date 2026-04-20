import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

export default function CashFlowChart({ data, height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="cfIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
          </linearGradient>
          <linearGradient id="cfExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day"     tick={{ fontSize: 11 }} />
        <YAxis                   tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
        <Area type="monotone" dataKey="income"  stroke="#6366f1" fill="url(#cfIncome)"  strokeWidth={2} dot={false} name="Income"  />
        <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#cfExpense)" strokeWidth={2} dot={false} name="Expense" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
