import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#6366f1", "#f59e0b", "#ec4899", "#10b981",
  "#ef4444", "#3b82f6", "#8b5cf6", "#14b8a6",
  "#f97316", "#84cc16",
];

export default function ExpensePieChart({ data, height = 180 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={45}
          outerRadius={75}
          paddingAngle={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
      </PieChart>
    </ResponsiveContainer>
  );
}
