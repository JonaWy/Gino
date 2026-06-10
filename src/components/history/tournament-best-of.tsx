import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { Trophy, MapPin, Calendar, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contactNameById } from "@/lib/contacts";
import { formatCurrency } from "@/lib/costs";
import { getBestTournament } from "@/lib/tournaments";
import type { Contact, Tournament } from "@/types/database";

export function TournamentBestOf({
  tournaments,
  contacts,
}: {
  tournaments: Tournament[];
  contacts: Contact[];
}) {
  const best = getBestTournament(tournaments);
  if (!best) return null;

  const totalPrize = tournaments.reduce(
    (sum, t) => sum + Number(t.prize_money || 0),
    0
  );

  const rider =
    contactNameById(contacts, best.contact_id ?? best.rider_id) ??
    best.rider_name;

  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="size-4 text-amber-600" />
          Highlight
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-serif text-xl font-semibold tracking-wide">
              {best.name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3.5 shrink-0" />
                {format(parseISO(best.date), "dd.MM.yyyy", { locale: de })}
              </span>
              {best.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5 shrink-0" />
                  {best.location}
                </span>
              )}
              {rider && (
                <span className="inline-flex items-center gap-1">
                  <UserRound className="size-3.5 shrink-0" />
                  {rider}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            {best.placement != null && (
              <Badge className="bg-amber-600 text-white hover:bg-amber-600">
                Platz {best.placement}
              </Badge>
            )}
            {best.rating && (
              <Badge variant="secondary">Bewertung {best.rating}</Badge>
            )}
            {best.prize_money != null && Number(best.prize_money) > 0 && (
              <Badge variant="outline">
                {formatCurrency(Number(best.prize_money))}
              </Badge>
            )}
            {best.discipline && (
              <Badge variant="outline">{best.discipline}</Badge>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Bester Erfolg nach Platzierung, Preisgeld und Bewertung ·{" "}
          {tournaments.length}{" "}
          {tournaments.length === 1 ? "Turnier" : "Turniere"} · Gesamtgewinne{" "}
          {formatCurrency(totalPrize)}
        </p>
      </CardContent>
    </Card>
  );
}
