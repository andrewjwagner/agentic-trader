import { useEffect, useState } from "react";
import { investedCapital, portfolio } from "../data/portfolio";
import { fetchQuotes, type QuoteMap } from "./quotes";

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

export interface PortfolioMarks {
  loading: boolean;
  quotes: QuoteMap;
  positions: PositionMark[];
  equityValue: number | null;
  totalValue: number | null;
  totalPnl: number | null;
  totalReturnPct: number | null;
  winners: PositionMark[];
  losers: PositionMark[];
  costBasis: number;
  invested: number;
}

export function usePortfolioMarks(): PortfolioMarks {
  const [quotes, setQuotes] = useState<QuoteMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const map = await fetchQuotes(portfolio.holdings.map((h) => h.symbol));
      if (!cancelled) {
        setQuotes(map);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const positions: PositionMark[] = portfolio.holdings.map((h) => {
    const price = quotes[h.symbol] ?? h.lastPrice;
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
  });

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

  return {
    loading,
    quotes,
    positions,
    equityValue,
    totalValue,
    totalPnl,
    totalReturnPct,
    winners,
    losers,
    costBasis,
    invested,
  };
}
