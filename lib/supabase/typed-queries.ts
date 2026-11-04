/**
 * Typed wrappers around Supabase queries.
 * Supabase v2.49+ with sb_publishable_ keys has changed type inference.
 * These helpers add explicit return types so TypeScript doesn't infer `never`.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Profile, School, StudyDeck, StudyCard, Document, Notification, Friendship
} from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = SupabaseClient<any, any, any>;

export async function getProfile(supabase: SB, userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles").select("*").eq("id", userId).maybeSingle();
  return data as Profile | null;
}

export async function getSchools(supabase: SB, query: string): Promise<School[]> {
  const { data } = await supabase
    .from("schools")
    .select("*")
    .or(`official_name.ilike.%${query}%,city.ilike.%${query}%,country.ilike.%${query}%`)
    .eq("verification_status", "verified")
    .limit(10);
  return (data as School[]) ?? [];
}

export async function getDecks(supabase: SB, userId: string): Promise<StudyDeck[]> {
  const { data } = await supabase
    .from("study_decks").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
  return (data as StudyDeck[]) ?? [];
}

export async function getCards(supabase: SB, deckId: string): Promise<StudyCard[]> {
  const { data } = await supabase
    .from("study_cards").select("*").eq("deck_id", deckId).order("created_at");
  return (data as StudyCard[]) ?? [];
}

export async function getDocs(supabase: SB, userId: string): Promise<Document[]> {
  const { data } = await supabase
    .from("documents").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return (data as Document[]) ?? [];
}

export async function getNotifications(supabase: SB, userId: string): Promise<Notification[]> {
  const { data } = await supabase
    .from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(30);
  return (data as Notification[]) ?? [];
}

export async function getFriends(supabase: SB, userId: string): Promise<Friendship[]> {
  const { data } = await supabase
    .from("friendships")
    .select("*")
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    .eq("status", "accepted");
  return (data as Friendship[]) ?? [];
}
