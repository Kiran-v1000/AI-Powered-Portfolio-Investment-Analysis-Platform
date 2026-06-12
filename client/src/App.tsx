import { useEffect, useState } from "react";
import type { PortfolioData } from "./types";
import SummaryCards from "./components/SummaryCards";
import AllocationChart from "./components/AllocationChart";
import PerformanceChart from "./components/PerformanceChart";
import HoldingsTable from "./components/HoldingsTable";
import AiPanel from "./components/AiPanel";
import "./App.css";

const API = "http://localhost:3001";

export default function App() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/portfolio`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError("Could not reach the API server. Is it running on port 3001?"));
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">◆</span>
          <h1>PortfolioIQ</h1>
          <span className="brand-sub">AI-Powered Investment Analysis</span>
        </div>
        <span className="model-chip">Claude Fable 5</span>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {data && (
        <main className="layout">
          <section className="dashboard">
            <SummaryCards data={data} />
            <div className="charts-row">
              <PerformanceChart history={data.performanceHistory} />
              <AllocationChart allocation={data.allocation} />
            </div>
            <HoldingsTable holdings={data.holdings} />
          </section>
          <aside className="ai-side">
            <AiPanel api={API} />
          </aside>
        </main>
      )}
    </div>
  );
}
