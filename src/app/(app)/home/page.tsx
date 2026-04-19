import { createClient } from "@/lib/supabase/server";
import { getTrackingDate } from "@/lib/tracking-date";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const trackingDate = getTrackingDate();

  const [{ data: profile }, { data: log }, { data: intakeEvents }] = await Promise.all([
    supabase
      .from("profiles")
      .select("calories_goal, protein_goal, carb_goal, fat_goal, show_intake_description")
      .eq("id", user!.id)
      .single(),
    supabase
      .from("daily_logs")
      .select("calories, protein, carbs, fat")
      .eq("user_id", user!.id)
      .eq("tracking_date", trackingDate)
      .single(),
    supabase
      .from("intake_events")
      .select("id, calories, protein, carbs, fat, description, created_at")
      .eq("user_id", user!.id)
      .eq("tracking_date", trackingDate)
      .order("created_at", { ascending: true }),
  ]);

  return (
    <HomeClient
      profile={profile ?? { calories_goal: null, protein_goal: null, carb_goal: null, fat_goal: null }}
      log={log ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }}
      trackingDate={trackingDate}
      intakeEvents={intakeEvents ?? []}
      showIntakeDescription={profile?.show_intake_description ?? false}
    />
  );
}
