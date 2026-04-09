"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/home");
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/onboarding");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function saveGoals(formData: FormData, shouldRedirect = true) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const caloriesRaw = formData.get("calories") as string;
  const proteinRaw = formData.get("protein") as string;
  const carbRaw = formData.get("carbs") as string;
  const fatRaw = formData.get("fat") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      calories_goal: caloriesRaw ? parseInt(caloriesRaw) : null,
      protein_goal: proteinRaw ? parseInt(proteinRaw) : null,
      carb_goal: carbRaw ? parseInt(carbRaw) : null,
      fat_goal: fatRaw ? parseInt(fatRaw) : null,
      onboarding_complete: true,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  if (shouldRedirect) {
    redirect("/home");
  }

  return { success: true };
}

export async function logMacros(data: {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  trackingDate: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Try to get existing log for today
  const { data: existing } = await supabase
    .from("daily_logs")
    .select("id, calories, protein, carbs, fat")
    .eq("user_id", user.id)
    .eq("tracking_date", data.trackingDate)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("daily_logs")
      .update({
        calories: existing.calories + (data.calories ?? 0),
        protein: existing.protein + (data.protein ?? 0),
        carbs: existing.carbs + (data.carbs ?? 0),
        fat: existing.fat + (data.fat ?? 0),
      })
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("daily_logs").insert({
      user_id: user.id,
      tracking_date: data.trackingDate,
      calories: data.calories ?? 0,
      protein: data.protein ?? 0,
      carbs: data.carbs ?? 0,
      fat: data.fat ?? 0,
    });

    if (error) return { error: error.message };
  }

  return { success: true };
}

export async function updateDayLog(data: {
  trackingDate: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("daily_logs")
    .upsert(
      {
        user_id: user.id,
        tracking_date: data.trackingDate,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
      },
      { onConflict: "user_id,tracking_date" }
    );

  if (error) return { error: error.message };
  return { success: true };
}
