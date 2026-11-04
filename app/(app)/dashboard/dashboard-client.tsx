"use client";

import Link from "next/link";
import { BookOpen, Gamepad2, Users, Zap, Flame, Trophy, Star, TrendingUp, ArrowRight, Plus } from "lucide-react";
import { ReferralCard } from "@/components/app/referral-card";
import { TopNav } from "@/components/app/topnav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber, xpProgress } from "@/lib/utils";
import type { Profile } from "@/types/database";

interface Props {
  profile: Profile | null;
  recentDecks: { id: string; title: string; card_count: number; updated_at: string }[];
  achievements: { id: string; achievement_type: string; unlocked_at: string }[];
}

const ACHIEVEMENT_META: Record<string, { label: string; emoji: string }> = {
  first_deck: { label: "First Deck", emoji: "📚" },
  streak_7: { label: "7-Day Streak", emoji: "🔥" },
  streak_30: { label: "30-Day Streak", emoji: "🌟" },
  games_10: { label: "10 Games Played", emoji: "🎮" },
  perfect_quiz: { label: "Perfect Quiz", emoji: "🏆" },
};

const QUICK_ACTIONS = [
  { label: "Upload notes", icon: "📄", href: "/study-studio", color: "from-blue-500/20 to-blue-600/10 border-blue-500/30" },
  { label: "Quick Quiz", icon: "⚡", href: "/games/quick-quiz", color: "from-pink-500/20 to-pink-600/10 border-pink-500/30" },
  { label: "Daily Challenge", icon: "🎯", href: "/games/daily-challenge", color: "from-orange-500/20 to-orange-600/10 border-orange-500/30" },
  { label: "Challenge Friend", icon: "🤝", href: "/games/challenge", color: "from-purple-500/20 to-purple-600/10 border-purple-500/30" },
];

function StatCard({ label, value, icon, color, sublabel }: {
  label: string; value: string; icon: React.ReactNode; color: string; sublabel?: string;
}) {
  return (
    <Card className="relative overflow-hidden card-hover animate-fade-in">
      <div className={`absolute inset-0 opacity-10 ${color}`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2.5 rounded-xl bg-zumi-surface-2 border border-zumi">
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold text-zumi">{value}</p>
        <p className="text-sm text-zumi-muted mt-0.5">{label}</p>
        {sublabel && <p className="text-xs text-zumi-muted mt-0.5 opacity-70">{sublabel}</p>}
      </div>
    </Card>
  );
}

function StreakCalendar({ streak }: { streak: number }) {
  const today = new Date();
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (27 - i));
    const isActive = i >= 28 - streak;
    const isToday = i === 27;
    return { date: d, active: isActive, today: isToday };
  });

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayLabels.map((d, i) => (
          <div key={i} className="text-center text-xs text-zumi-muted font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ active, today: isToday }, i) => (
          <div
            key={i}
            style={{ animationDelay: `${i * 20}ms` }}
            className={`
              aspect-square rounded-md animate-fade-in transition-all
              ${isToday && active ? "gradient-brand shadow-pink-sm scale-110" : ""}
              ${isToday && !active ? "border-2 border-pink-500 bg-pink-500/10" : ""}
              ${!isToday && active ? "bg-pink-500/60" : ""}
              ${!isToday && !active ? "bg-zumi-surface-2 border border-zumi" : ""}
            `}
          />
        ))}
      </div>
    </div>
  );
}

export function DashboardClient({ profile, recentDecks, achievements }: Props) {
  const xp = xpProgress(profile?.xp ?? 0);
  const name = profile?.username || profile?.full_name?.split(" ")[0] || "Student";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <TopNav profile={profile} pageTitle="Dashboard" />

      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Welcome */}
        <div className="flex items-start justify-between gap-4 animate-slide-up">
          <div>
            <h2 className="text-3xl font-extrabold text-zumi" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {greeting}, <span className="gradient-brand-text">{name}</span> 👋
            </h2>
            <p className="text-zumi-muted mt-1">
              {profile?.streak && profile.streak > 0
                ? `You're on a ${profile.streak}-day streak! Keep it going! 🔥`
                : "Start a streak by completing a study session today!"}
            </p>
          </div>
          <Link href="/study-studio">
            <Button size="lg" className="hidden sm:flex">
              <Plus size={16} />
              Upload Notes
            </Button>
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total XP"
            value={formatNumber(profile?.xp ?? 0)}
            icon={<Zap size={18} className="text-zumi-pink" />}
            color="bg-gradient-to-br from-pink-500 to-pink-600"
            sublabel={`Level ${xp.level}`}
          />
          <StatCard
            label="Day Streak"
            value={`${profile?.streak ?? 0}`}
            icon={<Flame size={18} className="text-orange-400" />}
            color="bg-gradient-to-br from-orange-500 to-red-500"
            sublabel="days in a row"
          />
          <StatCard
            label="Coins"
            value={formatNumber(profile?.coins ?? 0)}
            icon={<Trophy size={18} className="text-yellow-400" />}
            color="bg-gradient-to-br from-yellow-500 to-amber-500"
          />
          <StatCard
            label="Lives"
            value={`${profile?.lives ?? 10}/10`}
            icon={<Star size={18} className="text-red-400" />}
            color="bg-gradient-to-br from-red-500 to-rose-500"
            sublabel="+2 per 5 correct"
          />
        </div>

        {/* XP Progress bar */}
        <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-zumi-pink" />
              <span className="font-semibold text-zumi">Level {xp.level} Progress</span>
            </div>
            <span className="text-sm text-zumi-muted">{xp.percent}%</span>
          </div>
          <div className="h-3 bg-zumi-surface-2 rounded-full overflow-hidden border border-zumi">
            <div
              className="h-full xp-bar-fill rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${xp.percent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-zumi-muted">
            <span>{formatNumber(xp.current)} / {formatNumber(xp.needed)} XP</span>
            <span>→ Level {xp.level + 1}</span>
          </div>
        </Card>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col: streak + quick actions */}
          <div className="space-y-6">
            {/* Streak calendar */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame size={18} className="text-orange-400" />
                  <span className="font-semibold text-zumi">{profile?.streak ?? 0} Day Streak</span>
                </div>
                <Badge variant="gold">🔥 Active</Badge>
              </div>
              <StreakCalendar streak={profile?.streak ?? 0} />
            </Card>

            {/* Quick actions */}
            <Card>
              <h3 className="font-semibold text-zumi mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <Link key={action.href} href={action.href}>
                    <div className={`p-3 rounded-xl border bg-gradient-to-br ${action.color} hover:scale-[1.03] transition-all duration-200 cursor-pointer`}>
                      <div className="text-2xl mb-1">{action.icon}</div>
                      <p className="text-xs font-medium text-zumi">{action.label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          {/* Middle col: Recent decks */}
          <div className="space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-400" />
                  <span className="font-semibold text-zumi">Study Decks</span>
                </div>
                <Link href="/study-studio" className="text-xs text-zumi-pink hover:underline flex items-center gap-1">
                  View all <ArrowRight size={12} />
                </Link>
              </div>

              {recentDecks.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <div className="text-4xl">📚</div>
                  <p className="text-sm text-zumi-muted">No study decks yet.</p>
                  <Link href="/study-studio">
                    <Button size="sm" fullWidth>
                      <Plus size={14} />
                      Create your first deck
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentDecks.map((deck, i) => (
                    <Link key={deck.id} href={`/study-studio/decks/${deck.id}`}>
                      <div
                        className="flex items-center justify-between p-3 rounded-xl bg-zumi-surface-2 border border-zumi hover:border-zumi-2 hover:bg-zumi-surface-3 transition-all duration-200 cursor-pointer animate-slide-up"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center">
                            <BookOpen size={16} className="text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zumi truncate max-w-32">{deck.title}</p>
                            <p className="text-xs text-zumi-muted">{deck.card_count} cards</p>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-zumi-muted" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            {/* Games CTA */}
            <Link href="/games">
              <Card className="relative overflow-hidden card-hover cursor-pointer group" style={{ background: "linear-gradient(135deg, #1a0a2e 0%, #12061a 100%)" }}>
                <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 70% 50%, #FF5F7E, transparent)" }} />
                <div className="relative z-10">
                  <Gamepad2 size={28} className="text-pink-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-white text-lg mb-1">Game Arena</h3>
                  <p className="text-gray-400 text-sm">9 educational games waiting for you</p>
                  <div className="mt-3 flex items-center gap-1 text-pink-400 text-sm font-medium group-hover:gap-2 transition-all">
                    Play now <ArrowRight size={14} />
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          {/* Right col: Leaderboard preview + achievements */}
          <div className="space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-400" />
                  <span className="font-semibold text-zumi">Achievements</span>
                </div>
                <Badge variant="gold">{achievements.length}</Badge>
              </div>

              {achievements.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <div className="text-4xl">🏅</div>
                  <p className="text-sm text-zumi-muted">Complete activities to earn achievements!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {achievements.map((a, i) => {
                    const meta = ACHIEVEMENT_META[a.achievement_type] ?? { label: a.achievement_type, emoji: "⭐" };
                    return (
                      <div
                        key={a.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-zumi-surface-2 border border-zumi animate-slide-in-right"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <span className="text-2xl">{meta.emoji}</span>
                        <div>
                          <p className="text-sm font-medium text-zumi">{meta.label}</p>
                          <p className="text-xs text-zumi-muted">
                            {new Date(a.unlocked_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Friends CTA */}
            <Link href="/friends">
              <Card className="card-hover cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30">
                    <Users size={22} className="text-purple-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zumi">Find Friends</h3>
                    <p className="text-sm text-zumi-muted mt-0.5">Challenge friends and study together</p>
                    <div className="mt-2 text-xs text-purple-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Explore <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>

            {/* Referral card */}
            <ReferralCard />
          </div>
        </div>
      </div>
    </>
  );
}
