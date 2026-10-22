import {
  monthStartDate,
  type MonthBook,
  type MonthPick,
} from "../data/portfolio";
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

function bookOnDate(
  date: string,
  months: MonthBook[],
  inception: string,
): MonthBook | null {
  if (months.length === 0) return null;
  const chronological = [...months].sort((a, b) =>
    monthStartDate(a, inception, months).localeCompare(
      monthStartDate(b, inception, months),
    ),
  );
  let current: MonthBook | null = null;
  for (const month of chronological) {
    if (monthStartDate(month, inception, months) <= date) current = month;
    else break;
  }
  return current;
}

function mapsForPicks(
  picks: MonthPick[],
  pickHistories: Record<string, HistoryBar[]>,
): { pick: MonthPick; map: Map<string, number> }[] {
  return picks.map((p) => ({
    pick: p,
    map: barsToMap(pickHistories[p.symbol] ?? []),
  }));
}

/**
 * Build aligned SPY vs portfolio series indexed to 100 at the first
 * trading day on/after inception where both sides can be valued.
 * Pass `months` to switch holdings on each rebalance date; otherwise
 * the single `picks` book is valued across the whole window.
 */
export function buildComparisonSeries(args: {
  startingCapital: number;
  cashApprox: number;
  picks?: MonthPick[];
  months?: MonthBook[];
  inception?: string;
  spyHistory: HistoryBar[];
  pickHistories: Record<string, HistoryBar[]>;
}): ComparisonResult {
  const {
    startingCapital,
    cashApprox,
    picks,
    months,
    inception = "1970-01-01",
    spyHistory,
    pickHistories,
  } = args;
  const empty: ComparisonResult = {
    series: [],
    portfolioReturnPct: null,
    spyReturnPct: null,
    vsSpyPct: null,
    startDate: null,
    endDate: null,
  };

  const fallbackPicks = picks ?? months?.find((m) => m.status === "active")?.picks ?? [];
  if (spyHistory.length === 0 || (fallbackPicks.length === 0 && !months?.length)) {
    return empty;
  }

  const spyMap = barsToMap(spyHistory);
  const monthMaps = new Map<string, { pick: MonthPick; map: Map<string, number> }[]>();
  if (months && months.length > 0) {
    for (const month of months) {
      monthMaps.set(month.id, mapsForPicks(month.picks, pickHistories));
    }
  }
  const singleMaps = mapsForPicks(fallbackPicks, pickHistories);

  // Prefer SPY trading calendar as the spine.
  const dates = spyHistory.map((b) => b.date).sort();
  if (dates.length === 0) return empty;

  type Raw = { date: string; portfolioValue: number; spyValue: number };
  const raw: Raw[] = [];

  for (const date of dates) {
    const spyClose = spyMap.get(date);
    if (spyClose == null) continue;

    const book =
      months && months.length > 0 ? bookOnDate(date, months, inception) : null;
    if (months && months.length > 0 && !book) continue;
    const pickMaps = book ? (monthMaps.get(book.id) ?? []) : singleMaps;
    const cash = book?.cashApprox ?? cashApprox;
    if (pickMaps.length === 0) continue;

    let equity = 0;
    let priced = 0;
    for (const { pick, map } of pickMaps) {
      const close = closeOnOrBefore(map, date, dates);
      if (close == null) continue;
      equity += pick.shares * close;
      priced += 1;
    }
    // Need at least half the book marked to avoid a junk early NAV.
    if (priced < Math.ceil(pickMaps.length / 2)) continue;

    raw.push({
      date,
      portfolioValue: cash + equity,
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
