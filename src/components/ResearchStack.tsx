interface Leg {
  id: "power" | "compute" | "robotics";
  name: string;
  timeframe: string;
  thesis: string;
  role: string;
  tickers: { symbol: string; name: string }[];
}

const legs: Leg[] = [
  {
    id: "power",
    name: "Power & Grid",
    timeframe: "bottleneck now → 2030+",
    thesis:
      "The foundation layer. Every forecast for AI/data-center capex (estimates cluster around $1.6T–$3T by 2030) converges on the same constraint: not capital, but electricity. This layer gets re-rated hard on any hyperscaler capex-guidance news, even when its own fundamentals haven't changed.",
    role: "The hard physical ceiling on how fast the compute layer above can actually build.",
    tickers: [
      { symbol: "CEG", name: "Constellation — nuclear" },
      { symbol: "VST", name: "Vistra — power generation" },
      { symbol: "NEE", name: "NextEra — utility/renewables" },
      { symbol: "GEV", name: "GE Vernova — grid equipment" },
      { symbol: "ETN", name: "Eaton — electrical infrastructure" },
    ],
  },
  {
    id: "compute",
    name: "Compute & Data Centers",
    timeframe: "dominant theme, now → 2027",
    thesis:
      "The largest and most liquid leg — chips, memory, and the hyperscalers spending on them. Demand signals (rising DRAM/HBM pricing, equipment order books) keep climbing even as stock-level sentiment on whether the spend is paying off whips sharply in both directions.",
    role: "Where the AI capex dollars are actually spent, and where sentiment is currently most volatile.",
    tickers: [
      { symbol: "NVDA", name: "Nvidia — AI accelerators" },
      { symbol: "AVGO", name: "Broadcom — custom silicon/networking" },
      { symbol: "TSM", name: "TSMC — foundry" },
      { symbol: "AMD", name: "AMD — accelerators/CPUs" },
      { symbol: "MU", name: "Micron — HBM/DRAM" },
      { symbol: "LRCX", name: "Lam Research — fab equipment" },
      { symbol: "ASML", name: "ASML — lithography" },
      { symbol: "MSFT", name: "Microsoft — hyperscaler/capex" },
      { symbol: "GOOGL", name: "Alphabet — hyperscaler/capex" },
      { symbol: "AMZN", name: "Amazon — AWS/capex" },
      { symbol: "META", name: "Meta — capex/model training" },
      { symbol: "ORCL", name: "Oracle — cloud/AI infra" },
    ],
  },
  {
    id: "robotics",
    name: "Robotics & Automation",
    timeframe: "early, inflection ~2027+",
    thesis:
      "The newest, smallest layer — riding on the same AI models and compute below it, but years behind on revenue. 2030 market estimates for humanoid robotics alone cluster at roughly $6B–$19B, a rounding error next to >$1T/yr of data-center spend.",
    role: "Mainstream adoption reads as a late-2020s-into-2030s story — worth tracking, not yet sized like the layers below it.",
    tickers: [
      { symbol: "TSLA", name: "Tesla — Optimus humanoid" },
      { symbol: "ISRG", name: "Intuitive Surgical — medical robotics" },
      { symbol: "ROK", name: "Rockwell Automation — industrial automation" },
      { symbol: "ABB", name: "ABB — industrial/collaborative robots" },
      { symbol: "HON", name: "Honeywell — automation/robotics" },
      { symbol: "SYM", name: "Symbotic — warehouse robotics" },
    ],
  },
];

export function ResearchStack() {
  return (
    <div className="stack">
      {legs
        .slice()
        .reverse()
        .map((leg) => (
          <div className="stack-band" data-leg={leg.id} key={leg.id}>
            <div className="stack-band-head">
              <span className="stack-leg-name">{leg.name}</span>
              <span className="pill stack-timeframe">{leg.timeframe}</span>
            </div>
            <p className="stack-thesis">{leg.thesis}</p>
            <div className="stack-tickers">
              {leg.tickers.map((t) => (
                <span className="stack-chip" key={t.symbol}>
                  <span className="stack-chip-sym">{t.symbol}</span>
                  <span className="stack-chip-name">{t.name}</span>
                </span>
              ))}
            </div>
            <p className="stack-role">{leg.role}</p>
          </div>
        ))}
    </div>
  );
}
