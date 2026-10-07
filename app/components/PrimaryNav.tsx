"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["Dashboard", "/dashboard"],
  ["Fields", "/fields"],
  ["Crop cycles", "/crop-cycles"],
  ["Activities", "/activities"],
  ["Tasks", "/tasks"],
  ["Expenses", "/expenses"],
  ["Harvests", "/harvests"],
  ["Inventory", "/inventory"],
  ["Sales", "/sales"],
  ["Reports", "/reports"],
] as const;

export default function PrimaryNav() {
  const pathname = usePathname();
  return <nav className="main-nav" aria-label="Farm workspace">
    {items.map(([label, href]) => {
      const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
      return <Link className={active ? "active" : ""} key={href} href={href}>{label}</Link>;
    })}
  </nav>;
}
