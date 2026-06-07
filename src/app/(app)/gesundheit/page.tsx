import { createClient } from "@/lib/supabase/server";
import { getHorse } from "@/lib/horse";
import { HealthSection } from "@/components/extras/health-section";
import type { HealthRecord } from "@/types/database";

export default async function GesundheitPage() {
  const horse = await getHorse();
  if (!horse) return <p>Kein Pferd gefunden.</p>;

  const supabase = await createClient();
  const { data: records } = await supabase
    .from("health_records")
    .select("*")
    .eq("horse_id", horse.id)
    .order("date", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Gesundheit</h2>
        <p className="text-sm text-muted-foreground">
          Impfungen, Entwurmung und Zahnarzt mit Fälligkeits-Tracking
        </p>
      </div>
      <HealthSection
        horseId={horse.id}
        records={(records as HealthRecord[]) ?? []}
      />
    </div>
  );
}
