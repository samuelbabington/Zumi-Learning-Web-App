"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User, AtSign, Gift } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = "account" | "verify";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const refCode = searchParams.get("ref");

  const [step, setStep] = useState<Step>("account");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    if (!form.username.trim()) e.username = "Username is required.";
    if (form.username.length < 3) e.username = "Username must be at least 3 characters.";
    if (!/^[a-z0-9_]+$/.test(form.username)) e.username = "Only lowercase letters, numbers, and underscores.";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    if (!form.agreeTerms) e.terms = "You must agree to the terms.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      // Check username availability
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", form.username)
        .maybeSingle() as { data: { id: string } | null };
      if (existing) { setErrors({ username: "This username is already taken." }); return; }

      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.fullName, username: form.username, ref_code: refCode ?? undefined },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) throw error;
      setStep("verify");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <div className="animate-fade-in text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
            <span className="text-4xl">📬</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-zumi mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Check your email
        </h2>
        <p className="text-zumi-muted mb-6">
          We sent a verification link to <span className="text-zumi font-medium">{form.email}</span>.
          Click it to activate your account and start learning!
        </p>
        <Button variant="secondary" fullWidth onClick={() => router.push("/login")}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center">
          <span className="text-white font-bold text-lg">Z</span>
        </div>
        <span className="text-2xl font-bold text-zumi" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Zumi</span>
      </div>

      <h2 className="text-2xl font-bold text-zumi mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Create your account
      </h2>
      <p className="text-zumi-muted text-sm mb-8">Join thousands of students already learning on Zumi.</p>

      {/* Referral bonus banner */}
      {refCode && (
        <div className="mb-5 p-4 rounded-xl border border-pink-500/30 bg-pink-500/10 flex items-center gap-3">
          <Gift size={20} className="text-pink-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-zumi">You were referred! 🎁</p>
            <p className="text-xs text-zumi-muted mt-0.5">Complete sign-up and you&apos;ll both earn <strong className="text-pink-400">100 XP</strong>.</p>
          </div>
        </div>
      )}

      {errors.form && (
        <div className="mb-5 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          type="text"
          placeholder="Your full name"
          value={form.fullName}
          onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
          icon={<User size={16} />}
          error={errors.fullName}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          icon={<Mail size={16} />}
          error={errors.email}
        />

        <Input
          label="Username"
          type="text"
          placeholder="coolstudent123"
          value={form.username}
          onChange={(e) => setForm((p) => ({ ...p, username: e.target.value.toLowerCase() }))}
          icon={<AtSign size={16} />}
          error={errors.username}
          hint="Lowercase letters, numbers, underscores only."
        />

        <Input
          label="Password"
          type={showPass ? "text" : "password"}
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          icon={<Lock size={16} />}
          iconRight={
            <button type="button" onClick={() => setShowPass((p) => !p)} className="cursor-pointer">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.password}
        />

        <Input
          label="Confirm password"
          type={showPass ? "text" : "password"}
          placeholder="Repeat your password"
          value={form.confirmPassword}
          onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
          icon={<Lock size={16} />}
          error={errors.confirmPassword}
        />

        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agreeTerms}
              onChange={(e) => setForm((p) => ({ ...p, agreeTerms: e.target.checked }))}
              className="mt-0.5 w-4 h-4 rounded accent-pink-500"
            />
            <span className="text-sm text-zumi-muted">
              I agree to Zumi&apos;s{" "}
              <Link href="/terms" className="text-zumi-pink hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-zumi-pink hover:underline">Privacy Policy</Link>.
            </span>
          </label>
          {errors.terms && <p className="text-xs text-red-400 mt-1">{errors.terms}</p>}
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zumi-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-zumi-pink font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
