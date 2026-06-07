import { createClient } from "@/lib/supabase/server";
import { requireHorse, getCurrentUser } from "@/lib/horse";
import { SettingsForm } from "@/components/extras/settings-form";
import type { CostDefault } from "@/types/database";

export default async function EinstellungenPage() {
  const horse = await requireHorse();
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data: costDefaults } = await supabase
    .from("cost_defaults")
    .select("*")
    .eq("horse_id", horse.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="hidden font-serif text-2xl font-semibold md:block">Einstellungen</h2>
        <p className="text-sm text-muted-foreground">
          Pferdeprofil, Bild und Kosten-Standardwerte
        </p>
      </div>
      <SettingsForm
        horse={horse}
        email={user?.email ?? ""}
        costDefaults={(costDefaults as CostDefault[]) ?? []}
      />
    </div>
  );
}
