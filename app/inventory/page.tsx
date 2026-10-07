import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const nav = ["Dashboard", "Fields", "Crop cycles", "Activities", "Tasks", "Expenses", "Harvests", "Inventory", "Sales", "Reports"];

export default async function InventoryPage() {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: harvests }, { data: sales }] = await Promise.all([
    s.from("harvests").select("quantity,unit,product_name,product_kind,crop_cycle_id,crop_cycles(status,crops(name),fields(name))"),
    s.from("sales").select("quantity,unit,product_name,product_kind,crop_cycle_id"),
  ]);

  const keys = Array.from(new Set((harvests || []).map(h =>
    JSON.stringify([h.crop_cycle_id, h.product_kind, h.product_name, h.unit])
  )));

  const rows = keys.map(key => {
    const [id, productKind, productName, unit] = JSON.parse(key) as [string, string, string, string];
    const hs = (harvests || []).filter(h =>
      h.crop_cycle_id === id && h.product_kind === productKind && h.product_name === productName && h.unit === unit
    );
    const harvested = hs.reduce((n, h) => n + Number(h.quantity), 0);
    const sold = (sales || []).filter(x =>
      x.crop_cycle_id === id && x.product_kind === productKind && x.product_name === productName && x.unit === unit
    ).reduce((n, x) => n + Number(x.quantity), 0);
    const cycle = hs[0]?.crop_cycles;
    return {
      id, productKind, productName, unit, harvested, sold,
      remaining: harvested - sold,
      crop: cycle?.crops?.name || "Crop",
      field: cycle?.fields?.name || "Field",
    };
  }).filter(x => x.remaining > 0);

  return <main className="app-shell">
    <nav className="main-nav">{nav.map(n => <Link className={n === "Inventory" ? "active" : ""} key={n} href={n === "Dashboard" ? "/dashboard" : "/" + n.toLowerCase().replace(" ", "-")}>{n}</Link>)}</nav>
    <header className="page-head"><span className="eyebrow">STOCK</span><h1>Inventory</h1><p className="muted">Primary products and by-products currently available for sale.</p></header>
    <section className="panel"><div className="table inventory-table">
      {rows.map(x => <Link href={"/crop-cycles/" + x.id + "?tab=sales"} className="row row-link" key={[x.id,x.productKind,x.productName,x.unit].join("|")}>
        <strong>{x.productName}</strong>
        <span>{x.productKind === "primary" ? "Primary product" : "By-product"} · {x.crop} · {x.field}</span>
        <span>{x.harvested.toLocaleString()} {x.unit} harvested · {x.sold.toLocaleString()} sold</span>
        <strong>{x.remaining.toLocaleString()} {x.unit} available</strong>
      </Link>)}
      {!rows.length && <p className="muted">No stock is currently available for sale.</p>}
    </div></section>
  </main>;
}
