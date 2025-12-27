import type { Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabaseClient";
import { logger } from "../utils/logger";

function maskEmail(email: string) {
  const trimmed = String(email ?? "").trim();
  const at = trimmed.indexOf("@");
  if (at <= 1) return "***";
  return `${trimmed[0]}***${trimmed.slice(at - 1)}`;
}

export const authService = {
  async signInWithPassword(email: string, password: string) {
    logger.info("[AUTH] signInWithPassword start", { email: maskEmail(email) });
    const result = await getSupabaseClient().auth.signInWithPassword({
      email,
      password,
    });
    if (result.error) {
      logger.error("[AUTH] signInWithPassword failed", {
        email: maskEmail(email),
        message: result.error.message,
        name: result.error.name,
      });
    } else {
      logger.info("[AUTH] signInWithPassword success", {
        userId: result.data.user?.id ?? null,
      });
    }
    return result;
  },

  async signOut() {
    logger.info("[AUTH] signOut start");
    const result = await getSupabaseClient().auth.signOut();
    if (result.error) {
      logger.error("[AUTH] signOut failed", {
        message: result.error.message,
        name: result.error.name,
      });
    } else {
      logger.info("[AUTH] signOut success");
    }
    return result;
  },

  async getSession() {
    return getSupabaseClient().auth.getSession();
  },

  async getCurrentUser() {
    const { data } = await getSupabaseClient().auth.getUser();
    return data.user;
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return getSupabaseClient().auth.onAuthStateChange(callback);
  },

  async resendConfirmationEmail(email: string) {
    logger.info("[AUTH] resendConfirmationEmail start", {
      email: maskEmail(email),
    });
    return getSupabaseClient().auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
  },

  async resetPasswordForEmail(email: string) {
    logger.info("[AUTH] resetPasswordForEmail start", {
      email: maskEmail(email),
    });
    return getSupabaseClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?mode=recovery`,
    });
  },

  async verifyOtp(params: {
    email: string;
    token: string;
    type: "email" | "recovery";
  }) {
    logger.info("[AUTH] verifyOtp start", {
      email: maskEmail(params.email),
      type: params.type,
    });
    return getSupabaseClient().auth.verifyOtp(params);
  },

  async updatePassword(newPassword: string) {
    logger.info("[AUTH] updatePassword start");
    return getSupabaseClient().auth.updateUser({ password: newPassword });
  },
};
