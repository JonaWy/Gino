"use client";

import { useTransition } from "react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { deleteTournament } from "@/app/actions/tournaments";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/costs";
import type { Tournament } from "@/types/database";
import { Trash2 } from "lucide-react";

export function TournamentTable({
  tournaments,
}: {
  tournaments: Tournament[];
}) {
  const [pending, startTransition] = useTransition();
  const totalPrize = tournaments.reduce(
    (s, t) => s + Number(t.prize_money || 0),
    0
  );

  if (tournaments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Noch keine Turniere eingetragen.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Turnier</TableHead>
              <TableHead>Ort</TableHead>
              <TableHead>Disziplin</TableHead>
              <TableHead>Bewertung</TableHead>
              <TableHead>Platz</TableHead>
              <TableHead>Reiter</TableHead>
              <TableHead>Preisgeld</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  {format(parseISO(t.date), "dd.MM.yyyy", { locale: de })}
                </TableCell>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>{t.location ?? "–"}</TableCell>
                <TableCell>{t.discipline ?? "–"}</TableCell>
                <TableCell>{t.rating ?? "–"}</TableCell>
                <TableCell>{t.placement ?? "–"}</TableCell>
                <TableCell>{t.rider_name ?? "–"}</TableCell>
                <TableCell>
                  {t.prize_money
                    ? formatCurrency(Number(t.prize_money))
                    : "–"}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await deleteTournament(t.id);
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
      <p className="text-sm font-medium">
        Gesamtgewinne: {formatCurrency(totalPrize)}
      </p>
    </div>
  );
}
