import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getBearerToken(req: Request): string | null {
  const raw = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!raw) return null;
  if (!raw.toLowerCase().startsWith("bearer ")) return null;
  const token = raw.slice("bearer ".length).trim();
  return token.length > 0 ? token : null;
}

function getEnv(name: string): string | null {
  try {
    return Deno.env.get(name) ?? null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed." });

  const token = getBearerToken(req);
  if (!token) return json(401, { error: "Missing Authorization header." });

  const supabaseUrl = getEnv("SUPABASE_URL");
  const supabaseAnonKey = getEnv("SUPABASE_ANON_KEY");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseAnonKey) {
    return json(500, { error: "Missing SUPABASE_URL or SUPABASE_ANON_KEY." });
  }
  if (!serviceRoleKey) {
    return json(500, { error: "Missing SUPABASE_SERVICE_ROLE_KEY." });
  }

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const referralCode =
    body && typeof body === "object" && "referralCode" in body
      ? (body as { referralCode?: unknown }).referralCode
      : null;
  if (typeof referralCode !== "string" || referralCode.trim().length === 0) {
    return json(400, { error: "Missing `referralCode`." });
  }

  const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: callerData, error: callerErr } = await anonClient.auth.getUser(token);
  if (callerErr || !callerData.user?.id) {
    return json(401, { error: "Invalid session." });
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const code = referralCode.trim();
  const { data: referrer, error: referrerErr } = await serviceClient
    .from("users")
    .select("id")
    .eq("referral_code", code)
    .maybeSingle();
  if (referrerErr) return json(500, { error: referrerErr.message });
  if (!referrer?.id) return json(404, { error: "Referral code not found." });
  if (referrer.id === callerData.user.id) return json(400, { error: "Cannot refer yourself." });

  const { data: selfRow, error: selfErr } = await serviceClient
    .from("users")
    .select("referred_by")
    .eq("id", callerData.user.id)
    .maybeSingle();
  if (selfErr) return json(500, { error: selfErr.message });

  if (selfRow?.referred_by) {
    return json(200, { data: { attached: false, reason: "already_attached" } });
  }

  const { error: updateErr } = await serviceClient
    .from("users")
    .update({ referred_by: referrer.id })
    .eq("id", callerData.user.id);
  if (updateErr) return json(500, { error: updateErr.message });

  const { data: existingReferral, error: existingErr } = await serviceClient
    .from("referrals")
    .select("id")
    .eq("upline_id", referrer.id)
    .eq("downline_id", callerData.user.id)
    .eq("level", 1)
    .maybeSingle();
  if (existingErr) return json(500, { error: existingErr.message });

  if (!existingReferral?.id) {
    const { error: insertErr } = await serviceClient.from("referrals").insert({
      upline_id: referrer.id,
      downline_id: callerData.user.id,
      level: 1,
      commission_earned: 0,
    });
    if (insertErr) return json(500, { error: insertErr.message });
  }

  return json(200, { data: { attached: true, uplineId: referrer.id } });
});

