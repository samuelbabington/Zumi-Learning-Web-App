import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/typed-queries";
import { DashboardClient } from "./dashboard-client";
import type { Profile } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfile(supabase, user.id);

  const [decksRes, achievementsRes] = await Promise.all([
    supabase.from("study_decks").select("id, title, card_count, updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(3),
    supabase.from("achievements").select("id, achievement_type, unlocked_at").eq("user_id", user.id).order("unlocked_at", { ascending: false }).limit(5),
  ]);

  return (
    <DashboardClient
      profile={profile as Profile | null}
      recentDecks={(decksRes.data as { id: string; title: string; card_count: number; updated_at: string }[]) ?? []}
      achievements={(achievementsRes.data as { id: string; achievement_type: string; unlocked_at: string }[]) ?? []}
    />
  );
}
