import type {
  AppointmentType,
  HealthRecordType,
} from "@/types/database";
import { HEALTH_RECORD_TYPE_LABELS } from "@/lib/labels";
import { dateToStartsAt } from "@/lib/appointment-dates";

export function healthRecordToAppointmentType(
  type: HealthRecordType
): AppointmentType {
  return type === "impfung" ? "impfung" : "tierarzt";
}

export function healthRecordAppointmentTitle(
  type: HealthRecordType,
  productName: string | null
): string {
  const label = HEALTH_RECORD_TYPE_LABELS[type];
  return productName ? `${label}: ${productName}` : label;
}

export function healthDueDateToStartsAt(date: string): string {
  return dateToStartsAt(date);
}

export function buildHealthDueAppointment(record: {
  user_id: string;
  horse_id: string;
  type: HealthRecordType;
  product_name: string | null;
  next_due_date: string;
  contact_id: string | null;
  vet_name: string | null;
  notes: string | null;
}) {
  const description = [
    record.vet_name ? `Tierarzt: ${record.vet_name}` : null,
    record.notes,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    user_id: record.user_id,
    horse_id: record.horse_id,
    type: healthRecordToAppointmentType(record.type),
    title: healthRecordAppointmentTitle(record.type, record.product_name),
    description: description || null,
    starts_at: healthDueDateToStartsAt(record.next_due_date),
    all_day: true,
    status: "geplant" as const,
    contact_id: record.contact_id,
    reminder_days_before: 7,
  };
}
