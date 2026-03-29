import { Link } from "react-router-dom";

// ─── Data ─────────────────────────────────────────────────────────────────────

const liveTools = [
  { name: "Forces Calculator", sub: "Tension · Anchor · Backup · MA", path: "/tools/physics", tag: "PHYSICS" },
  { name: "Webbing Database", sub: "241 webbings · Stretch curves · MBS", path: "/gear/webbing", tag: "GEAR" },
  { name: "Resource Library", sub: "463 curated links from the Guia", path: "/knowledge/resources", tag: "KNOWLEDGE" },
];

const soonTools = [
  { name: "AI Safety Check", tag: "AI" },
  { name: "Knot Guide", tag: "RIGGING" },
  { name: "AI Knowledge Chat", tag: "AI" },
  { name: "Highline Freestyle", tag: "TRICKS" },
  { name: "Spot Map", tag: "COMMUNITY" },
  { name: "Event Calendar", tag: "COMMUNITY" },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  PHYSICS:    { bg: "rgba(59,130,246,0.15)", text: "#60a5fa" },
  GEAR:       { bg: "rgba(234,179,8,0.15)",  text: "#facc15" },
  KNOWLEDGE:  { bg: "rgba(34,197,94,0.15)",  text: "#4ade80" },
  AI:         { bg: "rgba(168,85,247,0.15)", text: "#c084fc" },
  RIGGING:    { bg: "rgba(249,115,22,0.15)", text: "#fb923c" },
  TRICKS:     { bg: "rgba(236,72,153,0.15)", text: "#f472b6" },
  COMMUNITY:  { bg: "rgba(20,184,166,0.15)", text: "#2dd4bf" },
  SAFETY:     { bg: "rgba(239,68,68,0.15)",  text: "#f87171" },
};

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(5,5,8,0.88)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 clamp(1.25rem,4vw,3.5rem)", height: 58,
    }}>
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="6" fill="#FF4D00"/>
          <path d="M7 20L14 8L21 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 16H18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <span style={{
          fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 900,
          fontStyle: "italic", color: "#fff", letterSpacing: "-0.02em",
        }}>Slackline Hub</span>
      </Link>

      <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
        {[
          { label: "Tools", href: "#tools" },
          { label: "Gear", href: "/gear/webbing" },
          { label: "Resources", href: "/knowledge/resources" },
          { label: "GitHub ↗", href: "https://github.com/cayanandante/slackline-hub", external: true },
        ].map(l => (
          <a key={l.label} href={l.href} target={l.external ? "_blank" : undefined}
            style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.45)", padding: "0 14px", height: 58,
              display: "flex", alignItems: "center", textDecoration: "none",
              textTransform: "uppercase", transition: "color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#FF4D00")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
          >{l.label}</a>
        ))}
        <Link to="/tools/physics" style={{
          fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "#fff", background: "#FF4D00",
          padding: "0 18px", height: 36, display: "flex", alignItems: "center",
          borderRadius: 4, textDecoration: "none", marginLeft: 8,
          transition: "background 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "#ff6a30")}
          onMouseLeave={e => (e.currentTarget.style.background = "#FF4D00")}
        >Calculator →</Link>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={{
      background: "#050508",
      minHeight: "92vh",
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
      padding: "0 clamp(1.25rem,4vw,3.5rem) clamp(3rem,6vh,5rem)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background: giant slanted text */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none", overflow: "hidden",
      }}>
        <span style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "clamp(12rem,30vw,28rem)",
          fontWeight: 900, fontStyle: "italic",
          color: "rgba(255,255,255,0.025)",
          letterSpacing: "-0.06em", lineHeight: 0.85,
          transform: "rotate(-8deg) translateY(5%)",
          whiteSpace: "nowrap", userSelect: "none",
        }}>HIGH<br/>LINE</span>
      </div>

      {/* Vertical stripe accent */}
      <div style={{
        position: "absolute", top: 0, right: "clamp(6rem,14vw,18rem)",
        width: 1, height: "100%",
        background: "linear-gradient(to bottom, transparent 0%, rgba(255,77,0,0.4) 40%, rgba(255,77,0,0.4) 70%, transparent 100%)",
      }} />

      {/* Stats — top right */}
      <div style={{
        position: "absolute", top: "clamp(3rem,6vh,5rem)", right: "clamp(1.25rem,4vw,3.5rem)",
        display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-end",
      }}>
        {[
          { n: "241", label: "webbings" },
          { n: "463", label: "resources" },
          { n: "96", label: "stretch curves" },
        ].map(s => (
          <div key={s.label} style={{ textAlign: "right" }}>
            <div style={{
              fontFamily: "'Fraunces', serif", fontSize: "clamp(2rem,4vw,3.5rem)",
              fontWeight: 900, fontStyle: "italic", color: "#FF4D00", lineHeight: 1,
            }}>{s.n}</div>
            <div style={{
              fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginTop: 2,
            }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ position: "relative", maxWidth: 900 }}>
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em",
          textTransform: "uppercase", color: "#FF4D00", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ width: 40, height: 1, background: "#FF4D00", display: "inline-block" }} />
          Open Source · ISA Standards · Community Built
        </div>

        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "clamp(3.5rem,9vw,9rem)",
          fontWeight: 900, fontStyle: "italic",
          lineHeight: 0.88, letterSpacing: "-0.04em",
          color: "#fff", margin: "0 0 clamp(1.5rem,3vh,2.5rem)",
        }}>
          Tools for<br />
          <span style={{ color: "#FF4D00" }}>Slackliners,</span><br />
          <span style={{ color: "rgba(255,255,255,0.3)" }}>by Slackliners.</span>
        </h1>

        <p style={{
          fontSize: "clamp(1rem,1.5vw,1.15rem)", fontWeight: 300, lineHeight: 1.75,
          color: "rgba(255,255,255,0.5)", maxWidth: 480,
          marginBottom: "clamp(2rem,4vh,3.5rem)",
        }}>
          Physics calculators, AI safety assistant, the most complete webbing database,
          rigging guides — built on ISA standards by practitioners.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <Link to="/tools/physics" style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.1em",
            textTransform: "uppercase", background: "#FF4D00", color: "#fff",
            padding: "15px 32px", borderRadius: 4, textDecoration: "none",
            transition: "background 0.2s, transform 0.15s", display: "inline-block",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#ff6a30"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#FF4D00"; (e.currentTarget as HTMLAnchorElement).style.transform = "none"; }}
          >Forces Calculator →</Link>
          <Link to="/gear/webbing" style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.6)",
            padding: "15px 32px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.15)",
            textDecoration: "none", transition: "all 0.2s", display: "inline-block",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.4)"; (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.15)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.6)"; }}
          >Webbing Database →</Link>
        </div>
      </div>

      {/* Safety strip at bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "rgba(255,77,0,0.08)", borderTop: "1px solid rgba(255,77,0,0.2)",
        padding: "10px clamp(1.25rem,4vw,3.5rem)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 14 }}>⚠️</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.08em", color: "#FF4D00", textTransform: "uppercase" }}>
          Always verify with a certified ISA Rigger before use
        </span>
      </div>
    </section>
  );
}

// ─── Live Tools ───────────────────────────────────────────────────────────────

function LiveTools() {
  return (
    <section style={{ background: "#0a0a0f", padding: "clamp(4rem,8vh,7rem) clamp(1.25rem,4vw,3.5rem)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(2rem,4vw,3.5rem)",
            fontWeight: 900, fontStyle: "italic",
            letterSpacing: "-0.04em", color: "#fff", margin: 0,
          }}>Live now.</h2>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>3 tools live · more coming</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
          {liveTools.map((t, i) => {
            const tc = TAG_COLORS[t.tag] || { bg: "rgba(255,255,255,0.08)", text: "#fff" };
            return (
              <Link key={t.name} to={t.path} style={{ textDecoration: "none" }}>
                <div style={{
                  background: i === 0 ? "#FF4D00" : "rgba(255,255,255,0.03)",
                  border: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)",
                  padding: "clamp(2rem,4vh,3rem) clamp(1.5rem,3vw,2.5rem)",
                  display: "flex", flexDirection: "column", gap: 20,
                  minHeight: 220,
                  cursor: "pointer", transition: "transform 0.2s, background 0.2s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; if (i !== 0) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; if (i !== 0) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; }}
                >
                  <span style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    background: i === 0 ? "rgba(0,0,0,0.2)" : tc.bg,
                    color: i === 0 ? "#fff" : tc.text,
                    padding: "4px 10px", borderRadius: 3, display: "inline-block", alignSelf: "flex-start",
                  }}>{t.tag}</span>
                  <div>
                    <div style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: "clamp(1.5rem,2.5vw,2.2rem)",
                      fontWeight: 900, fontStyle: "italic",
                      color: i === 0 ? "#fff" : "#fff",
                      letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8,
                    }}>{t.name}</div>
                    <div style={{
                      fontFamily: "'DM Mono', monospace", fontSize: 11,
                      color: i === 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)",
                      letterSpacing: "0.04em",
                    }}>{t.sub}</div>
                  </div>
                  <div style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em",
                    textTransform: "uppercase", marginTop: "auto",
                    color: i === 0 ? "#fff" : "rgba(255,255,255,0.4)",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    Open →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Coming Soon ──────────────────────────────────────────────────────────────

function ComingSoon() {
  return (
    <section style={{ background: "#050508", padding: "clamp(4rem,8vh,7rem) clamp(1.25rem,4vw,3.5rem)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 40 }}>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(2rem,4vw,3.5rem)",
            fontWeight: 900, fontStyle: "italic",
            letterSpacing: "-0.04em", color: "#fff", margin: "0 0 8px",
          }}>Building next.</h2>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
            These tools are in development
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 2 }}>
          {soonTools.map(t => {
            const tc = TAG_COLORS[t.tag] || { bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.3)" };
            return (
              <div key={t.name} style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
                padding: "clamp(1.25rem,2vh,1.75rem) clamp(1rem,2vw,1.5rem)",
                display: "flex", flexDirection: "column", gap: 12,
              }}>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.14em",
                  textTransform: "uppercase", background: tc.bg, color: tc.text,
                  padding: "3px 8px", borderRadius: 3, display: "inline-block", alignSelf: "flex-start",
                }}>{t.tag}</span>
                <div style={{
                  fontFamily: "'Fraunces', serif", fontSize: "clamp(1rem,1.5vw,1.3rem)",
                  fontWeight: 700, fontStyle: "italic",
                  color: "rgba(255,255,255,0.3)", letterSpacing: "-0.02em",
                }}>{t.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── About strip ──────────────────────────────────────────────────────────────

function About() {
  return (
    <section style={{
      background: "#FF4D00",
      padding: "clamp(4rem,8vh,7rem) clamp(1.25rem,4vw,3.5rem)",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(3rem,6vw,8rem)", alignItems: "center" }}>
        <div>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(2.5rem,5vw,5rem)",
            fontWeight: 900, fontStyle: "italic",
            letterSpacing: "-0.04em", color: "#fff",
            lineHeight: 0.9, margin: "0 0 24px",
          }}>
            Built by<br />riggers,<br />for riggers.
          </h2>
          <p style={{
            fontSize: "clamp(0.9rem,1.2vw,1.05rem)", fontWeight: 300,
            color: "rgba(255,255,255,0.75)", lineHeight: 1.8, marginBottom: 24,
          }}>
            Created by <strong style={{ color: "#fff" }}>Cayan Dantas</strong> — ISA-certified Rigger and mechanical engineering MSc student from Brazil. Grounded in the <em style={{ fontFamily: "'Fraunces', serif" }}>Guia do Praticante de Highline</em>.
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["ISA Open Data", "SlackDB", "Balance Community", "ISA SlackMap", "RopeLab", "HowNOT2"].map(s => (
              <span key={s} style={{
                fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.04em",
                color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.25)",
                padding: "4px 10px", borderRadius: 3,
              }}>{s}</span>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          {[
            { n: "463", label: "Curated resources" },
            { n: "241", label: "Webbings indexed" },
            { n: "96", label: "Stretch curves" },
            { n: "3", label: "Languages planned" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(0,0,0,0.2)", padding: "clamp(1.5rem,3vh,2.5rem)" }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(2.5rem,4vw,4rem)", fontWeight: 900, fontStyle: "italic", color: "#fff", lineHeight: 1, marginBottom: 6 }}>{s.n}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{
      background: "#050508", borderTop: "1px solid rgba(255,255,255,0.04)",
      padding: "clamp(2rem,4vh,3rem) clamp(1.25rem,4vw,3.5rem)",
      display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20,
    }}>
      <div>
        <div style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 900, color: "#fff", fontSize: 18, marginBottom: 6 }}>Slackline Hub</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em", lineHeight: 1.8 }}>
          Built by <a href="mailto:cayandantas@proton.me" style={{ color: "#FF4D00", textDecoration: "none" }}>Cayan Dantas</a> · ISA-certified Rigger · Open source
        </div>
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        {[
          { label: "ISA GitHub", href: "https://github.com/International-Slackline-Association" },
          { label: "ISA Open Data", href: "https://data.slacklineinternational.org/" },
          { label: "Become a Rigger", href: "https://www.slacklineinternational.org/riggers/" },
        ].map(l => (
          <a key={l.label} href={l.href} target="_blank" style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.25)", textDecoration: "none", transition: "color 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "#FF4D00")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
          >{l.label}</a>
        ))}
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Index() {
  return (
    <div style={{ background: "#050508", minHeight: "100vh", color: "#fff" }}>
      <Nav />
      <Hero />
      <LiveTools />
      <ComingSoon />
      <About />
      <Footer />
    </div>
  );
}
