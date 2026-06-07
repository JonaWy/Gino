"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/horse";

export async function createHealthRecord(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await supabase.from("health_records").insert({
    user_id: user.id,
    horse_id: formData.get("horse_id") as string,
    type: formData.get("type") as string,
    product_name: (formData.get("product_name") as string) || null,
    date: formData.get("date") as string,
    next_due_date: (formData.get("next_due_date") as string) || null,
    vet_name: (formData.get("vet_name") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/gesundheit");
  revalidatePath("/");
  return { success: true };
}

export async function deleteHealthRecord(id: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await supabase
    .from("health_records")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/gesundheit");
  return { success: true };
}

export async function createTrainingLog(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await supabase.from("training_logs").insert({
    user_id: user.id,
    horse_id: formData.get("horse_id") as string,
    date: formData.get("date") as string,
    duration_minutes: formData.get("duration_minutes")
      ? Number(formData.get("duration_minutes"))
      : null,
    focus: (formData.get("focus") as string) || null,
    intensity: (formData.get("intensity") as string) || null,
    notes: (formData.get("notes") as string) || null,
    rider_name: (formData.get("rider_name") as string) || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/training");
  return { success: true };
}

export async function deleteTrainingLog(id: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await supabase
    .from("training_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/training");
  return { success: true };
}

export async function createContact(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await supabase.from("contacts").insert({
    user_id: user.id,
    horse_id: formData.get("horse_id") as string,
    role: formData.get("role") as string,
    name: formData.get("name") as string,
    phone: (formData.get("phone") as string) || null,
    email: (formData.get("email") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/kontakte");
  return { success: true };
}

export async function deleteContact(id: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/kontakte");
  return { success: true };
}

export async function createDocument(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const horseId = formData.get("horse_id") as string;
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "Keine Datei ausgewählt" };

  const path = `${user.id}/${horseId}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(path, file);

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage
    .from("documents")
    .getPublicUrl(path);

  const { error } = await supabase.from("documents").insert({
    user_id: user.id,
    horse_id: horseId,
    type: formData.get("type") as string,
    title: formData.get("title") as string,
    file_url: urlData.publicUrl,
    expires_at: (formData.get("expires_at") as string) || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/dokumente");
  revalidatePath("/");
  return { success: true };
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dokumente");
  return { success: true };
}

export async function createRider(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await supabase.from("riders").insert({
    user_id: user.id,
    horse_id: formData.get("horse_id") as string,
    name: formData.get("name") as string,
    license_number: (formData.get("license_number") as string) || null,
    phone: (formData.get("phone") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/turniere");
  revalidatePath("/einstellungen");
  return { success: true };
}

export async function updateCostDefault(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await supabase.from("cost_defaults").upsert({
    user_id: user.id,
    horse_id: formData.get("horse_id") as string,
    category: formData.get("category") as string,
    default_amount: Number(formData.get("default_amount")),
  });

  if (error) return { error: error.message };
  revalidatePath("/kosten");
  revalidatePath("/einstellungen");
  return { success: true };
}
