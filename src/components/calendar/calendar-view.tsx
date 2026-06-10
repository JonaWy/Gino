"use client";

import { useMemo, useState } from "react";
import { format, parseISO, startOfDay } from "date-fns";
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
  appointmentDayRange,
  daysInAppointment,
} from "@/lib/appointment-dates";

const APPOINTMENT_DOT_CLASS: Record<string, string> = {
  impfung: "after:bg-emerald-500",
  tierarzt: "after:bg-red-500",
  schmied: "after:bg-amber-700",
  turnier: "after:bg-yellow-500",
  training: "after:bg-blue-500",
  physiotherapie: "after:bg-violet-500",
  sonstiges: "after:bg-gray-400",
};

function formatAppointmentWhen(appt: Appointment) {
  if (appt.all_day) {
    const { start, end } = appointmentDayRange(appt);
    if (start.getTime() !== end.getTime()) {
      return `${format(start, "d. MMM", { locale: de })} – ${format(end, "d. MMM", { locale: de })}`;
    }
    return format(start, "EEE, d. MMM", { locale: de });
  }
  return format(parseISO(appt.starts_at), "EEE, d. MMM · HH:mm 'Uhr'", {
    locale: de,
  });
}

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

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date());
    return appointments
      .filter((a) => appointmentDayRange(a).end >= today)
      .sort(
        (a, b) =>
          parseISO(a.starts_at).getTime() - parseISO(b.starts_at).getTime()
      );
  }, [appointments]);

  const modifiers = useMemo(
    () =>
      appointments.reduce(
        (acc, appointment) => {
          for (const date of daysInAppointment(appointment)) {
            if (!acc[appointment.type]) acc[appointment.type] = [];
            acc[appointment.type].push(date);
          }
          return acc;
        },
        {} as Record<string, Date[]>
      ),
    [appointments]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,38rem)_minmax(0,1fr)] xl:items-start">
      <Card className="py-0">
        <CardContent className="p-3 sm:p-5">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={setSelected}
            locale={de}
            className="w-full p-0 [--cell-size:clamp(2.75rem,13vw,4.25rem)] sm:[--cell-size:3.75rem]"
            classNames={{
              root: "w-full",
              month: "flex w-full flex-col gap-4",
              weekdays: "grid w-full grid-cols-7",
              weekday: "text-sm font-medium",
              week: "mt-1.5 grid w-full grid-cols-7",
              day: "relative min-w-0",
            }}
            modifiers={modifiers}
            modifiersClassNames={Object.fromEntries(
              Object.entries(APPOINTMENT_DOT_CLASS).map(([k, dot]) => [
                k,
                `relative after:absolute after:bottom-1 after:left-1/2 after:size-1.5 after:-translate-x-1/2 after:rounded-full ${dot}`,
              ])
            )}
          />
          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t pt-4 text-xs text-muted-foreground sm:grid-cols-3">
            {Object.entries(APPOINTMENT_TYPE_LABELS).map(([type, label]) => (
              <span key={type} className="flex items-center gap-1.5">
                <span
                  className={`size-2.5 shrink-0 rounded-full ${APPOINTMENT_TYPE_COLORS[type as keyof typeof APPOINTMENT_TYPE_COLORS]}`}
                />
                {label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex min-w-0 flex-col gap-5">
        <h2 className="font-serif text-xl font-semibold">Terminübersicht</h2>
        <div className="flex flex-col gap-3">
          <h3 className="text-base font-semibold">
            {selected
              ? format(selected, "EEEE, d. MMMM", { locale: de })
              : "Tag auswählen"}
          </h3>
          <AppointmentForm
            horseId={horseId}
            contacts={contacts}
            defaultDate={selected ? format(selected, "yyyy-MM-dd") : undefined}
            triggerClassName="w-full justify-center sm:w-auto"
          />
        </div>

        <AppointmentList
          appointments={dayAppointments}
          horseId={horseId}
          contacts={contacts}
        />

        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">
              Anstehende Termine
            </h4>
            <span className="text-xs text-muted-foreground">
              {upcoming.length}
            </span>
          </div>
          {upcoming.length === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              Keine anstehenden Termine.
            </p>
          ) : (
            <div className="max-h-[22rem] overflow-y-auto rounded-lg border">
              <ul className="divide-y">
                {upcoming.map((appt) => {
                  const isActive =
                    selected && appointmentCoversDay(appt, selected);
                  return (
                    <li key={appt.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setSelected(
                            startOfDay(parseISO(appt.starts_at))
                          )
                        }
                        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60 ${
                          isActive ? "bg-muted/60" : ""
                        }`}
                      >
                        <span
                          className={`size-2.5 shrink-0 rounded-full ${APPOINTMENT_TYPE_COLORS[appt.type]}`}
                        />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-medium">
                            {appt.title}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {formatAppointmentWhen(appt)}
                            {appt.location && ` · ${appt.location}`}
                          </span>
                        </span>
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                          {APPOINTMENT_TYPE_LABELS[appt.type]}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
