import type { Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabaseClient";

export const authService = {
  async signInWithPassword(email: string, password: string) {
    return getSupabaseClient().auth.signInWithPassword({ email, password });
  },

  async signOut() {
    return getSupabaseClient().auth.signOut();
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
    return getSupabaseClient().auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
  },

  async resetPasswordForEmail(email: string) {
    return getSupabaseClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?mode=recovery`,
    });
  },

  async verifyOtp(params: {
    email: string;
    token: string;
    type: "email" | "recovery";
  }) {
    return getSupabaseClient().auth.verifyOtp(params);
  },

  async updatePassword(newPassword: string) {
    return getSupabaseClient().auth.updateUser({ password: newPassword });
  },
};

