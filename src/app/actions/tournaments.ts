"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/horse";
import { buildTournamentAppointment } from "@/lib/calendar-sync";

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
  const horseId = formData.get("horse_id") as string;
  const name = formData.get("name") as string;
  const date = formData.get("date") as string;
  const location = (formData.get("location") as string) || null;
  const discipline = (formData.get("discipline") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  const { data: tournament, error } = await supabase.from("tournaments").insert({
    user_id: user.id,
    horse_id: horseId,
    name,
    date,
    location,
    discipline,
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
    notes,
  }).select("id").single();

  if (error) return { error: error.message };

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .insert(
      buildTournamentAppointment({
        user_id: user.id,
        horse_id: horseId,
        name,
        date,
        location,
        discipline,
        rider_name: riderName,
        contact_id: contactId,
        notes,
      })
    )
    .select("id")
    .single();

  if (appointmentError) {
    await supabase.from("tournaments").delete().eq("id", tournament.id);
    return { error: appointmentError.message };
  }

  const { error: linkError } = await supabase
    .from("tournaments")
    .update({ appointment_id: appointment.id })
    .eq("id", tournament.id);

  if (linkError) {
    await supabase.from("appointments").delete().eq("id", appointment.id);
    await supabase.from("tournaments").delete().eq("id", tournament.id);
    return { error: linkError.message };
  }

  revalidatePath("/turniere");
  revalidatePath("/kalender");
  revalidatePath("/");
  revalidatePath("/vitalwerte");
  return { success: true };
}

export async function deleteTournament(id: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("appointment_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const { error } = await supabase
    .from("tournaments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  if (tournament?.appointment_id) {
    await supabase
      .from("appointments")
      .delete()
      .eq("id", tournament.appointment_id)
      .eq("user_id", user.id);
  }

  revalidatePath("/turniere");
  revalidatePath("/kalender");
  revalidatePath("/vitalwerte");
  return { success: true };
}
