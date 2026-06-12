import "dotenv/config";
import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { computeMetrics, performanceHistory } from "./data.js";

const app = express();
app.use(cors());
app.use(express.json());

const HAS_KEY = Boolean(process.env.ANTHROPIC_API_KEY);
const client = HAS_KEY ? new Anthropic() : null;
const MODEL = "claude-fable-5";

if (!HAS_KEY) {
  console.log("No ANTHROPIC_API_KEY found - running AI panel in offline demo mode.");
}

const SYSTEM_PROMPT = `You are PortfolioIQ, an AI investment analysis assistant embedded in a fintech portfolio dashboard.

You analyze the user's portfolio data (provided in each request) and give clear, quantitative, professional analysis: concentration risk, sector balance, beta/volatility posture, income profile, and rebalancing considerations.

Rules:
- Ground every claim in the portfolio numbers provided. Quote figures.
- Use Markdown with short sections and bullet points. Keep responses tight.
- You are not a licensed financial advisor. End any recommendation-style answer with a one-line disclaimer that this is educational analysis, not financial advice.
- Never invent holdings or prices that are not in the data.`;

function portfolioContext() {
  const m = computeMetrics();
  return [
    "CURRENT PORTFOLIO SNAPSHOT (live data from the dashboard):",
    JSON.stringify(
      {
        totalValue: m.totalValue,
        cash: m.cash,
        totalGainPct: m.totalGainPct,
        weightedBeta: m.weightedBeta,
        weightedDividendYieldPct: m.weightedYield,
        allocation: m.allocation,
        holdings: m.holdings.map(({ symbol, name, sector, quantity, avgCost, price, marketValue, gainPct, beta, dividendYield }) => ({
          symbol, name, sector, quantity, avgCost, price,
          marketValue: Math.round(marketValue),
          gainPct: Number(gainPct.toFixed(1)),
          beta, dividendYield
        })),
        performanceVsSp500Indexed: performanceHistory
      },
      null,
      1
    )
  ].join("\n");
}

app.get("/api/portfolio", (_req, res) => {
  res.json({ ...computeMetrics(), performanceHistory });
});

// Offline demo analysis — computed from the real portfolio data, streamed
// word-by-word to mimic the Claude experience when no API key is configured.
function demoAnalysis(question) {
  const m = computeMetrics();
  const top = [...m.holdings].sort((a, b) => b.marketValue - a.marketValue)[0];
  const invested = m.totalValue - m.cash;
  const topPct = ((top.marketValue / invested) * 100).toFixed(1);
  const techPct = m.allocation
    .filter((a) => ["Technology", "Semiconductors"].includes(a.sector))
    .reduce((s, a) => s + a.pct, 0)
    .toFixed(1);
  const best = [...m.holdings].sort((a, b) => b.gainPct - a.gainPct)[0];
  const worst = [...m.holdings].sort((a, b) => a.gainPct - b.gainPct)[0];

  return `**[Demo mode — no API key configured. This analysis is computed locally from your portfolio data. Add an ANTHROPIC_API_KEY to enable live Claude Fable 5 analysis.]**

### Portfolio Overview
- Total value **$${Math.round(m.totalValue).toLocaleString("en-US")}** (incl. $${Math.round(m.cash).toLocaleString("en-US")} cash), up **${m.totalGainPct.toFixed(1)}%** overall.
- Weighted beta **${m.weightedBeta.toFixed(2)}** — slightly more volatile than the market.
- Weighted dividend yield **${m.weightedYield.toFixed(2)}%**.

### Concentration & Risk
- Largest position is **${top.symbol}** at **${topPct}%** of invested assets — above the common 10% single-position guideline.
- Tech + semiconductors together are **${techPct}%** of the portfolio, a meaningful sector tilt.
- Defensive ballast comes from JNJ, TLT and GLD, which dampen drawdowns but TLT is currently underwater.

### Winners & Laggards
- Best performer: **${best.symbol}** (+${best.gainPct.toFixed(1)}%).
- Weakest: **${worst.symbol}** (${worst.gainPct.toFixed(1)}%).

### Considerations
- Trimming the largest position and recycling into underweighted sectors would reduce single-name risk.
- The ~${((m.cash / m.totalValue) * 100).toFixed(1)}% cash buffer gives room to rebalance without selling.

*You asked: "${question}". Educational analysis only — not financial advice.*`;
}

function streamDemo(res, question) {
  const words = demoAnalysis(question).split(/(?<=\s)/);
  let i = 0;
  const timer = setInterval(() => {
    if (i >= words.length) {
      clearInterval(timer);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      return;
    }
    res.write(`data: ${JSON.stringify({ text: words[i++] })}\n\n`);
  }, 12);
}

// Streaming AI endpoint (SSE). Body: { messages: [{role, content}, ...] }
app.post("/api/chat", async (req, res) => {
  const history = Array.isArray(req.body?.messages) ? req.body.messages : [];
  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return res.status(400).json({ error: "messages must end with a user message" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  if (!HAS_KEY) {
    return streamDemo(res, String(history[history.length - 1].content));
  }

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }
      ],
      messages: [
        // Portfolio snapshot rides in the first user turn so the system prompt stays cacheable
        { role: "user", content: portfolioContext() },
        { role: "assistant", content: "Understood. I have the portfolio snapshot loaded and will ground all analysis in it." },
        ...history.map((m) => ({ role: m.role, content: String(m.content) }))
      ]
    });

    stream.on("text", (delta) => {
      res.write(`data: ${JSON.stringify({ text: delta })}\n\n`);
    });

    const final = await stream.finalMessage();
    res.write(`data: ${JSON.stringify({ done: true, usage: final.usage })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Claude API error:", err);
    res.write(`data: ${JSON.stringify({ error: err?.message || "API error" })}\n\n`);
    res.end();
  }
});

export default app;

// Local dev: run a real listener. On Vercel the app is served as a function.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`PortfolioIQ API listening on http://localhost:${PORT}`));
}
