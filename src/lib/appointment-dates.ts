import { eachDayOfInterval, parseISO, startOfDay } from "date-fns";
import type { Appointment } from "@/types/database";

export function appointmentDayRange(appointment: Appointment) {
  const start = startOfDay(parseISO(appointment.starts_at));
  const end = startOfDay(
    parseISO(appointment.ends_at ?? appointment.starts_at)
  );
  return end < start ? { start, end: start } : { start, end };
}

export function appointmentCoversDay(
  appointment: Appointment,
  day: Date
): boolean {
  const { start, end } = appointmentDayRange(appointment);
  const d = startOfDay(day);
  return d >= start && d <= end;
}

export function daysInAppointment(appointment: Appointment): Date[] {
  const { start, end } = appointmentDayRange(appointment);
  return eachDayOfInterval({ start, end });
}

export function dateToStartsAt(date: string): string {
  return `${date}T09:00:00`;
}

export function dateToEndsAt(date: string): string {
  return `${date}T17:00:00`;
}
