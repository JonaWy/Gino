import { createClient } from "@/lib/supabase/server";
import type { Horse } from "@/types/database";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
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
    .single();

  return data;
}

export async function requireHorse(): Promise<Horse> {
  const horse = await getHorse();
  if (!horse) {
    throw new Error("Kein Pferd gefunden");
  }
  return horse;
}
