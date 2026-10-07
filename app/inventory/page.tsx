import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";

const nav=["Dashboard","Fields","Crop cycles","Activities","Tasks","Expenses","Harvests","Inventory","Sales","Reports"];

export default async function InventoryPage(){
  const s=await createClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)redirect("/login");
  const [{data:harvests},{data:sales}]=await Promise.all([
    s.from("harvests").select("quantity,unit,crop_cycle_id,crop_cycles(status,crops(name),fields(name))"),
    s.from("sales").select("quantity,unit,crop_cycle_id")
  ]);
  const keys=Array.from(new Set((harvests||[]).map(h=>h.crop_cycle_id+"|"+h.unit)));
  const rows=keys.map(key=>{
    const [id,unit]=key.split("|");
    const hs=(harvests||[]).filter(h=>h.crop_cycle_id===id&&h.unit===unit);
    const harvested=hs.reduce((n,h)=>n+Number(h.quantity),0);
    const sold=(sales||[]).filter(x=>x.crop_cycle_id===id&&x.unit===unit).reduce((n,x)=>n+Number(x.quantity),0);
    const cycle=hs[0]?.crop_cycles;
    return {id,unit,harvested,sold,remaining:harvested-sold,crop:cycle?.crops?.name||"Crop",field:cycle?.fields?.name||"Field"};
  }).filter(x=>x.remaining>0);
  return <main className="app-shell">
    <nav className="main-nav">{nav.map(n=><Link className={n==="Inventory"?"active":""} key={n} href={n==="Dashboard"?"/dashboard":"/"+n.toLowerCase().replace(" ","-")}>{n}</Link>)}</nav>
    <header className="page-head"><span className="eyebrow">STOCK</span><h1>Inventory</h1><p className="muted">Harvested produce currently available for sale.</p></header>
    <section className="panel"><div className="table inventory-table">
      {rows.map(x=><Link href={"/crop-cycles/"+x.id+"?tab=sales"} className="row row-link" key={x.id+x.unit}><strong>{x.crop}</strong><span>{x.field}</span><span>{x.harvested.toLocaleString()} {x.unit} harvested</span><span>{x.sold.toLocaleString()} {x.unit} sold</span><strong>{x.remaining.toLocaleString()} {x.unit} available</strong></Link>)}
      {!rows.length&&<p className="muted">No stock is currently available for sale.</p>}
    </div></section>
  </main>;
}
