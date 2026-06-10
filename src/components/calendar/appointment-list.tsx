"use client";

import { useTransition } from "react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import {
  completeAppointment,
  deleteAppointment,
} from "@/app/actions/appointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  APPOINTMENT_TYPE_LABELS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_COLORS,
} from "@/lib/labels";
import { formatCurrency } from "@/lib/costs";
import { appointmentDayRange } from "@/lib/appointment-dates";
import type { Appointment, Contact } from "@/types/database";
import { Check, Trash2 } from "lucide-react";
import { AppointmentForm } from "./appointment-form";

export function AppointmentList({
  appointments,
  horseId,
  contacts,
}: {
  appointments: Appointment[];
  horseId: string;
  contacts: Contact[];
}) {
  const [pending, startTransition] = useTransition();

  if (appointments.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
        Keine Termine an diesem Tag.
      </p>
    );
  }

  function formatAppointmentTime(appt: Appointment) {
    if (appt.all_day) {
      const { start, end } = appointmentDayRange(appt);
      if (start.getTime() !== end.getTime()) {
        return `${format(start, "d. MMM", { locale: de })} – ${format(end, "d. MMM yyyy", { locale: de })}`;
      }
      return "Ganztägig";
    }
    return format(parseISO(appt.starts_at), "HH:mm 'Uhr'", { locale: de });
  }

  return (
    <div className="flex flex-col gap-2">
      {appointments.map((appt) => (
        <Card key={appt.id} className="py-0">
          <CardContent className="flex flex-col gap-2.5 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 shrink-0 rounded-full ${APPOINTMENT_TYPE_COLORS[appt.type]}`}
                  />
                  <span className="truncate font-medium">{appt.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatAppointmentTime(appt)}
                  {appt.location && ` · ${appt.location}`}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant="outline">
                  {APPOINTMENT_TYPE_LABELS[appt.type]}
                </Badge>
                {appt.status !== "geplant" && (
                  <span className="text-[11px] text-muted-foreground">
                    {APPOINTMENT_STATUS_LABELS[appt.status]}
                  </span>
                )}
              </div>
            </div>
            {appt.estimated_cost && appt.status === "geplant" && (
              <p className="text-sm">
                Geschätzt: {formatCurrency(Number(appt.estimated_cost))}
              </p>
            )}
            {appt.actual_cost && appt.status === "erledigt" && (
              <p className="text-sm">
                Tatsächlich: {formatCurrency(Number(appt.actual_cost))}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <AppointmentForm horseId={horseId} contacts={contacts} appointment={appt} />
              {appt.status === "geplant" && (
                <Dialog>
                  <DialogTrigger
                    render={
                      <Button size="sm" variant="outline">
                        <Check />
                        Erledigt
                      </Button>
                    }
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Termin erledigt</DialogTitle>
                    </DialogHeader>
                    <form
                      action={(fd) =>
                        startTransition(async () => {
                          await completeAppointment(fd);
                        })
                      }
                      className="flex flex-col gap-4"
                    >
                      <input type="hidden" name="id" value={appt.id} />
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`cost-${appt.id}`}>
                          Tatsächliche Kosten (€)
                        </Label>
                        <Input
                          id={`cost-${appt.id}`}
                          name="actual_cost"
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={appt.estimated_cost ?? ""}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={pending}>
                        Speichern
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
              <Button
                size="sm"
                variant="destructive"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteAppointment(appt.id);
                  })
                }
              >
                <Trash2 />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
