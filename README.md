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

Update `src/data/portfolio.ts` (holdings, `lastPrice`, cash, closed trades).

## Deploy

Pushes to `main` build and publish via GitHub Pages (`.github/workflows/pages.yml`).
