import { createClient } from "@/lib/supabase/server";
import { getHorse } from "@/lib/horse";
import { HorseHero } from "@/components/dashboard/horse-hero";
import { NextAppointment } from "@/components/dashboard/next-appointment";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { DashboardAlerts } from "@/components/dashboard/alerts";
import { getCurrentMonthForecast } from "@/lib/costs";
import type { Appointment } from "@/types/database";

export default async function DashboardPage() {
  const horse = await getHorse();
  if (!horse) {
    return (
      <p className="text-muted-foreground">
        Kein Pferd gefunden. Bitte registriere dich erneut.
      </p>
    );
  }

  const supabase = await createClient();

  const [
    { data: appointments },
    { data: vitals },
    { data: tournaments },
    { data: healthRecords },
    { data: documents },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select("*")
      .eq("horse_id", horse.id)
      .eq("status", "geplant")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true }),
    supabase
      .from("vital_records")
      .select("*")
      .eq("horse_id", horse.id)
      .order("recorded_at", { ascending: false })
      .limit(1),
    supabase
      .from("tournaments")
      .select("prize_money")
      .eq("horse_id", horse.id),
    supabase
      .from("health_records")
      .select("*")
      .eq("horse_id", horse.id)
      .order("next_due_date", { ascending: true }),
    supabase
      .from("documents")
      .select("*")
      .eq("horse_id", horse.id),
  ]);

  const nextAppointment: Appointment | null = appointments?.[0] ?? null;
  const latestVital = vitals?.[0];
  const tournamentEarnings =
    tournaments?.reduce((s, t) => s + Number(t.prize_money || 0), 0) ?? 0;
  const monthForecast = getCurrentMonthForecast(
    (appointments as Appointment[]) ?? []
  );

  return (
    <div className="flex flex-col gap-6">
      <HorseHero horse={horse} />
      <DashboardAlerts
        healthRecords={healthRecords ?? []}
        documents={documents ?? []}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <NextAppointment appointment={nextAppointment} />
        <QuickActions />
      </div>
      <QuickStats
        weight={latestVital?.weight_kg ? Number(latestVital.weight_kg) : null}
        height={latestVital?.height_cm ? Number(latestVital.height_cm) : null}
        tournamentEarnings={tournamentEarnings}
        estimatedValue={
          latestVital?.estimated_value
            ? Number(latestVital.estimated_value)
            : null
        }
        monthForecast={monthForecast}
      />
    </div>
  );
}
