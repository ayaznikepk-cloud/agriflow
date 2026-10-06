"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";

async function authenticatedClient(){
  const supabase=await createClient();
  const {data:{user},error}=await supabase.auth.getUser();
  if(error||!user) redirect("/login");
  return {supabase,user};
}
export async function createFarm(formData:FormData){
  const {supabase,user}=await authenticatedClient();
  const {error}=await supabase.from("farms").insert({owner_id:user.id,name:String(formData.get("name")),location:String(formData.get("location")||"")||null,total_area:Number(formData.get("total_area"))||null,area_unit:String(formData.get("area_unit")||"acre")});
  if(error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
export async function createField(formData:FormData){
  const {supabase}=await authenticatedClient();
  const {error}=await supabase.from("fields").insert({farm_id:String(formData.get("farm_id")),name:String(formData.get("name")),area:Number(formData.get("area")),area_unit:String(formData.get("area_unit")||"acre"),soil_type:String(formData.get("soil_type")||"")||null,irrigation_type:String(formData.get("irrigation_type")||"")||null});
  if(error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
export async function createCycle(formData:FormData){
  const {supabase}=await authenticatedClient();
  const {error}=await supabase.from("crop_cycles").insert({farm_id:String(formData.get("farm_id")),field_id:String(formData.get("field_id")),crop_id:String(formData.get("crop_id")),sowing_date:String(formData.get("sowing_date")),expected_harvest_date:String(formData.get("expected_harvest_date")||"")||null,planted_area:Number(formData.get("planted_area")),area_unit:String(formData.get("area_unit")||"acre"),status:"active"});
  if(error) throw new Error(error.message);
  revalidatePath("/dashboard");
}