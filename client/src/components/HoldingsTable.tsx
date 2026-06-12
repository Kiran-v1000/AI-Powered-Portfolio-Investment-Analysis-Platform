import type { Holding } from "../types";

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export default function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  return (
    <div className="panel">
      <h3>Holdings</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Sector</th>
              <th className="num">Qty</th>
              <th className="num">Avg Cost</th>
              <th className="num">Price</th>
              <th className="num">Market Value</th>
              <th className="num">Gain %</th>
              <th className="num">Beta</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <tr key={h.symbol}>
                <td className="sym">{h.symbol}</td>
                <td>{h.name}</td>
                <td><span className="sector-tag">{h.sector}</span></td>
                <td className="num">{h.quantity}</td>
                <td className="num">{usd(h.avgCost)}</td>
                <td className="num">{usd(h.price)}</td>
                <td className="num">{usd(h.marketValue)}</td>
                <td className={`num ${h.gainPct >= 0 ? "pos" : "neg"}`}>
                  {h.gainPct >= 0 ? "+" : ""}{h.gainPct.toFixed(1)}%
                </td>
                <td className="num">{h.beta.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
