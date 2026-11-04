"use client";

import { useState, useEffect } from "react";
import { Link2, Copy, Check, Gift } from "lucide-react";

export function ReferralCard() {
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referral")
      .then((r) => r.json())
      .then((d) => { if (d.link) setLink(d.link); })
      .catch(() => {});
  }, []);

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 border border-pink-500/20"
      style={{ background: "linear-gradient(135deg, rgba(255,95,126,0.1) 0%, rgba(123,94,167,0.08) 100%)" }}>
      <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(ellipse at top right, rgba(255,95,126,0.5) 0%, transparent 60%)" }} />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Gift size={18} className="text-pink-400" />
          <span className="font-semibold text-zumi text-sm">Refer a Friend</span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/30 font-semibold">+100 XP each</span>
        </div>
        <p className="text-xs text-zumi-muted mb-3">
          Share your link — both you and your friend get <strong className="text-zumi">100 XP</strong> when they join and complete onboarding!
        </p>
        {link ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-lg bg-zumi-surface border border-zumi text-xs text-zumi-muted font-mono truncate">
              {link}
            </div>
            <button
              onClick={copy}
              className={`shrink-0 p-2 rounded-lg border transition-all ${copied ? "border-green-500 bg-green-500/15 text-green-400" : "border-zumi bg-zumi-surface text-zumi-muted hover:border-pink-500 hover:text-pink-400"}`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        ) : (
          <div className="h-9 skeleton rounded-lg" />
        )}
      </div>
    </div>
  );
}
