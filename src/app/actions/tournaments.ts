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

export async function createTournament(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const contactId = (formData.get("contact_id") as string) || null;
  const riderName = await getContactName(contactId);

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
    contact_id: contactId,
    rider_id: contactId,
    rider_name: riderName,
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
