interface Leg {
  id: "power" | "compute" | "robotics" | "security";
  name: string;
  timeframe: string;
  thesis: string;
  role: string;
  crossCutting?: boolean;
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
      { symbol: "NRG", name: "NRG Energy — power generation" },
      { symbol: "CCJ", name: "Cameco — uranium/nuclear fuel" },
      { symbol: "XLU", name: "Utilities Select Sector SPDR (ETF)" },
      { symbol: "ICLN", name: "iShares Global Clean Energy (ETF)" },
      { symbol: "URA", name: "Global X Uranium (ETF)" },
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
      { symbol: "MU", name: "Micron — HBM/DRAM" },
      { symbol: "LRCX", name: "Lam Research — fab equipment" },
      { symbol: "MSFT", name: "Microsoft — hyperscaler/capex" },
      { symbol: "GOOGL", name: "Alphabet — hyperscaler/capex" },
      { symbol: "SMH", name: "VanEck Semiconductor (ETF)" },
      { symbol: "SOXX", name: "iShares Semiconductor (ETF)" },
      { symbol: "XLK", name: "Technology Select Sector SPDR (ETF)" },
    ],
  },
  {
    id: "robotics",
    name: "Robotics & Automation",
    timeframe: "early, inflection ~2027+",
    thesis:
      "The newest, smallest physical layer — riding on the same AI models and compute below it, but years behind on revenue. 2030 market estimates for humanoid robotics alone cluster at roughly $6B–$19B, a rounding error next to >$1T/yr of data-center spend.",
    role: "Mainstream adoption reads as a late-2020s-into-2030s story — worth tracking, not yet sized like the layers below it.",
    tickers: [
      { symbol: "TSLA", name: "Tesla — Optimus humanoid" },
      { symbol: "ISRG", name: "Intuitive Surgical — medical robotics" },
      { symbol: "ROK", name: "Rockwell Automation — industrial automation" },
      { symbol: "HON", name: "Honeywell — automation/robotics" },
      { symbol: "FANUY", name: "Fanuc — pure-play industrial robots" },
      { symbol: "CGNX", name: "Cognex — machine vision" },
      { symbol: "PATH", name: "UiPath — software automation (RPA)" },
      { symbol: "BOTZ", name: "Global X Robotics & AI (ETF)" },
      { symbol: "ROBO", name: "ROBO Global Robotics & Automation (ETF)" },
      { symbol: "ARKQ", name: "ARK Autonomous Tech & Robotics (ETF)" },
    ],
  },
  {
    id: "security",
    name: "Security & Trust Infrastructure",
    timeframe: "cross-cutting, now → ongoing",
    crossCutting: true,
    thesis:
      "Not a physical dependency layer like the three above — a leg that cuts across all of them. More compute, more autonomous systems, and more grid-connected infrastructure each expand the attack surface, and AI itself is now both a security buyer (agentic-identity, data, and cloud protection) and a tool vendors sell with.",
    role: "Scales with the other three legs rather than sitting on top of any one of them — datacenter security, cloud/zero-trust, and AI-agent identity all grow as the rest of the stack grows.",
    tickers: [
      { symbol: "CRWD", name: "CrowdStrike — endpoint/cloud security" },
      { symbol: "PANW", name: "Palo Alto Networks — network security" },
      { symbol: "ZS", name: "Zscaler — zero-trust cloud security" },
      { symbol: "FTNT", name: "Fortinet — network security" },
      { symbol: "S", name: "SentinelOne — AI-driven endpoint security" },
      { symbol: "OKTA", name: "Okta — identity & access management" },
      { symbol: "NET", name: "Cloudflare — network/zero-trust infra" },
      { symbol: "CIBR", name: "First Trust Cybersecurity (ETF)" },
      { symbol: "HACK", name: "ETFMG Prime Cyber Security (ETF)" },
      { symbol: "BUG", name: "Global X Cybersecurity (ETF)" },
    ],
  },
];

const stackLegs = legs.filter((l) => !l.crossCutting).slice().reverse();
const crossCuttingLegs = legs.filter((l) => l.crossCutting);

function Band({ leg }: { leg: Leg }) {
  return (
    <div className="stack-band" data-leg={leg.id}>
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
  );
}

export function ResearchStack() {
  return (
    <>
      {crossCuttingLegs.map((leg) => (
        <div className="stack-cross" key={leg.id}>
          <Band leg={leg} />
        </div>
      ))}
      <div className="stack">
        {stackLegs.map((leg) => (
          <Band leg={leg} key={leg.id} />
        ))}
      </div>
    </>
  );
}
