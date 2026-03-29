import { useState, useMemo, useRef, useCallback } from "react";
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
  DY: { bg:"rgba(16,185,129,0.1)", text:"#059669" },
  NY: { bg:"rgba(26,86,219,0.1)",  text:"#1a56db" },
  PL: { bg:"rgba(245,158,11,0.1)", text:"#d97706" },
  hybrid: { bg:"rgba(139,92,246,0.1)", text:"#7c3aed" },
  VC: { bg:"rgba(239,68,68,0.1)",  text:"#dc2626" },
};

// ─── 30 distinct colors ───────────────────────────────────────────────────────
const PALETTE = [
  "#1a56db","#059669","#d97706","#7c3aed","#dc2626","#0891b2",
  "#be185d","#16a34a","#ea580c","#4f46e5","#0284c7","#9333ea",
  "#15803d","#c2410c","#1d4ed8","#047857","#b45309","#6d28d9",
  "#0369a1","#9f1239","#065f46","#92400e","#3730a3","#164e63",
  "#701a75","#14532d","#7c2d12","#1e1b4b","#083344","#500724",
];

// ─── 10 distinct SVG symbols ──────────────────────────────────────────────────
// Returns a small SVG path string centered at 0,0 with given size
const SYMBOLS = ["circle","square","triangle","diamond","cross","star","hexagon","pentagon","arrow","plus"] as const;
type SymbolType = typeof SYMBOLS[number];

function drawSymbol(sym: SymbolType, cx: number, cy: number, r: number, color: string, opacity = 1): React.ReactNode {
  const s = {stroke: color, fill: color, fillOpacity: opacity, strokeWidth: 0};
  switch(sym) {
    case "circle":
      return <circle cx={cx} cy={cy} r={r} {...s}/>;
    case "square":
      return <rect x={cx-r} y={cy-r} width={r*2} height={r*2} {...s}/>;
    case "triangle":
      return <polygon points={`${cx},${cy-r} ${cx+r*0.87},${cy+r*0.5} ${cx-r*0.87},${cy+r*0.5}`} {...s}/>;
    case "diamond":
      return <polygon points={`${cx},${cy-r} ${cx+r},${cy} ${cx},${cy+r} ${cx-r},${cy}`} {...s}/>;
    case "cross":
      return <g><rect x={cx-r*0.25} y={cy-r} width={r*0.5} height={r*2} fill={color} fillOpacity={opacity}/><rect x={cx-r} y={cy-r*0.25} width={r*2} height={r*0.5} fill={color} fillOpacity={opacity}/></g>;
    case "star":
      return <polygon points={`${cx},${cy-r} ${cx+r*0.35},${cy-r*0.35} ${cx+r},${cy} ${cx+r*0.35},${cy+r*0.35} ${cx},${cy+r} ${cx-r*0.35},${cy+r*0.35} ${cx-r},${cy} ${cx-r*0.35},${cy-r*0.35}`} {...s}/>;
    case "hexagon":
      return <polygon points={[0,1,2,3,4,5].map(i => `${cx+r*Math.cos(i*Math.PI/3-Math.PI/6)},${cy+r*Math.sin(i*Math.PI/3-Math.PI/6)}`).join(" ")} {...s}/>;
    case "pentagon":
      return <polygon points={[0,1,2,3,4].map(i => `${cx+r*Math.cos(i*2*Math.PI/5-Math.PI/2)},${cy+r*Math.sin(i*2*Math.PI/5-Math.PI/2)}`).join(" ")} {...s}/>;
    case "arrow":
      return <polygon points={`${cx},${cy-r} ${cx+r*0.7},${cy+r*0.5} ${cx},${cy+r*0.1} ${cx-r*0.7},${cy+r*0.5}`} {...s}/>;
    case "plus":
      return <g><rect x={cx-r*0.2} y={cy-r} width={r*0.4} height={r*2} fill={color} fillOpacity={opacity}/><rect x={cx-r} y={cy-r*0.2} width={r*2} height={r*0.4} fill={color} fillOpacity={opacity}/></g>;
    default:
      return <circle cx={cx} cy={cy} r={r} {...s}/>;
  }
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

const chip = (active: boolean): React.CSSProperties => ({
  fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em",
  textTransform: "uppercase", padding: "6px 16px", borderRadius: 2, border: "1px solid",
  borderColor: active ? C.blue : C.border,
  background: active ? C.blue : C.white,
  color: active ? C.white : C.muted,
  cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" as const,
});

const monoLabel: React.CSSProperties = {
  fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
  textTransform: "uppercase", color: C.muted, marginBottom: 8,
};

// ─── Stretch Chart with crosshair, symbols, sidebar legend ───────────────────

interface CrosshairData {
  kn: number;
  items: { w: Webbing; val: number; color: string; sym: SymbolType }[];
}

function StretchChart({ webbings, colorMap, symMap, activeIds, onToggle }: {
  webbings: Webbing[];
  colorMap: Record<string, string>;
  symMap: Record<string, SymbolType>;
  activeIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [crosshair, setCrosshair] = useState<CrosshairData | null>(null);

  const visible = webbings.filter(w => activeIds.has(w.id) && w.stretchCurve && w.stretchCurve.length > 1);

  // Chart dimensions
  const VW = 820, VH = 480;
  const PL = 56, PR = 20, PT = 20, PB = 50;
  const CW = VW - PL - PR, CH = VH - PT - PB;
  const MAX_X = 12, MAX_Y = 25;

  const xS = (kn: number) => PL + (kn / MAX_X) * CW;
  const yS = (p: number) => PT + CH - Math.min(1, p / MAX_Y) * CH;

  // Interpolate value at a given kN
  const interp = (w: Webbing, kn: number): number | null => {
    if (!w.stretchCurve) return null;
    const pts = w.stretchCurve.filter(p => p.kn <= 12);
    const exact = pts.find(p => p.kn === kn);
    if (exact) return exact.percent;
    const sorted = [...pts].sort((a, b) => a.kn - b.kn);
    const lo = sorted.filter(p => p.kn <= kn).pop();
    const hi = sorted.find(p => p.kn > kn);
    if (lo && hi) return Math.round((lo.percent + (kn - lo.kn) / (hi.kn - lo.kn) * (hi.percent - lo.percent)) * 100) / 100;
    return null;
  };

  // Mouse move handler — snap to nearest kN
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = VW / rect.width;
    const px = (e.clientX - rect.left) * scaleX;
    const kn = Math.max(0, Math.min(MAX_X, Math.round(((px - PL) / CW) * MAX_X)));
    const items = visible
      .map(w => {
        const val = interp(w, kn);
        if (val === null) return null;
        return { w, val, color: colorMap[w.id], sym: symMap[w.id] };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.val - a.val);
    setCrosshair({ kn, items });
  }, [visible, colorMap, symMap]);

  const handleMouseLeave = () => setCrosshair(null);

  // Symbol positions along each line (every 2 kN)
  const symbolKns = [2, 4, 6, 8, 10, 12];

  return (
    <div style={{ display: "flex", gap: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden" }}>
      {/* Chart area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          style={{ width: "100%", display: "block", cursor: "crosshair" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Grid */}
          {[0,5,10,15,20,25].map(y => (
            <g key={y}>
              <line x1={PL} x2={VW-PR} y1={yS(y)} y2={yS(y)} stroke={C.border} strokeWidth={1}/>
              <text x={PL-8} y={yS(y)+5} fontSize={12} fill={C.muted} textAnchor="end" fontFamily={FONT} fontWeight={700}>{y}%</text>
            </g>
          ))}
          {[0,2,4,6,8,10,12].map(x => (
            <g key={x}>
              <line x1={xS(x)} x2={xS(x)} y1={PT} y2={VH-PB} stroke={C.border} strokeWidth={1}/>
              <text x={xS(x)} y={VH-PB+18} fontSize={12} fill={C.muted} textAnchor="middle" fontFamily={FONT} fontWeight={700}>{x} kN</text>
            </g>
          ))}
          <text x={VW/2} y={VH-6} fontSize={13} fill={C.muted} textAnchor="middle" fontFamily={FONT} fontWeight={700} letterSpacing="0.1em">TENSION (kN)</text>
          <text x={16} y={VH/2} fontSize={13} fill={C.muted} textAnchor="middle" fontFamily={FONT} fontWeight={700} letterSpacing="0.1em" transform={`rotate(-90,16,${VH/2})`}>STRETCH %</text>

          {/* Lines */}
          {visible.map(w => {
            const pts = w.stretchCurve!.filter(p => p.kn <= 12).sort((a,b)=>a.kn-b.kn);
            if (pts.length < 2) return null;
            const col = colorMap[w.id];
            const sym = symMap[w.id];
            const d = pts.map((p,i) => `${i===0?"M":"L"} ${xS(p.kn).toFixed(1)} ${yS(p.percent).toFixed(1)}`).join(" ");
            const isCrosshaired = crosshair !== null;
            const isHighlighted = crosshair?.items.some(it => it.w.id === w.id);
            const opacity = isCrosshaired ? (isHighlighted ? 1 : 0.07) : 0.75;
            const strokeW = isHighlighted ? 3 : 1.5;

            return (
              <g key={w.id}>
                <path d={d} fill="none" stroke={col} strokeWidth={strokeW}
                  strokeOpacity={opacity}
                  strokeDasharray={w.discontinued ? "6 3" : undefined}
                  style={{ transition: "stroke-opacity 0.08s, stroke-width 0.08s" }}
                />
                {/* Symbols at key kN points */}
                {symbolKns.map(kn => {
                  const val = interp(w, kn);
                  if (val === null) return null;
                  return (
                    <g key={kn} opacity={opacity} style={{ transition: "opacity 0.08s" }}>
                      {drawSymbol(sym, xS(kn), yS(val), isHighlighted ? 5 : 3.5, col)}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Crosshair vertical line */}
          {crosshair && (
            <line
              x1={xS(crosshair.kn)} x2={xS(crosshair.kn)}
              y1={PT} y2={VH-PB}
              stroke={C.navy} strokeWidth={1} strokeDasharray="4 3" opacity={0.4}
            />
          )}

          {/* Tooltip: top-3 labels near line ends */}
          {crosshair && crosshair.items.slice(0, 5).map((it, i) => {
            const val = it.val;
            const py = yS(val);
            return (
              <g key={it.w.id}>
                {/* Dot at crosshair intersection */}
                {drawSymbol(it.sym, xS(crosshair.kn), py, 6, it.color)}
                {/* Floating label */}
                {i < 3 && (
                  <g>
                    <rect
                      x={xS(crosshair.kn) + 10}
                      y={py - 11 + i * 22}
                      width={Math.min(180, it.w.name.length * 7.5 + 60)}
                      height={20}
                      rx={3} fill={C.white} stroke={it.color} strokeWidth={1.5}
                    />
                    <text
                      x={xS(crosshair.kn) + 16}
                      y={py + 3 + i * 22}
                      fontSize={11} fill={it.color} fontFamily={FONT} fontWeight={700}
                    >
                      {it.w.name} — {val}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Crosshair readout bar */}
        {crosshair && (
          <div style={{
            background: C.bg, borderTop: `1px solid ${C.border}`,
            padding: "8px 16px",
            display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
          }}>
            <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: C.navy, letterSpacing: "0.08em", marginRight: 8 }}>
              @ {crosshair.kn} kN:
            </span>
            {crosshair.items.slice(0, 8).map(it => (
              <span key={it.w.id} style={{
                fontFamily: FONT, fontSize: 12, fontWeight: 600, color: it.color,
                background: C.white, border: `1px solid ${it.color}`,
                borderRadius: 2, padding: "1px 8px",
              }}>
                {it.w.name} {it.val}%
              </span>
            ))}
            {crosshair.items.length > 8 && (
              <span style={{ fontFamily: FONT, fontSize: 11, color: C.muted }}>
                +{crosshair.items.length - 8} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Sidebar legend — scrollable, toggleable */}
      <div style={{
        width: 200, borderLeft: `1px solid ${C.border}`,
        overflowY: "auto", maxHeight: 480 + 40,
        background: C.white,
      }}>
        <div style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: C.white, zIndex: 1 }}>
          <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Legend
          </span>
        </div>
        {webbings.filter(w => w.stretchCurve && w.stretchCurve.length > 1).map(w => {
          const on = activeIds.has(w.id);
          const col = colorMap[w.id];
          const sym = symMap[w.id];
          return (
            <div
              key={w.id}
              onClick={() => onToggle(w.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 12px", cursor: "pointer",
                background: on ? "rgba(26,86,219,0.04)" : "transparent",
                borderBottom: `1px solid ${C.border}`,
                transition: "background 0.1s",
              }}
              onMouseEnter={e => { if (!on) (e.currentTarget as HTMLDivElement).style.background = C.bg; }}
              onMouseLeave={e => { if (!on) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
            >
              {/* Mini symbol */}
              <svg width={14} height={14} viewBox="-7 -7 14 14" style={{ flexShrink: 0, opacity: on ? 1 : 0.3 }}>
                {drawSymbol(sym, 0, 0, 5, col)}
              </svg>
              <span style={{
                fontFamily: FONT, fontSize: 12, fontWeight: 600,
                color: on ? C.navy : C.muted,
                textDecoration: w.discontinued ? "line-through" : "none",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                flex: 1, minWidth: 0,
              }}>{w.name}</span>
            </div>
          );
        })}
      </div>
    </div>
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
    const s = [...w.stretchCurve].sort((a,b)=>a.kn-b.kn);
    const lo = s.filter(p=>p.kn<=kn).pop();
    const hi = s.find(p=>p.kn>kn);
    if (lo && hi) return Math.round((lo.percent+(kn-lo.kn)/(hi.kn-lo.kn)*(hi.percent-lo.percent))*100)/100;
    return null;
  };

  const th: React.CSSProperties = {
    padding: "11px 12px", fontFamily: FONT, fontSize: 12, fontWeight: 700,
    letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted,
    borderBottom: `2px solid ${C.border}`, whiteSpace: "nowrap", textAlign: "left", background: C.white,
  };
  const td: React.CSSProperties = {
    padding: "9px 12px", fontFamily: FONT, fontSize: 13, fontWeight: 500,
    borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", color: C.text,
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 700, background: C.white, border: `1px solid ${C.border}` }}>
        <thead>
          <tr>
            <th style={{ ...th, position: "sticky", left: 0, minWidth: 170, zIndex: 2 }}>Webbing</th>
            <th style={{ ...th, minWidth: 120 }}>Brand</th>
            {kns.map(kn => <th key={kn} style={{ ...th, textAlign: "center", minWidth: 58 }}>{kn} kN</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((w,i) => (
            <tr key={w.id} style={{ background: i%2===0 ? C.white : C.bg }}>
              <td style={{ ...td, position: "sticky", left: 0, background: i%2===0 ? C.white : C.bg, zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: colorMap[w.id], flexShrink: 0 }}/>
                  <span style={{ color: w.discontinued ? C.muted : C.text, fontStyle: w.discontinued ? "italic" : "normal" }}>{w.name}</span>
                  {w.discontinued && <span style={{ fontSize: 10, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 2, padding: "0 4px" }}>DC</span>}
                </div>
              </td>
              <td style={{ ...td, color: C.muted, fontSize: 12 }}>{w.brand||"—"}</td>
              {kns.map(kn => {
                const val = getVal(w, kn);
                const intensity = val!=null ? Math.min(1,val/25) : 0;
                const col = colorMap[w.id];
                const r = parseInt(col.slice(1,3),16), g = parseInt(col.slice(3,5),16), b = parseInt(col.slice(5,7),16);
                return (
                  <td key={kn} style={{
                    ...td, textAlign: "center",
                    background: val!=null&&val>0 ? `rgba(${r},${g},${b},${0.04+intensity*0.14})` : undefined,
                    fontWeight: val!=null ? 700 : 400,
                    color: val!=null ? C.text : C.muted,
                  }}>
                    {val!=null ? `${val}%` : "—"}
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
    if (sortCol===col) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const sorted = useMemo(() => [...webbings].sort((a,b) => {
    let va: string|number=0, vb: string|number=0;
    if (sortCol==="name") { va=a.name; vb=b.name; }
    else if (sortCol==="brand") { va=a.brand||""; vb=b.brand||""; }
    else if (sortCol==="mbsKn") { va=a.mbsKn??-1; vb=b.mbsKn??-1; }
    else if (sortCol==="weightGm") { va=a.weightGm??9999; vb=b.weightGm??9999; }
    else if (sortCol==="widthMm") { va=a.widthMm??0; vb=b.widthMm??0; }
    if (typeof va==="string") return sortDir==="asc" ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
    return sortDir==="asc" ? va-(vb as number) : (vb as number)-va;
  }), [webbings, sortCol, sortDir]);

  const th: React.CSSProperties = {
    padding: "11px 12px", fontFamily: FONT, fontSize: 12, fontWeight: 700,
    letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted,
    borderBottom: `2px solid ${C.border}`, whiteSpace: "nowrap", textAlign: "left",
    background: C.white, cursor: "pointer",
  };
  const td: React.CSSProperties = {
    padding: "9px 12px", fontFamily: FONT, fontSize: 13, fontWeight: 500,
    borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", color: C.text,
  };

  const SH = ({ col, label }: { col: string; label: string }) => (
    <th style={th} onClick={() => handleSort(col)}
      onMouseEnter={e=>(e.currentTarget.style.color=C.blue)}
      onMouseLeave={e=>(e.currentTarget.style.color=C.muted)}
    >{label}{sortCol===col ? (sortDir==="asc"?" ↑":" ↓") : ""}</th>
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900, background: C.white, border: `1px solid ${C.border}` }}>
        <thead>
          <tr>
            <SH col="name" label="Name"/>
            <SH col="brand" label="Brand"/>
            <th style={{ ...th, cursor: "default" }}>Material</th>
            <th style={{ ...th, cursor: "default" }}>Type</th>
            <SH col="widthMm" label="Width"/>
            <SH col="mbsKn" label="MBS"/>
            <th style={{ ...th, cursor: "default" }}>WLL</th>
            <SH col="weightGm" label="Weight"/>
            <th style={{ ...th, cursor: "default" }}>Stretch</th>
            <th style={{ ...th, cursor: "default" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((w,i) => {
            const mc = MAT_COLORS[w.material[0]]||{bg:"rgba(0,0,0,0.04)",text:C.muted};
            return (
              <tr key={w.id} style={{ background: i%2===0 ? C.white : C.bg }}>
                <td style={{ ...td, color: w.discontinued?C.muted:C.text, fontStyle: w.discontinued?"italic":"normal" }}>
                  {w.url
                    ? <a href={w.url} target="_blank" rel="noopener noreferrer" style={{ color:"inherit", textDecoration:"none" }}
                        onMouseEnter={e=>(e.currentTarget.style.color=C.blue)}
                        onMouseLeave={e=>(e.currentTarget.style.color=w.discontinued?C.muted:C.text)}
                      >{w.name} ↗</a>
                    : w.name}
                </td>
                <td style={{ ...td, color:C.muted, fontSize:12 }}>{w.brand||"—"}</td>
                <td style={td}>
                  <span style={{ background:mc.bg, color:mc.text, borderRadius:2, padding:"2px 7px", fontSize:11, fontWeight:700, letterSpacing:"0.06em" }}>
                    {w.material.map(m=>MAT_LABELS[m]||m).join("+")}
                  </span>
                </td>
                <td style={{ ...td, color:C.muted }}>{w.webbingType?(TYPE_LABELS[w.webbingType]||w.webbingType):"—"}</td>
                <td style={{ ...td, textAlign:"center" }}>{w.widthMm!=null?`${w.widthMm}mm`:"—"}</td>
                <td style={{ ...td, textAlign:"center", fontWeight:w.mbsKn?800:500, color:w.mbsKn?C.navy:C.muted }}>{w.mbsKn!=null?`${w.mbsKn} kN`:"—"}</td>
                <td style={{ ...td, textAlign:"center" }}>{w.wllKn!=null?`${w.wllKn} kN`:"—"}</td>
                <td style={{ ...td, textAlign:"center" }}>{w.weightGm!=null?`${w.weightGm}`:"—"}</td>
                <td style={{ ...td, textAlign:"center" }}>
                  {w.stretchCurve&&w.stretchCurve.length>1
                    ? <span style={{ color:"#059669", fontSize:11, fontWeight:700 }}>✓ {w.stretchCurve.length}pt</span>
                    : w.stretchCurve?.length===1
                    ? <span style={{ color:"#d97706", fontSize:11, fontWeight:700 }}>~ {w.stretchCurve[0].percent}%</span>
                    : <span style={{ color:C.muted, fontSize:11 }}>—</span>}
                </td>
                <td style={td}>
                  <span style={{
                    fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase",
                    padding:"2px 8px", borderRadius:2,
                    background:w.discontinued?"rgba(0,0,0,0.05)":"rgba(16,185,129,0.1)",
                    color:w.discontinued?C.muted:"#059669",
                  }}>{w.discontinued?"Discontinued":"Active"}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "charts"|"stretch-table"|"specs-table";
type StatusFilter = "all"|"active"|"discontinued";
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

  // Assign symbols cycling through 10 shapes
  const symMap = useMemo(() => {
    const m: Record<string, SymbolType> = {};
    allData.forEach((w,i) => { m[w.id] = SYMBOLS[i % SYMBOLS.length]; });
    return m;
  }, [allData]);

  const [viewMode, setViewMode] = useState<ViewMode>("charts");
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
    active: allData.filter(w=>!w.discontinued).length,
    disc: allData.filter(w=>w.discontinued).length,
    stretch: allData.filter(w=>w.stretchCurve&&w.stretchCurve.length>1).length,
  }), [allData]);

  const TAB = (mode: ViewMode, label: string) => (
    <button onClick={()=>setViewMode(mode)} style={{
      fontFamily: FONT, fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
      padding: "16px 24px", border: "none", background: "transparent", cursor: "pointer",
      color: viewMode===mode ? C.blue : C.muted,
      borderBottom: `3px solid ${viewMode===mode ? C.blue : "transparent"}`,
      transition: "all 0.15s",
    }}>{label}</button>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>

      {/* ── Header ── */}
      <div style={{ background: C.navy, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 clamp(1.5rem,4vw,4rem)" }}>
          <div style={{ paddingTop: 36, paddingBottom: 32 }}>
            <a href="/" style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24, transition: "color 0.15s" }}
              onMouseEnter={e=>(e.currentTarget.style.color=C.blue)}
              onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.4)")}
            >← Slackline Hub</a>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.blue, marginBottom: 10 }}>Gear Database</div>
                <h1 style={{ fontFamily: FONT, fontWeight: 800, textTransform: "uppercase", fontSize: "clamp(3rem,6vw,6rem)", letterSpacing: "-0.01em", margin: 0, lineHeight: 0.9, color: C.white }}>
                  Webbing<br/>Database.
                </h1>
              </div>
              <div style={{ display: "flex", gap: 32 }}>
                {([
                  [stats.total,"total"],
                  [stats.active,"active"],
                  [stats.disc,"discontinued"],
                  [stats.stretch,"stretch curves"],
                ] as [number,string][]).map(([n,label]) => (
                  <div key={label} style={{ textAlign:"right" }}>
                    <div style={{ fontFamily: FONT, fontSize: "clamp(1.8rem,3vw,3rem)", fontWeight: 800, color: C.blue, lineHeight: 1 }}>{n}</div>
                    <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── View tabs ── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 clamp(1.5rem,4vw,4rem)", display: "flex" }}>
          {TAB("charts","📊 Stretch Chart")}
          {TAB("stretch-table","📋 Stretch Table")}
          {TAB("specs-table","📄 All Specs")}
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "clamp(1.5rem,3vh,2rem) clamp(1.5rem,4vw,4rem) 5rem" }}>

        {/* ── Filters ── */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-end",
          marginBottom: 24, padding: "18px 20px",
          background: C.white, border: `1px solid ${C.border}`, borderRadius: 4,
        }}>
          {/* Search */}
          <div style={{ flex: "1 1 200px" }}>
            <div style={monoLabel}>Search</div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name or brand…"
              style={{ width: "100%", fontFamily: "'DM Sans',sans-serif", fontSize: 14, border: `1px solid ${C.border}`, borderRadius: 3, padding: "8px 12px", background: C.bg, color: C.text, boxSizing: "border-box", outline: "none" }}
              onFocus={e=>(e.currentTarget.style.borderColor=C.blue)}
              onBlur={e=>(e.currentTarget.style.borderColor=C.border)}
            />
          </div>

          {/* Status — All first, then Active, then Discontinued */}
          <div>
            <div style={monoLabel}>Status</div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["all","active","discontinued"] as StatusFilter[]).map(s => (
                <button key={s} onClick={()=>setStatusFilter(s)} style={chip(statusFilter===s)}>
                  {s==="all" ? "All" : s==="active" ? "Active" : "Discontinued"}
                </button>
              ))}
            </div>
          </div>

          {/* Material */}
          <div>
            <div style={monoLabel}>Material</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {(["ALL","PL","NY","DY","hybrid"] as MatFilter[]).map(m => (
                <button key={m} onClick={()=>setMatFilter(m)} style={chip(matFilter===m)}>
                  {m==="ALL"?"All":MAT_LABELS[m]||m}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <div style={monoLabel}>Sort</div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["mbs","weight","name"] as SortKey[]).map(s => (
                <button key={s} onClick={()=>setSortBy(s)} style={chip(sortBy===s)}>
                  {s==="mbs"?"MBS ↓":s==="weight"?"Weight ↑":"A–Z"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: C.muted, marginLeft: "auto", alignSelf: "center", letterSpacing: "0.08em" }}>
            {filtered.length} / {allData.length}
          </div>
        </div>

        {/* ── Stretch chart ── */}
        {viewMode==="charts" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={()=>setActiveStretchIds(new Set(allStretchIds))} style={{ ...chip(false), fontSize: 12 }}>All on</button>
              <button onClick={()=>setActiveStretchIds(new Set())} style={{ ...chip(false), fontSize: 12 }}>All off</button>
              {/* Filter-specific toggles */}
              <button onClick={() => {
                const ids = new Set(filtered.filter(w=>w.stretchCurve&&w.stretchCurve.length>1).map(w=>w.id));
                setActiveStretchIds(ids);
              }} style={{ ...chip(false), fontSize: 12 }}>Show filtered only</button>
              <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: "0.06em" }}>
                {activeStretchIds.size}/{allStretchIds.size} shown · dashed = discontinued · hover chart for values
              </span>
            </div>
            <StretchChart
              webbings={allData}
              colorMap={colorMap}
              symMap={symMap}
              activeIds={activeStretchIds}
              onToggle={toggleStretch}
            />
            <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.muted, marginTop: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Sources: Balance Community · ISA SlackData · Click legend to toggle · Hover chart for values
            </p>
          </div>
        )}

        {/* ── Stretch table ── */}
        {viewMode==="stretch-table" && (
          <div>
            <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {filtered.filter(w=>w.stretchCurve&&w.stretchCurve.length>1).length} webbings · Values interpolated where exact kN point not measured
            </p>
            <StretchTable webbings={filtered} colorMap={colorMap}/>
          </div>
        )}

        {/* ── Specs table ── */}
        {viewMode==="specs-table" && (
          <div>
            <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {filtered.length} webbings · Click column headers to sort
            </p>
            <SpecsTable webbings={filtered}/>
          </div>
        )}

        <div style={{ marginTop: 48, padding: "14px 18px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 4 }}>
          <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.muted, margin: 0, lineHeight: 1.9, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Data: SlackDB · ISA SlackData · Balance Community · Community-maintained. Always verify MBS and safety specs with the manufacturer before rigging.
          </p>
        </div>
      </div>
    </div>
  );
}
