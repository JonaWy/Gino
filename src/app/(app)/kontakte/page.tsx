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
    <ContactsSection
      horseId={horse.id}
      contacts={(contacts as Contact[]) ?? []}
    />
  );
}
