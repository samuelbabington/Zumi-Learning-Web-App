"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OnboardingData, AvatarConfig } from "../page";

interface Props {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SKIN_TONES = ["#FDDBB4","#F5CBA7","#E59866","#CA8137","#A0522D","#6B3A2A"];
const HAIR_STYLES_M = [
  { id: "short", label: "Short" },
  { id: "curly", label: "Curly" },
  { id: "fade", label: "Fade" },
  { id: "locs", label: "Locs" },
];
const HAIR_STYLES_F = [
  { id: "long", label: "Long" },
  { id: "ponytail", label: "Ponytail" },
  { id: "braids", label: "Braids" },
  { id: "afro", label: "Afro" },
];
const HAIR_COLORS = ["#2C1810","#4A2C17","#8B4513","#C4A882","#F5DEB3","#E83535","#3B82F6","#7C3AED","#059669"];
const OUTFITS_M = [
  { id: "casual", label: "Casual", emoji: "👕" },
  { id: "hoodie", label: "Hoodie", emoji: "🧥" },
  { id: "school", label: "School", emoji: "🎒" },
  { id: "sporty", label: "Sporty", emoji: "🏅" },
];
const OUTFITS_F = [
  { id: "casual", label: "Casual", emoji: "👚" },
  { id: "hoodie", label: "Hoodie", emoji: "🧥" },
  { id: "school", label: "School", emoji: "🎒" },
  { id: "sporty", label: "Sporty", emoji: "🏅" },
];
const ACCESSORIES = [
  { id: "none", label: "None", emoji: "—" },
  { id: "glasses", label: "Glasses", emoji: "👓" },
  { id: "headphones", label: "Headphones", emoji: "🎧" },
  { id: "cap", label: "Cap", emoji: "🧢" },
  { id: "crown", label: "Crown", emoji: "👑" },
];

function AvatarPreview({ config }: { config: AvatarConfig }) {
  const isFemale = config.gender === "female";
  return (
    <div className="relative w-32 h-32 rounded-full gradient-brand flex items-center justify-center shadow-pink-md mx-auto">
      <div className="text-6xl select-none" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
        {isFemale ? "👩" : "🧑"}
      </div>
      {config.accessory === "headphones" && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl">🎧</span>
      )}
      {config.accessory === "crown" && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">👑</span>
      )}
      {config.accessory === "cap" && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl">🧢</span>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-zumi-muted uppercase tracking-wide mb-2">{title}</p>
      {children}
    </div>
  );
}

export function StepAvatar({ data, update, onNext, onBack }: Props) {
  const cfg = data.avatarConfig;
  const patch = (p: Partial<AvatarConfig>) => update({ avatarConfig: { ...cfg, ...p } });
  const hairStyles = cfg.gender === "female" ? HAIR_STYLES_F : HAIR_STYLES_M;
  const outfits = cfg.gender === "female" ? OUTFITS_F : OUTFITS_M;

  return (
    <div className="card-base p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zumi mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Create your avatar
        </h2>
        <p className="text-sm text-zumi-muted">Your character appears in games and on your profile.</p>
      </div>

      <AvatarPreview config={cfg} />

      <Section title="Gender">
        <div className="grid grid-cols-2 gap-2">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              onClick={() => patch({ gender: g, hairStyle: g === "female" ? "long" : "short" })}
              className={cn(
                "py-2 rounded-xl text-sm font-medium border transition-all",
                cfg.gender === g
                  ? "border-pink-500 bg-pink-500/15 text-zumi-pink"
                  : "border-zumi bg-zumi-surface-2 text-zumi-2 hover:border-zumi-2"
              )}
            >
              {g === "male" ? "👦 Boy" : "👧 Girl"}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Skin Tone">
        <div className="flex gap-2 flex-wrap">
          {SKIN_TONES.map((tone) => (
            <button
              key={tone}
              onClick={() => patch({ skinTone: tone })}
              style={{ backgroundColor: tone }}
              className={cn(
                "w-9 h-9 rounded-full border-2 transition-all",
                cfg.skinTone === tone ? "border-white scale-110 shadow-pink-sm" : "border-transparent hover:scale-105"
              )}
            />
          ))}
        </div>
      </Section>

      <Section title="Hair Style">
        <div className="grid grid-cols-4 gap-2">
          {hairStyles.map((h) => (
            <button
              key={h.id}
              onClick={() => patch({ hairStyle: h.id })}
              className={cn(
                "py-2 rounded-lg text-xs font-medium border transition-all",
                cfg.hairStyle === h.id
                  ? "border-pink-500 bg-pink-500/15 text-zumi-pink"
                  : "border-zumi bg-zumi-surface-2 text-zumi-2 hover:border-zumi-2"
              )}
            >
              {h.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Hair Color">
        <div className="flex gap-2 flex-wrap">
          {HAIR_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => patch({ hairColor: color })}
              style={{ backgroundColor: color }}
              className={cn(
                "w-7 h-7 rounded-full border-2 transition-all",
                cfg.hairColor === color ? "border-white scale-110" : "border-transparent hover:scale-105"
              )}
            />
          ))}
        </div>
      </Section>

      <Section title="Outfit">
        <div className="grid grid-cols-4 gap-2">
          {outfits.map((o) => (
            <button
              key={o.id}
              onClick={() => patch({ outfit: o.id })}
              className={cn(
                "py-2 rounded-lg text-center border transition-all",
                cfg.outfit === o.id
                  ? "border-pink-500 bg-pink-500/15"
                  : "border-zumi bg-zumi-surface-2 hover:border-zumi-2"
              )}
            >
              <div className="text-xl">{o.emoji}</div>
              <div className="text-xs text-zumi-muted mt-0.5">{o.label}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Accessory">
        <div className="flex gap-2 flex-wrap">
          {ACCESSORIES.map((a) => (
            <button
              key={a.id}
              onClick={() => patch({ accessory: a.id })}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm border flex items-center gap-1.5 transition-all",
                cfg.accessory === a.id
                  ? "border-pink-500 bg-pink-500/15 text-zumi-pink"
                  : "border-zumi bg-zumi-surface-2 text-zumi-2 hover:border-zumi-2"
              )}
            >
              <span>{a.emoji}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </Section>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onNext} className="flex-1">Continue</Button>
      </div>
    </div>
  );
}
