import { Link } from "react-router-dom";

const C = { white:"#ffffff", bg:"#f7f8fc", navy:"#1a237e", blue:"#2979ff", coral:"#ef5350", teal:"#00bfa5", amber:"#ffc107", muted:"#5c6685", border:"#dde3f0" };
const F = "'DM Sans', sans-serif";

function Logo({ size=40 }: { size?: number }) {
  return (
    <svg width={size} height={size*0.75} viewBox="0 0 48 36" fill="none">
      <rect x="0" y="1" width="48" height="6" rx="3" fill="#2979ff"/>
      <path d="M0 14 Q12 10 24 14 Q36 18 48 14" stroke="#ef5350" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M0 23 Q12 19 24 23 Q36 27 48 23" stroke="#00bfa5" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M0 32 Q12 28 24 32 Q36 36 48 32" stroke="#ffc107" strokeWidth="6" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

const liveTools = [
  { tag:"Physics",   name:"Forces Calculator", desc:"Line tension, anchor loads, backup fall simulator, and mechanical advantage — all in one.",  path:"/tools/physics",       accent:C.blue  },
  { tag:"Gear",      name:"Webbing Database",  desc:"241 webbings with stretch curves, MBS, weight and full material data from 3 sources.",      path:"/gear/webbing",        accent:C.teal  },
  { tag:"Knowledge", name:"Resource Library",  desc:"463 curated links from the Guia do Praticante de Highline, across 23 sections.",            path:"/knowledge/resources", accent:C.coral },
];
const comingTools = [
  { name:"AI Safety Check", tag:"AI",        accent:C.blue  },
  { name:"Knot Guide",      tag:"Rigging",   accent:C.teal  },
  { name:"Knowledge Chat",  tag:"AI",        accent:C.blue  },
  { name:"Trick Database",  tag:"Freestyle", accent:C.coral },
  { name:"Spot Map",        tag:"Community", accent:C.amber },
  { name:"Events Calendar", tag:"Community", accent:C.amber },
];

function Nav() {
  return (
    <nav style={{ position:"sticky", top:0, zIndex:100, background:C.white, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 clamp(2rem,6vw,7rem)", height:72, boxShadow:"0 2px 16px rgba(26,35,126,0.06)" }}>
      <Link to="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:14 }}>
        <Logo size={44} />
        <span style={{ fontFamily:F, fontSize:24, fontWeight:800, color:C.navy, letterSpacing:"-0.02em" }}>SlackHub</span>
      </Link>
      <div style={{ display:"flex", alignItems:"center" }}>
        {[{label:"Tools",href:"#tools"},{label:"Gear",href:"/gear/webbing"},{label:"Resources",href:"/knowledge/resources"},{label:"Calculator",href:"/tools/physics"},{label:"GitHub ↗",href:"https://github.com/cayanandante/slackline-hub",ext:true}].map(l => (
          <a key={l.label} href={l.href} target={l.ext?"_blank":undefined} style={{ fontFamily:F, fontSize:16, fontWeight:600, color:C.muted, padding:"0 20px", height:72, display:"flex", alignItems:"center", textDecoration:"none", transition:"color 0.15s" }}
            onMouseEnter={e=>(e.currentTarget.style.color=C.blue)} onMouseLeave={e=>(e.currentTarget.style.color=C.muted)}
          >{l.label}</a>
        ))}
        <div style={{ display:"flex", gap:4, marginLeft:16, paddingLeft:16, borderLeft:`1px solid ${C.border}` }}>
          {["EN","PT","ES"].map((lang,i) => (
            <button key={lang} style={{ fontFamily:F, fontSize:14, fontWeight:700, padding:"6px 13px", borderRadius:8, border:"none", background:i===0?C.blue:"transparent", color:i===0?C.white:C.muted, cursor:i===0?"default":"not-allowed" }} title={i===0?"English":"Coming soon"}>{lang}</button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section style={{ background:C.white, padding:"clamp(5rem,12vh,10rem) clamp(2rem,6vw,7rem) clamp(4rem,8vh,7rem)", position:"relative", overflow:"hidden" }}>
      <svg style={{ position:"absolute", bottom:0, left:0, width:"100%", opacity:0.05, pointerEvents:"none" }} viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d="M0 40 Q360 0 720 40 Q1080 80 1440 40 L1440 200 L0 200Z" fill="#2979ff"/>
        <path d="M0 80 Q360 40 720 80 Q1080 120 1440 80 L1440 200 L0 200Z" fill="#ef5350"/>
        <path d="M0 120 Q360 80 720 120 Q1080 160 1440 120 L1440 200 L0 200Z" fill="#00bfa5"/>
        <path d="M0 160 Q360 120 720 160 Q1080 200 1440 160 L1440 200 L0 200Z" fill="#ffc107"/>
      </svg>
      <div style={{ maxWidth:1500, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 380px", gap:"clamp(3rem,6vw,8rem)", alignItems:"center", position:"relative" }}>
        <div>
          <p style={{ fontFamily:F, fontSize:16, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.blue, marginBottom:24, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ width:36, height:3, background:C.blue, display:"inline-block", borderRadius:2 }}/>
            Open Source · ISA Standards · Community Built
          </p>
          <h1 style={{ fontFamily:F, fontSize:"clamp(4rem,8vw,8rem)", fontWeight:900, lineHeight:0.95, letterSpacing:"-0.03em", color:C.navy, margin:"0 0 clamp(2rem,4vh,3rem)" }}>
            Tools for<br/><span style={{ color:C.blue }}>Slackliners,</span><br/><span style={{ color:C.coral }}>by Slackliners.</span>
          </h1>
          <p style={{ fontFamily:F, fontSize:"clamp(1.15rem,1.8vw,1.4rem)", fontWeight:400, lineHeight:1.75, color:C.muted, maxWidth:560, marginBottom:"clamp(2.5rem,5vh,4rem)" }}>
            Physics calculators, AI safety tools, and the most complete webbing database — built on ISA standards by practitioners, for the global slackline community.
          </p>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            <Link to="/tools/physics" style={{ fontFamily:F, fontSize:18, fontWeight:700, background:C.blue, color:C.white, padding:"18px 40px", borderRadius:12, textDecoration:"none", boxShadow:"0 4px 24px rgba(41,121,255,0.35)", transition:"transform 0.15s, box-shadow 0.15s", display:"inline-block" }}
              onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.transform="translateY(-2px)";(e.currentTarget as HTMLAnchorElement).style.boxShadow="0 8px 32px rgba(41,121,255,0.45)";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.transform="none";(e.currentTarget as HTMLAnchorElement).style.boxShadow="0 4px 24px rgba(41,121,255,0.35)";}}
            >Forces Calculator →</Link>
            <Link to="/gear/webbing" style={{ fontFamily:F, fontSize:18, fontWeight:700, background:C.white, color:C.navy, padding:"18px 40px", borderRadius:12, textDecoration:"none", border:`2px solid ${C.border}`, transition:"border-color 0.15s", display:"inline-block" }}
              onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.borderColor=C.navy}
              onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.borderColor=C.border}
            >Webbing Database →</Link>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
          {[{n:"241",label:"Webbings",color:C.blue},{n:"463",label:"Resources",color:C.coral},{n:"96",label:"Stretch curves",color:C.teal},{n:"3",label:"Languages",color:C.amber}].map(s => (
            <div key={s.label} style={{ background:C.bg, borderRadius:14, padding:"28px 22px", borderTop:`5px solid ${s.color}` }}>
              <div style={{ fontFamily:F, fontSize:"clamp(2.2rem,3vw,3.2rem)", fontWeight:900, color:s.color, lineHeight:1 }}>{s.n}</div>
              <div style={{ fontFamily:F, fontSize:15, fontWeight:600, color:C.muted, marginTop:6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveTools() {
  return (
    <section id="tools" style={{ background:C.bg, padding:"clamp(5rem,10vh,8rem) clamp(2rem,6vw,7rem)" }}>
      <div style={{ maxWidth:1500, margin:"0 auto" }}>
        <p style={{ fontFamily:F, fontSize:15, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.blue, marginBottom:14 }}>Live now</p>
        <h2 style={{ fontFamily:F, fontSize:"clamp(2.5rem,5vw,4.5rem)", fontWeight:900, letterSpacing:"-0.02em", color:C.navy, margin:"0 0 clamp(3rem,5vh,4rem)" }}>3 Tools Available</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
          {liveTools.map(t => (
            <Link key={t.name} to={t.path} style={{ textDecoration:"none" }}>
              <div style={{ background:C.white, borderRadius:18, padding:"clamp(2rem,3vw,3rem)", borderTop:`6px solid ${t.accent}`, boxShadow:"0 2px 20px rgba(26,35,126,0.06)", display:"flex", flexDirection:"column", gap:18, height:"100%", transition:"transform 0.2s, box-shadow 0.2s", cursor:"pointer" }}
                onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform="translateY(-5px)";(e.currentTarget as HTMLDivElement).style.boxShadow="0 12px 40px rgba(26,35,126,0.13)";}}
                onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform="none";(e.currentTarget as HTMLDivElement).style.boxShadow="0 2px 20px rgba(26,35,126,0.06)";}}
              >
                <span style={{ fontFamily:F, fontSize:13, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:t.accent, background:`${t.accent}18`, padding:"5px 14px", borderRadius:8, display:"inline-block", alignSelf:"flex-start" }}>{t.tag}</span>
                <div style={{ fontFamily:F, fontSize:"clamp(1.6rem,2.2vw,2.2rem)", fontWeight:800, color:C.navy, lineHeight:1.15 }}>{t.name}</div>
                <div style={{ fontFamily:F, fontSize:17, color:C.muted, lineHeight:1.7, flex:1 }}>{t.desc}</div>
                <div style={{ fontFamily:F, fontSize:16, fontWeight:700, color:t.accent }}>Open →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComingSoon() {
  return (
    <section style={{ background:C.white, borderTop:`1px solid ${C.border}`, padding:"clamp(4rem,8vh,6rem) clamp(2rem,6vw,7rem)" }}>
      <div style={{ maxWidth:1500, margin:"0 auto" }}>
        <p style={{ fontFamily:F, fontSize:15, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.coral, marginBottom:14 }}>In development</p>
        <h2 style={{ fontFamily:F, fontSize:"clamp(2.2rem,4vw,4rem)", fontWeight:900, letterSpacing:"-0.02em", color:C.navy, margin:"0 0 clamp(2.5rem,4vh,3rem)" }}>Coming Soon</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(230px,1fr))", gap:14 }}>
          {comingTools.map(t => (
            <div key={t.name} style={{ background:C.bg, borderRadius:14, padding:"26px 24px", borderLeft:`5px solid ${t.accent}40`, display:"flex", flexDirection:"column", gap:12 }}>
              <span style={{ fontFamily:F, fontSize:13, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:t.accent, background:`${t.accent}18`, padding:"4px 12px", borderRadius:7, display:"inline-block", alignSelf:"flex-start" }}>{t.tag}</span>
              <div style={{ fontFamily:F, fontSize:20, fontWeight:700, color:`${C.navy}55` }}>{t.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section style={{ background:C.navy, padding:"clamp(5rem,10vh,8rem) clamp(2rem,6vw,7rem)" }}>
      <div style={{ maxWidth:1500, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"clamp(4rem,8vw,10rem)", alignItems:"center" }}>
        <div>
          <div style={{ marginBottom:36 }}><Logo size={56}/></div>
          <h2 style={{ fontFamily:F, fontSize:"clamp(2.8rem,5vw,5rem)", fontWeight:900, letterSpacing:"-0.02em", color:C.white, lineHeight:1.05, margin:"0 0 28px" }}>
            Built by a slackliner,<br/><span style={{ color:C.teal }}>for slackliners.</span>
          </h2>
          <p style={{ fontFamily:F, fontSize:20, color:"rgba(255,255,255,0.6)", lineHeight:1.8, marginBottom:32 }}>
            Created by <strong style={{ color:C.white }}>Cayan Dantas</strong>, ISA Certified Rigger and Mechanical Engineer from Brazil.
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {["ISA Open Data","SlackDB","Balance Community","RopeLab","HowNOT2"].map(s => (
              <span key={s} style={{ fontFamily:F, fontSize:15, fontWeight:600, color:"rgba(255,255,255,0.45)", border:"1px solid rgba(255,255,255,0.15)", padding:"8px 18px", borderRadius:10 }}>{s}</span>
            ))}
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
          {[{n:"463",label:"Curated resources",color:C.blue},{n:"241",label:"Webbings indexed",color:C.coral},{n:"96",label:"Stretch curves",color:C.teal},{n:"23",label:"Guide sections",color:C.amber}].map(s => (
            <div key={s.label} style={{ background:"rgba(255,255,255,0.05)", borderRadius:14, padding:"clamp(1.5rem,3vh,2.5rem)", borderBottom:`5px solid ${s.color}` }}>
              <div style={{ fontFamily:F, fontSize:"clamp(2.5rem,4vw,4rem)", fontWeight:900, color:s.color, lineHeight:1 }}>{s.n}</div>
              <div style={{ fontFamily:F, fontSize:15, fontWeight:600, color:"rgba(255,255,255,0.4)", marginTop:8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background:C.white, borderTop:`1px solid ${C.border}`, padding:"clamp(2rem,4vh,3rem) clamp(2rem,6vw,7rem)" }}>
      <div style={{ maxWidth:1500, margin:"0 auto", display:"flex", alignItems:"center", gap:18 }}>
        <Logo size={32}/>
        <div>
          <div style={{ fontFamily:F, fontSize:20, fontWeight:800, color:C.navy }}>SlackHub</div>
          <div style={{ fontFamily:F, fontSize:16, color:C.muted }}>
            Built by <strong style={{ color:C.navy }}>Cayan Dantas</strong>
            {" · "}
            <a href="mailto:cayandantas@proton.me" style={{ color:C.blue, textDecoration:"none" }}>cayandantas@proton.me</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Index() {
  return (
    <div style={{ background:C.white, minHeight:"100vh", color:C.navy, fontFamily:F }}>
      <Nav/><Hero/><LiveTools/><ComingSoon/><About/><Footer/>
    </div>
  );
}
