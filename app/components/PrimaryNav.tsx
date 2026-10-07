"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const items = [
  ["Dashboard", "/dashboard"], ["Fields", "/fields"], ["Crop cycles", "/crop-cycles"],
  ["Activities", "/activities"], ["Tasks", "/tasks"], ["Expenses", "/expenses"],
  ["Harvests", "/harvests"], ["Inventory", "/inventory"], ["Sales", "/sales"], ["Reports", "/reports"],
] as const;

export default function PrimaryNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const links = items.map(([label, href]) => {
    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
    return <Link className={active ? "active" : ""} key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>;
  });
  return <>
    <nav className="main-nav desktop-nav" aria-label="Farm workspace">{links}</nav>
    <button type="button" className="mobile-menu-button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}><span></span><span></span><span></span></button>
    {open && <div className="mobile-menu-backdrop" onClick={() => setOpen(false)}>
      <aside className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation" onClick={e => e.stopPropagation()}>
        <div className="mobile-menu-head"><strong>Navigate</strong><button type="button" aria-label="Close navigation" onClick={() => setOpen(false)}>×</button></div>
        <nav aria-label="Mobile farm workspace">{links}</nav>
      </aside>
    </div>}
  </>;
}
