import { motion } from "framer-motion";
import { portfolio } from "./data/portfolio";
import { formatMoney, formatPct, formatShares } from "./lib/format";
import type { PortfolioMarks } from "./lib/usePortfolioMarks";
import { HeroChart } from "./components/HeroChart";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

interface Props {
  marks: PortfolioMarks;
}

export function App({ marks }: Props) {
  const {
    loading,
    refreshing,
    positions,
    totalValue,
    totalPnl,
    totalReturnPct,
    winners,
    losers,
    invested,
    liveCount,
    source,
    refreshedAt,
    refreshError,
    refresh,
  } = marks;

  const closed = portfolio.closedTrades;
  const closedWinners = closed
    .filter((t) => t.returnPct > 0)
    .sort((a, b) => b.returnPct - a.returnPct);
  const closedLosers = closed
    .filter((t) => t.returnPct < 0)
    .sort((a, b) => a.returnPct - b.returnPct);

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
                  <span className={`live-dot ${source === "saved" ? "dim" : ""}`} />
                  {source === "live" || source === "mixed"
                    ? "Live marks"
                    : "Saved marks"}
                </p>
                <h2 className="section-title">Performance</h2>
                <p className="section-sub">
                  Account value vs. the ${portfolio.startingCapital.toLocaleString()}{" "}
                  started on {portfolio.inception}.
                </p>
              </div>
              <div className="refresh-panel">
                <button
                  type="button"
                  className="btn btn-ghost refresh-btn"
                  onClick={() => void refresh()}
                  disabled={loading || refreshing}
                >
                  {refreshing ? "Refreshing…" : "Refresh prices"}
                </button>
                <p className="refresh-meta">
                  {refreshedAt
                    ? `Updated ${refreshedAt.toLocaleTimeString()}`
                    : "—"}
                  {liveCount > 0
                    ? ` · ${liveCount}/${portfolio.holdings.length} live`
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
                  {loading || totalValue == null ? (
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
                  {loading || totalPnl == null ? (
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
                  {loading || totalReturnPct == null ? (
                    <span className="skeleton" />
                  ) : (
                    formatPct(totalReturnPct)
                  )}
                </p>
                <p className="stat-meta">{portfolio.holdings.length} open positions</p>
              </div>
            </div>
          </div>
        </section>

        <section id="picks">
          <div className="shell">
            <div className="section-head">
              <p className="section-kicker">August 2026</p>
              <h2 className="section-title">Stock picks</h2>
              <p className="section-sub">
                This month’s choices, scored by the research pass. Use{" "}
                <strong>Refresh prices</strong> above to pull the latest market
                marks and return %.
              </p>
            </div>

            <div className="table-wrap">
              <table className="book">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Score</th>
                    <th>Type</th>
                    <th className="num">Shares</th>
                    <th className="num">Entry</th>
                    <th className="num">Last</th>
                    <th className="num">Value</th>
                    <th className="num">Return</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p) => (
                    <tr key={p.symbol}>
                      <td>
                        <span className="sym">{p.symbol}</span>
                        <span className="sym-name">{p.name}</span>
                      </td>
                      <td>
                        <div className="score-bar">
                          <div className="score-track">
                            <div
                              className="score-fill"
                              style={{ width: `${p.score}%` }}
                            />
                          </div>
                          <span>{p.score}</span>
                        </div>
                      </td>
                      <td>
                        {p.sleeve === "politician" ? (
                          <span className="pill pill-politician">Political</span>
                        ) : (
                          <span className="pill">Core</span>
                        )}
                      </td>
                      <td className="num">{formatShares(p.shares)}</td>
                      <td className="num">{formatMoney(p.entryPrice)}</td>
                      <td className="num">
                        {loading ? (
                          <span className="skeleton" />
                        ) : p.price != null ? (
                          formatMoney(p.price)
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="num">
                        {p.marketValue != null
                          ? formatMoney(p.marketValue, 0)
                          : "—"}
                      </td>
                      <td className="num">
                        {p.returnPct == null ? (
                          "—"
                        ) : (
                          <span
                            className={`delta ${p.returnPct >= 0 ? "pos" : "neg"}`}
                          >
                            {formatPct(p.returnPct)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="leaders">
          <div className="shell">
            <div className="section-head">
              <p className="section-kicker">Open marks</p>
              <h2 className="section-title">Winners &amp; losers</h2>
              <p className="section-sub">
                How this month’s picks are doing so far. Closed winners and losers
                show up after each month-end refresh.
              </p>
            </div>

            <div className="wl-grid">
              <div className="wl-col winners">
                <h3>Winners</h3>
                {winners.length === 0 ? (
                  <p className="wl-empty">
                    {loading ? "Pulling marks…" : "No winners yet this month."}
                  </p>
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
                  <p className="wl-empty">
                    {loading ? "Pulling marks…" : "No losers yet this month."}
                  </p>
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

            {closed.length > 0 ? (
              <div className="wl-grid" style={{ marginTop: "2.5rem" }}>
                <div className="wl-col winners">
                  <h3>Closed winners</h3>
                  <ul className="wl-list">
                    {closedWinners.map((t) => (
                      <li key={`${t.month}-${t.symbol}`}>
                        <span className="sym">
                          {t.symbol}{" "}
                          <span className="sym-name">{t.month}</span>
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
                      <li key={`${t.month}-${t.symbol}`}>
                        <span className="sym">
                          {t.symbol}{" "}
                          <span className="sym-name">{t.month}</span>
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
        <span>Tracked in public · Marks from market data when available</span>
      </footer>
    </>
  );
}
