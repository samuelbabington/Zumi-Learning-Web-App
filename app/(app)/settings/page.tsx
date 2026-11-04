import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/app/topnav";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();

  return (
    <>
      <TopNav profile={profile} pageTitle="Settings" />
      <div className="p-6 max-w-2xl mx-auto space-y-6">

        <div>
          <h2 className="text-3xl font-extrabold text-zumi" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Settings</h2>
          <p className="text-zumi-muted mt-1">Manage your account and preferences.</p>
        </div>

        {/* Appearance */}
        <div className="card-base p-5 space-y-4">
          <h3 className="font-semibold text-zumi">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zumi">Theme</p>
              <p className="text-xs text-zumi-muted">Choose your preferred colour scheme</p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Account */}
        <div className="card-base p-5 space-y-4">
          <h3 className="font-semibold text-zumi">Account</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-zumi">Email</p>
              <p className="text-xs text-zumi-muted">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card-base p-5 space-y-4">
          <h3 className="font-semibold text-zumi">Notifications</h3>
          {[
            { label: "Friend requests", desc: "When someone sends you a friend request" },
            { label: "Game challenges", desc: "When a friend challenges you" },
            { label: "Streak reminders", desc: "Daily reminder to maintain your streak" },
            { label: "Birthday notifications", desc: "When a friend has a birthday" },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zumi">{n.label}</p>
                <p className="text-xs text-zumi-muted">{n.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 bg-zumi-surface-3 border border-zumi rounded-full peer peer-checked:bg-pink-500 peer-checked:border-pink-500 transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
          ))}
        </div>

        {/* Danger zone */}
        <div className="card-base p-5 border-red-500/20 space-y-3">
          <h3 className="font-semibold text-red-400">Danger Zone</h3>
          <p className="text-sm text-zumi-muted">These actions are irreversible. Please be certain.</p>
          <button className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors">
            Delete account
          </button>
        </div>
      </div>
    </>
  );
}
