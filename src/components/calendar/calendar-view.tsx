"use client";

import { useState } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { AppointmentList } from "./appointment-list";
import { AppointmentForm } from "./appointment-form";
import type { Appointment, Contact } from "@/types/database";
import { APPOINTMENT_TYPE_COLORS } from "@/lib/labels";

export function CalendarView({
  appointments,
  horseId,
  contacts,
}: {
  appointments: Appointment[];
  horseId: string;
  contacts: Contact[];
}) {
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  const dayAppointments = appointments.filter(
    (a) => selected && isSameDay(parseISO(a.starts_at), selected)
  );

  const modifiers = appointments.reduce(
    (acc, a) => {
      const date = parseISO(a.starts_at);
      const key = a.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(date);
      return acc;
    },
    {} as Record<string, Date[]>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          locale={de}
          modifiers={modifiers}
          modifiersClassNames={Object.fromEntries(
            Object.entries(APPOINTMENT_TYPE_COLORS).map(([k, v]) => [
              k,
              `relative after:absolute after:bottom-1 after:left-1/2 after:size-1.5 after:-translate-x-1/2 after:rounded-full ${v}`,
            ])
          )}
        />
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {Object.entries(APPOINTMENT_TYPE_COLORS).map(([type, color]) => (
            <span key={type} className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${color}`} />
              {type}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-medium">
            {selected
              ? format(selected, "EEEE, d. MMMM", { locale: de })
              : "Tag auswählen"}
          </h3>
          <AppointmentForm
            horseId={horseId}
            contacts={contacts}
            defaultDate={selected ? format(selected, "yyyy-MM-dd") : undefined}
          />
        </div>
        <AppointmentList
          appointments={dayAppointments}
          horseId={horseId}
          contacts={contacts}
        />
      </div>
    </div>
  );
}
