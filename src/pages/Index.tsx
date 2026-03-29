import { Link } from "react-router-dom";

// ─── Design tokens ────────────────────────────────────────────────────────────
// White background, navy blue accent, bold condensed type
// Font: Barlow Condensed (loaded via index.html or index.css)

const C = {
  white:   "#ffffff",
  bg:      "#f5f6f8",
  navy:    "#0a1628",
  blue:    "#1a56db",
  mid:     "#3b5a8a",
  muted:   "#6b7a99",
  border:  "#dde2ed",
  text:    "#0a1628",
};

// ─── Tool data ────────────────────────────────────────────────────────────────

const liveTools = [
  {
    tag: "PHYSICS",
    name: "Forces Calculator",
    desc: "Line tension, anchor loads, backup fall, mechanical advantage.",
    path: "/tools/physics",
  },
  {
    tag: "GEAR",
    name: "Webbing Database",
    desc: "241 webbings. Stretch curves, MBS, weight, material.",
    path: "/gear/webbing",
  },
  {
    tag: "KNOWLEDGE",
    name: "Resource Library",
    desc: "463 curated resources from the Guia do Praticante.",
    path: "/knowledge/resources",
  },
];

const comingTools = [
  { tag: "AI", name: "Safety Check" },
  { tag: "RIGGING", name: "Knot Guide" },
  { tag: "AI", name: "Knowledge Chat" },
  { tag: "FREESTYLE", name: "Trick Database" },
  { tag: "COMMUNITY", name: "Spot Map" },
  { tag: "COMMUNITY", name: "Events Calendar" },
];

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: C.white,
      borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 clamp(1.5rem,5vw,5rem)", height: 64,
      boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
    }}>
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, background: C.blue, borderRadius: 4,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 15L10 5L17 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 11H14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span style={{
          fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
          fontSize: 20, fontWeight: 700, color: C.navy, letterSpacing: "0.02em",
          textTransform: "uppercase",
        }}>Slackline Hub</span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {[
          { label: "Tools", href: "#tools" },
          { label: "Gear", href: "/gear/webbing" },
          { label: "Resources", href: "/knowledge/resources" },
          { label: "Calculator", href: "/tools/physics" },
          { label: "GitHub", href: "https://github.com/cayanandante/slackline-hub", ext: true },
        ].map(l => (
          <a key={l.label} href={l.href} target={l.ext ? "_blank" : undefined} style={{
            fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
            fontSize: 15, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
            color: C.muted, padding: "0 16px", height: 64, display: "flex", alignItems: "center",
            textDecoration: "none", transition: "color 0.15s", borderBottom: "2px solid transparent",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.blue; (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = C.blue; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.muted; (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = "transparent"; }}
          >{l.label}</a>
        ))}
        {/* Language selector */}
        <div style={{ display: "flex", gap: 2, marginLeft: 12, borderLeft: `1px solid ${C.border}`, paddingLeft: 12 }}>
          {["EN","PT","ES"].map((lang, i) => (
            <button key={lang} style={{
              fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
              padding: "0 10px", height: 64, border: "none",
              background: i === 0 ? "rgba(26,86,219,0.08)" : "transparent",
              color: i === 0 ? C.blue : C.muted,
              cursor: i === 0 ? "default" : "not-allowed",
              transition: "color 0.15s",
              borderBottom: i === 0 ? `2px solid ${C.blue}` : "2px solid transparent",
            }}
              title={i === 0 ? "English (current)" : "Coming soon"}
            >{lang}</button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  // Background: deep navy photo-style section with big full-width headline
  return (
    <section style={{
      background: C.navy,
      padding: "clamp(4rem,10vh,9rem) clamp(1.5rem,5vw,5rem)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Blue geometric accent */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: "42%", height: "100%",
        background: C.blue, opacity: 0.08,
        clipPath: "polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0,
        width: "100%", height: 4,
        background: C.blue,
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
        <div style={{
          fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
          fontSize: 14, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
          color: C.blue, marginBottom: 20, display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ width: 32, height: 2, background: C.blue, display: "inline-block" }} />
          Open Source · ISA Standards · Community Built
        </div>

        <h1 style={{
          fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
          fontSize: "clamp(4rem,10vw,10rem)",
          fontWeight: 800,
          lineHeight: 0.92,
          letterSpacing: "-0.01em",
          color: C.white,
          textTransform: "uppercase",
          margin: "0 0 clamp(1.5rem,3vh,2.5rem)",
        }}>
          Tools for<br />
          <span style={{ color: C.blue }}>Slackliners.</span>
        </h1>

        <p style={{
          fontSize: "clamp(1.1rem,1.6vw,1.2rem)",
          color: "rgba(255,255,255,0.6)",
          fontWeight: 400, lineHeight: 1.75,
          maxWidth: 460, marginBottom: "clamp(2rem,4vh,3rem)",
        }}>
          Physics calculators, AI safety tools, the most complete webbing database — built on ISA standards by practitioners.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/tools/physics" style={{
            fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
            fontSize: 16, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            background: C.blue, color: C.white,
            padding: "14px 32px", borderRadius: 3, textDecoration: "none",
            transition: "background 0.15s, transform 0.15s", display: "inline-block",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#1648c2"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = C.blue; (e.currentTarget as HTMLAnchorElement).style.transform = "none"; }}
          >Forces Calculator →</Link>

          <Link to="/gear/webbing" style={{
            fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
            fontSize: 16, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            background: "transparent", color: C.white,
            padding: "14px 32px", borderRadius: 3, border: "2px solid rgba(255,255,255,0.3)",
            textDecoration: "none", transition: "border-color 0.15s, color 0.15s", display: "inline-block",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = C.white; (e.currentTarget as HTMLAnchorElement).style.color = C.white; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.3)"; }}
          >Webbing Database →</Link>
        </div>
      </div>
    </section>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  return (
    <div style={{
      background: C.blue,
      padding: "0 clamp(1.5rem,5vw,5rem)",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", gap: 0,
      }}>
        {[
          { n: "241", label: "Webbings indexed" },
          { n: "463", label: "Curated resources" },
          { n: "96", label: "Stretch curves" },
          { n: "3", label: "Languages" },
        ].map((s, i) => (
          <div key={s.label} style={{
            padding: "clamp(1rem,2vh,1.5rem) clamp(1.5rem,3vw,3rem)",
            borderRight: i < 3 ? "1px solid rgba(255,255,255,0.15)" : "none",
            flex: 1,
          }}>
            <div style={{
              fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
              fontSize: "clamp(2rem,3.5vw,3rem)",
              fontWeight: 800, color: C.white, lineHeight: 1,
              textTransform: "uppercase",
            }}>{s.n}</div>
            <div style={{
              fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
              fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2,
            }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Safety bar ───────────────────────────────────────────────────────────────

function SafetyBar() {
  return (
    <div style={{
      background: "#fef3c7", borderBottom: `1px solid #fcd34d`,
      padding: "12px clamp(1.5rem,5vw,5rem)",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
      <p style={{
        fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
        fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
        color: "#92400e", margin: 0,
      }}>
        Always verify with a certified ISA Rigger before use
      </p>
    </div>
  );
}

// ─── Live tools ───────────────────────────────────────────────────────────────

function LiveTools() {
  return (
    <section id="tools" style={{ background: C.white, padding: "clamp(4rem,8vh,7rem) clamp(1.5rem,5vw,5rem)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{
            fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
            fontSize: "clamp(2.5rem,5vw,4.5rem)",
            fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.01em",
            color: C.navy, margin: 0, lineHeight: 0.9,
          }}>Live Now</h2>
          <span style={{
            fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
            fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
            color: C.muted,
          }}>3 tools available</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
          {liveTools.map((t, i) => (
            <Link key={t.name} to={t.path} style={{ textDecoration: "none" }}>
              <div style={{
                background: i === 0 ? C.navy : C.bg,
                padding: "clamp(2rem,4vh,3rem) clamp(1.5rem,3vw,2rem)",
                height: "100%", minHeight: 200,
                display: "flex", flexDirection: "column", gap: 16,
                cursor: "pointer", transition: "transform 0.15s",
                borderBottom: `3px solid ${i === 0 ? C.blue : "transparent"}`,
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; if (i !== 0) (e.currentTarget as HTMLDivElement).style.borderBottomColor = C.blue; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; if (i !== 0) (e.currentTarget as HTMLDivElement).style.borderBottomColor = "transparent"; }}
              >
                <div>
                  <span style={{
                    fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
                    color: i === 0 ? C.blue : C.blue,
                    background: i === 0 ? "rgba(26,86,219,0.15)" : "rgba(26,86,219,0.1)",
                    padding: "3px 9px", borderRadius: 2,
                  }}>{t.tag}</span>
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
                    fontSize: "clamp(1.8rem,2.8vw,2.5rem)", fontWeight: 800,
                    textTransform: "uppercase", letterSpacing: "-0.01em",
                    color: i === 0 ? C.white : C.navy, marginBottom: 8, lineHeight: 1,
                  }}>{t.name}</div>
                  <div style={{
                    fontSize: 14, color: i === 0 ? "rgba(255,255,255,0.55)" : C.muted,
                    lineHeight: 1.6, fontWeight: 400,
                  }}>{t.desc}</div>
                </div>
                <div style={{
                  fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: C.blue, marginTop: "auto",
                }}>Open →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Coming soon ──────────────────────────────────────────────────────────────

function ComingSoon() {
  return (
    <section style={{
      background: C.bg,
      borderTop: `1px solid ${C.border}`,
      padding: "clamp(3rem,6vh,5rem) clamp(1.5rem,5vw,5rem)",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{
            fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
            fontSize: "clamp(2rem,4vw,3.5rem)", fontWeight: 800,
            textTransform: "uppercase", color: C.navy, margin: 0,
          }}>Coming Soon</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 2 }}>
          {comingTools.map(t => (
            <div key={t.name} style={{
              background: C.white, border: `1px solid ${C.border}`,
              padding: "20px 18px", display: "flex", flexDirection: "column", gap: 10,
            }}>
              <span style={{
                fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
                color: C.blue, background: "rgba(26,86,219,0.08)",
                padding: "3px 8px", borderRadius: 2, display: "inline-block", alignSelf: "flex-start",
              }}>{t.tag}</span>
              <div style={{
                fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
                fontSize: "clamp(1.1rem,1.6vw,1.5rem)", fontWeight: 700,
                textTransform: "uppercase", color: `rgba(10,22,40,0.4)`, letterSpacing: "0.01em",
              }}>{t.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────

function About() {
  return (
    <section style={{
      background: C.navy,
      padding: "clamp(4rem,8vh,7rem) clamp(1.5rem,5vw,5rem)",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(3rem,6vw,8rem)", alignItems: "center" }}>
        <div>
          <div style={{
            fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
            color: C.blue, marginBottom: 16, display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ width: 24, height: 2, background: C.blue, display: "inline-block" }} />
            About
          </div>
          <h2 style={{
            fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
            fontSize: "clamp(2.5rem,5vw,5rem)", fontWeight: 800,
            textTransform: "uppercase", color: C.white,
            letterSpacing: "-0.01em", lineHeight: 0.92, margin: "0 0 24px",
          }}>
            Built by a slackliner,<br />
            <span style={{ color: C.blue }}>for slackliners.</span>
          </h2>
          <p style={{
            fontSize: 17, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: 24,
          }}>
            Created by <strong style={{ color: C.white }}>Cayan Dantas</strong>, ISA Certified Rigger and Mechanical Engineer from Brazil.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["ISA Open Data","SlackDB","Balance Community","RopeLab","HowNOT2"].map(s => (
              <span key={s} style={{
                fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
                fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.12)",
                padding: "4px 10px", borderRadius: 2,
              }}>{s}</span>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          {[
            { n: "463", label: "Curated resources" },
            { n: "241", label: "Webbings indexed" },
            { n: "96", label: "Stretch curves" },
            { n: "23", label: "Guide sections" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", padding: "clamp(1.5rem,3vh,2.5rem)" }}>
              <div style={{
                fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
                fontSize: "clamp(2.5rem,4vw,4rem)", fontWeight: 800,
                color: C.blue, lineHeight: 1, marginBottom: 6,
              }}>{s.n}</div>
              <div style={{
                fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
                fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
              }}>{s.label}</div>
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
      background: C.white,
      borderTop: `1px solid ${C.border}`,
      padding: "clamp(2rem,4vh,3rem) clamp(1.5rem,5vw,5rem)",
      display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6,
    }}>
      <div style={{
        fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
        fontSize: 20, fontWeight: 800, textTransform: "uppercase",
        color: C.navy, letterSpacing: "0.02em",
      }}>Slackline Hub</div>
      <div style={{ fontSize: 15, color: C.muted, lineHeight: 1.7 }}>
        Built by <strong style={{ color: C.navy }}>Cayan Dantas</strong>
      </div>
      <a href="mailto:cayandantas@proton.me" style={{ fontSize: 15, color: C.blue, textDecoration: "none" }}>
        cayandantas@proton.me
      </a>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Index() {
  return (
    <div style={{ background: C.white, minHeight: "100vh", color: C.navy }}>
      <Nav />
      <Hero />
      <StatsBar />
      <LiveTools />
      <ComingSoon />
      <About />
      <Footer />
    </div>
  );
}
