"use client";

import { useState } from "react";
import { User, AtSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { OnboardingData } from "../page";
import { createClient } from "@/lib/supabase/client";

interface Props {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function StepProfile({ data, update, onNext }: Props) {
  const supabase = createClient();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState(false);

  const validate = async () => {
    const e: Record<string, string> = {};
    if (!data.fullName.trim()) e.fullName = "Full name is required.";
    if (!data.username.trim()) e.username = "Username is required.";
    if (data.username.length < 3) e.username = "At least 3 characters.";
    if (!/^[a-z0-9_]+$/.test(data.username)) e.username = "Only lowercase letters, numbers and underscores.";
    if (Object.keys(e).length) return e;

    setChecking(true);
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", data.username)
      .maybeSingle();
    setChecking(false);

    if (existing) e.username = "This username is taken. Try another.";
    return e;
  };

  const handleNext = async () => {
    const errs = await validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onNext();
  };

  return (
    <div className="card-base p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zumi mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Tell us about yourself
        </h2>
        <p className="text-sm text-zumi-muted">This is how other students will see you.</p>
      </div>

      <div className="space-y-4">
        <Input
          label="Full name"
          type="text"
          placeholder="Your full name"
          value={data.fullName}
          onChange={(e) => update({ fullName: e.target.value })}
          icon={<User size={16} />}
          error={errors.fullName}
        />
        <Input
          label="Username"
          type="text"
          placeholder="coolstudent123"
          value={data.username}
          onChange={(e) => update({ username: e.target.value.toLowerCase() })}
          icon={<AtSign size={16} />}
          error={errors.username}
          hint="Friends will find you by this username."
        />
      </div>

      <Button fullWidth size="lg" onClick={handleNext} loading={checking}>
        Continue
      </Button>
    </div>
  );
}
