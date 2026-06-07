import { createClient } from "@/lib/supabase/server";
import { requireHorse } from "@/lib/horse";
import { CostTabs } from "@/components/costs/cost-tabs";
import {
  computeMonthSummaries,
  computeCategoryStats,
} from "@/lib/costs";
import type { Appointment, Expense } from "@/types/database";

export default async function KostenPage() {
  const horse = await requireHorse();

  const supabase = await createClient();
  const [{ data: appointments }, { data: expenses }] = await Promise.all([
    supabase.from("appointments").select("*").eq("horse_id", horse.id),
    supabase.from("expenses").select("*").eq("horse_id", horse.id),
  ]);

  const appts = (appointments as Appointment[]) ?? [];
  const exps = (expenses as Expense[]) ?? [];
  const summaries = computeMonthSummaries(appts, exps);
  const stats = computeCategoryStats(exps);

  const year = new Date().getFullYear();
  const yearSpent = exps
    .filter((e) => !e.is_estimated && e.date.startsWith(String(year)))
    .reduce((s, e) => s + Number(e.amount), 0);
  const yearPlanned = appts
    .filter(
      (a) =>
        a.status === "geplant" &&
        a.starts_at.startsWith(String(year)) &&
        a.estimated_cost
    )
    .reduce((s, a) => s + Number(a.estimated_cost), 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="hidden font-serif text-2xl font-semibold md:block">
          Kosten-Forecast & Historie
        </h2>
        <p className="text-sm text-muted-foreground">
          Prognose, Ist-Ausgaben und Durchschnittswerte für Tierarzt, Schmied
          und Turniere
        </p>
      </div>
      <CostTabs
        summaries={summaries}
        stats={stats}
        yearSpent={yearSpent}
        yearPlanned={yearPlanned}
      />
    </div>
  );
}
