import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ComparisonPoint } from "../lib/benchmark";
import { formatPct } from "../lib/format";

interface Props {
  series: ComparisonPoint[];
  loading: boolean;
  error: string | null;
  vsSpyPct: number | null;
  portfolioReturnPct: number | null;
  spyReturnPct: number | null;
  inception: string;
}

function formatAxisDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function TooltipBody({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey?: string; value?: number; color?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  const port = payload.find((p) => p.dataKey === "portfolioIndex");
  const spy = payload.find((p) => p.dataKey === "spyIndex");
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-date">{formatAxisDate(label)}</p>
      {port?.value != null ? (
        <p style={{ color: port.color }}>
          Agentic Trader · {formatPct(port.value - 100)}
        </p>
      ) : null}
      {spy?.value != null ? (
        <p style={{ color: spy.color }}>S&amp;P 500 · {formatPct(spy.value - 100)}</p>
      ) : null}
    </div>
  );
}

export function VsSpyChart({
  series,
  loading,
  error,
  vsSpyPct,
  portfolioReturnPct,
  spyReturnPct,
  inception,
}: Props) {
  const inceptionLabel = new Date(`${inception}T00:00:00Z`).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" },
  );

  return (
    <div className="vs-spy">
      <div className="vs-spy-head">
        <div>
          <p className="section-kicker">Since {inceptionLabel}</p>
          <h3 className="vs-spy-title">Vs S&amp;P 500</h3>
        </div>
        {vsSpyPct != null && portfolioReturnPct != null && spyReturnPct != null ? (
          <div className="vs-spy-summary">
            <p>
              Agentic Trader{" "}
              <span className={portfolioReturnPct >= 0 ? "delta pos" : "delta neg"}>
                {formatPct(portfolioReturnPct)}
              </span>
              {" · "}
              S&amp;P 500{" "}
              <span className={spyReturnPct >= 0 ? "delta pos" : "delta neg"}>
                {formatPct(spyReturnPct)}
              </span>
            </p>
            <p className={`vs-spy-delta ${vsSpyPct >= 0 ? "pos" : "neg"}`}>
              {vsSpyPct >= 0 ? "Ahead" : "Behind"} by {formatPct(Math.abs(vsSpyPct))}
            </p>
          </div>
        ) : null}
      </div>

      <div className="vs-spy-chart">
        {loading && series.length === 0 ? (
          <div className="vs-spy-empty">
            <span className="skeleton" style={{ width: "100%", height: "12rem" }} />
          </div>
        ) : series.length === 0 ? (
          <div className="vs-spy-empty">
            <p>{error ?? "No comparison data yet."}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(20, 33, 43, 0.1)" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatAxisDate}
                tick={{ fill: "#6b7c8a", fontSize: 11 }}
                axisLine={{ stroke: "rgba(20, 33, 43, 0.12)" }}
                tickLine={false}
                minTickGap={28}
              />
              <YAxis
                domain={["auto", "auto"]}
                tickFormatter={(v: number) => `${(v - 100).toFixed(0)}%`}
                tick={{ fill: "#6b7c8a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip content={<TooltipBody />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="plainline"
                wrapperStyle={{ fontSize: 12, color: "#3a4a57", paddingBottom: 8 }}
              />
              <Line
                type="monotone"
                dataKey="portfolioIndex"
                name="Agentic Trader"
                stroke="#0a6e6a"
                strokeWidth={2.25}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="spyIndex"
                name="S&P 500 (SPY)"
                stroke="#6b7c8a"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                activeDot={{ r: 3 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {error && series.length > 0 ? (
        <p className="vs-spy-note refresh-error">{error}</p>
      ) : (
        <p className="vs-spy-note">
          Indexed to 100 at start. Benchmark is SPY price return (not
          dividend-adjusted). Both lines cover the same days since inception.
        </p>
      )}
    </div>
  );
}
