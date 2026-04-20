import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";

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
        />
        <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
      </PieChart>
    </ResponsiveContainer>
  );
}
