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

// ─── Brand tokens ────────────────────────────────────────────────────────────
const DC = {
  white:  "#ffffff",
  bg:     "#f7f8fc",
  navy:   "#1a237e",
  blue:   "#2979ff",
  coral:  "#ef5350",
  teal:   "#00bfa5",
  amber:  "#ffc107",
  muted:  "#5c6685",
  border: "#dde3f0",
  text:   "#1a237e",
};
const C_white = "#ffffff"; // alias for education section cards
const DFONT = "'DM Sans', sans-serif";

// ─── Shared SVG helpers ──────────────────────────────────────────────────────

// Person standing ON a line (feet touch lineY exactly)
function PersonOnLine(px: number, lineY: number, color = "#1a237e"): React.ReactNode {
  // Total height: head(10) + neck(2) + torso(13) + leg(11) = 36px above lineY
  const footY = lineY;
  const legJointY = footY - 11;
  const shoulderY = legJointY - 13;
  const headCY = shoulderY - 2 - 5; // 2=neck, 5=headR
  const headR = 5;
  return (
    <>
      <circle cx={px} cy={headCY} r={headR} fill={color}/>
      {/* neck + torso */}
      <line x1={px} y1={headCY+headR} x2={px} y2={shoulderY+13} stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
      {/* arms */}
      <line x1={px-9} y1={shoulderY+5} x2={px+9} y2={shoulderY+5} stroke={color} strokeWidth={2} strokeLinecap="round"/>
      {/* legs — feet exactly at lineY */}
      <line x1={px} y1={legJointY} x2={px-5} y2={footY} stroke={color} strokeWidth={2} strokeLinecap="round"/>
      <line x1={px} y1={legJointY} x2={px+5} y2={footY} stroke={color} strokeWidth={2} strokeLinecap="round"/>
    </>
  );
}

// Person HANGING from a point (head at topY, body downward)
function PersonHanging(px: number, topY: number, color = "#1a237e"): React.ReactNode {
  const headR = 5, headCY = topY + headR;
  return (
    <>
      <circle cx={px} cy={headCY} r={headR} fill={color}/>
      <line x1={px} y1={headCY+headR} x2={px} y2={headCY+headR+13} stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
      <line x1={px-9} y1={headCY+headR+5} x2={px+9} y2={headCY+headR+5} stroke={color} strokeWidth={2} strokeLinecap="round"/>
      <line x1={px} y1={headCY+headR+13} x2={px-5} y2={headCY+headR+24} stroke={color} strokeWidth={2} strokeLinecap="round"/>
      <line x1={px} y1={headCY+headR+13} x2={px+5} y2={headCY+headR+24} stroke={color} strokeWidth={2} strokeLinecap="round"/>
    </>
  );
}



// ─── Shared UI ────────────────────────────────────────────────────────────────

const styles = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    background: DC.bg,
    minHeight: "100vh",
    color: DC.text,
  } as React.CSSProperties,
  inner: {
    maxWidth: 1500,
    margin: "0 auto",
    padding: "0 clamp(2rem,6vw,7rem) 5rem",
  } as React.CSSProperties,
};


function ResultCard({ label, value, unit, sub }: { label: string; value: string | number; unit?: string; sub?: string }) {
  return (
    <div style={{
      background: DC.bg, border: `1px solid ${DC.border}`,
      borderRadius: 14, padding: "22px 26px", flex: "1 1 190px",
    }}>
      <div style={{ fontFamily: DFONT, fontSize: 14, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: DC.muted, marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: DFONT, fontSize: 40, fontWeight: 900, color: DC.navy, lineHeight: 1 }}>
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
        <label style={{ fontFamily: DFONT, fontSize: 16, fontWeight: 600, color: DC.muted }}>{label}</label>
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
    <h2 style={{ fontFamily: DFONT, fontSize: 34, fontWeight: 900, color: DC.navy, marginBottom: 12, letterSpacing: "-0.01em" }}>{children}</h2>
  );
}

function SourceNote({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: DFONT, fontSize: 15, fontWeight: 400, color: DC.muted, marginTop: 16, padding: "14px 18px", background: DC.bg, border: `1px solid ${DC.border}`, borderRadius: 10, lineHeight: 1.7 }}>
      {children}
    </p>
  );
}

// ─── Calculator 1: Line Tension ───────────────────────────────────────────────

function LineTensionCalc({ units }: { units: Units }) {
  const [L, setL] = useState(100);      // line length m
  const [S, setS] = useState(3);        // sag m
  const [W, setW] = useState(75);       // body weight kg
  const [T0, setT0] = useState(2);      // pre-tension kN
  const [pos, setPos] = useState(50);   // slackliner position % from anchor A (0–100)

  const uL = units === "imperial" ? m2ft(L) : L;
  const uS = units === "imperial" ? m2ft(S) : S;
  const uW = units === "imperial" ? kg2lb(W) : W;
  const uUnit = units === "imperial";

  const setUL = (v: number) => setL(uUnit ? ft2m(v) : v);
  const setUS = (v: number) => setS(uUnit ? ft2m(v) : v);
  const setUW = (v: number) => setW(uUnit ? lb2kg(v) : v);

  // ── Physics ──────────────────────────────────────────────────────────────────
  // Slackliner at position p (0..1) along line, sag S at that point (parabolic approx)
  // Sag at position p: S_p = 4 * S_max * p * (1-p)  (parabola, max at center)
  // Angle at anchor A: tan(θ_A) = (S_p / (p * L)) → θ_A = atan(S_p / (p * L))
  // Angle at anchor B: tan(θ_B) = (S_p / ((1-p) * L)) → θ_B = atan(S_p / ((1-p) * L))
  // Force equilibrium: W*g = T_A * sin(θ_A) + T_B * sin(θ_B)
  // Horizontal: T_A * cos(θ_A) = T_B * cos(θ_B) = T_line (line tension)
  // → T_line = W*g / (tan(θ_A) + tan(θ_B)) = W*g * p*(1-p)*L / (S_p * ... )
  // Simplified for parabolic sag:
  //   T_line ≈ W*g*L / (8*S_max)  when at center (standard formula, DAV 2006)
  //   At position p: T_A = T_line / cos(θ_A),  T_B = T_line / cos(θ_B)

  const p = Math.max(0.02, Math.min(0.98, pos / 100));
  const Sp = 4 * S * p * (1 - p);       // sag at person's position
  const Sp_safe = Math.max(0.01, Sp);

  // Angles at each anchor
  const thetaA = Math.atan(Sp_safe / (p * L));       // angle at anchor A
  const thetaB = Math.atan(Sp_safe / ((1 - p) * L)); // angle at anchor B

  // Line tension (horizontal component — constant along line)
  const Tline = round2((W * G) / ((Math.tan(thetaA) + Math.tan(thetaB)) * 1000));

  // Force on each anchor = tension along the leg
  const FA_exact = round2(Tline / Math.cos(thetaA));   // force on anchor A
  const FB_exact = round2(Tline / Math.cos(thetaB));   // force on anchor B

  // Add pre-tension to each anchor
  const FA_total = round2(FA_exact + T0);
  const FB_total = round2(FB_exact + T0);


  const thetaADeg = round2(deg(thetaA));
  const thetaBDeg = round2(deg(thetaB));

  const maxForce = Math.max(FA_total, FB_total);

  // Safety status based on equipment failure, not anchor MBS
  const safetyStatus: "ok" | "caution" | "danger" =
    maxForce >= 18 ? "danger" : maxForce >= 12 ? "caution" : "ok";

  const statusColor = safetyStatus === "danger" ? DC.coral : safetyStatus === "caution" ? DC.amber : DC.teal;
  const statusLabel = safetyStatus === "danger" ? "Danger — Equipment failure risk" : safetyStatus === "caution" ? "Caution — High load, reduce tension" : "Safe — Within normal operating range";

  const wDisp = (kn: number) => `≈ ${Math.round(kN2kg(kn))} kg`;

  // ── SVG diagram ──────────────────────────────────────────────────────────────
  const svgW = 560, svgH = 280;
  const AX = 50, AY = 90, BX = svgW - 50, BY = 90;

  // Visual sag: proportional to S, reduced by pre-tension
  const pretensionStraighten = Math.max(0.1, 1 - T0 / (T0 + 5));
  const visualSagMax = Math.max(2, Math.min(svgH - AY - 60, (Sp_safe / (L * 0.005 + Sp_safe)) * (svgH - AY - 60) * pretensionStraighten));

  // Person X position on line
  const personX = AX + p * (BX - AX);
  // Person Y exactly on catenary curve (parabolic approx)
  const personY = AY + 4 * visualSagMax * p * (1 - p);

  const midSagY = AY + visualSagMax;
  const lineD = `M ${AX} ${AY} Q ${svgW / 2} ${midSagY} ${BX} ${BY}`;

  // Backup line: same anchor points but MORE sag (1.5× main visual sag + offset)
  const backupSagExtra = visualSagMax * 1.5 + 18;
  const backupMidY = AY + backupSagExtra;

  // Force arrows: point outward along the line direction at each anchor
  // Slope of line at anchor A: dy/dx from quadratic bezier derivative at t=0
  // For Q (AX,AY) (cpX,cpY) (BX,BY): slope at t=0 = 2*(cpY-AY)/(BX-AX) ... simplified:
  // angle at A: theta_A upward from horizontal
  const arrLen = 36;
  // Arrow at A points outward-left-and-upward (along line away from B)
  const arrowAEndX = AX - arrLen * Math.cos(thetaA);
  const arrowAEndY = AY - arrLen * Math.sin(thetaA);
  // Arrow at B points outward-right-and-upward
  const arrowBEndX = BX + arrLen * Math.cos(thetaB);
  const arrowBEndY = BY - arrLen * Math.sin(thetaB);

  return (
    <div>
      <SectionTitle>Line Tension & Anchor Load</SectionTitle>
      <p style={{ fontSize: 17, color: DC.muted, marginBottom: 32, lineHeight: 1.7, maxWidth: 640 }}>
        Calculates the tension in your highline and the force on each anchor based on the slackliner's position.
        Uses the DAV formula (German Alpine Club, 2006) — the standard adopted by ISA.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        {/* Controls */}
        <div>
          <SliderRow label="Line length (L)" value={uL} min={uUnit ? 33 : 10} max={uUnit ? 6561 : 2000} step={uUnit ? 10 : 1} unit={uUnit ? "ft" : "m"} onChange={setUL} />
          <SliderRow label="Sag under load (S)" value={uS} min={uUnit ? 0.2 : 0.1} max={uUnit ? 164 : 50} step={uUnit ? 0.2 : 0.1} unit={uUnit ? "ft" : "m"} onChange={setUS} />
          <SliderRow label="Body weight (W)" value={uW} min={uUnit ? 88 : 40} max={uUnit ? 330 : 150} step={1} unit={uUnit ? "lb" : "kg"} onChange={setUW} />
          <SliderRow label="Pre-tension (T₀)" value={T0} min={0} max={15} step={0.5} unit="kN" onChange={setT0} />

          <div style={{ marginTop: 24, padding: "18px 20px", background: DC.bg, borderRadius: 12, border: `1px solid ${DC.border}` }}>
            <div style={{ fontFamily: DFONT, fontSize: 14, fontWeight: 700, color: DC.muted, marginBottom: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Slackliner position along the line
            </div>
            <SliderRow
              label={`Position: ${pos}% from Anchor A`}
              value={pos} min={5} max={95} step={1} unit="%"
              onChange={v => setPos(v)}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: DFONT, fontSize: 13, color: DC.muted, marginTop: -8 }}>
              <span>Anchor A</span>
              <span>Center</span>
              <span>Anchor B</span>
            </div>
          </div>

          {/* Status badge */}
          <div style={{ marginTop: 20, padding: "16px 20px", borderRadius: 12, background: `${statusColor}15`, border: `2px solid ${statusColor}`, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: statusColor, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: DFONT, fontSize: 16, fontWeight: 800, color: statusColor }}>{statusLabel}</div>
              <div style={{ fontFamily: DFONT, fontSize: 14, color: DC.muted, marginTop: 2 }}>
                Max force: <strong style={{ color: statusColor }}>{maxForce} kN</strong>
                {safetyStatus !== "ok" && " — Reduce sag or pre-tension"}
              </div>
            </div>
          </div>
        </div>

        {/* Diagram + Results */}
        <div>
          <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ marginBottom: 20, borderRadius: 12, background: DC.white, border: `1px solid ${DC.border}` }}>
            <defs>
              <marker id="arrT" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke={DC.coral} strokeWidth={1.5}/>
              </marker>
            </defs>

            {/* Backup line — dashed, curves MORE than main line */}
            <path
              d={`M ${AX} ${AY} Q ${svgW / 2} ${backupMidY} ${BX} ${BY}`}
              fill="none" stroke={DC.muted} strokeWidth={1.5} strokeDasharray="6,4" opacity={0.55}/>
            <text x={svgW/2 + 6} y={backupMidY + 14} fontSize={12} fill={DC.muted} fontFamily={DFONT} fontWeight="600" textAnchor="start">Backup</text>

            {/* Main line */}
            <path d={lineD} fill="none" stroke={DC.navy} strokeWidth={3}/>
            <path d={lineD} fill="none" stroke={DC.blue} strokeWidth={1.5} opacity={0.5}/>

            {/* Force arrows at anchors — outward along line direction */}
            <line
              x1={AX} y1={AY}
              x2={arrowAEndX} y2={arrowAEndY}
              stroke={DC.coral} strokeWidth={2.5} markerEnd="url(#arrT)"
            />
            <line
              x1={BX} y1={BY}
              x2={arrowBEndX} y2={arrowBEndY}
              stroke={DC.coral} strokeWidth={2.5} markerEnd="url(#arrT)"
            />

            {/* Force labels */}
            <text x={arrowAEndX - 4} y={arrowAEndY - 8} fontSize={13} fill={DC.coral} fontFamily={DFONT} fontWeight="800" textAnchor="middle">{FA_total} kN</text>
            <text x={arrowBEndX + 4} y={arrowBEndY - 8} fontSize={13} fill={DC.coral} fontFamily={DFONT} fontWeight="800" textAnchor="middle">{FB_total} kN</text>

            {/* Anchor dots */}
            <circle cx={AX} cy={AY} r={8} fill={DC.navy}/>
            <circle cx={AX} cy={AY} r={4} fill={DC.blue}/>
            <circle cx={BX} cy={BY} r={8} fill={DC.navy}/>
            <circle cx={BX} cy={BY} r={4} fill={DC.blue}/>

            {/* Anchor labels */}
            <text x={AX} y={AY + 22} fontSize={14} fill={DC.navy} fontFamily={DFONT} fontWeight="700" textAnchor="middle">A</text>
            <text x={BX} y={BY + 22} fontSize={14} fill={DC.navy} fontFamily={DFONT} fontWeight="700" textAnchor="middle">B</text>

            {/* Person standing ON the catenary — feet at personY */}
            {PersonOnLine(personX, personY, DC.navy)}
          </svg>

          {/* Result cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <ResultCard label="Force on Anchor A" value={uUnit ? kN2lbf(FA_total) : FA_total} unit={uUnit ? "lbf" : "kN"} sub={`${wDisp(FA_total)} · θ=${thetaADeg}°`} />
            <ResultCard label="Force on Anchor B" value={uUnit ? kN2lbf(FB_total) : FB_total} unit={uUnit ? "lbf" : "kN"} sub={`${wDisp(FB_total)} · θ=${thetaBDeg}°`} />
            <ResultCard label="Line tension (T)" value={uUnit ? kN2lbf(Tline) : Tline} unit={uUnit ? "lbf" : "kN"} sub="horizontal component" />
            <ResultCard label="Pre-tension (T₀)" value={uUnit ? kN2lbf(T0) : T0} unit={uUnit ? "lbf" : "kN"} sub="applied before load" />
          </div>
        </div>
      </div>

      <SourceNote>
        FORMULAS: Sag at position p: S(p) = 4·S_max·p·(1-p). Line tension: T = W·g / (tan θ_A + tan θ_B).
        Anchor forces: F_A = T / cos θ_A, F_B = T / cos θ_B. Pre-tension adds directly to anchor force.
        DAV Research (2006), ISA Safety Standards. Static load only — dynamic loads can be 1.5–3× higher.
      </SourceNote>

      {/* ── Education section ── */}
      <div style={{ marginTop: 60, borderTop: `2px solid ${DC.border}`, paddingTop: 48 }}>
        <h3 style={{ fontFamily: DFONT, fontSize: 28, fontWeight: 800, color: DC.navy, marginBottom: 36, letterSpacing: "-0.01em" }}>Understanding the Physics</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* What is sag */}
          <div style={{ background: DC.bg, borderRadius: 14, padding: "28px 28px", borderLeft: `5px solid ${DC.blue}` }}>
            <h4 style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 800, color: DC.navy, marginBottom: 12 }}>What is Sag (S)?</h4>
            <p style={{ fontFamily: DFONT, fontSize: 16, color: DC.muted, lineHeight: 1.8, margin: 0 }}>
              Sag is the vertical distance between the anchor points and the lowest point of the line when loaded.
              A deeper sag <strong style={{ color: DC.navy }}>reduces</strong> the tension in the line.
              A shallow (tight) line dramatically <strong style={{ color: DC.coral }}>increases</strong> anchor forces.
              Most riggers aim for 3–6% of line length as minimum safe sag.
            </p>
          </div>

          {/* What is kN */}
          <div style={{ background: DC.bg, borderRadius: 14, padding: "28px 28px", borderLeft: `5px solid ${DC.teal}` }}>
            <h4 style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 800, color: DC.navy, marginBottom: 12 }}>What is kN?</h4>
            <p style={{ fontFamily: DFONT, fontSize: 16, color: DC.muted, lineHeight: 1.8, margin: 0 }}>
              Kilonewton (kN) is a unit of force. 1 kN ≈ 102 kg of force (at Earth's gravity).
              A 75 kg person exerts about <strong style={{ color: DC.navy }}>0.74 kN</strong> of gravitational force.
              Highline anchors routinely experience <strong style={{ color: DC.coral }}>10–20 kN</strong> due to the line geometry.
            </p>
          </div>

          {/* MBS vs WLL */}
          <div style={{ background: DC.bg, borderRadius: 14, padding: "28px 28px", borderLeft: `5px solid ${DC.coral}` }}>
            <h4 style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 800, color: DC.navy, marginBottom: 12 }}>MBS vs WLL</h4>
            <p style={{ fontFamily: DFONT, fontSize: 16, color: DC.muted, lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: DC.navy }}>MBS (Minimum Breaking Strength)</strong> is the force at which a new piece of equipment is guaranteed to break.
              <strong style={{ color: DC.navy }}> WLL (Working Load Limit)</strong> is the maximum safe working load, typically MBS ÷ 10 for dynamic use.
              Slackline equipment typically fails between <strong style={{ color: DC.coral }}>15–25 kN</strong>. The weakest link in your system sets the limit.
            </p>
          </div>

          {/* Position effect */}
          <div style={{ background: DC.bg, borderRadius: 14, padding: "28px 28px", borderLeft: `5px solid ${DC.amber}` }}>
            <h4 style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 800, color: DC.navy, marginBottom: 12 }}>Position Changes the Load</h4>
            <p style={{ fontFamily: DFONT, fontSize: 16, color: DC.muted, lineHeight: 1.8, margin: 0 }}>
              When the slackliner is at the <strong style={{ color: DC.navy }}>center</strong>, both anchors share the load equally.
              Moving toward one anchor increases the force on that anchor and reduces the other.
              The <strong style={{ color: DC.coral }}>nearest anchor always carries more force</strong> than the far one.
              Use the position slider to see how this changes dynamically.
            </p>
          </div>

          {/* Formulas */}
          <div style={{ background: DC.navy, borderRadius: 14, padding: "28px 28px", gridColumn: "1 / -1" }}>
            <h4 style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 800, color: DC.white, marginBottom: 16 }}>Key Formulas</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              {[
                { label: "Sag at position p", formula: "S(p) = 4 · S_max · p · (1−p)", note: "Parabolic model" },
                { label: "Anchor A angle", formula: "θ_A = arctan( S(p) / (p · L) )", note: "Measured from horizontal" },
                { label: "Line tension", formula: "T = W·g / (tan θ_A + tan θ_B)", note: "Horizontal component" },
                { label: "Force on Anchor A", formula: "F_A = T / cos(θ_A) + T₀", note: "Includes pre-tension" },
                { label: "Approx. (DAV, center)", formula: "F ≈ W·g·L / (4·S)", note: "Person at midpoint" },
                { label: "Exact (any position)", formula: "F = W·g / (2·sin θ)", note: "Symmetric case" },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontFamily: DFONT, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{f.label}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 600, color: DC.blue, marginBottom: 4 }}>{f.formula}</div>
                  <div style={{ fontFamily: DFONT, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{f.note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic loads */}
          <div style={{ background: DC.bg, borderRadius: 14, padding: "28px 28px", gridColumn: "1 / -1", borderLeft: `5px solid ${DC.coral}` }}>
            <h4 style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 800, color: DC.navy, marginBottom: 12 }}>Dynamic Loads: Why Real Forces Are Higher</h4>
            <p style={{ fontFamily: DFONT, fontSize: 16, color: DC.muted, lineHeight: 1.8, marginBottom: 16 }}>
              This calculator shows <strong style={{ color: DC.navy }}>static loads</strong> — the forces when the system is in equilibrium.
              In reality, highline forces are <strong style={{ color: DC.coral }}>dynamic</strong>: a fall, a bounce, or sudden movement
              can multiply the static force by <strong style={{ color: DC.coral }}>1.5× to 3×</strong> or more.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {[
                { situation: "Static (standing still)", multiplier: "1.0×", color: DC.teal },
                { situation: "Walking / bouncing gently", multiplier: "1.2–1.5×", color: DC.amber },
                { situation: "Fall onto the line", multiplier: "1.5–2.5×", color: DC.coral },
                { situation: "Leash fall (backup loaded)", multiplier: "2–4×", color: DC.coral },
                { situation: "Slam factor (rigid anchor)", multiplier: "up to 6×", color: DC.navy },
                { situation: "Why we use safety factors", multiplier: "MBS ÷ 10 = WLL", color: DC.navy },
              ].map(s => (
                <div key={s.situation} style={{ background: C_white, borderRadius: 10, padding: "16px 18px", borderTop: `4px solid ${s.color}` }}>
                  <div style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.multiplier}</div>
                  <div style={{ fontFamily: DFONT, fontSize: 14, color: DC.muted, lineHeight: 1.5 }}>{s.situation}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


// ─── Calculator 2: Anchor Angle ───────────────────────────────────────────────

function AnchorAngleCalc({ units }: { units: Units }) {
  const [F, setF] = useState(10);
  const [numLegs, setNumLegs] = useState<2|3|4>(2);
  const [alpha, setAlpha] = useState(60);
  const [beta, setBeta] = useState(30);
  const [showElevated, setShowElevated] = useState(false);

  const betaR = rad(beta);
  const alphaR = rad(alpha);

  let Fleg: number;
  let formula: string;

  if (showElevated && beta > 0) {
    const sinB = Math.sin(betaR);
    Fleg = sinB < 0.001 ? 999 : round2(F / (numLegs * sinB));
    formula = `F_leg = F / (n × sin β) = ${F} / (${numLegs} × sin ${beta}°) = ${Fleg < 500 ? Fleg : "∞"} kN`;
  } else {
    if (numLegs === 2) {
      const c = Math.cos(alphaR / 2);
      Fleg = c < 0.001 ? 999 : round2(F / (2 * c));
      formula = `F_leg = F / (2 × cos(α/2)) = ${F} / (2 × cos ${alpha/2}°) = ${Fleg < 500 ? Fleg : "∞"} kN`;
    } else if (numLegs === 3) {
      const c = Math.cos(alphaR / 3);
      Fleg = c < 0.001 ? 999 : round2(F / (3 * c));
      formula = `F_leg ≈ F / (3 × cos(α/3)) = ${F} / (3 × cos ${round1(alpha/3)}°) = ${Fleg < 500 ? Fleg : "∞"} kN`;
    } else {
      const c = Math.cos(alphaR / 2);
      Fleg = c < 0.001 ? 999 : round2(F / (4 * c));
      formula = `F_leg = F / (4 × cos(α/2)) = ${F} / (4 × cos ${alpha/2}°) = ${Fleg < 500 ? Fleg : "∞"} kN`;
    }
  }

  const K = round2(Fleg / F);
  const danger = Fleg >= F || (alpha >= 120 && numLegs === 2 && !showElevated);
  const warn = Fleg >= F * 0.7 || (alpha >= 90 && numLegs === 2 && !showElevated);
  const col = danger ? DC.coral : warn ? DC.amber : DC.teal;

  // ── Top-view geometry ────────────────────────────────────────────────────────
  // Layout: diagram left (x 0..360), labels right (x 360..480)
  const mpX = 170, mpY = 90, legLen = 110;
  const topW = 480, topH = 300;

  const legPositions: { x: number; y: number; angleDeg: number }[] = [];
  for (let i = 0; i < numLegs; i++) {
    const angleDeg = numLegs <= 1 ? 0 : -alpha / 2 + (alpha / (numLegs - 1)) * i;
    const r = rad(angleDeg);
    legPositions.push({
      x: mpX + legLen * Math.sin(r),
      y: mpY + legLen * Math.cos(r),
      angleDeg,
    });
  }

  // Angle arc
  const arcR = 44;
  const arcPath = alpha > 5 && alpha < 175
    ? `M ${mpX + arcR * Math.sin(rad(-alpha/2))} ${mpY + arcR * Math.cos(rad(-alpha/2))}
       A ${arcR} ${arcR} 0 0 0
       ${mpX + arcR * Math.sin(rad(alpha/2))} ${mpY + arcR * Math.cos(rad(alpha/2))}`
    : "";

  return (
    <div>
      <SectionTitle>Anchor Angle & Elevation</SectionTitle>
      <p style={{ fontFamily: DFONT, fontSize: 17, color: DC.muted, marginBottom: 28, lineHeight: 1.7, maxWidth: 640 }}>
        Calculates the force on each anchor leg for symmetric 2, 3 and 4-leg systems.
        For elevated master points (A-frame / cavalete), the upward angle of each leg
        reduces the force per bolt.
      </p>

      {danger && (
        <div style={{ background: `${DC.coral}15`, border: `2px solid ${DC.coral}`, borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ fontFamily: DFONT, fontSize: 16, fontWeight: 800, color: DC.coral }}>Danger — Reduce spread angle or increase elevation</div>
        </div>
      )}

      {/* Mode selector */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        {[false, true].map(elevated => (
          <button key={String(elevated)} onClick={() => setShowElevated(elevated)} style={{
            fontFamily: DFONT, fontSize: 15, fontWeight: 700, padding: "10px 22px", borderRadius: 10,
            border: "2px solid", cursor: "pointer",
            borderColor: showElevated === elevated ? DC.blue : DC.border,
            background: showElevated === elevated ? `${DC.blue}12` : DC.white,
            color: showElevated === elevated ? DC.blue : DC.muted,
          }}>
            {elevated ? "⬆ Elevated master point" : "↔ Flat anchor (spread)"}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        {/* Controls */}
        <div>
          {/* Leg selector */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: DFONT, fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: DC.muted, marginBottom: 12 }}>Number of anchor legs</div>
            <div style={{ display: "flex", gap: 10 }}>
              {([2, 3, 4] as const).map(n => (
                <button key={n} onClick={() => setNumLegs(n)} style={{
                  flex: 1, padding: "14px 0", borderRadius: 12, cursor: "pointer",
                  fontFamily: DFONT, fontSize: 24, fontWeight: 900,
                  border: "2px solid",
                  borderColor: numLegs === n ? DC.blue : DC.border,
                  background: numLegs === n ? `${DC.blue}10` : DC.white,
                  color: numLegs === n ? DC.blue : DC.navy,
                }}>
                  {n}
                  <span style={{ fontFamily: DFONT, fontSize: 12, display: "block", color: DC.muted, fontWeight: 600, marginTop: 4 }}>
                    {n === 2 ? "Sliding-X / BFK" : n === 3 ? "Sliding-X / BFK" : "Sliding-X / BFK"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <SliderRow label="Load on master point (F)" value={F} min={1} max={50} step={0.5} unit="kN" onChange={setF} />

          {!showElevated && (
            <SliderRow
              label="Angle between legs (α)"
              value={alpha} min={0} max={179} step={1} unit="°" onChange={setAlpha}
            />
          )}

          {showElevated && (
            <>
              <SliderRow label="Elevation angle (β)" value={beta} min={1} max={90} step={1} unit="°" onChange={setBeta} />
              {beta < 15 && (
                <div style={{ background: `${DC.amber}15`, border: `1px solid ${DC.amber}`, borderRadius: 10, padding: "12px 16px", marginBottom: 14, fontFamily: DFONT, fontSize: 15, color: DC.navy }}>
                  Very shallow elevation (β &lt; 15°) — forces are very high.
                </div>
              )}
            </>
          )}

          {/* Results */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
            <ResultCard label={`Force per leg (×${numLegs})`} value={Fleg >= 500 ? "∞" : units === "imperial" ? kN2lbf(Fleg) : Fleg} unit={Fleg >= 500 ? "" : units === "imperial" ? "lbf" : "kN"} sub={Fleg < 500 ? `≈ ${Math.round(kN2kg(Fleg))} kg` : "Impossible geometry"} />
            <ResultCard label="Load multiplier" value={Fleg >= 500 ? "∞" : `${K}×`} unit="" />
            <ResultCard label="Total system load" value={Fleg < 500 ? round2(Fleg * numLegs) : "∞"} unit="kN" sub="sum of all legs" />
          </div>

          <div style={{ background: DC.bg, borderRadius: 10, padding: "14px 16px", marginTop: 14, fontFamily: "'DM Mono', monospace", fontSize: 14, color: DC.muted, lineHeight: 1.6 }}>
            {formula}
          </div>
        </div>

        {/* Diagrams */}
        <div>
          {!showElevated ? (
            <>
              <div style={{ fontFamily: DFONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: DC.muted, marginBottom: 8 }}>
                Top view — anchor spread
              </div>
              <svg width="100%" viewBox={`0 0 ${topW} ${topH}`} style={{ borderRadius: 12, background: DC.white, border: `1px solid ${DC.border}`, marginBottom: 12 }}>
                <defs>
                  <marker id="arrowUp2" viewBox="0 0 10 10" refX={5} refY={2} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
                    <path d="M1 9L5 1L9 9" fill="none" stroke={DC.navy} strokeWidth={1.5}/>
                  </marker>
                  <marker id="arrLeg" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
                    <path d="M2 1L8 5L2 9" fill="none" stroke={col} strokeWidth={1.5}/>
                  </marker>
                </defs>

                {/* Load arrow pointing UP from master point */}
                <line x1={mpX} y1={mpY - 16} x2={mpX} y2={mpY - 60}
                  stroke={DC.navy} strokeWidth={2.5} markerEnd="url(#arrowUp2)"/>
                <text x={mpX + 8} y={mpY - 44} fontSize={13} fill={DC.navy} fontFamily={DFONT} fontWeight="700">F = {F} kN</text>

                {/* Legs with arrow toward MP */}
                {legPositions.map((leg, i) => {
                  const dx = mpX - leg.x, dy = mpY - leg.y;
                  const dist = Math.sqrt(dx*dx + dy*dy);
                  const ux = dx/dist, uy = dy/dist;
                  // Arrow starting from near the bolt, pointing toward MP
                  const arrowStartX = leg.x + ux * 18, arrowStartY = leg.y + uy * 18;
                  const arrowEndX = leg.x + ux * 46, arrowEndY = leg.y + uy * 46;
                  return (
                    <g key={i}>
                      <line x1={mpX} y1={mpY} x2={leg.x} y2={leg.y} stroke={col} strokeWidth={3} strokeLinecap="round"/>
                      {/* Arrow on leg pointing toward MP */}
                      <line x1={arrowStartX} y1={arrowStartY} x2={arrowEndX} y2={arrowEndY} stroke={col} strokeWidth={2.5} markerEnd="url(#arrLeg)"/>
                      {/* Bolt */}
                      <circle cx={leg.x} cy={leg.y} r={8} fill={DC.navy}/>
                      <circle cx={leg.x} cy={leg.y} r={4} fill={DC.blue}/>
                    </g>
                  );
                })}

                {/* Master point */}
                <circle cx={mpX} cy={mpY} r={11} fill={col}/>
                <circle cx={mpX} cy={mpY} r={5} fill={DC.white}/>
                {/* "Master Point" label next to the circle, not on it */}
                <text x={mpX + 16} y={mpY + 5} fontSize={13} fill={DC.navy} fontFamily={DFONT} fontWeight="700">Master Point</text>

                {/* Angle arc — concave DOWNWARD from master point (toward legs, not away) */}
                {arcPath && (
                  <path d={arcPath} fill="none" stroke={DC.muted} strokeWidth={1.5} strokeDasharray="4,3"/>
                )}

                {/* Divider line */}
                <line x1={355} y1={20} x2={355} y2={topH - 20} stroke={DC.border} strokeWidth={1}/>

                {/* Labels on RIGHT side — angles only */}
                <text x={365} y={46} fontSize={13} fill={DC.navy} fontFamily={DFONT} fontWeight="800">α = {alpha}°</text>
                <text x={365} y={64} fontSize={11} fill={DC.muted} fontFamily={DFONT} fontWeight="600">outer legs angle</text>
                {numLegs >= 3 && (
                  <>
                    <text x={365} y={92} fontSize={13} fill={DC.navy} fontFamily={DFONT} fontWeight="800">{round1(alpha / (numLegs - 1))}°</text>
                    <text x={365} y={110} fontSize={11} fill={DC.muted} fontFamily={DFONT} fontWeight="600">per-leg angle</text>
                  </>
                )}
                <text x={365} y={numLegs >= 3 ? 138 : 104} fontSize={13} fill={col} fontFamily={DFONT} fontWeight="800">{Fleg < 500 ? round2(Fleg) : "∞"} kN</text>
                <text x={365} y={numLegs >= 3 ? 156 : 122} fontSize={11} fill={DC.muted} fontFamily={DFONT} fontWeight="600">per leg</text>
                <text x={365} y={numLegs >= 3 ? 184 : 150} fontSize={13} fill={DC.navy} fontFamily={DFONT} fontWeight="800">{K}×</text>
                <text x={365} y={numLegs >= 3 ? 202 : 168} fontSize={11} fill={DC.muted} fontFamily={DFONT} fontWeight="600">multiplier</text>
              </svg>
            </>
          ) : (
            <>
              <div style={{ fontFamily: DFONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: DC.muted, marginBottom: 8 }}>
                3D view — A-frame elevated anchor ({numLegs} legs, β = {beta}°)
              </div>
              {/* 3D isometric projection of n-leg elevated A-frame */}
              {(() => {
                const W3 = 480, H3 = 280;
                // Isometric helpers: world (x,y,z) → screen
                const iso = (wx: number, wy: number, wz: number) => ({
                  sx: W3/2 + (wx - wy) * 0.7 * 38,
                  sy: H3/2 - wz * 38 + (wx + wy) * 0.4 * 22,
                });
                // MP at world (0,0,1.8) — elevated above ground origin
                const mpH = 1.8 + beta * 0.025; // height scales with beta
                const MP = iso(0,0,mpH);
                // Ground plane center
                const GC = iso(0,0,0);
                // Bolt positions on ground: n legs at equal angles around MP projection
                const boltRadius = 1.4;
                const bolts = Array.from({length:numLegs}, (_,i) => {
                  const angle = (2 * Math.PI * i / numLegs) - Math.PI/2;
                  const bx3 = boltRadius * Math.cos(angle);
                  const by3 = boltRadius * Math.sin(angle);
                  return { w:{x:bx3,y:by3,z:0}, s:iso(bx3,by3,0), angle };
                });
                // Ground grid lines
                const gridLines: React.ReactNode[] = [];
                for (let gx=-2; gx<=2; gx++) {
                  const a = iso(gx,-2,0), b = iso(gx,2,0);
                  gridLines.push(<line key={"gx"+gx} x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy} stroke={DC.border} strokeWidth={0.8} opacity={0.5}/>);
                }
                for (let gy=-2; gy<=2; gy++) {
                  const a = iso(-2,gy,0), b = iso(2,gy,0);
                  gridLines.push(<line key={"gy"+gy} x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy} stroke={DC.border} strokeWidth={0.8} opacity={0.5}/>);
                }
                // Vertical guide from ground to MP
                const mpGround = iso(0,0,0);
                // Force downward arrow at MP
                const mpAbove = iso(0,0,mpH+0.9);
                return (
                  <svg width="100%" viewBox={`0 0 ${W3} ${H3}`} style={{ borderRadius:12, background:DC.white, border:`1px solid ${DC.border}`, marginBottom:12 }}>
                    <defs>
                      <marker id="arr3d" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto">
                        <path d="M2 1L8 5L2 9" fill="none" stroke={DC.coral} strokeWidth={1.5}/>
                      </marker>
                      <marker id="arrDown3d" viewBox="0 0 10 10" refX={5} refY={8} markerWidth={7} markerHeight={7} orient="auto">
                        <path d="M1 1L5 9L9 1" fill="none" stroke={DC.navy} strokeWidth={1.5}/>
                      </marker>
                    </defs>
                    {/* Ground grid */}
                    {gridLines}
                    {/* Vertical guide dashed */}
                    <line x1={mpGround.sx} y1={mpGround.sy} x2={MP.sx} y2={MP.sy} stroke={DC.muted} strokeWidth={1} strokeDasharray="4,3" opacity={0.4}/>
                    {/* Legs from bolts to MP */}
                    {bolts.map((b,i) => (
                      <g key={i}>
                        <line x1={b.s.sx} y1={b.s.sy} x2={MP.sx} y2={MP.sy} stroke={col} strokeWidth={3} strokeLinecap="round"/>
                        {/* Arrow on leg toward MP — midpoint arrow */}
                        {(() => {
                          const mx = (b.s.sx + MP.sx)/2, my = (b.s.sy + MP.sy)/2;
                          const dx = MP.sx - b.s.sx, dy = MP.sy - b.s.sy;
                          const d = Math.sqrt(dx*dx+dy*dy);
                          const ax = mx + dx/d*10, ay = my + dy/d*10;
                          return <line x1={mx-dx/d*4} y1={my-dy/d*4} x2={ax} y2={ay} stroke={col} strokeWidth={2} markerEnd="url(#arr3d)"/>;
                        })()}
                        {/* Bolt circle */}
                        <circle cx={b.s.sx} cy={b.s.sy} r={7} fill={DC.navy}/>
                        <circle cx={b.s.sx} cy={b.s.sy} r={3.5} fill={DC.blue}/>
                        {/* Bolt label */}
                        <text x={b.s.sx + 10} y={b.s.sy + 4} fontSize={11} fill={DC.muted} fontFamily={DFONT} fontWeight="600">Bolt {i+1}</text>
                      </g>
                    ))}
                    {/* Force arrow DOWN at MP */}
                    <line x1={mpAbove.sx} y1={mpAbove.sy} x2={MP.sx+2} y2={MP.sy+2} stroke={DC.navy} strokeWidth={2.5} markerEnd="url(#arrDown3d)"/>
                    <text x={mpAbove.sx+6} y={mpAbove.sy+4} fontSize={13} fill={DC.navy} fontFamily={DFONT} fontWeight="800">F={F} kN</text>
                    {/* Master point */}
                    <circle cx={MP.sx} cy={MP.sy} r={12} fill={col}/>
                    <circle cx={MP.sx} cy={MP.sy} r={6} fill={DC.white}/>
                    <text x={MP.sx-50} y={MP.sy-16} fontSize={13} fill={DC.navy} fontFamily={DFONT} fontWeight="800">Master Point</text>
                    {/* β and force labels */}
                    <text x={W3-110} y={40} fontSize={13} fill={DC.navy} fontFamily={DFONT} fontWeight="800">β = {beta}°</text>
                    <text x={W3-110} y={58} fontSize={11} fill={DC.muted} fontFamily={DFONT} fontWeight="600">elevation angle</text>
                    <text x={W3-110} y={86} fontSize={13} fill={col} fontFamily={DFONT} fontWeight="800">{Fleg < 500 ? round2(Fleg) : "∞"} kN</text>
                    <text x={W3-110} y={104} fontSize={11} fill={DC.muted} fontFamily={DFONT} fontWeight="600">per leg</text>
                    <text x={W3-110} y={132} fontSize={13} fill={DC.navy} fontFamily={DFONT} fontWeight="800">{numLegs} legs</text>
                    <text x={W3-110} y={150} fontSize={11} fill={DC.muted} fontFamily={DFONT} fontWeight="600">F_leg = F/(n·sinβ)</text>
                  </svg>
                );
              })()}
            </>
          )}
        </div>
      </div>

      {/* ── Education section ── */}
      <div style={{ marginTop: 60, borderTop: `2px solid ${DC.border}`, paddingTop: 48 }}>
        <h3 style={{ fontFamily: DFONT, fontSize: 28, fontWeight: 800, color: DC.navy, marginBottom: 36 }}>Understanding Anchor Angles</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          <div style={{ background: DC.bg, borderRadius: 14, padding: "28px", borderLeft: `5px solid ${DC.blue}` }}>
            <h4 style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 800, color: DC.navy, marginBottom: 12 }}>The Golden Rule: Stay Below 60°</h4>
            <p style={{ fontFamily: DFONT, fontSize: 16, color: DC.muted, lineHeight: 1.8, margin: 0 }}>
              With a 2-leg anchor at <strong style={{ color: DC.navy }}>60°</strong> spread, each leg carries exactly the full load (1.0×).
              At 90°, each leg carries <strong style={{ color: DC.amber }}>1.41×</strong> the load.
              At 120°, each leg carries <strong style={{ color: DC.coral }}>2×</strong> the load — the most fragile equipment may fail.
              ISA recommends keeping the spread angle under 60°.
            </p>
          </div>

          <div style={{ background: DC.bg, borderRadius: 14, padding: "28px", borderLeft: `5px solid ${DC.teal}` }}>
            <h4 style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 800, color: DC.navy, marginBottom: 12 }}>A-Frame (Cavalete) Effect</h4>
            <p style={{ fontFamily: DFONT, fontSize: 16, color: DC.muted, lineHeight: 1.8, margin: 0 }}>
              When the master point is elevated above the bolts, the legs run at an upward angle β.
              The vertical component of each leg's force supports the load, dramatically <strong style={{ color: DC.teal }}>reducing</strong> the force per bolt.
              At β = 30°, each of 2 legs carries F/2 = 50% of the total load.
              At β = 90° (vertical), each leg carries F/n exactly.
            </p>
          </div>

          <div style={{ background: DC.bg, borderRadius: 14, padding: "28px", borderLeft: `5px solid ${DC.coral}` }}>
            <h4 style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 800, color: DC.navy, marginBottom: 12 }}>Sliding-X vs BFK vs Equalette</h4>
            <p style={{ fontFamily: DFONT, fontSize: 16, color: DC.muted, lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: DC.navy }}>Sliding-X / Magic X</strong>: 2-leg system, self-equalizing, no extension on failure. Simple and widely used.<br/>
              <strong style={{ color: DC.navy }}>BFK (Bowline Knot Fixo)</strong>: 2-leg with fixed master point, very strong and common in Brazil.<br/>
              <strong style={{ color: DC.navy }}>Equalette</strong>: 3-leg, redundant, used for critical highline anchors.
            </p>
          </div>

          <div style={{ background: DC.navy, borderRadius: 14, padding: "28px" }}>
            <h4 style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 800, color: DC.white, marginBottom: 16 }}>Key Formulas</h4>
            {[
              { label: "2-leg flat anchor", formula: "F_leg = F / (2 × cos(α/2))", note: "α = angle between legs" },
              { label: "3-leg flat anchor", formula: "F_leg ≈ F / (3 × cos(α/3))", note: "Equalized loading" },
              { label: "Elevated n-leg", formula: "F_leg = F / (n × sin β)", note: "β = elevation above horizontal" },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 18 }}>
                <div style={{ fontFamily: DFONT, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 600, color: DC.blue, marginBottom: 2 }}>{f.formula}</div>
                <div style={{ fontFamily: DFONT, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{f.note}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}



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

  // Athanasiadis midline formula: minimum height for clearance
  const requiredH = 2 * (leash + backupSag);
  const clearanceOk = height > requiredH;
  const margin = round1(height - requiredH);

  // Peak backup force — energy method
  // k (spring constant) = W*g / (stretch_factor * L)  [N/m]
  const stretchFactor = webbing === "dyneema" ? 0.01 : webbing === "nylon" ? 0.05 : 0.25;
  const k_approx = (weight * G) / (stretchFactor * Math.max(1, lineLen)); // N/m
  const fallDist = leash; // fall = leash length before backup arrests
  // F_peak = W*g * (1 + sqrt(1 + 2*k*d/(W*g)))
  const peakForce = round2(weight * G * (1 + Math.sqrt(1 + (2 * k_approx * fallDist) / (weight * G))) / 1000);
  const clampedForce = Math.min(peakForce, 40);

  // Est. fall distance (to lowest point of person)
  const estFallDist = round1(leash + backupSag * 0.3);

  // ── SVG Diagram ──────────────────────────────────────────────────────────────
  // SVG coordinate system: y increases downward
  const bW = 560, bH = 320;
  const bGroundY = bH - 30;

  // Scale: height maps to pixel distance. Clamp so diagram is always visible.
  // 1m = ~4px, but anchored so ground = bGroundY, line = bGroundY - height*px
  const pxPerM = Math.min(6.5, (bH - 80) / Math.max(1, height));
  const bLineY = Math.max(44, bGroundY - height * pxPerM);
  const bAX = 40, bBX = bW - 40;

  // Backup line: sags below main line
  const backupSagPx = Math.max(10, Math.min(70, backupSag * pxPerM * 2));
  const backupMidY = bLineY + 8 + backupSagPx;

  // Person hangs from backup midpoint by leash
  const bPersonX = bW / 2;
  const leashPx = Math.max(12, Math.min(50, leash * pxPerM * 2.5));
  // Leash attaches to backup mid, person feet hang down
  const leashTopY = backupMidY; // attachment point on backup
  const personTopY = leashTopY + leashPx; // where person's head is (hanging)

  return (
    <div>
      <SectionTitle>Backup Fall Simulator</SectionTitle>
      <p style={{ fontFamily: DFONT, fontSize: 17, color: DC.muted, marginBottom: 28, lineHeight: 1.7, maxWidth: 640 }}>
        Simulates forces when the main line fails and the backup is loaded.
        Uses the Athanasiadis (2013) model adopted by ISA for minimum height requirements.
      </p>

      {/* ── DIAGRAM FIRST ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: DFONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: DC.muted, marginBottom: 8 }}>
          Side view — after main line failure
        </div>
        <svg width="100%" viewBox={`0 0 ${bW} ${bH}`} style={{ borderRadius: 12, background: DC.white, border: `1px solid ${DC.border}` }}>
          <defs>
            <marker id="arrH2" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M2 1L8 5L2 9" fill="none" stroke={DC.blue} strokeWidth={1.5}/>
            </marker>
          </defs>

          {/* Ground — colored by clearance status */}
          <line x1={0} y1={bGroundY} x2={bW} y2={bGroundY} stroke={clearanceOk ? DC.teal : DC.coral} strokeWidth={3}/>
          {/* Ground hatch marks */}
          {Array.from({length: Math.floor(bW/20)}).map((_,i) => (
            <line key={i} x1={i*20+4} y1={bGroundY} x2={i*20} y2={bGroundY+10} stroke={clearanceOk ? DC.teal : DC.coral} strokeWidth={1} opacity={0.4}/>
          ))}
          <text x={10} y={bGroundY - 6} fontSize={13} fill={clearanceOk ? DC.teal : DC.coral} fontFamily={DFONT} fontWeight="700">Ground</text>

          {/* Main line — dashed (broken) */}
          <line x1={bAX} y1={bLineY} x2={bBX} y2={bLineY} stroke={DC.navy} strokeWidth={2.5} strokeDasharray="8,5" opacity={0.45}/>
          <text x={bAX + 6} y={bLineY - 8} fontSize={13} fill={DC.navy} fontFamily={DFONT} fontWeight="700" opacity={0.5}>Main line (failed)</text>

          {/* Anchor circles — same style as Line Tension calc */}
          <circle cx={bAX} cy={bLineY} r={8} fill={DC.navy}/>
          <circle cx={bAX} cy={bLineY} r={4} fill={DC.blue}/>
          <circle cx={bBX} cy={bLineY} r={8} fill={DC.navy}/>
          <circle cx={bBX} cy={bLineY} r={4} fill={DC.blue}/>

          {/* Backup line — dashed, curves below main line */}
          <path
            d={`M ${bAX} ${bLineY} Q ${bW/2} ${backupMidY} ${bBX} ${bLineY}`}
            fill="none" stroke={DC.muted} strokeWidth={2} strokeDasharray="6,4"/>
          <text x={bAX + 6} y={backupMidY + 16} fontSize={13} fill={DC.muted} fontFamily={DFONT} fontWeight="700">Backup line</text>

          {/* Red leash from backup to person (person hangs from it) */}
          <line x1={bPersonX} y1={leashTopY} x2={bPersonX} y2={personTopY}
            stroke={DC.coral} strokeWidth={3} strokeLinecap="round"/>
          <text x={bPersonX + 6} y={(leashTopY + personTopY)/2 + 4} fontSize={12} fill={DC.coral} fontFamily={DFONT} fontWeight="700">Leash (L)</text>

          {/* Person hanging from leash (head at top, feet down) */}
          {PersonHanging(bPersonX, personTopY, DC.navy)}

          {/* H dimension — height of main line above ground */}
          <line x1={bW - 28} y1={bLineY} x2={bW - 28} y2={bGroundY} stroke={DC.blue} strokeWidth={1.5} strokeDasharray="4,3"/>
          <line x1={bW - 34} y1={bLineY} x2={bW - 22} y2={bLineY} stroke={DC.blue} strokeWidth={1.5}/>
          <line x1={bW - 34} y1={bGroundY} x2={bW - 22} y2={bGroundY} stroke={DC.blue} strokeWidth={1.5}/>
          <text x={bW - 20} y={(bLineY + bGroundY)/2 + 5} fontSize={14} fill={DC.blue} fontFamily={DFONT} fontWeight="800">H</text>

          {/* Required height indicator */}
          {(() => {
            const reqPx = requiredH * pxPerM;
            const reqLineY = bGroundY - reqPx;
            if (reqLineY > 20 && reqLineY < bH - 20) {
              return (
                <g>
                  <line x1={bW - 55} y1={reqLineY} x2={bW - 35} y2={reqLineY}
                    stroke={clearanceOk ? DC.teal : DC.coral} strokeWidth={1.5} strokeDasharray="3,2"/>
                  <text x={bW - 100} y={reqLineY - 4} fontSize={11} fill={clearanceOk ? DC.teal : DC.coral} fontFamily={DFONT} fontWeight="600">Min H</text>
                </g>
              );
            }
            return null;
          })()}
        </svg>
      </div>

      {/* ── Clearance status + inputs ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          <SliderRow label="Line length" value={uLen} min={uUnit ? 33 : 10} max={uUnit ? 6561 : 2000} step={uUnit ? 10 : 1} unit={uUnit ? "ft" : "m"} onChange={v => setLineLen(uUnit ? ft2m(v) : v)} />
          <SliderRow label="Height above ground (H)" value={uH} min={uUnit ? 3 : 1} max={uUnit ? 328 : 100} step={uUnit ? 1 : 0.5} unit={uUnit ? "ft" : "m"} onChange={v => setHeight(uUnit ? ft2m(v) : v)} />
          <SliderRow label="Leash length (L)" value={uLeash} min={uUnit ? 3 : 1} max={uUnit ? 13 : 4} step={uUnit ? 0.5 : 0.1} unit={uUnit ? "ft" : "m"} onChange={v => setLeash(uUnit ? ft2m(v) : v)} />
          <SliderRow label="Body weight (W)" value={uW} min={uUnit ? 88 : 40} max={uUnit ? 330 : 150} step={1} unit={uUnit ? "lb" : "kg"} onChange={v => setWeight(uUnit ? lb2kg(v) : v)} />
          <SliderRow label="Backup sag (S)" value={uBSag} min={uUnit ? 1 : 0.3} max={uUnit ? 66 : 20} step={uUnit ? 0.5 : 0.1} unit={uUnit ? "ft" : "m"} onChange={v => setBackupSag(uUnit ? ft2m(v) : v)} />

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: DFONT, fontSize: 16, fontWeight: 600, color: DC.muted, marginBottom: 8 }}>Backup webbing type</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["dyneema", "nylon", "dynamic"] as const).map(w => (
                <button key={w} onClick={() => setWebbing(w)} style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 11, padding: "6px 12px", borderRadius: 4,
                  border: "1px solid", cursor: "pointer",
                  borderColor: webbing === w ? DC.blue : DC.border,
                  background: webbing === w ? DC.blue : "transparent",
                  color: webbing === w ? DC.white : DC.navy,
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
            background: clearanceOk ? `${DC.teal}18` : `${DC.coral}15`,
            border: `2px solid ${clearanceOk ? DC.teal : DC.coral}`,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 36 }}>{clearanceOk ? "✅" : "❌"}</div>
            <div style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 700, color: clearanceOk ? DC.teal : DC.coral, marginTop: 8 }}>
              {clearanceOk ? "CLEARANCE OK" : "INSUFFICIENT CLEARANCE"}
            </div>
            <div style={{ fontFamily: DFONT, fontSize: 15, color: clearanceOk ? DC.teal : DC.coral, marginTop: 6 }}>
              Required: {uUnit ? m2ft(requiredH) : round1(requiredH)}{uUnit ? " ft" : " m"} &nbsp;|&nbsp;
              Yours: {uUnit ? uH : round1(height)}{uUnit ? " ft" : " m"} &nbsp;|&nbsp;
              {clearanceOk ? `+${uUnit ? m2ft(margin) : margin}${uUnit ? " ft" : " m"} margin` : `Need ${uUnit ? m2ft(Math.abs(margin)) : Math.abs(margin)}${uUnit ? " ft" : " m"} more`}
            </div>
          </div>

          {/* Results */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            <ResultCard label="Est. peak backup force" value={units === "imperial" ? kN2lbf(clampedForce) : clampedForce} unit={units === "imperial" ? "lbf" : "kN"} sub="Simplified energy model" />
            <ResultCard label="Min required height" value={uUnit ? m2ft(requiredH) : round1(requiredH)} unit={uUnit ? "ft" : "m"} sub="H > 2(L+S)" />
            <ResultCard label="Est. fall distance" value={uUnit ? m2ft(estFallDist) : estFallDist} unit={uUnit ? "ft" : "m"} sub="to lowest point" />
          </div>

          {/* Formula box */}
          <div style={{ background: DC.bg, borderRadius: 10, padding: "14px 16px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: DC.muted, lineHeight: 1.7 }}>
            <strong style={{ color: DC.navy }}>Clearance check:</strong> H {">"} 2 × (L + S)<br/>
            = {round1(height)} {">"} 2 × ({round1(leash)} + {round1(backupSag)}) = {round1(requiredH)} m ?&nbsp;
            <span style={{ color: clearanceOk ? DC.teal : DC.coral, fontWeight: 700 }}>{clearanceOk ? "✓ YES" : "✗ NO"}</span><br/>
            <strong style={{ color: DC.navy }}>Peak force:</strong> F = W·g·(1 + √(1 + 2kd/(W·g)))<br/>
            k = W·g / (ε·L) = {round1(k_approx)} N/m, d = {round1(fallDist)} m
          </div>
        </div>
      </div>

      <SourceNote>
        CLEARANCE FORMULA: H {">"} 2×(L+S) — Athanasiadis (2013), adopted by ISA Midline Advisory (2015).
        Peak force uses simplified spring energy model: k = W·g/(ε·L) where ε is elongation fraction.
        For accurate results use the ISA official Backup Fall Simulator.
      </SourceNote>

      {/* Education section */}
      <div style={{ marginTop: 60, borderTop: `2px solid ${DC.border}`, paddingTop: 48 }}>
        <h3 style={{ fontFamily: DFONT, fontSize: 28, fontWeight: 800, color: DC.navy, marginBottom: 36 }}>Understanding Backup Falls</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ background: DC.bg, borderRadius: 14, padding: "28px", borderLeft: `5px solid ${DC.blue}` }}>
            <h4 style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 800, color: DC.navy, marginBottom: 12 }}>What Happens When the Main Line Fails?</h4>
            <p style={{ fontFamily: DFONT, fontSize: 16, color: DC.muted, lineHeight: 1.8, margin: 0 }}>
              When the main line breaks, the slackliner free-falls by the <strong style={{ color: DC.navy }}>leash length</strong> before the backup arrests the fall.
              The backup line then sags further under the dynamic load. The person's lowest point is approximately
              <strong style={{ color: DC.coral }}> H − 2(L+S)</strong> above the ground.
              If this is negative, the person hits the ground.
            </p>
          </div>
          <div style={{ background: DC.bg, borderRadius: 14, padding: "28px", borderLeft: `5px solid ${DC.teal}` }}>
            <h4 style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 800, color: DC.navy, marginBottom: 12 }}>Webbing Type Matters</h4>
            <p style={{ fontFamily: DFONT, fontSize: 16, color: DC.muted, lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: DC.navy }}>Dyneema (~1% stretch)</strong>: Very stiff — high peak force, short fall arrest.<br/>
              <strong style={{ color: DC.navy }}>Nylon (~5% stretch)</strong>: More elastic — softer arrest, moderate forces.<br/>
              <strong style={{ color: DC.navy }}>Dynamic rope (~25%)</strong>: Very soft arrest, low forces but longer fall distance.
            </p>
          </div>
          <div style={{ background: DC.navy, borderRadius: 14, padding: "28px", gridColumn: "1 / -1" }}>
            <h4 style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 800, color: DC.white, marginBottom: 16 }}>Key Formulas</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              {[
                { label: "Minimum safe height", formula: "H > 2 × (L + S)", note: "Athanasiadis 2013, ISA standard" },
                { label: "Fall distance (approx)", formula: "d_fall ≈ L + 0.3·S", note: "To lowest point of person" },
                { label: "Peak backup force", formula: "F = W·g·(1 + √(1 + 2kd/(W·g)))", note: "Energy method; k = W·g/(ε·L)" },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontFamily: DFONT, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{f.label}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 600, color: DC.blue, marginBottom: 4 }}>{f.formula}</div>
                  <div style={{ fontFamily: DFONT, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{f.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Calculator 4: Midline Safety ─────────────────────────────────────────────

function MidlineSafetyCalc({ units }: { units: Units }) {
  const [H, setH] = useState(8);
  const [L, setL] = useState(2);
  const [S, setS] = useState(2);

  const uUnit = units === "imperial";
  const uH = uUnit ? m2ft(H) : H;
  const uL = uUnit ? m2ft(L) : L;
  const uS = uUnit ? m2ft(S) : S;

  const required = 2 * (L + S);
  const uRequired = uUnit ? m2ft(required) : required;
  const margin = round1(H - required);
  const safe = H > required;
  const pct = Math.min(100, Math.max(0, (H / (required * 1.5)) * 100));

  // (SVG geometry is computed inline in the diagram block below)

  return (
    <div>
      <SectionTitle>Midline Safety Height Checker</SectionTitle>
      <p style={{ fontFamily: DFONT, fontSize: 17, color: DC.muted, marginBottom: 28, lineHeight: 1.7, maxWidth: 640 }}>
        A midline is a highline rigged at low height. The ISA requires a minimum height so the
        backup doesn't contact the ground during a fall. Adjust the sliders to check your setup.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        {/* Controls + result */}
        <div>
          <SliderRow label="Height of main line (H)" value={uH} min={uUnit ? 3 : 1} max={uUnit ? 164 : 50} step={uUnit ? 0.5 : 0.1} unit={uUnit ? "ft" : "m"} onChange={v => setH(uUnit ? ft2m(v) : v)} />
          <SliderRow label="Leash length (L)" value={uL} min={uUnit ? 1 : 0.5} max={uUnit ? 13 : 4} step={uUnit ? 0.5 : 0.1} unit={uUnit ? "ft" : "m"} onChange={v => setL(uUnit ? ft2m(v) : v)} />
          <SliderRow label="Backup sag (S)" value={uS} min={uUnit ? 1 : 0.3} max={uUnit ? 33 : 10} step={uUnit ? 0.5 : 0.1} unit={uUnit ? "ft" : "m"} onChange={v => setS(uUnit ? ft2m(v) : v)} />

          {/* Safety status */}
          <div style={{ padding: 24, borderRadius: 14, textAlign: "center", marginTop: 24, background: safe ? "rgba(0,191,165,0.1)" : "rgba(239,83,80,0.1)", border: `2px solid ${safe ? DC.teal : DC.coral}` }}>
            <div style={{ fontFamily: DFONT, fontSize: 52, fontWeight: 900, color: safe ? DC.teal : DC.coral, lineHeight: 1 }}>
              {safe ? "✓" : "✕"}
            </div>
            <div style={{ fontFamily: DFONT, fontSize: 22, fontWeight: 800, marginTop: 8, color: safe ? DC.teal : DC.coral }}>
              {safe ? "SAFE" : "NOT SAFE"}
            </div>
            <div style={{ fontFamily: DFONT, fontSize: 16, marginTop: 8, color: DC.muted, lineHeight: 1.8 }}>
              Min required: <strong style={{ color: DC.navy }}>{round1(uRequired)}{uUnit ? " ft" : " m"}</strong><br/>
              Your height: <strong style={{ color: DC.navy }}>{uH}{uUnit ? " ft" : " m"}</strong><br/>
              {safe
                ? <span style={{ color: DC.teal }}>Safety margin: +{uUnit ? m2ft(margin) : margin}{uUnit ? " ft" : " m"}</span>
                : <span style={{ color: DC.coral }}>Need {uUnit ? m2ft(Math.abs(margin)) : Math.abs(margin)}{uUnit ? " ft" : " m"} more height</span>
              }
            </div>
          </div>

          {/* Progress gauge */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: DFONT, fontSize: 13, color: DC.muted, marginBottom: 8 }}>
              <span>0</span>
              <span>Required: {round1(uRequired)}{uUnit ? " ft" : " m"}</span>
              <span>{uUnit ? m2ft(round1(required * 1.5)) : round1(required * 1.5)}{uUnit ? " ft" : " m"}</span>
            </div>
            <div style={{ height: 16, background: DC.bg, borderRadius: 8, overflow: "hidden", position: "relative", border: `1px solid ${DC.border}` }}>
              <div style={{ position: "absolute", left: "66.7%", top: 0, bottom: 0, width: 2, background: DC.coral, zIndex: 2 }}/>
              <div style={{ height: "100%", borderRadius: 8, transition: "width 0.3s, background 0.3s", width: `${pct}%`, background: safe ? DC.teal : DC.coral }}/>
            </div>
          </div>
        </div>

        {/* Diagram */}
        <div>
          <div style={{ fontFamily: DFONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: DC.muted, marginBottom: 8 }}>
            Side view — clearance diagram
          </div>
          {(() => {
            const mW = 460, mH = 320;
            const mGroundY = mH - 30;
            // Scale: H maps to pixel distance
            const pxPerM = Math.min(6.5, (mH - 80) / Math.max(1, H));
            const mLineY = Math.max(44, mGroundY - H * pxPerM);
            const mAX = 30, mBX = mW - 30;

            // Backup sags below main
            const backupSagPx = Math.max(10, Math.min(70, S * pxPerM * 2));
            const backupMidY = mLineY + 8 + backupSagPx;

            // Person hangs from backup by leash
            const mPersonX = mW / 2;
            const leashPx = Math.max(12, Math.min(50, L * pxPerM * 2.5));
            const leashTopY = backupMidY;
            const personTopY = leashTopY + leashPx;

            return (
              <svg width="100%" viewBox={`0 0 ${mW} ${mH}`} style={{ borderRadius: 12, background: DC.white, border: `1px solid ${DC.border}` }}>
                {/* Ground */}
                <line x1={0} y1={mGroundY} x2={mW} y2={mGroundY} stroke={safe ? DC.teal : DC.coral} strokeWidth={3}/>
                {Array.from({length: Math.floor(mW/20)}).map((_,i) => (
                  <line key={i} x1={i*20+4} y1={mGroundY} x2={i*20} y2={mGroundY+10} stroke={safe ? DC.teal : DC.coral} strokeWidth={1} opacity={0.4}/>
                ))}
                <text x={12} y={mGroundY - 6} fontSize={13} fill={safe ? DC.teal : DC.coral} fontFamily={DFONT} fontWeight="700">Ground</text>

                {/* Main line */}
                <line x1={mAX} y1={mLineY} x2={mBX} y2={mLineY} stroke={DC.navy} strokeWidth={3}/>
                <text x={mAX + 6} y={mLineY - 8} fontSize={13} fill={DC.navy} fontFamily={DFONT} fontWeight="700">Highline</text>

                {/* Anchor circles */}
                <circle cx={mAX} cy={mLineY} r={8} fill={DC.navy}/>
                <circle cx={mAX} cy={mLineY} r={4} fill={DC.blue}/>
                <circle cx={mBX} cy={mLineY} r={8} fill={DC.navy}/>
                <circle cx={mBX} cy={mLineY} r={4} fill={DC.blue}/>

                {/* Backup line — dashed */}
                <path
                  d={`M ${mAX} ${mLineY} Q ${mW/2} ${backupMidY} ${mBX} ${mLineY}`}
                  fill="none" stroke={DC.muted} strokeWidth={2} strokeDasharray="6,4"/>
                <text x={mAX + 6} y={backupMidY + 16} fontSize={13} fill={DC.muted} fontFamily={DFONT} fontWeight="700">Backup</text>

                {/* Red leash */}
                <line x1={mPersonX} y1={leashTopY} x2={mPersonX} y2={personTopY}
                  stroke={DC.coral} strokeWidth={3} strokeLinecap="round"/>
                <text x={mPersonX + 6} y={(leashTopY + personTopY)/2 + 4} fontSize={12} fill={DC.coral} fontFamily={DFONT} fontWeight="700">L</text>

                {/* Person hanging */}
                {PersonHanging(mPersonX, personTopY, DC.navy)}

                {/* H dimension */}
                <line x1={mW - 28} y1={mLineY} x2={mW - 28} y2={mGroundY} stroke={DC.blue} strokeWidth={1.5} strokeDasharray="4,3"/>
                <line x1={mW - 34} y1={mLineY} x2={mW - 22} y2={mLineY} stroke={DC.blue} strokeWidth={1.5}/>
                <line x1={mW - 34} y1={mGroundY} x2={mW - 22} y2={mGroundY} stroke={DC.blue} strokeWidth={1.5}/>
                <text x={mW - 20} y={(mLineY + mGroundY)/2 + 5} fontSize={14} fill={DC.blue} fontFamily={DFONT} fontWeight="800">H</text>

                {/* Required height indicator */}
                {(() => {
                  const reqPx = required * pxPerM;
                  const reqLineY = mGroundY - reqPx;
                  if (reqLineY > 20 && reqLineY < mH - 20) {
                    return (
                      <g>
                        <line x1={mW - 55} y1={reqLineY} x2={mW - 35} y2={reqLineY}
                          stroke={safe ? DC.teal : DC.coral} strokeWidth={1.5} strokeDasharray="3,2"/>
                        <text x={mW - 105} y={reqLineY - 4} fontSize={11} fill={safe ? DC.teal : DC.coral} fontFamily={DFONT} fontWeight="600">Min H</text>
                      </g>
                    );
                  }
                  return null;
                })()}
              </svg>
            );
          })()}
        </div>
      </div>

      {/* ── Education section ── */}
      <div style={{ marginTop: 60, borderTop: `2px solid ${DC.border}`, paddingTop: 48 }}>
        <h3 style={{ fontFamily: DFONT, fontSize: 28, fontWeight: 800, color: DC.navy, marginBottom: 36 }}>Understanding Midline Safety</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          <div style={{ background: DC.bg, borderRadius: 14, padding: "28px", borderLeft: `5px solid ${DC.blue}` }}>
            <h4 style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 800, color: DC.navy, marginBottom: 12 }}>What is a Midline?</h4>
            <p style={{ fontFamily: DFONT, fontSize: 16, color: DC.muted, lineHeight: 1.8, margin: 0 }}>
              A midline is a highline rigged at low height — typically under 10m.
              The key danger: if the main line fails, the person falls onto the backup.
              If there isn't enough height, the backup (and person) can hit the ground.
              The ISA requires a <strong style={{ color: DC.navy }}>minimum height H {">"} 2×(L+S)</strong>.
            </p>
          </div>

          <div style={{ background: DC.bg, borderRadius: 14, padding: "28px", borderLeft: `5px solid ${DC.teal}` }}>
            <h4 style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 800, color: DC.navy, marginBottom: 12 }}>Leash Length (L)</h4>
            <p style={{ fontFamily: DFONT, fontSize: 16, color: DC.muted, lineHeight: 1.8, margin: 0 }}>
              The leash connects the slackliner's harness to the backup line.
              When the main line fails, the person falls the length of the leash before the backup catches them.
              Shorter leash = less fall distance = safer for low lines.
              Most highline leashes are <strong style={{ color: DC.navy }}>1.5–2.5m</strong>.
            </p>
          </div>

          <div style={{ background: DC.bg, borderRadius: 14, padding: "28px", borderLeft: `5px solid ${DC.coral}` }}>
            <h4 style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 800, color: DC.navy, marginBottom: 12 }}>Backup Sag (S)</h4>
            <p style={{ fontFamily: DFONT, fontSize: 16, color: DC.muted, lineHeight: 1.8, margin: 0 }}>
              The backup line always hangs lower than the main line due to gravity.
              This sag (S) adds to the effective fall distance.
              A deeply sagged backup is dangerous on a midline.
              Keep backup sag tight on low lines — under 1m if possible.
            </p>
          </div>

          <div style={{ background: DC.navy, borderRadius: 14, padding: "28px" }}>
            <h4 style={{ fontFamily: DFONT, fontSize: 20, fontWeight: 800, color: DC.white, marginBottom: 16 }}>The Formula</h4>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: DC.blue, marginBottom: 12, letterSpacing: "0.02em" }}>
              H {">"} 2 × (L + S)
            </div>
            <div style={{ fontFamily: DFONT, fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
              <strong style={{ color: DC.white }}>H</strong> = height of main line above ground<br/>
              <strong style={{ color: DC.white }}>L</strong> = leash length<br/>
              <strong style={{ color: DC.white }}>S</strong> = backup sag at center<br/>
              <br/>
              Source: Athanasiadis (2013), adopted by ISA Midline Advisory (2015)
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}



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
      <p style={{ fontFamily: DFONT, fontSize: 17, color: DC.muted, marginBottom: 28, lineHeight: 1.7, maxWidth: 640 }}>
        Calculate the mechanical advantage (MA) of pulley systems used to tension a highline.
        Includes realistic friction losses per pulley.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          {/* System selector */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: DFONT, fontSize: 16, fontWeight: 600, color: DC.muted, marginBottom: 10 }}>Pulley system</div>
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
      <div style={{ borderBottom: `1px solid ${DC.border}`, background: DC.white, boxShadow: "0 2px 16px rgba(26,35,126,0.06)" }}>
        <div style={styles.inner}>
          <div style={{ paddingTop: 32, paddingBottom: 16 }}>
            <a href="/" style={{ fontFamily: DFONT, fontSize: 15, fontWeight: 600, color: DC.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
              ← Back to Slackline Hub
            </a>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontFamily: DFONT, fontSize: 15, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: DC.blue, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-block", width: 20, height: 1, background: "#c8531a" }} /> Physics Tools
                </div>
                <h1 style={{ fontFamily: DFONT, fontSize: "clamp(3rem,5vw,5rem)", fontWeight: 900, letterSpacing: "-0.02em", color: DC.navy, margin: 0, lineHeight: 1 }}>
                  Physics &amp; Forces Calculator
                </h1>
                <p style={{ fontFamily: DFONT, fontSize: 18, color: DC.muted, margin: "14px 0 0", fontWeight: 400 }}>
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
                    color: units === u ? DC.white : DC.muted,
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


      {/* Tab bar */}
      <div style={{ borderBottom: `1px solid ${DC.border}`, background: DC.white, boxShadow: "0 2px 16px rgba(26,35,126,0.06)", position: "sticky", top: 56, zIndex: 50 }}>
        <div style={styles.inner}>
          <div style={{ display: "flex", gap: 0, paddingTop: 0 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                fontFamily: DFONT, fontSize: 17, fontWeight: 700,
                padding: "20px 28px", border: "none", background: "transparent", cursor: "pointer",
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
          <p style={{ fontFamily: DFONT, fontSize: 15, fontWeight: 400, color: DC.muted, lineHeight: 1.8 }}>
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
