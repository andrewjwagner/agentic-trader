/**
 * CI / local script: fetch Yahoo quotes + histories server-side and write
 * public/market-data.json for fast static hosting loads.
 *
 * Run: npx tsx scripts/fetch-market-data.ts
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

const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json,text/plain,*/*",
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

async function yahooGet(url: string, retries = 3): Promise<unknown> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, { headers: YAHOO_HEADERS });
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
        continue;
      }
      if (!res.ok) throw new Error(`Yahoo HTTP ${res.status}`);
      return res.json();
    } catch (err) {
      lastErr = err;
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

async function fetchSpark(symbols: string[]): Promise<QuoteMap> {
  const joined = symbols.map(yahooSymbol).join(",");
  const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(joined)}&range=1d&interval=5m`;
  const json = await yahooGet(url);
  return remapToPortfolioSymbols(parseSpark(json), symbols);
}

async function fetchDailyHistory(
  symbol: string,
  period1: number,
  period2: number,
): Promise<HistoryBar[]> {
  const ysym = yahooSymbol(symbol);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ysym)}?interval=1d&period1=${period1}&period2=${period2}`;
  const json = await yahooGet(url);
  return parseDailyHistory(json);
}

async function fetchHistoriesParallel(
  symbols: string[],
  period1: number,
  period2: number,
  concurrency = 3,
): Promise<Record<string, HistoryBar[]>> {
  const unique = [...new Set(symbols)];
  const out: Record<string, HistoryBar[]> = {};

  for (let i = 0; i < unique.length; i += concurrency) {
    const batch = unique.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async (symbol) => {
        try {
          const bars = await fetchDailyHistory(symbol, period1, period2);
          return [symbol, bars] as const;
        } catch (err) {
          console.warn(`History failed for ${symbol}:`, err);
          return [symbol, [] as HistoryBar[]] as const;
        }
      }),
    );
    for (const [symbol, bars] of results) {
      if (bars.length > 0) out[symbol] = bars;
    }
    if (i + concurrency < unique.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return out;
}

async function main() {
  const month = activeMonth();
  const pickSymbols = month.picks.map((p) => p.symbol);
  const baked = bakedQuotes();

  let live: QuoteMap = {};
  try {
    live = await fetchSpark(pickSymbols);
    console.log(`Spark: ${Object.keys(live).length}/${pickSymbols.length} live quotes`);
  } catch (err) {
    console.warn("Spark fetch failed, using baked quotes:", err);
  }

  const quotes: QuoteMap = { ...baked, ...live };
  const liveCount = pickSymbols.filter((s) => live[s] != null).length;

  const period1 = inceptionToUnix(portfolio.inception);
  const period2 = nowUnix();
  const historySymbols = ["SPY", ...pickSymbols];
  const histories = await fetchHistoriesParallel(historySymbols, period1, period2);

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
  console.log(`Wrote ${OUT_PATH} (${comparison.series.length} chart points)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
