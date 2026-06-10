import { createClient } from "@/lib/supabase/server";
import { requireHorse } from "@/lib/horse";
import { CalendarView } from "@/components/calendar/calendar-view";
import { MonthCostSummaryCard } from "@/components/calendar/month-cost-summary";
import { computeMonthSummaries } from "@/lib/costs";
import type { Appointment, Contact, Expense } from "@/types/database";
import { format } from "date-fns";

export default async function KalenderPage() {
  const horse = await requireHorse();

  const supabase = await createClient();
  const [{ data: appointments }, { data: expenses }, { data: contacts }] =
    await Promise.all([
    supabase
      .from("appointments")
      .select("*")
      .eq("horse_id", horse.id)
      .order("starts_at", { ascending: true }),
    supabase
      .from("expenses")
      .select("*")
      .eq("horse_id", horse.id),
    supabase.from("contacts").select("*").eq("horse_id", horse.id).order("name"),
  ]);

  const summaries = computeMonthSummaries(
    (appointments as Appointment[]) ?? [],
    (expenses as Expense[]) ?? []
  );
  const currentMonth = format(new Date(), "yyyy-MM");
  const currentSummary =
    summaries.find((s) => s.month === currentMonth) ?? summaries[6];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="hidden font-serif text-2xl font-semibold md:block">Kalender</h2>
        <p className="text-sm text-muted-foreground">
          Termine aus Kalender, Gesundheit, Training und Turnieren – automatisch
          synchronisiert
        </p>
      </div>
      {currentSummary && <MonthCostSummaryCard summary={currentSummary} />}
      <CalendarView
        appointments={(appointments as Appointment[]) ?? []}
        horseId={horse.id}
        contacts={(contacts as Contact[]) ?? []}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaries
          .filter((s) => s.total > 0)
          .slice(0, 6)
          .map((s) => (
            <MonthCostSummaryCard key={s.month} summary={s} />
          ))}
      </div>
    </div>
  );
}
