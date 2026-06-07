"use client";

import { useTransition } from "react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { deleteVitalRecord } from "@/app/actions/vitals";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  MobileListCard,
  MobileListRow,
} from "@/components/ui/mobile-list-card";
import { formatCurrency } from "@/lib/costs";
import type { VitalRecord } from "@/types/database";
import { Trash2 } from "lucide-react";

export function VitalTable({ records }: { records: VitalRecord[] }) {
  const [pending, startTransition] = useTransition();

  if (records.length === 0) return null;

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {records.map((r) => (
          <MobileListCard
            key={r.id}
            actions={
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={pending}
                className="text-destructive"
                onClick={() =>
                  startTransition(async () => {
                    await deleteVitalRecord(r.id);
                  })
                }
              >
                <Trash2 />
              </Button>
            }
          >
            <p className="font-medium">
              {format(parseISO(r.recorded_at), "dd.MM.yyyy", { locale: de })}
            </p>
            <MobileListRow
              label="Gewicht"
              value={r.weight_kg ? `${r.weight_kg} kg` : "–"}
            />
            <MobileListRow
              label="Stockmaß"
              value={r.height_cm ? `${r.height_cm} cm` : "–"}
            />
            <MobileListRow
              label="Turniergewinne"
              value={
                r.tournament_earnings_total
                  ? formatCurrency(Number(r.tournament_earnings_total))
                  : "–"
              }
            />
            <MobileListRow
              label="Wert"
              value={
                r.estimated_value
                  ? formatCurrency(Number(r.estimated_value))
                  : "–"
              }
            />
          </MobileListCard>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Gewicht</TableHead>
              <TableHead>Stockmaß</TableHead>
              <TableHead>Turniergewinne</TableHead>
              <TableHead>Wert</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  {format(parseISO(r.recorded_at), "dd.MM.yyyy", {
                    locale: de,
                  })}
                </TableCell>
                <TableCell>
                  {r.weight_kg ? `${r.weight_kg} kg` : "–"}
                </TableCell>
                <TableCell>
                  {r.height_cm ? `${r.height_cm} cm` : "–"}
                </TableCell>
                <TableCell>
                  {r.tournament_earnings_total
                    ? formatCurrency(Number(r.tournament_earnings_total))
                    : "–"}
                </TableCell>
                <TableCell>
                  {r.estimated_value
                    ? formatCurrency(Number(r.estimated_value))
                    : "–"}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await deleteVitalRecord(r.id);
                      })
                    }
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
