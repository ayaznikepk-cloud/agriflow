"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const primary = [["Dashboard","/dashboard"],["Farms","/farms"],["Fields","/fields"],["Crop cycles","/crop-cycles"],["Activities","/activities"],["Tasks","/tasks"],["Expenses","/expenses"]] as const;
const more = [["Harvests","/harvests"],["Inventory","/inventory"],["Sales","/sales"],["Reports","/reports"]] as const;
const all=[...primary,...more];

export default function PrimaryNav(){
 const pathname=usePathname();const[open,setOpen]=useState(false);
 useEffect(()=>setOpen(false),[pathname]);
 const link=([label,href]:typeof all[number])=>{const active=pathname===href||(href!=="/dashboard"&&pathname.startsWith(href+"/"));return <Link className={active?"active":""} key={href} href={href} onClick={()=>setOpen(false)}>{label}</Link>};
 const moreActive=more.some(([,href])=>pathname===href||pathname.startsWith(href+"/"));
 return <><nav className="main-nav desktop-nav" aria-label="Farm workspace">{primary.map(link)}<details className={"nav-more "+(moreActive?"active":"")}><summary>More <span aria-hidden="true">▾</span></summary><div className="nav-more-menu">{more.map(link)}</div></details></nav><button type="button" className="mobile-menu-button" aria-label="Open navigation" aria-expanded={open} onClick={()=>setOpen(true)}><span></span><span></span><span></span></button>{open&&<div className="mobile-menu-backdrop" onClick={()=>setOpen(false)}><aside className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation" onClick={e=>e.stopPropagation()}><div className="mobile-menu-head"><strong>Navigate</strong><button type="button" aria-label="Close navigation" onClick={()=>setOpen(false)}>×</button></div><nav aria-label="Mobile farm workspace">{all.map(link)}</nav></aside></div>}</>;
}
