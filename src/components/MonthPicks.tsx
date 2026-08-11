import { useMemo, useState } from "react";
import {
  closedPickReturnPct,
  sortedMonths,
  type MonthBook,
  type MonthPick,
} from "../data/portfolio";
import { formatMoney, formatPct, formatShares } from "../lib/format";
import type { PositionMark } from "../lib/usePortfolioMarks";

type SortKey =
  | "symbol"
  | "score"
  | "sleeve"
  | "shares"
  | "entry"
  | "mark"
  | "value"
  | "return";

type SortDir = "asc" | "desc";

interface SortState {
  key: SortKey;
  dir: SortDir;
}

function sleeveLabel(sleeve: string): string {
  return sleeve === "politician" ? "Political" : "Core";
}

function compareValues(a: string | number | null, b: string | number | null, dir: SortDir) {
  const mul = dir === "asc" ? 1 : -1;
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "string" && typeof b === "string") {
    return a.localeCompare(b) * mul;
  }
  return ((a as number) - (b as number)) * mul;
}

function sortActiveRows(
  rows: PositionMark[],
  sort: SortState,
): PositionMark[] {
  return [...rows].sort((a, b) => {
    switch (sort.key) {
      case "symbol":
        return compareValues(a.symbol, b.symbol, sort.dir);
      case "score":
        return compareValues(a.score, b.score, sort.dir);
      case "sleeve":
        return compareValues(sleeveLabel(a.sleeve), sleeveLabel(b.sleeve), sort.dir);
      case "shares":
        return compareValues(a.shares, b.shares, sort.dir);
      case "entry":
        return compareValues(a.entryPrice, b.entryPrice, sort.dir);
      case "mark":
        return compareValues(a.price, b.price, sort.dir);
      case "value":
        return compareValues(a.marketValue, b.marketValue, sort.dir);
      case "return":
        return compareValues(a.returnPct, b.returnPct, sort.dir);
      default:
        return 0;
    }
  });
}

interface ClosedRow {
  pick: MonthPick;
  exitPrice: number;
  returnPct: number | null;
  value: number;
}

function sortClosedRows(rows: ClosedRow[], sort: SortState): ClosedRow[] {
  return [...rows].sort((a, b) => {
    switch (sort.key) {
      case "symbol":
        return compareValues(a.pick.symbol, b.pick.symbol, sort.dir);
      case "score":
        return compareValues(a.pick.score, b.pick.score, sort.dir);
      case "sleeve":
        return compareValues(
          sleeveLabel(a.pick.sleeve),
          sleeveLabel(b.pick.sleeve),
          sort.dir,
        );
      case "shares":
        return compareValues(a.pick.shares, b.pick.shares, sort.dir);
      case "entry":
        return compareValues(a.pick.entryPrice, b.pick.entryPrice, sort.dir);
      case "mark":
        return compareValues(a.exitPrice, b.exitPrice, sort.dir);
      case "value":
        return compareValues(a.value, b.value, sort.dir);
      case "return":
        return compareValues(a.returnPct, b.returnPct, sort.dir);
      default:
        return 0;
    }
  });
}

function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sort.key === sortKey;
  return (
    <th className={align === "right" ? "num" : undefined}>
      <button
        type="button"
        className={`sort-btn ${active ? "active" : ""}`}
        onClick={() => onSort(sortKey)}
      >
        <span>{label}</span>
        <span className="sort-ind" aria-hidden="true">
          {active ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
}

function ActiveMonthTable({
  rows,
  loading,
}: {
  rows: PositionMark[];
  loading: boolean;
}) {
  const [sort, setSort] = useState<SortState>({ key: "score", dir: "desc" });

  const onSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "symbol" || key === "sleeve" ? "asc" : "desc" },
    );
  };

  const sorted = useMemo(() => sortActiveRows(rows, sort), [rows, sort]);

  return (
    <div className="table-wrap">
      <table className="book">
        <thead>
          <tr>
            <SortHeader label="Symbol" sortKey="symbol" sort={sort} onSort={onSort} />
            <SortHeader label="Score" sortKey="score" sort={sort} onSort={onSort} />
            <SortHeader label="Type" sortKey="sleeve" sort={sort} onSort={onSort} />
            <SortHeader
              label="Shares"
              sortKey="shares"
              sort={sort}
              onSort={onSort}
              align="right"
            />
            <SortHeader
              label="Entry"
              sortKey="entry"
              sort={sort}
              onSort={onSort}
              align="right"
            />
            <SortHeader
              label="Last"
              sortKey="mark"
              sort={sort}
              onSort={onSort}
              align="right"
            />
            <SortHeader
              label="Value"
              sortKey="value"
              sort={sort}
              onSort={onSort}
              align="right"
            />
            <SortHeader
              label="Return"
              sortKey="return"
              sort={sort}
              onSort={onSort}
              align="right"
            />
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.symbol}>
              <td>
                <span className="sym">{p.symbol}</span>
                <span className="sym-name">{p.name}</span>
              </td>
              <td>
                <div className="score-bar">
                  <div className="score-track">
                    <div className="score-fill" style={{ width: `${p.score}%` }} />
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
                {p.marketValue != null ? formatMoney(p.marketValue, 0) : "—"}
              </td>
              <td className="num">
                {p.returnPct == null ? (
                  "—"
                ) : (
                  <span className={`delta ${p.returnPct >= 0 ? "pos" : "neg"}`}>
                    {formatPct(p.returnPct)}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClosedMonthTable({ month }: { month: MonthBook }) {
  const [sort, setSort] = useState<SortState>({ key: "return", dir: "desc" });

  const onSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "symbol" || key === "sleeve" ? "asc" : "desc" },
    );
  };

  const sorted = useMemo(() => {
    const built: ClosedRow[] = month.picks.map((pick) => {
      const exitPrice = pick.exitPrice ?? pick.entryPrice;
      return {
        pick,
        exitPrice,
        returnPct: closedPickReturnPct(pick),
        value: pick.shares * exitPrice,
      };
    });
    return sortClosedRows(built, sort);
  }, [month.picks, sort]);

  return (
    <div className="table-wrap">
      <table className="book">
        <thead>
          <tr>
            <SortHeader label="Symbol" sortKey="symbol" sort={sort} onSort={onSort} />
            <SortHeader label="Score" sortKey="score" sort={sort} onSort={onSort} />
            <SortHeader label="Type" sortKey="sleeve" sort={sort} onSort={onSort} />
            <SortHeader
              label="Shares"
              sortKey="shares"
              sort={sort}
              onSort={onSort}
              align="right"
            />
            <SortHeader
              label="Entry"
              sortKey="entry"
              sort={sort}
              onSort={onSort}
              align="right"
            />
            <SortHeader
              label="Exit"
              sortKey="mark"
              sort={sort}
              onSort={onSort}
              align="right"
            />
            <SortHeader
              label="Value"
              sortKey="value"
              sort={sort}
              onSort={onSort}
              align="right"
            />
            <SortHeader
              label="Return"
              sortKey="return"
              sort={sort}
              onSort={onSort}
              align="right"
            />
          </tr>
        </thead>
        <tbody>
          {sorted.map(({ pick, exitPrice, returnPct, value }) => (
            <tr key={pick.symbol}>
              <td>
                <span className="sym">{pick.symbol}</span>
                <span className="sym-name">{pick.name}</span>
              </td>
              <td>
                <div className="score-bar">
                  <div className="score-track">
                    <div
                      className="score-fill"
                      style={{ width: `${pick.score}%` }}
                    />
                  </div>
                  <span>{pick.score}</span>
                </div>
              </td>
              <td>
                {pick.sleeve === "politician" ? (
                  <span className="pill pill-politician">Political</span>
                ) : (
                  <span className="pill">Core</span>
                )}
              </td>
              <td className="num">{formatShares(pick.shares)}</td>
              <td className="num">{formatMoney(pick.entryPrice)}</td>
              <td className="num">{formatMoney(exitPrice)}</td>
              <td className="num">{formatMoney(value, 0)}</td>
              <td className="num">
                {returnPct == null ? (
                  "—"
                ) : (
                  <span className={`delta ${returnPct >= 0 ? "pos" : "neg"}`}>
                    {formatPct(returnPct)}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MonthBlock({
  month,
  defaultOpen,
  activeRows,
  loading,
}: {
  month: MonthBook;
  defaultOpen: boolean;
  activeRows?: PositionMark[];
  loading?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      className="month-block"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="month-summary">
        <span className="month-summary-main">
          <span className="month-chevron" aria-hidden="true">
            {open ? "▾" : "▸"}
          </span>
          <span className="month-label">{month.label}</span>
          {month.status === "active" ? (
            <span className="pill pill-active">Active</span>
          ) : (
            <span className="pill">Closed</span>
          )}
        </span>
        <span className="month-summary-meta">
          {month.picks.length} picks
          {month.summary ? ` · ${month.summary}` : ""}
        </span>
      </summary>
      <div className="month-body">
        {month.status === "active" && activeRows ? (
          <ActiveMonthTable rows={activeRows} loading={!!loading} />
        ) : (
          <ClosedMonthTable month={month} />
        )}
      </div>
    </details>
  );
}

interface Props {
  positions: PositionMark[];
  loading: boolean;
}

export function MonthPicks({ positions, loading }: Props) {
  const months = sortedMonths();

  return (
    <div className="month-list">
      {months.map((month) => (
        <MonthBlock
          key={month.id}
          month={month}
          defaultOpen={month.status === "active"}
          activeRows={month.status === "active" ? positions : undefined}
          loading={month.status === "active" ? loading : undefined}
        />
      ))}
    </div>
  );
}
