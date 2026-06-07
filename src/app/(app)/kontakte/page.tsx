import { createClient } from "@/lib/supabase/server";
import { requireHorse } from "@/lib/horse";
import { ContactsSection } from "@/components/extras/contacts-section";
import type { Contact } from "@/types/database";

export default async function KontaktePage() {
  const horse = await requireHorse();

  const supabase = await createClient();
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .eq("horse_id", horse.id)
    .order("name");

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="hidden font-serif text-2xl font-semibold md:block">
          Kontakte
        </h2>
        <p className="text-sm text-muted-foreground md:max-w-2xl">
          Reiter, Tierärzte, Schmiede, Trainer und Physiotherapeuten verwalten –
          in Turnieren, Training und Kalender auswählbar.
        </p>
      </div>
      <ContactsSection
        horseId={horse.id}
        contacts={(contacts as Contact[]) ?? []}
      />
    </div>
  );
}
