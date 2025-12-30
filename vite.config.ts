import { createClient } from "@supabase/supabase-js";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl =
    env.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL || "";
  const publishableKey =
    env.VITE_API_KEY || process.env.VITE_API_KEY || "";
  const serviceRoleKey =
    env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const adminMiddleware = async (req: any, res: any, next: any) => {
    const url = req.url || "";
    if (!url.startsWith("/api/admin/")) {
      next();
      return;
    }

    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Method not allowed." }));
      return;
    }

    if (!supabaseUrl || !publishableKey) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "Supabase client env is missing. Check VITE_API_BASE_URL and VITE_API_KEY.",
        })
      );
      return;
    }

    if (!serviceRoleKey) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error:
            "Admin updates are blocked by RLS. Either fix the RLS policies to allow admin status updates, or set SUPABASE_SERVICE_ROLE_KEY in .env (no VITE_ prefix).",
        })
      );
      return;
    }

    const match = url.match(
      /^\/api\/admin\/(commissions|payouts)\/([^/]+)\/status(?:\?.*)?$/
    );
    if (!match) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Not found." }));
      return;
    }

    const table = match[1] as "commissions" | "payouts";
    const id = match[2];

    const authHeader = String(req.headers.authorization || "");
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";
    if (!token) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Missing Authorization header." }));
      return;
    }

    let bodyRaw = "";
    for await (const chunk of req) {
      bodyRaw += chunk;
    }
    let body: any = null;
    try {
      body = bodyRaw ? JSON.parse(bodyRaw) : {};
    } catch {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Invalid JSON body." }));
      return;
    }

    const status = body?.status;
    if (typeof status !== "string") {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Missing `status`." }));
      return;
    }

    if (table === "commissions") {
      if (!["pending", "approved", "paid", "rejected"].includes(status)) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Invalid `status` value." }));
        return;
      }
    } else {
      if (!["pending", "approved", "paid", "rejected"].includes(status)) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Invalid `status` value." }));
        return;
      }
    }

    const publicClient = createClient(supabaseUrl, publishableKey);
    const { data: userData, error: userErr } = await publicClient.auth.getUser(token);
    if (userErr || !userData.user?.id) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Invalid session." }));
      return;
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: adminUser, error: adminErr } = await serviceClient
      .from("users")
      .select("id, role")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (adminErr || !adminUser || adminUser.role !== "admin") {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Admin privileges required." }));
      return;
    }

    const updatePayload: Record<string, unknown> = { status };
    if (table === "commissions") {
      updatePayload.paid_on = status === "paid" ? new Date().toISOString() : null;
    } else {
      updatePayload.paid_at = status === "paid" ? new Date().toISOString() : null;
    }

    const { data: updatedRows, error: updateErr } = await serviceClient
      .from(table)
      .update(updatePayload)
      .eq("id", id)
      .select("*");

    if (updateErr) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: updateErr.message }));
      return;
    }

    const updated = (updatedRows ?? [])[0] ?? null;
    if (!updated) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Record not found." }));
      return;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ data: updated }));
  };

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "admin-supabase-middleware",
        configureServer(server) {
          server.middlewares.use(adminMiddleware);
        },
        configurePreviewServer(server) {
          server.middlewares.use(adminMiddleware);
        },
      },
    ],
    server: {
      host: "0.0.0.0",
      port: 5000,
    },
  };
});
