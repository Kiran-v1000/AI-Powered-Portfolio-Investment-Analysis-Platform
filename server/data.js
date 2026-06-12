// Mock market + portfolio data for the demo. In production this would come
// from a market-data provider (Polygon, Alpha Vantage, etc.) and a custody DB.

export const portfolio = {
  owner: "Demo Investor",
  baseCurrency: "USD",
  cash: 18450.0,
  holdings: [
    { symbol: "AAPL",  name: "Apple Inc.",            sector: "Technology",        quantity: 120, avgCost: 168.4,  price: 232.15, beta: 1.24, dividendYield: 0.42 },
    { symbol: "MSFT",  name: "Microsoft Corp.",       sector: "Technology",        quantity: 85,  avgCost: 310.2,  price: 448.7,  beta: 0.92, dividendYield: 0.66 },
    { symbol: "NVDA",  name: "NVIDIA Corp.",          sector: "Semiconductors",    quantity: 60,  avgCost: 455.8,  price: 1188.3, beta: 1.68, dividendYield: 0.03 },
    { symbol: "JPM",   name: "JPMorgan Chase & Co.",  sector: "Financials",        quantity: 95,  avgCost: 142.6,  price: 209.4,  beta: 1.1,  dividendYield: 2.18 },
    { symbol: "JNJ",   name: "Johnson & Johnson",     sector: "Healthcare",        quantity: 110, avgCost: 158.9,  price: 151.2,  beta: 0.52, dividendYield: 3.25 },
    { symbol: "XOM",   name: "Exxon Mobil Corp.",     sector: "Energy",            quantity: 140, avgCost: 98.4,   price: 114.85, beta: 0.88, dividendYield: 3.3 },
    { symbol: "AMZN",  name: "Amazon.com Inc.",       sector: "Consumer Discr.",   quantity: 70,  avgCost: 132.7,  price: 186.4,  beta: 1.15, dividendYield: 0 },
    { symbol: "VOO",   name: "Vanguard S&P 500 ETF",  sector: "Index Fund",        quantity: 55,  avgCost: 392.1,  price: 512.6,  beta: 1.0,  dividendYield: 1.32 },
    { symbol: "TLT",   name: "iShares 20+ Yr Treasury", sector: "Fixed Income",    quantity: 130, avgCost: 102.3,  price: 91.7,   beta: -0.2, dividendYield: 3.85 },
    { symbol: "GLD",   name: "SPDR Gold Shares",      sector: "Commodities",       quantity: 45,  avgCost: 178.5,  price: 215.9,  beta: 0.05, dividendYield: 0 }
  ]
};

// 12 months of portfolio value vs S&P 500 benchmark (indexed to 100)
export const performanceHistory = [
  { month: "Jul 25", portfolio: 100.0, benchmark: 100.0 },
  { month: "Aug 25", portfolio: 102.4, benchmark: 101.8 },
  { month: "Sep 25", portfolio: 101.1, benchmark: 99.6 },
  { month: "Oct 25", portfolio: 105.8, benchmark: 103.2 },
  { month: "Nov 25", portfolio: 109.6, benchmark: 106.9 },
  { month: "Dec 25", portfolio: 112.3, benchmark: 108.4 },
  { month: "Jan 26", portfolio: 110.7, benchmark: 107.1 },
  { month: "Feb 26", portfolio: 114.9, benchmark: 110.5 },
  { month: "Mar 26", portfolio: 118.2, benchmark: 112.8 },
  { month: "Apr 26", portfolio: 116.5, benchmark: 111.2 },
  { month: "May 26", portfolio: 121.8, benchmark: 114.6 },
  { month: "Jun 26", portfolio: 125.4, benchmark: 117.3 }
];

export function computeMetrics() {
  const rows = portfolio.holdings.map((h) => {
    const marketValue = h.quantity * h.price;
    const costBasis = h.quantity * h.avgCost;
    return { ...h, marketValue, costBasis, gain: marketValue - costBasis, gainPct: ((marketValue - costBasis) / costBasis) * 100 };
  });
  const totalValue = rows.reduce((s, r) => s + r.marketValue, 0) + portfolio.cash;
  const totalCost = rows.reduce((s, r) => s + r.costBasis, 0) + portfolio.cash;
  const invested = totalValue - portfolio.cash;
  const weightedBeta = rows.reduce((s, r) => s + r.beta * (r.marketValue / invested), 0);
  const weightedYield = rows.reduce((s, r) => s + r.dividendYield * (r.marketValue / invested), 0);

  const bySector = {};
  for (const r of rows) bySector[r.sector] = (bySector[r.sector] || 0) + r.marketValue;
  const allocation = Object.entries(bySector)
    .map(([sector, value]) => ({ sector, value, pct: (value / invested) * 100 }))
    .sort((a, b) => b.value - a.value);

  return {
    holdings: rows,
    cash: portfolio.cash,
    totalValue,
    totalGain: totalValue - totalCost,
    totalGainPct: ((totalValue - totalCost) / totalCost) * 100,
    weightedBeta,
    weightedYield,
    allocation
  };
}
