import { createClient } from "@/lib/supabase/server";
import { requireHorse } from "@/lib/horse";
import { VitalForm } from "@/components/history/vital-form";
import { VitalCharts } from "@/components/history/vital-charts";
import { VitalTable } from "@/components/history/vital-table";
import type { VitalRecord } from "@/types/database";

export default async function VitalwertePage() {
  const horse = await requireHorse();

  const supabase = await createClient();
  const { data: records } = await supabase
    .from("vital_records")
    .select("*")
    .eq("horse_id", horse.id)
    .order("recorded_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="hidden font-serif text-2xl font-semibold md:block">
            Vital- & Finanzhistorie
          </h2>
          <p className="text-sm text-muted-foreground">
            Gewicht, Stockmaß, Turniergewinne und geschätzter Verkaufswert
          </p>
        </div>
        <VitalForm horseId={horse.id} />
      </div>
      <VitalCharts records={(records as VitalRecord[]) ?? []} />
      <VitalTable records={(records as VitalRecord[]) ?? []} />
    </div>
  );
}
