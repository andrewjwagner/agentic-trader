import { bakedQuotes, yahooSymbol } from "../data/portfolio";
import type { ComparisonPoint } from "./benchmark";

export type QuoteMap = Record<string, number>;

export type QuoteFetchResult = {
  quotes: QuoteMap;
  /** True when at least one live market price was retrieved. */
  liveCount: number;
  source: "live" | "saved" | "mixed";
};

/** Pre-baked market snapshot written by scripts/fetch-market-data.ts in CI. */
export type MarketDataSnapshot = {
  fetchedAt: string;
  quotes: QuoteMap;
  liveCount: number;
  comparisonSeries: ComparisonPoint[];
  vsSpyPct: number | null;
  portfolioReturnPct: number | null;
  spyReturnPct: number | null;
  startDate: string | null;
  endDate: string | null;
};

const MARKET_DATA_URL = `${import.meta.env.BASE_URL}market-data.json`;

export async function fetchMarketDataJson(
  cacheBust = false,
): Promise<MarketDataSnapshot | null> {
  try {
    const url = cacheBust ? `${MARKET_DATA_URL}?t=${Date.now()}` : MARKET_DATA_URL;
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) return null;
    const data = (await res.json()) as MarketDataSnapshot;
    if (!data?.quotes || !data.fetchedAt) return null;
    return data;
  } catch {
    return null;
  }
}

type SparkPayload = {
  spark?: {
    result?: {
      symbol?: string;
      response?: { meta?: Record<string, unknown> }[];
    }[];
  };
};

function priceFromMeta(meta: Record<string, unknown> | undefined): number | null {
  if (!meta) return null;
  const price = meta.regularMarketPrice ?? meta.previousClose;
  return typeof price === "number" ? price : null;
}

function parseSpark(json: unknown): QuoteMap {
  const map: QuoteMap = {};
  const results = (json as SparkPayload)?.spark?.result ?? [];
  for (const item of results) {
    const symbol = item.symbol;
    if (!symbol) continue;
    const price = priceFromMeta(item.response?.[0]?.meta);
    if (price != null) map[symbol] = price;
  }
  return map;
}

function parseYahooChart(json: unknown): number | null {
  const meta = (
    json as { chart?: { result?: { meta?: Record<string, unknown> }[] } }
  )?.chart?.result?.[0]?.meta;
  return priceFromMeta(meta);
}

function yahooSparkUrl(symbols: string[]): string {
  const joined = symbols.map(yahooSymbol).join(",");
  return `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(joined)}&range=1d&interval=5m`;
}

async function fetchSparkDirect(symbols: string[]): Promise<QuoteMap> {
  // Vite proxy in local/preview only.
  const path = `/api/yahoo/v7/finance/spark?symbols=${encodeURIComponent(
    symbols.map(yahooSymbol).join(","),
  )}&range=1d&interval=5m`;
  try {
    const res = await fetch(path);
    if (!res.ok) return {};
    return parseSpark(await res.json());
  } catch {
    return {};
  }
}

async function fetchSparkAllOrigins(symbols: string[]): Promise<QuoteMap> {
  const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(
    yahooSparkUrl(symbols),
  )}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return {};
    return parseSpark(await res.json());
  } catch {
    return {};
  }
}

async function fetchChartAllOrigins(symbol: string): Promise<number | null> {
  const ysym = yahooSymbol(symbol);
  const yahoo = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ysym)}?interval=1d&range=1d`;
  const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(yahoo)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return parseYahooChart(await res.json());
  } catch {
    return null;
  }
}

/** Map Yahoo symbols (BRK-B) back to portfolio symbols (BRK.B). */
function remapToPortfolioSymbols(
  live: QuoteMap,
  portfolioSymbols: string[],
): QuoteMap {
  const byYahoo: QuoteMap = { ...live };
  const out: QuoteMap = {};
  for (const symbol of portfolioSymbols) {
    const y = yahooSymbol(symbol);
    const price = byYahoo[symbol] ?? byYahoo[y];
    if (price != null) out[symbol] = price;
  }
  return out;
}

export type HistoryBar = {
  /** ISO date YYYY-MM-DD (UTC calendar day of the bar). */
  date: string;
  close: number;
};

type ChartHistoryPayload = {
  chart?: {
    result?: {
      timestamp?: number[];
      indicators?: { quote?: { close?: (number | null)[] }[] };
    }[];
  };
};

function formatUtcDate(ts: number): string {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

function parseDailyHistory(json: unknown): HistoryBar[] {
  const result = (json as ChartHistoryPayload)?.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const bars: HistoryBar[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (typeof close !== "number" || !Number.isFinite(close)) continue;
    bars.push({ date: formatUtcDate(timestamps[i]), close });
  }
  return bars;
}

function yahooHistoryUrl(symbol: string, period1: number, period2: number): string {
  const ysym = yahooSymbol(symbol);
  return `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ysym)}?interval=1d&period1=${period1}&period2=${period2}`;
}

async function fetchDailyHistoryDirect(
  symbol: string,
  period1: number,
  period2: number,
): Promise<HistoryBar[]> {
  const ysym = yahooSymbol(symbol);
  const path = `/api/yahoo/v8/finance/chart/${encodeURIComponent(ysym)}?interval=1d&period1=${period1}&period2=${period2}`;
  try {
    const res = await fetch(path);
    if (!res.ok) return [];
    return parseDailyHistory(await res.json());
  } catch {
    return [];
  }
}

async function fetchDailyHistoryAllOrigins(
  symbol: string,
  period1: number,
  period2: number,
): Promise<HistoryBar[]> {
  const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(
    yahooHistoryUrl(symbol, period1, period2),
  )}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    return parseDailyHistory(await res.json());
  } catch {
    return [];
  }
}

/** Daily OHLCV closes for one symbol from period1 → period2 (unix seconds). */
export async function fetchDailyHistory(
  symbol: string,
  period1: number,
  period2: number,
): Promise<HistoryBar[]> {
  const direct = await fetchDailyHistoryDirect(symbol, period1, period2);
  if (direct.length > 0) return direct;
  return fetchDailyHistoryAllOrigins(symbol, period1, period2);
}

/**
 * Fetch daily histories for many symbols with a small concurrency cap.
 * Missing / failed symbols are omitted from the map (do not fail the batch).
 */
export async function fetchDailyHistories(
  symbols: string[],
  period1: number,
  period2: number,
  concurrency = 4,
): Promise<Record<string, HistoryBar[]>> {
  const unique = [...new Set(symbols)];
  const out: Record<string, HistoryBar[]> = {};

  for (let i = 0; i < unique.length; i += concurrency) {
    const batch = unique.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async (symbol) => {
        const bars = await fetchDailyHistory(symbol, period1, period2);
        return [symbol, bars] as const;
      }),
    );
    for (const [symbol, bars] of results) {
      if (bars.length > 0) out[symbol] = bars;
    }
  }

  return out;
}

const REFRESH_TIMEOUT_MS = 8000;

/** @deprecated Client-side live Yahoo is unreliable on static hosting; prefer fetchMarketDataJson. */
export async function fetchQuotes(symbols: string[]): Promise<QuoteFetchResult> {
  const unique = [...new Set(symbols)];
  const baked = bakedQuotes();

  const fetchLive = async (): Promise<QuoteFetchResult> => {
    let live = remapToPortfolioSymbols(await fetchSparkDirect(unique), unique);
    if (Object.keys(live).length === 0) {
      live = remapToPortfolioSymbols(await fetchSparkAllOrigins(unique), unique);
    }

    const missing = unique.filter((s) => live[s] == null);
    if (missing.length > 0 && missing.length <= 6) {
      const extras = await Promise.all(
        missing.map(async (symbol) => [symbol, await fetchChartAllOrigins(symbol)] as const),
      );
      for (const [symbol, price] of extras) {
        if (price != null) live[symbol] = price;
      }
    }

    const map: QuoteMap = { ...baked, ...live };
    const liveCount = unique.filter((s) => live[s] != null).length;
    const source =
      liveCount === 0 ? "saved" : liveCount === unique.length ? "live" : "mixed";

    return { quotes: map, liveCount, source };
  };

  try {
    return await Promise.race([
      fetchLive(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), REFRESH_TIMEOUT_MS),
      ),
    ]);
  } catch {
    return { quotes: baked, liveCount: 0, source: "saved" };
  }
}
