import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

export default function MonthlyTrendChart({ data, height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income"  fill="#6366f1" radius={[4, 4, 0, 0]} name="Income"  />
        <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
      </BarChart>
    </ResponsiveContainer>
  );
}
