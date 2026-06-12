export interface Holding {
  symbol: string;
  name: string;
  sector: string;
  quantity: number;
  avgCost: number;
  price: number;
  beta: number;
  dividendYield: number;
  marketValue: number;
  costBasis: number;
  gain: number;
  gainPct: number;
}

export interface Allocation {
  sector: string;
  value: number;
  pct: number;
}

export interface PerfPoint {
  month: string;
  portfolio: number;
  benchmark: number;
}

export interface PortfolioData {
  holdings: Holding[];
  cash: number;
  totalValue: number;
  totalGain: number;
  totalGainPct: number;
  weightedBeta: number;
  weightedYield: number;
  allocation: Allocation[];
  performanceHistory: PerfPoint[];
}

export interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}
