import { bakedQuotes, yahooSymbol } from "../data/portfolio";

export type QuoteMap = Record<string, number>;

function parseYahooChart(json: unknown): number | null {
  const meta = (json as { chart?: { result?: { meta?: Record<string, unknown> }[] } })
    ?.chart?.result?.[0]?.meta;
  if (!meta) return null;
  const price = meta.regularMarketPrice ?? meta.previousClose;
  return typeof price === "number" ? price : null;
}

/** Prefer Vite proxy in dev; fall back to baked lastPrice for static hosting. */
async function fetchOne(symbol: string): Promise<number | null> {
  const ysym = yahooSymbol(symbol);
  const path = `/api/yahoo/v8/finance/chart/${encodeURIComponent(ysym)}?interval=1d&range=1d`;

  try {
    const res = await fetch(path);
    if (res.ok) {
      const price = parseYahooChart(await res.json());
      if (price != null) return price;
    }
  } catch {
    // Static hosts have no proxy — use baked marks.
  }
  return null;
}

export async function fetchQuotes(symbols: string[]): Promise<QuoteMap> {
  const unique = [...new Set(symbols)];
  const baked = bakedQuotes();
  const entries = await Promise.all(
    unique.map(async (symbol) => {
      const live = await fetchOne(symbol);
      return [symbol, live ?? baked[symbol] ?? null] as const;
    }),
  );
  const map: QuoteMap = {};
  for (const [symbol, price] of entries) {
    if (price != null) map[symbol] = price;
  }
  return map;
}
