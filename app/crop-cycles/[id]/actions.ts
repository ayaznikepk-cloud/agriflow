"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function auth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return supabase;
}

export async function addActivity(f: FormData) {
  const s = await auth();
  const id = String(f.get("crop_cycle_id"));
  const farm = String(f.get("farm_id"));
  const q = String(f.get("quantity") || "");
  const { error } = await s.from("activities").insert({
    farm_id: farm,
    crop_cycle_id: id,
    activity_type: String(f.get("activity_type")),
    activity_date: String(f.get("activity_date")),
    description: String(f.get("description") || "") || null,
    quantity: q ? Number(q) : null,
    unit: String(f.get("unit") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/crop-cycles/" + id);
}

export async function addTask(f: FormData) {
  const s = await auth();
  const id = String(f.get("crop_cycle_id"));
  const { error } = await s.from("tasks").insert({
    farm_id: String(f.get("farm_id")),
    crop_cycle_id: id,
    title: String(f.get("title")),
    due_date: String(f.get("due_date") || "") || null,
    priority: String(f.get("priority") || "medium"),
    assigned_to: String(f.get("assigned_to") || "") || null,
    notes: String(f.get("notes") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/crop-cycles/" + id);
}

export async function updateTask(f: FormData) {
  const s = await auth();
  const id = String(f.get("crop_cycle_id"));
  const status = String(f.get("status"));
  if (!["open", "in_progress", "done", "cancelled"].includes(status)) throw new Error("Invalid task status.");
  const { error } = await s.from("tasks").update({ status }).eq("id", String(f.get("task_id")));
  if (error) throw new Error(error.message);
  revalidatePath("/crop-cycles/" + id);
}

export async function addExpense(f: FormData) {
  const s = await auth();
  const id = String(f.get("crop_cycle_id"));
  const amount = Number(f.get("amount"));
  if (!(amount > 0)) throw new Error("Expense amount must be greater than zero.");
  const { error } = await s.from("expenses").insert({
    farm_id: String(f.get("farm_id")),
    crop_cycle_id: id,
    expense_date: String(f.get("expense_date")),
    category: String(f.get("category")),
    amount,
    description: String(f.get("description") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/crop-cycles/" + id);
}

export async function addHarvest(f: FormData) {
  const s = await auth();
  const id = String(f.get("crop_cycle_id"));
  const quantity = Number(f.get("quantity"));
  const productKind = String(f.get("product_kind") || "primary");
  const productName = String(f.get("product_name") || "").trim();

  if (!(quantity > 0)) throw new Error("Harvest quantity must be greater than zero.");
  if (!["primary", "by_product"].includes(productKind)) throw new Error("Invalid product type.");
  if (!productName) throw new Error("Product name is required.");

  const { data: cycle } = await s.from("crop_cycles").select("status").eq("id", id).single();
  if (!cycle || ["harvest_complete", "closed", "cancelled"].includes(cycle.status)) {
    redirect("/crop-cycles/" + id + "?tab=harvest&error=" + encodeURIComponent("Harvesting is locked for this crop cycle."));
  }

  const { error } = await s.from("harvests").insert({
    farm_id: String(f.get("farm_id")),
    crop_cycle_id: id,
    harvest_date: String(f.get("harvest_date")),
    quantity,
    unit: String(f.get("unit")),
    product_name: productName,
    product_kind: productKind,
    grade: String(f.get("grade") || "") || null,
    notes: String(f.get("notes") || "") || null,
  });
  if (error) throw new Error(error.message);

  if (cycle.status !== "harvesting") {
    const { error: statusError } = await s.from("crop_cycles").update({ status: "harvesting" }).eq("id", id);
    if (statusError) throw new Error(statusError.message);
  }

  revalidatePath("/crop-cycles/" + id);
  revalidatePath("/inventory");
  revalidatePath("/harvests");
}

export async function completeHarvesting(f: FormData) {
  const s = await auth();
  const id = String(f.get("crop_cycle_id"));
  const { data: h } = await s.from("harvests").select("id").eq("crop_cycle_id", id).limit(1);
  if (!h?.length) {
    redirect("/crop-cycles/" + id + "?tab=harvest&error=" + encodeURIComponent("Record at least one harvest before completing harvesting."));
  }
  const { error } = await s.from("crop_cycles").update({
    status: "harvest_complete",
    actual_harvest_date: String(f.get("actual_harvest_date") || "") || new Date().toISOString().slice(0, 10),
  }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/crop-cycles/" + id);
  revalidatePath("/inventory");
}

export async function reopenHarvesting(f: FormData) {
  const s = await auth();
  const id = String(f.get("crop_cycle_id"));
  const { error } = await s.from("crop_cycles").update({ status: "harvesting" }).eq("id", id).eq("status", "harvest_complete");
  if (error) throw new Error(error.message);
  revalidatePath("/crop-cycles/" + id);
}

export async function addBuyer(f: FormData) {
  const s = await auth();
  const id = String(f.get("crop_cycle_id"));
  const { error } = await s.from("buyers").insert({
    farm_id: String(f.get("farm_id")),
    name: String(f.get("name")),
    phone: String(f.get("phone") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/crop-cycles/" + id);
}

export async function addSale(f: FormData) {
  const s = await auth();
  const id = String(f.get("crop_cycle_id"));
  const farm = String(f.get("farm_id"));
  const quantity = Number(f.get("quantity"));
  const rate = Number(f.get("rate_per_unit"));

  if (!(quantity > 0) || rate < 0) throw new Error("Enter a valid sale quantity and rate.");

  let productKind = "";
  let productName = "";
  let unit = "";
  try {
    const parsed = JSON.parse(String(f.get("stock_item") || "[]"));
    [productKind, productName, unit] = parsed;
  } catch {
    throw new Error("Select a valid inventory item.");
  }
  if (!["primary", "by_product"].includes(productKind) || !productName || !unit) throw new Error("Select a valid inventory item.");

  const [{ data: harvests, error: he }, { data: sales, error: se }] = await Promise.all([
    s.from("harvests").select("quantity").eq("crop_cycle_id", id).eq("product_kind", productKind).eq("product_name", productName).eq("unit", unit),
    s.from("sales").select("quantity").eq("crop_cycle_id", id).eq("product_kind", productKind).eq("product_name", productName).eq("unit", unit),
  ]);
  if (he) throw new Error(he.message);
  if (se) throw new Error(se.message);

  const harvested = (harvests || []).reduce((n, h) => n + Number(h.quantity), 0);
  const sold = (sales || []).reduce((n, x) => n + Number(x.quantity), 0);
  const remaining = harvested - sold;

  if (quantity > remaining) {
    redirect("/crop-cycles/" + id + "?tab=sales&error=" + encodeURIComponent(
      "Cannot record sale: only " + Math.max(0, remaining).toLocaleString() + " " + unit + " of " + productName + " remains available."
    ));
  }

  const buyer = String(f.get("buyer_id") || "") || null;
  const { error } = await s.from("sales").insert({
    farm_id: farm,
    crop_cycle_id: id,
    buyer_id: buyer,
    sale_date: String(f.get("sale_date")),
    quantity,
    unit,
    product_name: productName,
    product_kind: productKind,
    rate_per_unit: rate,
    payment_status: String(f.get("payment_status") || "unpaid"),
    notes: String(f.get("notes") || "") || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/crop-cycles/" + id);
  revalidatePath("/inventory");
  revalidatePath("/sales");
}
