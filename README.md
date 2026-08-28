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

1. Mark the finishing month `status: "closed"`, set `exitPrice` on each pick (drop `lastPrice`), and optionally set `endNav` (account value at close) for future multi-month vs-S&P stitching.
2. Add a new month with `status: "active"` and `lastPrice` baked marks.
3. Keep only one active month — **Refresh prices** reloads the latest `public/market-data.json` snapshot (fast; no browser-side Yahoo scraping).

## Market data (prices + chart)

Prices are baked into `public/market-data.json` at build time and refreshed hourly on weekdays via GitHub Actions.

**Recommended:** add a free [Finnhub](https://finnhub.io) API key as repo secret `FINNHUB_API_KEY` so CI can fetch quotes reliably (Yahoo rate-limits heavily).

```bash
npm run fetch-market-data   # local; respects FINNHUB_API_KEY env var
```

## Benchmark

The Performance chart indexes **Agentic Trader** and **S&P 500 (SPY)** to 100 at inception. SPY is price return only (not dividend-adjusted). Both lines use the same trading days since `portfolio.inception`.

## Deploy

Pushes to `main` build and publish via GitHub Pages (`.github/workflows/pages.yml`).
