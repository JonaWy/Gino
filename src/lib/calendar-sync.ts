import type { AppointmentStatus, HealthRecordType } from "@/types/database";
import { HEALTH_RECORD_TYPE_LABELS } from "@/lib/labels";
import { dateToEndsAt, dateToStartsAt } from "@/lib/appointment-dates";
import { healthRecordToAppointmentType } from "@/lib/health-calendar";

function statusForDate(date: string): AppointmentStatus {
  const today = new Date().toISOString().slice(0, 10);
  return date < today ? "erledigt" : "geplant";
}

function healthDescription(
  vetName: string | null,
  notes: string | null
): string | null {
  return (
    [vetName ? `Tierarzt: ${vetName}` : null, notes]
      .filter(Boolean)
      .join("\n") || null
  );
}

export function buildHealthDateAppointment(record: {
  user_id: string;
  horse_id: string;
  type: HealthRecordType;
  product_name: string | null;
  date: string;
  contact_id: string | null;
  vet_name: string | null;
  notes: string | null;
}) {
  const label = HEALTH_RECORD_TYPE_LABELS[record.type];
  const status = statusForDate(record.date);
  const done = status === "erledigt";
  const base = record.product_name ? `${label}: ${record.product_name}` : label;
  const title = done ? `${base} (durchgeführt)` : base;

  return {
    user_id: record.user_id,
    horse_id: record.horse_id,
    type: healthRecordToAppointmentType(record.type),
    title,
    description: healthDescription(record.vet_name, record.notes),
    starts_at: dateToStartsAt(record.date),
    ends_at: null,
    all_day: true,
    status,
    contact_id: record.contact_id,
    reminder_days_before: done ? null : 3,
  };
}

export function buildTrainingAppointment(record: {
  user_id: string;
  horse_id: string;
  date: string;
  end_date: string | null;
  focus: string | null;
  notes: string | null;
  rider_name: string | null;
  trainer_contact_id: string | null;
  rider_contact_id: string | null;
}) {
  const endDate = record.end_date ?? record.date;
  const title = record.focus ? `Training: ${record.focus}` : "Training";
  const description =
    [
      record.rider_name ? `Reiter: ${record.rider_name}` : null,
      record.notes,
    ]
      .filter(Boolean)
      .join("\n") || null;

  return {
    user_id: record.user_id,
    horse_id: record.horse_id,
    type: "training" as const,
    title,
    description,
    starts_at: dateToStartsAt(record.date),
    ends_at:
      endDate !== record.date ? dateToEndsAt(endDate) : null,
    all_day: true,
    status: statusForDate(endDate),
    contact_id: record.trainer_contact_id ?? record.rider_contact_id,
    reminder_days_before: null,
  };
}

export function buildTournamentAppointment(record: {
  user_id: string;
  horse_id: string;
  name: string;
  date: string;
  location: string | null;
  discipline: string | null;
  rider_name: string | null;
  contact_id: string | null;
  notes: string | null;
}) {
  const description =
    [
      record.discipline ? `Disziplin: ${record.discipline}` : null,
      record.rider_name ? `Reiter: ${record.rider_name}` : null,
      record.notes,
    ]
      .filter(Boolean)
      .join("\n") || null;

  return {
    user_id: record.user_id,
    horse_id: record.horse_id,
    type: "turnier" as const,
    title: record.name,
    description,
    location: record.location,
    starts_at: dateToStartsAt(record.date),
    ends_at: null,
    all_day: true,
    status: statusForDate(record.date),
    contact_id: record.contact_id,
    reminder_days_before: null,
  };
}
