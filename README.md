# Agentic Trader by Andrew Wagner

Public performance site for an AI stock picker that aims to beat the S&P 500 carefully.

**Live:** https://andrewjwagner.github.io/agentic-trader/

This repo is shareable marketing/tracking only — no brokerage credentials or account numbers.

## Local

```bash
npm install
npm run dev
```

After a rebalance

1. Mark the finishing month `status: "closed"` and set `exitPrice` on each pick (drop `lastPrice`).
2. Add a new month with `status: "active"` and `lastPrice` baked marks.
3. Keep only one active month — Refresh prices updates that month only.

## Deploy

Pushes to `main` build and publish via GitHub Pages (`.github/workflows/pages.yml`).
