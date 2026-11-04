"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  };

  return (
    <div className="animate-slide-up">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center">
          <span className="text-white font-bold text-lg">Z</span>
        </div>
        <span className="text-2xl font-bold text-zumi" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Zumi</span>
      </div>

      <h2 className="text-2xl font-bold text-zumi mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Welcome back
      </h2>
      <p className="text-zumi-muted text-sm mb-8">Sign in to continue your learning journey.</p>

      {error && (
        <div className="mb-5 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          icon={<Mail size={16} />}
          required
          autoComplete="email"
        />

        <div>
          <Input
            label="Password"
            type={showPass ? "text" : "password"}
            placeholder="Your password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            icon={<Lock size={16} />}
            iconRight={
              <button type="button" onClick={() => setShowPass((p) => !p)} className="cursor-pointer">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            required
            autoComplete="current-password"
          />
          <div className="flex justify-between items-center mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm((p) => ({ ...p, remember: e.target.checked }))}
                className="w-4 h-4 rounded accent-pink-500"
              />
              <span className="text-xs text-zumi-muted">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-xs text-zumi-pink hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Sign in
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zumi" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-zumi-bg text-zumi-muted">or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className="w-full h-11 flex items-center justify-center gap-3 btn-secondary rounded-xl text-sm font-medium"
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.4 1.2 8.7 3.2l6.5-6.5C35 2.9 29.9 0 24 0 14.7 0 6.9 5.5 3.2 13.6l7.5 5.8C12.4 13.4 17.8 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.8-2.1 5.2-4.4 6.8l6.9 5.3c4-3.7 6.2-9.2 6.2-16.1z"/>
          <path fill="#FBBC05" d="M10.7 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.7-4.6l-7.5-5.8A24 24 0 0 0 0 24c0 3.9.9 7.5 2.5 10.8l8.2-6.2z"/>
          <path fill="#34A853" d="M24 48c6 0 11-2 14.7-5.4L31.8 37.3c-2 1.3-4.5 2.1-7.8 2.1-6.2 0-11.4-4.2-13.3-9.8l-8.2 6.3C6.9 42.5 14.7 48 24 48z"/>
        </svg>
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-zumi-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-zumi-pink font-medium hover:underline">
          Create one free
        </Link>
      </p>
    </div>
  );
}
