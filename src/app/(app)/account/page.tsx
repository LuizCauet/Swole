import { createClient } from "@/lib/supabase/server";
import AccountClient from "./AccountClient";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("calories_goal, protein_goal, carb_goal, fat_goal")
    .eq("id", user!.id)
    .single();

  return (
    <AccountClient
      email={user!.email ?? ""}
      profile={
        profile ?? {
          calories_goal: null,
          protein_goal: null,
          carb_goal: null,
          fat_goal: null,
        }
      }
    />
  );
}
