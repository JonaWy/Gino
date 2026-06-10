"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/horse";

export async function createVitalRecord(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await supabase.from("vital_records").insert({
    user_id: user.id,
    horse_id: formData.get("horse_id") as string,
    recorded_at: formData.get("recorded_at") as string,
    weight_kg: formData.get("weight_kg")
      ? Number(formData.get("weight_kg"))
      : null,
    height_cm: formData.get("height_cm")
      ? Number(formData.get("height_cm"))
      : null,
    notes: (formData.get("notes") as string) || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/vitalwerte");
  revalidatePath("/");
  return { success: true };
}

export async function deleteVitalRecord(id: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await supabase
    .from("vital_records")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/vitalwerte");
  revalidatePath("/");
  return { success: true };
}

function optionalDocumentId(value: FormDataEntryValue | null) {
  const id = (value as string)?.trim();
  return id || null;
}

export async function createHorseCondition(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name erforderlich" };

  const { error } = await supabase.from("horse_conditions").insert({
    user_id: user.id,
    horse_id: formData.get("horse_id") as string,
    name,
    notes: (formData.get("notes") as string)?.trim() || null,
    report_document_id: optionalDocumentId(
      formData.get("report_document_id")
    ),
    xray_document_id: optionalDocumentId(formData.get("xray_document_id")),
  });

  if (error) return { error: error.message };
  revalidatePath("/vitalwerte");
  return { success: true };
}

export async function updateHorseCondition(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name erforderlich" };

  const { error } = await supabase
    .from("horse_conditions")
    .update({
      name,
      notes: (formData.get("notes") as string)?.trim() || null,
      report_document_id: optionalDocumentId(
        formData.get("report_document_id")
      ),
      xray_document_id: optionalDocumentId(formData.get("xray_document_id")),
    })
    .eq("id", formData.get("id") as string)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/vitalwerte");
  return { success: true };
}

export async function deleteHorseCondition(id: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await supabase
    .from("horse_conditions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/vitalwerte");
  return { success: true };
}
