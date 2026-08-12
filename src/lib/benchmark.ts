import type { MonthPick } from "../data/portfolio";
import type { HistoryBar } from "./quotes";

export type ComparisonPoint = {
  date: string;
  portfolioIndex: number;
  spyIndex: number;
  portfolioValue: number;
  spyValue: number;
  portfolioReturnPct: number;
  spyReturnPct: number;
};

export type ComparisonResult = {
  series: ComparisonPoint[];
  portfolioReturnPct: number | null;
  spyReturnPct: number | null;
  /** portfolioReturnPct − spyReturnPct at latest point. */
  vsSpyPct: number | null;
  startDate: string | null;
  endDate: string | null;
};

function barsToMap(bars: HistoryBar[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const b of bars) map.set(b.date, b.close);
  return map;
}

/** Forward-fill missing closes so a sparse ticker doesn't drop entire days. */
function closeOnOrBefore(
  map: Map<string, number>,
  date: string,
  sortedDates: string[],
): number | null {
  if (map.has(date)) return map.get(date) ?? null;
  const idx = sortedDates.indexOf(date);
  for (let i = idx - 1; i >= 0; i--) {
    const prev = map.get(sortedDates[i]);
    if (prev != null) return prev;
  }
  return null;
}

export function inceptionToUnix(inception: string): number {
  // Treat inception as UTC midnight so period1 is stable across timezones.
  return Math.floor(Date.parse(`${inception}T00:00:00Z`) / 1000);
}

export function nowUnix(): number {
  return Math.floor(Date.now() / 1000) + 86400; // include today
}

/**
 * Build aligned SPY vs portfolio series indexed to 100 at the first
 * trading day on/after inception where both sides can be valued.
 */
export function buildComparisonSeries(args: {
  startingCapital: number;
  cashApprox: number;
  picks: MonthPick[];
  spyHistory: HistoryBar[];
  pickHistories: Record<string, HistoryBar[]>;
}): ComparisonResult {
  const { startingCapital, cashApprox, picks, spyHistory, pickHistories } = args;
  const empty: ComparisonResult = {
    series: [],
    portfolioReturnPct: null,
    spyReturnPct: null,
    vsSpyPct: null,
    startDate: null,
    endDate: null,
  };

  if (spyHistory.length === 0 || picks.length === 0) return empty;

  const spyMap = barsToMap(spyHistory);
  const pickMaps = picks.map((p) => ({
    pick: p,
    map: barsToMap(pickHistories[p.symbol] ?? []),
  }));

  // Prefer SPY trading calendar as the spine.
  const dates = spyHistory.map((b) => b.date).sort();
  if (dates.length === 0) return empty;

  type Raw = { date: string; portfolioValue: number; spyValue: number };
  const raw: Raw[] = [];

  for (const date of dates) {
    const spyClose = spyMap.get(date);
    if (spyClose == null) continue;

    let equity = 0;
    let priced = 0;
    for (const { pick, map } of pickMaps) {
      const close = closeOnOrBefore(map, date, dates);
      if (close == null) continue;
      equity += pick.shares * close;
      priced += 1;
    }
    // Need at least half the book marked to avoid a junk early NAV.
    if (priced < Math.ceil(picks.length / 2)) continue;

    raw.push({
      date,
      portfolioValue: cashApprox + equity,
      spyValue: spyClose, // scale after we know start
    });
  }

  if (raw.length === 0) return empty;

  const start = raw[0];
  const spyStart = start.spyValue;
  const portStart = start.portfolioValue;
  if (spyStart <= 0 || portStart <= 0) return empty;

  const series: ComparisonPoint[] = raw.map((row) => {
    const spyValue = startingCapital * (row.spyValue / spyStart);
    const portfolioValue = row.portfolioValue;
    // Re-index portfolio to startingCapital so day-one fill quirks don't skew the story.
    const portfolioScaled = startingCapital * (portfolioValue / portStart);
    const portfolioIndex = (portfolioScaled / startingCapital) * 100;
    const spyIndex = (spyValue / startingCapital) * 100;
    return {
      date: row.date,
      portfolioIndex,
      spyIndex,
      portfolioValue: portfolioScaled,
      spyValue,
      portfolioReturnPct: portfolioIndex - 100,
      spyReturnPct: spyIndex - 100,
    };
  });

  const last = series[series.length - 1];
  return {
    series,
    portfolioReturnPct: last.portfolioReturnPct,
    spyReturnPct: last.spyReturnPct,
    vsSpyPct: last.portfolioReturnPct - last.spyReturnPct,
    startDate: series[0].date,
    endDate: last.date,
  };
}
