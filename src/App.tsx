import { motion } from "framer-motion";
import { portfolio } from "./data/portfolio";
import { formatMoney, formatPct } from "./lib/format";
import type { PortfolioMarks } from "./lib/usePortfolioMarks";
import { HeroChart } from "./components/HeroChart";
import { MonthPicks } from "./components/MonthPicks";
import { VsSpyChart } from "./components/VsSpyChart";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

interface Props {
  marks: PortfolioMarks;
}

export function App({ marks }: Props) {
  const {
    refreshing,
    positions,
    totalValue,
    totalPnl,
    totalReturnPct,
    winners,
    losers,
    closedWinners,
    closedLosers,
    invested,
    liveCount,
    source,
    refreshedAt,
    snapshotFetchedAt,
    refreshError,
    activeMonthLabel,
    comparisonSeries,
    vsSpyPct,
    portfolioBenchReturnPct,
    spyReturnPct,
    historyLoading,
    historyError,
    refresh,
  } = marks;

  return (
    <>
      <nav className="nav">
        <div className="nav-brand">{portfolio.brand}</div>
        <ul className="nav-links">
          <li>
            <a href="#performance">Performance</a>
          </li>
          <li>
            <a href="#picks">Picks</a>
          </li>
          <li>
            <a href="#leaders">Leaders</a>
          </li>
          <li>
            <a href="#strategy">Strategy</a>
          </li>
        </ul>
      </nav>

      <header className="hero">
        <div className="hero-grid" />
        <HeroChart />
        <div className="hero-inner">
          <motion.h1
            className="hero-brand"
            {...fadeUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {portfolio.brand}
          </motion.h1>
          <motion.p
            className="hero-credit"
            {...fadeUp}
            transition={{ duration: 0.7, delay: 0.08, ease: "easeOut" }}
          >
            {portfolio.credit}
          </motion.p>
          <motion.p
            className="hero-goal"
            {...fadeUp}
            transition={{ duration: 0.7, delay: 0.14, ease: "easeOut" }}
          >
            {portfolio.goal}
          </motion.p>
          <motion.p
            className="hero-lede"
            {...fadeUp}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            {portfolio.tagline}
          </motion.p>
          <motion.div
            className="hero-actions"
            {...fadeUp}
            transition={{ duration: 0.7, delay: 0.28, ease: "easeOut" }}
          >
            <a className="btn" href="#performance">
              View performance
            </a>
            <a className="btn btn-ghost" href="#picks">
              Current picks
            </a>
          </motion.div>
        </div>
      </header>

      <main>
        <section id="performance">
          <div className="shell">
            <div className="section-head section-head-row">
              <div>
                <p className="section-kicker">
                  <span
                    className={`live-dot ${source === "saved" || source === null ? "dim" : ""}`}
                  />
                  {source === "live" || source === "mixed"
                    ? "Live marks"
                    : source === "snapshot"
                      ? "Snapshot marks"
                      : "Saved marks"}
                </p>
                <h2 className="section-title">Performance</h2>
                <p className="section-sub">
                  Account value vs. the ${portfolio.startingCapital.toLocaleString()}{" "}
                  started on {portfolio.inception}. Chart compares to the S&amp;P 500
                  (SPY) over the same period. Refresh updates {activeMonthLabel}{" "}
                  marks and the benchmark history.
                </p>
              </div>
              <div className="refresh-panel">
                <button
                  type="button"
                  className="btn btn-ghost refresh-btn"
                  onClick={() => void refresh()}
                  disabled={refreshing || historyLoading}
                >
                  {refreshing ? "Refreshing…" : "Refresh prices"}
                </button>
                <p className="refresh-meta">
                  {refreshedAt
                    ? `Live refresh ${refreshedAt.toLocaleTimeString()}`
                    : snapshotFetchedAt
                      ? `Snapshot ${snapshotFetchedAt.toLocaleString()}`
                      : "—"}
                  {liveCount > 0
                    ? ` · ${liveCount}/${positions.length} live`
                    : null}
                </p>
                {refreshError ? (
                  <p className="refresh-error">{refreshError}</p>
                ) : null}
              </div>
            </div>

            <div className="stat-row">
              <div className="stat">
                <p className="stat-label">Total value</p>
                <p className="stat-value">
                  {totalValue == null ? (
                    <span className="skeleton" />
                  ) : (
                    formatMoney(totalValue, 0)
                  )}
                </p>
                <p className="stat-meta">
                  Stocks + ~{formatMoney(portfolio.cashApprox, 0)} cash
                </p>
              </div>
              <div className="stat">
                <p className="stat-label">Invested</p>
                <p className="stat-value">{formatMoney(invested, 0)}</p>
                <p className="stat-meta">Starting capital</p>
              </div>
              <div className="stat">
                <p className="stat-label">P&amp;L</p>
                <p
                  className={`stat-value ${
                    totalPnl == null ? "" : totalPnl >= 0 ? "pos" : "neg"
                  }`}
                >
                  {totalPnl == null ? (
                    <span className="skeleton" />
                  ) : (
                    formatMoney(totalPnl, 0)
                  )}
                </p>
                <p className="stat-meta">Unrealized + cash vs. start</p>
              </div>
              <div className="stat">
                <p className="stat-label">Return</p>
                <p
                  className={`stat-value ${
                    totalReturnPct == null
                      ? ""
                      : totalReturnPct >= 0
                        ? "pos"
                        : "neg"
                  }`}
                >
                  {totalReturnPct == null ? (
                    <span className="skeleton" />
                  ) : (
                    formatPct(totalReturnPct)
                  )}
                </p>
                <p className="stat-meta">{positions.length} open positions</p>
              </div>
              <div className="stat">
                <p className="stat-label">Vs S&amp;P 500</p>
                <p
                  className={`stat-value ${
                    vsSpyPct == null ? "" : vsSpyPct >= 0 ? "pos" : "neg"
                  }`}
                >
                  {historyLoading && vsSpyPct == null ? (
                    <span className="skeleton" />
                  ) : vsSpyPct == null ? (
                    "—"
                  ) : (
                    formatPct(vsSpyPct)
                  )}
                </p>
                <p className="stat-meta">
                  {vsSpyPct == null
                    ? "Indexed since inception"
                    : vsSpyPct >= 0
                      ? "Ahead of SPY"
                      : "Behind SPY"}
                </p>
              </div>
            </div>

            <VsSpyChart
              series={comparisonSeries}
              loading={historyLoading}
              error={historyError}
              vsSpyPct={vsSpyPct}
              portfolioReturnPct={portfolioBenchReturnPct}
              spyReturnPct={spyReturnPct}
              inception={portfolio.inception}
            />
          </div>
        </section>

        <section id="picks">
          <div className="shell">
            <div className="section-head">
              <p className="section-kicker">By month</p>
              <h2 className="section-title">Stock picks</h2>
              <p className="section-sub">
                Click a column header to sort. Expand a month to see the table —
                the active month shows live Last prices; closed months show Entry
                and Exit.
              </p>
            </div>

            <MonthPicks positions={positions} loading={false} />
          </div>
        </section>

        <section id="leaders">
          <div className="shell">
            <div className="section-head">
              <p className="section-kicker">Open marks</p>
              <h2 className="section-title">Winners &amp; losers</h2>
              <p className="section-sub">
                How {activeMonthLabel} is doing so far. Closed months appear below
                after each rebalance.
              </p>
            </div>

            <div className="wl-grid">
              <div className="wl-col winners">
                <h3>Winners</h3>
                {winners.length === 0 ? (
                  <p className="wl-empty">No winners yet this month.</p>
                ) : (
                  <ul className="wl-list">
                    {winners.slice(0, 5).map((p) => (
                      <li key={p.symbol}>
                        <span className="sym">{p.symbol}</span>
                        <span className="delta pos">
                          {formatPct(p.returnPct as number)}
                        </span>
                        <span className="delta pos">
                          {formatMoney(p.pnl as number, 0)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="wl-col losers">
                <h3>Losers</h3>
                {losers.length === 0 ? (
                  <p className="wl-empty">No losers yet this month.</p>
                ) : (
                  <ul className="wl-list">
                    {losers.slice(0, 5).map((p) => (
                      <li key={p.symbol}>
                        <span className="sym">{p.symbol}</span>
                        <span className="delta neg">
                          {formatPct(p.returnPct as number)}
                        </span>
                        <span className="delta neg">
                          {formatMoney(p.pnl as number, 0)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {closedWinners.length + closedLosers.length > 0 ? (
              <div className="wl-grid" style={{ marginTop: "2.5rem" }}>
                <div className="wl-col winners">
                  <h3>Closed winners</h3>
                  <ul className="wl-list">
                    {closedWinners.map((t) => (
                      <li key={`${t.monthId}-${t.symbol}`}>
                        <span className="sym">
                          {t.symbol}{" "}
                          <span className="sym-name">{t.monthLabel}</span>
                        </span>
                        <span className="delta pos">{formatPct(t.returnPct)}</span>
                        <span />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="wl-col losers">
                  <h3>Closed losers</h3>
                  <ul className="wl-list">
                    {closedLosers.map((t) => (
                      <li key={`${t.monthId}-${t.symbol}`}>
                        <span className="sym">
                          {t.symbol}{" "}
                          <span className="sym-name">{t.monthLabel}</span>
                        </span>
                        <span className="delta neg">{formatPct(t.returnPct)}</span>
                        <span />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section id="strategy">
          <div className="shell">
            <div className="section-head">
              <p className="section-kicker">How it works</p>
              <h2 className="section-title">Strategy</h2>
              <p className="section-sub">{portfolio.strategy.process}</p>
            </div>

            <dl className="meta-row">
              <div>
                <dt>Picks</dt>
                <dd>About {portfolio.strategy.assets} stocks</dd>
              </div>
              <div>
                <dt>Hold</dt>
                <dd>{portfolio.strategy.holdPeriod}</dd>
              </div>
              <div>
                <dt>Universe</dt>
                <dd>{portfolio.strategy.universe}</dd>
              </div>
            </dl>

            <ol className="rules">
              {portfolio.strategy.rules.map((rule, i) => (
                <li key={rule}>
                  <span className="rule-num">{String(i + 1).padStart(2, "0")}</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>
          {portfolio.brand} {portfolio.credit} · Started {portfolio.inception} ·
          Not investment advice
        </span>
        <span>Tracked in public · Marks from market data when available · Benchmark SPY (price)</span>
      </footer>
    </>
  );
}
