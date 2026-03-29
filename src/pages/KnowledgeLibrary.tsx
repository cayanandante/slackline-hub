import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

// ── Supabase client ───────────────────────────────────────────────────────────

const SUPABASE_URL = "https://qgcemdwsruveqdiddhjz.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnY2VtZHdzcnV2ZXFkaWRkaGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjU5NDQsImV4cCI6MjA5MDMwMTk0NH0.oWvKBSFmKheu0_eUd5e9WuOa9LqVpMDXJA71WXC26Y4";

async function fetchResources(): Promise<Resource[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/resources?select=*&order=section,title_pt`,
    {
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
      },
    }
  );
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Resource {
  id: string;
  url: string;
  title_pt: string | null;
  title_en: string | null;
  author: string | null;
  year: number | null;
  type: string;
  source: string;
  section: string | null;
  subsection: string | null;
  language: string;
  tags: string[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, string> = {
  video:     "▶",
  article:   "📄",
  document:  "📋",
  instagram: "📷",
  community: "💬",
  shop:      "🛍",
  tool:      "🔧",
  book:      "📚",
  podcast:   "🎙",
  database:  "🗄",
  app:       "📱",
  link:      "🔗",
};

const TYPE_LABELS: Record<string, string> = {
  video:     "Video",
  article:   "Article",
  document:  "Document",
  instagram: "Instagram",
  community: "Community",
  shop:      "Shop",
  tool:      "Tool",
  book:      "Book",
  podcast:   "Podcast",
  database:  "Database",
  app:       "App",
  link:      "Link",
};

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  video:     { bg: "#fee2e2", color: "#991b1b" },
  article:   { bg: "#dbeafe", color: "#1e40af" },
  document:  { bg: "#e0e7ff", color: "#3730a3" },
  instagram: { bg: "#fce7f3", color: "#9d174d" },
  community: { bg: "#fef3c7", color: "#92400e" },
  shop:      { bg: "#d1fae5", color: "#065f46" },
  tool:      { bg: "#f3e8ff", color: "#6b21a8" },
  book:      { bg: "#fef9c3", color: "#713f12" },
  podcast:   { bg: "#ffedd5", color: "#9a3412" },
  database:  { bg: "#f0fdf4", color: "#14532d" },
  app:       { bg: "#ede9fe", color: "#5b21b6" },
  link:      { bg: "#f1f5f9", color: "#475569" },
};

const FILTER_TYPES = ["all", "video", "article", "document", "community", "shop", "tool", "book", "podcast", "instagram"];

// ── Section order — matches guide chapter order ───────────────────────────────
const SECTION_ORDER = [
  "Highline para Iniciantes (ou não):",
  "Onde posso aprender sobre Highline e Slackline?",
  "Como trabalham as forças no Highline?",
  "Como montar um Highline?",
  "Nós utilizados no Highline:",
  "Qual é a maneira correta de se usar os equipamentos utilizados no Highline?",
  "Como e qual a importância de se fazer o arremate da fita no Highline?",
  "Tudo sobre Backup Fall:",
  "Tudo sobre Dyneema:",
  "Tudo sobre Highline Freestyle:",
  "Testes e análises de carga de ruptura de equipamentos utilizados no Highline:",
  "Incidentes e acidentes que já ocorreram no Highline:",
  "Equipes Brasileiras de Highline:",
  "Onde posso comprar equipamentos de Highline, Slackline e de segurança?",
  "Documentários, filmes e vídeos interessantes sobre Highline:",
  "Tudo sobre o Slackline e as suas modalidades:",
  "General",
];

function sectionOrder(section: string | null): number {
  const s = section || "General";
  const idx = SECTION_ORDER.findIndex(o => s.startsWith(o.replace(/:$/, "").substring(0, 20)));
  return idx === -1 ? 99 : idx;
}

// Shorten long section titles for display
function sectionLabel(section: string | null): string {
  if (!section) return "General";
  return section.replace(/:$/, "").trim();
}

// ── Components ────────────────────────────────────────────────────────────────

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
        <Link to="/knowledge" style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.04em", color: "#0d0f0e", padding: "0 1rem", height: 56, display: "flex", alignItems: "center", borderBottom: "2px solid #c8531a" }}>
          Knowledge
        </Link>
      </div>
    </nav>
  );
}

function ResourceCard({ r }: { r: Resource }) {
  const tc = TYPE_COLORS[r.type] || TYPE_COLORS.link;
  const displayTitle = r.title_pt || r.title_en || r.url;
  const isImageLink = !r.title_pt && !r.title_en;

  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex", flexDirection: "column", gap: 10,
        background: "#fff", borderRadius: 8,
        border: "1px solid rgba(13,15,14,0.08)",
        padding: "1rem 1.1rem",
        textDecoration: "none", color: "inherit",
        transition: "border-color 0.15s, transform 0.15s",
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(13,15,14,0.25)";
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(13,15,14,0.08)";
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
      }}
    >
      {/* Top row: type badge + language */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", fontWeight: 500,
          letterSpacing: "0.06em", textTransform: "uppercase",
          background: tc.bg, color: tc.color,
          padding: "2px 8px", borderRadius: 3,
        }}>
          {TYPE_ICONS[r.type]} {TYPE_LABELS[r.type] || r.type}
        </span>
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: "0.6rem",
          color: "#7a7268", letterSpacing: "0.06em",
          padding: "2px 6px", border: "1px solid rgba(13,15,14,0.1)", borderRadius: 3,
        }}>
          {r.language.toUpperCase()}
        </span>
      </div>

      {/* Title */}
      <div style={{
        fontFamily: isImageLink ? "'DM Mono', monospace" : "'DM Sans', sans-serif",
        fontSize: isImageLink ? "0.7rem" : "0.88rem",
        fontWeight: isImageLink ? 400 : 500,
        color: isImageLink ? "#7a7268" : "#0d0f0e",
        lineHeight: 1.4,
        flex: 1,
        wordBreak: "break-word",
      }}>
        {isImageLink ? r.url.split("/")[2] : displayTitle}
      </div>

      {/* Bottom: source + author/year */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 8 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#c8531a", letterSpacing: "0.04em" }}>
          {r.source}
        </span>
        {(r.author || r.year) && (
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#7a7268", textAlign: "right" }}>
            {[r.author, r.year].filter(Boolean).join(" · ")}
          </span>
        )}
      </div>
    </a>
  );
}

function SectionGroup({ section, resources }: { section: string; resources: Resource[] }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ marginBottom: "2.5rem" }}>
      {/* Section header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "none", border: "none", borderBottom: "1px solid rgba(13,15,14,0.1)",
          padding: "0.5rem 0 0.75rem", cursor: "pointer", marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 16, height: 1, background: "#c8531a", display: "block" }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#c8531a" }}>
            {sectionLabel(section)}
          </span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#7a7268", marginLeft: 4 }}>
            {resources.length}
          </span>
        </div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#7a7268" }}>
          {collapsed ? "show ↓" : "hide ↑"}
        </span>
      </button>

      {!collapsed && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "0.75rem",
        }}>
          {resources.map(r => <ResourceCard key={r.id} r={r} />)}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function KnowledgeLibrary() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");

  useEffect(() => {
    fetchResources()
      .then(data => { setResources(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // Filter resources
  const filtered = useMemo(() => {
    let r = resources;
    if (typeFilter !== "all") r = r.filter(x => x.type === typeFilter);
    if (langFilter !== "all") r = r.filter(x => x.language === langFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(x =>
        (x.title_pt || "").toLowerCase().includes(q) ||
        (x.title_en || "").toLowerCase().includes(q) ||
        (x.author || "").toLowerCase().includes(q) ||
        (x.source || "").toLowerCase().includes(q) ||
        (x.section || "").toLowerCase().includes(q)
      );
    }
    return r;
  }, [resources, search, typeFilter, langFilter]);

  // Group by section
  const grouped = useMemo(() => {
    const map = new Map<string, Resource[]>();
    for (const r of filtered) {
      const s = r.section || "General";
      if (!map.has(s)) map.set(s, []);
      map.get(s)!.push(r);
    }
    // Sort sections by guide order
    return Array.from(map.entries()).sort((a, b) => sectionOrder(a[0]) - sectionOrder(b[0]));
  }, [filtered]);

  // Stats
  const totalVideos = resources.filter(r => r.type === "video").length;
  const totalPT = resources.filter(r => r.language === "pt").length;
  const totalEN = resources.filter(r => r.language === "en").length;

  return (
    <div style={{ background: "#f4f1eb", minHeight: "100vh", color: "#0d0f0e" }}>
      <Nav />

      {/* Page header */}
      <div style={{ borderBottom: "1px solid rgba(13,15,14,0.1)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem clamp(1.5rem,5vw,4rem) 1.5rem" }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#c8531a", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "block", width: 20, height: 1, background: "#c8531a" }} />
            Knowledge Base
          </p>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
            Resource Library
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#7a7268", fontWeight: 300, marginBottom: "1.5rem" }}>
            {resources.length > 0
              ? `${resources.length} resources from the Guia do Praticante de Highline — ${totalVideos} videos, ${totalPT} in Portuguese, ${totalEN} in English`
              : "Loading resources from the Guia do Praticante de Highline..."}
          </p>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: 480, marginBottom: "1.25rem" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#7a7268", fontSize: "0.9rem" }}>⌕</span>
            <input
              type="text"
              placeholder="Search by title, author, source, section..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px 10px 36px",
                fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem",
                border: "1px solid rgba(13,15,14,0.15)", borderRadius: 6,
                background: "#fff", color: "#0d0f0e",
                outline: "none",
              }}
              onFocus={e => (e.target.style.borderColor = "#c8531a")}
              onBlur={e => (e.target.style.borderColor = "rgba(13,15,14,0.15)")}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#7a7268", fontSize: "1rem" }}
              >×</button>
            )}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
            {/* Type filter */}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {FILTER_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  style={{
                    fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.04em",
                    padding: "5px 12px", borderRadius: 4, border: "1px solid",
                    cursor: "pointer", transition: "all 0.15s",
                    borderColor: typeFilter === t ? "#0d0f0e" : "rgba(13,15,14,0.15)",
                    background: typeFilter === t ? "#0d0f0e" : "transparent",
                    color: typeFilter === t ? "#f4f1eb" : "#7a7268",
                  }}
                >
                  {t === "all" ? "All types" : `${TYPE_ICONS[t]} ${TYPE_LABELS[t]}`}
                </button>
              ))}
            </div>

            {/* Language filter */}
            <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
              {[["all", "PT + EN"], ["pt", "🇧🇷 PT"], ["en", "🇬🇧 EN"]].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setLangFilter(val)}
                  style={{
                    fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.04em",
                    padding: "5px 12px", borderRadius: 4, border: "1px solid",
                    cursor: "pointer",
                    borderColor: langFilter === val ? "#c8531a" : "rgba(13,15,14,0.15)",
                    background: langFilter === val ? "rgba(200,83,26,0.08)" : "transparent",
                    color: langFilter === val ? "#c8531a" : "#7a7268",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem clamp(1.5rem,5vw,4rem)" }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "4rem 0", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", color: "#7a7268" }}>
            Loading resources...
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "1rem 1.5rem", color: "#991b1b", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem" }}>
            ❌ Failed to load resources: {error}
          </div>
        )}

        {/* Results count when filtering */}
        {!loading && !error && (search || typeFilter !== "all" || langFilter !== "all") && (
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#7a7268", marginBottom: "1.5rem" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
            {search && ` for "${search}"`}
            {" "}
            <button onClick={() => { setSearch(""); setTypeFilter("all"); setLangFilter("all"); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#c8531a", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem" }}>
              Clear all filters
            </button>
          </div>
        )}

        {/* No results */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: "1.2rem", fontWeight: 300, color: "#0d0f0e", marginBottom: "0.5rem" }}>No resources found</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "#7a7268" }}>Try different search terms or clear the filters</div>
          </div>
        )}

        {/* Grouped sections */}
        {!loading && !error && grouped.map(([section, items]) => (
          <SectionGroup key={section} section={section} resources={items} />
        ))}

      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(13,15,14,0.1)", padding: "1.5rem clamp(1.5rem,5vw,4rem)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#7a7268" }}>
          Source: <em>Guia do Praticante de Highline</em> by Cayan Dantas · {resources.length} unique resources
        </span>
        <Link to="/" style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#7a7268" }}>
          ← Back to hub
        </Link>
      </div>
    </div>
  );
}
