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
  /** ISO date this book became live (rebalance day). First month defaults to inception. */
  startDate?: string;
  /** Cash held while this book was/is live. Falls back to snapshot cashApprox. */
  cashApprox?: number;
  /**
   * Closed months only: account NAV at month-end rebalance.
   * Used later to stitch multi-month vs-S&P history.
   */
  endNav?: number;
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
    exitPrice: 171.57,
    score: 85,
    sleeve: "core",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA",
    shares: 1.0671,
    entryPrice: 223.03,
    exitPrice: 210.83,
    score: 82,
    sleeve: "core",
  },
  {
    symbol: "GS",
    name: "Goldman Sachs",
    shares: 0.2261,
    entryPrice: 1043.77,
    exitPrice: 998.19,
    score: 79,
    sleeve: "core",
  },
  {
    symbol: "LLY",
    name: "Eli Lilly",
    shares: 0.1971,
    entryPrice: 1197.11,
    exitPrice: 1141.95,
    score: 79,
    sleeve: "core",
  },
  {
    symbol: "JPM",
    name: "JPMorgan",
    shares: 0.6524,
    entryPrice: 358.68,
    exitPrice: 351.18,
    score: 77,
    sleeve: "core",
  },
  {
    symbol: "AMZN",
    name: "Amazon",
    shares: 0.8487,
    entryPrice: 275.71,
    exitPrice: 252.71,
    score: 77,
    sleeve: "core",
  },
  {
    symbol: "BRK.B",
    name: "Berkshire Hathaway",
    shares: 0.4323,
    entryPrice: 536.72,
    exitPrice: 514.18,
    score: 75,
    sleeve: "core",
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    shares: 0.4596,
    entryPrice: 504.78,
    exitPrice: 503.22,
    score: 74,
    sleeve: "core",
  },
  {
    symbol: "CEG",
    name: "Constellation Energy",
    shares: 0.4311,
    entryPrice: 269.07,
    exitPrice: 265.76,
    score: 74,
    sleeve: "core",
  },
  {
    symbol: "LMT",
    name: "Lockheed Martin",
    shares: 0.19135,
    entryPrice: 600.99,
    exitPrice: 527.77,
    score: 74,
    sleeve: "core",
  },
  {
    symbol: "IT",
    name: "Gartner",
    shares: 0.612876,
    entryPrice: 187.64,
    exitPrice: 190.11,
    score: 74,
    sleeve: "core",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet",
    shares: 0.325079,
    entryPrice: 353.76,
    exitPrice: 345.78,
    score: 72,
    sleeve: "core",
  },
  {
    symbol: "CVX",
    name: "Chevron",
    shares: 0.593595,
    entryPrice: 192.05,
    exitPrice: 214.18,
    score: 72,
    sleeve: "core",
  },
  {
    symbol: "SPCX",
    name: "SpaceX",
    shares: 0.865952,
    entryPrice: 131.65,
    exitPrice: 149.5,
    score: 70,
    sleeve: "politician",
    notes: "From recent congressional trade disclosures",
  },
  {
    symbol: "MNST",
    name: "Monster Beverage",
    shares: 2.390526,
    entryPrice: 46.015,
    exitPrice: 44.28,
    score: 68,
    sleeve: "politician",
    notes: "Bought pre-split; figures are split-adjusted",
  },
];

const september2026Picks: MonthPick[] = [
  {
    symbol: "CVX",
    name: "Chevron",
    shares: 0.836568,
    entryPrice: 198.48,
    lastPrice: 211.08,
    score: 85,
    sleeve: "core",
    notes: "Extended hold; added to equal weight",
  },
  {
    symbol: "LLY",
    name: "Eli Lilly",
    shares: 0.156854,
    entryPrice: 1197.11,
    lastPrice: 1154.29,
    score: 85,
    sleeve: "core",
    notes: "Extended hold; trimmed 2× to 1×",
  },
  {
    symbol: "COP",
    name: "ConocoPhillips",
    shares: 1.298022,
    entryPrice: 138.05,
    lastPrice: 132.57,
    score: 83,
    sleeve: "core",
  },
  {
    symbol: "LMT",
    name: "Lockheed Martin",
    shares: 0.339386,
    entryPrice: 569.15,
    lastPrice: 537.08,
    score: 80,
    sleeve: "core",
    notes: "Added to equal weight",
  },
  {
    symbol: "XOM",
    name: "Exxon Mobil",
    shares: 1.078159,
    entryPrice: 166.2,
    lastPrice: 162.69,
    score: 80,
    sleeve: "core",
  },
  {
    symbol: "JPM",
    name: "JPMorgan",
    shares: 0.510531,
    entryPrice: 358.68,
    lastPrice: 345.85,
    score: 79,
    sleeve: "core",
    notes: "Extended hold; trimmed 2× to 1×",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet",
    shares: 0.518466,
    entryPrice: 350.78,
    lastPrice: 357.81,
    score: 78,
    sleeve: "core",
    notes: "Extended hold; added to equal weight",
  },
  {
    symbol: "MRK",
    name: "Merck",
    shares: 1.241616,
    entryPrice: 144.32,
    lastPrice: 147.7,
    score: 77,
    sleeve: "politician",
    notes: "From recent congressional trade disclosures",
  },
  {
    symbol: "SPCX",
    name: "SpaceX",
    shares: 1.199131,
    entryPrice: 136.61,
    lastPrice: 155.45,
    score: 77,
    sleeve: "politician",
    notes: "Extended hold; from recent congressional trade disclosures",
  },
  {
    symbol: "NOW",
    name: "ServiceNow",
    shares: 1.276464,
    entryPrice: 140.38,
    lastPrice: 137.01,
    score: 76,
    sleeve: "core",
  },
  {
    symbol: "PLTR",
    name: "Palantir",
    shares: 1.047253,
    entryPrice: 174.67,
    lastPrice: 174.2,
    score: 75,
    sleeve: "core",
    notes: "Trimmed 2× to 1×",
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    shares: 0.355862,
    entryPrice: 504.78,
    lastPrice: 494.82,
    score: 74,
    sleeve: "core",
    notes: "Trimmed 2× to 1×",
  },
  {
    symbol: "GS",
    name: "Goldman Sachs",
    shares: 0.179562,
    entryPrice: 1043.77,
    lastPrice: 941.32,
    score: 74,
    sleeve: "core",
    notes: "Trimmed 2× to 1×",
  },
  {
    symbol: "BRK.B",
    name: "Berkshire Hathaway",
    shares: 0.348567,
    entryPrice: 536.72,
    lastPrice: 508.68,
    score: 72,
    sleeve: "core",
    notes: "Trimmed 2× to 1×",
  },
  {
    symbol: "IT",
    name: "Gartner",
    shares: 0.943263,
    entryPrice: 188.5,
    lastPrice: 184.68,
    score: 72,
    sleeve: "core",
    notes: "Added to equal weight",
  },
];

export const portfolio: PortfolioSnapshot = {
  brand: "Agentic Trader",
  credit: "by Andrew Wagner",
  goal: "Beat the S&P 500 — carefully.",
  tagline:
    "An AI stock picker that chooses about 15 stocks each month from macro news and recent political trades, starting with $3,000, tracked in public.",
  inception: "2026-08-10",
  asOf: "2026-09-18",
  startingCapital: 3000,
  cashApprox: 250,
  cashFloor: 250,
  months: [
    {
      id: "2026-09",
      label: "September 2026",
      status: "active",
      startDate: "2026-09-14",
      cashApprox: 250,
      picks: september2026Picks,
      summary:
        "Cycle 2 — energy/healthcare rotation on Sep 14. Friday 9/18 check held all 15; no emergency sells.",
    },
    {
      id: "2026-08",
      label: "August 2026",
      status: "closed",
      startDate: "2026-08-10",
      cashApprox: 319,
      endNav: 2938.84,
      picks: august2026Picks,
      summary: "First live month. Exited AMZN, NVDA, CEG, and MNST at the September rebalance.",
    },
  ],
  strategy: {
    assets: 15,
    holdPeriod: "About one month by default; strong picks can be held longer",
    universe: "Big U.S. stocks and regular ETFs (no leveraged products)",
    process:
      "At each monthly rebalance it sells what no longer fits, then buys the new lineup the same day. Each position targets roughly equal weight (~6.67% of deployable capital).",
    rules: [
      "Keeps at least $250 in cash — never all-in",
      "Any gains get parked in a long-term SPY safety net",
      "Two slots come from recent political stock trades",
      "Up to five positions can be extended when the thesis still holds",
      "One order per stock per rebalance — no duplicate placements",
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

/** ISO date this book became the live 15. */
export function monthStartDate(
  month: MonthBook,
  inception: string,
  all: MonthBook[],
): string {
  if (month.startDate) return month.startDate;
  const chronological = [...all].sort((a, b) => a.id.localeCompare(b.id));
  return chronological[0]?.id === month.id ? inception : `${month.id}-01`;
}

export function allPickSymbols(p: PortfolioSnapshot = portfolio): string[] {
  return [...new Set(p.months.flatMap((m) => m.picks.map((pick) => pick.symbol)))];
}
