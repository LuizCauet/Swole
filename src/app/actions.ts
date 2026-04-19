"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

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

  // Set the onboarding cookie so middleware skips the DB check
  const cookieStore = await cookies();
  cookieStore.set("onboarding_complete", "1", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

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
  description?: string;
  trackingDate: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Insert individual intake event
  const { error: eventError } = await supabase.from("intake_events").insert({
    user_id: user.id,
    tracking_date: data.trackingDate,
    calories: data.calories ?? 0,
    protein: data.protein ?? 0,
    carbs: data.carbs ?? 0,
    fat: data.fat ?? 0,
    description: data.description ?? null,
  });
  if (eventError) return { error: eventError.message };

  // Update daily aggregate
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

export async function updateIntakeEvent(data: {
  id: string;
  trackingDate: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("intake_events")
    .update({
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      description: data.description ?? null,
    })
    .eq("id", data.id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  await recalcDailyLog(supabase, user.id, data.trackingDate);
  return { success: true };
}

export async function deleteIntakeEvent(id: string, trackingDate: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("intake_events")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  await recalcDailyLog(supabase, user.id, trackingDate);
  return { success: true };
}

export async function toggleIntakeDescription(value: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ show_intake_description: value })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

async function recalcDailyLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  trackingDate: string
) {
  const { data: events } = await supabase
    .from("intake_events")
    .select("calories, protein, carbs, fat")
    .eq("user_id", userId)
    .eq("tracking_date", trackingDate);

  const totals = (events ?? []).reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  await supabase.from("daily_logs").upsert(
    { user_id: userId, tracking_date: trackingDate, ...totals },
    { onConflict: "user_id,tracking_date" }
  );
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
