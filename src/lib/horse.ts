import { createClient } from "@/lib/supabase/server";
import type { Horse } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function seedCostDefaults(
  supabase: SupabaseClient,
  userId: string,
  horseId: string
) {
  await supabase.from("cost_defaults").upsert(
    [
      { user_id: userId, horse_id: horseId, category: "tierarzt", default_amount: 145 },
      { user_id: userId, horse_id: horseId, category: "schmied", default_amount: 80 },
      { user_id: userId, horse_id: horseId, category: "turnier", default_amount: 150 },
    ],
    { onConflict: "user_id,horse_id,category" }
  );
}

export async function createHorseForUser(
  userId: string,
  name = "Gino",
  breed: string | null = null
): Promise<Horse | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("horses")
    .insert({ user_id: userId, name, breed })
    .select()
    .single();

  if (error || !data) return null;

  await seedCostDefaults(supabase, userId, data.id);
  return data as Horse;
}

export async function getHorse(): Promise<Horse | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await supabase
    .from("horses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data as Horse | null;
}

/** Lädt das Pferd oder legt automatisch „Gino“ an (z. B. nach Login ohne Registrierungs-Session). */
export async function getOrCreateHorse(): Promise<Horse | null> {
  const existing = await getHorse();
  if (existing) return existing;

  const user = await getCurrentUser();
  if (!user) return null;

  return createHorseForUser(user.id);
}

export async function requireHorse(): Promise<Horse> {
  const horse = await getOrCreateHorse();
  if (!horse) {
    throw new Error("Kein Pferd gefunden");
  }
  return horse;
}
