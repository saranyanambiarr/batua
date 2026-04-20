import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

export default function SpendingBarChart({ data, height = 200, color = "#6366f1" }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day"   tick={{ fontSize: 11 }} />
        <YAxis                 tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
        <Bar dataKey="amount" fill={color} radius={[4, 4, 0, 0]} name="Spent" />
      </BarChart>
    </ResponsiveContainer>
  );
}
