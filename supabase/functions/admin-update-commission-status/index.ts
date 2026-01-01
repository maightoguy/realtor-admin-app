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

const allowedStatuses = ["pending", "approved", "paid", "rejected"] as const;

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
  const id = body && typeof body === "object" && "id" in body ? (body as { id?: unknown }).id : null;
  const status =
    body && typeof body === "object" && "status" in body ? (body as { status?: unknown }).status : null;
  if (typeof id !== "string" || id.trim().length === 0) return json(400, { error: "Missing `id`." });
  if (typeof status !== "string" || status.trim().length === 0) return json(400, { error: "Missing `status`." });
  if (!allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
    return json(400, { error: "Invalid `status` value." });
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

  const { data: adminUser, error: adminErr } = await serviceClient
    .from("users")
    .select("id, role")
    .eq("id", callerData.user.id)
    .maybeSingle();
  if (adminErr || !adminUser || adminUser.role !== "admin") {
    return json(403, { error: "Admin privileges required." });
  }

  const updatePayload: Record<string, unknown> = {
    status,
    paid_on: status === "paid" ? new Date().toISOString() : null,
  };

  const { data: updated, error: updateErr } = await serviceClient
    .from("commissions")
    .update(updatePayload)
    .eq("id", id.trim())
    .select("*")
    .maybeSingle();

  if (updateErr) return json(500, { error: updateErr.message });
  if (!updated) return json(404, { error: "Record not found." });

  return json(200, { data: updated });
});

