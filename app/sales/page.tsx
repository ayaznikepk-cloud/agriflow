import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const s = await createClient();
  const { data } = await s.from("sales")
    .select("*, buyers(name), crop_cycles(crops(name))")
    .order("sale_date", { ascending: false });
  const revenue = (data || []).reduce((n, x) => n + Number(x.total_amount || 0), 0);

  return <>
    <Nav />
    <h1>Sales</h1>
    <p className="muted">Sales of primary products and by-products.</p>
    <section className="stats">
      <article><strong>PKR {revenue.toLocaleString()}</strong><span>Total revenue</span></article>
      <article><strong>{data?.length || 0}</strong><span>Sales</span></article>
    </section>
    <section className="panel"><div className="history">
      {data?.map(x => <div className="history-item" key={x.id}>
        <div><strong>PKR {Number(x.total_amount || 0).toLocaleString()}</strong><span>{x.sale_date}</span></div>
        <p>{x.product_name} · {x.product_kind === "primary" ? "Primary product" : "By-product"} · {x.quantity} {x.unit} · {x.crop_cycles?.crops?.name || "Crop"} · {x.buyers?.name || "Buyer not specified"} · {x.payment_status}</p>
      </div>)}
      {!data?.length && <p className="muted">No sales yet.</p>}
    </div></section>
  </>;
}