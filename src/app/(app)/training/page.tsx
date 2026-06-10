import { createClient } from "@/lib/supabase/server";
import { requireHorse } from "@/lib/horse";
import { TrainingSection } from "@/components/extras/training-section";
import type { Contact, TrainingLog } from "@/types/database";

export default async function TrainingPage() {
  const horse = await requireHorse();

  const supabase = await createClient();
  const [{ data: logs }, { data: contacts }] = await Promise.all([
    supabase
      .from("training_logs")
      .select("*")
      .eq("horse_id", horse.id)
      .order("date", { ascending: false }),
    supabase.from("contacts").select("*").eq("horse_id", horse.id).order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="hidden font-serif text-2xl font-semibold md:block">Training</h2>
        <p className="text-sm text-muted-foreground">
          Trainingslog mit Zeitraum, Disziplin, Reiter und Trainer
        </p>
      </div>
      <TrainingSection
        horseId={horse.id}
        logs={(logs as TrainingLog[]) ?? []}
        contacts={(contacts as Contact[]) ?? []}
      />
    </div>
  );
}
