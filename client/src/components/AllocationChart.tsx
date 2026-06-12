import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Allocation } from "../types";

const COLORS = ["#6366f1", "#22d3ee", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#fb923c", "#4ade80", "#e879f9", "#94a3b8"];

export default function AllocationChart({ allocation }: { allocation: Allocation[] }) {
  return (
    <div className="panel chart-panel">
      <h3>Sector Allocation</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={allocation} dataKey="value" nameKey="sector" innerRadius={55} outerRadius={90} paddingAngle={2}>
            {allocation.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => `$${Number(v).toLocaleString()}`}
            contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
