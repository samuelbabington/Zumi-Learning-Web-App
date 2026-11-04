import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/app/topnav";
import { Zap, Flame, Trophy, Star } from "lucide-react";
import { formatNumber, xpProgress } from "@/lib/utils";
import type { Profile } from "@/types/database";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle() as { data: Profile | null };

  const xp = xpProgress(profile?.xp ?? 0);

  return (
    <>
      <TopNav profile={profile} pageTitle="Profile" />
      <div className="p-6 max-w-3xl mx-auto space-y-6">

        {/* Profile hero */}
        <div className="relative overflow-hidden rounded-3xl p-8" style={{ background: "linear-gradient(135deg, #0A0A14 0%, #12061A 60%, #1A0A2E 100%)", border: "1px solid rgba(255,95,126,0.15)" }}>
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(255,95,126,0.4) 0%, transparent 60%)" }} />
          <div className="relative z-10 flex items-start gap-6">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl gradient-brand flex items-center justify-center text-5xl shadow-pink-md">
                🧑
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-xs font-bold text-white border-2 border-zumi-bg shadow-pink-sm">
                {xp.level}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-white mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {profile?.full_name || "Student"}
              </h2>
              <p className="text-gray-400 mb-4">@{profile?.username || "user"}</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: <Zap size={14} className="text-pink-400" />, label: `${formatNumber(profile?.xp ?? 0)} XP` },
                  { icon: <Flame size={14} className="text-orange-400" />, label: `${profile?.streak ?? 0} streak` },
                  { icon: <Trophy size={14} className="text-yellow-400" />, label: `${formatNumber(profile?.coins ?? 0)} coins` },
                  { icon: <Star size={14} className="text-red-400" />, label: `${profile?.lives ?? 10}/10 lives` },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-1.5 text-sm text-gray-300">
                    {stat.icon}
                    <span className="font-semibold">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="card-base p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-zumi">Level {xp.level} → {xp.level + 1}</span>
            <span className="text-sm text-zumi-pink font-bold">{xp.percent}%</span>
          </div>
          <div className="h-3 bg-zumi-surface-2 rounded-full overflow-hidden border border-zumi">
            <div className="h-full xp-bar-fill rounded-full transition-all duration-1000" style={{ width: `${xp.percent}%` }} />
          </div>
          <p className="text-xs text-zumi-muted mt-2">{formatNumber(xp.current)} / {formatNumber(xp.needed)} XP to next level</p>
        </div>

        {/* Bio */}
        {profile?.bio && (
          <div className="card-base p-5">
            <h3 className="font-semibold text-zumi mb-2">About</h3>
            <p className="text-zumi-muted text-sm">{profile.bio}</p>
          </div>
        )}

        {/* Interests */}
        {profile?.interests && profile.interests.length > 0 && (
          <div className="card-base p-5">
            <h3 className="font-semibold text-zumi mb-3">Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span key={interest} className="px-3 py-1 rounded-xl text-sm bg-pink-500/10 border border-pink-500/20 text-pink-400 font-medium">
                  {interest.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
