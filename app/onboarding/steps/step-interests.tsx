"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OnboardingData } from "../page";

interface Props {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  onFinish: () => void;
  onBack: () => void;
  saving: boolean;
}

const INTERESTS = [
  { id: "mathematics", label: "Mathematics", emoji: "📐" },
  { id: "science", label: "Science", emoji: "🔬" },
  { id: "biology", label: "Biology", emoji: "🧬" },
  { id: "chemistry", label: "Chemistry", emoji: "⚗️" },
  { id: "physics", label: "Physics", emoji: "⚛️" },
  { id: "computer_science", label: "Computer Science", emoji: "💻" },
  { id: "history", label: "History", emoji: "🏛️" },
  { id: "geography", label: "Geography", emoji: "🗺️" },
  { id: "economics", label: "Economics", emoji: "📈" },
  { id: "business", label: "Business", emoji: "💼" },
  { id: "english", label: "English", emoji: "📖" },
  { id: "languages", label: "Languages", emoji: "🌍" },
  { id: "arts", label: "Arts", emoji: "🎨" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "philosophy", label: "Philosophy", emoji: "🤔" },
  { id: "psychology", label: "Psychology", emoji: "🧠" },
  { id: "medicine", label: "Medicine", emoji: "🏥" },
  { id: "law", label: "Law", emoji: "⚖️" },
  { id: "engineering", label: "Engineering", emoji: "⚙️" },
  { id: "architecture", label: "Architecture", emoji: "🏗️" },
];

export function StepInterests({ data, update, onFinish, onBack, saving }: Props) {
  const toggle = (id: string) => {
    const current = data.interests;
    const next = current.includes(id)
      ? current.filter((i) => i !== id)
      : [...current, id];
    update({ interests: next });
  };

  return (
    <div className="card-base p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zumi mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          What do you study?
        </h2>
        <p className="text-sm text-zumi-muted">
          Pick your subjects and Zumi will tailor your experience.
        </p>
        {data.interests.length > 0 && (
          <p className="text-xs text-zumi-pink mt-1 font-medium">
            {data.interests.length} selected
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {INTERESTS.map((interest, i) => {
          const active = data.interests.includes(interest.id);
          return (
            <button
              key={interest.id}
              onClick={() => toggle(interest.id)}
              style={{ animationDelay: `${i * 30}ms` }}
              className={cn(
                "relative flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 animate-fade-in",
                active
                  ? "border-pink-500 bg-gradient-to-br from-pink-500/20 to-pink-600/10 text-zumi shadow-pink-sm scale-[1.02]"
                  : "border-zumi bg-zumi-surface-2 text-zumi-2 hover:border-zumi-2 hover:bg-zumi-surface-3 hover:scale-[1.01]"
              )}
            >
              <span className="text-lg">{interest.emoji}</span>
              <span className="truncate">{interest.label}</span>
              {active && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full gradient-brand flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button
          onClick={onFinish}
          className="flex-1"
          loading={saving}
          disabled={data.interests.length === 0}
        >
          {data.interests.length === 0 ? "Select at least 1" : "Start learning 🚀"}
        </Button>
      </div>
    </div>
  );
}
