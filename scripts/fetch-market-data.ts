/**
 * CI / local script: fetch quotes + histories server-side and write
 * public/market-data.json for fast static hosting loads.
 *
 * Data sources (in order):
 * 1. Finnhub — if FINNHUB_API_KEY env var is set (recommended; free at finnhub.io)
 * 2. Yahoo Finance — fallback with rate-limit aware retries
 *
 * Run: npm run fetch-market-data
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  activeMonth,
  bakedQuotes,
  portfolio,
  yahooSymbol,
} from "../src/data/portfolio";
import {
  buildComparisonSeries,
  inceptionToUnix,
  nowUnix,
} from "../src/lib/benchmark";
import type { HistoryBar } from "../src/lib/quotes";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "../public/market-data.json");
const FINNHUB_KEY = process.env.FINNHUB_API_KEY?.trim() || "";

const YAHOO_HOST = "https://query1.finance.yahoo.com";

const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json,text/plain,*/*",
  Referer: "https://finance.yahoo.com/",
};

type QuoteMap = Record<string, number>;

type SparkPayload = {
  spark?: {
    result?: {
      symbol?: string;
      response?: { meta?: Record<string, unknown> }[];
    }[];
  };
};

type ChartHistoryPayload = {
  chart?: {
    result?: {
      timestamp?: number[];
      indicators?: { quote?: { close?: (number | null)[] }[] };
    }[];
  };
};

type FinnhubQuote = { c?: number; pc?: number };
type FinnhubCandle = { s?: string; t?: number[]; c?: number[] };

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

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

function parseFinnhubCandles(json: unknown): HistoryBar[] {
  const data = json as FinnhubCandle;
  if (data.s !== "ok" || !data.t || !data.c) return [];
  const bars: HistoryBar[] = [];
  for (let i = 0; i < data.t.length; i++) {
    const close = data.c[i];
    if (typeof close !== "number" || !Number.isFinite(close)) continue;
    bars.push({ date: formatUtcDate(data.t[i]), close });
  }
  return bars;
}

function remapToPortfolioSymbols(live: QuoteMap, portfolioSymbols: string[]): QuoteMap {
  const byYahoo: QuoteMap = { ...live };
  const out: QuoteMap = {};
  for (const symbol of portfolioSymbols) {
    const y = yahooSymbol(symbol);
    const price = byYahoo[symbol] ?? byYahoo[y];
    if (price != null) out[symbol] = price;
  }
  return out;
}

async function yahooGet(path: string, retries = 6): Promise<unknown> {
  let lastErr: Error = new Error("Yahoo request failed");

  for (let attempt = 0; attempt < retries; attempt++) {
    const url = `${YAHOO_HOST}${path}`;
    try {
      const res = await fetch(url, { headers: YAHOO_HEADERS });
      if (res.status === 429) {
        lastErr = new Error("Yahoo HTTP 429");
        await sleep(2000 * (attempt + 1));
        continue;
      }
      if (!res.ok) {
        lastErr = new Error(`Yahoo HTTP ${res.status}`);
        await sleep(800 * (attempt + 1));
        continue;
      }
      return res.json();
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      await sleep(800 * (attempt + 1));
    }
  }

  throw lastErr;
}

async function fetchSparkYahoo(symbols: string[]): Promise<QuoteMap> {
  const joined = symbols.map(yahooSymbol).join(",");
  const path = `/v7/finance/spark?symbols=${joined}&range=1d&interval=5m`;
  const json = await yahooGet(path);
  return remapToPortfolioSymbols(parseSpark(json), symbols);
}

async function fetchDailyHistoryYahoo(
  symbol: string,
  period1: number,
  period2: number,
): Promise<HistoryBar[]> {
  const ysym = yahooSymbol(symbol);
  const path = `/v8/finance/chart/${encodeURIComponent(ysym)}?interval=1d&period1=${period1}&period2=${period2}`;
  const json = await yahooGet(path);
  return parseDailyHistory(json);
}

async function finnhubGet(path: string): Promise<unknown> {
  const sep = path.includes("?") ? "&" : "?";
  const url = `https://finnhub.io/api/v1${path}${sep}token=${FINNHUB_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub HTTP ${res.status}`);
  return res.json();
}

async function fetchQuoteFinnhub(symbol: string): Promise<number | null> {
  const json = (await finnhubGet(
    `/quote?symbol=${encodeURIComponent(symbol)}`,
  )) as FinnhubQuote;
  const price = json.c;
  return typeof price === "number" && price > 0 ? price : null;
}

async function fetchCandlesFinnhub(
  symbol: string,
  period1: number,
  period2: number,
): Promise<HistoryBar[]> {
  const json = await finnhubGet(
    `/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${period1}&to=${period2}`,
  );
  return parseFinnhubCandles(json);
}

async function fetchQuotes(
  symbols: string[],
  baked: QuoteMap,
): Promise<{ quotes: QuoteMap; liveCount: number }> {
  const live: QuoteMap = {};

  if (FINNHUB_KEY) {
    console.log("Fetching quotes via Finnhub…");
    for (const symbol of symbols) {
      try {
        const price = await fetchQuoteFinnhub(symbol);
        if (price != null) live[symbol] = price;
        await sleep(1100);
      } catch (err) {
        console.warn(`Finnhub quote failed for ${symbol}:`, err);
      }
    }
  } else {
    try {
      Object.assign(live, await fetchSparkYahoo(symbols));
      console.log(`Yahoo spark: ${Object.keys(live).length}/${symbols.length} quotes`);
    } catch (err) {
      console.warn("Yahoo spark failed:", err);
    }
  }

  const quotes = { ...baked, ...live };
  const liveCount = symbols.filter((s) => live[s] != null).length;
  return { quotes, liveCount };
}

async function fetchHistories(
  symbols: string[],
  period1: number,
  period2: number,
): Promise<Record<string, HistoryBar[]>> {
  const unique = [...new Set(symbols)];
  const out: Record<string, HistoryBar[]> = {};

  if (FINNHUB_KEY) {
    console.log("Fetching histories via Finnhub…");
    for (const symbol of unique) {
      try {
        const bars = await fetchCandlesFinnhub(symbol, period1, period2);
        if (bars.length > 0) out[symbol] = bars;
        await sleep(1100);
      } catch (err) {
        console.warn(`Finnhub history failed for ${symbol}:`, err);
      }
    }
    return out;
  }

  console.log("Fetching histories via Yahoo (sequential)…");
  for (const symbol of unique) {
    try {
      const bars = await fetchDailyHistoryYahoo(symbol, period1, period2);
      if (bars.length > 0) out[symbol] = bars;
      await sleep(1500);
    } catch (err) {
      console.warn(`Yahoo history failed for ${symbol}:`, err);
    }
  }
  return out;
}

async function main() {
  const month = activeMonth();
  const pickSymbols = month.picks.map((p) => p.symbol);
  const baked = bakedQuotes();

  if (!FINNHUB_KEY) {
    console.log(
      "Tip: set FINNHUB_API_KEY for reliable CI fetches (free at https://finnhub.io)",
    );
  }

  const { quotes, liveCount } = await fetchQuotes(pickSymbols, baked);

  const period1 = inceptionToUnix(portfolio.inception);
  const period2 = nowUnix();
  const historySymbols = ["SPY", ...pickSymbols];
  const histories = await fetchHistories(historySymbols, period1, period2);

  const spyHistory = histories.SPY ?? [];
  const pickHistories: Record<string, HistoryBar[]> = {};
  for (const pick of month.picks) {
    if (histories[pick.symbol]) pickHistories[pick.symbol] = histories[pick.symbol];
  }

  const comparison = buildComparisonSeries({
    startingCapital: portfolio.startingCapital,
    cashApprox: portfolio.cashApprox,
    picks: month.picks,
    spyHistory,
    pickHistories,
  });

  const payload = {
    fetchedAt: new Date().toISOString(),
    quotes,
    liveCount,
    comparisonSeries: comparison.series,
    vsSpyPct: comparison.vsSpyPct,
    portfolioReturnPct: comparison.portfolioReturnPct,
    spyReturnPct: comparison.spyReturnPct,
    startDate: comparison.startDate,
    endDate: comparison.endDate,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${OUT_PATH} (${comparison.series.length} chart points, ${liveCount} live)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
