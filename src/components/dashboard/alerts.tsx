import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type { Document, HealthRecord } from "@/types/database";
import { parseISO, isBefore, addDays } from "date-fns";

export function DashboardAlerts({
  healthRecords,
  documents,
}: {
  healthRecords: HealthRecord[];
  documents: Document[];
}) {
  const alerts: string[] = [];
  const now = new Date();
  const soon = addDays(now, 30);

  healthRecords.forEach((r) => {
    if (r.next_due_date && isBefore(parseISO(r.next_due_date), now)) {
      alerts.push(`Überfällig: ${r.type} (${r.product_name || "ohne Bezeichnung"})`);
    } else if (r.next_due_date && isBefore(parseISO(r.next_due_date), soon)) {
      alerts.push(`Bald fällig: ${r.type} bis ${r.next_due_date}`);
    }
  });

  documents.forEach((d) => {
    if (d.expires_at && isBefore(parseISO(d.expires_at), soon)) {
      alerts.push(`Dokument läuft ab: ${d.title}`);
    }
  });

  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {alerts.map((msg) => (
        <Alert key={msg} variant="destructive">
          <AlertTriangle />
          <AlertTitle>Hinweis</AlertTitle>
          <AlertDescription>{msg}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
