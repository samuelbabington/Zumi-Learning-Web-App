import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/app/topnav";
import { Users, UserPlus, Search } from "lucide-react";

export default async function FriendsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();

  return (
    <>
      <TopNav profile={profile} pageTitle="Friends" />
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-zumi" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Friends</h2>
            <p className="text-zumi-muted mt-1">Connect with students, challenge each other, and study together.</p>
          </div>
          <button className="btn-primary px-4 py-2.5 text-sm rounded-xl flex items-center gap-2">
            <UserPlus size={15} />
            Add Friend
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zumi-muted" />
          <input className="input-base w-full pl-10 pr-4 py-3 text-sm" placeholder="Search by username…" />
        </div>

        {/* Empty state */}
        <div className="card-base p-16 text-center space-y-4">
          <div className="relative inline-block">
            <div className="text-7xl animate-float">👥</div>
          </div>
          <h3 className="text-xl font-bold text-zumi">Find your study crew</h3>
          <p className="text-zumi-muted max-w-sm mx-auto">
            Search for friends by username, challenge them to games, and compete on the school leaderboard together.
          </p>
          <button className="btn-primary px-6 py-2.5 text-sm rounded-xl mx-auto flex items-center gap-2">
            <Users size={15} />
            Browse community
          </button>
        </div>
      </div>
    </>
  );
}
