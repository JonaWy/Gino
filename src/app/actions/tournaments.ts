"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/horse";

export async function createTournament(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await supabase.from("tournaments").insert({
    user_id: user.id,
    horse_id: formData.get("horse_id") as string,
    name: formData.get("name") as string,
    date: formData.get("date") as string,
    location: (formData.get("location") as string) || null,
    discipline: (formData.get("discipline") as string) || null,
    rating: (formData.get("rating") as string) || null,
    placement: formData.get("placement")
      ? Number(formData.get("placement"))
      : null,
    rider_name: (formData.get("rider_name") as string) || null,
    rider_id: (formData.get("rider_id") as string) || null,
    prize_money: formData.get("prize_money")
      ? Number(formData.get("prize_money"))
      : 0,
    notes: (formData.get("notes") as string) || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/turniere");
  revalidatePath("/");
  revalidatePath("/vitalwerte");
  return { success: true };
}

export async function deleteTournament(id: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await supabase
    .from("tournaments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/turniere");
  revalidatePath("/vitalwerte");
  return { success: true };
}
