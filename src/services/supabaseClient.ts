import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { API_BASE_URL, API_KEY } from "./app_url";

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
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase client is not initialized. Ensure VITE_API_BASE_URL and VITE_API_KEY are set."
    );
  }
  return supabase;
}

export { supabase };

