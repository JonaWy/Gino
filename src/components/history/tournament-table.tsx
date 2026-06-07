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
import {
  MobileListCard,
  MobileListRow,
} from "@/components/ui/mobile-list-card";
import { contactNameById } from "@/lib/contacts";
import { formatCurrency } from "@/lib/costs";
import type { Contact, Tournament } from "@/types/database";
import { Trash2 } from "lucide-react";

export function TournamentTable({
  tournaments,
  contacts,
}: {
  tournaments: Tournament[];
  contacts: Contact[];
}) {
  const [pending, startTransition] = useTransition();
  const totalPrize = tournaments.reduce(
    (s, t) => s + Number(t.prize_money || 0),
    0
  );

  function riderLabel(t: Tournament) {
    return (
      contactNameById(contacts, t.contact_id ?? t.rider_id) ??
      t.rider_name ??
      "–"
    );
  }

  if (tournaments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Noch keine Turniere eingetragen.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:hidden">
        {tournaments.map((t) => (
          <MobileListCard
            key={t.id}
            actions={
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={pending}
                className="text-destructive"
                onClick={() =>
                  startTransition(async () => {
                    await deleteTournament(t.id);
                  })
                }
              >
                <Trash2 />
              </Button>
            }
          >
            <div className="flex flex-col gap-1">
              <p className="font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(t.date), "dd.MM.yyyy", { locale: de })}
                {t.location ? ` · ${t.location}` : ""}
              </p>
            </div>
            <MobileListRow label="Disziplin" value={t.discipline ?? "–"} />
            <MobileListRow label="Bewertung" value={t.rating ?? "–"} />
            <MobileListRow label="Platz" value={t.placement ?? "–"} />
            <MobileListRow label="Reiter" value={riderLabel(t)} />
            <MobileListRow
              label="Preisgeld"
              value={
                t.prize_money
                  ? formatCurrency(Number(t.prize_money))
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
                <TableCell>{riderLabel(t)}</TableCell>
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
