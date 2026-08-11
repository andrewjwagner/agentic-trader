import { bakedQuotes, yahooSymbol } from "../data/portfolio";

export type QuoteMap = Record<string, number>;

export type QuoteFetchResult = {
  quotes: QuoteMap;
  /** True when at least one live market price was retrieved. */
  liveCount: number;
  source: "live" | "saved" | "mixed";
};

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

/**
 * Fetch live quotes (batched Yahoo spark via local proxy or allorigins).
 * Fill gaps with baked lastPrice so the UI never goes blank.
 */
export async function fetchQuotes(symbols: string[]): Promise<QuoteFetchResult> {
  const unique = [...new Set(symbols)];
  const baked = bakedQuotes();

  let live = remapToPortfolioSymbols(await fetchSparkDirect(unique), unique);
  if (Object.keys(live).length === 0) {
    live = remapToPortfolioSymbols(await fetchSparkAllOrigins(unique), unique);
  }

  // Fill any missing names with a per-symbol chart call (e.g. odd tickers).
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
}
