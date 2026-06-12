# PortfolioIQ — AI-Powered Portfolio & Investment Analysis Platform

Production-grade fintech demo: a React portfolio dashboard with an embedded AI analyst powered by **Claude Fable 5** via the Anthropic API.

## Features

- **Dashboard** — total value, gain, weighted beta, dividend yield summary cards
- **Charts** — 12-month performance vs S&P 500 (indexed) and sector allocation donut (Recharts)
- **Holdings table** — 10-position demo portfolio (equities, ETFs, bonds, gold) with live P&L
- **AI Analyst panel** — streaming chat grounded in the live portfolio snapshot:
  - Claude Fable 5 with adaptive thinking
  - Prompt caching on the system prompt
  - Server-Sent Events streaming to the UI
  - Built-in guardrails (grounded in data, education-not-advice disclaimer)

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19 + TypeScript (Vite), Recharts |
| Backend  | Node + Express, `@anthropic-ai/sdk` |
| Model    | `claude-fable-5` (streaming, adaptive thinking) |

## Run it

```powershell
# 1. Backend
cd server
copy .env.example .env   # then paste your real ANTHROPIC_API_KEY into .env
npm install
npm run dev              # http://localhost:3001

# 2. Frontend (second terminal)
cd client
npm install
npm run dev              # http://localhost:5173
```

Open http://localhost:5173. The dashboard loads from mock market data; the AI panel calls the Anthropic API live.

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/portfolio` | GET | Computed holdings, allocation, metrics, performance history |
| `/api/chat` | POST | SSE stream — `{ messages: [{role, content}] }` → Claude analysis |

## Notes

- Market data is mocked in `server/data.js`; swap in a real provider (Polygon, Alpha Vantage) for production.
- The portfolio snapshot is injected as the first user turn so the system prompt stays byte-stable for prompt caching.
- This is an educational demo — not financial advice.
