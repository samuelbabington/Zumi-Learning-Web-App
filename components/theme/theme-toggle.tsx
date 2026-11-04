"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light" | "system";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("zumi-theme") as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  const apply = (t: Theme) => {
    setTheme(t);
    localStorage.setItem("zumi-theme", t);
    const resolved = t === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : t;
    document.documentElement.setAttribute("data-theme", resolved);
  };

  if (compact) {
    const next: Theme = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
    const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
    return (
      <button
        onClick={() => apply(next)}
        className="p-2 rounded-lg btn-secondary transition-all"
        title={`Theme: ${theme}`}
      >
        <Icon size={16} className="text-zumi-2" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-zumi-surface-2 border border-zumi">
      {(["dark", "light", "system"] as Theme[]).map((t) => {
        const Icon = t === "dark" ? Moon : t === "light" ? Sun : Monitor;
        return (
          <button
            key={t}
            onClick={() => apply(t)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              theme === t
                ? "bg-zumi-surface text-zumi-pink border border-zumi-2 shadow-sm"
                : "text-zumi-muted hover:text-zumi-2"
            )}
          >
            <Icon size={14} />
            <span className="capitalize">{t}</span>
          </button>
        );
      })}
    </div>
  );
}
