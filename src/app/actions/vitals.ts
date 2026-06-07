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
    tournament_earnings_total: formData.get("tournament_earnings_total")
      ? Number(formData.get("tournament_earnings_total"))
      : null,
    estimated_value: formData.get("estimated_value")
      ? Number(formData.get("estimated_value"))
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
