import type { PortfolioData } from "../types";

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function SummaryCards({ data }: { data: PortfolioData }) {
  const cards = [
    { label: "Total Value", value: usd(data.totalValue), sub: `${usd(data.cash)} cash` },
    {
      label: "Total Gain",
      value: usd(data.totalGain),
      sub: `${data.totalGainPct >= 0 ? "+" : ""}${data.totalGainPct.toFixed(1)}%`,
      tone: data.totalGain >= 0 ? "pos" : "neg"
    },
    { label: "Portfolio Beta", value: data.weightedBeta.toFixed(2), sub: "vs S&P 500" },
    { label: "Dividend Yield", value: `${data.weightedYield.toFixed(2)}%`, sub: "weighted avg" }
  ];

  return (
    <div className="summary-cards">
      {cards.map((c) => (
        <div className="card" key={c.label}>
          <span className="card-label">{c.label}</span>
          <span className={`card-value ${c.tone ?? ""}`}>{c.value}</span>
          <span className={`card-sub ${c.tone ?? ""}`}>{c.sub}</span>
        </div>
      ))}
    </div>
  );
}
