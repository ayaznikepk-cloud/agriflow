import { getActiveFarm } from "@/lib/active-farm";
import { createCycle } from "@/app/dashboard/actions";
import CycleForm from "./CycleForm";
import CycleList from "./CycleList";

export default async function Cycles() {
  const { s, farm } = await getActiveFarm();
  const [{ data: fields }, { data: crops }, { data: varieties }, { data: cycles }] = await Promise.all([
    farm ? s.from("fields").select("*").eq("farm_id", farm.id).order("name") : Promise.resolve({ data: [] }),
    s.from("crops").select("*").order("name"),
    s.from("crop_varieties").select("*, crops(name)").order("name"),
    farm ? s.from("crop_cycles").select("*, crops(name), crop_varieties(name), fields(name)").eq("farm_id", farm.id).order("created_at", { ascending: false }) : Promise.resolve({ data: [] })
  ]);
  const occupied = new Set((cycles || []).filter(c => !["closed", "cancelled"].includes(c.status)).map(c => c.field_id));
  return <>
    <header className="page-head page-head-with-action">
      <div><span className="eyebrow">PRODUCTION</span><h1>Crop cycles</h1><p className="muted">Plan and track crops for {farm?.name || "the active farm"}.</p></div>
      {farm && !!fields?.length && <CycleForm farmId={farm.id} fields={(fields || []).map(f => ({ id: f.id, name: f.name, occupied: occupied.has(f.id) }))} crops={(crops || []).map(x => ({ id: x.id, name: x.name }))} varieties={(varieties || []).map(v => ({ id: v.id, name: v.name, crop_id: v.crop_id }))} action={createCycle} />}
    </header>
    <CycleList cycles={(cycles || []).map(c => ({ id: c.id, crop: c.crops?.name || "Crop", variety: c.crop_varieties?.name || "", field: c.fields?.name || "Field", sowingDate: c.sowing_date, status: c.status }))} />
  </>;
}
