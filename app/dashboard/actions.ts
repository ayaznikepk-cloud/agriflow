"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/lib/database.types";

async function auth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return { supabase, user };
}

export async function createFarm(f: FormData) {
  const { supabase, user } = await auth();
  const { error } = await supabase.from("farms").insert({
    owner_id: user.id, name: String(f.get("name")), location: String(f.get("location") || "") || null,
    total_area: Number(f.get("total_area")) || null, area_unit: String(f.get("area_unit") || "acre")
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function createField(f: FormData) {
  const { supabase } = await auth();
  const area = Number(f.get("area"));
  if (!(area > 0)) throw new Error("Field area must be greater than zero.");
  const { error } = await supabase.from("fields").insert({
    farm_id: String(f.get("farm_id")), name: String(f.get("name")), area,
    area_unit: String(f.get("area_unit") || "acre"), soil_type: String(f.get("soil_type") || "") || null,
    irrigation_type: String(f.get("irrigation_type") || "") || null
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function createCycle(f: FormData) {
  const { supabase } = await auth();
  const fieldId = String(f.get("field_id"));
  const planted = Number(f.get("planted_area"));
  const unit = String(f.get("area_unit") || "acre");
  const { data: field, error: fieldError } = await supabase.from("fields").select("area,area_unit").eq("id", fieldId).single();
  if (fieldError || !field) throw new Error("Field not found.");
  if (!(planted > 0)) throw new Error("Planted area must be greater than zero.");
  if (field.area_unit === unit && planted > field.area) throw new Error("Planted area cannot exceed the field area.");

  const { data: existing, error: occupiedError } = await supabase.from("crop_cycles").select("id").eq("field_id", fieldId).not("status", "in", "(closed,cancelled)").limit(1);
  if (occupiedError) throw new Error(occupiedError.message);
  if (existing?.length) throw new Error("This field already has an open crop cycle. Close or cancel it before starting another.");

  const cropId = String(f.get("crop_id"));
  const requestedVariety = String(f.get("variety_id") || "");
  let variety: string | null = null;
  if (requestedVariety) {
    const { data: v, error: ve } = await supabase.from("crop_varieties").select("id").eq("id", requestedVariety).eq("crop_id", cropId).maybeSingle();
    if (ve) throw new Error(ve.message);
    if (v) variety = v.id;
  }
  const { error } = await supabase.from("crop_cycles").insert({
    farm_id: String(f.get("farm_id")), field_id: fieldId, crop_id: cropId, variety_id: variety,
    sowing_date: String(f.get("sowing_date")), expected_harvest_date: String(f.get("expected_harvest_date") || "") || null,
    planted_area: planted, area_unit: unit, status: "active"
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function updateCycleStatus(f: FormData) {
  const { supabase } = await auth();
  const id = String(f.get("id"));
  const status = String(f.get("status"));
  const allowed = ["planned", "active", "harvesting", "harvest_complete", "closed", "cancelled"];
  if (!allowed.includes(status)) throw new Error("Invalid status.");

  const update: TablesUpdate<"crop_cycles"> = { status };
  const date = String(f.get("actual_harvest_date") || "");
  if (date) update.actual_harvest_date = date;
  if (status === "harvest_complete" && !date) update.actual_harvest_date = new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from("crop_cycles").update(update).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/crop-cycles/" + id);
}
