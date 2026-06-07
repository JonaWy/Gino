import { createClient } from "@/lib/supabase/server";
import { getHorse } from "@/lib/horse";
import { TrainingSection } from "@/components/extras/training-section";
import type { TrainingLog } from "@/types/database";

export default async function TrainingPage() {
  const horse = await getHorse();
  if (!horse) return <p>Kein Pferd gefunden.</p>;

  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("training_logs")
    .select("*")
    .eq("horse_id", horse.id)
    .order("date", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Training</h2>
        <p className="text-sm text-muted-foreground">
          Trainingslog mit Dauer, Fokus und Intensität
        </p>
      </div>
      <TrainingSection
        horseId={horse.id}
        logs={(logs as TrainingLog[]) ?? []}
      />
    </div>
  );
}
