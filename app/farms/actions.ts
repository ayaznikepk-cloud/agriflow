"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createFarm(f: FormData) {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect("/login");
  const name = String(f.get("name") || "").trim();
  if (!name) throw new Error("Farm name is required.");
  const total = String(f.get("total_area") || "").trim();
  const { data: farm, error } = await s.from("farms").insert({
    owner_id: user.id, name,
    location: String(f.get("location") || "").trim() || null,
    total_area: total ? Number(total) : null,
    area_unit: String(f.get("area_unit") || "acre")
  }).select("id").single();
  if (error) throw new Error(error.message);
  const jar = await cookies();
  jar.set("agriflow_farm_id", farm.id, { path: "/", sameSite: "lax", httpOnly: true });
  revalidatePath("/", "layout");
  redirect("/farms");
}

export async function selectFarm(f: FormData) {
  const s = await createClient();
  const id = String(f.get("farm_id") || "");
  const { data } = await s.from("farms").select("id").eq("id", id).maybeSingle();
  if (!data) throw new Error("Farm not found or you do not have access.");
  const jar = await cookies();
  jar.set("agriflow_farm_id", id, { path: "/", sameSite: "lax", httpOnly: true });
  revalidatePath("/", "layout");
  redirect(String(f.get("return_to") || "/dashboard"));
}
