interface Leg {
  id: "power" | "compute" | "robotics" | "security" | "biotech";
  name: string;
  timeframe: string;
  thesis: string;
  role: string;
  /** Cuts across all three physical-buildout layers (power/compute/robotics). */
  crossCutting?: boolean;
  /** A separate AI-acceleration thesis, not part of the physical buildout
   * dependency chain and not "scaling with" it the way crossCutting legs do —
   * rendered as its own group below the stack instead of inside it. */
  standalone?: boolean;
  tickers: { symbol: string; name: string }[];
}

const legs: Leg[] = [
  {
    id: "power",
    name: "Power & Grid",
    timeframe: "acute bottleneck now → ~2028",
    thesis:
      "The foundation layer. The power crunch isn't a future event — grid interconnection queues are already multi-year in many regions, and that's the live constraint on how fast data centers can actually get built, not a 2030 milestone. (The $1.6T–$3T-by-2030 figures floating around are cumulative capex totals, not when the bottleneck itself bites.) This layer gets re-rated hard on any hyperscaler capex-guidance news, even when its own fundamentals haven't changed.",
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
    timeframe: "earliest signals ~2027, mainstream likely 2030s",
    thesis:
      "The newest, smallest physical layer — riding on the same AI models and compute below it, but years behind on revenue. 2027 is when early commercial/regulatory signals are expected to clear (per ABI Research), not when this goes mainstream: 2030 market estimates for humanoid robotics alone still cluster at only $6B–$19B, a rounding error next to >$1T/yr of data-center spend — meaning even by 2030 this is still early, not investable at scale.",
    role: "A real but later wave riding on the other legs' compute — worth tracking now, but the mainstream-adoption horizon likely sits in the 2030s, not 2027.",
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
  {
    id: "biotech",
    name: "Biotech & Healthcare",
    timeframe: "early signal now, Phase I only → broad clinical impact likely 2030s",
    standalone: true,
    thesis:
      "A separate AI-acceleration thesis, not a layer of the physical build-out above — this one runs on model capability, not power/compute/robotics infrastructure. The signal is real but narrow so far: a widely-cited 2024 Drug Discovery Today analysis found AI-discovered molecules hit an 80-90% Phase I success rate versus a 40-65% historical baseline, but Phase II success for the same molecules was ~40%, in line with historical norms — the advantage hasn't yet been shown to persist past the earliest trial stage. Cost-reduction claims vary widely by source (15-60% depending on what's measured) and aren't independently verified; take vendor figures like Insilico's reported ~$6M discovery cost for one candidate as a single-company claim, not a sector norm. The baseline this is chipping away at: Tufts estimates ~$2.6B in fully-loaded cost per approved drug, with an 11.83% clinical success rate overall — so even a narrow, early-stage edge compounds meaningfully if it holds.",
    role:
      "Independent of the power/compute/robotics stack above — worth tracking on its own, with the same caution: a documented Phase I edge is not yet a documented Phase II/III edge, and most cost-savings figures circulating in 2026 are unverified.",
    tickers: [
      { symbol: "RXRX", name: "Recursion Pharmaceuticals — AI-native drug discovery" },
      { symbol: "TEM", name: "Tempus AI — AI diagnostics/trial-matching data" },
      { symbol: "SDGR", name: "Schrödinger — physics/AI molecular design" },
      { symbol: "ABSI", name: "Absci — generative AI protein/antibody design" },
      { symbol: "DNA", name: "Twist Bioscience — synthetic DNA synthesis" },
      { symbol: "ILMN", name: "Illumina — genomic sequencing (the data layer)" },
      { symbol: "IQV", name: "IQVIA — CRO using AI for trial design/recruitment" },
      { symbol: "CRL", name: "Charles River Labs — AI-assisted preclinical testing" },
      { symbol: "XBI", name: "SPDR S&P Biotech (ETF)" },
      { symbol: "ARKG", name: "ARK Genomic Revolution (ETF)" },
    ],
  },
];

const stackLegs = legs
  .filter((l) => !l.crossCutting && !l.standalone)
  .slice()
  .reverse();
const crossCuttingLegs = legs.filter((l) => l.crossCutting);
const standaloneLegs = legs.filter((l) => l.standalone);

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
      {standaloneLegs.map((leg) => (
        <div className="stack-standalone" key={leg.id}>
          <Band leg={leg} />
        </div>
      ))}
    </>
  );
}
