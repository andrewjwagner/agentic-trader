/** Structured snapshot for Agentic Trader — update after each rebalance. */

export type Sleeve = "core" | "politician" | "safety-net";

export interface MonthPick {
  symbol: string;
  name: string;
  shares: number;
  /** Cost basis per share (split-adjusted where noted). */
  entryPrice: number;
  /**
   * Active month only: baked mark for static hosting when live quotes fail.
   * Past months use exitPrice instead.
   */
  lastPrice?: number;
  /** Closed months only: sell / month-end exit price. */
  exitPrice?: number;
  score: number;
  sleeve: Sleeve;
  notes?: string;
}

export interface MonthBook {
  /** Sort key, e.g. "2026-08". */
  id: string;
  /** Display label, e.g. "August 2026". */
  label: string;
  status: "active" | "closed";
  picks: MonthPick[];
  summary?: string;
}

export interface PortfolioSnapshot {
  brand: string;
  credit: string;
  goal: string;
  tagline: string;
  inception: string;
  asOf: string;
  startingCapital: number;
  cashApprox: number;
  cashFloor: number;
  /** Newest first recommended; active month should be status: "active". */
  months: MonthBook[];
  strategy: {
    assets: number;
    holdPeriod: string;
    universe: string;
    process: string;
    rules: string[];
  };
}

const august2026Picks: MonthPick[] = [
  {
    symbol: "PLTR",
    name: "Palantir",
    shares: 1.374,
    entryPrice: 174.67,
    lastPrice: 174.67,
    score: 85,
    sleeve: "core",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA",
    shares: 1.0671,
    entryPrice: 223.03,
    lastPrice: 223.03,
    score: 82,
    sleeve: "core",
  },
  {
    symbol: "GS",
    name: "Goldman Sachs",
    shares: 0.2261,
    entryPrice: 1043.77,
    lastPrice: 1043.77,
    score: 79,
    sleeve: "core",
  },
  {
    symbol: "LLY",
    name: "Eli Lilly",
    shares: 0.1971,
    entryPrice: 1197.11,
    lastPrice: 1197.11,
    score: 79,
    sleeve: "core",
  },
  {
    symbol: "JPM",
    name: "JPMorgan",
    shares: 0.6524,
    entryPrice: 358.68,
    lastPrice: 358.68,
    score: 77,
    sleeve: "core",
  },
  {
    symbol: "AMZN",
    name: "Amazon",
    shares: 0.8487,
    entryPrice: 275.71,
    lastPrice: 275.71,
    score: 77,
    sleeve: "core",
  },
  {
    symbol: "BRK.B",
    name: "Berkshire Hathaway",
    shares: 0.4323,
    entryPrice: 536.72,
    lastPrice: 536.72,
    score: 75,
    sleeve: "core",
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    shares: 0.4596,
    entryPrice: 504.78,
    lastPrice: 504.78,
    score: 74,
    sleeve: "core",
  },
  {
    symbol: "CEG",
    name: "Constellation Energy",
    shares: 0.4311,
    entryPrice: 269.07,
    lastPrice: 269.07,
    score: 74,
    sleeve: "core",
  },
  {
    symbol: "LMT",
    name: "Lockheed Martin",
    shares: 0.19135,
    entryPrice: 600.99,
    lastPrice: 600.99,
    score: 74,
    sleeve: "core",
  },
  {
    symbol: "IT",
    name: "Gartner",
    shares: 0.612876,
    entryPrice: 187.64,
    lastPrice: 187.64,
    score: 74,
    sleeve: "core",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet",
    shares: 0.325079,
    entryPrice: 353.76,
    lastPrice: 353.76,
    score: 72,
    sleeve: "core",
  },
  {
    symbol: "CVX",
    name: "Chevron",
    shares: 0.593595,
    entryPrice: 192.05,
    lastPrice: 192.05,
    score: 72,
    sleeve: "core",
  },
  {
    symbol: "SPCX",
    name: "SpaceX ETF",
    shares: 0.865952,
    entryPrice: 131.65,
    lastPrice: 131.65,
    score: 70,
    sleeve: "politician",
    notes: "From recent congressional trade disclosures",
  },
  {
    symbol: "MNST",
    name: "Monster Beverage",
    // Post 2-for-1 split (8/11): shares doubled, price halved
    shares: 2.390526,
    entryPrice: 46.015,
    lastPrice: 46.015,
    score: 68,
    sleeve: "politician",
    notes: "Bought pre-split; figures are split-adjusted",
  },
];

export const portfolio: PortfolioSnapshot = {
  brand: "Agentic Trader",
  credit: "by Andrew Wagner",
  goal: "Beat the S&P 500 — carefully.",
  tagline:
    "An AI stock picker that chooses about 15 stocks each month from macro news and recent political trades, starting with $3,000, tracked in public.",
  inception: "2026-08-10",
  asOf: "2026-08-10",
  startingCapital: 3000,
  cashApprox: 319,
  cashFloor: 250,
  months: [
    {
      id: "2026-08",
      label: "August 2026",
      status: "active",
      picks: august2026Picks,
      summary: "First live month — refresh prices for current marks.",
    },
    // Future closed months: status "closed", set exitPrice on each pick, omit lastPrice.
  ],
  strategy: {
    assets: 15,
    holdPeriod: "About one month, then pick again",
    universe: "Big U.S. stocks and regular ETFs (no leveraged products)",
    process:
      "Each month it reviews the market, drops picks that no longer make sense, and chooses a fresh set of about 15 stocks.",
    rules: [
      "Keeps at least $250 in cash — never all-in",
      "Any gains get parked in a long-term SPY safety net",
      "Two slots come from recent political stock trades",
      "Won’t repurchase a loser within 30 days (wash-sale guard)",
      "No leveraged, inverse, or volatility products",
    ],
  },
};

export function yahooSymbol(symbol: string): string {
  return symbol.replace(".", "-");
}

export function investedCapital(p: PortfolioSnapshot = portfolio): number {
  return p.startingCapital;
}

/** Months newest-first for display. */
export function sortedMonths(p: PortfolioSnapshot = portfolio): MonthBook[] {
  return [...p.months].sort((a, b) => b.id.localeCompare(a.id));
}

export function activeMonth(p: PortfolioSnapshot = portfolio): MonthBook {
  const active = sortedMonths(p).find((m) => m.status === "active");
  if (!active) {
    throw new Error("Portfolio needs exactly one active month");
  }
  return active;
}

export function closedMonths(p: PortfolioSnapshot = portfolio): MonthBook[] {
  return sortedMonths(p).filter((m) => m.status === "closed");
}

export function costBasisTotal(p: PortfolioSnapshot = portfolio): number {
  return activeMonth(p).picks.reduce((s, h) => s + h.shares * h.entryPrice, 0);
}

export function bakedQuotes(p: PortfolioSnapshot = portfolio): Record<string, number> {
  const map: Record<string, number> = {};
  for (const h of activeMonth(p).picks) {
    map[h.symbol] = h.lastPrice ?? h.entryPrice;
  }
  return map;
}

export function closedPickReturnPct(pick: MonthPick): number | null {
  if (pick.exitPrice == null || pick.entryPrice <= 0) return null;
  return ((pick.exitPrice - pick.entryPrice) / pick.entryPrice) * 100;
}
