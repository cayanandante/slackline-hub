import { useState, useEffect, useMemo } from "react";

const C = { white:"#ffffff", bg:"#f7f8fc", navy:"#1a237e", blue:"#2979ff", coral:"#ef5350", teal:"#00bfa5", amber:"#ffc107", muted:"#5c6685", border:"#dde3f0" };
const F = "'DM Sans', sans-serif";

const SUPABASE_URL = "https://qgcemdwsruveqdiddhjz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnY2VtZHdzcnV2ZXFkaWRkaGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjU5NDQsImV4cCI6MjA5MDMwMTk0NH0.oWvKBSFmKheu0_eUd5e9WuOa9LqVpMDXJA71WXC26Y4";

interface Resource { id?:number; url:string; title_pt:string; author?:string; year?:number; type?:string; section?:string; language?:string; }

const TYPE_COL: Record<string,{bg:string;text:string}> = {
  video:    {bg:"rgba(239,83,80,0.1)",   text:"#ef5350"},
  article:  {bg:"rgba(41,121,255,0.1)",  text:"#2979ff"},
  document: {bg:"rgba(0,191,165,0.1)",   text:"#00bfa5"},
  community:{bg:"rgba(0,191,165,0.1)",   text:"#00bfa5"},
  database: {bg:"rgba(255,193,7,0.15)",  text:"#b8860b"},
  podcast:  {bg:"rgba(239,83,80,0.1)",   text:"#ef5350"},
  instagram:{bg:"rgba(239,83,80,0.1)",   text:"#ef5350"},
  shop:     {bg:"rgba(41,121,255,0.1)",  text:"#2979ff"},
  tool:     {bg:"rgba(0,191,165,0.1)",   text:"#00bfa5"},
  link:     {bg:"rgba(92,102,133,0.1)",  text:"#5c6685"},
};

const chip = (active:boolean): React.CSSProperties => ({
  fontFamily:F, fontSize:15, fontWeight:600, padding:"9px 22px", borderRadius:10, border:"2px solid",
  borderColor:active?C.blue:C.border, background:active?C.blue:C.white, color:active?C.white:C.muted,
  cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap" as const,
});

function ResourceCard({ r }: { r:Resource }) {
  const domain = (() => { try { return new URL(r.url).hostname.replace("www.",""); } catch { return ""; } })();
  const t = (r.type||"link").toLowerCase();
  const col = TYPE_COL[t]||TYPE_COL.link;
  return (
    <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", display:"block" }}>
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:"20px 22px", display:"flex", flexDirection:"column", gap:10, transition:"border-color 0.15s, transform 0.15s, box-shadow 0.15s", cursor:"pointer" }}
        onMouseEnter={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor=C.blue;d.style.transform="translateY(-2px)";d.style.boxShadow="0 6px 24px rgba(26,35,126,0.1)";}}
        onMouseLeave={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor=C.border;d.style.transform="none";d.style.boxShadow="none";}}
      >
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ fontFamily:F, fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", padding:"3px 10px", borderRadius:7, background:col.bg, color:col.text }}>{t}</span>
          {r.language && <span style={{ fontFamily:F, fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:7, background:r.language==="pt"?"rgba(0,191,165,0.1)":"rgba(41,121,255,0.1)", color:r.language==="pt"?C.teal:C.blue }}>{r.language.toUpperCase()}</span>}
        </div>
        <div style={{ fontFamily:F, fontSize:18, fontWeight:700, color:C.navy, lineHeight:1.35 }}>{r.title_pt||r.url}</div>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
          {r.author && <span style={{ fontFamily:F, fontSize:14, fontWeight:500, color:C.muted }}>{r.author}</span>}
          {r.year   && <span style={{ fontFamily:F, fontSize:14, fontWeight:500, color:C.muted }}>{r.year}</span>}
          {domain   && <span style={{ fontFamily:F, fontSize:13, fontWeight:600, color:C.blue }}>{domain} ↗</span>}
        </div>
      </div>
    </a>
  );
}

export default function KnowledgeLibrary() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [langFilter, setLangFilter] = useState("ALL");
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/resources?select=*&order=section.asc,id.asc&limit=500`, { headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`} })
      .then(r=>r.json()).then(data => {
        if (Array.isArray(data)) { setResources(data); setOpenSections(new Set(data.map((r:Resource)=>r.section||"Other"))); }
        else setError("Failed to load resources.");
        setLoading(false);
      }).catch(()=>{setError("Network error.");setLoading(false);});
  }, []);

  const types = useMemo(() => { const t=new Set(resources.map(r=>r.type||"link").filter(Boolean)); return ["ALL",...Array.from(t).sort()]; }, [resources]);

  const filtered = useMemo(() => resources.filter(r => {
    if (typeFilter!=="ALL" && (r.type||"link")!==typeFilter) return false;
    if (langFilter!=="ALL" && r.language!==langFilter) return false;
    if (search) { const q=search.toLowerCase(); return (r.title_pt||"").toLowerCase().includes(q)||(r.author||"").toLowerCase().includes(q)||(r.url||"").toLowerCase().includes(q); }
    return true;
  }), [resources,typeFilter,langFilter,search]);

  const grouped = useMemo(() => {
    const g:Record<string,Resource[]>={};
    filtered.forEach(r=>{const s=r.section||"Other";if(!g[s])g[s]=[];g[s].push(r);});
    return g;
  }, [filtered]);

  const toggle = (sec:string) => setOpenSections(prev=>{const n=new Set(prev);n.has(sec)?n.delete(sec):n.add(sec);return n;});

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.navy, fontFamily:F }}>
      {/* Header */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, boxShadow:"0 2px 16px rgba(26,35,126,0.06)" }}>
        <div style={{ maxWidth:1500, margin:"0 auto", padding:"0 clamp(2rem,6vw,7rem)" }}>
          <div style={{ paddingTop:40, paddingBottom:36 }}>
            <a href="/" style={{ fontFamily:F, fontSize:15, fontWeight:600, color:C.muted, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:6, marginBottom:24, transition:"color 0.15s" }}
              onMouseEnter={e=>(e.currentTarget.style.color=C.blue)} onMouseLeave={e=>(e.currentTarget.style.color=C.muted)}
            >← SlackHub</a>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:24 }}>
              <div>
                <p style={{ fontFamily:F, fontSize:15, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.blue, marginBottom:12 }}>Knowledge</p>
                <h1 style={{ fontFamily:F, fontWeight:900, fontSize:"clamp(3rem,6vw,5.5rem)", letterSpacing:"-0.02em", margin:0, lineHeight:1, color:C.navy }}>Resource Library.</h1>
                <p style={{ fontFamily:F, fontSize:18, color:C.muted, margin:"16px 0 0", lineHeight:1.6, maxWidth:480 }}>463 curated resources from the Guia do Praticante de Highline, across 23 sections.</p>
              </div>
              <div style={{ display:"flex", gap:32 }}>
                {([
                  [resources.length||463,"total"],[resources.filter(r=>r.language==="pt").length||87,"portuguese"],[resources.filter(r=>r.language!=="pt").length||376,"english"]
                ] as [number,string][]).map(([n,label])=>(
                  <div key={label} style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:F, fontSize:"clamp(2rem,3vw,3rem)", fontWeight:900, color:C.blue, lineHeight:1 }}>{n}</div>
                    <div style={{ fontFamily:F, fontSize:14, fontWeight:600, color:C.muted, marginTop:4 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1500, margin:"0 auto", padding:"clamp(2rem,3vh,2.5rem) clamp(2rem,6vw,7rem) 6rem" }}>
        {/* Filters */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:24, alignItems:"flex-end", marginBottom:28, padding:"24px 28px", background:C.white, border:`1px solid ${C.border}`, borderRadius:16, boxShadow:"0 2px 12px rgba(26,35,126,0.05)" }}>
          <div style={{ flex:"1 1 220px" }}>
            <div style={{ fontFamily:F, fontSize:14, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:C.muted, marginBottom:10 }}>Search</div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Title, author, URL…"
              style={{ width:"100%", fontFamily:F, fontSize:16, border:`2px solid ${C.border}`, borderRadius:10, padding:"10px 16px", background:C.bg, color:C.navy, boxSizing:"border-box", outline:"none", transition:"border-color 0.15s" }}
              onFocus={e=>(e.currentTarget.style.borderColor=C.blue)} onBlur={e=>(e.currentTarget.style.borderColor=C.border)}
            />
          </div>
          <div>
            <div style={{ fontFamily:F, fontSize:14, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:C.muted, marginBottom:10 }}>Language</div>
            <div style={{ display:"flex", gap:8 }}>
              {["ALL","pt","en"].map(l=>(
                <button key={l} onClick={()=>setLangFilter(l)} style={chip(langFilter===l)}>
                  {l==="ALL"?"All":l==="pt"?"Portuguese":"English"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily:F, fontSize:14, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:C.muted, marginBottom:10 }}>Type</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {types.slice(0,8).map(t=>(
                <button key={t} onClick={()=>setTypeFilter(t)} style={chip(typeFilter===t)}>{t==="ALL"?"All":t}</button>
              ))}
            </div>
          </div>
          <div style={{ fontFamily:F, fontSize:17, fontWeight:700, color:C.muted, marginLeft:"auto", alignSelf:"center" }}>
            {filtered.length} / {resources.length||463}
          </div>
        </div>

        {/* Expand/Collapse */}
        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          <button onClick={()=>setOpenSections(new Set(Object.keys(grouped)))} style={{ ...chip(false), fontSize:14, padding:"7px 18px" }}>Expand all</button>
          <button onClick={()=>setOpenSections(new Set())} style={{ ...chip(false), fontSize:14, padding:"7px 18px" }}>Collapse all</button>
        </div>

        {loading && <div style={{ textAlign:"center", padding:"80px 0", fontFamily:F, fontSize:22, fontWeight:700, color:C.muted }}>Loading resources…</div>}
        {error && <div style={{ textAlign:"center", padding:"40px 0", fontFamily:F, fontSize:18, fontWeight:700, color:C.coral }}>{error}</div>}

        {!loading && !error && (
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            {Object.entries(grouped).map(([sec,items])=>(
              <div key={sec} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden", boxShadow:"0 1px 8px rgba(26,35,126,0.04)" }}>
                <button onClick={()=>toggle(sec)} style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"22px 26px", background:"transparent", border:"none", cursor:"pointer", borderBottom:openSections.has(sec)?`1px solid ${C.border}`:"none", transition:"background 0.15s" }}
                  onMouseEnter={e=>(e.currentTarget.style.background=C.bg)} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                    <span style={{ fontFamily:F, fontSize:21, fontWeight:800, color:C.navy, textAlign:"left" }}>{sec.replace(/\.$/,"")}</span>
                    <span style={{ fontFamily:F, fontSize:15, fontWeight:700, color:C.blue, background:"rgba(41,121,255,0.1)", padding:"3px 12px", borderRadius:8, flexShrink:0 }}>{items.length}</span>
                  </div>
                  <span style={{ fontFamily:F, fontSize:24, fontWeight:700, color:C.muted, flexShrink:0 }}>{openSections.has(sec)?"−":"+"}</span>
                </button>
                {openSections.has(sec) && (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:1, padding:1, background:C.border }}>
                    {items.map((r,i)=>(
                      <div key={i} style={{ background:C.white }}><ResourceCard r={r}/></div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length===0 && (
          <div style={{ textAlign:"center", padding:"60px 0", fontFamily:F, fontSize:20, fontWeight:700, color:C.muted }}>No resources match your filters.</div>
        )}

        <div style={{ marginTop:48, padding:"20px 24px", background:C.white, border:`1px solid ${C.border}`, borderRadius:14 }}>
          <p style={{ fontFamily:F, fontSize:15, color:C.muted, margin:0, lineHeight:1.8 }}>
            Source: Guia do Praticante de Highline by Cayan Dantas · 463 curated links across 23 sections
          </p>
        </div>
      </div>
    </div>
  );
}
