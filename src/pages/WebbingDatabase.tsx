import { useState, useMemo } from "react";
import rawWebbingData from "../data/webbing_database.json" assert { type: "json" };

// ─── Types ────────────────────────────────────────────────────────────────────

interface StretchPoint { kn: number; percent: number; }

interface Webbing {
  id: string;
  name: string;
  brand: string | null;
  webbingType: string | null;
  material: string[];
  widthMm: number | null;
  weightGm: number | null;
  mbsKn: number | null;
  wllKn: number | null;
  depthMm: number | null;
  url: string | null;
  stretchCurve: StretchPoint[] | null;
  stretchSource: string | null;
  sources: string[];
}

// ─── Lookup tables ────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  FL: "Flat", TB: "Tubular", CS: "Crossing", TR: "Trickline",
};

const MATERIAL_LABELS: Record<string, string> = {
  PL: "Polyester", NY: "Nylon", DY: "Dyneema", VC: "Vectran",
  PLP: "Polypropylene", unknown: "Unknown", hybrid: "Hybrid",
};

const SOURCE_LABEL: Record<string, string> = {
  "balance-community": "BC",
  "isa": "ISA",
  "slackdb-single": "SlackDB",
};

// ─── Colors ───────────────────────────────────────────────────────────────────

const PALETTE = [
  "#c8531a", "#2d6a4f", "#1a6bc8", "#8e44ad", "#e67e22", "#16a085",
  "#c94f6d", "#d4a843", "#5b8db8", "#3a7d44", "#e74c3c", "#2980b9",
  "#8b6914", "#27ae60", "#6c5ce7", "#fd79a8", "#00b894", "#e17055",
  "#0d0f0e", "#7a7268", "#d35400", "#1abc9c", "#f39c12", "#c0392b",
  "#2c3e50", "#16a085", "#8e44ad", "#d35400", "#6c5ce7", "#27ae60",
];

// ─── Shared styles ────────────────────────────────────────────────────────────

const chip = (active: boolean): React.CSSProperties => ({
  fontFamily: "'DM Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.06em",
  padding: "5px 12px",
  borderRadius: 4,
  border: "1px solid",
  borderColor: active ? "#0d0f0e" : "rgba(13,15,14,0.2)",
  background: active ? "#0d0f0e" : "transparent",
  color: active ? "#f4f1eb" : "#0d0f0e",
  cursor: "pointer",
  transition: "all 0.15s",
  whiteSpace: "nowrap" as const,
});

const monoLabel: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 10,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#7a7268",
  marginBottom: 6,
};

// ─── Stretch Chart ────────────────────────────────────────────────────────────

function StretchChart({ webbings, active, hovered, onHover, colorMap }: {
  webbings: Webbing[];
  active: string[];
  hovered: string | null;
  onHover: (n: string | null) => void;
  colorMap: Record<string, string>;
}) {
  const VW = 700, VH = 300;
  const PL = 46, PR = 12, PT = 16, PB = 36;
  const CW = VW - PL - PR, CH = VH - PT - PB;

  // Determine axis range from visible data
  const visibleWebbings = webbings.filter(w =>
    active.includes(w.id) && w.stretchCurve && w.stretchCurve.length > 1
  );

  const allKn = visibleWebbings.flatMap(w => w.stretchCurve!.map(p => p.kn));
  const allPct = visibleWebbings.flatMap(w => w.stretchCurve!.map(p => p.percent));
  const MAX_X = allKn.length ? Math.max(12, Math.ceil(Math.max(...allKn))) : 12;
  const MAX_Y = allPct.length ? Math.max(25, Math.ceil(Math.max(...allPct) / 5) * 5) : 25;

  const xS = (kn: number) => PL + (kn / MAX_X) * CW;
  const yS = (p: number) => PT + CH - (p / MAX_Y) * CH;

  const yTicks = Array.from({ length: Math.floor(MAX_Y / 5) + 1 }, (_, i) => i * 5);
  const xTicks = Array.from({ length: Math.floor(MAX_X / 2) + 1 }, (_, i) => i * 2);

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: "100%", borderRadius: 8, background: "#fff", border: "1px solid rgba(13,15,14,0.08)" }}>
      {/* Grid */}
      {yTicks.map(y => (
        <g key={y}>
          <line x1={PL} x2={VW - PR} y1={yS(y)} y2={yS(y)} stroke="rgba(13,15,14,0.07)" strokeWidth={1} />
          <text x={PL - 5} y={yS(y) + 4} fontSize={9} fill="#7a7268" textAnchor="end" fontFamily="'DM Mono',monospace">{y}%</text>
        </g>
      ))}
      {xTicks.map(x => (
        <g key={x}>
          <line x1={xS(x)} x2={xS(x)} y1={PT} y2={VH - PB} stroke="rgba(13,15,14,0.07)" strokeWidth={1} />
          <text x={xS(x)} y={VH - PB + 13} fontSize={9} fill="#7a7268" textAnchor="middle" fontFamily="'DM Mono',monospace">{x} kN</text>
        </g>
      ))}
      <text x={VW / 2} y={VH - 2} fontSize={9} fill="#7a7268" textAnchor="middle" fontFamily="'DM Mono',monospace" letterSpacing="0.08em">TENSION</text>
      <text x={11} y={VH / 2} fontSize={9} fill="#7a7268" textAnchor="middle" fontFamily="'DM Mono',monospace" letterSpacing="0.08em" transform={`rotate(-90,11,${VH / 2})`}>STRETCH %</text>

      {/* Lines */}
      {visibleWebbings.map(w => {
        const isHov = hovered === w.id;
        const dim = hovered !== null && !isHov;
        const pts = w.stretchCurve!;
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${xS(p.kn).toFixed(1)} ${yS(p.percent).toFixed(1)}`).join(" ");
        return (
          <path key={w.id} d={d} fill="none"
            stroke={colorMap[w.id]} strokeWidth={isHov ? 2.5 : 1.5}
            strokeOpacity={dim ? 0.1 : 1}
            style={{ cursor: "pointer", transition: "stroke-opacity 0.12s, stroke-width 0.12s" }}
            onMouseEnter={() => onHover(w.id)}
            onMouseLeave={() => onHover(null)}
          />
        );
      })}

      {/* End-of-line label on hover */}
      {hovered && (() => {
        const w = visibleWebbings.find(w => w.id === hovered);
        if (!w?.stretchCurve) return null;
        const last = w.stretchCurve[w.stretchCurve.length - 1];
        return (
          <text x={xS(last.kn) + 4} y={yS(last.percent) + 4} fontSize={9} fontWeight={600}
            fill={colorMap[w.id]} fontFamily="'DM Mono',monospace" dominantBaseline="middle">
            {w.name} {last.percent}%
          </text>
        );
      })()}

      {visibleWebbings.length === 0 && (
        <text x={VW / 2} y={VH / 2} fontSize={12} fill="#7a7268" textAnchor="middle" fontFamily="'DM Mono',monospace">
          Select webbings below to plot stretch curves
        </text>
      )}
    </svg>
  );
}

// ─── MBS Bar Chart ────────────────────────────────────────────────────────────

function MBSChart({ webbings }: { webbings: Webbing[] }) {
  const data = [...webbings].filter(w => w.mbsKn).sort((a, b) => (b.mbsKn || 0) - (a.mbsKn || 0)).slice(0, 30);
  const max = Math.max(...data.map(w => w.mbsKn || 0));
  const BH = 20, G = 5, LW = 155, PR = 55, SVG_W = 700;
  const VH = data.length * (BH + G) + 36;
  const matColor = (w: Webbing) =>
    w.material.includes("DY") ? "#2d6a4f" : w.material.includes("NY") ? "#2980b9" : "#c8531a";

  return (
    <svg viewBox={`0 0 ${SVG_W} ${VH}`} style={{ width: "100%", borderRadius: 8, background: "#fff", border: "1px solid rgba(13,15,14,0.08)" }}>
      <text x={LW + 2} y={14} fontSize={9} fill="#7a7268" fontFamily="'DM Mono',monospace" letterSpacing="0.08em">MBS (kN)</text>
      {data.map((w, i) => {
        const y = 20 + i * (BH + G);
        const bw = ((w.mbsKn || 0) / max) * (SVG_W - LW - PR);
        return (
          <g key={w.id}>
            <text x={LW - 6} y={y + BH / 2 + 4} fontSize={10} fill="#0d0f0e" textAnchor="end" fontFamily="'DM Sans',sans-serif">{w.name}</text>
            <rect x={LW} y={y} width={bw} height={BH} rx={3} fill={matColor(w)} fillOpacity={0.65} />
            <text x={LW + bw + 5} y={y + BH / 2 + 4} fontSize={9} fill="#7a7268" fontFamily="'DM Mono',monospace">{w.mbsKn} kN</text>
          </g>
        );
      })}
      {([["DY", "Dyneema", "#2d6a4f"], ["NY", "Nylon", "#2980b9"], ["PL", "Polyester", "#c8531a"]] as const).map(([, lab, col], i) => (
        <g key={lab} transform={`translate(${LW + i * 130},${VH - 10})`}>
          <rect width={9} height={9} rx={2} fill={col} fillOpacity={0.65} />
          <text x={13} y={8} fontSize={9} fill="#7a7268" fontFamily="'DM Mono',monospace">{lab}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Weight Chart ─────────────────────────────────────────────────────────────

function WeightChart({ webbings }: { webbings: Webbing[] }) {
  const data = [...webbings].filter(w => w.weightGm).sort((a, b) => (a.weightGm || 999) - (b.weightGm || 999)).slice(0, 30);
  const max = Math.max(...data.map(w => w.weightGm || 0));
  const BH = 20, G = 5, LW = 155, PR = 65, SVG_W = 700;
  const VH = data.length * (BH + G) + 24;

  return (
    <svg viewBox={`0 0 ${SVG_W} ${VH}`} style={{ width: "100%", borderRadius: 8, background: "#fff", border: "1px solid rgba(13,15,14,0.08)" }}>
      <text x={LW + 2} y={14} fontSize={9} fill="#7a7268" fontFamily="'DM Mono',monospace" letterSpacing="0.08em">WEIGHT (g/m) — lightest first</text>
      {data.map((w, i) => {
        const y = 20 + i * (BH + G);
        const bw = ((w.weightGm || 0) / max) * (SVG_W - LW - PR);
        return (
          <g key={w.id}>
            <text x={LW - 6} y={y + BH / 2 + 4} fontSize={10} fill="#0d0f0e" textAnchor="end" fontFamily="'DM Sans',sans-serif">{w.name}</text>
            <rect x={LW} y={y} width={bw} height={BH} rx={3} fill="#7a7268" fillOpacity={0.4} />
            <text x={LW + bw + 5} y={y + BH / 2 + 4} fontSize={9} fill="#7a7268" fontFamily="'DM Mono',monospace">{w.weightGm} g/m</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Webbing Card ─────────────────────────────────────────────────────────────

function WebbingCard({ w, inStretch, color, onToggleStretch }: {
  w: Webbing;
  inStretch: boolean;
  color: string;
  onToggleStretch: (id: string) => void;
}) {
  const hasStretch = w.stretchCurve && w.stretchCurve.length > 1;
  const matLabel = w.material.map(m => MATERIAL_LABELS[m] || m).join(" + ");
  const sourceTag = w.stretchSource ? SOURCE_LABEL[w.stretchSource] : null;

  return (
    <div style={{
      background: "#fff",
      border: "1px solid rgba(13,15,14,0.1)",
      borderRadius: 8,
      padding: "16px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(13,15,14,0.07)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Name + brand */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: "#0d0f0e", lineHeight: 1.25 }}>{w.name}</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#7a7268", letterSpacing: "0.06em", marginTop: 2 }}>
            {(w.brand || "Unknown brand").toUpperCase()}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
          {w.webbingType && (
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, padding: "2px 7px", borderRadius: 3, background: "#f4f1eb", color: "#7a7268" }}>
              {TYPE_LABELS[w.webbingType] || w.webbingType}
            </span>
          )}
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, padding: "2px 7px", borderRadius: 3, background: "#f4f1eb", color: "#7a7268" }}>
            {matLabel}
          </span>
        </div>
      </div>

      {/* Stat grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
        {[
          ["MBS", w.mbsKn != null ? `${w.mbsKn}` : "—", "kN"],
          ["Width", w.widthMm != null ? `${w.widthMm}` : "—", "mm"],
          ["Weight", w.weightGm != null ? `${w.weightGm}` : "—", "g/m"],
          ["Stretch pts", w.stretchCurve ? `${w.stretchCurve.length}` : "—", ""],
        ].map(([label, val, unit]) => (
          <div key={label} style={{ textAlign: "center", background: "#f4f1eb", borderRadius: 5, padding: "7px 4px" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#7a7268", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 14, fontWeight: 700, fontStyle: "italic", color: "#0d0f0e", lineHeight: 1 }}>
              {val}
              {val !== "—" && unit && <span style={{ fontSize: 9, color: "#7a7268", fontFamily: "'DM Mono', monospace", fontStyle: "normal" }}> {unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <div style={{ display: "flex", gap: 8, fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#7a7268" }}>
          {w.wllKn != null && <span style={{ color: "#2d6a4f" }}>WLL {w.wllKn} kN</span>}
          {w.depthMm != null && <span>↕{w.depthMm}mm</span>}
          {sourceTag && (
            <span style={{ background: "#f4f1eb", padding: "1px 5px", borderRadius: 2 }}>{sourceTag}</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {hasStretch && (
            <button onClick={() => onToggleStretch(w.id)} style={{
              fontFamily: "'DM Mono', monospace", fontSize: 9, padding: "3px 8px",
              borderRadius: 3,
              border: `1.5px solid ${inStretch ? color : "rgba(13,15,14,0.2)"}`,
              background: inStretch ? color : "transparent",
              color: inStretch ? "#fff" : "#7a7268",
              cursor: "pointer",
            }}>
              {inStretch ? "● on chart" : "○ add to chart"}
            </button>
          )}
          {w.url && (
            <a href={w.url} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#7a7268", textDecoration: "none" }}>
              ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ChartTab = "stretch" | "mbs" | "weight";
type SortKey = "mbs" | "weight" | "stretch" | "name";
type Status = "all" | "bc" | "isa" | "slackdb";

export default function WebbingDatabase() {
  const allData = rawWebbingData as unknown as Webbing[];

  // Assign stable colors by id
  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    allData.forEach((w, i) => { map[w.id] = PALETTE[i % PALETTE.length]; });
    return map;
  }, [allData]);

  const [search, setSearch] = useState("");
  const [matFilter, setMatFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState<Status>("all");
  const [sortBy, setSortBy] = useState<SortKey>("mbs");
  const [chartTab, setChartTab] = useState<ChartTab>("stretch");
  const [activeStretch, setActiveStretch] = useState<string[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return allData
      .filter(w => {
        if (sourceFilter === "bc") return w.sources.includes("balance-community");
        if (sourceFilter === "isa") return w.sources.includes("isa") && !w.sources.includes("slackdb");
        if (sourceFilter === "slackdb") return w.sources.includes("slackdb");
        return true;
      })
      .filter(w => matFilter === "ALL" || w.material.includes(matFilter))
      .filter(w => {
        if (!search) return true;
        const q = search.toLowerCase();
        return w.name.toLowerCase().includes(q) || (w.brand || "").toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "mbs") return (b.mbsKn ?? 0) - (a.mbsKn ?? 0);
        if (sortBy === "weight") return (a.weightGm ?? 9999) - (b.weightGm ?? 9999);
        if (sortBy === "stretch") return (b.stretchCurve?.length ?? 0) - (a.stretchCurve?.length ?? 0);
        return 0;
      });
  }, [allData, search, matFilter, sourceFilter, sortBy]);

  const toggleStretch = (id: string) =>
    setActiveStretch(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]);

  // Webbings currently shown in stretch chart
  const stretchWebbings = useMemo(() =>
    allData.filter(w => activeStretch.includes(w.id) && w.stretchCurve && w.stretchCurve.length > 1),
    [allData, activeStretch]
  );

  const stats = useMemo(() => ({
    total: allData.length,
    withStretch: allData.filter(w => w.stretchCurve && w.stretchCurve.length > 1).length,
    withMbs: allData.filter(w => w.mbsKn).length,
    brands: new Set(allData.map(w => w.brand).filter(Boolean)).size,
  }), [allData]);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f4f1eb", minHeight: "100vh", color: "#0d0f0e" }}>

      {/* ── Header ── */}
      <div style={{ borderBottom: "1px solid rgba(13,15,14,0.1)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ paddingTop: 32, paddingBottom: 20 }}>
            <a href="/" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#7a7268", textDecoration: "none", letterSpacing: "0.06em", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              ← Back to Slackline Hub
            </a>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c8531a", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-block", width: 20, height: 1, background: "#c8531a" }} /> Gear Database
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
              <div>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 300, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
                  Webbing Database
                </h1>
                <p style={{ fontSize: 14, color: "#7a7268", margin: 0, fontWeight: 300 }}>
                  {allData.length} webbings · SlackDB + ISA SlackData + Balance Community
                </p>
              </div>
              <div style={{ display: "flex", gap: 24 }}>
                {[
                  [stats.total, "webbings"],
                  [stats.withStretch, "stretch curves"],
                  [stats.withMbs, "with MBS"],
                  [stats.brands, "brands"],
                ].map(([n, label]) => (
                  <div key={String(label)} style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600, fontStyle: "italic", color: "#c8531a", lineHeight: 1 }}>{n}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#7a7268", letterSpacing: "0.06em" }}>{String(label).toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem 4rem" }}>

        {/* ── Chart section ── */}
        <div style={{ paddingTop: 32 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <span style={monoLabel}>Chart</span>
            {(["stretch", "mbs", "weight"] as ChartTab[]).map(c => (
              <button key={c} onClick={() => setChartTab(c)} style={chip(chartTab === c)}>
                {c === "stretch" ? "Stretch curves" : c === "mbs" ? "MBS comparison" : "Weight/m"}
              </button>
            ))}
          </div>

          {chartTab === "stretch" && (
            <div>
              {stretchWebbings.length > 0 && (
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                  {stretchWebbings.map(w => (
                    <button key={w.id}
                      onMouseEnter={() => setHovered(w.id)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => toggleStretch(w.id)}
                      style={{
                        fontFamily: "'DM Mono', monospace", fontSize: 9, padding: "3px 8px",
                        borderRadius: 3, border: `1.5px solid ${colorMap[w.id]}`,
                        background: colorMap[w.id], color: "#fff",
                        cursor: "pointer", whiteSpace: "nowrap",
                        opacity: hovered && hovered !== w.id ? 0.3 : 1,
                        transition: "opacity 0.12s",
                      }}
                    >{w.name} ×</button>
                  ))}
                  <button onClick={() => setActiveStretch([])}
                    style={{ ...chip(false), fontSize: 9, padding: "3px 8px" }}>Clear all</button>
                </div>
              )}
              <StretchChart
                webbings={allData}
                active={activeStretch}
                hovered={hovered}
                onHover={setHovered}
                colorMap={colorMap}
              />
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#7a7268", marginTop: 8, letterSpacing: "0.04em" }}>
                Sources: Balance Community (balancecommunity.com/collections/stretch) · ISA SlackData · Add webbings via "○ add to chart" on each card below
              </p>
            </div>
          )}

          {chartTab === "mbs" && (
            <div>
              <MBSChart webbings={filtered} />
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#7a7268", marginTop: 8, letterSpacing: "0.04em" }}>
                Source: SlackDB · ISA SlackData · Green = Dyneema · Blue = Nylon · Orange = Polyester · Top 30 shown
              </p>
            </div>
          )}

          {chartTab === "weight" && (
            <div>
              <WeightChart webbings={filtered} />
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#7a7268", marginTop: 8, letterSpacing: "0.04em" }}>
                Source: SlackDB · ISA SlackData · Lightest first · Top 30 shown
              </p>
            </div>
          )}
        </div>

        {/* ── Filters ── */}
        <div style={{
          marginTop: 44, padding: "18px 20px", background: "#edeae2", borderRadius: 8,
          display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end",
        }}>
          {/* Search */}
          <div style={{ flex: "1 1 180px" }}>
            <div style={monoLabel}>Search</div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name or brand…"
              style={{ width: "100%", fontFamily: "'DM Sans', sans-serif", fontSize: 13, border: "1px solid rgba(13,15,14,0.15)", borderRadius: 5, padding: "7px 12px", background: "#fff", color: "#0d0f0e", boxSizing: "border-box" }}
            />
          </div>

          {/* Source */}
          <div>
            <div style={monoLabel}>Source</div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["all", "slackdb", "isa", "bc"] as Status[]).map(s => (
                <button key={s} onClick={() => setSourceFilter(s)} style={chip(sourceFilter === s)}>
                  {s === "all" ? "All" : s === "bc" ? "Balance Community" : s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Material */}
          <div>
            <div style={monoLabel}>Material</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {["ALL", "PL", "NY", "DY", "VC"].map(m => (
                <button key={m} onClick={() => setMatFilter(m)} style={chip(matFilter === m)}>
                  {m === "ALL" ? "All" : MATERIAL_LABELS[m] || m}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <div style={monoLabel}>Sort</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {(["mbs", "weight", "stretch", "name"] as SortKey[]).map(s => (
                <button key={s} onClick={() => setSortBy(s)} style={chip(sortBy === s)}>
                  {s === "mbs" ? "MBS ↓" : s === "weight" ? "Weight ↑" : s === "stretch" ? "Stretch pts ↓" : "A–Z"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#7a7268", marginLeft: "auto", alignSelf: "center" }}>
            {filtered.length} / {allData.length}
          </div>
        </div>

        {/* ── Cards grid ── */}
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {filtered.map(w => (
            <WebbingCard
              key={w.id}
              w={w}
              inStretch={activeStretch.includes(w.id)}
              color={colorMap[w.id]}
              onToggleStretch={toggleStretch}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#7a7268" }}>
            No webbings match your filters.
          </div>
        )}

        {/* Attribution */}
        <div style={{ marginTop: 48, padding: "16px 20px", background: "#edeae2", borderRadius: 8 }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#7a7268", margin: 0, lineHeight: 1.7, letterSpacing: "0.03em" }}>
            DATA SOURCES: SlackDB community database (slackdb.com) · ISA SlackData (github.com/International-Slackline-Association/SlackData) · Balance Community stretch data (balancecommunity.com/collections/stretch).
            All data is community-maintained. Always verify MBS and safety specs directly with the manufacturer before rigging.
          </p>
        </div>
      </div>
    </div>
  );
}
