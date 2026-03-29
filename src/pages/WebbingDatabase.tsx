import { useState, useMemo, useRef, useCallback } from "react";
import rawWebbingData from "../data/webbing_database.json";

const C = { white:"#ffffff", bg:"#f7f8fc", navy:"#1a237e", blue:"#2979ff", coral:"#ef5350", teal:"#00bfa5", amber:"#ffc107", muted:"#5c6685", border:"#dde3f0" };
const F = "'DM Sans', sans-serif";

interface StretchPoint { kn:number; percent:number; }
interface Webbing { id:string; name:string; brand:string|null; webbingType:string|null; material:string[]; widthMm:number|null; weightGm:number|null; mbsKn:number|null; wllKn:number|null; depthMm:number|null; url:string|null; discontinued:boolean; stretchCurve:StretchPoint[]|null; stretchSource:string|null; sources:string[]; }

const TYPE_LABELS:Record<string,string> = {FL:"Flat",TB:"Tubular",CS:"Crossing",TR:"Trickline"};
const MAT_LABELS:Record<string,string> = {PL:"Polyester",NY:"Nylon",DY:"Dyneema",VC:"Vectran",hybrid:"Hybrid",unknown:"?"};
const MAT_COLORS:Record<string,{bg:string;text:string}> = {
  DY:{bg:"rgba(0,191,165,0.1)",text:"#00bfa5"},
  NY:{bg:"rgba(41,121,255,0.1)",text:"#2979ff"},
  PL:{bg:"rgba(255,193,7,0.15)",text:"#b8860b"},
  hybrid:{bg:"rgba(239,83,80,0.1)",text:"#ef5350"},
  VC:{bg:"rgba(92,102,133,0.1)",text:"#5c6685"},
};

const PALETTE = ["#2979ff","#ef5350","#00bfa5","#ffc107","#7c3aed","#0891b2","#be185d","#16a34a","#ea580c","#4f46e5","#0284c7","#9333ea","#15803d","#c2410c","#1d4ed8","#047857","#b45309","#6d28d9","#0369a1","#9f1239","#065f46","#92400e","#3730a3","#164e63","#701a75","#14532d","#7c2d12","#1e1b4b","#083344","#500724"];
const SYMBOLS = ["circle","square","triangle","diamond","cross","star","hexagon","pentagon","arrow","plus"] as const;
type SymbolType = typeof SYMBOLS[number];

function drawSymbol(sym:SymbolType,cx:number,cy:number,r:number,color:string,opacity=1):React.ReactNode {
  const s={stroke:color,fill:color,fillOpacity:opacity,strokeWidth:0};
  switch(sym){
    case "circle": return <circle cx={cx} cy={cy} r={r} {...s}/>;
    case "square": return <rect x={cx-r} y={cy-r} width={r*2} height={r*2} {...s}/>;
    case "triangle": return <polygon points={`${cx},${cy-r} ${cx+r*0.87},${cy+r*0.5} ${cx-r*0.87},${cy+r*0.5}`} {...s}/>;
    case "diamond": return <polygon points={`${cx},${cy-r} ${cx+r},${cy} ${cx},${cy+r} ${cx-r},${cy}`} {...s}/>;
    case "cross": return <g><rect x={cx-r*0.25} y={cy-r} width={r*0.5} height={r*2} fill={color} fillOpacity={opacity}/><rect x={cx-r} y={cy-r*0.25} width={r*2} height={r*0.5} fill={color} fillOpacity={opacity}/></g>;
    case "star": return <polygon points={`${cx},${cy-r} ${cx+r*0.35},${cy-r*0.35} ${cx+r},${cy} ${cx+r*0.35},${cy+r*0.35} ${cx},${cy+r} ${cx-r*0.35},${cy+r*0.35} ${cx-r},${cy} ${cx-r*0.35},${cy-r*0.35}`} {...s}/>;
    case "hexagon": return <polygon points={[0,1,2,3,4,5].map(i=>`${cx+r*Math.cos(i*Math.PI/3-Math.PI/6)},${cy+r*Math.sin(i*Math.PI/3-Math.PI/6)}`).join(" ")} {...s}/>;
    case "pentagon": return <polygon points={[0,1,2,3,4].map(i=>`${cx+r*Math.cos(i*2*Math.PI/5-Math.PI/2)},${cy+r*Math.sin(i*2*Math.PI/5-Math.PI/2)}`).join(" ")} {...s}/>;
    case "arrow": return <polygon points={`${cx},${cy-r} ${cx+r*0.7},${cy+r*0.5} ${cx},${cy+r*0.1} ${cx-r*0.7},${cy+r*0.5}`} {...s}/>;
    case "plus": return <g><rect x={cx-r*0.2} y={cy-r} width={r*0.4} height={r*2} fill={color} fillOpacity={opacity}/><rect x={cx-r} y={cy-r*0.2} width={r*2} height={r*0.4} fill={color} fillOpacity={opacity}/></g>;
    default: return <circle cx={cx} cy={cy} r={r} {...s}/>;
  }
}

const chip = (active:boolean):React.CSSProperties => ({ fontFamily:F, fontSize:15, fontWeight:600, padding:"9px 22px", borderRadius:10, border:"2px solid", borderColor:active?C.blue:C.border, background:active?C.blue:C.white, color:active?C.white:C.muted, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap" as const });

function StretchChart({webbings,colorMap,symMap,activeIds,onToggle}:{webbings:Webbing[];colorMap:Record<string,string>;symMap:Record<string,SymbolType>;activeIds:Set<string>;onToggle:(id:string)=>void;}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mouseKn,setMouseKn] = useState<number|null>(null);
  const [mousePct,setMousePct] = useState<number|null>(null);
  const [hoveredId,setHoveredId] = useState<string|null>(null);
  const visible = webbings.filter(w=>activeIds.has(w.id)&&w.stretchCurve&&w.stretchCurve.length>1);
  const VW=860,VH=500,PL=56,PR=24,PT=24,PB=52;
  const CW=VW-PL-PR,CH=VH-PT-PB;
  const xS=(kn:number)=>PL+(kn/12)*CW;
  const yS=(p:number)=>PT+CH-Math.min(1,p/25)*CH;
  const interp=(w:Webbing,kn:number):number|null=>{
    if(!w.stretchCurve)return null;
    const pts=w.stretchCurve.filter(p=>p.kn<=12);
    const ex=pts.find(p=>p.kn===kn);if(ex)return ex.percent;
    const s=[...pts].sort((a,b)=>a.kn-b.kn);
    const lo=s.filter(p=>p.kn<=kn).pop();const hi=s.find(p=>p.kn>kn);
    if(lo&&hi)return Math.round((lo.percent+(kn-lo.kn)/(hi.kn-lo.kn)*(hi.percent-lo.percent))*100)/100;
    return null;
  };
  const handleMouseMove=useCallback((e:React.MouseEvent<SVGSVGElement>)=>{
    if(!svgRef.current)return;
    const rect=svgRef.current.getBoundingClientRect();
    const px=(e.clientX-rect.left)*(VW/rect.width);
    const py=(e.clientY-rect.top)*(VH/rect.height);
    const kn=Math.max(0,Math.min(12,Math.round(((px-PL)/CW)*12)));
    setMouseKn(kn);
    let cid:string|null=null,cd=Infinity;
    visible.forEach(w=>{const v=interp(w,kn);if(v===null)return;const d=Math.abs(py-yS(v));if(d<cd){cd=d;cid=w.id;}});
    if(cd<50){setHoveredId(cid);if(cid){const hv=visible.find(v=>v.id===cid);if(hv)setMousePct(interp(hv,kn));}}
    else{setHoveredId(null);setMousePct(null);}
  },[visible]);
  const handleMouseLeave=()=>{setMouseKn(null);setHoveredId(null);setMousePct(null);};
  const symKns=[2,4,6,8,10,12];
  return (
    <div style={{display:"flex",gap:0,background:C.white,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:"0 2px 16px rgba(26,35,126,0.06)"}}>
      <div style={{flex:1,minWidth:0}}>
        <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} style={{width:"100%",display:"block",cursor:"crosshair"}} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          {[0,5,10,15,20,25].map(y=>(
            <g key={y}>
              <line x1={PL} x2={VW-PR} y1={yS(y)} y2={yS(y)} stroke={C.border} strokeWidth={1}/>
              <text x={PL-10} y={yS(y)+5} fontSize={13} fill={C.muted} textAnchor="end" fontFamily={F} fontWeight="600">{y}%</text>
            </g>
          ))}
          {[0,2,4,6,8,10,12].map(x=>(
            <g key={x}>
              <line x1={xS(x)} x2={xS(x)} y1={PT} y2={VH-PB} stroke={C.border} strokeWidth={1}/>
              <text x={xS(x)} y={VH-PB+18} fontSize={13} fill={C.muted} textAnchor="middle" fontFamily={F} fontWeight="600">{x} kN</text>
            </g>
          ))}
          <text x={VW/2} y={VH-5} fontSize={13} fill={C.muted} textAnchor="middle" fontFamily={F} fontWeight="700" letterSpacing="0.08em">TENSION (kN)</text>
          <text x={16} y={VH/2} fontSize={13} fill={C.muted} textAnchor="middle" fontFamily={F} fontWeight="700" letterSpacing="0.08em" transform={`rotate(-90,16,${VH/2})`}>STRETCH %</text>
          {visible.map(w=>{
            const pts=w.stretchCurve!.filter(p=>p.kn<=12).sort((a,b)=>a.kn-b.kn);
            if(pts.length<2)return null;
            const col=colorMap[w.id],sym=symMap[w.id];
            const isH=hoveredId===w.id,isDim=hoveredId!==null&&!isH;
            const op=isDim?0.05:isH?1:0.7,sw=isH?3.5:1.5;
            const d=pts.map((p,i)=>`${i===0?"M":"L"} ${xS(p.kn).toFixed(1)} ${yS(p.percent).toFixed(1)}`).join(" ");
            return (
              <g key={w.id}>
                <path d={d} fill="none" stroke={col} strokeWidth={sw} strokeOpacity={op} strokeDasharray={w.discontinued?"6 3":undefined} style={{transition:"stroke-opacity 0.08s"}}/>
                {symKns.map(kn=>{const v=interp(w,kn);if(v===null)return null;return(<g key={kn} opacity={isDim?0.05:isH?1:0.65} style={{transition:"opacity 0.08s"}}>{drawSymbol(sym,xS(kn),yS(v),isH?6:4,col)}</g>);})}
              </g>
            );
          })}
          {mouseKn!==null&&<line x1={xS(mouseKn)} x2={xS(mouseKn)} y1={PT} y2={VH-PB} stroke={C.navy} strokeWidth={1} strokeDasharray="4 3" opacity={0.3}/>}
          {hoveredId&&mouseKn!==null&&(()=>{
            const w=visible.find(v=>v.id===hoveredId);
            if(!w||mousePct===null)return null;
            const py=yS(mousePct),col=colorMap[w.id],sym=symMap[w.id];
            const tx=xS(mouseKn)+16,bw=Math.min(280,(w.name.length*8.5)+100),bh=w.brand?50:30,by=Math.max(PT,Math.min(py-bh/2,VH-PB-bh));
            return(
              <g>
                {drawSymbol(sym,xS(mouseKn),py,8,col)}
                <rect x={tx} y={by} width={bw} height={bh} rx={8} fill={C.white} stroke={col} strokeWidth={2}/>
                <text x={tx+14} y={by+19} fontSize={14} fill={col} fontFamily={F} fontWeight="800">{w.name} — {mousePct}% @ {mouseKn} kN</text>
                {w.brand&&<text x={tx+14} y={by+37} fontSize={12} fill={C.muted} fontFamily={F} fontWeight="600">{w.brand}</text>}
              </g>
            );
          })()}
          {visible.length===0&&<text x={VW/2} y={VH/2} fontSize={18} fill={C.muted} textAnchor="middle" fontFamily={F} fontWeight="700">Select webbings in the legend to plot</text>}
        </svg>
        {hoveredId&&mouseKn!==null&&(()=>{
          const w=visible.find(v=>v.id===hoveredId);
          if(!w||mousePct===null)return null;
          return(
            <div style={{background:C.bg,borderTop:`1px solid ${C.border}`,padding:"12px 20px",display:"flex",alignItems:"center",gap:14}}>
              <span style={{fontFamily:F,fontSize:16,fontWeight:800,color:colorMap[w.id]}}>{w.name}</span>
              <span style={{fontFamily:F,fontSize:16,fontWeight:700,color:C.navy}}>{mousePct}% at {mouseKn} kN</span>
              {w.brand&&<span style={{fontFamily:F,fontSize:15,fontWeight:600,color:C.muted}}>· {w.brand}</span>}
              {w.discontinued&&<span style={{fontFamily:F,fontSize:13,fontWeight:700,color:C.muted,border:`1px solid ${C.border}`,borderRadius:6,padding:"2px 8px"}}>Discontinued</span>}
            </div>
          );
        })()}
      </div>
      {/* Sidebar legend */}
      <div style={{width:210,borderLeft:`1px solid ${C.border}`,overflowY:"auto",maxHeight:524,background:C.white}}>
        <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,background:C.white,zIndex:1}}>
          <span style={{fontFamily:F,fontSize:14,fontWeight:700,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase"}}>Legend</span>
        </div>
        {webbings.filter(w=>w.stretchCurve&&w.stretchCurve.length>1&&activeIds.has(w.id)).map(w=>{
          const col=colorMap[w.id],sym=symMap[w.id];
          return(
            <div key={w.id} onClick={()=>onToggle(w.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",cursor:"pointer",borderBottom:`1px solid ${C.border}`,transition:"background 0.1s"}}
              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background=C.bg}
              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=C.white}
            >
              <svg width={14} height={14} viewBox="-7 -7 14 14" style={{flexShrink:0}}>{drawSymbol(sym,0,0,5,col)}</svg>
              <span style={{fontFamily:F,fontSize:13,fontWeight:600,color:C.navy,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",flex:1,textDecoration:w.discontinued?"line-through":"none",opacity:w.discontinued?0.5:1}}>{w.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StretchTable({webbings,colorMap}:{webbings:Webbing[];colorMap:Record<string,string>;}) {
  const rows=webbings.filter(w=>w.stretchCurve&&w.stretchCurve.length>1);
  const kns=[1,2,3,4,5,6,7,8,9,10,11,12];
  const getVal=(w:Webbing,kn:number):number|null=>{
    if(!w.stretchCurve)return null;
    const ex=w.stretchCurve.find(p=>p.kn===kn);if(ex)return ex.percent;
    const s=[...w.stretchCurve].sort((a,b)=>a.kn-b.kn);
    const lo=s.filter(p=>p.kn<=kn).pop();const hi=s.find(p=>p.kn>kn);
    if(lo&&hi)return Math.round((lo.percent+(kn-lo.kn)/(hi.kn-lo.kn)*(hi.percent-lo.percent))*100)/100;
    return null;
  };
  const th:React.CSSProperties={padding:"14px 14px",fontFamily:F,fontSize:14,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:C.muted,borderBottom:`2px solid ${C.border}`,whiteSpace:"nowrap",textAlign:"left",background:C.white};
  const td:React.CSSProperties={padding:"12px 14px",fontFamily:F,fontSize:14,fontWeight:500,borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap",color:C.navy};
  return(
    <div style={{overflowX:"auto"}}>
      <table style={{borderCollapse:"collapse",width:"100%",minWidth:700,background:C.white,border:`1px solid ${C.border}`,borderRadius:14}}>
        <thead>
          <tr>
            <th style={{...th,position:"sticky",left:0,minWidth:170,zIndex:2}}>Webbing</th>
            <th style={{...th,minWidth:120}}>Brand</th>
            {kns.map(kn=><th key={kn} style={{...th,textAlign:"center",minWidth:58}}>{kn} kN</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((w,i)=>(
            <tr key={w.id} style={{background:i%2===0?C.white:C.bg}}>
              <td style={{...td,position:"sticky",left:0,background:i%2===0?C.white:C.bg,zIndex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{width:10,height:10,borderRadius:"50%",background:colorMap[w.id],flexShrink:0}}/>
                  <span style={{color:w.discontinued?C.muted:C.navy,fontStyle:w.discontinued?"italic":"normal"}}>{w.name}</span>
                  {w.discontinued&&<span style={{fontSize:11,color:C.muted,border:`1px solid ${C.border}`,borderRadius:4,padding:"0 5px"}}>DC</span>}
                </div>
              </td>
              <td style={{...td,color:C.muted,fontSize:13}}>{w.brand||"—"}</td>
              {kns.map(kn=>{
                const val=getVal(w,kn);
                const intensity=val!=null?Math.min(1,val/25):0;
                const col=colorMap[w.id];
                const r=parseInt(col.slice(1,3),16),g=parseInt(col.slice(3,5),16),b=parseInt(col.slice(5,7),16);
                return(<td key={kn} style={{...td,textAlign:"center",background:val!=null&&val>0?`rgba(${r},${g},${b},${0.04+intensity*0.14})`:undefined,fontWeight:val!=null?700:400,color:val!=null?C.navy:C.muted}}>{val!=null?`${val}%`:"—"}</td>);
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SpecsTable({webbings}:{webbings:Webbing[]}) {
  const [sortCol,setSortCol]=useState("mbsKn");
  const [sortDir,setSortDir]=useState<"asc"|"desc">("desc");
  const handleSort=(col:string)=>{if(sortCol===col)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortCol(col);setSortDir("desc");}};
  const sorted=useMemo(()=>[...webbings].sort((a,b)=>{
    let va:string|number=0,vb:string|number=0;
    if(sortCol==="name"){va=a.name;vb=b.name;}
    else if(sortCol==="brand"){va=a.brand||"";vb=b.brand||"";}
    else if(sortCol==="mbsKn"){va=a.mbsKn??-1;vb=b.mbsKn??-1;}
    else if(sortCol==="weightGm"){va=a.weightGm??9999;vb=b.weightGm??9999;}
    else if(sortCol==="widthMm"){va=a.widthMm??0;vb=b.widthMm??0;}
    if(typeof va==="string")return sortDir==="asc"?va.localeCompare(vb as string):(vb as string).localeCompare(va);
    return sortDir==="asc"?va-(vb as number):(vb as number)-va;
  }),[webbings,sortCol,sortDir]);
  const th:React.CSSProperties={padding:"14px 14px",fontFamily:F,fontSize:14,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:C.muted,borderBottom:`2px solid ${C.border}`,whiteSpace:"nowrap",textAlign:"left",background:C.white,cursor:"pointer"};
  const td:React.CSSProperties={padding:"12px 14px",fontFamily:F,fontSize:14,fontWeight:500,borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap",color:C.navy};
  const SH=({col,label}:{col:string;label:string})=>(<th style={th} onClick={()=>handleSort(col)} onMouseEnter={e=>(e.currentTarget.style.color=C.blue)} onMouseLeave={e=>(e.currentTarget.style.color=C.muted)}>{label}{sortCol===col?(sortDir==="asc"?" ↑":" ↓"):""}</th>);
  return(
    <div style={{overflowX:"auto"}}>
      <table style={{borderCollapse:"collapse",width:"100%",minWidth:900,background:C.white,border:`1px solid ${C.border}`,borderRadius:14}}>
        <thead>
          <tr>
            <SH col="name" label="Name"/><SH col="brand" label="Brand"/>
            <th style={{...th,cursor:"default"}}>Material</th>
            <th style={{...th,cursor:"default"}}>Type</th>
            <SH col="widthMm" label="Width"/><SH col="mbsKn" label="MBS"/>
            <th style={{...th,cursor:"default"}}>WLL</th>
            <SH col="weightGm" label="Weight"/>
            <th style={{...th,cursor:"default"}}>Stretch</th>
            <th style={{...th,cursor:"default"}}>Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((w,i)=>{
            const mc=MAT_COLORS[w.material[0]]||{bg:"rgba(0,0,0,0.04)",text:C.muted};
            return(
              <tr key={w.id} style={{background:i%2===0?C.white:C.bg}}>
                <td style={{...td,color:w.discontinued?C.muted:C.navy,fontStyle:w.discontinued?"italic":"normal"}}>
                  {w.url?<a href={w.url} target="_blank" rel="noopener noreferrer" style={{color:"inherit",textDecoration:"none"}} onMouseEnter={e=>(e.currentTarget.style.color=C.blue)} onMouseLeave={e=>(e.currentTarget.style.color=w.discontinued?C.muted:C.navy)}>{w.name} ↗</a>:w.name}
                </td>
                <td style={{...td,color:C.muted,fontSize:13}}>{w.brand||"—"}</td>
                <td style={td}><span style={{background:mc.bg,color:mc.text,borderRadius:6,padding:"3px 9px",fontSize:12,fontWeight:700,letterSpacing:"0.05em"}}>{w.material.map(m=>MAT_LABELS[m]||m).join("+")}</span></td>
                <td style={{...td,color:C.muted}}>{w.webbingType?(TYPE_LABELS[w.webbingType]||w.webbingType):"—"}</td>
                <td style={{...td,textAlign:"center"}}>{w.widthMm!=null?`${w.widthMm}mm`:"—"}</td>
                <td style={{...td,textAlign:"center",fontWeight:w.mbsKn?800:500,color:w.mbsKn?C.navy:C.muted}}>{w.mbsKn!=null?`${w.mbsKn} kN`:"—"}</td>
                <td style={{...td,textAlign:"center"}}>{w.wllKn!=null?`${w.wllKn} kN`:"—"}</td>
                <td style={{...td,textAlign:"center"}}>{w.weightGm!=null?`${w.weightGm}g/m`:"—"}</td>
                <td style={{...td,textAlign:"center"}}>{w.stretchCurve&&w.stretchCurve.length>1?<span style={{color:C.teal,fontSize:13,fontWeight:700}}>✓ {w.stretchCurve.length}pt</span>:w.stretchCurve?.length===1?<span style={{color:C.amber,fontSize:13,fontWeight:700}}>~{w.stretchCurve[0].percent}%</span>:<span style={{color:C.muted,fontSize:13}}>—</span>}</td>
                <td style={td}><span style={{fontSize:13,fontWeight:700,padding:"3px 10px",borderRadius:8,background:w.discontinued?"rgba(0,0,0,0.05)":"rgba(0,191,165,0.1)",color:w.discontinued?C.muted:C.teal}}>{w.discontinued?"Discontinued":"Active"}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type ViewMode="charts"|"stretch-table"|"specs-table";
type StatusFilter="active"|"all"|"discontinued";
type MatFilter="ALL"|"PL"|"NY"|"DY"|"hybrid";
type SortKey="mbs"|"weight"|"name";

export default function WebbingDatabase() {
  const allData=rawWebbingData as unknown as Webbing[];
  const colorMap=useMemo(()=>{const m:Record<string,string>={};allData.forEach((w,i)=>{m[w.id]=PALETTE[i%PALETTE.length];});return m;},[allData]);
  const symMap=useMemo(()=>{const m:Record<string,SymbolType>={};allData.forEach((w,i)=>{m[w.id]=SYMBOLS[i%SYMBOLS.length];});return m;},[allData]);
  const [viewMode,setViewMode]=useState<ViewMode>("charts");
  const [search,setSearch]=useState("");
  const [matFilter,setMatFilter]=useState<MatFilter>("ALL");
  const [statusFilter,setStatusFilter]=useState<StatusFilter>("active");
  const [sortBy,setSortBy]=useState<SortKey>("mbs");
  const allStretchIds=useMemo(()=>new Set(allData.filter(w=>w.stretchCurve&&w.stretchCurve.length>1).map(w=>w.id)),[allData]);
  const [activeStretchIds,setActiveStretchIds]=useState<Set<string>>(allStretchIds);
  const filtered=useMemo(()=>allData
    .filter(w=>statusFilter==="all"?true:statusFilter==="active"?!w.discontinued:w.discontinued)
    .filter(w=>matFilter==="ALL"||w.material.includes(matFilter))
    .filter(w=>!search||w.name.toLowerCase().includes(search.toLowerCase())||(w.brand||"").toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>{if(sortBy==="name")return a.name.localeCompare(b.name);if(sortBy==="mbs")return(b.mbsKn??0)-(a.mbsKn??0);return(a.weightGm??9999)-(b.weightGm??9999);}
  ),[allData,search,matFilter,statusFilter,sortBy]);
  const toggleStretch=(id:string)=>setActiveStretchIds(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});
  const stats=useMemo(()=>({total:allData.length,active:allData.filter(w=>!w.discontinued).length,disc:allData.filter(w=>w.discontinued).length,stretch:allData.filter(w=>w.stretchCurve&&w.stretchCurve.length>1).length}),[allData]);
  const TAB=(mode:ViewMode,label:string)=>(
    <button onClick={()=>setViewMode(mode)} style={{fontFamily:F,fontSize:17,fontWeight:700,padding:"20px 28px",border:"none",background:"transparent",cursor:"pointer",color:viewMode===mode?C.blue:C.muted,borderBottom:`3px solid ${viewMode===mode?C.blue:"transparent"}`,transition:"all 0.15s"}}>{label}</button>
  );
  return(
    <div style={{background:C.bg,minHeight:"100vh",color:C.navy,fontFamily:F}}>
      {/* Header */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,boxShadow:"0 2px 16px rgba(26,35,126,0.06)"}}>
        <div style={{maxWidth:1500,margin:"0 auto",padding:"0 clamp(2rem,6vw,7rem)"}}>
          <div style={{paddingTop:40,paddingBottom:36}}>
            <a href="/" style={{fontFamily:F,fontSize:15,fontWeight:600,color:C.muted,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6,marginBottom:24,transition:"color 0.15s"}} onMouseEnter={e=>(e.currentTarget.style.color=C.blue)} onMouseLeave={e=>(e.currentTarget.style.color=C.muted)}>← SlackHub</a>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:24}}>
              <div>
                <p style={{fontFamily:F,fontSize:15,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.blue,marginBottom:12}}>Gear Database</p>
                <h1 style={{fontFamily:F,fontWeight:900,fontSize:"clamp(3rem,6vw,5.5rem)",letterSpacing:"-0.02em",margin:0,lineHeight:1,color:C.navy}}>Webbing Database.</h1>
              </div>
              <div style={{display:"flex",gap:32}}>
                {([
                  [stats.total,"total"],[stats.active,"active"],[stats.disc,"discontinued"],[stats.stretch,"stretch curves"]
                ] as [number,string][]).map(([n,label])=>(
                  <div key={label} style={{textAlign:"right"}}>
                    <div style={{fontFamily:F,fontSize:"clamp(2rem,3vw,3rem)",fontWeight:900,color:C.blue,lineHeight:1}}>{n}</div>
                    <div style={{fontFamily:F,fontSize:14,fontWeight:600,color:C.muted,marginTop:4}}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:1500,margin:"0 auto",padding:"0 clamp(2rem,6vw,7rem)",display:"flex"}}>
          {TAB("charts","📊 Stretch Chart")}{TAB("stretch-table","📋 Stretch Table")}{TAB("specs-table","📄 All Specs")}
        </div>
      </div>
      <div style={{maxWidth:1500,margin:"0 auto",padding:"clamp(2rem,3vh,2.5rem) clamp(2rem,6vw,7rem) 6rem"}}>
        {/* Filters */}
        <div style={{display:"flex",flexWrap:"wrap",gap:24,alignItems:"flex-end",marginBottom:28,padding:"24px 28px",background:C.white,border:`1px solid ${C.border}`,borderRadius:16,boxShadow:"0 2px 12px rgba(26,35,126,0.05)"}}>
          <div style={{flex:"1 1 220px"}}>
            <div style={{fontFamily:F,fontSize:14,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.muted,marginBottom:10}}>Search</div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name or brand…"
              style={{width:"100%",fontFamily:F,fontSize:16,border:`2px solid ${C.border}`,borderRadius:10,padding:"10px 16px",background:C.bg,color:C.navy,boxSizing:"border-box",outline:"none",transition:"border-color 0.15s"}}
              onFocus={e=>(e.currentTarget.style.borderColor=C.blue)} onBlur={e=>(e.currentTarget.style.borderColor=C.border)}
            />
          </div>
          <div>
            <div style={{fontFamily:F,fontSize:14,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.muted,marginBottom:10}}>Status</div>
            <div style={{display:"flex",gap:8}}>
              {(["all","active","discontinued"] as StatusFilter[]).map(s=>(
                <button key={s} onClick={()=>setStatusFilter(s)} style={chip(statusFilter===s)}>
                  {s==="all"?"All":s==="active"?"Active":"Discontinued"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontFamily:F,fontSize:14,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.muted,marginBottom:10}}>Material</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {(["ALL","PL","NY","DY","hybrid"] as MatFilter[]).map(m=>(
                <button key={m} onClick={()=>setMatFilter(m)} style={chip(matFilter===m)}>
                  {m==="ALL"?"All":MAT_LABELS[m]||m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontFamily:F,fontSize:14,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.muted,marginBottom:10}}>Sort</div>
            <div style={{display:"flex",gap:8}}>
              {(["mbs","weight","name"] as SortKey[]).map(s=>(
                <button key={s} onClick={()=>setSortBy(s)} style={chip(sortBy===s)}>{s==="mbs"?"MBS ↓":s==="weight"?"Weight ↑":"A–Z"}</button>
              ))}
            </div>
          </div>
          <div style={{fontFamily:F,fontSize:17,fontWeight:700,color:C.muted,marginLeft:"auto",alignSelf:"center"}}>{filtered.length} / {allData.length}</div>
        </div>
        {/* Charts view */}
        {viewMode==="charts"&&(
          <div>
            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
              <button onClick={()=>setActiveStretchIds(new Set(allStretchIds))} style={{...chip(false),fontSize:14,padding:"7px 18px"}}>All on</button>
              <button onClick={()=>setActiveStretchIds(new Set())} style={{...chip(false),fontSize:14,padding:"7px 18px"}}>All off</button>
              <button onClick={()=>{const ids=new Set(filtered.filter(w=>w.stretchCurve&&w.stretchCurve.length>1).map(w=>w.id));setActiveStretchIds(ids);}} style={{...chip(false),fontSize:14,padding:"7px 18px"}}>Show filtered only</button>
              <span style={{fontFamily:F,fontSize:14,fontWeight:600,color:C.muted}}>{activeStretchIds.size}/{allStretchIds.size} shown · dashed = discontinued · hover for values</span>
            </div>
            <StretchChart webbings={filtered} colorMap={colorMap} symMap={symMap} activeIds={activeStretchIds} onToggle={toggleStretch}/>
            <p style={{fontFamily:F,fontSize:14,fontWeight:600,color:C.muted,marginTop:12}}>Sources: Balance Community · ISA SlackData · Click legend to toggle · Hover chart for values</p>
          </div>
        )}
        {viewMode==="stretch-table"&&(
          <div>
            <p style={{fontFamily:F,fontSize:15,fontWeight:600,color:C.muted,marginBottom:16}}>{filtered.filter(w=>w.stretchCurve&&w.stretchCurve.length>1).length} webbings · Values interpolated where exact kN point not measured</p>
            <StretchTable webbings={filtered} colorMap={colorMap}/>
          </div>
        )}
        {viewMode==="specs-table"&&(
          <div>
            <p style={{fontFamily:F,fontSize:15,fontWeight:600,color:C.muted,marginBottom:16}}>{filtered.length} webbings · Click headers to sort</p>
            <SpecsTable webbings={filtered}/>
          </div>
        )}
        <div style={{marginTop:48,padding:"20px 24px",background:C.white,border:`1px solid ${C.border}`,borderRadius:14}}>
          <p style={{fontFamily:F,fontSize:15,color:C.muted,margin:0,lineHeight:1.8}}>Data: SlackDB · ISA SlackData · Balance Community · Always verify MBS and safety specs with the manufacturer before rigging.</p>
        </div>
      </div>
    </div>
  );
}
