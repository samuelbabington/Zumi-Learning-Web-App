"use client";

import { useState } from "react";
import { Bell, Search, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { Profile } from "@/types/database";
import { cn } from "@/lib/utils";

interface Props {
  profile: Profile | null;
  pageTitle: string;
}

export function TopNav({ profile, pageTitle }: Props) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 border-b border-zumi bg-zumi-bg/80 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-zumi">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search pill */}
        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zumi bg-zumi-surface-2 text-zumi-muted text-sm hover:border-zumi-2 transition-colors">
          <Search size={14} />
          <span>Search…</span>
          <kbd className="text-xs border border-zumi rounded px-1 ml-1 opacity-60">⌘K</kbd>
        </button>

        <ThemeToggle compact />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((p) => !p)}
            className={cn(
              "relative p-2 rounded-xl transition-all",
              notifOpen ? "bg-pink-500/15 text-zumi-pink" : "btn-secondary"
            )}
          >
            <Bell size={18} />
            {/* Unread dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-zumi-pink animate-pulse-pink" />
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 card-base shadow-surface-md z-20 overflow-hidden animate-slide-up">
                <div className="flex items-center justify-between px-4 py-3 border-b border-zumi">
                  <span className="font-semibold text-sm text-zumi">Notifications</span>
                  <button onClick={() => setNotifOpen(false)}>
                    <X size={14} className="text-zumi-muted" />
                  </button>
                </div>
                <div className="p-4 text-center text-sm text-zumi-muted py-10">
                  <div className="text-3xl mb-2">🔔</div>
                  No new notifications
                </div>
              </div>
            </>
          )}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold shadow-pink-sm">
          {(profile?.username || profile?.full_name || "?")[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}
