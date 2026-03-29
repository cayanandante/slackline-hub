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

// ─── Colors ───────────────────────────────────────────────────────────────────

const PALETTE = [
  "#e8541a", "#2ec466", "#4da6ff", "#c084fc", "#f59e0b", "#06b6d4", "#f43f5e",
  "#84cc16", "#fb923c", "#818cf8", "#34d399", "#f472b6", "#facc15", "#38bdf8",
  "#a78bfa", "#4ade80", "#fb7185", "#fbbf24", "#60a5fa", "#c4b5fd", "#86efac",
  "#fca5a5", "#fde68a", "#93c5fd", "#d8b4fe", "#bbf7d0", "#fecaca", "#fef08a",
  "#bfdbfe", "#e9d5ff",
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const chip = (active: boolean): React.CSSProperties => ({
  fontFamily: "'DM Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.06em",
  padding: "5px 12px",
  borderRadius: 4,
  border: "1px solid",
  borderColor: active ? "#e8541a" : "rgba(255,255,255,0.12)",
  background: active ? "#e8541a" : "transparent",
  color: active ? "#fff" : "rgba(255,255,255,0.5)",
  cursor: "pointer",
  transition: "all 0.15s",
  whiteSpace: "nowrap" as const,
});

const monoLabel: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 10,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.35)",
  marginBottom: 8,
};

const tableCell: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
  fontSize: 12,
  fontFamily: "'DM Mono', monospace",
  color: "rgba(255,255,255,0.7)",
  whiteSpace: "nowrap",
};

const tableHeader: React.CSSProperties = {
  padding: "10px 12px",
  fontFamily: "'DM Mono', monospace",
  fontSize: 10,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.35)",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  whiteSpace: "nowrap",
  textAlign: "left" as const,
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

  const VW = 740, VH = 340;
  const PL = 50, PR = 20, PT = 20, PB = 40;
  const CW = VW - PL - PR, CH = VH - PT - PB;

  // Fixed axis: 0–12 kN, 0–25%
  const MAX_X = 12, MAX_Y = 25;

  const xS = (kn: number) => PL + Math.min(1, kn / MAX_X) * CW;
  const yS = (p: number) => PT + CH - Math.min(1, p / MAX_Y) * CH;

  const yTicks = [0, 5, 10, 15, 20, 25];
  const xTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: "100%", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {/* Grid */}
      {yTicks.map(y => (
        <g key={y}>
          <line x1={PL} x2={VW - PR} y1={yS(y)} y2={yS(y)} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          <text x={PL - 6} y={yS(y) + 4} fontSize={9} fill="rgba(255,255,255,0.3)" textAnchor="end" fontFamily="'DM Mono',monospace">{y}%</text>
        </g>
      ))}
      {xTicks.map(x => (
        <g key={x}>
          <line x1={xS(x)} x2={xS(x)} y1={PT} y2={VH - PB} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          <text x={xS(x)} y={VH - PB + 14} fontSize={9} fill="rgba(255,255,255,0.3)" textAnchor="middle" fontFamily="'DM Mono',monospace">{x}</text>
        </g>
      ))}
      <text x={VW / 2} y={VH - 4} fontSize={9} fill="rgba(255,255,255,0.25)" textAnchor="middle" fontFamily="'DM Mono',monospace" letterSpacing="0.08em">TENSION (kN)</text>
      <text x={12} y={VH / 2} fontSize={9} fill="rgba(255,255,255,0.25)" textAnchor="middle" fontFamily="'DM Mono',monospace" letterSpacing="0.08em" transform={`rotate(-90,12,${VH / 2})`}>STRETCH %</text>

      {/* Lines — dim first, hovered on top */}
      {visible.map(w => {
        const isHov = hovered === w.id;
        const dim = hovered !== null && !isHov;
        const pts = w.stretchCurve!.filter(p => p.kn <= 12);
        if (pts.length < 2) return null;
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${xS(p.kn).toFixed(1)} ${yS(Math.min(p.percent, MAX_Y)).toFixed(1)}`).join(" ");
        return (
          <path key={w.id} d={d} fill="none"
            stroke={colorMap[w.id]}
            strokeWidth={isHov ? 2.5 : 1.5}
            strokeOpacity={dim ? 0.06 : w.discontinued ? 0.4 : 0.9}
            strokeDasharray={w.discontinued ? "4 3" : undefined}
            style={{ cursor: "pointer", transition: "stroke-opacity 0.1s, stroke-width 0.1s" }}
            onMouseEnter={() => onHover(w.id)}
            onMouseLeave={() => onHover(null)}
          />
        );
      })}

      {/* Hover label */}
      {hovered && (() => {
        const w = visible.find(v => v.id === hovered);
        if (!w?.stretchCurve) return null;
        const pts = w.stretchCurve.filter(p => p.kn <= 12);
        if (!pts.length) return null;
        const last = pts[pts.length - 1];
        return (
          <text x={xS(last.kn) + 4} y={yS(Math.min(last.percent, MAX_Y))} fontSize={10} fontWeight={700}
            fill={colorMap[w.id]} fontFamily="'DM Mono',monospace" dominantBaseline="middle">
            {w.name} {last.percent}%
          </text>
        );
      })()}

      {visible.length === 0 && (
        <text x={VW / 2} y={VH / 2} fontSize={13} fill="rgba(255,255,255,0.2)" textAnchor="middle" fontFamily="'DM Mono',monospace">
          No webbings selected
        </text>
      )}
    </svg>
  );
}

// ─── Stretch Table (webbings as rows, force as columns) ───────────────────────

function StretchTable({ webbings, colorMap }: {
  webbings: Webbing[];
  colorMap: Record<string, string>;
}) {
  const withStretch = webbings.filter(w => w.stretchCurve && w.stretchCurve.length > 1);
  const kns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const getVal = (w: Webbing, kn: number): number | null => {
    if (!w.stretchCurve) return null;
    // exact match
    const exact = w.stretchCurve.find(p => p.kn === kn);
    if (exact) return exact.percent;
    // interpolate if kn is within range
    const sorted = [...w.stretchCurve].sort((a, b) => a.kn - b.kn);
    const lo = sorted.filter(p => p.kn <= kn).pop();
    const hi = sorted.find(p => p.kn > kn);
    if (lo && hi) {
      const t = (kn - lo.kn) / (hi.kn - lo.kn);
      return Math.round((lo.percent + t * (hi.percent - lo.percent)) * 100) / 100;
    }
    return null;
  };

  if (withStretch.length === 0) return (
    <div style={{ padding: "24px", fontFamily: "'DM Mono',monospace", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
      No stretch data in current filter.
    </div>
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 700 }}>
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.03)" }}>
            <th style={{ ...tableHeader, position: "sticky", left: 0, background: "#111416", minWidth: 160, zIndex: 2 }}>Webbing</th>
            <th style={{ ...tableHeader, minWidth: 90 }}>Brand</th>
            {kns.map(kn => (
              <th key={kn} style={{ ...tableHeader, textAlign: "center" as const, minWidth: 52 }}>{kn} kN</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {withStretch.map((w, i) => (
            <tr key={w.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
              <td style={{ ...tableCell, position: "sticky", left: 0, background: i % 2 === 0 ? "#0a0c0e" : "#0e1012", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: colorMap[w.id], flexShrink: 0 }} />
                  <span style={{ color: w.discontinued ? "rgba(255,255,255,0.35)" : "#fff", fontStyle: w.discontinued ? "italic" : "normal" }}>{w.name}</span>
                  {w.discontinued && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, padding: "0 4px" }}>DC</span>}
                </div>
              </td>
              <td style={{ ...tableCell, color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{w.brand || "—"}</td>
              {kns.map(kn => {
                const val = getVal(w, kn);
                const intensity = val != null ? Math.min(1, val / 25) : 0;
                return (
                  <td key={kn} style={{
                    ...tableCell, textAlign: "center" as const,
                    background: val != null && val > 0
                      ? `rgba(${parseInt(colorMap[w.id].slice(1, 3), 16)},${parseInt(colorMap[w.id].slice(3, 5), 16)},${parseInt(colorMap[w.id].slice(5, 7), 16)},${0.06 + intensity * 0.18})`
                      : undefined,
                    color: val != null ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.15)",
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

// ─── Specs Table (all webbings, characteristics as columns) ──────────────────

function SpecsTable({ webbings }: { webbings: Webbing[] }) {
  const [sortCol, setSortCol] = useState<string>("mbsKn");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const sorted = useMemo(() => {
    return [...webbings].sort((a, b) => {
      let va: number | string = 0, vb: number | string = 0;
      if (sortCol === "name") { va = a.name; vb = b.name; }
      else if (sortCol === "brand") { va = a.brand || ""; vb = b.brand || ""; }
      else if (sortCol === "mbsKn") { va = a.mbsKn ?? -1; vb = b.mbsKn ?? -1; }
      else if (sortCol === "weightGm") { va = a.weightGm ?? 9999; vb = b.weightGm ?? 9999; }
      else if (sortCol === "widthMm") { va = a.widthMm ?? 0; vb = b.widthMm ?? 0; }
      if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
      return sortDir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
  }, [webbings, sortCol, sortDir]);

  const SortHeader = ({ col, label }: { col: string; label: string }) => (
    <th
      onClick={() => handleSort(col)}
      style={{ ...tableHeader, cursor: "pointer", userSelect: "none" }}
      onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
    >
      {label} {sortCol === col ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.03)" }}>
            <SortHeader col="name" label="Name" />
            <SortHeader col="brand" label="Brand" />
            <th style={tableHeader}>Material</th>
            <th style={tableHeader}>Type</th>
            <SortHeader col="widthMm" label="Width" />
            <SortHeader col="mbsKn" label="MBS" />
            <th style={tableHeader}>WLL</th>
            <SortHeader col="weightGm" label="Weight" />
            <th style={tableHeader}>Stretch data</th>
            <th style={tableHeader}>Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((w, i) => (
            <tr key={w.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
              <td style={{ ...tableCell, color: w.discontinued ? "rgba(255,255,255,0.4)" : "#fff", fontStyle: w.discontinued ? "italic" : "normal" }}>
                {w.url
                  ? <a href={w.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#e8541a")}
                    onMouseLeave={e => (e.currentTarget.style.color = w.discontinued ? "rgba(255,255,255,0.4)" : "#fff")}
                  >{w.name} ↗</a>
                  : w.name}
              </td>
              <td style={{ ...tableCell, color: "rgba(255,255,255,0.5)" }}>{w.brand || "—"}</td>
              <td style={{ ...tableCell }}>
                <span style={{
                  background: w.material.includes("DY") ? "rgba(46,196,102,0.15)" : w.material.includes("NY") ? "rgba(77,166,255,0.15)" : w.material.includes("hybrid") ? "rgba(192,132,252,0.15)" : "rgba(232,84,26,0.15)",
                  color: w.material.includes("DY") ? "#2ec466" : w.material.includes("NY") ? "#4da6ff" : w.material.includes("hybrid") ? "#c084fc" : "#e8541a",
                  borderRadius: 4, padding: "2px 7px", fontSize: 10,
                }}>
                  {w.material.map(m => MATERIAL_LABELS[m] || m).join("+")}
                </span>
              </td>
              <td style={{ ...tableCell, color: "rgba(255,255,255,0.45)" }}>{w.webbingType ? (TYPE_LABELS[w.webbingType] || w.webbingType) : "—"}</td>
              <td style={{ ...tableCell, textAlign: "center" as const }}>{w.widthMm != null ? `${w.widthMm} mm` : "—"}</td>
              <td style={{ ...tableCell, textAlign: "center" as const, color: w.mbsKn ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: w.mbsKn ? 600 : 400 }}>
                {w.mbsKn != null ? `${w.mbsKn} kN` : "—"}
              </td>
              <td style={{ ...tableCell, textAlign: "center" as const }}>{w.wllKn != null ? `${w.wllKn} kN` : "—"}</td>
              <td style={{ ...tableCell, textAlign: "center" as const }}>{w.weightGm != null ? `${w.weightGm} g/m` : "—"}</td>
              <td style={{ ...tableCell, textAlign: "center" as const }}>
                {w.stretchCurve && w.stretchCurve.length > 1
                  ? <span style={{ color: "#2ec466", fontSize: 10 }}>✓ {w.stretchCurve.length} pts</span>
                  : w.stretchCurve?.length === 1
                    ? <span style={{ color: "#f59e0b", fontSize: 10 }}>~ {w.stretchCurve[0].percent}%</span>
                    : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>—</span>
                }
              </td>
              <td style={{ ...tableCell }}>
                <span style={{
                  fontSize: 10, padding: "2px 7px", borderRadius: 4,
                  background: w.discontinued ? "rgba(255,255,255,0.05)" : "rgba(46,196,102,0.12)",
                  color: w.discontinued ? "rgba(255,255,255,0.3)" : "#2ec466",
                }}>
                  {w.discontinued ? "Discontinued" : "Active"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── MBS Bar Chart ────────────────────────────────────────────────────────────

function MBSChart({ webbings }: { webbings: Webbing[] }) {
  const data = [...webbings].filter(w => w.mbsKn).sort((a, b) => (b.mbsKn || 0) - (a.mbsKn || 0)).slice(0, 35);
  const max = Math.max(...data.map(w => w.mbsKn || 0));
  const BH = 20, G = 4, LW = 165, PR = 60, SVG_W = 740;
  const VH = data.length * (BH + G) + 36;
  const matColor = (w: Webbing) =>
    w.material.includes("DY") ? "#2ec466" :
      w.material.includes("NY") ? "#4da6ff" :
        w.material.includes("hybrid") ? "#c084fc" : "#e8541a";

  return (
    <svg viewBox={`0 0 ${SVG_W} ${VH}`} style={{ width: "100%", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <text x={LW + 2} y={14} fontSize={9} fill="rgba(255,255,255,0.3)" fontFamily="'DM Mono',monospace" letterSpacing="0.08em">MBS (kN)</text>
      {data.map((w, i) => {
        const y = 20 + i * (BH + G);
        const bw = ((w.mbsKn || 0) / max) * (SVG_W - LW - PR);
        return (
          <g key={w.id}>
            <text x={LW - 6} y={y + BH / 2 + 4} fontSize={10} fill={w.discontinued ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.8)"} fontStyle={w.discontinued ? "italic" : "normal"} textAnchor="end" fontFamily="'DM Sans',sans-serif">{w.name}</text>
            <rect x={LW} y={y} width={bw} height={BH} rx={3} fill={matColor(w)} fillOpacity={w.discontinued ? 0.25 : 0.7} />
            <text x={LW + bw + 6} y={y + BH / 2 + 4} fontSize={9} fill="rgba(255,255,255,0.4)" fontFamily="'DM Mono',monospace">{w.mbsKn} kN</text>
          </g>
        );
      })}
      {(["DY", "NY", "PL", "hybrid"] as const).map((mat, i) => {
        const cols: Record<string, string> = { DY: "#2ec466", NY: "#4da6ff", PL: "#e8541a", hybrid: "#c084fc" };
        const labs: Record<string, string> = { DY: "Dyneema", NY: "Nylon", PL: "Polyester", hybrid: "Hybrid" };
        return (
          <g key={mat} transform={`translate(${LW + i * 120},${VH - 10})`}>
            <rect width={9} height={9} rx={2} fill={cols[mat]} fillOpacity={0.7} />
            <text x={13} y={8} fontSize={9} fill="rgba(255,255,255,0.4)" fontFamily="'DM Mono',monospace">{labs[mat]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Weight Chart ─────────────────────────────────────────────────────────────

function WeightChart({ webbings }: { webbings: Webbing[] }) {
  const data = [...webbings].filter(w => w.weightGm).sort((a, b) => (a.weightGm || 999) - (b.weightGm || 999)).slice(0, 35);
  const max = Math.max(...data.map(w => w.weightGm || 0));
  const BH = 20, G = 4, LW = 165, PR = 70, SVG_W = 740;
  const VH = data.length * (BH + G) + 24;

  return (
    <svg viewBox={`0 0 ${SVG_W} ${VH}`} style={{ width: "100%", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <text x={LW + 2} y={14} fontSize={9} fill="rgba(255,255,255,0.3)" fontFamily="'DM Mono',monospace" letterSpacing="0.08em">WEIGHT (g/m) — lightest first</text>
      {data.map((w, i) => {
        const y = 20 + i * (BH + G);
        const bw = ((w.weightGm || 0) / max) * (SVG_W - LW - PR);
        return (
          <g key={w.id}>
            <text x={LW - 6} y={y + BH / 2 + 4} fontSize={10} fill={w.discontinued ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.8)"} fontStyle={w.discontinued ? "italic" : "normal"} textAnchor="end" fontFamily="'DM Sans',sans-serif">{w.name}</text>
            <rect x={LW} y={y} width={bw} height={BH} rx={3} fill="rgba(255,255,255,0.25)" />
            <text x={LW + bw + 6} y={y + BH / 2 + 4} fontSize={9} fill="rgba(255,255,255,0.4)" fontFamily="'DM Mono',monospace">{w.weightGm} g/m</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ChartTab = "stretch" | "mbs" | "weight";
type SortKey = "mbs" | "weight" | "name";
type StatusFilter = "active" | "discontinued" | "all";
type MatFilter = "ALL" | "PL" | "NY" | "DY" | "hybrid";
type ViewMode = "table" | "stretch-table" | "charts";

export default function WebbingDatabase() {
  const allData = rawWebbingData as unknown as Webbing[];

  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    allData.forEach((w, i) => { map[w.id] = PALETTE[i % PALETTE.length]; });
    return map;
  }, [allData]);

  const [viewMode, setViewMode] = useState<ViewMode>("charts");
  const [chartTab, setChartTab] = useState<ChartTab>("stretch");
  const [hovered, setHovered] = useState<string | null>(null);

  const allStretchIds = useMemo(() =>
    new Set(allData.filter(w => w.stretchCurve && w.stretchCurve.length > 1).map(w => w.id)),
    [allData]
  );
  const [activeStretchIds, setActiveStretchIds] = useState<Set<string>>(allStretchIds);

  const [search, setSearch] = useState("");
  const [matFilter, setMatFilter] = useState<MatFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [sortBy, setSortBy] = useState<SortKey>("mbs");

  const filtered = useMemo(() => {
    return allData
      .filter(w => statusFilter === "all" ? true : statusFilter === "active" ? !w.discontinued : w.discontinued)
      .filter(w => matFilter === "ALL" || w.material.includes(matFilter))
      .filter(w => !search || w.name.toLowerCase().includes(search.toLowerCase()) || (w.brand || "").toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "mbs") return (b.mbsKn ?? 0) - (a.mbsKn ?? 0);
        if (sortBy === "weight") return (a.weightGm ?? 9999) - (b.weightGm ?? 9999);
        return 0;
      });
  }, [allData, search, matFilter, statusFilter, sortBy]);

  const toggleStretch = (id: string) =>
    setActiveStretchIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const stats = useMemo(() => ({
    total: allData.length,
    active: allData.filter(w => !w.discontinued).length,
    discontinued: allData.filter(w => w.discontinued).length,
    withStretch: allData.filter(w => w.stretchCurve && w.stretchCurve.length > 1).length,
  }), [allData]);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0a0c0e", minHeight: "100vh", color: "#fff" }}>

      {/* ── Header ── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0a0c0e" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ paddingTop: 32, paddingBottom: 24 }}>
            <a href="/" style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none", letterSpacing: "0.06em", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              ← Slackline Hub
            </a>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#e8541a", marginBottom: 10 }}>
              Gear Database
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
              <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.04em", margin: 0, lineHeight: 0.9 }}>
                Webbing Database
              </h1>
              <div style={{ display: "flex", gap: 20 }}>
                {([
                  [stats.total, "total"],
                  [stats.active, "active"],
                  [stats.discontinued, "discontinued"],
                  [stats.withStretch, "stretch curves"],
                ] as [number, string][]).map(([n, label]) => (
                  <div key={label} style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 900, fontStyle: "italic", color: "#e8541a", lineHeight: 1 }}>{n}</div>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>{label.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem 4rem" }}>

        {/* ── View mode tabs ── */}
        <div style={{ paddingTop: 28, marginBottom: 24, display: "flex", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 0 }}>
          {([
            ["charts", "📊 Charts"],
            ["stretch-table", "📋 Stretch Table"],
            ["table", "📄 All Specs Table"],
          ] as [ViewMode, string][]).map(([mode, label]) => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{
              fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: "0.06em",
              padding: "12px 20px", border: "none", background: "transparent", cursor: "pointer",
              color: viewMode === mode ? "#fff" : "rgba(255,255,255,0.35)",
              borderBottom: `2px solid ${viewMode === mode ? "#e8541a" : "transparent"}`,
              transition: "all 0.15s",
            }}>{label}</button>
          ))}
        </div>

        {/* ── CHARTS VIEW ── */}
        {viewMode === "charts" && (
          <div style={{ paddingTop: 24 }}>
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
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ ...monoLabel, marginBottom: 0 }}>Visible</span>
                  <button onClick={() => setActiveStretchIds(new Set(allStretchIds))} style={{ ...chip(false), fontSize: 10, padding: "3px 10px" }}>All on</button>
                  <button onClick={() => setActiveStretchIds(new Set())} style={{ ...chip(false), fontSize: 10, padding: "3px 10px" }}>All off</button>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                    {activeStretchIds.size} / {allStretchIds.size} · dashed = discontinued · fixed 0–12 kN axis
                  </span>
                </div>
                <StretchChart webbings={allData} hovered={hovered} onHover={setHovered} colorMap={colorMap} activeIds={activeStretchIds} />
                <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 10, letterSpacing: "0.04em" }}>
                  Sources: Balance Community · ISA SlackData · Toggle individual webbings via "○ chart" column in Specs Table
                </p>
              </div>
            )}
            {chartTab === "mbs" && <><MBSChart webbings={filtered} /><p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 10 }}>Green = Dyneema · Blue = Nylon · Orange = Polyester · Purple = Hybrid · Italic/faded = discontinued · Top 35</p></>}
            {chartTab === "weight" && <><WeightChart webbings={filtered} /><p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 10 }}>Lightest first · Italic/faded = discontinued · Top 35</p></>}
          </div>
        )}

        {/* ── STRETCH TABLE VIEW ── */}
        {viewMode === "stretch-table" && (
          <div style={{ paddingTop: 24 }}>
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>
              {filtered.filter(w => w.stretchCurve && w.stretchCurve.length > 1).length} webbings with stretch data · Values interpolated where exact kN point not measured
            </p>
            <StretchTable webbings={filtered} colorMap={colorMap} />
          </div>
        )}

        {/* ── SPECS TABLE VIEW ── */}
        {viewMode === "table" && (
          <div style={{ paddingTop: 24 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                {filtered.length} webbings · Click column headers to sort
              </span>
            </div>
            <SpecsTable webbings={filtered} />
          </div>
        )}

        {/* ── Filters ── */}
        <div style={{ marginTop: 36, padding: "18px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 180px" }}>
            <div style={monoLabel}>Search</div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name or brand…"
              style={{ width: "100%", fontFamily: "'DM Sans',sans-serif", fontSize: 13, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 12px", background: "rgba(255,255,255,0.05)", color: "#fff", boxSizing: "border-box", outline: "none" }}
            />
          </div>

          <div>
            <div style={monoLabel}>Status</div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["active", "all", "discontinued"] as StatusFilter[]).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={chip(statusFilter === s)}>
                  {s === "active" ? "Active" : s === "discontinued" ? "Discontinued" : "All"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={monoLabel}>Material</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {(["ALL", "PL", "NY", "DY", "hybrid"] as MatFilter[]).map(m => (
                <button key={m} onClick={() => setMatFilter(m)} style={chip(matFilter === m)}>
                  {m === "ALL" ? "All" : MATERIAL_LABELS[m] || m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={monoLabel}>Sort</div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["mbs", "weight", "name"] as SortKey[]).map(s => (
                <button key={s} onClick={() => setSortBy(s)} style={chip(sortBy === s)}>
                  {s === "mbs" ? "MBS ↓" : s === "weight" ? "Weight ↑" : "A–Z"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: "auto", alignSelf: "center" }}>
            {filtered.length} / {allData.length}
          </div>
        </div>

        {/* ── Stretch chart toggle for individual webbings (when in chart view) ── */}
        {viewMode === "charts" && chartTab === "stretch" && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", marginBottom: 10, textTransform: "uppercase" }}>
              Toggle individual webbings on stretch chart
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
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
                      opacity: hovered && hovered !== w.id ? 0.3 : 1,
                      transition: "all 0.1s",
                    }}
                  >{w.name}</button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginTop: 48, padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8 }}>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.2)", margin: 0, lineHeight: 1.8, letterSpacing: "0.03em" }}>
            DATA SOURCES: SlackDB (slackdb.com) · ISA SlackData (github.com/International-Slackline-Association/SlackData) · Balance Community stretch data (balancecommunity.com/collections/stretch).
            Community-maintained data. Always verify MBS and safety specs directly with the manufacturer before rigging.
          </p>
        </div>
      </div>
    </div>
  );
}
