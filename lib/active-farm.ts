import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function getActiveFarm() {
  const s = await createClient();
  const { data: farms } = await s.from("farms").select("id,name,location,total_area,area_unit").order("created_at");
  const jar = await cookies();
  const requested = jar.get("agriflow_farm_id")?.value;
  const farm = (farms || []).find(f => f.id === requested) || farms?.[0] || null;
  return { s, farms: farms || [], farm };
}
