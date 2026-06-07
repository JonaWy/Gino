import { createClient } from "@/lib/supabase/server";
import { getHorse } from "@/lib/horse";
import { ContactsSection } from "@/components/extras/contacts-section";
import type { Contact } from "@/types/database";

export default async function KontaktePage() {
  const horse = await getHorse();
  if (!horse) return <p>Kein Pferd gefunden.</p>;

  const supabase = await createClient();
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .eq("horse_id", horse.id)
    .order("role");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Kontakte</h2>
        <p className="text-sm text-muted-foreground">
          Tierarzt, Schmied, Stall und Transport – ein Klick zum Anrufen
        </p>
      </div>
      <ContactsSection
        horseId={horse.id}
        contacts={(contacts as Contact[]) ?? []}
      />
    </div>
  );
}
