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

export async function createTask(f: FormData) {
  const s = await auth();
  const cycleId = String(f.get("crop_cycle_id") || "");
  const title = String(f.get("title") || "").trim();
  if (!title) throw new Error("Task title is required.");

  const { data: cycle, error: cycleError } = await s.from("crop_cycles").select("farm_id").eq("id", cycleId).single();
  if (cycleError || !cycle) throw new Error("Select a valid crop cycle.");

  const { error } = await s.from("tasks").insert({
    farm_id: cycle.farm_id,
    crop_cycle_id: cycleId,
    title,
    due_date: String(f.get("due_date") || "") || null,
    priority: String(f.get("priority") || "medium"),
    assigned_to: String(f.get("assigned_to") || "").trim() || null,
    notes: String(f.get("notes") || "").trim() || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
  revalidatePath("/crop-cycles/" + cycleId);
}

export async function updateTaskStatus(f: FormData) {
  const s = await auth();
  const status = String(f.get("status") || "");
  if (!["open","in_progress","done","cancelled"].includes(status)) throw new Error("Invalid task status.");
  const id = String(f.get("task_id") || "");
  const cycleId = String(f.get("crop_cycle_id") || "");

  const { error } = await s.from("tasks").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
  if (cycleId) revalidatePath("/crop-cycles/" + cycleId);
}

export async function deleteTask(f: FormData) {
  const s = await auth();
  const id = String(f.get("task_id") || "");
  const cycleId = String(f.get("crop_cycle_id") || "");
  const { error } = await s.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
  if (cycleId) revalidatePath("/crop-cycles/" + cycleId);
}
