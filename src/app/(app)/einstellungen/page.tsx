import { createClient } from "@/lib/supabase/server";
import { getHorse, getCurrentUser } from "@/lib/horse";
import { SettingsForm } from "@/components/extras/settings-form";
import type { CostDefault, Rider } from "@/types/database";

export default async function EinstellungenPage() {
  const horse = await getHorse();
  const user = await getCurrentUser();
  if (!horse || !user) return <p>Kein Pferd gefunden.</p>;

  const supabase = await createClient();
  const [{ data: costDefaults }, { data: riders }] = await Promise.all([
    supabase.from("cost_defaults").select("*").eq("horse_id", horse.id),
    supabase.from("riders").select("*").eq("horse_id", horse.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Einstellungen</h2>
        <p className="text-sm text-muted-foreground">
          Pferdeprofil, Bild, Reiter und Kosten-Standardwerte
        </p>
      </div>
      <SettingsForm
        horse={horse}
        email={user.email ?? ""}
        costDefaults={(costDefaults as CostDefault[]) ?? []}
        riders={(riders as Rider[]) ?? []}
      />
    </div>
  );
}
