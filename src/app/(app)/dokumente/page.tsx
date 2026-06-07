import { createClient } from "@/lib/supabase/server";
import { requireHorse } from "@/lib/horse";
import { DocumentsSection } from "@/components/extras/documents-section";
import type { Document } from "@/types/database";

export default async function DokumentePage() {
  const horse = await requireHorse();

  const supabase = await createClient();
  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("horse_id", horse.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="hidden font-serif text-2xl font-semibold md:block">Dokumente</h2>
        <p className="text-sm text-muted-foreground">
          Pferdepass, Versicherung und weitere Unterlagen
        </p>
      </div>
      <DocumentsSection
        horseId={horse.id}
        documents={(documents as Document[]) ?? []}
      />
    </div>
  );
}
