import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const s = await createClient();
  const { data } = await s.from("harvests")
    .select("*, crop_cycles(crops(name), fields(name))")
    .order("harvest_date", { ascending: false });

  return <>
    <h1>Harvests</h1>
    <p className="muted">Production records for primary products and by-products.</p>
    <section className="panel"><div className="history">
      {data?.map(x => <div className="history-item" key={x.id}>
        <div><strong>{x.product_name} · {x.quantity} {x.unit}</strong><span>{x.harvest_date}</span></div>
        <p>{x.product_kind === "primary" ? "Primary product" : "By-product"} · {x.crop_cycles?.crops?.name || "Crop"} · {x.crop_cycles?.fields?.name || "Field"} · {x.grade || "Grade not specified"}</p>
      </div>)}
      {!data?.length && <p className="muted">No harvests yet.</p>}
    </div></section>
  </>;
}