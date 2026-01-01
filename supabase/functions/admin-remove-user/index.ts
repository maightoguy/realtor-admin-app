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
  const userId =
    body && typeof body === "object" && "userId" in body ? (body as { userId?: unknown }).userId : null;
  if (typeof userId !== "string" || userId.trim().length === 0) {
    return json(400, { error: "Missing `userId`." });
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

  const targetId = userId.trim();
  const nowIso = new Date().toISOString();
  const placeholderEmail = `deleted+${targetId}@deleted.local`;
  const placeholderPhone = `del-${targetId}`.slice(0, 20);

  let authUpdated = false;
  let authSignedOut = false;

  const updateResult = await serviceClient.auth.admin.updateUserById(targetId, {
    email: placeholderEmail,
    user_metadata: {
      deleted_at: nowIso,
      admin_removed_at: nowIso,
      admin_removed_by: adminUser.id,
    },
    ban_duration: "876000h",
  });
  if (updateResult.error && updateResult.error.status !== 404) {
    return json(500, { error: updateResult.error.message });
  }
  authUpdated = !updateResult.error;

  const signOutResult = await serviceClient.auth.admin.signOut(targetId);
  authSignedOut = !signOutResult.error;

  const { error: deletePublicErr } = await serviceClient.from("users").delete().eq("id", targetId);

  let publicDeleted = false;
  let publicScrubbed = false;
  if (!deletePublicErr) {
    publicDeleted = true;
  } else {
    const { error: scrubErr } = await serviceClient
      .from("users")
      .update({
        first_name: "Deleted",
        last_name: "User",
        email: placeholderEmail,
        phone_number: placeholderPhone,
        gender: null,
        avatar_url: null,
        bank_details: null,
      })
      .eq("id", targetId);
    if (scrubErr) {
      return json(500, { error: scrubErr.message });
    }
    publicScrubbed = true;
  }

  return json(200, {
    data: {
      userId: targetId,
      authUpdated,
      authSignedOut,
      publicDeleted,
      publicScrubbed,
    },
  });
});

