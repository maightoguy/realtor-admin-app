import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { API_BASE_URL, API_KEY } from "./app_url";
import { logger } from "../utils/logger";

let supabase: SupabaseClient | null = null;

if (API_BASE_URL && API_KEY) {
  supabase = createClient(API_BASE_URL, API_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  });
  logger.info("[SUPABASE] Client initialized", {
    hasBaseUrl: Boolean(API_BASE_URL),
    hasApiKey: Boolean(API_KEY),
  });
} else {
  logger.warn("[SUPABASE] Client not initialized (missing env)", {
    hasBaseUrl: Boolean(API_BASE_URL),
    hasApiKey: Boolean(API_KEY),
  });
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    logger.error("[SUPABASE] getSupabaseClient called before initialization", {
      hasBaseUrl: Boolean(API_BASE_URL),
      hasApiKey: Boolean(API_KEY),
    });
    throw new Error(
      "Supabase client is not initialized. Ensure VITE_API_BASE_URL and VITE_API_KEY are set."
    );
  }
  return supabase;
}

export { supabase };
