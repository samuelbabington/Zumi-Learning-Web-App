"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, BookOpen, Gamepad2, Users, Trophy,
  User, Settings, Zap, ChevronLeft, ChevronRight, LogOut,
  Bell, Flame, Star
} from "lucide-react";
import { cn, formatNumber, xpProgress } from "@/lib/utils";
import type { Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/study-studio", label: "AI Study Studio", icon: BookOpen },
  { href: "/games", label: "Game Arena", icon: Gamepad2 },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

const BOTTOM_ITEMS = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface Props {
  profile: Profile | null;
}

export function Sidebar({ profile }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [collapsed, setCollapsed] = useState(false);

  const xp = xpProgress(profile?.xp ?? 0);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r border-zumi transition-all duration-300 ease-in-out shrink-0",
        "bg-zumi-surface",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-zumi transition-all duration-300 overflow-hidden",
        collapsed ? "px-3 py-4 justify-center" : "px-5 py-4 gap-3"
      )}>
        <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shrink-0 shadow-pink-sm">
          <span className="text-white font-bold text-lg">Z</span>
        </div>
        {!collapsed && (
          <span className="text-xl font-bold text-zumi transition-opacity duration-200" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Zumi
          </span>
        )}
      </div>

      {/* XP Card */}
      {!collapsed && profile && (
        <div className="mx-3 mt-4 p-3 rounded-xl border border-zumi-border bg-zumi-surface-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-xs font-bold text-white">
              {xp.level}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zumi truncate">{profile.username || profile.full_name || "Student"}</p>
              <p className="text-xs text-zumi-muted">Level {xp.level}</p>
            </div>
            <div className="flex items-center gap-1">
              <Flame size={12} className="text-orange-400" />
              <span className="text-xs font-bold text-zumi">{profile.streak}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zumi-muted">
              <span className="flex items-center gap-1"><Zap size={10} className="text-zumi-pink" />{formatNumber(xp.current)} XP</span>
              <span>{formatNumber(xp.needed)} XP needed</span>
            </div>
            <div className="h-1.5 bg-zumi-surface-3 rounded-full overflow-hidden">
              <div
                className="h-full xp-bar-fill rounded-full transition-all duration-700"
                style={{ width: `${xp.percent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "sidebar-link",
                active && "active",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-zumi-pink" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Lives indicator */}
      {!collapsed && profile && (
        <div className="mx-3 mb-3 p-3 rounded-xl border border-zumi bg-zumi-surface-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-red-400" />
            <span className="text-xs text-zumi-muted">Lives</span>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  i < (profile.lives ?? 10) ? "bg-red-400 shadow-sm" : "bg-zumi-surface-3"
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div className="border-t border-zumi py-3 px-2 space-y-1">
        {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn("sidebar-link", active && "active", collapsed && "justify-center px-2")}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
        <button
          onClick={handleSignOut}
          className={cn("sidebar-link w-full text-left hover:text-red-400 hover:bg-red-500/10", collapsed && "justify-center px-2")}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-zumi-surface border border-zumi flex items-center justify-center hover:border-pink-500 hover:text-pink-400 transition-all shadow-surface-sm z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
