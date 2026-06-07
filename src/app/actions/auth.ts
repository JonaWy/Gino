"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect("/");
}

export async function register(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  if (data.user) {
    await supabase.from("horses").insert({
      user_id: data.user.id,
      name: "Gino",
    });

    const horseId = (
      await supabase
        .from("horses")
        .select("id")
        .eq("user_id", data.user.id)
        .single()
    ).data?.id;

    if (horseId) {
      await supabase.from("cost_defaults").insert([
        { user_id: data.user.id, horse_id: horseId, category: "tierarzt", default_amount: 145 },
        { user_id: data.user.id, horse_id: horseId, category: "schmied", default_amount: 80 },
        { user_id: data.user.id, horse_id: horseId, category: "turnier", default_amount: 150 },
      ]);
    }
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
