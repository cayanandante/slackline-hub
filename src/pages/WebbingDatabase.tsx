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

// ─── 30 distinct colors ───────────────────────────────────────────────────────

const PALETTE = [
  "#c8531a", "#2d6a4f", "#1a6bc8", "#8e44ad", "#e67e22", "#16a085", "#c94f6d",
  "#d4a843", "#5b8db8", "#3a7d44", "#e74c3c", "#2980b9", "#8b6914", "#27ae60",
  "#6c5ce7", "#fd79a8", "#00b894", "#e17055", "#636e72", "#d35400", "#1abc9c",
  "#f39c12", "#c0392b", "#2c3e50", "#a29bfe", "#55efc4", "#fdcb6e", "#e84393",
  "#00cec9", "#b2bec3",
];

// ─── Shared styles ────────────────────────────────────────────────────────────

const chip = (active: boolean, color?: string): React.CSSProperties => ({
  fontFamily: "'DM Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.06em",
  padding: "5px 12px",
  borderRadius: 4,
  border: "1px solid",
  borderColor: active ? (color || "#0d0f0e") : "rgba(13,15,14,0.2)",
  background: active ? (color || "#0d0f0e") : "transparent",
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

function StretchChart({ webbings, hovered, onHover, colorMap, activeIds }: {
  onHover: (id: string | null) => void;
  colorMap: Record<string, string>;
  activeIds: Set<string>;
}) {
  const plottable = webbings.filter(w => w.stretchCurve && w.stretchCurve.length > 1);
  const visible = plottable.filter(w => activeIds.has(w.id));

  const VW = 720, VH = 320;
  const PL = 48, PR = 16, PT = 16, PB = 38;
  const CW = VW - PL - PR, CH = VH - PT - PB;

  const allKn = visible.flatMap(w => w.stretchCurve!.map(p => p.kn));
  const allPct = visible.flatMap(w => w.stretchCurve!.map(p => p.percent));
  const MAX_X = allKn.length ? Math.min(32, Math.ceil(Math.max(...allKn) / 2) * 2) : 20;
  const MAX_Y = allPct.length ? Math.max(10, Math.ceil(Math.max(...allPct) / 5) * 5) : 25;

  const xS = (kn: number) => PL + Math.min(1, kn / MAX_X) * CW;
  const yS = (p: number) => PT + CH - Math.min(1, p / MAX_Y) * CH;

  const yTicks = Array.from({ length: Math.floor(MAX_Y / 5) + 1 }, (_, i) => i * 5);
  const xStep = MAX_X <= 14 ? 2 : MAX_X <= 22 ? 4 : 5;
  const xTicks = Array.from({ length: Math.floor(MAX_X / xStep) + 1 }, (_, i) => i * xStep);

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: "100%", borderRadius: 8, background: "#fff", border: "1px solid rgba(13,15,14,0.08)" }}>
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
      <text x={VW / 2} y={VH - 2} fontSize={9} fill="#7a7268" textAnchor="middle" fontFamily="'DM Mono',monospace" letterSpacing="0.08em">TENSION (kN)</text>
      <text x={11} y={VH / 2} fontSize={9} fill="#7a7268" textAnchor="middle" fontFamily="'DM Mono',monospace" letterSpacing="0.08em" transform={`rotate(-90,11,${VH / 2})`}>STRETCH %</text>

      {visible.map(w => {
        const isHov = hovered === w.id;
        const dim = hovered !== null && !isHov;
        const pts = w.stretchCurve!;
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${xS(p.kn).toFixed(1)} ${yS(p.percent).toFixed(1)}`).join(" ");
        return (
          <path key={w.id} d={d} fill="none"
            stroke={colorMap[w.id]} strokeWidth={isHov ? 2.5 : 1.5}
            strokeOpacity={dim ? 0.08 : w.discontinued ? 0.5 : 1}
            strokeDasharray={w.discontinued ? "4 3" : undefined}
            style={{ cursor: "pointer", transition: "stroke-opacity 0.1s, stroke-width 0.1s" }}
            onMouseEnter={() => onHover(w.id)}
            onMouseLeave={() => onHover(null)}
          />
        );
      })}

      {hovered && (() => {
        const w = visible.find(w => w.id === hovered);
        if (!w?.stretchCurve) return null;
        const last = w.stretchCurve[w.stretchCurve.length - 1];
        return (
          <text x={xS(last.kn) + 4} y={yS(last.percent)} fontSize={9} fontWeight={600}
            fill={colorMap[w.id]} fontFamily="'DM Mono',monospace" dominantBaseline="middle">
            {w.name} {last.percent}%
          </text>
        );
      })()}

      {visible.length === 0 && (
        <text x={VW / 2} y={VH / 2} fontSize={12} fill="#7a7268" textAnchor="middle" fontFamily="'DM Mono',monospace">
          No webbings selected
        </text>
      )}
    </svg>
  );
}

// ─── Stretch Table ────────────────────────────────────────────────────────────

function StretchTable({ webbings, colorMap }: {
  webbings: Webbing[];
  colorMap: Record<string, string>;
}) {
  // Only webbings with multi-point BC stretch data (uniform kN points 1–12)
  const bcWebbings = webbings.filter(w =>
    w.stretchCurve && w.stretchCurve.length > 1 &&
    w.stretchSource === 'balance-community'
  );

  if (bcWebbings.length === 0) return (
    <div style={{ padding: "20px", fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#7a7268" }}>
      No Balance Community stretch data in current selection.
    </div>
  );

  const kns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const getVal = (w: Webbing, kn: number) => {
    const pt = w.stretchCurve?.find(p => p.kn === kn);
    return pt != null ? `${pt.percent}%` : "—";
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", fontSize: 11, fontFamily: "'DM Mono',monospace", width: "100%", minWidth: 600 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(13,15,14,0.15)" }}>
            <th style={{ padding: "8px 10px", textAlign: "left", color: "#7a7268", fontWeight: 600, whiteSpace: "nowrap", position: "sticky", left: 0, background: "#fff" }}>Force</th>
            {bcWebbings.map(w => (
              <th key={w.id} style={{ padding: "8px 6px", textAlign: "center", whiteSpace: "nowrap", minWidth: 72 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: colorMap[w.id], flexShrink: 0 }} />
                  <span style={{ color: "#0d0f0e", fontSize: 10 }}>{w.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {kns.map((kn, i) => (
            <tr key={kn} style={{ background: i % 2 === 0 ? "#f4f1eb" : "#fff", borderBottom: "1px solid rgba(13,15,14,0.05)" }}>
              <td style={{ padding: "6px 10px", fontWeight: 600, color: "#0d0f0e", whiteSpace: "nowrap", position: "sticky", left: 0, background: i % 2 === 0 ? "#f4f1eb" : "#fff" }}>
                {kn} kN
              </td>
              {bcWebbings.map(w => {
                const val = getVal(w, kn);
                const num = parseFloat(val);
                const intensity = !isNaN(num) ? Math.min(1, num / 25) : 0;
                return (
                  <td key={w.id} style={{
                    padding: "6px 6px", textAlign: "center", color: "#0d0f0e",
                    background: !isNaN(num) && num > 0
                      ? `rgba(${hexToRgb(colorMap[w.id])},${0.08 + intensity * 0.2})`
                      : undefined,
                  }}>
                    {val}
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

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ─── MBS Chart ────────────────────────────────────────────────────────────────

function MBSChart({ webbings }: { webbings: Webbing[] }) {
  const data = [...webbings].filter(w => w.mbsKn).sort((a, b) => (b.mbsKn || 0) - (a.mbsKn || 0)).slice(0, 35);
  const max = Math.max(...data.map(w => w.mbsKn || 0));
  const BH = 19, G = 4, LW = 160, PR = 55, SVG_W = 720;
  const VH = data.length * (BH + G) + 36;
  const matColor = (w: Webbing) =>
    w.material.includes("DY") ? "#2d6a4f" :
      w.material.includes("NY") ? "#2980b9" :
        w.material.includes("hybrid") ? "#8e44ad" : "#c8531a";

  return (
    <svg viewBox={`0 0 ${SVG_W} ${VH}`} style={{ width: "100%", borderRadius: 8, background: "#fff", border: "1px solid rgba(13,15,14,0.08)" }}>
      <text x={LW + 2} y={14} fontSize={9} fill="#7a7268" fontFamily="'DM Mono',monospace" letterSpacing="0.08em">MBS (kN)</text>
      {data.map((w, i) => {
        const y = 20 + i * (BH + G);
        const bw = ((w.mbsKn || 0) / max) * (SVG_W - LW - PR);
        const col = matColor(w);
        return (
          <g key={w.id}>
            <text x={LW - 6} y={y + BH / 2 + 4} fontSize={10} fill={w.discontinued ? "#7a7268" : "#0d0f0e"} textAnchor="end" fontFamily="'DM Sans',sans-serif"
              fontStyle={w.discontinued ? "italic" : "normal"}>{w.name}</text>
            <rect x={LW} y={y} width={bw} height={BH} rx={3} fill={col} fillOpacity={w.discontinued ? 0.35 : 0.65} />
            <text x={LW + bw + 5} y={y + BH / 2 + 4} fontSize={9} fill="#7a7268" fontFamily="'DM Mono',monospace">{w.mbsKn} kN</text>
          </g>
        );
      })}
      {([["DY", "Dyneema", "#2d6a4f"], ["NY", "Nylon", "#2980b9"], ["PL", "Polyester", "#c8531a"], ["hybrid", "Hybrid", "#8e44ad"]] as const).map(([, lab, col], i) => (
        <g key={lab} transform={`translate(${LW + i * 120},${VH - 10})`}>
          <rect width={9} height={9} rx={2} fill={col} fillOpacity={0.65} />
          <text x={13} y={8} fontSize={9} fill="#7a7268" fontFamily="'DM Mono',monospace">{lab}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Weight Chart ─────────────────────────────────────────────────────────────

function WeightChart({ webbings }: { webbings: Webbing[] }) {
  const data = [...webbings].filter(w => w.weightGm).sort((a, b) => (a.weightGm || 999) - (b.weightGm || 999)).slice(0, 35);
  const max = Math.max(...data.map(w => w.weightGm || 0));
  const BH = 19, G = 4, LW = 160, PR = 65, SVG_W = 720;
  const VH = data.length * (BH + G) + 24;

  return (
    <svg viewBox={`0 0 ${SVG_W} ${VH}`} style={{ width: "100%", borderRadius: 8, background: "#fff", border: "1px solid rgba(13,15,14,0.08)" }}>
      <text x={LW + 2} y={14} fontSize={9} fill="#7a7268" fontFamily="'DM Mono',monospace" letterSpacing="0.08em">WEIGHT (g/m) — lightest first</text>
      {data.map((w, i) => {
        const y = 20 + i * (BH + G);
        const bw = ((w.weightGm || 0) / max) * (SVG_W - LW - PR);
        return (
          <g key={w.id}>
            <text x={LW - 6} y={y + BH / 2 + 4} fontSize={10} fill={w.discontinued ? "#7a7268" : "#0d0f0e"} textAnchor="end"
              fontFamily="'DM Sans',sans-serif" fontStyle={w.discontinued ? "italic" : "normal"}>{w.name}</text>
            <rect x={LW} y={y} width={bw} height={BH} rx={3} fill="#7a7268" fillOpacity={w.discontinued ? 0.25 : 0.45} />
            <text x={LW + bw + 5} y={y + BH / 2 + 4} fontSize={9} fill="#7a7268" fontFamily="'DM Mono',monospace">{w.weightGm} g/m</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Webbing Card ─────────────────────────────────────────────────────────────

function WebbingCard({ w, inStretch, color, onToggleStretch }: {
  w: Webbing; inStretch: boolean; color: string; onToggleStretch: (id: string) => void;
}) {
  const hasStretch = w.stretchCurve && w.stretchCurve.length > 1;
  const matLabel = w.material.map(m => MATERIAL_LABELS[m] || m).join(" + ");

  return (
    <div style={{
      background: w.discontinued ? "#f9f7f3" : "#fff",
      border: `1px solid ${w.discontinued ? "rgba(13,15,14,0.07)" : "rgba(13,15,14,0.1)"}`,
      borderRadius: 8, padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 9,
      opacity: w.discontinued ? 0.85 : 1,
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 10px rgba(13,15,14,0.06)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 600, color: "#0d0f0e", lineHeight: 1.2 }}>{w.name}</div>
            {w.discontinued && (
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, padding: "1px 5px", borderRadius: 2, background: "#edeae2", color: "#7a7268", letterSpacing: "0.06em" }}>DC</span>
            )}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#7a7268", letterSpacing: "0.06em", marginTop: 2 }}>
            {(w.brand || "Unknown").toUpperCase()}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
          {w.webbingType && (
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, padding: "2px 6px", borderRadius: 3, background: "#f4f1eb", color: "#7a7268" }}>
              {TYPE_LABELS[w.webbingType] || w.webbingType}
            </span>
          )}
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, padding: "2px 6px", borderRadius: 3, background: "#f4f1eb", color: "#7a7268" }}>
            {matLabel}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
        {[
          ["MBS", w.mbsKn != null ? `${w.mbsKn}` : "—", "kN"],
          ["Width", w.widthMm != null ? `${w.widthMm}` : "—", "mm"],
          ["Weight", w.weightGm != null ? `${w.weightGm}` : "—", "g/m"],
          ["Elong.", w.stretchCurve && w.stretchCurve.length === 1 ? `${w.stretchCurve[0].percent}` : w.stretchCurve && w.stretchCurve.length > 1 ? "curve" : "—", w.stretchCurve?.length === 1 ? "%" : ""],
        ].map(([label, val, unit]) => (
          <div key={label} style={{ textAlign: "center", background: "#f4f1eb", borderRadius: 4, padding: "6px 3px" }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#7a7268", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 13, fontWeight: 700, fontStyle: "italic", color: "#0d0f0e", lineHeight: 1 }}>
              {val}{val !== "—" && unit && <span style={{ fontSize: 9, color: "#7a7268", fontFamily: "'DM Mono',monospace", fontStyle: "normal" }}> {unit}</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 5 }}>
        <div style={{ display: "flex", gap: 7, fontSize: 9, fontFamily: "'DM Mono',monospace", color: "#7a7268" }}>
          {w.wllKn != null && <span style={{ color: "#2d6a4f" }}>WLL {w.wllKn} kN</span>}
          {w.stretchSource && <span style={{ background: "#f4f1eb", padding: "1px 4px", borderRadius: 2 }}>
            {w.stretchSource === 'balance-community' ? 'BC' : w.stretchSource === 'isa' ? 'ISA' : 'DB'}
          </span>}
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {hasStretch && (
            <button onClick={() => onToggleStretch(w.id)} style={{
              fontFamily: "'DM Mono',monospace", fontSize: 9, padding: "3px 7px", borderRadius: 3,
              border: `1.5px solid ${inStretch ? color : "rgba(13,15,14,0.2)"}`,
              background: inStretch ? color : "transparent",
              color: inStretch ? "#fff" : "#7a7268", cursor: "pointer",
            }}>
              {inStretch ? "● chart" : "○ chart"}
            </button>
          )}
          {w.url && (
            <a href={w.url} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#7a7268", textDecoration: "none" }}>↗</a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ChartTab = "stretch" | "mbs" | "weight";
type SortKey = "mbs" | "weight" | "name";
type StatusFilter = "active" | "discontinued" | "all";
type MatFilter = "ALL" | "PL" | "NY" | "DY" | "hybrid";

export default function WebbingDatabase() {
  const allData = rawWebbingData as unknown as Webbing[];

  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    allData.forEach((w, i) => { map[w.id] = PALETTE[i % PALETTE.length]; });
    return map;
  }, [allData]);

  // Chart state
  const [chartTab, setChartTab] = useState<ChartTab>("stretch");
  const [hovered, setHovered] = useState<string | null>(null);
  const [tableOpen, setTableOpen] = useState(false);

  // All webbings with multi-point stretch curves shown by default
  const allStretchIds = useMemo(() =>
    new Set(allData.filter(w => w.stretchCurve && w.stretchCurve.length > 1).map(w => w.id)),
    [allData]
  );
  const [activeStretchIds, setActiveStretchIds] = useState<Set<string>>(allStretchIds);

  // Filter state
  const [search, setSearch] = useState("");
  const [matFilter, setMatFilter] = useState<MatFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [sortBy, setSortBy] = useState<SortKey>("mbs");

  const filtered = useMemo(() => {
    return allData
      .filter(w => {
        if (statusFilter === "active") return !w.discontinued;
        if (statusFilter === "discontinued") return w.discontinued;
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
        return 0;
      });
  }, [allData, search, matFilter, statusFilter, sortBy]);

  const toggleStretch = (id: string) =>
    setActiveStretchIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // BC webbings for the stretch table (all of them, not just filtered)
  const bcStretchWebbings = useMemo(() =>
    allData.filter(w => w.stretchSource === 'balance-community' && w.stretchCurve && w.stretchCurve.length > 1),
    [allData]
  );

  const stats = useMemo(() => ({
    total: allData.length,
    active: allData.filter(w => !w.discontinued).length,
    discontinued: allData.filter(w => w.discontinued).length,
    withStretch: allData.filter(w => w.stretchCurve && w.stretchCurve.length > 1).length,
  }), [allData]);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f4f1eb", minHeight: "100vh", color: "#0d0f0e" }}>

      {/* ── Header ── */}
      <div style={{ borderBottom: "1px solid rgba(13,15,14,0.1)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ paddingTop: 32, paddingBottom: 20 }}>
            <a href="/" style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#7a7268", textDecoration: "none", letterSpacing: "0.06em", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              ← Back to Slackline Hub
            </a>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c8531a", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-block", width: 20, height: 1, background: "#c8531a" }} /> Gear Database
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
              <div>
                <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 36, fontWeight: 300, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
                  Webbing Database
                </h1>
                <p style={{ fontSize: 14, color: "#7a7268", margin: 0, fontWeight: 300 }}>
                  Community-maintained specs · SlackDB · ISA SlackData · Balance Community
                </p>
              </div>
              <div style={{ display: "flex", gap: 24 }}>
                {[
                  [stats.total, "total"],
                  [stats.active, "active"],
                  [stats.discontinued, "discontinued"],
                  [stats.withStretch, "stretch curves"],
                ].map(([n, label]) => (
                  <div key={String(label)} style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 600, fontStyle: "italic", color: "#c8531a", lineHeight: 1 }}>{n}</div>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#7a7268", letterSpacing: "0.06em" }}>{String(label).toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem 4rem" }}>

        {/* ── Chart tabs ── */}
        <div style={{ paddingTop: 32 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <span style={monoLabel}>Chart</span>
            {(["stretch", "mbs", "weight"] as ChartTab[]).map(c => (
              <button key={c} onClick={() => setChartTab(c)} style={chip(chartTab === c)}>
                {c === "stretch" ? "Stretch curves" : c === "mbs" ? "MBS comparison" : "Weight/m"}
              </button>
            ))}
          </div>

          {/* ── Stretch Chart ── */}
          {chartTab === "stretch" && (
            <div>
              {/* Select all / none controls */}
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ ...monoLabel, marginBottom: 0 }}>Visible</span>
                <button onClick={() => setActiveStretchIds(allStretchIds)} style={{ ...chip(false), fontSize: 10, padding: "3px 9px" }}>All on</button>
                <button onClick={() => setActiveStretchIds(new Set())} style={{ ...chip(false), fontSize: 10, padding: "3px 9px" }}>All off</button>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#7a7268" }}>
                  {activeStretchIds.size} / {allStretchIds.size} shown · dashed = discontinued
                </span>
              </div>

              <StretchChart
                webbings={allData}
                hovered={hovered}
                onHover={setHovered}
                colorMap={colorMap}
                onToggle={toggleStretch}
                activeIds={activeStretchIds}
              />

              {/* ── Stretch Table (collapsible) ── */}
              <div style={{ marginTop: 16, border: "1px solid rgba(13,15,14,0.1)", borderRadius: 8, overflow: "hidden" }}>
                <button
                  onClick={() => setTableOpen(o => !o)}
                  style={{
                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 18px", background: "#edeae2", border: "none", cursor: "pointer",
                    fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: "0.06em", color: "#0d0f0e",
                  }}
                >
                  <span>{tableOpen ? "−" : "+"} Expand Stretch Table (Balance Community — % at each kN)</span>
                  <span style={{ color: "#7a7268", fontSize: 10 }}>{bcStretchWebbings.length} webbings · 1–12 kN</span>
                </button>
                {tableOpen && (
                  <div style={{ background: "#fff", padding: "12px 0" }}>
                    <StretchTable webbings={bcStretchWebbings} colorMap={colorMap} />
                  </div>
                )}
              </div>

              <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#7a7268", marginTop: 8, letterSpacing: "0.04em" }}>
                Sources: Balance Community (balancecommunity.com/collections/stretch) · ISA SlackData · Toggle webbings via "○ chart" on cards below
              </p>
            </div>
          )}

          {chartTab === "mbs" && (
            <div>
              <MBSChart webbings={filtered} />
              <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#7a7268", marginTop: 8, letterSpacing: "0.04em" }}>
                Green = Dyneema · Blue = Nylon · Orange = Polyester · Purple = Hybrid · Italic/faded = discontinued · Top 35 shown
              </p>
            </div>
          )}

          {chartTab === "weight" && (
            <div>
              <WeightChart webbings={filtered} />
              <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#7a7268", marginTop: 8, letterSpacing: "0.04em" }}>
                Lightest first · Italic/faded = discontinued · Top 35 shown
              </p>
            </div>
          )}
        </div>

        {/* ── Filters ── */}
        <div style={{ marginTop: 44, padding: "18px 20px", background: "#edeae2", borderRadius: 8, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 180px" }}>
            <div style={monoLabel}>Search</div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name or brand…"
              style={{ width: "100%", fontFamily: "'DM Sans',sans-serif", fontSize: 13, border: "1px solid rgba(13,15,14,0.15)", borderRadius: 5, padding: "7px 12px", background: "#fff", color: "#0d0f0e", boxSizing: "border-box" }}
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

          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#7a7268", marginLeft: "auto", alignSelf: "center" }}>
            {filtered.length} / {allData.length}
          </div>
        </div>

        {/* ── Cards ── */}
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 10 }}>
          {filtered.map(w => (
            <WebbingCard key={w.id} w={w}
              inStretch={activeStretchIds.has(w.id)}
              color={colorMap[w.id]}
              onToggleStretch={toggleStretch}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#7a7268" }}>
            No webbings match your filters.
          </div>
        )}

        <div style={{ marginTop: 48, padding: "16px 20px", background: "#edeae2", borderRadius: 8 }}>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#7a7268", margin: 0, lineHeight: 1.7, letterSpacing: "0.03em" }}>
            DATA SOURCES: SlackDB (slackdb.com) · ISA SlackData (github.com/International-Slackline-Association/SlackData) · Balance Community stretch curves (balancecommunity.com/collections/stretch).
            All data is community-maintained. Always verify MBS and safety specs directly with the manufacturer before rigging.
          </p>
        </div>
      </div>
    </div>
  );
}
