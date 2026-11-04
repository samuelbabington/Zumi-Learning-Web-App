import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

// GET /api/referral — returns current user's referral code (generating it if needed)
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code, username")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  let code = (profile as { referral_code: string | null; username: string | null }).referral_code;
  const username = (profile as { referral_code: string | null; username: string | null }).username;
  if (!code) {
    // Generate and store a referral code
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: generated } = await (supabase as any).rpc("generate_referral_code", {
      p_user_id: user.id,
      p_username: username,
    });
    code = generated as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update({ referral_code: code }).eq("id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return NextResponse.json({
    code,
    link: `${appUrl}/register?ref=${code}`,
  });
}

// POST /api/referral/complete — called after onboarding finishes
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const refCode = body.ref_code as string | undefined;

  if (refCode) {
    // Find the referrer
    const { data: referrerProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("referral_code", refCode.toUpperCase())
      .maybeSingle() as { data: { id: string } | null };

    if (referrerProfile && referrerProfile.id !== user.id) {
      // Record the referral
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("referrals").upsert({
        referrer_id: referrerProfile.id,
        referred_id: user.id,
        referral_code: refCode.toUpperCase(),
        status: "pending",
      }, { onConflict: "referred_id" });
    }
  }

  // Complete any pending referral (triggers XP award)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).rpc("complete_referral", { p_referred_id: user.id });

  return NextResponse.json({ ok: true });
}
