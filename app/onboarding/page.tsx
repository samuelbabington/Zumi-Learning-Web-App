"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StepProfile } from "./steps/step-profile";
import { StepAvatar } from "./steps/step-avatar";
import { StepSchool } from "./steps/step-school";
import { StepInterests } from "./steps/step-interests";

export type OnboardingData = {
  fullName: string;
  username: string;
  avatarConfig: AvatarConfig;
  schoolId: string | null;
  interests: string[];
};

export type AvatarConfig = {
  gender: "male" | "female";
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  outfit: string;
  accessory: string;
};

const DEFAULT_AVATAR: AvatarConfig = {
  gender: "male",
  skinTone: "#F5CBA7",
  hairStyle: "short",
  hairColor: "#2C1810",
  outfit: "casual",
  accessory: "none",
};

const STEPS = ["profile", "avatar", "school", "interests"] as const;
type StepId = (typeof STEPS)[number];

const STEP_LABELS: Record<StepId, string> = {
  profile: "Profile",
  avatar: "Avatar",
  school: "School",
  interests: "Interests",
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [stepIdx, setStepIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    fullName: "",
    username: "",
    avatarConfig: DEFAULT_AVATAR,
    schoolId: null,
    interests: [],
  });

  // Pre-fill name/username from auth metadata
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setData((p) => ({
          ...p,
          fullName: user.user_metadata?.full_name ?? "",
          username: user.user_metadata?.username ?? "",
        }));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback((patch: Partial<OnboardingData>) => {
    setData((p) => ({ ...p, ...patch }));
  }, []);

  const next = () => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIdx((i) => Math.max(i - 1, 0));

  const finish = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("profiles").upsert({
        id: user.id,
        full_name: data.fullName,
        username: data.username,
        avatar_config: data.avatarConfig,
        school_id: data.schoolId,
        interests: data.interests,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      });

      if (data.schoolId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("school_memberships").upsert({
          user_id: user.id,
          school_id: data.schoolId,
          membership_status: "active",
        }, { onConflict: "user_id" });
      }

      // Complete referral if user was referred (awards 100 XP to both parties)
      const refCode = user.user_metadata?.ref_code as string | undefined;
      await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref_code: refCode }),
      });

      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  const currentStep = STEPS[stepIdx];

  return (
    <div className="min-h-screen bg-zumi-bg flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center">
            <span className="text-white font-bold text-lg">Z</span>
          </div>
          <span className="text-2xl font-bold text-zumi" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Zumi</span>
        </div>
        <h1 className="text-xl font-semibold text-zumi">Set up your profile</h1>
        <p className="text-sm text-zumi-muted mt-1">Just a few steps to get you started.</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
              i < stepIdx ? "gradient-brand text-white" :
              i === stepIdx ? "border-2 border-pink-500 text-zumi-pink" :
              "border border-zumi text-zumi-muted"
            }`}>
              {i < stepIdx ? "✓" : i + 1}
            </div>
            <span className={`text-sm hidden sm:block ${i === stepIdx ? "text-zumi font-medium" : "text-zumi-muted"}`}>
              {STEP_LABELS[s]}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 ${i < stepIdx ? "gradient-brand" : "bg-zumi-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="w-full max-w-lg animate-fade-in" key={currentStep}>
        {currentStep === "profile" && (
          <StepProfile data={data} update={update} onNext={next} />
        )}
        {currentStep === "avatar" && (
          <StepAvatar data={data} update={update} onNext={next} onBack={back} />
        )}
        {currentStep === "school" && (
          <StepSchool data={data} update={update} onNext={next} onBack={back} />
        )}
        {currentStep === "interests" && (
          <StepInterests data={data} update={update} onFinish={finish} onBack={back} saving={saving} />
        )}
      </div>
    </div>
  );
}
