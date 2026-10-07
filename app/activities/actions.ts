"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function auth() {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect("/login");
  return s;
}

export async function createActivity(f: FormData) {
  const s = await auth();
  const cycleId = String(f.get("crop_cycle_id") || "");
  const { data: cycle, error: cycleError } = await s.from("crop_cycles").select("farm_id").eq("id", cycleId).single();
  if (cycleError || !cycle) throw new Error("Select a valid crop cycle.");

  const quantityRaw = String(f.get("quantity") || "");
  const quantity = quantityRaw ? Number(quantityRaw) : null;
  if (quantity !== null && !(quantity >= 0)) throw new Error("Quantity must be zero or greater.");

  const { error } = await s.from("activities").insert({
    farm_id: cycle.farm_id,
    crop_cycle_id: cycleId,
    activity_type: String(f.get("activity_type") || "other"),
    activity_date: String(f.get("activity_date") || ""),
    description: String(f.get("description") || "").trim() || null,
    quantity,
    unit: String(f.get("unit") || "").trim() || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/activities");
  revalidatePath("/crop-cycles/" + cycleId);
}

export async function deleteActivity(f: FormData) {
  const s = await auth();
  const id = String(f.get("activity_id") || "");
  const cycleId = String(f.get("crop_cycle_id") || "");
  const { error } = await s.from("activities").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/activities");
  if (cycleId) revalidatePath("/crop-cycles/" + cycleId);
}
