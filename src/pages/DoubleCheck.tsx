import { useState } from "react";
import { Link } from "react-router-dom";

// ── Config ────────────────────────────────────────────────────────────────────

const WORKER_URL = "https://slackline-hub-worker.cayandantas.workers.dev";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CheckItem {
  category: string;
  status: "safe" | "warning" | "danger" | "info";
  item: string;
  detail: string;
}

interface CheckResult {
  overall: "safe" | "warning" | "danger";
  summary: string;
  checks: CheckItem[];
  recommendations: string[];
}

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert highline safety assistant trained on ISA (International Slackline Association) standards, the Guia do Praticante de Highline, and best practices from the global highline community.

Your job is to perform a structured safety double-check of a highline setup based on the information provided by the user.

You must respond with a JSON object ONLY — no preamble, no explanation outside the JSON. The format is:

{
  "overall": "safe" | "warning" | "danger",
  "summary": "2-3 sentence overall assessment",
  "checks": [
    {
      "category": "Category name",
      "status": "safe" | "warning" | "danger" | "info",
      "item": "Short item name",
      "detail": "Specific explanation for this setup"
    }
  ],
  "recommendations": ["Specific recommendation 1", "Specific recommendation 2", ...]
}

Categories to always check (include all that are relevant):
- Anchor Setup
- Backup System  
- Line Geometry
- Equipment
- Safety Factors
- Environmental Conditions
- Personal Safety

Rules:
- overall is "danger" if ANY check is danger
- overall is "warning" if ANY check is warning and none are danger
- overall is "safe" only if ALL checks are safe or info
- Be specific to the numbers the user provided — calculate anchor forces, check H>2(L+S), check safety factors
- Always cite ISA standards when relevant
- Never invent gear specs — only use what the user provides
- Be direct and technical — this is for experienced slackliners
- Always include at least 3 recommendations
- The last recommendation must always be: "Always have your setup verified by a certified ISA Rigger before use"`;

// ── Claude API call ───────────────────────────────────────────────────────────

async function callClaude(setupDescription: string): Promise<CheckResult> {
  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Please perform a safety double-check for this highline setup:\n\n${setupDescription}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Worker error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || "";

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse AI response");

  return JSON.parse(jsonMatch[0]) as CheckResult;
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(244,241,235,0.92)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(13,15,14,0.1)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 clamp(1.5rem, 5vw, 4rem)", height: 56,
    }}>
      <Link to="/" style={{ fontFamily: "'Fraunces', serif", fontSize: "1.2rem", fontWeight: 700, fontStyle: "italic", color: "#0d0f0e" }}>
        Slackline Hub
      </Link>
      <div style={{ display: "flex", gap: 0 }}>
        <Link to="/tools/physics" style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.04em", color: "#7a7268", padding: "0 1rem", height: 56, display: "flex", alignItems: "center", borderRight: "1px solid rgba(13,15,14,0.1)" }}>
          Physics
        </Link>
        <Link to="/knowledge" style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.04em", color: "#7a7268", padding: "0 1rem", height: 56, display: "flex", alignItems: "center" }}>
          Knowledge
        </Link>
      </div>
    </nav>
  );
}

const STATUS_COLORS = {
  safe: { bg: "#d1fae5", border: "#6ee7b7", text: "#065f46", icon: "✓" },
  warning: { bg: "#fef3c7", border: "#fcd34d", text: "#92400e", icon: "⚠" },
  danger: { bg: "#fee2e2", border: "#fca5a5", text: "#991b1b", icon: "✕" },
  info: { bg: "#e0e7ff", border: "#a5b4fc", text: "#3730a3", icon: "ℹ" },
};

const OVERALL_CONFIG = {
  safe: { bg: "#d1fae5", border: "#6ee7b7", text: "#065f46", label: "SETUP LOOKS SAFE", icon: "✅" },
  warning: { bg: "#fef3c7", border: "#fcd34d", text: "#92400e", label: "WARNINGS FOUND", icon: "⚠️" },
  danger: { bg: "#fee2e2", border: "#fca5a5", text: "#991b1b", label: "DANGEROUS SETUP", icon: "🚨" },
};

// ── Form fields ───────────────────────────────────────────────────────────────

interface FormData {
  lineLength: string;
  height: string;
  anchorType: string;
  anchorAngle: string;
  anchorMBS: string;
  webbingType: string;
  webbingMBS: string;
  leashLength: string;
  backupSag: string;
  bodyWeight: string;
  location: string;
  conditions: string;
  extraNotes: string;
}

const INITIAL_FORM: FormData = {
  lineLength: "",
  height: "",
  anchorType: "2-leg V",
  anchorAngle: "",
  anchorMBS: "",
  webbingType: "Dyneema",
  webbingMBS: "",
  leashLength: "2",
  backupSag: "",
  bodyWeight: "75",
  location: "",
  conditions: "Clear, no wind",
  extraNotes: "",
};

function Field({ label, value, onChange, placeholder, type = "text", unit }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; unit?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#7a7268", display: "block", marginBottom: 4 }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", padding: "9px 12px",
            paddingRight: unit ? 44 : 12,
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem",
            border: "1px solid rgba(13,15,14,0.15)", borderRadius: 6,
            background: "#fff", color: "#0d0f0e", outline: "none",
          }}
          onFocus={e => (e.target.style.borderColor = "#c8531a")}
          onBlur={e => (e.target.style.borderColor = "rgba(13,15,14,0.15)")}
        />
        {unit && (
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#7a7268" }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#7a7268", display: "block", marginBottom: 4 }}>
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", padding: "9px 12px",
          fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem",
          border: "1px solid rgba(13,15,14,0.15)", borderRadius: 6,
          background: "#fff", color: "#0d0f0e", outline: "none", cursor: "pointer",
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ── Results display ───────────────────────────────────────────────────────────

function Results({ result }: { result: CheckResult }) {
  const overall = OVERALL_CONFIG[result.overall];

  return (
    <div>
      {/* Overall verdict */}
      <div style={{
        padding: "1.5rem", borderRadius: 10, marginBottom: "1.5rem", textAlign: "center",
        background: overall.bg, border: `2px solid ${overall.border}`,
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>{overall.icon}</div>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: "1.4rem", fontWeight: 700, color: overall.text, marginBottom: 8 }}>
          {overall.label}
        </div>
        <div style={{ fontSize: "0.88rem", color: overall.text, lineHeight: 1.65, maxWidth: 480, margin: "0 auto" }}>
          {result.summary}
        </div>
      </div>

      {/* Individual checks */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1.5rem" }}>
        {result.checks.map((check, i) => {
          const sc = STATUS_COLORS[check.status];
          return (
            <div key={i} style={{
              background: sc.bg, border: `1px solid ${sc.border}`,
              borderRadius: 8, padding: "12px 16px",
              display: "grid", gridTemplateColumns: "auto 1fr", gap: "0 12px",
            }}>
              <div style={{ gridRow: "1 / 3", display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", background: sc.border, color: sc.text, fontWeight: 700, fontSize: "0.9rem" }}>
                {sc.icon}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.88rem", color: sc.text }}>
                  {check.item}
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.06em", textTransform: "uppercase", color: sc.text, opacity: 0.7 }}>
                  {check.category}
                </span>
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: sc.text, lineHeight: 1.55 }}>
                {check.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      <div style={{ background: "#0d0f0e", borderRadius: 10, padding: "1.25rem 1.5rem" }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a7268", marginBottom: 12 }}>
          Recommendations
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {result.recommendations.map((rec, i) => {
            const isLast = i === result.recommendations.length - 1;
            return (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: isLast ? "#c8531a" : "#7a7268", flexShrink: 0, marginTop: 2 }}>
                  {isLast ? "⚠" : `${i + 1}.`}
                </span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: isLast ? "#c8531a" : "#f4f1eb", lineHeight: 1.55, fontWeight: isLast ? 500 : 400 }}>
                  {rec}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DoubleCheck() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof FormData) {
    return (v: string) => setForm(f => ({ ...f, [field]: v }));
  }

  function buildDescription(): string {
    return `
HIGHLINE SETUP DESCRIPTION:

Line length: ${form.lineLength || "not specified"} m
Height above ground: ${form.height || "not specified"} m
Body weight: ${form.bodyWeight || "75"} kg

ANCHOR SYSTEM:
- Type: ${form.anchorType}
- Angle between legs: ${form.anchorAngle || "not specified"}°
- Anchor MBS: ${form.anchorMBS || "not specified"} kN

WEBBING:
- Type: ${form.webbingType}
- MBS: ${form.webbingMBS || "not specified"} kN

BACKUP / SAFETY:
- Leash length: ${form.leashLength} m
- Backup sag at center: ${form.backupSag || "not specified"} m

LOCATION & CONDITIONS:
- Location: ${form.location || "not specified"}
- Conditions: ${form.conditions}

ADDITIONAL NOTES:
${form.extraNotes || "None"}
    `.trim();
  }

  async function runCheck() {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const description = buildDescription();
      const checkResult = await callClaude(description);
      setResult(checkResult);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = form.lineLength && form.height && !loading;

  return (
    <div style={{ background: "#f4f1eb", minHeight: "100vh", color: "#0d0f0e" }}>
      <Nav />

      {/* Page header */}
      <div style={{ borderBottom: "1px solid rgba(13,15,14,0.1)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem clamp(1.5rem,5vw,4rem) 1.5rem" }}>
          <Link to="/" style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#7a7268", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            ← Back to hub
          </Link>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#c8531a", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "block", width: 20, height: 1, background: "#c8531a" }} />
            Safety Tools
          </p>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
            AI Double-Check Assistant
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#7a7268", fontWeight: 300, lineHeight: 1.65, maxWidth: 520 }}>
            Describe your highline setup and Claude will cross-check it against ISA standards,
            calculate forces, verify clearances, and flag any safety concerns.
          </p>

          {/* Disclaimer */}
          <div style={{ marginTop: "1rem", padding: "10px 14px", background: "#fef0ec", border: "1px solid #f5c4ad", borderRadius: 6, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ flexShrink: 0 }}>⚠️</span>
            <span style={{ fontSize: "0.78rem", color: "#7a3015", lineHeight: 1.5 }}>
              This tool is for educational reference only. Always verify your setup with a <strong>certified ISA Rigger</strong> before use. AI can make mistakes — it is not a substitute for hands-on training.
            </span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem clamp(1.5rem,5vw,4rem)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", alignItems: "start" }}>

        {/* Left — Form */}
        <div>
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid rgba(13,15,14,0.1)", padding: "1.5rem" }}>

            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a7268", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(13,15,14,0.08)" }}>
              Line geometry
            </div>
            <Field label="Line length" value={form.lineLength} onChange={update("lineLength")} placeholder="100" type="number" unit="m" />
            <Field label="Height above ground" value={form.height} onChange={update("height")} placeholder="30" type="number" unit="m" />
            <Field label="Body weight" value={form.bodyWeight} onChange={update("bodyWeight")} placeholder="75" type="number" unit="kg" />

            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a7268", margin: "1.25rem 0 1rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(13,15,14,0.08)" }}>
              Anchor system
            </div>
            <SelectField label="Anchor type" value={form.anchorType} onChange={update("anchorType")} options={["2-leg V", "3-leg", "4-leg", "A-frame / Cavalete", "Rock features only", "Bolts"]} />
            <Field label="Angle between legs" value={form.anchorAngle} onChange={update("anchorAngle")} placeholder="60" type="number" unit="°" />
            <Field label="Anchor MBS" value={form.anchorMBS} onChange={update("anchorMBS")} placeholder="50" type="number" unit="kN" />

            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a7268", margin: "1.25rem 0 1rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(13,15,14,0.08)" }}>
              Webbing & backup
            </div>
            <SelectField label="Webbing type" value={form.webbingType} onChange={update("webbingType")} options={["Dyneema", "Nylon", "Polyester", "Vectran", "Other"]} />
            <Field label="Webbing MBS" value={form.webbingMBS} onChange={update("webbingMBS")} placeholder="40" type="number" unit="kN" />
            <Field label="Leash length" value={form.leashLength} onChange={update("leashLength")} placeholder="2" type="number" unit="m" />
            <Field label="Backup sag at center" value={form.backupSag} onChange={update("backupSag")} placeholder="3" type="number" unit="m" />

            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a7268", margin: "1.25rem 0 1rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(13,15,14,0.08)" }}>
              Location & conditions
            </div>
            <Field label="Location (optional)" value={form.location} onChange={update("location")} placeholder="e.g. Pedra da Gávea, Rio de Janeiro" />
            <Field label="Conditions" value={form.conditions} onChange={update("conditions")} placeholder="e.g. Clear, wind ~20km/h" />

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#7a7268", display: "block", marginBottom: 4 }}>
                Additional notes
              </label>
              <textarea
                value={form.extraNotes}
                onChange={e => update("extraNotes")(e.target.value)}
                placeholder="Any other details — gear used, special features of the location, etc."
                rows={3}
                style={{
                  width: "100%", padding: "9px 12px",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem",
                  border: "1px solid rgba(13,15,14,0.15)", borderRadius: 6,
                  background: "#fff", color: "#0d0f0e", outline: "none",
                  resize: "vertical",
                }}
                onFocus={e => (e.target.style.borderColor = "#c8531a")}
                onBlur={e => (e.target.style.borderColor = "rgba(13,15,14,0.15)")}
              />
            </div>

            <button
              onClick={runCheck}
              disabled={!canSubmit}
              style={{
                width: "100%", padding: "14px",
                fontFamily: "'DM Mono', monospace", fontSize: "0.75rem",
                letterSpacing: "0.08em", textTransform: "uppercase",
                fontWeight: 500, border: "none", borderRadius: 6, cursor: canSubmit ? "pointer" : "not-allowed",
                background: canSubmit ? "#c8531a" : "rgba(13,15,14,0.15)",
                color: canSubmit ? "#fff" : "#7a7268",
                transition: "background 0.2s",
              }}
            >
              {loading ? "Checking setup..." : "Run safety check →"}
            </button>

            {!canSubmit && !loading && (
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#7a7268", marginTop: 8, textAlign: "center" }}>
                Line length and height are required
              </p>
            )}
          </div>
        </div>

        {/* Right — Results */}
        <div>
          {/* Loading */}
          {loading && (
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid rgba(13,15,14,0.1)", padding: "3rem", textAlign: "center" }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: "1.5rem", fontStyle: "italic", color: "#0d0f0e", marginBottom: "0.75rem" }}>
                Checking your setup...
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "#7a7268", lineHeight: 1.8 }}>
                Calculating anchor forces<br />
                Checking clearance formula<br />
                Reviewing against ISA standards<br />
                Generating recommendations
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "1.5rem", color: "#991b1b" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.06em", marginBottom: 8 }}>ERROR</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem" }}>{error}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", marginTop: 8, opacity: 0.8 }}>
                Check your internet connection and try again.
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && !result && (
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid rgba(13,15,14,0.1)", padding: "3rem", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔍</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: "1.1rem", fontWeight: 300, color: "#0d0f0e", marginBottom: "0.75rem" }}>
                Ready to check your setup
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#7a7268", lineHeight: 1.65 }}>
                Fill in the form and click "Run safety check" to get a detailed analysis of your highline setup against ISA standards.
              </div>
            </div>
          )}

          {/* Results */}
          {result && !loading && <Results result={result} />}
        </div>
      </div>
    </div>
  );
}
