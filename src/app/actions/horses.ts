"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createHorseForUser, getCurrentUser, getHorse } from "@/lib/horse";

export async function createHorse(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const existing = await getHorse();
  if (existing) return { error: "Du hast bereits ein Pferd angelegt." };

  const name = (formData.get("name") as string)?.trim() || "Gino";
  const breed = (formData.get("breed") as string)?.trim() || null;

  const horse = await createHorseForUser(user.id, name, breed);
  if (!horse) return { error: "Pferd konnte nicht angelegt werden." };

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateHorse(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const id = formData.get("id") as string;
  const { error } = await supabase
    .from("horses")
    .update({
      name: formData.get("name") as string,
      breed: (formData.get("breed") as string) || null,
      birth_date: (formData.get("birth_date") as string) || null,
      gender: (formData.get("gender") as string) || null,
      color: (formData.get("color") as string) || null,
      chip_number: (formData.get("chip_number") as string) || null,
      passport_number: (formData.get("passport_number") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}

export async function uploadHorseImage(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const horseId = formData.get("horse_id") as string;
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "Keine Datei ausgewählt" };

  const ext = file.name.split(".").pop();
  const path = `${user.id}/${horseId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("horse-images")
    .upload(path, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("horse-images").getPublicUrl(path);

  const { error } = await supabase
    .from("horses")
    .update({ image_url: publicUrl })
    .eq("id", horseId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true, url: publicUrl };
}
