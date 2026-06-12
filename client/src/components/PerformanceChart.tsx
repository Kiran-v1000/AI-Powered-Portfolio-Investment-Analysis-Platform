import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { PerfPoint } from "../types";

export default function PerformanceChart({ history }: { history: PerfPoint[] }) {
  return (
    <div className="panel chart-panel wide">
      <h3>Performance vs S&amp;P 500 (indexed)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={history} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="portfolio" name="Portfolio" stroke="#6366f1" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="benchmark" name="S&P 500" stroke="#475569" strokeWidth={2} dot={false} strokeDasharray="5 4" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
