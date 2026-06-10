import { createClient } from "@/lib/supabase/server";
import { requireHorse } from "@/lib/horse";
import { CalendarView } from "@/components/calendar/calendar-view";
import type { Appointment, Contact } from "@/types/database";

export default async function KalenderPage() {
  const horse = await requireHorse();

  const supabase = await createClient();
  const [{ data: appointments }, { data: contacts }] = await Promise.all([
    supabase
      .from("appointments")
      .select("*")
      .eq("horse_id", horse.id)
      .order("starts_at", { ascending: true }),
    supabase.from("contacts").select("*").eq("horse_id", horse.id).order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="hidden font-serif text-2xl font-semibold md:block">Kalender</h2>
        <p className="text-sm text-muted-foreground">
          Termine aus Kalender, Gesundheit, Training und Turnieren – automatisch
          synchronisiert
        </p>
      </div>
      <CalendarView
        appointments={(appointments as Appointment[]) ?? []}
        horseId={horse.id}
        contacts={(contacts as Contact[]) ?? []}
      />
    </div>
  );
}
