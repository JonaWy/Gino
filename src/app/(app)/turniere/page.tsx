import { createClient } from "@/lib/supabase/server";
import { getHorse } from "@/lib/horse";
import { TournamentForm } from "@/components/history/tournament-form";
import { TournamentTable } from "@/components/history/tournament-table";
import type { Tournament, Rider } from "@/types/database";

export default async function TurnierePage() {
  const horse = await getHorse();
  if (!horse) return <p>Kein Pferd gefunden.</p>;

  const supabase = await createClient();
  const [{ data: tournaments }, { data: riders }] = await Promise.all([
    supabase
      .from("tournaments")
      .select("*")
      .eq("horse_id", horse.id)
      .order("date", { ascending: false }),
    supabase.from("riders").select("*").eq("horse_id", horse.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Turnier-Historie</h2>
          <p className="text-sm text-muted-foreground">
            Turniere, Bewertungen, Reiter und Preisgelder
          </p>
        </div>
        <TournamentForm
          horseId={horse.id}
          riders={(riders as Rider[]) ?? []}
        />
      </div>
      <TournamentTable tournaments={(tournaments as Tournament[]) ?? []} />
    </div>
  );
}
