import Link from "next/link";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APPOINTMENT_TYPE_LABELS } from "@/lib/labels";
import { daysUntil, formatCurrency } from "@/lib/costs";
import type { Appointment } from "@/types/database";

export function NextAppointment({
  appointment,
}: {
  appointment: Appointment | null;
}) {
  if (!appointment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar />
            Nächster Termin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Keine anstehenden Termine.
          </p>
          <Button render={<Link href="/kalender" />} className="mt-3" variant="outline" size="sm">
            Termin hinzufügen
          </Button>
        </CardContent>
      </Card>
    );
  }

  const days = daysUntil(appointment.starts_at);
  const daysLabel =
    days === 0 ? "Heute" : days === 1 ? "Morgen" : `in ${days} Tagen`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar />
          Nächster Termin
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium">{appointment.title}</p>
            <p className="text-sm text-muted-foreground">
              {format(parseISO(appointment.starts_at), "EEEE, d. MMMM yyyy", {
                locale: de,
              })}
            </p>
          </div>
          <Badge>{daysLabel}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {APPOINTMENT_TYPE_LABELS[appointment.type]}
          </Badge>
          {appointment.estimated_cost && (
            <span className="text-sm text-muted-foreground">
              ca. {formatCurrency(Number(appointment.estimated_cost))}
            </span>
          )}
        </div>
        <Button render={<Link href="/kalender" />} variant="ghost" size="sm" className="self-start">
          Zum Kalender
          <ArrowRight />
        </Button>
      </CardContent>
    </Card>
  );
}
