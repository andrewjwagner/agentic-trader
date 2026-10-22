# Agentic Trader by Andrew Wagner

Public performance site for an AI stock picker that aims to beat the S&P 500 carefully.

**Live:** https://andrewjwagner.github.io/agentic-trader/

This repo is shareable marketing/tracking only — no brokerage credentials or account numbers.

## Local

```bash
npm install
npm run dev
```

## After a rebalance

1. Mark the finishing month `status: "closed"`, set `exitPrice` on each pick (drop `lastPrice`), set `startDate` / `cashApprox`, and optionally set `endNav` (account value at close). The vs-S&P chart switches holdings on each month's `startDate`.
2. Add a new month with `status: "active"` and `lastPrice` baked marks.
3. Keep only one active month — **Refresh prices** reloads the latest `public/market-data.json` snapshot (fast; no browser-side Yahoo scraping).

## Market data (prices + chart)

Prices are baked into `public/market-data.json` at build time and refreshed hourly on weekdays via GitHub Actions.

**Recommended:** add a free [Finnhub](https://finnhub.io) API key as repo secret `FINNHUB_API_KEY` so CI can fetch quotes reliably (Yahoo rate-limits heavily). Live quotes work on Finnhub's free tier, but **historical candles do not** (403 on the free plan) — Yahoo's chart endpoint is also commonly rate-limited from CI. So the vs-S&P chart's daily history comes from `src/data/baked-history.json` instead, a plain `{symbol: [{date, close}, ...]}` seed, with any live-fetched bars layered on top per date when they're available. Each CI run also appends today's bar from the live quote it *does* get, so the series stays current even when the history APIs are fully down.

```bash
npm run fetch-market-data   # local; respects FINNHUB_API_KEY env var
```

**Refreshing `baked-history.json`:** since neither free API reliably serves history, refresh this file periodically (e.g. as part of the monthly rebalance run, which already has reliable brokerage API access) by pulling daily closes for `SPY` + every symbol in `allPickSymbols()` since `portfolio.inception`, merging by date (new data wins), and committing the result. This is the same kind of baked-snapshot discipline the rest of this site's data already uses (`lastPrice` on picks, `market-data.json` on deploy) — nothing new conceptually, just applied to history instead of point-in-time quotes.

## Benchmark

The Performance chart indexes **Agentic Trader** and **S&P 500 (SPY)** to 100 at inception. SPY is price return only (not dividend-adjusted). Both lines use the same trading days since `portfolio.inception`.

## Deploy

Pushes to `main` build and publish via GitHub Pages (`.github/workflows/pages.yml`).
