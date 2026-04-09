import { createClient } from "@/lib/supabase/server";
import { getTrackingDate, getTrackingDatesRange } from "@/lib/tracking-date";
import HistoryClient from "./HistoryClient";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dates = getTrackingDatesRange(7);
  const today = getTrackingDate();

  const { data: profile } = await supabase
    .from("profiles")
    .select("calories_goal, protein_goal, carb_goal, fat_goal")
    .eq("id", user!.id)
    .single();

  const { data: logs } = await supabase
    .from("daily_logs")
    .select("tracking_date, calories, protein, carbs, fat")
    .eq("user_id", user!.id)
    .gte("tracking_date", dates[0])
    .lte("tracking_date", dates[dates.length - 1])
    .order("tracking_date", { ascending: true });

  return (
    <HistoryClient
      profile={profile ?? { calories_goal: null, protein_goal: null, carb_goal: null, fat_goal: null }}
      logs={logs ?? []}
      dates={dates}
      today={today}
    />
  );
}
