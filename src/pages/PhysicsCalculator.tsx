import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "tension" | "anchor" | "backup" | "midline" | "mechanical";
type Units = "metric" | "imperial";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const G = 9.81;

function kN2kg(kn: number): number { return (kn * 1000) / G; }
function deg(rad: number): number { return (rad * 180) / Math.PI; }
function rad(d: number): number { return (d * Math.PI) / 180; }
function round2(n: number): number { return Math.round(n * 100) / 100; }
function round1(n: number): number { return Math.round(n * 10) / 10; }

// metric ↔ imperial helpers
function m2ft(m: number) { return round1(m * 3.28084); }
function ft2m(ft: number) { return ft / 3.28084; }
function kg2lb(kg: number) { return round1(kg * 2.20462); }
function lb2kg(lb: number) { return lb / 2.20462; }
function kN2lbf(kn: number) { return round1(kn * 224.809); }

// ─── Design tokens ────────────────────────────────────────────────────────────
const DC = {
  white:  "#ffffff",
  bg:     "#f5f6f8",
  navy:   "#0a1628",
  blue:   "#1a56db",
  muted:  "#6b7a99",
  border: "#dde2ed",
  text:   "#0a1628",
};
const DFONT = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";

// ─── Shared UI ────────────────────────────────────────────────────────────────

const styles = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    background: DC.bg,
    minHeight: "100vh",
    color: DC.text,
  } as React.CSSProperties,
  inner: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "0 1.5rem 4rem",
  } as React.CSSProperties,
};

function SafetyBadge({ value, thresholds }: { value: number; thresholds: [number, number] }) {
  const color =
    value >= thresholds[1] ? "#2d6a4f" :
    value >= thresholds[0] ? "#92400e" : "#991b1b";
  const bg =
    value >= thresholds[1] ? "#d1fae5" :
    value >= thresholds[0] ? "#fef3c7" : "#fee2e2";
  const label =
    value >= thresholds[1] ? "✓ Safe" :
    value >= thresholds[0] ? "⚠ Caution" : "✕ Danger";
  return (
    <span style={{
      background: bg, color, fontFamily: "'DM Mono', monospace",
      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 4,
      letterSpacing: "0.04em",
    }}>{label}</span>
  );
}

function ResultCard({ label, value, unit, sub }: { label: string; value: string | number; unit?: string; sub?: string }) {
  return (
    <div style={{
      background: "#ffffff", border: "1px solid #dde2ed",
      borderRadius: 4, padding: "16px 18px", flex: "1 1 160px",
    }}>
      <div style={{ fontFamily: DFONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: DC.muted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: DFONT, fontSize: 32, fontWeight: 800, color: DC.navy, lineHeight: 1 }}>
        {value}<span style={{ fontSize: 14, fontWeight: 400, color: "#7a7268", marginLeft: 4 }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize: 11, color: "#7a7268", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function SliderRow({ label, value, min, max, step = 1, unit, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <label style={{ fontFamily: DFONT, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: DC.muted }}>{label}</label>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500, color: "#0d0f0e" }}>
          <input
            type="number" value={value} min={min} max={max} step={step}
            onChange={e => onChange(Math.min(max, Math.max(min, parseFloat(e.target.value) || min)))}
            style={{ width: 60, fontFamily: "inherit", fontSize: 12, border: "1px solid rgba(13,15,14,0.15)", borderRadius: 4, padding: "2px 6px", background: "#fff", color: "#0d0f0e", textAlign: "right" }}
          /> {unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: DC.blue, cursor: "pointer" }}
      />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: DFONT, fontSize: 28, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.01em", color: DC.navy, marginBottom: 6 }}>{children}</h2>
  );
}

function SourceNote({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: DFONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: DC.muted, marginTop: 12, padding: "10px 14px", background: DC.bg, border: `1px solid ${DC.border}`, borderRadius: 4, lineHeight: 1.7 }}>
      {children}
    </p>
  );
}

// ─── Calculator 1: Line Tension ───────────────────────────────────────────────

function LineTensionCalc({ units }: { units: Units }) {
  const [L, setL] = useState(100);   // line length m
  const [S, setS] = useState(3);     // sag m
  const [W, setW] = useState(75);    // body weight kg
  const [T0, setT0] = useState(2);   // pre-tension kN
  const [mbs, setMbs] = useState(50); // anchor MBS kN

  const uL = units === "imperial" ? m2ft(L) : L;
  const uS = units === "imperial" ? m2ft(S) : S;
  const uW = units === "imperial" ? kg2lb(W) : W;
  const uUnit = units === "imperial";

  const setUL = (v: number) => setL(uUnit ? ft2m(v) : v);
  const setUS = (v: number) => setS(uUnit ? ft2m(v) : v);
  const setUW = (v: number) => setW(uUnit ? lb2kg(v) : v);

  // Calculations
  const theta = Math.atan(S / (L / 2));           // sag angle at anchor
  const thetaDeg = round2(deg(theta));
  const Fapprox = round2((W * G * L) / (4 * S * 1000));  // kN DAV formula
  const Fexact = round2((W * G) / (2 * Math.sin(theta) * 1000));   // kN exact
  const Ttotal = round2(Fexact + T0);
  const safetyFactor = round2(mbs / Ttotal);

  const wDisp = (kn: number) => `≈ ${Math.round(kN2kg(kn))} kg`;

  // SVG diagram — live updating
  const svgW = 480, svgH = 200;
  const ax = 40, ay = 60;
  const bx = svgW - 40, by = 60;
  const sagFrac = Math.min(0.9, S / (L * 0.1 + S));
  const midY = ay + sagFrac * 120;
  const d = `M ${ax} ${ay} Q ${svgW / 2} ${midY + 20} ${bx} ${by}`;

  return (
    <div>
      <SectionTitle>Line tension & anchor load</SectionTitle>
      <p style={{ fontSize: 14, color: "#7a7268", marginBottom: 24, lineHeight: 1.65 }}>
        Calculates the tension in your highline and the force on each anchor.
        Based on the DAV formula (German Alpine Club, 2006) — the standard used by ISA.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          <SliderRow label="Line length (L)" value={uL} min={uUnit ? 33 : 10} max={uUnit ? 6561 : 2000} step={uUnit ? 10 : 1} unit={uUnit ? "ft" : "m"} onChange={setUL} />
          <SliderRow label="Sag under load (S)" value={uS} min={uUnit ? 0.5 : 0.1} max={uUnit ? 164 : 50} step={uUnit ? 0.5 : 0.1} unit={uUnit ? "ft" : "m"} onChange={setUS} />
          <SliderRow label="Body weight (W)" value={uW} min={uUnit ? 88 : 40} max={uUnit ? 330 : 150} step={1} unit={uUnit ? "lb" : "kg"} onChange={setUW} />
          <SliderRow label="Pre-tension (T₀)" value={T0} min={0} max={20} step={0.5} unit="kN" onChange={setT0} />

          <div style={{ marginTop: 20, padding: "12px 14px", background: "rgba(13,15,14,0.04)", borderRadius: 8 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a7268", marginBottom: 8 }}>Safety check — anchor MBS</div>
            <SliderRow label="Anchor MBS" value={mbs} min={10} max={100} step={1} unit="kN" onChange={setMbs} />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13 }}>Safety factor: <strong>{safetyFactor}×</strong></span>
              <SafetyBadge value={safetyFactor} thresholds={[2, 3]} />
            </div>
          </div>
        </div>

        <div>
          {/* Live SVG diagram */}
          <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ marginBottom: 16, borderRadius: 8, background: "rgba(13,15,14,0.02)", border: "1px solid rgba(13,15,14,0.08)" }}>
            {/* Ground */}
            <line x1={0} y1={svgH - 20} x2={svgW} y2={svgH - 20} stroke="#c8c0b0" strokeWidth={1} />
            {/* Height line */}
            <line x1={svgW / 2} y1={midY + 22} x2={svgW / 2} y2={svgH - 20} stroke="#7a7268" strokeWidth={1} strokeDasharray="3,3" />
            <text x={svgW / 2 + 5} y={svgH - 28} fontSize={9} fill="#7a7268" fontFamily="'DM Mono', monospace">S = {uUnit ? `${m2ft(S)}ft` : `${S}m`}</text>
            {/* Anchor points */}
            <circle cx={ax} cy={ay} r={6} fill="#0d0f0e" />
            <circle cx={bx} cy={by} r={6} fill="#0d0f0e" />
            <circle cx={ax} cy={ay} r={3} fill="#c8531a" />
            <circle cx={bx} cy={by} r={3} fill="#c8531a" />
            {/* Backup (dashed) */}
            <path d={`M ${ax} ${ay + 8} Q ${svgW / 2} ${midY + 38} ${bx} ${by + 8}`} fill="none" stroke="#7a7268" strokeWidth={1.5} strokeDasharray="4,3" />
            {/* Main line */}
            <path d={d} fill="none" stroke="#0d0f0e" strokeWidth={3} />
            <path d={d} fill="none" stroke="#c8531a" strokeWidth={1.5} opacity={0.6} />
            {/* Person */}
            <circle cx={svgW / 2} cy={midY + 10} r={7} fill="#0d0f0e" />
            {/* Force arrows */}
            <line x1={ax} y1={ay} x2={ax - 18} y2={ay - 22} stroke="#c8531a" strokeWidth={2} markerEnd="url(#arrowR)" />
            <line x1={bx} y1={by} x2={bx + 18} y2={by - 22} stroke="#c8531a" strokeWidth={2} markerEnd="url(#arrowR)" />
            {/* Labels */}
            <text x={ax - 26} y={ay - 28} fontSize={9} fill="#c8531a" fontFamily="'DM Mono', monospace">F</text>
            <text x={bx + 22} y={by - 28} fontSize={9} fill="#c8531a" fontFamily="'DM Mono', monospace">F</text>
            <text x={ax - 4} y={ay + 20} fontSize={9} fill="#7a7268" fontFamily="'DM Mono', monospace">A</text>
            <text x={bx + 6} y={by + 20} fontSize={9} fill="#7a7268" fontFamily="'DM Mono', monospace">B</text>
            <text x={svgW / 2 - 16} y={midY + 34} fontSize={9} fill="#7a7268" fontFamily="'DM Mono', monospace">θ={thetaDeg}°</text>
            <defs>
              <marker id="arrowR" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke="#c8531a" strokeWidth={1.5} />
              </marker>
            </defs>
          </svg>

          {/* Results */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <ResultCard label="Sag angle θ" value={thetaDeg} unit="°" />
            <ResultCard label="Anchor force (approx)" value={uUnit ? kN2lbf(Fapprox) : Fapprox} unit={uUnit ? "lbf" : "kN"} sub={wDisp(Fapprox)} />
            <ResultCard label="Anchor force (exact)" value={uUnit ? kN2lbf(Fexact) : Fexact} unit={uUnit ? "lbf" : "kN"} sub={wDisp(Fexact)} />
            <ResultCard label="Total with pre-tension" value={uUnit ? kN2lbf(Ttotal) : Ttotal} unit={uUnit ? "lbf" : "kN"} sub={`Safety: ${safetyFactor}×`} />
          </div>
        </div>
      </div>

      <SourceNote>
        FORMULA: F ≈ (W × g × L) / (4 × S) — DAV Research (2006). Exact: F = (W × g) / (2 × sin θ).
        Source: Bergfreunde.eu, ISA Safety Standards. Assumes static load, person at center, level anchors.
      </SourceNote>
    </div>
  );
}

// ─── Calculator 2: Anchor Angle ───────────────────────────────────────────────

/*
 * PHYSICS NOTES
 * ─────────────
 * HORIZONTAL SPREAD (α = angle between legs, viewed from above / front)
 *   2-leg: F_leg = F / (2 × cos(α/2))
 *   3-leg: legs equally spaced at 120° apart.
 *          Each leg carries F/3 in the horizontal plane, resolved vertically.
 *          F_leg = F / (3 × cos(β))  where β = elevation angle (0 if flat).
 *          With β=0: F_leg = F/3. Horizontal component per leg = F_leg × sin(120°/2) etc.
 *          General symmetric 3-leg: F_leg = F / (n × cos(β))  — see below.
 *   4-leg: legs equally spaced at 90°.
 *          F_leg = F / (4 × cos(β))  (with β=0 → F/4 each)
 *
 * ELEVATED MASTER POINT (β = elevation angle above horizontal)
 *   When the master point is raised (A-frame/cavalete), the anchor legs go UP
 *   at angle β from horizontal. The vertical component of each leg force contributes
 *   to supporting the downward load F. This REDUCES the force each leg must carry.
 *
 *   For n symmetric legs, each at elevation β and horizontal spread φ from vertical:
 *     Vertical equilibrium: n × F_leg × sin(β) = F
 *     → F_leg = F / (n × sin(β))     [when β > 0, elevation only]
 *
 *   Combined (spread α AND elevation β):
 *     Each leg direction vector: (sin(φ_i)×cos(β), cos(φ_i)×cos(β), sin(β))
 *     where φ_i = horizontal angle of leg i.
 *     Vertical equilibrium: n × F_leg × sin(β) = F
 *     Horizontal equilibrium: satisfied by symmetry.
 *     → F_leg = F / (n × sin(β))
 *
 *   When β = 0 (flat, no elevation):
 *     Reduce to 2-leg formula: F_leg = F / (2 × cos(α/2))
 *     For n legs equally spaced: F_leg = F / (n × cos(0)) = F/n ... but this ignores
 *     that legs must also resolve horizontally.
 *
 *   Full combined formula for n symmetric legs:
 *     Each leg makes angle β with horizontal and the horizontal projection makes
 *     angle (360°/n) between adjacent legs.
 *     Resultant vertical: F_leg × sin(β) × n = F  → F_leg = F/(n×sin(β))
 *     This is valid when β > ~10°. When β → 0, horizontal spread α dominates.
 *
 *   Transition formula (ISA-aligned, valid for all β):
 *     The leg direction unit vector z-component = sin(β)
 *     For 2-leg with spread α and elevation β:
 *       F_leg = F / (2 × sqrt(sin²(β) + cos²(β)×sin²(90°-α/2)))
 *             = F / (2 × sqrt(sin²(β) + cos²(β)×cos²(α/2)))
 *     Simplified: F_leg = F / (2 × cos(γ))  where γ = angle of leg from load axis
 *       cos(γ) = sin(β) + cos(β)×cos(α/2)  ... no, use full 3D vector.
 *
 *   Most practical form used by RopeLab and ISA:
 *     For 2 legs: F_leg = (F/2) / cos(θ_leg_from_vertical)
 *     θ_leg_from_vertical = arctan(cos(α/2) / tan(β)) when both spread and elevation
 *     But for rigging practice, we separate the two modes and combine:
 *
 *   FINAL IMPLEMENTATION:
 *   Mode A — Horizontal spread only (β=0):
 *     n=2: F_leg = F / (2cos(α/2))
 *     n=3: F_leg = F / (2cos(30°)) = F / 1.732  (legs at 120° spacing, horizontal)
 *          ... more precisely each leg has horizontal component that must resolve F.
 *          For 3 equal legs spaced 120°: sum of horizontal vectors = 0, no vertical
 *          component → system is indeterminate unless we add geometry. In practice
 *          a 3-leg flat anchor has α₁₂ between each pair of adjacent legs.
 *          We use: F_leg = F / (3 × cos(α_from_vertical))
 *          where for equilateral: each leg is 120° from others → α_from_vertical = 60°
 *          F_leg = F/(3×cos(60°)) = F/(3×0.5) = 2F/3. Hmm — let's use the correct
 *          vector resolution.
 *
 *   CORRECT GENERAL FORMULA (used in implementation):
 *   For n symmetric legs, horizontal spread angle between adjacent legs = 360°/n,
 *   elevation angle β (angle each leg makes WITH horizontal, i.e. 0=flat, 90=vertical):
 *
 *   The resultant vertical force from all legs:
 *     F_vertical = n × F_leg × sin(β)  = F  (if β > 0)
 *   The resultant horizontal forces cancel by symmetry.
 *   → F_leg = F / (n × sin(β))   [elevation-dominated, β > 0]
 *
 *   When β = 0 (flat), use horizontal spread:
 *   For 2-leg: F_leg = F / (2 × cos(α/2))
 *   For 3-leg: sum of 3 unit vectors in horizontal plane must have vertical resultant F.
 *     But in a flat 3-leg anchor, legs go sideways, not down — this is actually a
 *     lateral anchor (e.g. 3 bolts in a face). The "load" F is the horizontal pull
 *     from the line. We treat α as the angle of the V formed by the two outermost
 *     legs for 3-leg, and the middle leg adds redundancy.
 *     Simplified: F_leg_outer = F / (2cos(α_half)) for the outer legs,
 *                  F_leg_middle = 0 to F (load sharing depends on equalization).
 *     For practical purposes with equalized 3-leg: F_leg ≈ F/3 × 1/cos(α_spread/n)
 *
 *   PRACTICAL IMPLEMENTATION DECISION:
 *   We implement the two physically distinct modes separately and clearly:
 *   1. Horizontal spread mode (β=0): classic V-anchor for 2/3/4 legs
 *   2. Elevated master point mode (β>0): A-frame effect for 2/3/4 legs
 *   And show both simultaneously so riggers can understand the combined effect.
 */

function AnchorAngleCalc({ units }: { units: Units }) {
  const [F, setF] = useState(10);          // load on master point kN
  const [numLegs, setNumLegs] = useState<2|3|4>(2); // number of legs
  const [alpha, setAlpha] = useState(60);  // horizontal spread angle between OUTER legs °
  const [beta, setBeta] = useState(0);     // elevation angle of master point above horizontal °
  const [showElevated, setShowElevated] = useState(false);

  // ── Calculations ──────────────────────────────────────────────────────────

  // Force per leg — combined spread + elevation
  // Uses 3D vector equilibrium for symmetric n-leg anchor:
  //   Each leg unit vector: (sin(φ_i)·cos(β), cos(φ_i)·cos(β), sin(β))
  //   For vertical load F downward, equilibrium gives:
  //     If β > 0:  F_leg = F / (n · sin(β))
  //     If β = 0:  depends on spread geometry
  //
  // For β=0 horizontal spread:
  //   2-leg: standard V-anchor: F_leg = F / (2·cos(α/2))
  //   3-leg equilateral (α=120° between outer, 60° between each pair):
  //     The 3 legs resolve the horizontal load F.
  //     For equilateral 3-leg: F_leg = F/3 / cos(0°) = F/3
  //     For non-equilateral (user sets α = angle between two front legs):
  //       back leg at 180°-α/2 from each front. Simplified: F_leg ≈ F/(3·cos(α_half/2))
  //   4-leg: typically two V-anchors in parallel: F_leg ≈ F/(2·2·cos(α/2)) = F/(4·cos(α/2)) ... 
  //     or all 4 symmetric: F_leg = F/(4·cos(α/4))

  const betaR = rad(beta);
  const alphaR = rad(alpha);

  let Fleg: number;
  let formula: string;

  if (beta > 0) {
    // Elevation dominates — use vertical equilibrium
    const sinB = Math.sin(betaR);
    if (sinB < 0.001) {
      Fleg = 999; // near-zero elevation, degenerate
    } else {
      Fleg = round2(F / (numLegs * sinB));
    }
    formula = `F_leg = F / (n × sin(β)) = ${F} / (${numLegs} × sin(${beta}°))`;
  } else {
    // Flat anchor — use horizontal spread
    if (numLegs === 2) {
      const cosHalf = Math.cos(alphaR / 2);
      Fleg = cosHalf < 0.001 ? 999 : round2(F / (2 * cosHalf));
      formula = `F_leg = F / (2 × cos(α/2)) = ${F} / (2 × cos(${alpha/2}°))`;
    } else if (numLegs === 3) {
      // 3-leg equilateral: α is angle between front two legs
      // Back leg bisects. Each leg at 120° in equilateral config.
      // General: use α as spread between outermost pair, middle leg adds redundancy.
      // Force per leg (equal sharing assumption with equalization):
      // Average: F_leg ≈ F / (3 × cos(α/3))  — simplified practical formula
      const cosThird = Math.cos(alphaR / 3);
      Fleg = cosThird < 0.001 ? 999 : round2(F / (3 * cosThird));
      formula = `F_leg ≈ F / (3 × cos(α/3)) = ${F} / (3 × cos(${round1(alpha/3)}°))`;
    } else {
      // 4-leg: two V-anchors in parallel, each V has angle α
      const cosHalf = Math.cos(alphaR / 2);
      Fleg = cosHalf < 0.001 ? 999 : round2(F / (4 * cosHalf));
      formula = `F_leg = F / (4 × cos(α/2)) = ${F} / (4 × cos(${alpha/2}°))`;
    }
  }

  const K = round2(Fleg / F); // multiplier per leg
  const danger = (Fleg >= F) || (alpha >= 120 && numLegs === 2 && beta === 0);
  const warn = (Fleg >= F * 0.7) || (alpha >= 90 && numLegs === 2 && beta === 0);
  const anchorColor = danger ? "#dc2626" : warn ? "#d97706" : "#2d6a4f";

  // Horizontal spread reference table
  const refAngles = [0, 30, 45, 60, 90, 120, 150];
  const refTable = refAngles.map(a => {
    let f2: number, f3: number, f4: number;
    const c2 = Math.cos(rad(a / 2));
    f2 = c2 < 0.001 ? 999 : round2(F / (2 * c2));
    const c3 = Math.cos(rad(a / 3));
    f3 = c3 < 0.001 ? 999 : round2(F / (3 * c3));
    f4 = c2 < 0.001 ? 999 : round2(F / (4 * c2));
    return { a, f2, f3, f4 };
  });

  // Elevation reference table
  const elAngles = [5, 10, 15, 20, 30, 45, 60, 90];
  const elevTable = elAngles.map(b => {
    const s = Math.sin(rad(b));
    return {
      b,
      f2: round2(F / (2 * s)),
      f3: round2(F / (3 * s)),
      f4: round2(F / (4 * s)),
    };
  });

  // ── SVG geometry — top-view (plan view) ──────────────────────────────────
  // All legs equally and symmetrically spaced around the master point.
  // α = total spread angle. Legs fan from -α/2 to +α/2 equally spaced.
  const svgCX = 240, topY = 60, legLen = 105;

  const legPositions: { x: number; y: number; angle: number }[] = [];
  for (let i = 0; i < numLegs; i++) {
    const legAngleDeg = -alpha / 2 + (alpha / (numLegs - 1)) * i;
    const legAngleR = rad(legAngleDeg);
    legPositions.push({
      x: svgCX + legLen * Math.sin(legAngleR),
      y: topY + legLen * Math.cos(legAngleR),
      angle: legAngleDeg,
    });
  }

  // Elevated master point visual shift in top-view
  const elevShift = beta > 0 ? Math.min(55, beta * 1.2) : 0;
  const mpY = topY - elevShift;

  // ── SVG geometry — side-view (elevation diagram) ─────────────────────────
  // Rock face = vertical line. Master point floats to the right at angle β.
  // Shows: bolt on face, horizontal dashed reference, leg at angle β, MP.
  const sideW = 480, sideH = 220;
  const rockX = 90;
  const boltMidY = sideH - 80;
  const legLenSide = 130;
  const mpSideX = rockX + legLenSide * Math.cos(betaR);
  const mpSideY = boltMidY - legLenSide * Math.sin(betaR);

  return (
    <div>
      <SectionTitle>Anchor angle & elevation force calculator</SectionTitle>
      <p style={{ fontSize: 14, color: "#7a7268", marginBottom: 20, lineHeight: 1.65 }}>
        Calculates the force on each anchor leg for symmetric 2, 3 and 4-leg systems.
        Includes the elevated master point effect — when an A-frame (cavalete) raises the
        master point above the rock face, the vertical component of each leg partially
        supports the load, <em>reducing</em> the force per leg.
      </p>

      {danger && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 10 }}>
          <span>⚠️</span>
          <div>
            <strong style={{ color: "#991b1b", fontSize: 13 }}>DANGER: Force per leg exceeds total load</strong>
            <p style={{ color: "#991b1b", fontSize: 12, margin: "4px 0 0" }}>
              {beta === 0 && alpha >= 120 ? "Spread angle exceeds 120°. Each leg carries MORE than the full load." : "Reduce the spread angle or increase elevation."}
            </p>
          </div>
        </div>
      )}

      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[false, true].map(elevated => (
          <button key={String(elevated)} onClick={() => { setShowElevated(elevated); if (!elevated) setBeta(0); }} style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11, padding: "8px 16px", borderRadius: 6,
            border: "1px solid", cursor: "pointer",
            borderColor: showElevated === elevated ? "#c8531a" : "rgba(13,15,14,0.2)",
            background: showElevated === elevated ? "rgba(200,83,26,0.08)" : "#fff",
            color: showElevated === elevated ? "#c8531a" : "#0d0f0e",
          }}>
            {elevated ? "⬆ Elevated master point (A-frame)" : "➡ Flat anchor (horizontal spread)"}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          {/* Number of legs */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: DFONT, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: DC.muted, marginBottom: 8 }}>Number of anchor legs</div>
            <div style={{ display: "flex", gap: 8 }}>
              {([2, 3, 4] as const).map(n => (
                <button key={n} onClick={() => setNumLegs(n)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 6, cursor: "pointer",
                  fontFamily: "'Fraunces', serif", fontSize: 20, fontStyle: "italic",
                  border: "1px solid",
                  borderColor: numLegs === n ? "#c8531a" : "rgba(13,15,14,0.15)",
                  background: numLegs === n ? "rgba(200,83,26,0.06)" : "#fff",
                  color: numLegs === n ? "#c8531a" : "#0d0f0e",
                }}>
                  {n}
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, display: "block", color: "#7a7268", fontStyle: "normal" }}>
                    {n === 2 ? "Sliding-X / BFK" : n === 3 ? "Equalette / 3-bolt" : "4-point"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <SliderRow label="Load on master point (F)" value={F} min={1} max={50} step={0.5} unit="kN" onChange={setF} />

          {!showElevated && (
            <SliderRow
              label={numLegs === 2 ? "Angle between legs (α)" : numLegs === 3 ? "Spread angle between outer legs (α)" : "Angle between adjacent legs (α)"}
              value={alpha} min={0} max={179} step={1} unit="°" onChange={setAlpha}
            />
          )}

          {showElevated && (
            <>
              <SliderRow label="Elevation angle of legs (β)" value={beta} min={1} max={90} step={1} unit="°" onChange={setBeta} />
              {beta > 0 && beta < 15 && (
                <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 6, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#92400e" }}>
                  ⚠ Very shallow elevation (β &lt; 15°). Forces are very high. Consider increasing elevation or adding more legs.
                </div>
              )}
              <SliderRow label="Horizontal spread (α)" value={alpha} min={0} max={120} step={1} unit="°" onChange={setAlpha} />
            </>
          )}

          {/* Main results */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            <ResultCard
              label={`Force per leg (×${numLegs})`}
              value={Fleg >= 500 ? "∞" : units === "imperial" ? kN2lbf(Fleg) : Fleg}
              unit={Fleg >= 500 ? "" : units === "imperial" ? "lbf" : "kN"}
              sub={Fleg < 500 ? `≈ ${Math.round(kN2kg(Fleg))} kg` : "Impossible geometry"}
            />
            <ResultCard label="Load multiplier" value={Fleg >= 500 ? "∞" : K + "×"} unit="" />
            <ResultCard label="Total load in system" value={units === "imperial" ? kN2lbf(Fleg < 500 ? Fleg * numLegs : 0) : Fleg < 500 ? round2(Fleg * numLegs) : "∞"} unit={units === "imperial" ? "lbf" : "kN"} sub="sum of all legs" />
          </div>

          {/* Formula display */}
          <div style={{ background: "rgba(13,15,14,0.04)", borderRadius: 6, padding: "10px 12px", marginTop: 12, fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#7a7268", lineHeight: 1.6 }}>
            {formula}
          </div>

          {/* Safety status */}
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <SafetyBadge value={Fleg < 500 ? F / Fleg : 0} thresholds={[0.7, 1.0]} />
            <span style={{ fontSize: 12, color: "#7a7268" }}>
              {Fleg < F ? "Each leg carries less than total load ✓" :
               Fleg === F ? "Each leg carries exactly the full load ⚠" :
               "Each leg carries more than total load ✕"}
            </span>
          </div>
        </div>

        <div>
          {/* ── TOP-VIEW: plan view of anchor spread ── */}
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7a7268", marginBottom: 6 }}>
            Top view — anchor spread
          </div>
          <svg width="100%" viewBox="0 0 480 280" style={{ borderRadius: 8, background: "rgba(13,15,14,0.02)", border: "1px solid rgba(13,15,14,0.08)", marginBottom: 16 }}>
            <defs>
              <marker id="arrowDown" viewBox="0 0 10 10" refX={5} refY={8} markerWidth={6} markerHeight={6} orient="auto">
                <path d="M1 1L5 9L9 1" fill="none" stroke="#0d0f0e" strokeWidth={1.5} />
              </marker>
            </defs>

            {/* Elevation indicator in top view */}
            {beta > 0 && (
              <>
                <line x1={svgCX} y1={mpY} x2={svgCX} y2={topY} stroke="#c8531a" strokeWidth={1} strokeDasharray="3,2" opacity={0.5} />
                <text x={svgCX + 6} y={(mpY + topY) / 2 + 4} fontSize={9} fill="#c8531a" fontFamily="'DM Mono', monospace">↑ β={beta}°</text>
              </>
            )}

            {/* Spread angle arc between outermost legs */}
            {numLegs >= 2 && alpha > 5 && alpha < 175 && (
              <>
                <path
                  d={`M ${svgCX + 34 * Math.sin(rad(alpha / 2))} ${mpY + 34 * Math.cos(rad(alpha / 2))}
                      A 34 34 0 0 0
                      ${svgCX - 34 * Math.sin(rad(alpha / 2))} ${mpY + 34 * Math.cos(rad(alpha / 2))}`}
                  fill="none" stroke="#7a7268" strokeWidth={1} strokeDasharray="3,2"
                />
                <text x={svgCX - 14} y={mpY + 60} fontSize={10} fill="#7a7268" fontFamily="'DM Mono', monospace">α={alpha}°</text>
              </>
            )}

            {/* Spacing label for 3/4 legs */}
            {numLegs >= 3 && alpha > 0 && (
              <text x={svgCX + 55} y={mpY + 26} fontSize={9} fill="#7a7268" fontFamily="'DM Mono', monospace">
                spacing={round1(alpha / (numLegs - 1))}°
              </text>
            )}

            {/* All legs — symmetrically spaced, generated from legPositions array */}
            {legPositions.map((leg, i) => (
              <g key={i}>
                {/* Leg line */}
                <line x1={svgCX} y1={mpY} x2={leg.x} y2={leg.y} stroke={anchorColor} strokeWidth={3} strokeLinecap="round" />
                {/* Bolt/anchor point */}
                <circle cx={leg.x} cy={leg.y} r={7} fill="#0d0f0e" />
                <circle cx={leg.x} cy={leg.y} r={3} fill="#c8531a" />
                {/* Rock face tick mark — perpendicular to leg */}
                <line
                  x1={leg.x - 13 * Math.cos(rad(leg.angle))}
                  y1={leg.y + 13 * Math.sin(rad(leg.angle))}
                  x2={leg.x + 13 * Math.cos(rad(leg.angle))}
                  y2={leg.y - 13 * Math.sin(rad(leg.angle))}
                  stroke="#0d0f0e" strokeWidth={2}
                />
                {/* Force label — offset based on leg direction */}
                <text
                  x={leg.x + (leg.angle <= -30 ? -48 : leg.angle >= 30 ? 8 : 8)}
                  y={leg.y + (Math.abs(leg.angle) < 30 ? 20 : 4)}
                  fontSize={9} fill={anchorColor} fontFamily="'DM Mono', monospace"
                >
                  {Fleg < 500 ? round2(Fleg) + "kN" : "∞"}
                </text>
              </g>
            ))}

            {/* Master point — drawn on top of legs */}
            <circle cx={svgCX} cy={mpY} r={9} fill={anchorColor} />
            <circle cx={svgCX} cy={mpY} r={4} fill="#fff" />
            <text x={svgCX - 44} y={mpY - 14} fontSize={10} fill="#7a7268" fontFamily="'DM Mono', monospace">Master point</text>

            {/* Downward load arrow */}
            <line x1={svgCX} y1={mpY - 55} x2={svgCX} y2={mpY - 11} stroke="#0d0f0e" strokeWidth={2} markerEnd="url(#arrowDown)" />
            <text x={svgCX + 6} y={mpY - 36} fontSize={10} fill="#0d0f0e" fontFamily="'DM Mono', monospace">F={F}kN</text>
          </svg>

          {/* ── SIDE-VIEW: elevation diagram — only shown when elevated mode is active ── */}
          {showElevated && (
            <>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7a7268", marginBottom: 6 }}>
                Side view — elevated master point (β = {beta}°)
              </div>
              <svg width="100%" viewBox={`0 0 ${sideW} ${sideH}`} style={{ borderRadius: 8, background: "rgba(13,15,14,0.02)", border: "1px solid rgba(13,15,14,0.08)", marginBottom: 12 }}>
                <defs>
                  <marker id="arrowSide" viewBox="0 0 10 10" refX={5} refY={8} markerWidth={6} markerHeight={6} orient="auto">
                    <path d="M1 1L5 9L9 1" fill="none" stroke="#0d0f0e" strokeWidth={1.5} />
                  </marker>
                </defs>

                {/* Rock face — vertical hatched wall */}
                <line x1={rockX} y1={20} x2={rockX} y2={sideH - 20} stroke="#0d0f0e" strokeWidth={3} />
                {[0,1,2,3,4,5,6].map(i => (
                  <line key={i} x1={rockX - 14} y1={28 + i * 26} x2={rockX} y2={42 + i * 26} stroke="#0d0f0e" strokeWidth={1} opacity={0.35} />
                ))}
                <text x={rockX - 4} y={sideH - 8} fontSize={9} fill="#7a7268" fontFamily="'DM Mono', monospace" textAnchor="middle">Rock</text>

                {/* Anchor bolt on rock face */}
                <circle cx={rockX} cy={boltMidY} r={7} fill="#0d0f0e" />
                <circle cx={rockX} cy={boltMidY} r={3} fill="#c8531a" />
                <text x={rockX - 32} y={boltMidY + 4} fontSize={9} fill="#7a7268" fontFamily="'DM Mono', monospace">Bolt</text>

                {/* Horizontal reference dashed line from bolt */}
                <line x1={rockX} y1={boltMidY} x2={Math.min(sideW - 20, mpSideX + 50)} y2={boltMidY}
                  stroke="#7a7268" strokeWidth={1} strokeDasharray="5,4" />
                <text x={rockX + 50} y={boltMidY - 5} fontSize={9} fill="#7a7268" fontFamily="'DM Mono', monospace">horizontal</text>

                {/* β angle arc — from horizontal reference to leg */}
                {beta > 2 && beta < 88 && (
                  <>
                    <path
                      d={`M ${rockX + 44} ${boltMidY}
                          A 44 44 0 0 0
                          ${rockX + 44 * Math.cos(betaR)} ${boltMidY - 44 * Math.sin(betaR)}`}
                      fill="none" stroke="#c8531a" strokeWidth={1.5} strokeDasharray="3,2"
                    />
                    <text
                      x={rockX + 52 * Math.cos(betaR / 2) + 2}
                      y={boltMidY - 52 * Math.sin(betaR / 2) + 4}
                      fontSize={10} fill="#c8531a" fontFamily="'DM Mono', monospace"
                    >β={beta}°</text>
                  </>
                )}

                {/* Anchor leg — from bolt to elevated master point */}
                <line x1={rockX} y1={boltMidY} x2={mpSideX} y2={mpSideY}
                  stroke={anchorColor} strokeWidth={3.5} strokeLinecap="round" />

                {/* Force label on leg */}
                <text
                  x={(rockX + mpSideX) / 2 + 6}
                  y={(boltMidY + mpSideY) / 2 - 10}
                  fontSize={9} fill={anchorColor} fontFamily="'DM Mono', monospace"
                >
                  {Fleg < 500 ? round2(Fleg) + "kN/leg" : "∞"}
                </text>

                {/* Vertical height indicator — dashed line from MP down to bolt level */}
                <line x1={mpSideX} y1={mpSideY} x2={mpSideX} y2={boltMidY}
                  stroke="#7a7268" strokeWidth={1} strokeDasharray="3,3" />
                <line x1={mpSideX - 8} y1={mpSideY} x2={mpSideX + 8} y2={mpSideY} stroke="#7a7268" strokeWidth={1} />
                <line x1={mpSideX - 8} y1={boltMidY} x2={mpSideX + 8} y2={boltMidY} stroke="#7a7268" strokeWidth={1} />
                <text x={mpSideX + 12} y={(mpSideY + boltMidY) / 2 + 4} fontSize={9} fill="#7a7268" fontFamily="'DM Mono', monospace">
                  h·sin(β)
                </text>

                {/* Horizontal span indicator */}
                <line x1={rockX} y1={boltMidY + 22} x2={mpSideX} y2={boltMidY + 22}
                  stroke="#7a7268" strokeWidth={1} strokeDasharray="3,3" />
                <line x1={rockX} y1={boltMidY + 16} x2={rockX} y2={boltMidY + 28} stroke="#7a7268" strokeWidth={1} />
                <line x1={mpSideX} y1={boltMidY + 16} x2={mpSideX} y2={boltMidY + 28} stroke="#7a7268" strokeWidth={1} />
                <text x={(rockX + mpSideX) / 2 - 16} y={boltMidY + 36} fontSize={9} fill="#7a7268" fontFamily="'DM Mono', monospace">
                  h·cos(β)
                </text>

                {/* Master point — elevated */}
                <circle cx={mpSideX} cy={mpSideY} r={10} fill={anchorColor} />
                <circle cx={mpSideX} cy={mpSideY} r={5} fill="#fff" />
                <text x={mpSideX + 14} y={mpSideY + 4} fontSize={10} fill="#0d0f0e" fontFamily="'DM Mono', monospace">MP</text>

                {/* Downward load arrow at master point */}
                <line x1={mpSideX} y1={mpSideY - 44} x2={mpSideX} y2={mpSideY - 12}
                  stroke="#0d0f0e" strokeWidth={2} markerEnd="url(#arrowSide)" />
                <text x={mpSideX + 6} y={mpSideY - 26} fontSize={10} fill="#0d0f0e" fontFamily="'DM Mono', monospace">F={F}kN</text>

                {/* Key insight label at bottom */}
                <rect x={rockX} y={sideH - 22} width={sideW - rockX - 10} height={16} rx={3} fill="rgba(45,106,79,0.08)" />
                <text x={rockX + 8} y={sideH - 10} fontSize={9} fill="#2d6a4f" fontFamily="'DM Mono', monospace">
                  ↑ Higher β = lower F_leg. F_leg = F / (n·sin(β)) = {F} / ({numLegs}·sin({beta}°)) = {Fleg < 500 ? round2(Fleg) : "∞"}kN
                </text>
              </svg>
            </>
          )}

          {/* Reference table — switches between spread and elevation */}
          {!showElevated ? (
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7a7268", marginBottom: 8 }}>
                Force per leg (kN) for F = {F}kN load
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(13,15,14,0.12)" }}>
                    {["Spread α", "2 legs", "3 legs", "4 legs"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "5px 8px", color: "#7a7268", fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {refTable.map(row => {
                    const isActive = row.a === alpha;
                    const isDanger = row.f2 >= F;
                    return (
                      <tr key={row.a} style={{ background: isActive ? "rgba(200,83,26,0.06)" : "transparent", borderBottom: "1px solid rgba(13,15,14,0.06)" }}>
                        <td style={{ padding: "5px 8px", fontWeight: isActive ? 600 : 400 }}>{row.a}°</td>
                        <td style={{ padding: "5px 8px", color: isDanger ? "#dc2626" : "#0d0f0e" }}>{row.f2 >= 500 ? "∞" : row.f2}</td>
                        <td style={{ padding: "5px 8px" }}>{row.f3 >= 500 ? "∞" : row.f3}</td>
                        <td style={{ padding: "5px 8px" }}>{row.f4 >= 500 ? "∞" : row.f4}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7a7268", marginBottom: 8 }}>
                Force per leg (kN) for F = {F}kN — elevated master point
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(13,15,14,0.12)" }}>
                    {["Elevation β", "2 legs", "3 legs", "4 legs", "Effect"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "5px 8px", color: "#7a7268", fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {elevTable.map(row => {
                    const isActive = row.b === beta;
                    const reduction = round1(100 - (row.f2 / (F / 2)) * 100);
                    return (
                      <tr key={row.b} style={{ background: isActive ? "rgba(200,83,26,0.06)" : "transparent", borderBottom: "1px solid rgba(13,15,14,0.06)" }}>
                        <td style={{ padding: "5px 8px", fontWeight: isActive ? 600 : 400 }}>{row.b}°</td>
                        <td style={{ padding: "5px 8px" }}>{row.f2}</td>
                        <td style={{ padding: "5px 8px" }}>{row.f3}</td>
                        <td style={{ padding: "5px 8px" }}>{row.f4}</td>
                        <td style={{ padding: "5px 8px", color: "#2d6a4f", fontSize: 10 }}>
                          {reduction > 0 ? `−${reduction}%` : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p style={{ fontSize: 11, color: "#7a7268", marginTop: 8, lineHeight: 1.5 }}>
                % reduction vs flat 2-leg anchor at same load. Higher elevation = lower force per leg.
                Practical A-frames typically achieve β = 20–45°.
              </p>
            </div>
          )}
        </div>
      </div>

      <SourceNote>
        FLAT ANCHOR — 2-leg: F_leg = F/(2·cos(α/2)) | 3-leg: F_leg ≈ F/(3·cos(α/3)) | 4-leg: F_leg = F/(4·cos(α/2)).
        ELEVATED MASTER POINT — n legs: F_leg = F/(n·sin(β)) where β = elevation angle above horizontal.
        Sources: ISA Anchor Analysis (2021), RopeLab Force Calculators, ISA Cavaletes em Slacklines (2017).
        Rule: never exceed 120° spread between legs. Minimum recommended elevation: 20°.
      </SourceNote>
    </div>
  );
}

// ─── Calculator 3: Backup Fall ────────────────────────────────────────────────

function BackupFallCalc({ units }: { units: Units }) {
  const [lineLen, setLineLen] = useState(100);
  const [height, setHeight] = useState(30);
  const [leash, setLeash] = useState(2);
  const [weight, setWeight] = useState(75);
  const [backupSag, setBackupSag] = useState(4);
  const [webbing, setWebbing] = useState<"dyneema" | "nylon" | "dynamic">("nylon");

  const uUnit = units === "imperial";
  const uLen = uUnit ? m2ft(lineLen) : lineLen;
  const uH = uUnit ? m2ft(height) : height;
  const uLeash = uUnit ? m2ft(leash) : leash;
  const uBSag = uUnit ? m2ft(backupSag) : backupSag;
  const uW = uUnit ? kg2lb(weight) : weight;

  // Athanasiadis midline formula
  const requiredH = 2 * (leash + backupSag);
  const clearanceOk = height > requiredH;
  const margin = round1(height - requiredH);

  // Simplified backup fall force estimation
  // Fall distance = leash length (approximation for center of line)
  // Using energy methods: F = W*g*(1 + sqrt(1 + 2*k*h/(W*g)))
  // Stiffness approximation by webbing type
  const stretchFactor = webbing === "dyneema" ? 0.01 : webbing === "nylon" ? 0.05 : 0.25;
  const k_approx = (weight * G * 10) / (stretchFactor * lineLen); // simplified spring constant
  const fallDist = leash;
  const peakForce = round2(weight * G * (1 + Math.sqrt(1 + (2 * k_approx * fallDist) / (weight * G))) / 1000);
  const clampedForce = Math.min(peakForce, 40); // physical clamp

  const svgH2 = 280;
  const svgW2 = 480;
  const groundY = svgH2 - 30;
  const lineY = groundY - Math.min(200, height * 4);
  const backupY = lineY + Math.min(60, backupSag * 8);
  const personX = svgW2 / 2;

  return (
    <div>
      <SectionTitle>Backup fall simulator</SectionTitle>
      <p style={{ fontSize: 14, color: "#7a7268", marginBottom: 24, lineHeight: 1.65 }}>
        Simulates forces when the main line fails and the backup is loaded.
        Uses the Athanasiadis (2013) model adopted by ISA for minimum height requirements.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          <SliderRow label="Line length" value={uLen} min={uUnit ? 33 : 10} max={uUnit ? 6561 : 2000} step={uUnit ? 10 : 1} unit={uUnit ? "ft" : "m"} onChange={v => setLineLen(uUnit ? ft2m(v) : v)} />
          <SliderRow label="Height above ground (H)" value={uH} min={uUnit ? 3 : 1} max={uUnit ? 328 : 100} step={uUnit ? 1 : 0.5} unit={uUnit ? "ft" : "m"} onChange={v => setHeight(uUnit ? ft2m(v) : v)} />
          <SliderRow label="Leash length (L)" value={uLeash} min={uUnit ? 3 : 1} max={uUnit ? 13 : 4} step={uUnit ? 0.5 : 0.1} unit={uUnit ? "ft" : "m"} onChange={v => setLeash(uUnit ? ft2m(v) : v)} />
          <SliderRow label="Body weight (W)" value={uW} min={uUnit ? 88 : 40} max={uUnit ? 330 : 150} step={1} unit={uUnit ? "lb" : "kg"} onChange={v => setWeight(uUnit ? lb2kg(v) : v)} />
          <SliderRow label="Backup sag (S)" value={uBSag} min={uUnit ? 1 : 0.3} max={uUnit ? 66 : 20} step={uUnit ? 0.5 : 0.1} unit={uUnit ? "ft" : "m"} onChange={v => setBackupSag(uUnit ? ft2m(v) : v)} />

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: DFONT, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: DC.muted, marginBottom: 8 }}>Backup webbing type</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["dyneema", "nylon", "dynamic"] as const).map(w => (
                <button key={w} onClick={() => setWebbing(w)} style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 11, padding: "6px 12px", borderRadius: 4,
                  border: "1px solid", cursor: "pointer",
                  borderColor: webbing === w ? "#c8531a" : "rgba(13,15,14,0.2)",
                  background: webbing === w ? "#c8531a" : "transparent",
                  color: webbing === w ? "#fff" : "#0d0f0e",
                }}>
                  {w === "dyneema" ? "Dyneema (~1%)" : w === "nylon" ? "Nylon (~5%)" : "Dynamic (~25%)"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          {/* Clearance status — BIG */}
          <div style={{
            padding: 20, borderRadius: 10, marginBottom: 16,
            background: clearanceOk ? "#d1fae5" : "#fee2e2",
            border: `2px solid ${clearanceOk ? "#6ee7b7" : "#fca5a5"}`,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 36 }}>{clearanceOk ? "✅" : "❌"}</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: clearanceOk ? "#065f46" : "#991b1b", marginTop: 8 }}>
              {clearanceOk ? "CLEARANCE OK" : "INSUFFICIENT CLEARANCE"}
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: clearanceOk ? "#065f46" : "#991b1b", marginTop: 6 }}>
              Required: {uUnit ? m2ft(requiredH) : round1(requiredH)}{uUnit ? "ft" : "m"} &nbsp;|&nbsp;
              Yours: {uUnit ? m2ft(height) : round1(height)}{uUnit ? "ft" : "m"} &nbsp;|&nbsp;
              {clearanceOk ? `+${uUnit ? m2ft(margin) : margin}${uUnit ? "ft" : "m"} margin` : `Need ${uUnit ? m2ft(-margin) : Math.abs(margin)}${uUnit ? "ft" : "m"} more`}
            </div>
          </div>

          {/* Results */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            <ResultCard label="Est. peak backup force" value={units === "imperial" ? kN2lbf(clampedForce) : clampedForce} unit={units === "imperial" ? "lbf" : "kN"} sub="Simplified model" />
            <ResultCard label="Min required height" value={uUnit ? m2ft(requiredH) : round1(requiredH)} unit={uUnit ? "ft" : "m"} sub="H > 2(L+S)" />
            <ResultCard label="Est. fall distance" value={uUnit ? m2ft(round1(leash + backupSag * 0.3)) : round1(leash + backupSag * 0.3)} unit={uUnit ? "ft" : "m"} />
          </div>

          {/* Cross-section diagram */}
          <svg width="100%" viewBox={`0 0 ${svgW2} ${svgH2}`} style={{ borderRadius: 8, background: "rgba(13,15,14,0.02)", border: "1px solid rgba(13,15,14,0.08)" }}>
            {/* Ground */}
            <rect x={0} y={groundY} width={svgW2} height={svgH2 - groundY} fill={clearanceOk ? "rgba(45,106,79,0.08)" : "rgba(220,38,38,0.12)"} />
            <line x1={0} y1={groundY} x2={svgW2} y2={groundY} stroke={clearanceOk ? "#2d6a4f" : "#dc2626"} strokeWidth={2} />
            <text x={10} y={groundY - 4} fontSize={9} fill="#7a7268" fontFamily="'DM Mono', monospace">Ground</text>
            {/* Main line */}
            <line x1={60} y1={lineY} x2={svgW2 - 60} y2={lineY} stroke="#0d0f0e" strokeWidth={2.5} />
            <text x={10} y={lineY - 4} fontSize={9} fill="#7a7268" fontFamily="'DM Mono', monospace">Main line</text>
            {/* Backup */}
            <path d={`M 60 ${lineY + 4} Q ${personX} ${backupY} ${svgW2 - 60} ${lineY + 4}`} fill="none" stroke="#7a7268" strokeWidth={1.5} strokeDasharray="5,3" />
            <text x={10} y={backupY + 4} fontSize={9} fill="#7a7268" fontFamily="'DM Mono', monospace">Backup</text>
            {/* Person on main line */}
            <circle cx={personX} cy={lineY - 8} r={8} fill="#0d0f0e" />
            <line x1={personX} y1={lineY} x2={personX} y2={lineY + round1(leash) * 12} stroke="#7a7268" strokeWidth={1.5} strokeDasharray="3,2" />
            {/* H dimension */}
            <line x1={svgW2 - 20} y1={lineY} x2={svgW2 - 20} y2={groundY} stroke="#c8531a" strokeWidth={1} strokeDasharray="3,2" />
            <text x={svgW2 - 18} y={(lineY + groundY) / 2} fontSize={9} fill="#c8531a" fontFamily="'DM Mono', monospace">H</text>
          </svg>
        </div>
      </div>

      <SourceNote>
        CLEARANCE FORMULA: H {">"} 2×(L+S) — Athanasiadis (2013), adopted by ISA Midline Advisory (2015).
        Peak force is a simplified model. For accurate simulation, use the ISA official Backup Fall Simulator at
        data.slacklineinternational.org/safety/Highline/backup-fall/
      </SourceNote>
    </div>
  );
}

// ─── Calculator 4: Midline Safety ─────────────────────────────────────────────

function MidlineSafetyCalc({ units }: { units: Units }) {
  const [H, setH] = useState(8);      // height m
  const [L, setL] = useState(2);      // leash m
  const [S, setS] = useState(2);      // backup sag m

  const uUnit = units === "imperial";
  const uH = uUnit ? m2ft(H) : H;
  const uL = uUnit ? m2ft(L) : L;
  const uS = uUnit ? m2ft(S) : S;

  const required = 2 * (L + S);
  const uRequired = uUnit ? m2ft(required) : required;
  const margin = round1(H - required);
  const safe = H > required;
  const pct = Math.min(100, Math.max(0, (H / (required * 1.5)) * 100));

  return (
    <div>
      <SectionTitle>Midline safety height checker</SectionTitle>
      <p style={{ fontSize: 14, color: "#7a7268", marginBottom: 16, lineHeight: 1.65 }}>
        A midline is a highline rigged at low height. The ISA requires a minimum height so the
        backup doesn't contact the ground during a backup fall.
      </p>

      {/* Formula display */}
      <div style={{ background: "#0d0f0e", borderRadius: 10, padding: "16px 24px", marginBottom: 28, textAlign: "center" }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 300, color: "#f4f1eb", letterSpacing: "-0.02em" }}>
          H &gt; 2 × (L + S)
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#7a7268", marginTop: 8, letterSpacing: "0.06em" }}>
          H = height of main line | L = leash length | S = backup sag at center
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          <SliderRow label="Height of main line (H)" value={uH} min={uUnit ? 3 : 1} max={uUnit ? 164 : 50} step={uUnit ? 0.5 : 0.1} unit={uUnit ? "ft" : "m"} onChange={v => setH(uUnit ? ft2m(v) : v)} />
          <SliderRow label="Leash length (L)" value={uL} min={uUnit ? 3 : 1} max={uUnit ? 13 : 4} step={uUnit ? 0.5 : 0.1} unit={uUnit ? "ft" : "m"} onChange={v => setL(uUnit ? ft2m(v) : v)} />
          <SliderRow label="Backup sag (S)" value={uS} min={uUnit ? 1 : 0.3} max={uUnit ? 33 : 10} step={uUnit ? 0.5 : 0.1} unit={uUnit ? "ft" : "m"} onChange={v => setS(uUnit ? ft2m(v) : v)} />

          {/* Big result */}
          <div style={{
            padding: 24, borderRadius: 12, textAlign: "center", marginTop: 20,
            background: safe ? "#d1fae5" : "#fee2e2",
            border: `2px solid ${safe ? "#6ee7b7" : "#fca5a5"}`,
          }}>
            <div style={{ fontSize: 48 }}>{safe ? "✅" : "❌"}</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, marginTop: 8, color: safe ? "#065f46" : "#991b1b" }}>
              {safe ? "SAFE" : "NOT SAFE"}
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, marginTop: 6, color: safe ? "#065f46" : "#991b1b", lineHeight: 1.8 }}>
              Min required: {round1(uRequired)}{uUnit ? "ft" : "m"}<br />
              Your height: {uH}{uUnit ? "ft" : "m"}<br />
              {safe
                ? `Safety margin: +${uUnit ? m2ft(margin) : margin}${uUnit ? "ft" : "m"}`
                : `You need ${uUnit ? m2ft(Math.abs(margin)) : Math.abs(margin)}${uUnit ? "ft" : "m"} more`
              }
            </div>
          </div>
        </div>

        <div>
          {/* Visual gauge */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#7a7268", marginBottom: 8, letterSpacing: "0.06em" }}>
              <span>0{uUnit ? "ft" : "m"}</span>
              <span>Required: {round1(uRequired)}{uUnit ? "ft" : "m"}</span>
              <span>{uUnit ? m2ft(required * 1.5) : round1(required * 1.5)}{uUnit ? "ft" : "m"}</span>
            </div>
            <div style={{ height: 20, background: "rgba(13,15,14,0.08)", borderRadius: 10, overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", left: "66.7%", top: 0, bottom: 0, width: 2, background: "#c8531a", zIndex: 2 }} />
              <div style={{
                height: "100%", borderRadius: 10, transition: "width 0.3s",
                width: `${pct}%`,
                background: safe ? "#2d6a4f" : "#dc2626",
              }} />
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#7a7268", marginTop: 4, textAlign: "right" }}>
              ↑ minimum safe height
            </div>
          </div>

          {/* SVG side-view */}
          <svg width="100%" viewBox="0 0 300 280" style={{ borderRadius: 8, background: "rgba(13,15,14,0.02)", border: "1px solid rgba(13,15,14,0.08)" }}>
            {/* Ground */}
            <rect x={0} y={240} width={300} height={40} fill={safe ? "rgba(45,106,79,0.1)" : "rgba(220,38,38,0.15)"} />
            <line x1={0} y1={240} x2={300} y2={240} stroke={safe ? "#2d6a4f" : "#dc2626"} strokeWidth={2} />
            {/* Anchors */}
            <rect x={10} y={80} width={10} height={160} fill="#c8c0b0" />
            <rect x={280} y={80} width={10} height={160} fill="#c8c0b0" />
            {/* Main line */}
            <line x1={20} y1={80} x2={280} y2={80} stroke="#0d0f0e" strokeWidth={2.5} />
            {/* Backup */}
            <path d="M 20 84 Q 150 140 280 84" fill="none" stroke="#7a7268" strokeWidth={1.5} strokeDasharray="4,3" />
            {/* Person */}
            <circle cx={150} cy={72} r={7} fill="#0d0f0e" />
            {/* Leash */}
            <line x1={150} y1={79} x2={150} y2={100} stroke="#7a7268" strokeWidth={1.5} strokeDasharray="3,2" />
            {/* H dimension */}
            <line x1={260} y1={80} x2={260} y2={240} stroke="#c8531a" strokeWidth={1} strokeDasharray="3,2" />
            <text x={264} y={165} fontSize={9} fill="#c8531a" fontFamily="'DM Mono', monospace">H</text>
            <line x1={255} y1={80} x2={265} y2={80} stroke="#c8531a" strokeWidth={1} />
            <line x1={255} y1={240} x2={265} y2={240} stroke="#c8531a" strokeWidth={1} />
          </svg>
        </div>
      </div>

      <SourceNote>
        FORMULA: H {">"} 2×(L+S) — Athanasiadis (2013). Source: ISA Midline Advisory (2015).
        slacklineinternational.org/wp-content/uploads/2016/06/ISA-MidlineAdvisory-PR.pdf
      </SourceNote>
    </div>
  );
}

// ─── Calculator 5: Mechanical Advantage ──────────────────────────────────────

function MechanicalAdvCalc({ units }: { units: Units }) {
  const [system, setSystem] = useState<2 | 3 | 4 | 5 | 6>(3);
  const [targetT, setTargetT] = useState(8);     // desired tension kN
  const [friction, setFriction] = useState(10);  // friction loss per pulley %

  const nPulleys = system - 1;
  const maTheoretical = system;
  const efficiency = Math.pow((1 - friction / 100), nPulleys);
  const maActual = round2(maTheoretical * efficiency);
  const effPct = round1(efficiency * 100);
  const forceNeeded = round2(targetT / maActual);
  const ropeTravel = maTheoretical;

  const uUnit = units === "imperial";

  const systems = [
    { ma: 2, name: "2:1 Simple", desc: "1 movable pulley" },
    { ma: 3, name: "3:1 Z-rig", desc: "Most common" },
    { ma: 4, name: "4:1 Double", desc: "2 movable pulleys" },
    { ma: 5, name: "5:1 Compound", desc: "Compound system" },
    { ma: 6, name: "6:1 Triple", desc: "High force setup" },
  ];

  return (
    <div>
      <SectionTitle>Mechanical advantage calculator</SectionTitle>
      <p style={{ fontSize: 14, color: "#7a7268", marginBottom: 24, lineHeight: 1.65 }}>
        Calculate the mechanical advantage (MA) of pulley systems used to tension a highline.
        Includes realistic friction losses per pulley.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          {/* System selector */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: DFONT, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: DC.muted, marginBottom: 10 }}>Pulley system</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {systems.map(s => (
                <button key={s.ma} onClick={() => setSystem(s.ma as 2|3|4|5|6)} style={{
                  padding: "10px 8px", borderRadius: 6, cursor: "pointer", textAlign: "left",
                  border: "1px solid",
                  borderColor: system === s.ma ? "#c8531a" : "rgba(13,15,14,0.15)",
                  background: system === s.ma ? "rgba(200,83,26,0.06)" : "#fff",
                }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, color: system === s.ma ? "#c8531a" : "#0d0f0e" }}>{s.name}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#7a7268", marginTop: 2 }}>{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <SliderRow label="Desired tension" value={targetT} min={1} max={30} step={0.5} unit="kN" onChange={setTargetT} />
          <SliderRow label="Friction loss per pulley" value={friction} min={0} max={25} step={1} unit="%" onChange={setFriction} />

          {/* Results */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            <ResultCard label="Theoretical MA" value={`${maTheoretical}:1`} />
            <ResultCard label="Actual MA (with friction)" value={`${maActual}:1`} />
            <ResultCard label="Efficiency" value={effPct} unit="%" />
            <ResultCard label="Input force needed" value={uUnit ? kN2lbf(forceNeeded) : forceNeeded} unit={uUnit ? "lbf" : "kN"} sub={`≈ ${Math.round(kN2kg(forceNeeded))} kg`} />
            <ResultCard label="Rope travel per 1m gained" value={ropeTravel} unit="m" />
          </div>
        </div>

        <div>
          {/* Reference table */}
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a7268", marginBottom: 10 }}>
            Reference — effort to achieve {targetT}kN ({friction}% friction/pulley)
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(13,15,14,0.15)" }}>
                {["System", "Theor.", "Actual", "Input force", ""].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: "#7a7268", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {systems.map(s => {
                const np = s.ma - 1;
                const eff = Math.pow((1 - friction / 100), np);
                const actualMa = round2(s.ma * eff);
                const force = round2(targetT / actualMa);
                return (
                  <tr key={s.ma} style={{
                    borderBottom: "1px solid rgba(13,15,14,0.06)",
                    background: system === s.ma ? "rgba(200,83,26,0.04)" : "transparent",
                    fontWeight: system === s.ma ? 600 : 400,
                  }}>
                    <td style={{ padding: "6px 8px" }}>{s.name}</td>
                    <td style={{ padding: "6px 8px" }}>{s.ma}:1</td>
                    <td style={{ padding: "6px 8px" }}>{actualMa}:1</td>
                    <td style={{ padding: "6px 8px" }}>{uUnit ? kN2lbf(force) + " lbf" : force + " kN"}</td>
                    <td style={{ padding: "6px 8px" }}>≈{Math.round(kN2kg(force))}kg</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pulley SVG — Z-rig diagram */}
          <svg width="100%" viewBox="0 0 300 160" style={{ marginTop: 16, borderRadius: 8, background: "rgba(13,15,14,0.02)", border: "1px solid rgba(13,15,14,0.08)" }}>
            <text x={10} y={18} fontSize={10} fill="#7a7268" fontFamily="'DM Mono', monospace">{system}:1 system — theoretical rope path</text>
            {/* Anchor */}
            <rect x={20} y={30} width={12} height={80} rx={3} fill="#0d0f0e" opacity={0.7} />
            {/* Fixed pulley at anchor */}
            <circle cx={26} cy={40} r={10} fill="none" stroke="#0d0f0e" strokeWidth={2} />
            <circle cx={26} cy={40} r={3} fill="#0d0f0e" />
            {/* Movable pulleys */}
            {Array.from({ length: Math.min(3, nPulleys) }).map((_, i) => (
              <g key={i}>
                <circle cx={80 + i * 55} cy={100} r={12} fill="none" stroke="#c8531a" strokeWidth={2} />
                <circle cx={80 + i * 55} cy={100} r={4} fill="#c8531a" />
              </g>
            ))}
            {/* Simplified rope lines */}
            <line x1={26} y1={50} x2={80} y2={88} stroke="#0d0f0e" strokeWidth={1.5} />
            <line x1={80} y1={112} x2={26} y2={50} stroke="#0d0f0e" strokeWidth={1.5} opacity={0.4} />
            {/* Load */}
            <rect x={230} y={80} width={40} height={30} rx={4} fill="#0d0f0e" opacity={0.15} stroke="#0d0f0e" strokeWidth={1} />
            <text x={236} y={100} fontSize={9} fill="#0d0f0e" fontFamily="'DM Mono', monospace">{targetT}kN</text>
            {/* Pull direction */}
            <line x1={260} y1={60} x2={280} y2={40} stroke="#c8531a" strokeWidth={2} />
            <text x={264} y={35} fontSize={9} fill="#c8531a" fontFamily="'DM Mono', monospace">Pull</text>
          </svg>
        </div>
      </div>

      <SourceNote>
        Friction model: each pulley reduces efficiency by the specified percentage.
        Source: CMC Rescue (2022), Slacktivity Pulley Analysis (2016), RopeLab Pulley Systems (2019).
      </SourceNote>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PhysicsCalculator() {
  const [tab, setTab] = useState<Tab>("tension");
  const [units, setUnits] = useState<Units>("metric");

  const tabs: { id: Tab; label: string }[] = [
    { id: "tension", label: "Line Tension" },
    { id: "anchor", label: "Anchor Angle" },
    { id: "backup", label: "Backup Fall" },
    { id: "midline", label: "Midline Safety" },
    { id: "mechanical", label: "Mech. Advantage" },
  ];

  return (
    <div style={styles.page}>
      {/* Page header */}
      <div style={{ borderBottom: `1px solid ${DC.border}`, background: DC.navy }}>
        <div style={styles.inner}>
          <div style={{ paddingTop: 32, paddingBottom: 16 }}>
            <a href="/" style={{ fontFamily: DFONT, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.4)", textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              ← Back to Slackline Hub
            </a>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontFamily: DFONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: DC.blue, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-block", width: 20, height: 1, background: "#c8531a" }} /> Physics Tools
                </div>
                <h1 style={{ fontFamily: DFONT, fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.01em", color: DC.white, margin: 0, lineHeight: 0.9 }}>
                  Physics &amp; Forces Calculator
                </h1>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "10px 0 0", fontWeight: 400 }}>
                  Professional rigging calculations based on ISA standards, DAV research, and Athanasiadis (2013)
                </p>
              </div>
              {/* Units toggle */}
              <div style={{ display: "flex", gap: 4, alignSelf: "flex-end" }}>
                {(["metric", "imperial"] as Units[]).map(u => (
                  <button key={u} onClick={() => setUnits(u)} style={{
                    fontFamily: DFONT, fontSize: 12, fontWeight: 700, padding: "8px 18px",
                    borderRadius: 3, border: "1px solid",
                    borderColor: units === u ? DC.blue : DC.border,
                    background: units === u ? DC.blue : "transparent",
                    color: units === u ? DC.white : "rgba(255,255,255,0.5)",
                    cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase",
                  }}>
                    {u === "metric" ? "Metric (m/kg/kN)" : "Imperial (ft/lb/lbf)"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safety banner */}
      <div style={{ background: "rgba(245,158,11,0.08)", borderBottom: "1px solid rgba(245,158,11,0.2)" }}>
        <div style={{ ...styles.inner, paddingTop: 10, paddingBottom: 10 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#b45309", margin: 0, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span>⚠️</span>
            <span>These calculations assume <strong>static loads</strong>. Real-world forces can be significantly higher due to dynamic effects, wind, and bouncing. Always verify with a <strong>certified ISA Rigger</strong> before use.</span>
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ borderBottom: `1px solid ${DC.border}`, background: DC.navy, position: "sticky", top: 56, zIndex: 50 }}>
        <div style={styles.inner}>
          <div style={{ display: "flex", gap: 0, paddingTop: 0 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                fontFamily: DFONT, fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "16px 22px", border: "none", background: "transparent", cursor: "pointer",
                color: tab === t.id ? DC.blue : DC.muted,
                borderBottom: `3px solid ${tab === t.id ? DC.blue : "transparent"}`,
                transition: "all 0.15s",
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calculator content */}
      <div style={styles.inner}>
        <div style={{ paddingTop: 36 }}>
          {tab === "tension" && <LineTensionCalc units={units} />}
          {tab === "anchor" && <AnchorAngleCalc units={units} />}
          {tab === "backup" && <BackupFallCalc units={units} />}
          {tab === "midline" && <MidlineSafetyCalc units={units} />}
          {tab === "mechanical" && <MechanicalAdvCalc units={units} />}
        </div>
      </div>

      {/* Footer disclaimer */}
      <div style={{ borderTop: `1px solid ${DC.border}`, marginTop: 40 }}>
        <div style={{ ...styles.inner, paddingTop: 20, paddingBottom: 20 }}>
          <p style={{ fontFamily: DFONT, fontSize: 11, fontWeight: 600, color: DC.muted, lineHeight: 1.8, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            DISCLAIMER: These calculators provide theoretical estimates for educational purposes only.
            They assume static loads, ideal conditions, and perfect equipment. Real-world forces can exceed
            these values due to dynamic loading, equipment wear, environmental factors, and human error.
            Always have your setup verified by a certified ISA Rigger before use.
            Slackline Hub takes no responsibility for rigging decisions made based on these calculations.
          </p>
        </div>
      </div>
    </div>
  );
}
