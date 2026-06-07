"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/horse";

async function getContactName(contactId: string | null) {
  if (!contactId) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select("name")
    .eq("id", contactId)
    .single();
  return data?.name ?? null;
}

function trimOrNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function contactFieldsFromForm(formData: FormData) {
  const role = formData.get("role") as string;
  const fields: Record<string, string | null> = {
    role,
    name: (formData.get("name") as string).trim(),
    phone: trimOrNull(formData.get("phone")),
    email: role === "reiter" ? null : trimOrNull(formData.get("email")),
    notes: trimOrNull(formData.get("notes")),
  };

  if (role === "reiter") {
    const license = trimOrNull(formData.get("license_number"));
    if (license) fields.license_number = license;
  }

  return fields;
}

export async function createHealthRecord(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const contactId = (formData.get("contact_id") as string) || null;
  const vetName =
    (await getContactName(contactId)) ||
    (formData.get("vet_name") as string) ||
    null;

  const { error } = await supabase.from("health_records").insert({
    user_id: user.id,
    horse_id: formData.get("horse_id") as string,
    type: formData.get("type") as string,
    product_name: (formData.get("product_name") as string) || null,
    date: formData.get("date") as string,
    next_due_date: (formData.get("next_due_date") as string) || null,
    contact_id: contactId,
    vet_name: vetName,
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

  const riderContactId =
    (formData.get("rider_contact_id") as string) || null;
  const riderName = await getContactName(riderContactId);

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
    rider_contact_id: riderContactId,
    trainer_contact_id:
      (formData.get("trainer_contact_id") as string) || null,
    rider_name: riderName,
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

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      user_id: user.id,
      horse_id: formData.get("horse_id") as string,
      ...contactFieldsFromForm(formData),
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/kontakte", "page");
  revalidatePath("/turniere");
  revalidatePath("/training");
  revalidatePath("/gesundheit");
  revalidatePath("/kalender");
  return { success: true, contact: data };
}

export async function updateContact(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const id = formData.get("id") as string;
  const { data, error } = await supabase
    .from("contacts")
    .update(contactFieldsFromForm(formData))
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/kontakte", "page");
  revalidatePath("/turniere");
  revalidatePath("/training");
  revalidatePath("/gesundheit");
  revalidatePath("/kalender");
  return { success: true, contact: data };
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
  revalidatePath("/kontakte", "page");
  revalidatePath("/turniere");
  revalidatePath("/training");
  revalidatePath("/gesundheit");
  revalidatePath("/kalender");
  return { success: true };
}

export async function createRider(formData: FormData) {
  formData.set("role", "reiter");
  return createContact(formData);
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
