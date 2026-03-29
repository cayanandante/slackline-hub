import { useState, useMemo } from "react";
import rawWebbingData from "../data/webbing_database.json";

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
  discontinued: boolean;
  stretchCurve: StretchPoint[] | null;
  stretchSource: string | null;
  sources: string[];
}

// ─── Lookups ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  FL: "Flat", TB: "Tubular", CS: "Crossing", TR: "Trickline",
};

const MATERIAL_LABELS: Record<string, string> = {
  PL: "Polyester", NY: "Nylon", DY: "Dyneema", VC: "Vectran",
  hybrid: "Hybrid", unknown: "Unknown",
};

const MAT_COLORS: Record<string, { bg: string; text: string }> = {
  DY:     { bg: "rgba(34,197,94,0.15)",  text: "#4ade80" },
  NY:     { bg: "rgba(59,130,246,0.15)", text: "#60a5fa" },
  PL:     { bg: "rgba(255,77,0,0.15)",   text: "#ff7a40" },
  hybrid: { bg: "rgba(168,85,247,0.15)", text: "#c084fc" },
  VC:     { bg: "rgba(234,179,8,0.15)",  text: "#facc15" },
};

// ─── Colors for stretch lines ─────────────────────────────────────────────────

const PALETTE = [
  "#FF4D00","#4ade80","#60a5fa","#facc15","#c084fc","#f472b6","#2dd4bf",
  "#fb923c","#a3e635","#38bdf8","#e879f9","#34d399","#f87171","#fbbf24",
  "#818cf8","#86efac","#fca5a5","#fde68a","#93c5fd","#d8b4fe","#bbf7d0",
  "#fecaca","#fef08a","#bfdbfe","#e9d5ff","#6ee7b7","#fcd34d","#67e8f9",
  "#f9a8d4","#c4b5fd",
];

// ─── Shared styles ────────────────────────────────────────────────────────────

const pill = (active: boolean, color = "#FF4D00"): React.CSSProperties => ({
  fontFamily: "'DM Mono', monospace",
  fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
  padding: "5px 14px", borderRadius: 3, border: "1px solid",
  borderColor: active ? color : "rgba(255,255,255,0.1)",
  background: active ? color : "transparent",
  color: active ? "#fff" : "rgba(255,255,255,0.4)",
  cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" as const,
});

const monoMuted: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace", fontSize: 9,
  letterSpacing: "0.12em", textTransform: "uppercase",
  color: "rgba(255,255,255,0.3)", marginBottom: 8,
};

// ─── Stretch Chart ────────────────────────────────────────────────────────────

function StretchChart({ webbings, hovered, onHover, colorMap, activeIds }: {
  webbings: Webbing[];
  hovered: string | null;
  onHover: (id: string | null) => void;
  colorMap: Record<string, string>;
  activeIds: Set<string>;
}) {
  const visible = webbings.filter(w =>
    activeIds.has(w.id) && w.stretchCurve && w.stretchCurve.length > 1
  );

  const VW = 740, VH = 360;
  const PL = 52, PR = 24, PT = 24, PB = 44;
  const CW = VW - PL - PR, CH = VH - PT - PB;
  const MAX_X = 12, MAX_Y = 25;

  const xS = (kn: number) => PL + Math.min(1, kn / MAX_X) * CW;
  const yS = (p: number) => PT + CH - Math.min(1, p / MAX_Y) * CH;

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: "100%", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Grid */}
      {[0,5,10,15,20,25].map(y => (
        <g key={y}>
          <line x1={PL} x2={VW - PR} y1={yS(y)} y2={yS(y)} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
          <text x={PL - 8} y={yS(y) + 4} fontSize={10} fill="rgba(255,255,255,0.25)" textAnchor="end" fontFamily="'DM Mono',monospace">{y}%</text>
        </g>
      ))}
      {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(x => (
        <g key={x}>
          <line x1={xS(x)} x2={xS(x)} y1={PT} y2={VH - PB} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
          <text x={xS(x)} y={VH - PB + 16} fontSize={10} fill="rgba(255,255,255,0.25)" textAnchor="middle" fontFamily="'DM Mono',monospace">{x}</text>
        </g>
      ))}
      <text x={VW / 2} y={VH - 4} fontSize={9} fill="rgba(255,255,255,0.2)" textAnchor="middle" fontFamily="'DM Mono',monospace" letterSpacing="0.1em">TENSION (kN)</text>
      <text x={14} y={VH / 2} fontSize={9} fill="rgba(255,255,255,0.2)" textAnchor="middle" fontFamily="'DM Mono',monospace" letterSpacing="0.1em" transform={`rotate(-90,14,${VH / 2})`}>STRETCH %</text>

      {visible.map(w => {
        const isHov = hovered === w.id;
        const dim = hovered !== null && !isHov;
        const pts = w.stretchCurve!.filter(p => p.kn <= 12);
        if (pts.length < 2) return null;
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${xS(p.kn).toFixed(1)} ${yS(Math.min(p.percent, MAX_Y)).toFixed(1)}`).join(" ");
        return (
          <path key={w.id} d={d} fill="none"
            stroke={colorMap[w.id]} strokeWidth={isHov ? 3 : 1.5}
            strokeOpacity={dim ? 0.05 : w.discontinued ? 0.35 : 0.85}
            strokeDasharray={w.discontinued ? "5 3" : undefined}
            style={{ cursor: "pointer", transition: "stroke-opacity 0.1s, stroke-width 0.1s" }}
            onMouseEnter={() => onHover(w.id)}
            onMouseLeave={() => onHover(null)}
          />
        );
      })}

      {hovered && (() => {
        const w = visible.find(v => v.id === hovered);
        if (!w?.stretchCurve) return null;
        const pts = w.stretchCurve.filter(p => p.kn <= 12);
        if (!pts.length) return null;
        const last = pts[pts.length - 1];
        return (
          <text x={xS(last.kn) + 6} y={yS(Math.min(last.percent, MAX_Y))} fontSize={11} fontWeight={700}
            fill={colorMap[w.id]} fontFamily="'DM Mono',monospace" dominantBaseline="middle">
            {w.name} {last.percent}%
          </text>
        );
      })()}

      {visible.length === 0 && (
        <text x={VW / 2} y={VH / 2} fontSize={13} fill="rgba(255,255,255,0.15)" textAnchor="middle" fontFamily="'Fraunces',serif" fontStyle="italic">
          Select webbings below to plot
        </text>
      )}
    </svg>
  );
}

// ─── Stretch Table ────────────────────────────────────────────────────────────

function StretchTable({ webbings, colorMap }: { webbings: Webbing[]; colorMap: Record<string, string>; }) {
  const withStretch = webbings.filter(w => w.stretchCurve && w.stretchCurve.length > 1);
  const kns = [1,2,3,4,5,6,7,8,9,10,11,12];

  const getVal = (w: Webbing, kn: number): number | null => {
    if (!w.stretchCurve) return null;
    const exact = w.stretchCurve.find(p => p.kn === kn);
    if (exact) return exact.percent;
    const sorted = [...w.stretchCurve].sort((a, b) => a.kn - b.kn);
    const lo = sorted.filter(p => p.kn <= kn).pop();
    const hi = sorted.find(p => p.kn > kn);
    if (lo && hi) {
      const t = (kn - lo.kn) / (hi.kn - lo.kn);
      return Math.round((lo.percent + t * (hi.percent - lo.percent)) * 100) / 100;
    }
    return null;
  };

  const th: React.CSSProperties = {
    padding: "10px 12px", fontFamily: "'DM Mono',monospace", fontSize: 9,
    letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
    borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap", textAlign: "left",
  };
  const td: React.CSSProperties = {
    padding: "8px 12px", fontFamily: "'DM Mono',monospace", fontSize: 11,
    borderBottom: "1px solid rgba(255,255,255,0.04)", whiteSpace: "nowrap",
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 700 }}>
        <thead>
          <tr>
            <th style={{ ...th, position: "sticky", left: 0, background: "#0a0a0f", minWidth: 170, zIndex: 2 }}>Webbing</th>
            <th style={{ ...th, minWidth: 110 }}>Brand</th>
            {kns.map(kn => <th key={kn} style={{ ...th, textAlign: "center", minWidth: 56 }}>{kn} kN</th>)}
          </tr>
        </thead>
        <tbody>
          {withStretch.map((w, i) => (
            <tr key={w.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
              <td style={{ ...td, position: "sticky", left: 0, background: i % 2 === 0 ? "#0a0a0f" : "#0c0c12", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: colorMap[w.id], flexShrink: 0 }} />
                  <span style={{ color: w.discontinued ? "rgba(255,255,255,0.3)" : "#fff", fontStyle: w.discontinued ? "italic" : "normal" }}>{w.name}</span>
                  {w.discontinued && <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2, padding: "0 3px" }}>DC</span>}
                </div>
              </td>
              <td style={{ ...td, color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{w.brand || "—"}</td>
              {kns.map(kn => {
                const val = getVal(w, kn);
                const num = val ?? 0;
                const intensity = num > 0 ? Math.min(1, num / 25) : 0;
                const col = colorMap[w.id];
                const r = parseInt(col.slice(1,3), 16);
                const g = parseInt(col.slice(3,5), 16);
                const b = parseInt(col.slice(5,7), 16);
                return (
                  <td key={kn} style={{
                    ...td, textAlign: "center",
                    background: val != null && val > 0 ? `rgba(${r},${g},${b},${0.05 + intensity * 0.2})` : undefined,
                    color: val != null ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.1)",
                  }}>
                    {val != null ? `${val}%` : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Specs Table ──────────────────────────────────────────────────────────────

function SpecsTable({ webbings }: { webbings: Webbing[] }) {
  const [sortCol, setSortCol] = useState("mbsKn");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const sorted = useMemo(() => [...webbings].sort((a, b) => {
    let va: string | number = 0, vb: string | number = 0;
    if (sortCol === "name") { va = a.name; vb = b.name; }
    else if (sortCol === "brand") { va = a.brand || ""; vb = b.brand || ""; }
    else if (sortCol === "mbsKn") { va = a.mbsKn ?? -1; vb = b.mbsKn ?? -1; }
    else if (sortCol === "weightGm") { va = a.weightGm ?? 9999; vb = b.weightGm ?? 9999; }
    else if (sortCol === "widthMm") { va = a.widthMm ?? 0; vb = b.widthMm ?? 0; }
    if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
    return sortDir === "asc" ? va - (vb as number) : (vb as number) - va;
  }), [webbings, sortCol, sortDir]);

  const th: React.CSSProperties = {
    padding: "10px 12px", fontFamily: "'DM Mono',monospace", fontSize: 9,
    letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
    borderBottom: "1px solid rgba(255,255,255,0.08)", whiteSpace: "nowrap",
    textAlign: "left", cursor: "pointer", userSelect: "none",
  };
  const td: React.CSSProperties = {
    padding: "10px 12px", fontFamily: "'DM Mono',monospace", fontSize: 11,
    borderBottom: "1px solid rgba(255,255,255,0.04)", whiteSpace: "nowrap",
    color: "rgba(255,255,255,0.6)",
  };

  const arrow = (col: string) => sortCol === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.02)" }}>
            <th style={th} onClick={() => handleSort("name")} onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>Name{arrow("name")}</th>
            <th style={th} onClick={() => handleSort("brand")} onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>Brand{arrow("brand")}</th>
            <th style={{ ...th, cursor: "default" }}>Material</th>
            <th style={{ ...th, cursor: "default" }}>Type</th>
            <th style={th} onClick={() => handleSort("widthMm")} onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>Width{arrow("widthMm")}</th>
            <th style={th} onClick={() => handleSort("mbsKn")} onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>MBS{arrow("mbsKn")}</th>
            <th style={{ ...th, cursor: "default" }}>WLL</th>
            <th style={th} onClick={() => handleSort("weightGm")} onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>Weight{arrow("weightGm")}</th>
            <th style={{ ...th, cursor: "default" }}>Stretch</th>
            <th style={{ ...th, cursor: "default" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((w, i) => {
            const mc = MAT_COLORS[w.material[0]] || { bg: "rgba(255,255,255,0.06)", text: "rgba(255,255,255,0.4)" };
            return (
              <tr key={w.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                <td style={{ ...td, color: w.discontinued ? "rgba(255,255,255,0.35)" : "#fff", fontStyle: w.discontinued ? "italic" : "normal" }}>
                  {w.url
                    ? <a href={w.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#FF4D00")}
                        onMouseLeave={e => (e.currentTarget.style.color = w.discontinued ? "rgba(255,255,255,0.35)" : "#fff")}
                      >{w.name} ↗</a>
                    : w.name}
                </td>
                <td style={{ ...td, fontSize: 10 }}>{w.brand || "—"}</td>
                <td style={td}>
                  <span style={{ background: mc.bg, color: mc.text, borderRadius: 3, padding: "2px 7px", fontSize: 9, letterSpacing: "0.06em" }}>
                    {w.material.map(m => MATERIAL_LABELS[m] || m).join("+")}
                  </span>
                </td>
                <td style={{ ...td, color: "rgba(255,255,255,0.35)" }}>{w.webbingType ? (TYPE_LABELS[w.webbingType] || w.webbingType) : "—"}</td>
                <td style={{ ...td, textAlign: "center" }}>{w.widthMm != null ? `${w.widthMm}mm` : "—"}</td>
                <td style={{ ...td, textAlign: "center", color: w.mbsKn ? "#fff" : "rgba(255,255,255,0.2)", fontWeight: w.mbsKn ? 600 : 400 }}>
                  {w.mbsKn != null ? `${w.mbsKn} kN` : "—"}
                </td>
                <td style={{ ...td, textAlign: "center" }}>{w.wllKn != null ? `${w.wllKn} kN` : "—"}</td>
                <td style={{ ...td, textAlign: "center" }}>{w.weightGm != null ? `${w.weightGm}` : "—"}</td>
                <td style={{ ...td, textAlign: "center" }}>
                  {w.stretchCurve && w.stretchCurve.length > 1
                    ? <span style={{ color: "#4ade80", fontSize: 9 }}>✓ {w.stretchCurve.length}pt</span>
                    : w.stretchCurve?.length === 1
                    ? <span style={{ color: "#facc15", fontSize: 9 }}>~ {w.stretchCurve[0].percent}%</span>
                    : <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 9 }}>—</span>
                  }
                </td>
                <td style={td}>
                  <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 3, letterSpacing: "0.06em",
                    background: w.discontinued ? "rgba(255,255,255,0.04)" : "rgba(34,197,94,0.1)",
                    color: w.discontinued ? "rgba(255,255,255,0.25)" : "#4ade80",
                  }}>{w.discontinued ? "Discontinued" : "Active"}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── MBS Chart ────────────────────────────────────────────────────────────────

function MBSChart({ webbings }: { webbings: Webbing[] }) {
  const data = [...webbings].filter(w => w.mbsKn).sort((a, b) => (b.mbsKn||0) - (a.mbsKn||0)).slice(0, 35);
  if (!data.length) return null;
  const max = Math.max(...data.map(w => w.mbsKn||0));
  const BH = 22, G = 4, LW = 170, PR = 60, W = 740;
  const VH = data.length * (BH + G) + 40;
  const mc = (w: Webbing) => w.material.includes("DY") ? "#4ade80" : w.material.includes("NY") ? "#60a5fa" : w.material.includes("hybrid") ? "#c084fc" : "#FF4D00";

  return (
    <svg viewBox={`0 0 ${W} ${VH}`} style={{ width: "100%", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <text x={LW+2} y={16} fontSize={9} fill="rgba(255,255,255,0.25)" fontFamily="'DM Mono',monospace" letterSpacing="0.1em">MBS (kN)</text>
      {data.map((w, i) => {
        const y = 22 + i * (BH + G);
        const bw = ((w.mbsKn||0) / max) * (W - LW - PR);
        return (
          <g key={w.id}>
            <text x={LW-8} y={y+BH/2+4} fontSize={10} fill={w.discontinued ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.75)"} fontStyle={w.discontinued ? "italic" : "normal"} textAnchor="end" fontFamily="'DM Sans',sans-serif">{w.name}</text>
            <rect x={LW} y={y} width={bw} height={BH} rx={3} fill={mc(w)} fillOpacity={w.discontinued ? 0.2 : 0.7}/>
            <text x={LW+bw+8} y={y+BH/2+4} fontSize={9} fill="rgba(255,255,255,0.35)" fontFamily="'DM Mono',monospace">{w.mbsKn} kN</text>
          </g>
        );
      })}
      {(["DY","NY","PL","hybrid"] as const).map((m, i) => {
        const cols: Record<string,string> = {DY:"#4ade80",NY:"#60a5fa",PL:"#FF4D00",hybrid:"#c084fc"};
        const labs: Record<string,string> = {DY:"Dyneema",NY:"Nylon",PL:"Polyester",hybrid:"Hybrid"};
        return (
          <g key={m} transform={`translate(${LW + i*120},${VH-10})`}>
            <rect width={9} height={9} rx={2} fill={cols[m]} fillOpacity={0.7}/>
            <text x={13} y={8} fontSize={9} fill="rgba(255,255,255,0.35)" fontFamily="'DM Mono',monospace">{labs[m]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Weight Chart ─────────────────────────────────────────────────────────────

function WeightChart({ webbings }: { webbings: Webbing[] }) {
  const data = [...webbings].filter(w => w.weightGm).sort((a, b) => (a.weightGm||999)-(b.weightGm||999)).slice(0, 35);
  if (!data.length) return null;
  const max = Math.max(...data.map(w => w.weightGm||0));
  const BH = 22, G = 4, LW = 170, PR = 70, W = 740;
  const VH = data.length * (BH + G) + 24;

  return (
    <svg viewBox={`0 0 ${W} ${VH}`} style={{ width: "100%", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <text x={LW+2} y={14} fontSize={9} fill="rgba(255,255,255,0.25)" fontFamily="'DM Mono',monospace" letterSpacing="0.1em">WEIGHT g/m — lightest first</text>
      {data.map((w, i) => {
        const y = 20 + i*(BH+G);
        const bw = ((w.weightGm||0)/max)*(W-LW-PR);
        return (
          <g key={w.id}>
            <text x={LW-8} y={y+BH/2+4} fontSize={10} fill={w.discontinued ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.75)"} fontStyle={w.discontinued ? "italic" : "normal"} textAnchor="end" fontFamily="'DM Sans',sans-serif">{w.name}</text>
            <rect x={LW} y={y} width={bw} height={BH} rx={3} fill="rgba(255,255,255,0.2)"/>
            <text x={LW+bw+8} y={y+BH/2+4} fontSize={9} fill="rgba(255,255,255,0.35)" fontFamily="'DM Mono',monospace">{w.weightGm} g/m</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ChartTab = "stretch" | "mbs" | "weight";
type ViewMode = "charts" | "stretch-table" | "specs-table";
type StatusFilter = "active" | "all" | "discontinued";
type MatFilter = "ALL" | "PL" | "NY" | "DY" | "hybrid";
type SortKey = "mbs" | "weight" | "name";

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function WebbingDatabase() {
  const allData = rawWebbingData as unknown as Webbing[];

  const colorMap = useMemo(() => {
    const m: Record<string, string> = {};
    allData.forEach((w, i) => { m[w.id] = PALETTE[i % PALETTE.length]; });
    return m;
  }, [allData]);

  const [viewMode, setViewMode] = useState<ViewMode>("charts");
  const [chartTab, setChartTab] = useState<ChartTab>("stretch");
  const [hovered, setHovered] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [matFilter, setMatFilter] = useState<MatFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [sortBy, setSortBy] = useState<SortKey>("mbs");

  const allStretchIds = useMemo(() =>
    new Set(allData.filter(w => w.stretchCurve && w.stretchCurve.length > 1).map(w => w.id)),
    [allData]
  );
  const [activeStretchIds, setActiveStretchIds] = useState<Set<string>>(allStretchIds);

  const filtered = useMemo(() => allData
    .filter(w => statusFilter === "all" ? true : statusFilter === "active" ? !w.discontinued : w.discontinued)
    .filter(w => matFilter === "ALL" || w.material.includes(matFilter))
    .filter(w => !search || w.name.toLowerCase().includes(search.toLowerCase()) || (w.brand||"").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "mbs") return (b.mbsKn??0) - (a.mbsKn??0);
      return (a.weightGm??9999) - (b.weightGm??9999);
    }), [allData, search, matFilter, statusFilter, sortBy]);

  const toggleStretch = (id: string) =>
    setActiveStretchIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const stats = useMemo(() => ({
    total: allData.length,
    active: allData.filter(w => !w.discontinued).length,
    disc: allData.filter(w => w.discontinued).length,
    stretch: allData.filter(w => w.stretchCurve && w.stretchCurve.length > 1).length,
  }), [allData]);

  const TAB_STYLE = (active: boolean): React.CSSProperties => ({
    fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.1em",
    textTransform: "uppercase", padding: "14px 22px",
    border: "none", background: "transparent", cursor: "pointer",
    color: active ? "#fff" : "rgba(255,255,255,0.3)",
    borderBottom: `2px solid ${active ? "#FF4D00" : "transparent"}`,
    transition: "all 0.15s",
  });

  return (
    <div style={{ background: "#050508", minHeight: "100vh", color: "#fff", fontFamily: "'DM Sans',sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3.5rem)" }}>
          <div style={{ paddingTop: 40, paddingBottom: 32 }}>
            <a href="/" style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.25)", textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24 }}
              onMouseEnter={e => (e.currentTarget.style.color = "#FF4D00")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
            >← Slackline Hub</a>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
              <div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#FF4D00", marginBottom: 12 }}>
                  Gear Database
                </div>
                <h1 style={{
                  fontFamily: "'Fraunces',serif",
                  fontSize: "clamp(3rem,6vw,5.5rem)",
                  fontWeight: 900, fontStyle: "italic",
                  letterSpacing: "-0.04em", margin: 0, lineHeight: 0.88,
                }}>
                  Webbing<br />Database.
                </h1>
              </div>

              <div style={{ display: "flex", gap: 28 }}>
                {([
                  [stats.total, "total"],
                  [stats.active, "active"],
                  [stats.disc, "discontinued"],
                  [stats.stretch, "stretch curves"],
                ] as [number, string][]).map(([n, label]) => (
                  <div key={label} style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(2rem,3.5vw,3rem)", fontWeight: 900, fontStyle: "italic", color: "#FF4D00", lineHeight: 1 }}>{n}</div>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3.5rem) 5rem" }}>

        {/* ── View tabs ── */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 32 }}>
          <button style={TAB_STYLE(viewMode==="charts")} onClick={() => setViewMode("charts")}>📊 Charts</button>
          <button style={TAB_STYLE(viewMode==="stretch-table")} onClick={() => setViewMode("stretch-table")}>📋 Stretch Table</button>
          <button style={TAB_STYLE(viewMode==="specs-table")} onClick={() => setViewMode("specs-table")}>📄 All Specs</button>
        </div>

        {/* ── Filters ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", marginBottom: 32, padding: "18px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8 }}>
          <div style={{ flex: "1 1 180px" }}>
            <div style={monoMuted}>Search</div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name or brand…"
              style={{ width: "100%", fontFamily: "'DM Sans',sans-serif", fontSize: 13, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 5, padding: "8px 12px", background: "rgba(255,255,255,0.04)", color: "#fff", boxSizing: "border-box", outline: "none" }}
            />
          </div>
          <div>
            <div style={monoMuted}>Status</div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["active","all","discontinued"] as StatusFilter[]).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={pill(statusFilter===s)}>
                  {s === "active" ? "Active" : s === "discontinued" ? "DC" : "All"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={monoMuted}>Material</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {(["ALL","PL","NY","DY","hybrid"] as MatFilter[]).map(m => (
                <button key={m} onClick={() => setMatFilter(m)} style={pill(matFilter===m)}>
                  {m === "ALL" ? "All" : MATERIAL_LABELS[m] || m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={monoMuted}>Sort</div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["mbs","weight","name"] as SortKey[]).map(s => (
                <button key={s} onClick={() => setSortBy(s)} style={pill(sortBy===s)}>
                  {s === "mbs" ? "MBS ↓" : s === "weight" ? "Weight ↑" : "A–Z"}
                </button>
              ))}
            </div>
          </div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.25)", marginLeft: "auto", alignSelf: "center", letterSpacing: "0.06em" }}>
            {filtered.length} / {allData.length}
          </div>
        </div>

        {/* ── Charts view ── */}
        {viewMode === "charts" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              {(["stretch","mbs","weight"] as ChartTab[]).map(c => (
                <button key={c} onClick={() => setChartTab(c)} style={pill(chartTab===c)}>
                  {c === "stretch" ? "Stretch curves" : c === "mbs" ? "MBS" : "Weight/m"}
                </button>
              ))}
            </div>

            {chartTab === "stretch" && (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <button onClick={() => setActiveStretchIds(new Set(allStretchIds))} style={{ ...pill(false), fontSize: 9, padding: "3px 10px" }}>All on</button>
                  <button onClick={() => setActiveStretchIds(new Set())} style={{ ...pill(false), fontSize: 9, padding: "3px 10px" }}>All off</button>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.06em" }}>
                    {activeStretchIds.size}/{allStretchIds.size} · dashed = discontinued · fixed 0–12 kN axis
                  </span>
                </div>
                <StretchChart webbings={allData} hovered={hovered} onHover={setHovered} colorMap={colorMap} activeIds={activeStretchIds} />

                {/* Webbing toggles */}
                <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {filtered.filter(w => w.stretchCurve && w.stretchCurve.length > 1).map(w => {
                    const on = activeStretchIds.has(w.id);
                    const col = colorMap[w.id];
                    return (
                      <button key={w.id}
                        onClick={() => toggleStretch(w.id)}
                        onMouseEnter={() => setHovered(w.id)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          fontFamily: "'DM Mono',monospace", fontSize: 9, padding: "3px 8px",
                          borderRadius: 3, border: `1.5px solid ${col}`,
                          background: on ? col : "transparent",
                          color: on ? "#000" : col,
                          cursor: "pointer", whiteSpace: "nowrap",
                          opacity: hovered && hovered !== w.id ? 0.25 : 1,
                          transition: "all 0.1s",
                        }}
                      >{w.name}</button>
                    );
                  })}
                </div>
                <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 12, letterSpacing: "0.06em" }}>
                  Sources: Balance Community · ISA SlackData
                </p>
              </div>
            )}

            {chartTab === "mbs" && (
              <div>
                <MBSChart webbings={filtered} />
                <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 10, letterSpacing: "0.06em" }}>
                  Green = Dyneema · Blue = Nylon · Orange = Polyester · Purple = Hybrid · Faded = discontinued
                </p>
              </div>
            )}

            {chartTab === "weight" && (
              <div>
                <WeightChart webbings={filtered} />
                <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 10, letterSpacing: "0.06em" }}>
                  Lightest first · Faded = discontinued · Top 35 shown
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Stretch table view ── */}
        {viewMode === "stretch-table" && (
          <div>
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 16, letterSpacing: "0.06em" }}>
              {filtered.filter(w => w.stretchCurve && w.stretchCurve.length > 1).length} webbings · Values interpolated where exact kN not measured
            </p>
            <StretchTable webbings={filtered} colorMap={colorMap} />
          </div>
        )}

        {/* ── Specs table view ── */}
        {viewMode === "specs-table" && (
          <div>
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 16, letterSpacing: "0.06em" }}>
              {filtered.length} webbings · Click headers to sort
            </p>
            <SpecsTable webbings={filtered} />
          </div>
        )}

        {/* Attribution */}
        <div style={{ marginTop: 60, padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8 }}>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", margin: 0, lineHeight: 1.9, letterSpacing: "0.04em" }}>
            Data: SlackDB (slackdb.com) · ISA SlackData (github.com/International-Slackline-Association/SlackData) · Balance Community (balancecommunity.com/collections/stretch) · Community-maintained. Always verify MBS and safety specs with the manufacturer before rigging.
          </p>
        </div>
      </div>
    </div>
  );
}
