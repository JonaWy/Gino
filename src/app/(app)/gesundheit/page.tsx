import { createClient } from "@/lib/supabase/server";
import { requireHorse } from "@/lib/horse";
import { HealthSection } from "@/components/extras/health-section";
import type { Contact, HealthRecord } from "@/types/database";

export default async function GesundheitPage() {
  const horse = await requireHorse();

  const supabase = await createClient();
  const [{ data: records }, { data: contacts }] = await Promise.all([
    supabase
      .from("health_records")
      .select("*")
      .eq("horse_id", horse.id)
      .order("date", { ascending: false }),
    supabase.from("contacts").select("*").eq("horse_id", horse.id).order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="hidden font-serif text-2xl font-semibold md:block">Gesundheit</h2>
        <p className="text-sm text-muted-foreground">
          Impfungen, Entwurmung und Zahnarzt mit Fälligkeits-Tracking
        </p>
      </div>
      <HealthSection
        horseId={horse.id}
        records={(records as HealthRecord[]) ?? []}
        contacts={(contacts as Contact[]) ?? []}
      />
    </div>
  );
}
