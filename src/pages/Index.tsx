import { Link } from "react-router-dom";

// ─── Data ─────────────────────────────────────────────────────────────────────

const tools = [
  {
    category: "Safety",
    emoji: "⚠",
    items: [
      { name: "AI Double-Check", desc: "ISA-grounded rigging safety checklist powered by Claude.", path: null, status: "soon" },
      { name: "Incident Database", desc: "Every published highline incident, searchable.", path: null, status: "soon" },
      { name: "Line Condition Analyzer", desc: "Upload a photo of your webbing — get a wear assessment.", path: null, status: "soon" },
    ],
  },
  {
    category: "Physics",
    emoji: "⚡",
    items: [
      { name: "Forces Calculator", desc: "Line tension, anchor loads, backup fall simulator, mechanical advantage.", path: "/tools/physics", status: "live" },
    ],
  },
  {
    category: "Gear",
    emoji: "🔧",
    items: [
      { name: "Webbing Database", desc: "241 webbings with MBS, stretch curves, weight and material data.", path: "/gear/webbing", status: "live" },
      { name: "Knot Guide", desc: "Animated step-by-step guide to highline rigging knots.", path: null, status: "soon" },
    ],
  },
  {
    category: "Knowledge",
    emoji: "📚",
    items: [
      { name: "Resource Library", desc: "463 curated links from the Guia do Praticante.", path: "/knowledge/resources", status: "live" },
      { name: "AI Knowledge Chat", desc: "Ask anything about highline — grounded in ISA docs.", path: null, status: "soon" },
      { name: "Glossary", desc: "PT/EN highline terminology.", path: null, status: "soon" },
    ],
  },
  {
    category: "Community",
    emoji: "🌍",
    items: [
      { name: "Event Calendar", desc: "Global highline festivals, competitions and encontros.", path: null, status: "soon" },
      { name: "Global Spot Map", desc: "7000+ spots powered by ISA SlackMap.", path: null, status: "soon" },
    ],
  },
];

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(10,12,14,0.92)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 clamp(1.5rem,5vw,4rem)", height: 60,
    }}>
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, background: "#e8541a", borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 900, color: "#fff", fontStyle: "italic",
        }}>S</div>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, fontStyle: "italic", color: "#fff", letterSpacing: "-0.02em" }}>
          Slackline Hub
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#e8541a", letterSpacing: "0.1em", marginLeft: 2 }}>BETA</span>
      </Link>

      <div style={{ display: "flex", gap: 4 }}>
        {[
          { label: "Tools", href: "#tools" },
          { label: "Gear", href: "/gear/webbing" },
          { label: "Resources", href: "/knowledge/resources" },
          { label: "GitHub", href: "https://github.com/cayanandante/slackline-hub" },
        ].map(l => (
          <a key={l.label} href={l.href}
            style={{
              fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.06em",
              color: "rgba(255,255,255,0.5)", padding: "0 14px", height: 60,
              display: "flex", alignItems: "center", transition: "color 0.15s",
              textDecoration: "none",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
          >{l.label}</a>
        ))}
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={{
      background: "#0a0c0e",
      padding: "clamp(4rem,10vh,8rem) clamp(1.5rem,5vw,4rem) clamp(3rem,6vh,5rem)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(ellipse 80% 60% at 60% 50%, rgba(232,84,26,0.08) 0%, transparent 70%)",
      }} />
      {/* Grid lines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "clamp(2rem,6vw,6rem)", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 400px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28,
              background: "rgba(232,84,26,0.12)", border: "1px solid rgba(232,84,26,0.3)",
              borderRadius: 100, padding: "6px 14px",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8541a", display: "inline-block" }} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#e8541a", letterSpacing: "0.1em" }}>OPEN SOURCE · COMMUNITY BUILT</span>
            </div>

            <h1 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "clamp(3.5rem,8vw,7rem)",
              fontWeight: 900, fontStyle: "italic",
              lineHeight: 0.9, letterSpacing: "-0.04em",
              color: "#fff", marginBottom: 28,
            }}>
              Tools for<br />
              <span style={{ color: "#e8541a" }}>Slackliners,</span><br />
              by Slackliners.
            </h1>

            <p style={{
              fontSize: "clamp(0.95rem,1.5vw,1.1rem)", fontWeight: 300, lineHeight: 1.7,
              color: "rgba(255,255,255,0.55)", maxWidth: 420, marginBottom: 36,
            }}>
              AI-powered safety assistants, physics calculators, rigging guides and the most complete webbing database — built on ISA standards and community knowledge.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="#tools" style={{
                fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
                background: "#e8541a", color: "#fff",
                padding: "14px 28px", borderRadius: 6, textDecoration: "none",
                transition: "background 0.2s, transform 0.15s", display: "inline-block",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#ff6a2f"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#e8541a"; (e.currentTarget as HTMLAnchorElement).style.transform = "none"; }}
              >
                Explore tools →
              </a>
              <a href="https://github.com/cayanandante/slackline-hub" target="_blank" style={{
                fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: "0.08em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.7)",
                padding: "14px 28px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)",
                textDecoration: "none", transition: "border-color 0.2s, color 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.4)"; (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.15)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.7)"; }}
              >
                GitHub →
              </a>
            </div>
          </div>

          {/* Stats panel */}
          <div style={{ flex: "0 0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            {[
              { num: "241", label: "Webbings", sub: "in gear database" },
              { num: "463", label: "Resources", sub: "curated links" },
              { num: "96", label: "Stretch curves", sub: "force/elongation data" },
              { num: "3", label: "Languages", sub: "PT · EN · ES" },
            ].map(s => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8, padding: "24px 22px", minWidth: 130,
              }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 40, fontWeight: 900, fontStyle: "italic", color: "#e8541a", lineHeight: 1, marginBottom: 4 }}>{s.num}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#fff", fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Safety Banner ────────────────────────────────────────────────────────────

function SafetyBanner() {
  return (
    <div style={{
      background: "rgba(232,84,26,0.08)", borderTop: "1px solid rgba(232,84,26,0.2)", borderBottom: "1px solid rgba(232,84,26,0.2)",
      padding: "14px clamp(1.5rem,5vw,4rem)",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e8541a", margin: 0, lineHeight: 1.5 }}>
          <strong>Safety first.</strong> All AI-generated rigging advice must be verified by a <strong>certified ISA Rigger</strong> before use. This is a learning tool, not a substitute for hands-on training.
        </p>
      </div>
    </div>
  );
}

// ─── Tools Section ────────────────────────────────────────────────────────────

function ToolCard({ name, desc, path, status }: {
  name: string; desc: string; path: string | null; status: string;
}) {
  const isLive = status === "live";

  const inner = (
    <div style={{
      background: isLive ? "rgba(232,84,26,0.04)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${isLive ? "rgba(232,84,26,0.25)" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 8, padding: "20px 22px",
      display: "flex", flexDirection: "column", gap: 10,
      height: "100%", cursor: isLive ? "pointer" : "default",
      transition: "border-color 0.2s, background 0.2s, transform 0.15s",
    }}
      onMouseEnter={e => {
        if (!isLive) return;
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(232,84,26,0.6)";
        (e.currentTarget as HTMLDivElement).style.background = "rgba(232,84,26,0.08)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = isLive ? "rgba(232,84,26,0.25)" : "rgba(255,255,255,0.06)";
        (e.currentTarget as HTMLDivElement).style.background = isLive ? "rgba(232,84,26,0.04)" : "rgba(255,255,255,0.02)";
        (e.currentTarget as HTMLDivElement).style.transform = "none";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "3px 8px", borderRadius: 4,
          background: isLive ? "rgba(46,196,102,0.15)" : "rgba(255,255,255,0.06)",
          color: isLive ? "#2ec466" : "rgba(255,255,255,0.3)",
        }}>{isLive ? "● LIVE" : "COMING SOON"}</span>
      </div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, fontStyle: "italic", color: isLive ? "#fff" : "rgba(255,255,255,0.45)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
        {name}
      </div>
      <div style={{ fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, flex: 1 }}>
        {desc}
      </div>
      {isLive && (
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#e8541a" }}>
          Open →
        </div>
      )}
    </div>
  );

  if (isLive && path) return <Link to={path} style={{ textDecoration: "none", display: "block" }}>{inner}</Link>;
  return inner;
}

function ToolsSection() {
  return (
    <section id="tools" style={{ background: "#0a0c0e", padding: "clamp(4rem,8vh,7rem) clamp(1.5rem,5vw,4rem)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#e8541a", marginBottom: 12 }}>
            What we're building
          </div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(2rem,4vw,3.5rem)", fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.03em", color: "#fff", margin: 0 }}>
            Community Tools
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {tools.map(cat => (
            <div key={cat.category}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
                  {cat.category}
                </span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                {cat.items.map(item => (
                  <ToolCard key={item.name} {...item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────

function AboutSection() {
  return (
    <section style={{
      background: "#111416",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "clamp(4rem,8vh,7rem) clamp(1.5rem,5vw,4rem)",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(2rem,6vw,6rem)", alignItems: "start" }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#e8541a", marginBottom: 16 }}>
            Knowledge base
          </div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(1.8rem,3.5vw,3rem)", fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.03em", color: "#fff", marginBottom: 20, lineHeight: 1 }}>
            Grounded in<br />real data.
          </h2>
          <p style={{ fontSize: 14, fontWeight: 300, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 24 }}>
            Built on the <em style={{ fontFamily: "'Fraunces', serif", color: "rgba(255,255,255,0.7)" }}>Guia do Praticante de Highline</em> by Cayan Dantas — ISA-certified Rigger, mechanical engineering MSc. Every tool is grounded in verified ISA standards and open community data.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["ISA Open Data","SlackDB","Balance Community","HowNOT2","RopeLab","Slacktivity","RAED Slacklines","Spider Slacklines"].map(s => (
              <span key={s} style={{
                fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.04em",
                color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)",
                padding: "4px 10px", borderRadius: 4,
              }}>{s}</span>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          {[
            { num: "463", label: "Curated resources" },
            { num: "241", label: "Webbings indexed" },
            { num: "96", label: "Stretch curves" },
            { num: "23", label: "Guide sections" },
          ].map(s => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8, padding: "28px 24px",
            }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 44, fontWeight: 900, fontStyle: "italic", color: "#e8541a", lineHeight: 1, marginBottom: 6 }}>{s.num}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</div>
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
      background: "#0a0c0e",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "2rem clamp(1.5rem,5vw,4rem)",
      display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
    }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.8 }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 700, color: "#fff", fontSize: 15 }}>Slackline Hub</span><br />
        Built by <a href="mailto:cayandantas@proton.me" style={{ color: "#e8541a" }}>Cayan Dantas</a> · ISA-certified Rigger · Open source
      </div>
      <div style={{ display: "flex", gap: "1.5rem" }}>
        {[
          { label: "ISA GitHub", href: "https://github.com/International-Slackline-Association" },
          { label: "ISA Open Data", href: "https://data.slacklineinternational.org/" },
          { label: "Become a Rigger", href: "https://www.slacklineinternational.org/riggers/" },
        ].map(l => (
          <a key={l.label} href={l.href} target="_blank" style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.06em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >{l.label}</a>
        ))}
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Index() {
  return (
    <div style={{ background: "#0a0c0e", minHeight: "100vh", color: "#fff" }}>
      <Nav />
      <Hero />
      <SafetyBanner />
      <ToolsSection />
      <AboutSection />
      <Footer />
    </div>
  );
}
