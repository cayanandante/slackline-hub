import { useState, useEffect, useMemo } from "react";

const C = { white:"#ffffff", bg:"#f5f6f8", navy:"#0a1628", blue:"#1a56db", muted:"#6b7a99", border:"#dde2ed", text:"#0a1628" };
const FONT = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";

const SUPABASE_URL = "https://qgcemdwsruveqdiddhjz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnY2VtZHdzcnV2ZXFkaWRkaGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjU5NDQsImV4cCI6MjA5MDMwMTk0NH0.oWvKBSFmKheu0_eUd5e9WuOa9LqVpMDXJA71WXC26Y4";

interface Resource {
  id?: number;
  url: string;
  title_pt: string;
  author?: string;
  year?: number;
  type?: string;
  source?: string;
  section?: string;
  language?: string;
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  video:     { bg:"rgba(239,68,68,0.1)",   text:"#dc2626" },
  article:   { bg:"rgba(26,86,219,0.1)",   text:"#1a56db" },
  document:  { bg:"rgba(139,92,246,0.1)",  text:"#7c3aed" },
  community: { bg:"rgba(16,185,129,0.1)",  text:"#059669" },
  database:  { bg:"rgba(245,158,11,0.1)",  text:"#d97706" },
  podcast:   { bg:"rgba(236,72,153,0.1)",  text:"#be185d" },
  instagram: { bg:"rgba(249,115,22,0.1)",  text:"#ea580c" },
  shop:      { bg:"rgba(20,184,166,0.1)",  text:"#0891b2" },
  tool:      { bg:"rgba(99,102,241,0.1)",  text:"#4f46e5" },
  link:      { bg:"rgba(107,122,153,0.1)", text:"#6b7a99" },
};

const chip = (active: boolean): React.CSSProperties => ({
  fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em",
  textTransform: "uppercase", padding: "6px 16px", borderRadius: 2, border: "1px solid",
  borderColor: active ? C.blue : C.border,
  background: active ? C.blue : C.white,
  color: active ? C.white : C.muted,
  cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" as const,
});

function ResourceCard({ r }: { r: Resource }) {
  const domain = (() => { try { return new URL(r.url).hostname.replace("www.", ""); } catch { return ""; } })();
  const t = (r.type || "link").toLowerCase();
  const col = TYPE_COLORS[t] || TYPE_COLORS.link;

  return (
    <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: C.white, border: `1px solid ${C.border}`, borderRadius: 4,
        padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8,
        transition: "border-color 0.15s, transform 0.15s", cursor: "pointer",
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.blue; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.border; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
      >
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 2, background: col.bg, color: col.text }}>{t}</span>
          {r.language && (
            <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 2, background: r.language === "pt" ? "rgba(16,185,129,0.1)" : "rgba(26,86,219,0.1)", color: r.language === "pt" ? "#059669" : "#1a56db" }}>{r.language.toUpperCase()}</span>
          )}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: C.navy, lineHeight: 1.3 }}>
          {r.title_pt || r.url}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {r.author && <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.muted }}>{r.author}</span>}
          {r.year && <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.muted }}>{r.year}</span>}
          {domain && <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: C.blue }}>{domain} ↗</span>}
        </div>
      </div>
    </a>
  );
}

export default function KnowledgeLibrary() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [langFilter, setLangFilter] = useState("ALL");
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/resources?select=*&order=section.asc,id.asc&limit=500`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setResources(data);
          setOpenSections(new Set(data.map((r: Resource) => r.section || "Other")));
        } else { setError("Failed to load resources."); }
        setLoading(false);
      })
      .catch(() => { setError("Network error."); setLoading(false); });
  }, []);

  const types = useMemo(() => {
    const t = new Set(resources.map(r => r.type || "link").filter(Boolean));
    return ["ALL", ...Array.from(t).sort()];
  }, [resources]);

  const filtered = useMemo(() => resources.filter(r => {
    if (typeFilter !== "ALL" && (r.type || "link") !== typeFilter) return false;
    if (langFilter !== "ALL" && r.language !== langFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (r.title_pt || "").toLowerCase().includes(q) || (r.author || "").toLowerCase().includes(q) || (r.url || "").toLowerCase().includes(q);
    }
    return true;
  }), [resources, typeFilter, langFilter, search]);

  const grouped = useMemo(() => {
    const g: Record<string, Resource[]> = {};
    filtered.forEach(r => { const s = r.section || "Other"; if (!g[s]) g[s] = []; g[s].push(r); });
    return g;
  }, [filtered]);

  const toggle = (sec: string) => setOpenSections(prev => { const n = new Set(prev); n.has(sec) ? n.delete(sec) : n.add(sec); return n; });

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>

      {/* Header */}
      <div style={{ background: C.navy, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(1.5rem,4vw,4rem)" }}>
          <div style={{ paddingTop: 36, paddingBottom: 32 }}>
            <a href="/" style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24, transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = C.blue)}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >← Slackline Hub</a>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.blue, marginBottom: 10 }}>Knowledge</div>
                <h1 style={{ fontFamily: FONT, fontWeight: 800, textTransform: "uppercase", fontSize: "clamp(3rem,6vw,6rem)", letterSpacing: "-0.01em", margin: 0, lineHeight: 0.9, color: C.white }}>
                  Resource<br/>Library.
                </h1>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.5)", margin: "14px 0 0", fontWeight: 400, maxWidth: 440, lineHeight: 1.6 }}>
                  463 curated resources from the Guia do Praticante de Highline. Documents, videos, tutorials and tools.
                </p>
              </div>
              <div style={{ display: "flex", gap: 28 }}>
                {([
                  [resources.length || 463, "total"],
                  [resources.filter(r => r.language === "pt").length || 87, "portuguese"],
                  [resources.filter(r => r.language !== "pt").length || 376, "english"],
                ] as [number, string][]).map(([n, label]) => (
                  <div key={label} style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: FONT, fontSize: "clamp(1.8rem,3vw,3rem)", fontWeight: 800, color: C.blue, lineHeight: 1 }}>{n}</div>
                    <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(1.5rem,3vh,2rem) clamp(1.5rem,4vw,4rem) 5rem" }}>

        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-end", marginBottom: 24, padding: "18px 20px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 4 }}>
          <div style={{ flex: "1 1 200px" }}>
            <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Search</div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Title, author, URL…"
              style={{ width: "100%", fontFamily: "'DM Sans',sans-serif", fontSize: 15, border: `1px solid ${C.border}`, borderRadius: 3, padding: "8px 12px", background: C.bg, color: C.text, boxSizing: "border-box", outline: "none" }}
              onFocus={e => (e.currentTarget.style.borderColor = C.blue)}
              onBlur={e => (e.currentTarget.style.borderColor = C.border)}
            />
          </div>

          <div>
            <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Language</div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["ALL","pt","en"] as const).map(l => (
                <button key={l} onClick={() => setLangFilter(l)} style={chip(langFilter === l)}>
                  {l === "ALL" ? "All" : l === "pt" ? "Portuguese" : "English"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Type</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {types.slice(0, 8).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} style={chip(typeFilter === t)}>
                  {t === "ALL" ? "All" : t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: C.muted, marginLeft: "auto", alignSelf: "center" }}>
            {filtered.length} / {resources.length || 463}
          </div>
        </div>

        {/* Section expand/collapse controls */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button onClick={() => setOpenSections(new Set(Object.keys(grouped)))} style={{ ...chip(false), fontSize: 12, padding: "5px 12px" }}>
            Expand all
          </button>
          <button onClick={() => setOpenSections(new Set())} style={{ ...chip(false), fontSize: 12, padding: "5px 12px" }}>
            Collapse all
          </button>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0", fontFamily: FONT, fontSize: 20, fontWeight: 700, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Loading resources…
          </div>
        )}
        {error && (
          <div style={{ textAlign: "center", padding: "40px 0", fontFamily: FONT, fontSize: 18, fontWeight: 700, color: "#dc2626" }}>{error}</div>
        )}

        {/* Sections */}
        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {Object.entries(grouped).map(([sec, items]) => (
              <div key={sec} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden" }}>
                <button
                  onClick={() => toggle(sec)}
                  style={{
                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "18px 22px", background: "transparent", border: "none", cursor: "pointer",
                    borderBottom: openSections.has(sec) ? `1px solid ${C.border}` : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.bg)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontFamily: FONT, fontSize: 19, fontWeight: 800, textTransform: "uppercase", color: C.navy, letterSpacing: "0.01em", textAlign: "left" }}>
                      {sec.replace(/\.$/, "")}
                    </span>
                    <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: C.blue, background: "rgba(26,86,219,0.08)", padding: "2px 10px", borderRadius: 2, flexShrink: 0 }}>
                      {items.length}
                    </span>
                  </div>
                  <span style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: C.muted, flexShrink: 0 }}>
                    {openSections.has(sec) ? "−" : "+"}
                  </span>
                </button>

                {openSections.has(sec) && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1, padding: 1, background: C.border }}>
                    {items.map((r, i) => (
                      <div key={i} style={{ background: C.white }}>
                        <ResourceCard r={r} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", fontFamily: FONT, fontSize: 18, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            No resources match your filters.
          </div>
        )}

        <div style={{ marginTop: 48, padding: "14px 18px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 4 }}>
          <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.muted, margin: 0, lineHeight: 1.9, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Source: Guia do Praticante de Highline by Cayan Dantas · 463 curated links across 23 sections
          </p>
        </div>
      </div>
    </div>
  );
}
