"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="animate-fade-in text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-pink-500/15 border border-pink-500/30 flex items-center justify-center">
            <span className="text-4xl">📧</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-zumi mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Reset link sent
        </h2>
        <p className="text-zumi-muted mb-6">
          Check <span className="text-zumi font-medium">{email}</span> for a password reset link.
          It may take a minute to arrive.
        </p>
        <Link href="/login">
          <Button variant="secondary" fullWidth>
            <ArrowLeft size={16} />
            Back to sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <Link href="/login" className="inline-flex items-center gap-2 text-sm text-zumi-muted hover:text-zumi mb-8 transition-colors">
        <ArrowLeft size={16} />
        Back to sign in
      </Link>

      <h2 className="text-2xl font-bold text-zumi mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Forgot your password?
      </h2>
      <p className="text-zumi-muted text-sm mb-8">
        Enter your email and we&apos;ll send you a reset link.
      </p>

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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={16} />}
          required
        />
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Send reset link
        </Button>
      </form>
    </div>
  );
}
