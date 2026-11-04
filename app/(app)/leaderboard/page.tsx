import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/app/topnav";
import { Trophy, Zap, Flame } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { Profile } from "@/types/database";

type LeaderUser = Pick<Profile, "id" | "username" | "full_name" | "xp" | "streak" | "level">;

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [profileRes, topUsersRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
    supabase.from("profiles").select("id, username, full_name, xp, streak, level").order("xp", { ascending: false }).limit(50),
  ]);

  const profile = profileRes.data as Profile | null;
  const topUsers = (topUsersRes.data as LeaderUser[] | null) ?? [];
  const myRank = topUsers.findIndex((u) => u.id === user!.id) + 1;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <>
      <TopNav profile={profile} pageTitle="Leaderboard" />
      <div className="p-6 max-w-3xl mx-auto space-y-6">

        <div>
          <h2 className="text-3xl font-extrabold text-zumi" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Leaderboard
          </h2>
          <p className="text-zumi-muted mt-1">Top students this week. Keep studying to climb the ranks!</p>
        </div>

        {/* Tab: Global / School */}
        <div className="flex gap-1 p-1 rounded-xl bg-zumi-surface-2 border border-zumi w-fit">
          {["Global", "My School"].map((tab, i) => (
            <button key={tab} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${i === 0 ? "bg-zumi-surface text-zumi border border-zumi-2 shadow-sm" : "text-zumi-muted hover:text-zumi-2"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* My rank banner */}
        {myRank > 0 && (
          <div className="glass-pink rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center font-bold text-white shadow-pink-sm">
                {myRank}
              </div>
              <div>
                <p className="font-semibold text-zumi">Your rank</p>
                <p className="text-xs text-zumi-muted">#{myRank} globally</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-pink-400 font-bold">
                <Zap size={14} />
                {formatNumber(profile?.xp ?? 0)} XP
              </div>
              <div className="flex items-center gap-1 text-orange-400">
                <Flame size={14} />
                {profile?.streak ?? 0}
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard list */}
        {topUsers.length === 0 ? (
          <div className="card-base p-12 text-center">
            <div className="text-5xl mb-3">🏆</div>
            <p className="text-zumi-muted">Be the first to join the leaderboard by earning XP!</p>
          </div>
        ) : (
          <div className="card-base overflow-hidden p-0">
            {topUsers.map((u, i) => {
              const isMe = u.id === user!.id;
              const rank = i + 1;
              return (
                <div
                  key={u.id}
                  className={`flex items-center gap-4 px-5 py-4 border-b border-zumi last:border-0 transition-colors animate-fade-in ${isMe ? "bg-pink-500/08" : "hover:bg-zumi-surface-2"}`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className={`w-8 text-center font-bold text-sm ${rank <= 3 ? "text-xl" : "text-zumi-muted"}`}>
                    {rank <= 3 ? medals[rank - 1] : rank}
                  </div>
                  <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm shadow-pink-sm shrink-0">
                    {((u.username || u.full_name || "?")[0]).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${isMe ? "text-zumi-pink" : "text-zumi"}`}>
                      {u.username || u.full_name || "Student"}
                      {isMe && <span className="ml-1 text-xs text-zumi-muted">(you)</span>}
                    </p>
                    <p className="text-xs text-zumi-muted">Level {u.level}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm shrink-0">
                    <span className="flex items-center gap-1 font-bold text-zumi">
                      <Zap size={12} className="text-pink-400" />
                      {formatNumber(u.xp)}
                    </span>
                    <span className="flex items-center gap-1 text-orange-400">
                      <Flame size={12} />
                      {u.streak}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
