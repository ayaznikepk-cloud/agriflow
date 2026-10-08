"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
type Cycle = {id:string;crop:string;variety:string;field:string;sowingDate:string;status:string};
function season(date:string) {
 const [year,month] = date.split("-").map(Number);
 if (!year || !month) return { name:"Unknown", year:"Unknown" };
 return month >= 10 || month <= 3 ? {name:"Rabi",year:month >= 10 ? year+"–"+String(year+1).slice(-2) : (year-1)+"–"+String(year).slice(-2)} : {name:"Kharif",year:String(year)};
}
export default function CycleList({cycles}:{cycles:Cycle[]}) {
 const [status,setStatus]=useState("active"),[selectedSeason,setSeason]=useState("all"),[selectedYear,setYear]=useState("all");
 const enriched=useMemo(()=>cycles.map(c=>({...c,season:season(c.sowingDate),complete:["closed","cancelled"].includes(c.status)})),[cycles]);
 const years=Array.from(new Set(enriched.map(c=>c.season.year))).sort().reverse();
 const filtered=enriched.filter(c=>(status==="all"||(status==="active"?!c.complete:c.complete))&&(selectedSeason==="all"||c.season.name===selectedSeason)&&(selectedYear==="all"||c.season.year===selectedYear));
 const groups=Array.from(new Set(filtered.map(c=>c.season.name+" "+c.season.year))).sort((a,b)=>b.localeCompare(a));
 return <section className="panel cycle-list"><div className="section-head"><h2>Crop cycles</h2><span className="muted">{filtered.length} of {cycles.length} cycles</span></div>
 <div className="cycle-filters"><div className="cycle-status-filter" aria-label="Cycle status">{[["active","Active"],["completed","Completed"],["all","All"]].map(([value,label])=><button key={value} type="button" className={status===value?"selected":""} onClick={()=>setStatus(value)}>{label}</button>)}</div><label>Season<select value={selectedSeason} onChange={e=>setSeason(e.target.value)}><option value="all">All seasons</option><option>Rabi</option><option>Kharif</option></select></label><label>Season year<select value={selectedYear} onChange={e=>setYear(e.target.value)}><option value="all">All years</option>{years.map(y=><option key={y}>{y}</option>)}</select></label></div>
 {groups.map(group=><details key={group} className="cycle-season-group" open><summary>{group}<span>{filtered.filter(c=>c.season.name+" "+c.season.year===group).length} cycles</span></summary><div className="cycle-records">{filtered.filter(c=>c.season.name+" "+c.season.year===group).sort((a,b)=>Number(a.complete)-Number(b.complete)||b.sowingDate.localeCompare(a.sowingDate)).map(c=><Link key={c.id} href={"/crop-cycles/"+c.id} className={"cycle-record"+(c.complete?" cycle-record-complete":"")}><div><strong>{c.crop}{c.variety?" · "+c.variety:""}</strong><small>{c.field} · Sown {c.sowingDate}</small></div><span className={"cycle-status-pill "+(c.complete?"is-complete":"is-active")}>{c.complete?"✓ "+(c.status==="cancelled"?"Cancelled":"Closed"):c.status==="harvest_complete"?"✓ Harvest complete":c.status==="harvesting"?"Harvesting":c.status==="planned"?"Planned":"Growing"}</span></Link>)}</div></details>)}
 {!filtered.length&&<p className="muted">No cycles match these filters.</p>}
 <p className="muted cycle-season-note">Season labels are estimated from sowing dates. Rabi: October–March; Kharif: April–September. Harvest complete remains active until the cycle is closed.</p>
 </section>;
}
