import { Link } from "react-router-dom";

// ── Tool data ────────────────────────────────────────────────────────────────

const tools = [
  {
    category: "Safety",
    accent: "#c8531a",
    bg: "#fef0ec",
    items: [
      { name: "AI Double-Check Assistant", desc: "Step-by-step safety checklist powered by ISA standards. Catches rigging errors before you clip in.", path: null, status: "soon" },
      { name: "Line Condition Analyzer", desc: "Upload a photo of your webbing — get an AI wear and UV damage assessment.", path: null, status: "soon" },
      { name: "Incident Database", desc: "Every published highline incident, searchable. Learn from every near-miss.", path: null, status: "soon" },
    ],
  },
  {
    category: "Physics",
    accent: "#1a3a5c",
    bg: "#eaf0f8",
    items: [
      { name: "Forces & Physics Calculator", desc: "Line tension, anchor angle forces, backup fall simulator, midline safety checker, mechanical advantage — all in one.", path: "/tools/physics", status: "live" },
    ],
  },
  {
    category: "Knowledge",
    accent: "#2d6a4f",
    bg: "#edf4f0",
    items: [
      { name: "Highline Knowledge Chat", desc: "Ask anything about highline — get answers grounded in ISA documents and the community's best resources.", path: null, status: "soon" },
      { name: "Equipment Selector", desc: "Compare weblocks, leashes, and soft shackles with real MBS/WLL data from ISA's open gear database.", path: null, status: "soon" },
      { name: "Knot & Rigging Visual Guide", desc: "Animated step-by-step guide to 20+ knots — with when-to-use context and break-load data.", path: null, status: "soon" },
    ],
  },
  {
    category: "Community",
    accent: "#7a4f00",
    bg: "#fef7ec",
    items: [
      { name: "Brazilian Team Finder", desc: "Interactive map of 28 Brazilian highline teams. Find the group nearest to you.", path: null, status: "soon" },
      { name: "Festival & Event Calendar", desc: "All Brazilian and global highline events — festivals, championships, encontros — in one live calendar.", path: null, status: "soon" },
      { name: "Global Spot Map", desc: "World map of highline spots powered by ISA's open SlackMap data.", path: null, status: "soon" },
    ],
  },
  {
    category: "Training",
    accent: "#5b21b6",
    bg: "#f3effe",
    items: [
      { name: "ISA Rigger Certification Study App", desc: "AI-powered flashcards and mock exams for the ISA Rigger certification — in Portuguese and English.", path: null, status: "soon" },
      { name: "Highline Setup Planner", desc: "Input your line length, height, and gear — get a complete personalized rigging plan with force calculations.", path: null, status: "soon" },
    ],
  },
];

// ── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(244,241,235,0.92)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(13,15,14,0.1)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 clamp(1.5rem, 5vw, 4rem)", height: 56,
    }}>
      <Link to="/" style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: "1.2rem", fontWeight: 700, fontStyle: "italic", color: "#0d0f0e" }}>
          Slackline Hub
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#7a7268", letterSpacing: "0.08em" }}>BETA</span>
      </Link>

      <div style={{ display: "flex", gap: 0, listStyle: "none" }}>
        {[
          { label: "Tools", href: "#tools" },
          { label: "About", href: "#about" },
        ].map(l => (
          <a key={l.label} href={l.href} style={{
            fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.04em",
            color: "#7a7268", padding: "0 1rem", height: 56, display: "flex", alignItems: "center",
            borderRight: "1px solid rgba(13,15,14,0.1)", transition: "color 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "#0d0f0e")}
            onMouseLeave={e => (e.currentTarget.style.color = "#7a7268")}
          >
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={{
      padding: "clamp(3rem,8vh,6rem) clamp(1.5rem,5vw,4rem)",
      maxWidth: 960, margin: "0 auto",
    }}>
      <p style={{
        fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em",
        textTransform: "uppercase", color: "#c8531a", marginBottom: "1.5rem",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ display: "block", width: 28, height: 1, background: "#c8531a" }} />
        Open Source · Community Built
      </p>

      <h1 style={{
        fontFamily: "'Fraunces', serif", fontSize: "clamp(3rem,6vw,5rem)",
        fontWeight: 300, lineHeight: 0.95, letterSpacing: "-0.03em",
        color: "#0d0f0e", marginBottom: "1.75rem",
      }}>
        Tools for<br />
        <em style={{ fontStyle: "italic", fontWeight: 700, color: "#c8531a" }}>Slackliners,</em><br />
        by Slackliners.
      </h1>

      <p style={{
        fontSize: "1rem", fontWeight: 300, lineHeight: 1.75, color: "#7a7268",
        maxWidth: 440, marginBottom: "2.5rem",
      }}>
        AI-powered safety assistants, physics calculators, rigging guides,
        team finder, and event calendar — built on ISA standards and the
        collective knowledge of the global slackline community.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "3rem" }}>
        <a href="#tools" style={{
          fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", fontWeight: 500,
          letterSpacing: "0.06em", textTransform: "uppercase",
          background: "#0d0f0e", color: "#f4f1eb",
          padding: "14px 28px", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 8,
          transition: "background 0.2s",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "#c8531a")}
          onMouseLeave={e => (e.currentTarget.style.background = "#0d0f0e")}
        >
          Explore tools →
        </a>
        <a href="https://github.com/cayanandante/slackline-hub" target="_blank" style={{
          fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", fontWeight: 400,
          letterSpacing: "0.06em", textTransform: "uppercase",
          background: "transparent", color: "#0d0f0e",
          padding: "14px 28px", borderRadius: 4, border: "1px solid rgba(13,15,14,0.15)",
          display: "inline-flex", alignItems: "center", gap: 8,
          transition: "border-color 0.2s",
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "#0d0f0e")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(13,15,14,0.15)")}
        >
          GitHub →
        </a>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap", borderTop: "1px solid rgba(13,15,14,0.1)", paddingTop: "2rem" }}>
        {[
          { num: "200+", label: "Curated resources" },
          { num: "28", label: "Brazilian teams" },
          { num: "12", label: "Tools planned" },
          { num: "3", label: "Languages" },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: "2rem", fontWeight: 700, fontStyle: "italic", color: "#0d0f0e", lineHeight: 1 }}>{s.num}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a7268", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Safety note ───────────────────────────────────────────────────────────────

function SafetyNote() {
  return (
    <div style={{
      margin: "0 clamp(1.5rem,5vw,4rem)",
      padding: "1.25rem 1.5rem",
      background: "#fef0ec", border: "1px solid #f5c4ad", borderRadius: 6,
      display: "flex", alignItems: "flex-start", gap: "1rem",
      fontSize: "0.8rem", color: "#7a3015", lineHeight: 1.5,
    }}>
      <span style={{ fontSize: "1rem", flexShrink: 0 }}>⚠</span>
      <span>
        <strong>Safety first.</strong> All AI-generated rigging advice on this site must be verified
        by a certified ISA Rigger before use. This platform is a learning and reference tool —
        not a substitute for hands-on training and certification.
      </span>
    </div>
  );
}

// ── Tools grid ────────────────────────────────────────────────────────────────

function ToolCard({ name, desc, path, status, accent, bg }: {
  name: string; desc: string; path: string | null;
  status: string; accent: string; bg: string;
}) {
  const isLive = status === "live";

  const content = (
    <div style={{
      background: "#fff", borderRadius: 8,
      border: `1px solid ${isLive ? "rgba(13,15,14,0.12)" : "rgba(13,15,14,0.07)"}`,
      padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem",
      height: "100%", transition: "border-color 0.2s, transform 0.15s",
      cursor: isLive ? "pointer" : "default",
      opacity: isLive ? 1 : 0.75,
    }}
      onMouseEnter={e => {
        if (isLive) {
          (e.currentTarget as HTMLDivElement).style.borderColor = accent;
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = isLive ? "rgba(13,15,14,0.12)" : "rgba(13,15,14,0.07)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 36, height: 36, borderRadius: 6, background: bg, flexShrink: 0 }} />
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", fontWeight: 500,
          letterSpacing: "0.08em", textTransform: "uppercase",
          padding: "3px 8px", borderRadius: 3,
          background: isLive ? "#edf4f0" : "#f1efe8",
          color: isLive ? "#2d6a4f" : "#7a7268",
        }}>
          {isLive ? "Live" : "Coming soon"}
        </span>
      </div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: "1.05rem", fontWeight: 300, letterSpacing: "-0.01em", color: "#0d0f0e", lineHeight: 1.3 }}>
        {name}
      </div>
      <div style={{ fontSize: "0.82rem", fontWeight: 300, color: "#7a7268", lineHeight: 1.65, flex: 1 }}>
        {desc}
      </div>
      {isLive && (
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.06em", textTransform: "uppercase", color: accent, marginTop: "auto" }}>
          Open tool →
        </div>
      )}
    </div>
  );

  if (isLive && path) {
    return <Link to={path} style={{ textDecoration: "none", display: "block" }}>{content}</Link>;
  }
  return content;
}

function ToolsSection() {
  return (
    <section id="tools" style={{ padding: "clamp(4rem,8vh,7rem) clamp(1.5rem,5vw,4rem)", maxWidth: 960, margin: "0 auto" }}>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7a7268", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ display: "block", width: 20, height: 1, background: "#7a7268" }} />
        What we're building
      </p>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 300, letterSpacing: "-0.02em", marginBottom: "3rem" }}>
        Community tools
      </h2>

      {tools.map(cat => (
        <div key={cat.category} style={{ marginBottom: "3rem" }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.12em",
            textTransform: "uppercase", color: cat.accent, marginBottom: "1rem",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ width: 16, height: 1, background: cat.accent, display: "block" }} />
            {cat.category}
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1rem",
          }}>
            {cat.items.map(item => (
              <ToolCard key={item.name} {...item} accent={cat.accent} bg={cat.bg} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

// ── About / Knowledge section ─────────────────────────────────────────────────

function AboutSection() {
  const sources = [
    "ISA", "Slacktivity", "Balance Community", "HowNOT2",
    "RopeLab", "Philip Queen", "Slackchat", "Vulcano Slacklife",
    "Raed Slacklines", "ISA SlackData API", "ISA SlackMap",
  ];

  return (
    <section id="about" style={{
      background: "#edeae2", borderTop: "1px solid rgba(13,15,14,0.1)", borderBottom: "1px solid rgba(13,15,14,0.1)",
      padding: "clamp(4rem,8vh,7rem) clamp(1.5rem,5vw,4rem)",
    }}>
      <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}>
        <div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7a7268", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "block", width: 20, height: 1, background: "#7a7268" }} />
            What powers this site
          </p>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 300, letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
            Curated knowledge base
          </h2>
          <p style={{ fontSize: "0.9rem", fontWeight: 300, color: "#7a7268", lineHeight: 1.75, marginBottom: "1.5rem" }}>
            Every tool on this site is grounded in the{" "}
            <em style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>Guia do Praticante de Highline</em>{" "}
            — a curated guide by Cayan Dantas with over 200 verified links to ISA documents,
            break-load studies, rigging tutorials, and community resources.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {sources.map(s => (
              <span key={s} style={{
                fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", letterSpacing: "0.04em",
                textTransform: "uppercase", color: "#7a7268",
                border: "1px solid rgba(13,15,14,0.12)", padding: "4px 10px", borderRadius: 3,
                background: "#f4f1eb",
              }}>{s}</span>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(13,15,14,0.1)", border: "1px solid rgba(13,15,14,0.1)", borderRadius: 8, overflow: "hidden" }}>
          {[
            { num: "200+", label: "Curated links" },
            { num: "144", label: "Structured resources" },
            { num: "27", label: "Topic sections" },
            { num: "12", label: "Incident reports" },
          ].map(s => (
            <div key={s.label} style={{ background: "#f4f1eb", padding: "1.75rem" }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: "2.5rem", fontWeight: 700, fontStyle: "italic", lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a7268", marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid rgba(13,15,14,0.1)",
      padding: "2rem clamp(1.5rem,5vw,4rem)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: "1rem", maxWidth: "100%",
    }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.04em", color: "#7a7268", lineHeight: 1.7 }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 700, color: "#0d0f0e", fontSize: "0.9rem" }}>Slackline Hub</span><br />
        Built by{" "}
        <a href="mailto:cayanmecanica@gmail.com" style={{ color: "#c8531a" }}>Cayan Dantas</a>
        {" "}· Powered by ISA open data · Open source
      </div>
      <div style={{ display: "flex", gap: "1.5rem" }}>
        {[
          { label: "ISA GitHub", href: "https://github.com/International-Slackline-Association" },
          { label: "ISA Open Data", href: "https://data.slacklineinternational.org/" },
          { label: "Become a Rigger", href: "https://www.slacklineinternational.org/riggers/" },
        ].map(l => (
          <a key={l.label} href={l.href} target="_blank" style={{
            fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.06em",
            textTransform: "uppercase", color: "#7a7268", transition: "color 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "#0d0f0e")}
            onMouseLeave={e => (e.currentTarget.style.color = "#7a7268")}
          >{l.label}</a>
        ))}
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Index() {
  return (
    <div style={{ background: "#f4f1eb", minHeight: "100vh", color: "#0d0f0e" }}>
      <Nav />
      <Hero />
      <SafetyNote />
      <ToolsSection />
      <AboutSection />
      <Footer />
    </div>
  );
}
