"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/horse";
import { buildHealthDueAppointment } from "@/lib/health-calendar";
import {
  buildHealthDateAppointment,
  buildTrainingAppointment,
} from "@/lib/calendar-sync";
import type { HealthRecordType } from "@/types/database";

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

  const horseId = formData.get("horse_id") as string;
  const type = formData.get("type") as HealthRecordType;
  const productName = (formData.get("product_name") as string) || null;
  const nextDueDate = (formData.get("next_due_date") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  const { data: record, error } = await supabase
    .from("health_records")
    .insert({
      user_id: user.id,
      horse_id: horseId,
      type,
      product_name: productName,
      date: formData.get("date") as string,
      next_due_date: nextDueDate,
      contact_id: contactId,
      vet_name: vetName,
      notes,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const healthPayload = {
    user_id: user.id,
    horse_id: horseId,
    type,
    product_name: productName,
    contact_id: contactId,
    vet_name: vetName,
    notes,
  };

  const { data: dateAppointment, error: dateAppointmentError } =
    await supabase
      .from("appointments")
      .insert(
        buildHealthDateAppointment({
          ...healthPayload,
          date: formData.get("date") as string,
        })
      )
      .select("id")
      .single();

  if (dateAppointmentError) {
    await supabase.from("health_records").delete().eq("id", record.id);
    return { error: dateAppointmentError.message };
  }

  const { error: dateLinkError } = await supabase
    .from("health_records")
    .update({ date_appointment_id: dateAppointment.id })
    .eq("id", record.id);

  if (dateLinkError) {
    await supabase.from("appointments").delete().eq("id", dateAppointment.id);
    await supabase.from("health_records").delete().eq("id", record.id);
    return { error: dateLinkError.message };
  }

  if (nextDueDate) {
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert(
        buildHealthDueAppointment({
          user_id: user.id,
          horse_id: horseId,
          type,
          product_name: productName,
          next_due_date: nextDueDate,
          contact_id: contactId,
          vet_name: vetName,
          notes,
        })
      )
      .select("id")
      .single();

    if (appointmentError) {
      await supabase
        .from("appointments")
        .delete()
        .eq("id", dateAppointment.id);
      await supabase.from("health_records").delete().eq("id", record.id);
      return { error: appointmentError.message };
    }

    const { error: linkError } = await supabase
      .from("health_records")
      .update({ appointment_id: appointment.id })
      .eq("id", record.id);

    if (linkError) {
      await supabase.from("appointments").delete().eq("id", appointment.id);
      await supabase
        .from("appointments")
        .delete()
        .eq("id", dateAppointment.id);
      await supabase.from("health_records").delete().eq("id", record.id);
      return { error: linkError.message };
    }
  }

  revalidatePath("/vitalwerte");
  revalidatePath("/gesundheit");
  revalidatePath("/kalender");
  revalidatePath("/");
  return { success: true };
}

export async function deleteHealthRecord(id: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { data: record } = await supabase
    .from("health_records")
    .select("appointment_id, date_appointment_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const { error } = await supabase
    .from("health_records")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  const appointmentIds = [
    record?.appointment_id,
    record?.date_appointment_id,
  ].filter(Boolean) as string[];

  if (appointmentIds.length > 0) {
    await supabase
      .from("appointments")
      .delete()
      .in("id", appointmentIds)
      .eq("user_id", user.id);
  }

  revalidatePath("/vitalwerte");
  revalidatePath("/gesundheit");
  revalidatePath("/kalender");
  return { success: true };
}

export async function createTrainingLog(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const riderContactId =
    (formData.get("rider_contact_id") as string) || null;
  const riderName = await getContactName(riderContactId);

  const startDate = formData.get("date") as string;
  const endDate = trimOrNull(formData.get("end_date"));

  const trainerContactId =
    (formData.get("trainer_contact_id") as string) || null;
  const focus = trimOrNull(formData.get("focus"));
  const notes = (formData.get("notes") as string) || null;

  if (endDate && endDate < startDate) {
    return { error: "Enddatum darf nicht vor dem Startdatum liegen." };
  }

  const { data: log, error } = await supabase
    .from("training_logs")
    .insert({
      user_id: user.id,
      horse_id: formData.get("horse_id") as string,
      date: startDate,
      end_date: endDate,
      focus,
      notes,
      rider_contact_id: riderContactId,
      trainer_contact_id: trainerContactId,
      rider_name: riderName,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .insert(
      buildTrainingAppointment({
        user_id: user.id,
        horse_id: formData.get("horse_id") as string,
        date: startDate,
        end_date: endDate,
        focus,
        notes,
        rider_name: riderName,
        trainer_contact_id: trainerContactId,
        rider_contact_id: riderContactId,
      })
    )
    .select("id")
    .single();

  if (appointmentError) {
    await supabase.from("training_logs").delete().eq("id", log.id);
    return { error: appointmentError.message };
  }

  const { error: linkError } = await supabase
    .from("training_logs")
    .update({ appointment_id: appointment.id })
    .eq("id", log.id);

  if (linkError) {
    await supabase.from("appointments").delete().eq("id", appointment.id);
    await supabase.from("training_logs").delete().eq("id", log.id);
    return { error: linkError.message };
  }

  revalidatePath("/training");
  revalidatePath("/kalender");
  return { success: true };
}

export async function deleteTrainingLog(id: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { data: log } = await supabase
    .from("training_logs")
    .select("appointment_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const { error } = await supabase
    .from("training_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  if (log?.appointment_id) {
    await supabase
      .from("appointments")
      .delete()
      .eq("id", log.appointment_id)
      .eq("user_id", user.id);
  }

  revalidatePath("/training");
  revalidatePath("/kalender");
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
  revalidatePath("/vitalwerte");
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
  revalidatePath("/vitalwerte");
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
  revalidatePath("/vitalwerte");
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
  revalidatePath("/vitalwerte");
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
  revalidatePath("/vitalwerte");
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
