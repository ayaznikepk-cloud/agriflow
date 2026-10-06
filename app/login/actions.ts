"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
function credentials(formData: FormData) { return { email: String(formData.get("email") || "").trim(), password: String(formData.get("password") || "") }; }
export async function login(formData: FormData) {
  const supabase = await createClient(); const { error } = await supabase.auth.signInWithPassword(credentials(formData));
  if (error) redirect("/login?error=" + encodeURIComponent(error.message));
  revalidatePath("/", "layout"); redirect("/dashboard");
}
export async function signup(formData: FormData) {
  const supabase = await createClient(); const { error } = await supabase.auth.signUp(credentials(formData));
  if (error) redirect("/login?error=" + encodeURIComponent(error.message));
  redirect("/login?message=" + encodeURIComponent("Account created. Check your email if confirmation is enabled, then sign in."));
}
export async function logout() { const supabase = await createClient(); await supabase.auth.signOut(); revalidatePath("/", "layout"); redirect("/login"); }