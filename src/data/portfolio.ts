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
    exitPrice: 234.655,
    score: 85,
    sleeve: "core",
    notes: "Extended hold; added to equal weight; no Oct order (within band), marked at quote",
  },
  {
    symbol: "LLY",
    name: "Eli Lilly",
    shares: 0.156854,
    entryPrice: 1197.11,
    exitPrice: 1423.22,
    score: 85,
    sleeve: "core",
    notes: "Extended hold; trimmed 2× to 1×, then trimmed again in Oct",
  },
  {
    symbol: "COP",
    name: "ConocoPhillips",
    shares: 1.298022,
    entryPrice: 138.05,
    exitPrice: 152.89,
    score: 83,
    sleeve: "core",
    notes: "No Oct order (within band), marked at quote",
  },
  {
    symbol: "LMT",
    name: "Lockheed Martin",
    shares: 0.339386,
    entryPrice: 569.15,
    exitPrice: 638.11,
    score: 80,
    sleeve: "core",
    notes: "Added to equal weight; trimmed in Oct",
  },
  {
    symbol: "XOM",
    name: "Exxon Mobil",
    shares: 1.078159,
    entryPrice: 166.2,
    exitPrice: 185.94,
    score: 80,
    sleeve: "core",
    notes: "Trimmed in Oct (just outside the ±10% band)",
  },
  {
    symbol: "JPM",
    name: "JPMorgan",
    shares: 0.510531,
    entryPrice: 358.68,
    exitPrice: 335.67,
    score: 79,
    sleeve: "core",
    notes: "Extended hold; trimmed 2× to 1×; no Oct order (within band), marked at quote",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet",
    shares: 0.518466,
    entryPrice: 350.78,
    exitPrice: 278.18,
    score: 78,
    sleeve: "core",
    notes: "Extended hold; added to in Oct too — sector-wide selloff, not company-specific",
  },
  {
    symbol: "MRK",
    name: "Merck",
    shares: 1.241616,
    entryPrice: 144.32,
    exitPrice: 150.2,
    score: 77,
    sleeve: "politician",
    notes: "From recent congressional trade disclosures; no Oct order (within band), marked at quote",
  },
  {
    symbol: "SPCX",
    name: "SpaceX",
    shares: 1.199131,
    entryPrice: 136.61,
    exitPrice: 135.96,
    score: 77,
    sleeve: "politician",
    notes: "Extended hold; from recent congressional trade disclosures; added to in Oct",
  },
  {
    symbol: "NOW",
    name: "ServiceNow",
    shares: 1.276464,
    entryPrice: 140.38,
    exitPrice: 103.66,
    score: 76,
    sleeve: "core",
    notes: "Added to in Oct — Q3 beat & raise despite the price drop; sector rotation, not a broken thesis",
  },
  {
    symbol: "PLTR",
    name: "Palantir",
    shares: 1.047253,
    entryPrice: 174.67,
    exitPrice: 184.25,
    score: 75,
    sleeve: "core",
    notes: "Full exit in Oct — not a thesis break, capped out by the new Info-Tech sector cap (1 slot)",
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    shares: 0.355862,
    entryPrice: 504.78,
    exitPrice: 520.33,
    score: 74,
    sleeve: "core",
    notes: "Full exit in Oct — capped out by the new Info-Tech sector cap (1 slot)",
  },
  {
    symbol: "GS",
    name: "Goldman Sachs",
    shares: 0.179562,
    entryPrice: 1043.77,
    exitPrice: 881.8,
    score: 74,
    sleeve: "core",
    notes: "Trimmed 2× to 1×; added back to in Oct (Financials sector cap had room)",
  },
  {
    symbol: "BRK.B",
    name: "Berkshire Hathaway",
    shares: 0.348567,
    entryPrice: 536.72,
    exitPrice: 544.31,
    score: 72,
    sleeve: "core",
    notes: "Full exit in Oct — not a thesis break, scored below JPM/GS for the Financials sector cap",
  },
  {
    symbol: "IT",
    name: "Gartner",
    shares: 0.943263,
    entryPrice: 188.5,
    exitPrice: 226.61,
    score: 72,
    sleeve: "core",
    notes: "Added to equal weight; full exit in Oct — thesis was intact, lost its slot to the new Info-Tech sector cap (1 slot, won by NOW)",
  },
];

const october2026Picks: MonthPick[] = [
  {
    symbol: "CVX",
    name: "Chevron",
    shares: 0.836568,
    entryPrice: 198.48,
    lastPrice: 234.655,
    score: 88,
    sleeve: "core",
    notes: "Extended hold; Brent elevated on Mideast disruption",
  },
  {
    symbol: "XOM",
    name: "Exxon Mobil",
    shares: 0.97856,
    entryPrice: 166.2,
    lastPrice: 185.9895,
    score: 85,
    sleeve: "core",
    notes: "Extended hold; trimmed back toward equal weight",
  },
  {
    symbol: "COP",
    name: "ConocoPhillips",
    shares: 1.298022,
    entryPrice: 138.05,
    lastPrice: 152.89,
    score: 84,
    sleeve: "core",
    notes: "Extended hold; Permian production records",
  },
  {
    symbol: "NOW",
    name: "ServiceNow",
    shares: 1.740867,
    entryPrice: 130.58,
    lastPrice: 103.89,
    score: 83,
    sleeve: "core",
    notes: "Extended hold; Q3 beat & raised guidance despite the price drop — wins the Info-Tech sector-cap slot over NVDA/AMD/IT on score",
  },
  {
    symbol: "LLY",
    name: "Eli Lilly",
    shares: 0.128115,
    entryPrice: 1196.89,
    lastPrice: 1423.51,
    score: 82,
    sleeve: "core",
    notes: "Extended hold; trimmed back toward equal weight",
  },
  {
    symbol: "LMT",
    name: "Lockheed Martin",
    shares: 0.284676,
    entryPrice: 562.92,
    lastPrice: 637.935,
    score: 80,
    sleeve: "core",
    notes: "Extended hold; trimmed back toward equal weight",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet",
    shares: 0.65054,
    entryPrice: 336.04,
    lastPrice: 277.57,
    score: 78,
    sleeve: "core",
    notes: "Extended hold; added to — sector-wide AI-capex selloff (Comm Services −7.7% on the week), not company-specific",
  },
  {
    symbol: "SPCX",
    name: "SpaceX",
    shares: 1.336305,
    entryPrice: 136.54,
    lastPrice: 135.34,
    score: 74,
    sleeve: "politician",
    notes: "From recent congressional trade disclosures; held on merit, not just sleeve continuity",
  },
  {
    symbol: "MRK",
    name: "Merck",
    shares: 1.241616,
    entryPrice: 144.32,
    lastPrice: 150.2,
    score: 73,
    sleeve: "politician",
    notes: "From recent congressional trade disclosures; held on merit",
  },
  {
    symbol: "NEE",
    name: "NextEra Energy",
    shares: 2.103685,
    entryPrice: 84.28,
    lastPrice: 84.29,
    score: 75,
    sleeve: "core",
    notes: "New — utilities led the week; AI-datacenter power-demand tailwind; first utilities exposure this account has had",
  },
  {
    symbol: "JPM",
    name: "JPMorgan",
    shares: 0.510527,
    entryPrice: 358.67,
    lastPrice: 335.67,
    score: 70,
    sleeve: "core",
    notes: "No order this cycle — within the ±10% rebalance band",
  },
  {
    symbol: "LIN",
    name: "Linde",
    shares: 0.344908,
    entryPrice: 514.02,
    lastPrice: 513.855,
    score: 70,
    sleeve: "core",
    notes: "New — fills the one sector (materials) with zero other representation; industrial-gas/semis-fab tailwind",
  },
  {
    symbol: "SO",
    name: "Southern Company",
    shares: 1.884662,
    entryPrice: 94.07,
    lastPrice: 94.15,
    score: 67,
    sleeve: "core",
    notes: "New — slower, more-regulated utility peer to NEE; same rate/power-demand tailwind",
  },
  {
    symbol: "GS",
    name: "Goldman Sachs",
    shares: 0.205602,
    entryPrice: 1023.34,
    lastPrice: 879.9501,
    score: 66,
    sleeve: "core",
    notes: "Added back to — Financials sector cap had room alongside JPM; no fresh negative catalyst",
  },
  {
    symbol: "FRT",
    name: "Federal Realty",
    shares: 1.608803,
    entryPrice: 110.2,
    lastPrice: 110.32,
    score: 62,
    sleeve: "core",
    notes: "New — fills the one sector (real estate) with zero other representation",
  },
  {
    symbol: "USFR",
    name: "WisdomTree Floating Rate Treasury Fund",
    shares: 0.882647,
    entryPrice: 50.41,
    lastPrice: 50.4,
    score: 0,
    sleeve: "safety-net",
    notes: "Safety-net sweep (new, 2026-10-30): 50% of this cycle's gain, scaled by the macro-regime read (Stagflation Risk). Cash-equivalent, never reviewed/sold except to refill the $250 floor. Replaces the old SPY/VOO target.",
  },
];

export const portfolio: PortfolioSnapshot = {
  brand: "Agentic Trader",
  credit: "by Andrew Wagner",
  goal: "Beat the S&P 500 — carefully.",
  tagline:
    "An AI stock picker that chooses about 15 stocks each month from macro news and recent political trades, starting with $3,000, tracked in public.",
  inception: "2026-08-10",
  asOf: "2026-10-30",
  startingCapital: 3000,
  cashApprox: 248.82,
  cashFloor: 250,
  months: [
    {
      id: "2026-10",
      label: "October 2026",
      status: "active",
      startDate: "2026-10-30",
      cashApprox: 248.82,
      picks: october2026Picks,
      summary:
        "Cycle 3 — late rebalance on Oct 30. Added a macro-regime read (CPI/jobs/Fed) that caps how much of the book any one sector can hold each cycle; this cycle classified as Stagflation Risk, which capped Info Tech at just 1 slot and bumped NVDA/AMD/Gartner out even though their theses were intact. New sectors: utilities (NEE, Southern Co) and real estate (Federal Realty) for the first time. Also retired the $500-cumulative-gain safety-net freeze and switched the sweep target from SPY/VOO to USFR (a Treasury floating-rate fund), scaled by the macro regime instead of a flat post-threshold rule.",
    },
    {
      id: "2026-09",
      label: "September 2026",
      status: "closed",
      startDate: "2026-09-14",
      cashApprox: 252.99,
      endNav: 3030.01,
      picks: september2026Picks,
      summary:
        "Cycle 2 — energy/healthcare rotation on Sep 14. Friday 9/18 check held all 15; no emergency sells. Held through most of October unchanged, then rebalanced Oct 30 under the new sector-cap rules above.",
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
      "Holdings get rechecked between rebalances — hold is the default, only a broken thesis triggers an early exit",
      "Two slots come from recent political stock trades",
      "No cap on extended holds — each one re-earns its slot against the fresh scan every cycle",
      "Sector exposure is capped each cycle based on a macro read (inflation, jobs, Fed stance) — a ceiling, not a required minimum, so a sector can land at 0%",
      "Gains sweep into a Treasury floating-rate fund (cash-equivalent) at a rate tied to that same macro read — more conservative when the backdrop turns risky",
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
