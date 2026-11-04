import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/app/topnav";
import Link from "next/link";

const GAMES = [
  {
    id: "quick-quiz",
    title: "Quick Quiz",
    description: "Multiple-choice questions with instant feedback. Race against the clock!",
    emoji: "⚡",
    color: "from-pink-500/20 to-pink-900/40",
    border: "border-pink-500/30",
    glow: "rgba(255,95,126,0.3)",
    tags: ["Solo", "Timed"],
    xp: "10–50 XP",
  },
  {
    id: "match-up",
    title: "Match Up",
    description: "Match terms with definitions. Flip cards and find pairs!",
    emoji: "🃏",
    color: "from-blue-500/20 to-blue-900/40",
    border: "border-blue-500/30",
    glow: "rgba(76,201,240,0.3)",
    tags: ["Solo", "Memory"],
    xp: "5–30 XP",
  },
  {
    id: "fill-the-gap",
    title: "Fill the Gap",
    description: "Complete the sentence. Test your recall on key concepts.",
    emoji: "✍️",
    color: "from-purple-500/20 to-purple-900/40",
    border: "border-purple-500/30",
    glow: "rgba(123,94,167,0.3)",
    tags: ["Solo", "Writing"],
    xp: "5–25 XP",
  },
  {
    id: "true-or-false",
    title: "True or False",
    description: "Evaluate statements and explain your reasoning.",
    emoji: "🤔",
    color: "from-green-500/20 to-green-900/40",
    border: "border-green-500/30",
    glow: "rgba(6,214,160,0.3)",
    tags: ["Solo", "Quick"],
    xp: "5–20 XP",
  },
  {
    id: "speed-sprint",
    title: "Speed Sprint",
    description: "High-speed revision challenge. Build combos for bonus XP!",
    emoji: "🏃",
    color: "from-orange-500/20 to-orange-900/40",
    border: "border-orange-500/30",
    glow: "rgba(255,154,92,0.3)",
    tags: ["Solo", "Combo"],
    xp: "10–80 XP",
  },
  {
    id: "boss-battle",
    title: "Boss Battle",
    description: "Face the subject boss in multi-round academic combat!",
    emoji: "⚔️",
    color: "from-red-500/20 to-red-900/40",
    border: "border-red-500/30",
    glow: "rgba(239,68,68,0.3)",
    tags: ["Solo", "Epic"],
    xp: "30–150 XP",
    featured: true,
  },
  {
    id: "daily-challenge",
    title: "Daily Challenge",
    description: "Fresh questions every day. Complete it to protect your streak.",
    emoji: "🎯",
    color: "from-yellow-500/20 to-yellow-900/40",
    border: "border-yellow-500/30",
    glow: "rgba(255,209,102,0.3)",
    tags: ["Daily", "Streak"],
    xp: "20–60 XP",
  },
  {
    id: "tag-team",
    title: "Tag Team",
    description: "Live 2v2 or team quiz battles. Real-time multiplayer!",
    emoji: "🤝",
    color: "from-indigo-500/20 to-indigo-900/40",
    border: "border-indigo-500/30",
    glow: "rgba(99,102,241,0.3)",
    tags: ["Multiplayer", "Teams"],
    xp: "20–100 XP",
  },
  {
    id: "imposter-mode",
    title: "Imposter Mode",
    description: "Social deduction meets education. Find the imposter!",
    emoji: "🕵️",
    color: "from-teal-500/20 to-teal-900/40",
    border: "border-teal-500/30",
    glow: "rgba(20,184,166,0.3)",
    tags: ["Multiplayer", "Social"],
    xp: "15–75 XP",
  },
];

export default async function GamesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();

  const featured = GAMES.find((g) => g.featured);
  const rest = GAMES.filter((g) => !g.featured);

  return (
    <>
      <TopNav profile={profile} pageTitle="Game Arena" />
      <div className="p-6 max-w-7xl mx-auto space-y-8">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl p-8 dot-grid" style={{ background: "linear-gradient(135deg, #0A0A14 0%, #12061A 100%)", border: "1px solid rgba(255,95,126,0.2)" }}>
          <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(255,95,126,0.3) 0%, transparent 60%)" }} />
          <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: "rgba(255,95,126,0.15)", border: "1px solid rgba(255,95,126,0.3)", color: "#FF5F7E" }}>
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              9 Games Available
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Level up your<br/>
              <span style={{ background: "linear-gradient(90deg, #FF5F7E, #FF9A5C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>knowledge.</span>
            </h2>
            <p className="text-gray-400 mb-6">Play games generated from your own study materials. Earn XP, beat your streak, challenge friends.</p>
            <Link href="/games/daily-challenge">
              <button className="btn-primary px-6 py-3 text-sm rounded-xl">
                🎯 Today&apos;s Daily Challenge
              </button>
            </Link>
          </div>
          <div className="absolute right-8 bottom-0 text-9xl opacity-20 select-none" style={{ transform: "rotate(-10deg)" }}>🎮</div>
        </div>

        {/* Featured Boss Battle */}
        {featured && (
          <div>
            <h3 className="text-sm font-semibold text-zumi-muted uppercase tracking-wide mb-3">⭐ Featured</h3>
            <Link href={`/games/${featured.id}`}>
              <div className={`game-card relative p-6 rounded-2xl border ${featured.border} bg-gradient-to-br ${featured.color} cursor-pointer`}
                style={{ boxShadow: `0 0 0 1px ${featured.border}` }}>
                <div className="absolute inset-0 rounded-2xl" style={{ background: `radial-gradient(ellipse at 20% 50%, ${featured.glow} 0%, transparent 60%)` }} />
                <div className="relative z-10 flex items-center gap-6">
                  <div className="text-6xl">{featured.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-zumi">{featured.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(255,95,126,0.2)", color: "#FF5F7E", border: "1px solid rgba(255,95,126,0.4)" }}>EPIC</span>
                    </div>
                    <p className="text-zumi-muted mb-3">{featured.description}</p>
                    <div className="flex items-center gap-2">
                      {featured.tags.map((t) => (
                        <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-medium border border-zumi bg-zumi-surface-2 text-zumi-2">{t}</span>
                      ))}
                      <span className="ml-auto text-xs font-bold text-yellow-400">+{featured.xp}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl" style={{ background: "rgba(255,95,126,0.15)", border: "1px solid rgba(255,95,126,0.3)" }}>
                    <span className="text-pink-400 font-bold text-2xl">▶</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* All games grid */}
        <div>
          <h3 className="text-sm font-semibold text-zumi-muted uppercase tracking-wide mb-3">All Games</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rest.map((game, i) => (
              <Link key={game.id} href={`/games/${game.id}`}>
                <div
                  className={`game-card relative p-5 rounded-2xl border ${game.border} bg-gradient-to-br ${game.color} h-full cursor-pointer animate-fade-in`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${game.glow} 0%, transparent 70%)`, transform: "translate(30%, -30%)" }} />
                  <div className="relative z-10">
                    <div className="text-4xl mb-3">{game.emoji}</div>
                    <h3 className="font-bold text-zumi mb-1">{game.title}</h3>
                    <p className="text-xs text-zumi-muted mb-3 leading-relaxed">{game.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {game.tags.slice(0,1).map((t) => (
                          <span key={t} className="text-xs px-2 py-0.5 rounded-md border border-zumi bg-zumi-surface text-zumi-muted">{t}</span>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-yellow-400">{game.xp}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
