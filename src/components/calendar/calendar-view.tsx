"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { AppointmentList } from "./appointment-list";
import { AppointmentForm } from "./appointment-form";
import { Card, CardContent } from "@/components/ui/card";
import type { Appointment, Contact } from "@/types/database";
import {
  APPOINTMENT_TYPE_COLORS,
  APPOINTMENT_TYPE_LABELS,
} from "@/lib/labels";
import {
  appointmentCoversDay,
  daysInAppointment,
} from "@/lib/appointment-dates";

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
    (a) => selected && appointmentCoversDay(a, selected)
  );

  const modifiers = appointments.reduce(
    (acc, appointment) => {
      for (const date of daysInAppointment(appointment)) {
        if (!acc[appointment.type]) acc[appointment.type] = [];
        acc[appointment.type].push(date);
      }
      return acc;
    },
    {} as Record<string, Date[]>
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] xl:items-start">
      <Card className="py-0">
        <CardContent className="p-3">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={setSelected}
            locale={de}
            className="w-full p-0 [--cell-size:2.125rem] sm:[--cell-size:2.375rem]"
            classNames={{
              root: "w-full",
              month: "w-full gap-3",
              weekdays: "w-full",
              week: "w-full",
            }}
            modifiers={modifiers}
            modifiersClassNames={Object.fromEntries(
              Object.entries(APPOINTMENT_TYPE_COLORS).map(([k, v]) => [
                k,
                `relative after:absolute after:bottom-0.5 after:left-1/2 after:size-1.5 after:-translate-x-1/2 after:rounded-full ${v}`,
              ])
            )}
          />
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 border-t pt-3 text-[11px] text-muted-foreground sm:grid-cols-3">
            {Object.entries(APPOINTMENT_TYPE_LABELS).map(([type, label]) => (
              <span key={type} className="flex items-center gap-1.5">
                <span
                  className={`size-2 shrink-0 rounded-full ${APPOINTMENT_TYPE_COLORS[type as keyof typeof APPOINTMENT_TYPE_COLORS]}`}
                />
                {label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex min-w-0 flex-col gap-3">
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
