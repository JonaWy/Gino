"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/horse";
import { APPOINTMENT_TO_EXPENSE } from "@/lib/labels";
import type { AppointmentType } from "@/types/database";

async function getSuggestedCost(
  horseId: string,
  type: AppointmentType
): Promise<number | null> {
  const category = APPOINTMENT_TO_EXPENSE[type];
  if (!category) return null;

  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount")
    .eq("horse_id", horseId)
    .eq("category", category)
    .eq("is_estimated", false)
    .gte("date", twelveMonthsAgo.toISOString().split("T")[0]);

  if (expenses && expenses.length > 0) {
    const avg =
      expenses.reduce((s, e) => s + Number(e.amount), 0) / expenses.length;
    return Math.round(avg * 100) / 100;
  }

  const { data: defaults } = await supabase
    .from("cost_defaults")
    .select("default_amount")
    .eq("horse_id", horseId)
    .eq("category", category)
    .single();

  return defaults ? Number(defaults.default_amount) : null;
}

export async function createAppointment(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const horseId = formData.get("horse_id") as string;
  const type = formData.get("type") as AppointmentType;
  let estimatedCost = formData.get("estimated_cost")
    ? Number(formData.get("estimated_cost"))
    : null;

  if (!estimatedCost && APPOINTMENT_TO_EXPENSE[type]) {
    estimatedCost = await getSuggestedCost(horseId, type);
  }

  const { error } = await supabase.from("appointments").insert({
    user_id: user.id,
    horse_id: horseId,
    type,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    location: (formData.get("location") as string) || null,
    starts_at: formData.get("starts_at") as string,
    ends_at: (formData.get("ends_at") as string) || null,
    all_day: formData.get("all_day") === "true",
    estimated_cost: estimatedCost,
    reminder_days_before: formData.get("reminder_days_before")
      ? Number(formData.get("reminder_days_before"))
      : null,
  });

  if (error) return { error: error.message };
  revalidatePath("/kalender");
  revalidatePath("/");
  revalidatePath("/kosten");
  return { success: true };
}

export async function updateAppointment(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const id = formData.get("id") as string;
  const { error } = await supabase
    .from("appointments")
    .update({
      type: formData.get("type") as AppointmentType,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      location: (formData.get("location") as string) || null,
      starts_at: formData.get("starts_at") as string,
      ends_at: (formData.get("ends_at") as string) || null,
      all_day: formData.get("all_day") === "true",
      estimated_cost: formData.get("estimated_cost")
        ? Number(formData.get("estimated_cost"))
        : null,
      reminder_days_before: formData.get("reminder_days_before")
        ? Number(formData.get("reminder_days_before"))
        : null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/kalender");
  revalidatePath("/");
  revalidatePath("/kosten");
  return { success: true };
}

export async function completeAppointment(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const id = formData.get("id") as string;
  const actualCost = Number(formData.get("actual_cost"));

  const { data: appointment } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .single();

  if (!appointment) return { error: "Termin nicht gefunden" };

  const { error } = await supabase
    .from("appointments")
    .update({ status: "erledigt", actual_cost: actualCost })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  const category = APPOINTMENT_TO_EXPENSE[appointment.type as AppointmentType];
  if (category && actualCost > 0) {
    await supabase.from("expenses").insert({
      user_id: user.id,
      horse_id: appointment.horse_id,
      category,
      amount: actualCost,
      date: appointment.starts_at.split("T")[0],
      description: appointment.title,
      appointment_id: id,
      is_estimated: false,
    });
  }

  revalidatePath("/kalender");
  revalidatePath("/");
  revalidatePath("/kosten");
  return { success: true };
}

export async function deleteAppointment(id: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/kalender");
  revalidatePath("/");
  revalidatePath("/kosten");
  return { success: true };
}
