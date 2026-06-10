import { createClient } from "@/lib/supabase/server";
import { requireHorse } from "@/lib/horse";
import { TournamentBestOf } from "@/components/history/tournament-best-of";
import { TournamentForm } from "@/components/history/tournament-form";
import { TournamentTable } from "@/components/history/tournament-table";
import type { Contact, Tournament } from "@/types/database";

export default async function TurnierePage() {
  const horse = await requireHorse();

  const supabase = await createClient();
  const [{ data: tournaments }, { data: contacts }] = await Promise.all([
    supabase
      .from("tournaments")
      .select("*")
      .eq("horse_id", horse.id)
      .order("date", { ascending: false }),
    supabase.from("contacts").select("*").eq("horse_id", horse.id).order("name"),
  ]);

  const contactList = (contacts as Contact[]) ?? [];

  const tournamentList = (tournaments as Tournament[]) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <TournamentBestOf tournaments={tournamentList} contacts={contactList} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="hidden font-serif text-2xl font-semibold md:block">Turnier-Historie</h2>
          <p className="text-sm text-muted-foreground">
            Turniere, Bewertungen, Reiter und Preisgelder
          </p>
        </div>
        <TournamentForm horseId={horse.id} contacts={contactList} />
      </div>
      <TournamentTable tournaments={tournamentList} contacts={contactList} />
    </div>
  );
}
