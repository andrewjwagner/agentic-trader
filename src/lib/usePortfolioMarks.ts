import { useCallback, useEffect, useMemo, useState } from "react";
import {
  activeMonth,
  closedMonths,
  closedPickReturnPct,
  investedCapital,
  portfolio,
  type MonthPick,
} from "../data/portfolio";
import {
  buildComparisonSeries,
  inceptionToUnix,
  nowUnix,
  type ComparisonPoint,
  type ComparisonResult,
} from "./benchmark";
import { fetchDailyHistories, fetchQuotes, type QuoteMap } from "./quotes";

export interface PositionMark {
  symbol: string;
  name: string;
  shares: number;
  entryPrice: number;
  price: number | null;
  cost: number;
  marketValue: number | null;
  pnl: number | null;
  returnPct: number | null;
  score: number;
  sleeve: string;
  notes?: string;
}

export interface ClosedPositionMark {
  monthId: string;
  monthLabel: string;
  symbol: string;
  name: string;
  entryPrice: number;
  exitPrice: number;
  returnPct: number;
  score: number;
  sleeve: string;
}

export interface PortfolioMarks {
  loading: boolean;
  refreshing: boolean;
  quotes: QuoteMap;
  positions: PositionMark[];
  equityValue: number | null;
  totalValue: number | null;
  totalPnl: number | null;
  totalReturnPct: number | null;
  winners: PositionMark[];
  losers: PositionMark[];
  closedWinners: ClosedPositionMark[];
  closedLosers: ClosedPositionMark[];
  costBasis: number;
  invested: number;
  liveCount: number;
  source: "live" | "saved" | "mixed" | null;
  refreshedAt: Date | null;
  refreshError: string | null;
  activeMonthId: string;
  activeMonthLabel: string;
  comparisonSeries: ComparisonPoint[];
  vsSpyPct: number | null;
  portfolioBenchReturnPct: number | null;
  spyReturnPct: number | null;
  historyLoading: boolean;
  historyError: string | null;
  refresh: () => Promise<void>;
}

function markActivePick(h: MonthPick, quotes: QuoteMap): PositionMark {
  const price = quotes[h.symbol] ?? h.lastPrice ?? h.entryPrice;
  const cost = h.shares * h.entryPrice;
  const marketValue = h.shares * price;
  const pnl = marketValue - cost;
  const returnPct = cost > 0 ? (pnl / cost) * 100 : null;
  return {
    symbol: h.symbol,
    name: h.name,
    shares: h.shares,
    entryPrice: h.entryPrice,
    price,
    cost,
    marketValue,
    pnl,
    returnPct,
    score: h.score,
    sleeve: h.sleeve,
    notes: h.notes,
  };
}

const emptyComparison: ComparisonResult = {
  series: [],
  portfolioReturnPct: null,
  spyReturnPct: null,
  vsSpyPct: null,
  startDate: null,
  endDate: null,
};

export function usePortfolioMarks(): PortfolioMarks {
  const active = activeMonth();
  const [quotes, setQuotes] = useState<QuoteMap>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveCount, setLiveCount] = useState(0);
  const [source, setSource] = useState<"live" | "saved" | "mixed" | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult>(emptyComparison);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const month = activeMonth();
      const period1 = inceptionToUnix(portfolio.inception);
      const period2 = nowUnix();
      const symbols = ["SPY", ...month.picks.map((p) => p.symbol)];
      const histories = await fetchDailyHistories(symbols, period1, period2, 4);
      const spyHistory = histories.SPY ?? [];
      if (spyHistory.length === 0) {
        setComparison(emptyComparison);
        setHistoryError(
          "Couldn’t load S&P 500 history. Try Refresh prices again in a moment.",
        );
        return;
      }
      const pickHistories: Record<string, typeof spyHistory> = {};
      for (const pick of month.picks) {
        if (histories[pick.symbol]) pickHistories[pick.symbol] = histories[pick.symbol];
      }
      const result = buildComparisonSeries({
        startingCapital: portfolio.startingCapital,
        cashApprox: portfolio.cashApprox,
        picks: month.picks,
        spyHistory,
        pickHistories,
      });
      setComparison(result);
      if (result.series.length === 0) {
        setHistoryError("Not enough price history yet to chart vs S&P 500.");
      }
    } catch {
      setComparison(emptyComparison);
      setHistoryError("Benchmark history failed to load.");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const load = useCallback(
    async (isRefresh: boolean) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setRefreshError(null);
      try {
        const symbols = activeMonth().picks.map((h) => h.symbol);
        const [result] = await Promise.all([
          fetchQuotes(symbols),
          loadHistory(),
        ]);
        setQuotes(result.quotes);
        setLiveCount(result.liveCount);
        setSource(result.source);
        setRefreshedAt(new Date());
        if (result.liveCount === 0) {
          setRefreshError(
            "Couldn’t reach live prices — showing saved marks. Try again in a moment.",
          );
        }
      } catch {
        setRefreshError("Refresh failed. Showing the last saved marks.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loadHistory],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  const refresh = useCallback(async () => {
    await load(true);
  }, [load]);

  const positions = useMemo(
    () => active.picks.map((h) => markActivePick(h, quotes)),
    [active.picks, quotes],
  );

  const costBasis = positions.reduce((s, p) => s + p.cost, 0);
  const equityValue = positions.reduce((s, p) => s + (p.marketValue as number), 0);
  const totalValue = equityValue + portfolio.cashApprox;
  const invested = investedCapital();
  const totalPnl = totalValue - invested;
  const totalReturnPct = invested > 0 ? (totalPnl / invested) * 100 : null;

  const ranked = [...positions]
    .filter((p) => p.returnPct != null)
    .sort((a, b) => (b.returnPct as number) - (a.returnPct as number));

  const winners = ranked.filter((p) => (p.returnPct as number) > 0);
  const losers = ranked
    .filter((p) => (p.returnPct as number) < 0)
    .sort((a, b) => (a.returnPct as number) - (b.returnPct as number));

  const closedMarks = closedMonths().flatMap((month) =>
    month.picks.flatMap((pick): ClosedPositionMark[] => {
      const returnPct = closedPickReturnPct(pick);
      if (pick.exitPrice == null || returnPct == null) return [];
      return [
        {
          monthId: month.id,
          monthLabel: month.label,
          symbol: pick.symbol,
          name: pick.name,
          entryPrice: pick.entryPrice,
          exitPrice: pick.exitPrice,
          returnPct,
          score: pick.score,
          sleeve: pick.sleeve,
        },
      ];
    }),
  );

  const closedWinners = [...closedMarks]
    .filter((t) => t.returnPct > 0)
    .sort((a, b) => b.returnPct - a.returnPct);
  const closedLosers = [...closedMarks]
    .filter((t) => t.returnPct < 0)
    .sort((a, b) => a.returnPct - b.returnPct);

  return {
    loading,
    refreshing,
    quotes,
    positions,
    equityValue,
    totalValue,
    totalPnl,
    totalReturnPct,
    winners,
    losers,
    closedWinners,
    closedLosers,
    costBasis,
    invested,
    liveCount,
    source,
    refreshedAt,
    refreshError,
    activeMonthId: active.id,
    activeMonthLabel: active.label,
    comparisonSeries: comparison.series,
    vsSpyPct: comparison.vsSpyPct,
    portfolioBenchReturnPct: comparison.portfolioReturnPct,
    spyReturnPct: comparison.spyReturnPct,
    historyLoading,
    historyError,
    refresh,
  };
}
