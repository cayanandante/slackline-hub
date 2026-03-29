import { useState, useMemo } from "react";
import rawWebbingData from "../data/webbing_database.json";

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  white:  "#ffffff",
  bg:     "#f5f6f8",
  navy:   "#0a1628",
  blue:   "#1a56db",
  muted:  "#6b7a99",
  border: "#dde2ed",
  text:   "#0a1628",
};

const FONT = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StretchPoint { kn: number; percent: number; }
interface Webbing {
  id: string; name: string; brand: string | null; webbingType: string | null;
  material: string[]; widthMm: number | null; weightGm: number | null;
  mbsKn: number | null; wllKn: number | null; depthMm: number | null;
  url: string | null; discontinued: boolean;
  stretchCurve: StretchPoint[] | null; stretchSource: string | null; sources: string[];
}

// ─── Lookups ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = { FL:"Flat", TB:"Tubular", CS:"Crossing", TR:"Trickline" };
const MAT_LABELS: Record<string, string> = { PL:"Polyester", NY:"Nylon", DY:"Dyneema", VC:"Vectran", hybrid:"Hybrid", unknown:"?" };

const MAT_COLORS: Record<string, { bg: string; text: string }> = {
  DY:     { bg: "rgba(16,185,129,0.1)",  text: "#059669" },
  NY:     { bg: "rgba(26,86,219,0.1)",   text: "#1a56db" },
  PL:     { bg: "rgba(245,158,11,0.1)",  text: "#d97706" },
  hybrid: { bg: "rgba(139,92,246,0.1)",  text: "#7c3aed" },
  VC:     { bg: "rgba(239,68,68,0.1)",   text: "#dc2626" },
};

// ─── Colors ───────────────────────────────────────────────────────────────────

const PALETTE = [
  "#1a56db","#059669","#d97706","#7c3aed","#dc2626","#0891b2",
  "#be185d","#16a34a","#ea580c","#4f46e5","#0284c7","#9333ea",
  "#15803d","#c2410c","#1d4ed8","#047857","#b45309","#6d28d9",
  "#0369a1","#9f1239","#065f46","#92400e","#3730a3","#164e63",
  "#701a75","#14532d","#7c2d12","#1e1b4b","#083344","#500724",
];

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const chip = (active: boolean): React.CSSProperties => ({
  fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
  textTransform: "uppercase", padding: "5px 14px", borderRadius: 2, border: "1px solid",
  borderColor: active ? C.blue : C.border,
  background: active ? C.blue : C.white,
  color: active ? C.white : C.muted,
  cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" as const,
});

const monoLabel: React.CSSProperties = {
  fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
  textTransform: "uppercase", color: C.muted, marginBottom: 8,
};

const thStyle: React.CSSProperties = {
  padding: "10px 12px", fontFamily: FONT, fontSize: 10, fontWeight: 700,
  letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted,
  borderBottom: `2px solid ${C.border}`, whiteSpace: "nowrap", textAlign: "left",
  background: C.white,
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px", fontFamily: FONT, fontSize: 12, fontWeight: 500,
  borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", color: C.text,
};

// ─── Stretch Chart ────────────────────────────────────────────────────────────

function StretchChart({ webbings, hovered, onHover, colorMap, activeIds }: {
  webbings: Webbing[];
  hovered: string | null;
  onHover: (id: string | null) => void;
  colorMap: Record<string, string>;
  activeIds: Set<string>;
}) {
  const visible = webbings.filter(w => activeIds.has(w.id) && w.stretchCurve && w.stretchCurve.length > 1);
  const VW = 740, VH = 340, PL = 50, PR = 24, PT = 20, PB = 40;
  const CW = VW - PL - PR, CH = VH - PT - PB;
  const MAX_X = 12, MAX_Y = 25;
  const xS = (kn: number) => PL + Math.min(1, kn / MAX_X) * CW;
  const yS = (p: number) => PT + CH - Math.min(1, p / MAX_Y) * CH;

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: "100%", borderRadius: 4, background: C.white, border: `1px solid ${C.border}` }}>
      {[0,5,10,15,20,25].map(y => (
        <g key={y}>
          <line x1={PL} x2={VW-PR} y1={yS(y)} y2={yS(y)} stroke={C.border} strokeWidth={1}/>
          <text x={PL-7} y={yS(y)+4} fontSize={9} fill={C.muted} textAnchor="end" fontFamily={FONT} fontWeight={600} letterSpacing="0.06em">{y}%</text>
        </g>
      ))}
      {[0,2,4,6,8,10,12].map(x => (
        <g key={x}>
          <line x1={xS(x)} x2={xS(x)} y1={PT} y2={VH-PB} stroke={C.border} strokeWidth={1}/>
          <text x={xS(x)} y={VH-PB+14} fontSize={9} fill={C.muted} textAnchor="middle" fontFamily={FONT} fontWeight={600}>{x} kN</text>
        </g>
      ))}
      <text x={VW/2} y={VH-3} fontSize={9} fill={C.muted} textAnchor="middle" fontFamily={FONT} fontWeight={700} letterSpacing="0.1em">TENSION (kN)</text>
      <text x={13} y={VH/2} fontSize={9} fill={C.muted} textAnchor="middle" fontFamily={FONT} fontWeight={700} letterSpacing="0.1em" transform={`rotate(-90,13,${VH/2})`}>STRETCH %</text>

      {visible.map(w => {
        const isHov = hovered === w.id;
        const dim = hovered !== null && !isHov;
        const pts = w.stretchCurve!.filter(p => p.kn <= 12);
        if (pts.length < 2) return null;
        const d = pts.map((p, i) => `${i===0?"M":"L"} ${xS(p.kn).toFixed(1)} ${yS(Math.min(p.percent,MAX_Y)).toFixed(1)}`).join(" ");
        return (
          <path key={w.id} d={d} fill="none"
            stroke={colorMap[w.id]} strokeWidth={isHov ? 3 : 1.5}
            strokeOpacity={dim ? 0.07 : w.discontinued ? 0.35 : 1}
            strokeDasharray={w.discontinued ? "5 3" : undefined}
            style={{ cursor: "pointer", transition: "stroke-opacity 0.1s, stroke-width 0.1s" }}
            onMouseEnter={() => onHover(w.id)} onMouseLeave={() => onHover(null)}
          />
        );
      })}

      {hovered && (() => {
        const w = visible.find(v => v.id === hovered);
        if (!w?.stretchCurve) return null;
        const pts = w.stretchCurve.filter(p => p.kn <= 12);
        if (!pts.length) return null;
        const last = pts[pts.length-1];
        return (
          <text x={xS(last.kn)+6} y={yS(Math.min(last.percent,MAX_Y))} fontSize={10} fontWeight={700}
            fill={colorMap[w.id]} fontFamily={FONT} dominantBaseline="middle">{w.name} {last.percent}%</text>
        );
      })()}

      {visible.length === 0 && (
        <text x={VW/2} y={VH/2} fontSize={14} fill={C.muted} textAnchor="middle" fontFamily={FONT} fontWeight={600} letterSpacing="0.06em">
          Select webbings below to plot
        </text>
      )}
    </svg>
  );
}

// ─── Stretch Table ────────────────────────────────────────────────────────────

function StretchTable({ webbings, colorMap }: { webbings: Webbing[]; colorMap: Record<string, string>; }) {
  const rows = webbings.filter(w => w.stretchCurve && w.stretchCurve.length > 1);
  const kns = [1,2,3,4,5,6,7,8,9,10,11,12];

  const getVal = (w: Webbing, kn: number): number | null => {
    if (!w.stretchCurve) return null;
    const exact = w.stretchCurve.find(p => p.kn === kn);
    if (exact) return exact.percent;
    const s = [...w.stretchCurve].sort((a,b) => a.kn - b.kn);
    const lo = s.filter(p => p.kn <= kn).pop();
    const hi = s.find(p => p.kn > kn);
    if (lo && hi) return Math.round((lo.percent + (kn-lo.kn)/(hi.kn-lo.kn)*(hi.percent-lo.percent))*100)/100;
    return null;
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 700, background: C.white, border: `1px solid ${C.border}` }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, position: "sticky", left: 0, minWidth: 170, zIndex: 2 }}>Webbing</th>
            <th style={{ ...thStyle, minWidth: 120 }}>Brand</th>
            {kns.map(kn => <th key={kn} style={{ ...thStyle, textAlign: "center", minWidth: 56 }}>{kn} kN</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((w, i) => (
            <tr key={w.id} style={{ background: i%2===0 ? C.white : C.bg }}>
              <td style={{ ...tdStyle, position: "sticky", left: 0, background: i%2===0 ? C.white : C.bg, zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: colorMap[w.id], flexShrink: 0 }}/>
                  <span style={{ color: w.discontinued ? C.muted : C.text, fontStyle: w.discontinued ? "italic" : "normal" }}>{w.name}</span>
                  {w.discontinued && <span style={{ fontSize: 9, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 2, padding: "0 3px" }}>DC</span>}
                </div>
              </td>
              <td style={{ ...tdStyle, color: C.muted, fontSize: 11 }}>{w.brand || "—"}</td>
              {kns.map(kn => {
                const val = getVal(w, kn);
                const intensity = val != null ? Math.min(1, val/25) : 0;
                const col = colorMap[w.id];
                const r = parseInt(col.slice(1,3),16);
                const g = parseInt(col.slice(3,5),16);
                const b = parseInt(col.slice(5,7),16);
                return (
                  <td key={kn} style={{
                    ...tdStyle, textAlign: "center",
                    background: val != null && val > 0 ? `rgba(${r},${g},${b},${0.04+intensity*0.14})` : undefined,
                    color: val != null ? C.text : C.muted,
                    fontWeight: val != null ? 700 : 400,
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
    if (sortCol === col) setSortDir(d => d==="asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const sorted = useMemo(() => [...webbings].sort((a, b) => {
    let va: string|number = 0, vb: string|number = 0;
    if (sortCol==="name") { va=a.name; vb=b.name; }
    else if (sortCol==="brand") { va=a.brand||""; vb=b.brand||""; }
    else if (sortCol==="mbsKn") { va=a.mbsKn??-1; vb=b.mbsKn??-1; }
    else if (sortCol==="weightGm") { va=a.weightGm??9999; vb=b.weightGm??9999; }
    else if (sortCol==="widthMm") { va=a.widthMm??0; vb=b.widthMm??0; }
    if (typeof va==="string") return sortDir==="asc" ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
    return sortDir==="asc" ? va-(vb as number) : (vb as number)-va;
  }), [webbings, sortCol, sortDir]);

  const SH = ({ col, label }: { col: string; label: string }) => (
    <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => handleSort(col)}
      onMouseEnter={e => (e.currentTarget.style.color = C.blue)}
      onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
    >{label}{sortCol===col ? (sortDir==="asc"?" ↑":" ↓") : ""}</th>
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900, background: C.white, border: `1px solid ${C.border}` }}>
        <thead>
          <tr>
            <SH col="name" label="Name"/>
            <SH col="brand" label="Brand"/>
            <th style={{ ...thStyle, cursor: "default" }}>Material</th>
            <th style={{ ...thStyle, cursor: "default" }}>Type</th>
            <SH col="widthMm" label="Width"/>
            <SH col="mbsKn" label="MBS"/>
            <th style={{ ...thStyle, cursor: "default" }}>WLL</th>
            <SH col="weightGm" label="Weight"/>
            <th style={{ ...thStyle, cursor: "default" }}>Stretch</th>
            <th style={{ ...thStyle, cursor: "default" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((w, i) => {
            const mc = MAT_COLORS[w.material[0]] || { bg: "rgba(0,0,0,0.04)", text: C.muted };
            return (
              <tr key={w.id} style={{ background: i%2===0 ? C.white : C.bg }}>
                <td style={{ ...tdStyle, color: w.discontinued ? C.muted : C.text, fontStyle: w.discontinued ? "italic" : "normal" }}>
                  {w.url
                    ? <a href={w.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.color = C.blue)}
                        onMouseLeave={e => (e.currentTarget.style.color = w.discontinued ? C.muted : C.text)}
                      >{w.name} ↗</a>
                    : w.name}
                </td>
                <td style={{ ...tdStyle, color: C.muted, fontSize: 11 }}>{w.brand||"—"}</td>
                <td style={tdStyle}>
                  <span style={{ background: mc.bg, color: mc.text, borderRadius: 2, padding: "2px 7px", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {w.material.map(m => MAT_LABELS[m]||m).join("+")}
                  </span>
                </td>
                <td style={{ ...tdStyle, color: C.muted }}>{w.webbingType ? (TYPE_LABELS[w.webbingType]||w.webbingType) : "—"}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{w.widthMm!=null ? `${w.widthMm}mm` : "—"}</td>
                <td style={{ ...tdStyle, textAlign: "center", fontWeight: w.mbsKn ? 800 : 500, color: w.mbsKn ? C.navy : C.muted }}>
                  {w.mbsKn!=null ? `${w.mbsKn} kN` : "—"}
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{w.wllKn!=null ? `${w.wllKn} kN` : "—"}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{w.weightGm!=null ? `${w.weightGm}` : "—"}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  {w.stretchCurve && w.stretchCurve.length > 1
                    ? <span style={{ color: "#059669", fontSize: 9, fontWeight: 700 }}>✓ {w.stretchCurve.length}pt</span>
                    : w.stretchCurve?.length===1
                    ? <span style={{ color: "#d97706", fontSize: 9, fontWeight: 700 }}>~ {w.stretchCurve[0].percent}%</span>
                    : <span style={{ color: C.muted, fontSize: 9 }}>—</span>}
                </td>
                <td style={tdStyle}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    padding: "2px 7px", borderRadius: 2,
                    background: w.discontinued ? "rgba(0,0,0,0.05)" : "rgba(16,185,129,0.1)",
                    color: w.discontinued ? C.muted : "#059669",
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
  const data = [...webbings].filter(w => w.mbsKn).sort((a,b)=>(b.mbsKn||0)-(a.mbsKn||0)).slice(0,35);
  if (!data.length) return null;
  const max = Math.max(...data.map(w => w.mbsKn||0));
  const BH=22, G=4, LW=170, PR=60, W=740;
  const VH = data.length*(BH+G)+40;
  const mc = (w: Webbing) => w.material.includes("DY")?"#059669":w.material.includes("NY")?C.blue:w.material.includes("hybrid")?"#7c3aed":"#d97706";

  return (
    <svg viewBox={`0 0 ${W} ${VH}`} style={{ width:"100%", borderRadius:4, background:C.white, border:`1px solid ${C.border}` }}>
      <text x={LW+2} y={16} fontSize={9} fill={C.muted} fontFamily={FONT} fontWeight={700} letterSpacing="0.12em">MBS (kN)</text>
      {data.map((w,i) => {
        const y = 22+i*(BH+G);
        const bw = ((w.mbsKn||0)/max)*(W-LW-PR);
        return (
          <g key={w.id}>
            <text x={LW-8} y={y+BH/2+4} fontSize={11} fill={w.discontinued?C.muted:C.text} fontStyle={w.discontinued?"italic":"normal"} textAnchor="end" fontFamily={FONT} fontWeight={600}>{w.name}</text>
            <rect x={LW} y={y} width={bw} height={BH} rx={2} fill={mc(w)} fillOpacity={w.discontinued?0.25:0.8}/>
            <text x={LW+bw+8} y={y+BH/2+4} fontSize={9} fill={C.muted} fontFamily={FONT} fontWeight={600}>{w.mbsKn} kN</text>
          </g>
        );
      })}
      {(["DY","NY","PL","hybrid"] as const).map((m,i) => {
        const cols: Record<string,string>={DY:"#059669",NY:C.blue,PL:"#d97706",hybrid:"#7c3aed"};
        const labs: Record<string,string>={DY:"Dyneema",NY:"Nylon",PL:"Polyester",hybrid:"Hybrid"};
        return (
          <g key={m} transform={`translate(${LW+i*120},${VH-10})`}>
            <rect width={9} height={9} rx={2} fill={cols[m]} fillOpacity={0.8}/>
            <text x={13} y={8} fontSize={9} fill={C.muted} fontFamily={FONT} fontWeight={600}>{labs[m]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Weight Chart ─────────────────────────────────────────────────────────────

function WeightChart({ webbings }: { webbings: Webbing[] }) {
  const data = [...webbings].filter(w => w.weightGm).sort((a,b)=>(a.weightGm||999)-(b.weightGm||999)).slice(0,35);
  if (!data.length) return null;
  const max = Math.max(...data.map(w => w.weightGm||0));
  const BH=22, G=4, LW=170, PR=70, W=740;
  const VH = data.length*(BH+G)+24;

  return (
    <svg viewBox={`0 0 ${W} ${VH}`} style={{ width:"100%", borderRadius:4, background:C.white, border:`1px solid ${C.border}` }}>
      <text x={LW+2} y={14} fontSize={9} fill={C.muted} fontFamily={FONT} fontWeight={700} letterSpacing="0.12em">WEIGHT (g/m) — lightest first</text>
      {data.map((w,i) => {
        const y = 20+i*(BH+G);
        const bw = ((w.weightGm||0)/max)*(W-LW-PR);
        return (
          <g key={w.id}>
            <text x={LW-8} y={y+BH/2+4} fontSize={11} fill={w.discontinued?C.muted:C.text} fontStyle={w.discontinued?"italic":"normal"} textAnchor="end" fontFamily={FONT} fontWeight={600}>{w.name}</text>
            <rect x={LW} y={y} width={bw} height={BH} rx={2} fill={C.blue} fillOpacity={w.discontinued?0.15:0.5}/>
            <text x={LW+bw+8} y={y+BH/2+4} fontSize={9} fill={C.muted} fontFamily={FONT} fontWeight={600}>{w.weightGm} g/m</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ChartTab = "stretch"|"mbs"|"weight";
type ViewMode = "charts"|"stretch-table"|"specs-table";
type StatusFilter = "active"|"all"|"discontinued";
type MatFilter = "ALL"|"PL"|"NY"|"DY"|"hybrid";
type SortKey = "mbs"|"weight"|"name";

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function WebbingDatabase() {
  const allData = rawWebbingData as unknown as Webbing[];

  const colorMap = useMemo(() => {
    const m: Record<string,string> = {};
    allData.forEach((w,i) => { m[w.id] = PALETTE[i%PALETTE.length]; });
    return m;
  }, [allData]);

  const [viewMode, setViewMode] = useState<ViewMode>("charts");
  const [chartTab, setChartTab] = useState<ChartTab>("stretch");
  const [hovered, setHovered] = useState<string|null>(null);
  const [search, setSearch] = useState("");
  const [matFilter, setMatFilter] = useState<MatFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [sortBy, setSortBy] = useState<SortKey>("mbs");

  const allStretchIds = useMemo(() =>
    new Set(allData.filter(w => w.stretchCurve && w.stretchCurve.length > 1).map(w => w.id)),
    [allData]);
  const [activeStretchIds, setActiveStretchIds] = useState<Set<string>>(allStretchIds);

  const filtered = useMemo(() => allData
    .filter(w => statusFilter==="all" ? true : statusFilter==="active" ? !w.discontinued : w.discontinued)
    .filter(w => matFilter==="ALL" || w.material.includes(matFilter))
    .filter(w => !search || w.name.toLowerCase().includes(search.toLowerCase()) || (w.brand||"").toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => {
      if (sortBy==="name") return a.name.localeCompare(b.name);
      if (sortBy==="mbs") return (b.mbsKn??0)-(a.mbsKn??0);
      return (a.weightGm??9999)-(b.weightGm??9999);
    }), [allData, search, matFilter, statusFilter, sortBy]);

  const toggleStretch = (id: string) =>
    setActiveStretchIds(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });

  const stats = useMemo(() => ({
    total: allData.length,
    active: allData.filter(w => !w.discontinued).length,
    disc: allData.filter(w => w.discontinued).length,
    stretch: allData.filter(w => w.stretchCurve && w.stretchCurve.length > 1).length,
  }), [allData]);

  const TAB = (mode: ViewMode, label: string) => (
    <button onClick={() => setViewMode(mode)} style={{
      fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
      padding: "16px 24px", border: "none", background: "transparent", cursor: "pointer",
      color: viewMode===mode ? C.blue : C.muted,
      borderBottom: `3px solid ${viewMode===mode ? C.blue : "transparent"}`,
      transition: "all 0.15s",
    }}>{label}</button>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ background: C.navy, borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(1.5rem,5vw,5rem)" }}>
          <div style={{ paddingTop: 36, paddingBottom: 32 }}>
            <a href="/" style={{
              fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.4)",
              textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24,
              transition: "color 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = C.blue)}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >← Slackline Hub</a>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.blue, marginBottom: 10 }}>
                  Gear Database
                </div>
                <h1 style={{
                  fontFamily: FONT, fontWeight: 800, textTransform: "uppercase",
                  fontSize: "clamp(3rem,6vw,6rem)", letterSpacing: "-0.01em",
                  margin: 0, lineHeight: 0.9, color: C.white,
                }}>Webbing<br />Database.</h1>
              </div>

              <div style={{ display: "flex", gap: 28 }}>
                {([
                  [stats.total,"total"],
                  [stats.active,"active"],
                  [stats.disc,"discontinued"],
                  [stats.stretch,"stretch curves"],
                ] as [number,string][]).map(([n,label]) => (
                  <div key={label} style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: FONT, fontSize: "clamp(1.8rem,3vw,3rem)", fontWeight: 800, color: C.blue, lineHeight: 1 }}>{n}</div>
                    <div style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── View tabs ── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(1.5rem,5vw,5rem)", display: "flex", gap: 0 }}>
          {TAB("charts","📊 Charts")}
          {TAB("stretch-table","📋 Stretch Table")}
          {TAB("specs-table","📄 All Specs")}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(1.5rem,3vh,2.5rem) clamp(1.5rem,5vw,5rem) 5rem" }}>

        {/* ── Filters ── */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end",
          marginBottom: 28, padding: "16px 20px",
          background: C.white, border: `1px solid ${C.border}`, borderRadius: 4,
        }}>
          <div style={{ flex: "1 1 180px" }}>
            <div style={monoLabel}>Search</div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name or brand…"
              style={{ width: "100%", fontFamily: "'DM Sans',sans-serif", fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 3, padding: "7px 12px", background: C.bg, color: C.text, boxSizing: "border-box", outline: "none" }}
              onFocus={e => (e.currentTarget.style.borderColor = C.blue)}
              onBlur={e => (e.currentTarget.style.borderColor = C.border)}
            />
          </div>

          <div>
            <div style={monoLabel}>Status</div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["active","all","discontinued"] as StatusFilter[]).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={chip(statusFilter===s)}>
                  {s==="active"?"Active":s==="discontinued"?"DC":"All"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={monoLabel}>Material</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {(["ALL","PL","NY","DY","hybrid"] as MatFilter[]).map(m => (
                <button key={m} onClick={() => setMatFilter(m)} style={chip(matFilter===m)}>
                  {m==="ALL"?"All":MAT_LABELS[m]||m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={monoLabel}>Sort</div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["mbs","weight","name"] as SortKey[]).map(s => (
                <button key={s} onClick={() => setSortBy(s)} style={chip(sortBy===s)}>
                  {s==="mbs"?"MBS ↓":s==="weight"?"Weight ↑":"A–Z"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.muted, marginLeft: "auto", alignSelf: "center", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {filtered.length} / {allData.length}
          </div>
        </div>

        {/* ── Charts ── */}
        {viewMode==="charts" && (
          <div>
            <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
              {(["stretch","mbs","weight"] as ChartTab[]).map(c => (
                <button key={c} onClick={() => setChartTab(c)} style={chip(chartTab===c)}>
                  {c==="stretch"?"Stretch Curves":c==="mbs"?"MBS Comparison":"Weight / m"}
                </button>
              ))}
            </div>

            {chartTab==="stretch" && (
              <div>
                <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <button onClick={() => setActiveStretchIds(new Set(allStretchIds))} style={{ ...chip(false), fontSize: 10, padding: "3px 10px" }}>All on</button>
                  <button onClick={() => setActiveStretchIds(new Set())} style={{ ...chip(false), fontSize: 10, padding: "3px 10px" }}>All off</button>
                  <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: "0.06em" }}>
                    {activeStretchIds.size}/{allStretchIds.size} shown · dashed = discontinued
                  </span>
                </div>
                <StretchChart webbings={allData} hovered={hovered} onHover={setHovered} colorMap={colorMap} activeIds={activeStretchIds}/>
                <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {filtered.filter(w => w.stretchCurve && w.stretchCurve.length > 1).map(w => {
                    const on = activeStretchIds.has(w.id);
                    const col = colorMap[w.id];
                    return (
                      <button key={w.id}
                        onClick={() => toggleStretch(w.id)}
                        onMouseEnter={() => setHovered(w.id)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          fontFamily: FONT, fontSize: 9, fontWeight: 700, padding: "3px 8px",
                          borderRadius: 2, border: `1.5px solid ${col}`,
                          background: on ? col : C.white, color: on ? C.white : col,
                          cursor: "pointer", whiteSpace: "nowrap",
                          opacity: hovered && hovered!==w.id ? 0.25 : 1,
                          transition: "all 0.1s", letterSpacing: "0.04em",
                        }}
                      >{w.name}</button>
                    );
                  })}
                </div>
                <p style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, color: C.muted, marginTop: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Sources: Balance Community · ISA SlackData
                </p>
              </div>
            )}

            {chartTab==="mbs" && (
              <div>
                <MBSChart webbings={filtered}/>
                <p style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, color: C.muted, marginTop: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Green = Dyneema · Blue = Nylon · Orange = Polyester · Purple = Hybrid · Faded = discontinued
                </p>
              </div>
            )}

            {chartTab==="weight" && (
              <div>
                <WeightChart webbings={filtered}/>
                <p style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, color: C.muted, marginTop: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Lightest first · Faded = discontinued · Top 35 shown
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Stretch table ── */}
        {viewMode==="stretch-table" && (
          <div>
            <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {filtered.filter(w => w.stretchCurve && w.stretchCurve.length > 1).length} webbings · Values interpolated where exact kN point not measured
            </p>
            <StretchTable webbings={filtered} colorMap={colorMap}/>
          </div>
        )}

        {/* ── Specs table ── */}
        {viewMode==="specs-table" && (
          <div>
            <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {filtered.length} webbings · Click column headers to sort
            </p>
            <SpecsTable webbings={filtered}/>
          </div>
        )}

        {/* Attribution */}
        <div style={{ marginTop: 48, padding: "14px 18px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 4 }}>
          <p style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, color: C.muted, margin: 0, lineHeight: 1.9, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Data: SlackDB · ISA SlackData · Balance Community · Community-maintained. Always verify MBS and safety specs with the manufacturer before rigging.
          </p>
        </div>
      </div>
    </div>
  );
}
