import { getActiveFarm } from "@/lib/active-farm";
import AddFarmPanel from "./AddFarmPanel";
import { createFarm, selectFarm } from "./actions";

export default async function FarmsPage(){
  const {farms,farm}=await getActiveFarm();
  return <><header className="page-head page-head-with-action"><div><span className="eyebrow">WORKSPACE</span><h1>Farms</h1><p className="muted">Manage farms and choose which farm you are currently working in.</p></div><AddFarmPanel action={createFarm}/></header>
  <section className="farm-grid">{farms.map(f=><article className={"panel farm-card "+(f.id===farm?.id?"farm-card-active":"")} key={f.id}><div className="section-head"><div><h2>{f.name}</h2><p className="muted">{f.location||"Location not set"}</p></div>{f.id===farm?.id&&<span className="pill">Active</span>}</div><p>{f.total_area?f.total_area+" "+f.area_unit:"Total area not set"}</p>{f.id!==farm?.id&&<form action={selectFarm}><input type="hidden" name="farm_id" value={f.id}/><input type="hidden" name="return_to" value="/farms"/><button>Switch to this farm</button></form>}</article>)}{!farms.length&&<article className="panel"><h2>No farms yet</h2><p className="muted">Add your first farm to start managing fields and crop cycles.</p></article>}</section></>;
}
