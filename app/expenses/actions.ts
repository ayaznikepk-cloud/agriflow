"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const categories = ["labor","seed","fertilizer","pesticide","machinery","irrigation","fuel","transport","other"];

async function auth() {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect("/login");
  return s;
}

function values(f: FormData) {
  const amount = Number(f.get("amount"));
  const category = String(f.get("category") || "");
  const expenseDate = String(f.get("expense_date") || "");
  if (!(amount > 0)) throw new Error("Expense amount must be greater than zero.");
  if (!categories.includes(category)) throw new Error("Select a valid expense category.");
  if (!expenseDate) throw new Error("Expense date is required.");
  return { amount, category, expenseDate };
}

export async function createExpense(f: FormData) {
  const s = await auth();
  const cycleId = String(f.get("crop_cycle_id") || "");
  const { amount, category, expenseDate } = values(f);
  const { data: cycle, error: cycleError } = await s.from("crop_cycles").select("farm_id").eq("id", cycleId).single();
  if (cycleError || !cycle) throw new Error("Select a valid crop cycle.");

  const { error } = await s.from("expenses").insert({
    farm_id: cycle.farm_id, crop_cycle_id: cycleId, expense_date: expenseDate,
    category, amount, description: String(f.get("description") || "").trim() || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
  revalidatePath("/crop-cycles/" + cycleId);
}

export async function updateExpense(f: FormData) {
  const s = await auth();
  const id = String(f.get("expense_id") || "");
  const cycleId = String(f.get("crop_cycle_id") || "");
  const { amount, category, expenseDate } = values(f);
  const { error } = await s.from("expenses").update({
    expense_date: expenseDate, category, amount,
    description: String(f.get("description") || "").trim() || null,
  }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
  if (cycleId) revalidatePath("/crop-cycles/" + cycleId);
}

export async function deleteExpense(f: FormData) {
  const s = await auth();
  const id = String(f.get("expense_id") || "");
  const cycleId = String(f.get("crop_cycle_id") || "");
  const { error } = await s.from("expenses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/expenses");
  if (cycleId) revalidatePath("/crop-cycles/" + cycleId);
}
