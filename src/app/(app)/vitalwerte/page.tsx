import { createClient } from "@/lib/supabase/server";
import { requireHorse } from "@/lib/horse";
import { VitalForm } from "@/components/history/vital-form";
import { VitalCharts } from "@/components/history/vital-charts";
import { VitalTable } from "@/components/history/vital-table";
import { VitalMedicalSection } from "@/components/history/vital-medical-section";
import { HealthPageTabs } from "@/components/history/health-page-tabs";
import { HealthSection } from "@/components/extras/health-section";
import type {
  Contact,
  Document,
  HealthRecord,
  HorseCondition,
  VitalRecord,
} from "@/types/database";

export default async function VitalwertePage() {
  const horse = await requireHorse();

  const supabase = await createClient();
  const [
    { data: records },
    { data: documents },
    { data: conditions },
    { data: healthRecords },
    { data: contacts },
  ] = await Promise.all([
    supabase
      .from("vital_records")
      .select("*")
      .eq("horse_id", horse.id)
      .order("recorded_at", { ascending: false }),
    supabase
      .from("documents")
      .select("*")
      .eq("horse_id", horse.id)
      .in("type", ["arztbericht", "roentgen"])
      .order("created_at", { ascending: false }),
    supabase
      .from("horse_conditions")
      .select("*")
      .eq("horse_id", horse.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("health_records")
      .select("*")
      .eq("horse_id", horse.id)
      .order("date", { ascending: false }),
    supabase.from("contacts").select("*").eq("horse_id", horse.id).order("name"),
  ]);

  const medicalDocuments = (documents as Document[]) ?? [];
  const reports = medicalDocuments.filter((d) => d.type === "arztbericht");
  const xRays = medicalDocuments.filter((d) => d.type === "roentgen");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="hidden font-serif text-2xl font-semibold md:block">
          Gesundheit
        </h2>
        <p className="text-sm text-muted-foreground">
          Vitalwerte, Impfungen, Pflege und Gesundheitsunterlagen
        </p>
      </div>

      <HealthPageTabs
        vitalContent={
          <>
            <div className="flex justify-end">
              <VitalForm horseId={horse.id} />
            </div>
            <VitalCharts records={(records as VitalRecord[]) ?? []} />
            <VitalTable records={(records as VitalRecord[]) ?? []} />
          </>
        }
        careContent={
          <>
            <VitalMedicalSection
              horseId={horse.id}
              conditions={(conditions as HorseCondition[]) ?? []}
              reports={reports}
              xRays={xRays}
            />
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-medium">Impfungen & Pflege</h3>
                <p className="text-sm text-muted-foreground">
                  Impfungen, Entwurmung und Zahnarzt mit Fälligkeits-Tracking
                </p>
              </div>
              <HealthSection
                horseId={horse.id}
                records={(healthRecords as HealthRecord[]) ?? []}
                contacts={(contacts as Contact[]) ?? []}
              />
            </div>
          </>
        }
      />
    </div>
  );
}
