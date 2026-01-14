import type { User } from "./types";
import { logger } from "../utils/logger";

const USER_STORAGE_KEY = "realtor_admin_user";
// Supabase default local storage key pattern: sb-<project-ref>-auth-token
// We can try to clear all supabase related keys or just the specific ones we know
// For now, we will add a clearSession method that can be expanded
const SESSION_STORAGE_KEY = "realtor_admin_session"; 

export const authManager = {
  saveUser(user: User) {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      logger.error("Failed to save user to localStorage", { error });
    }
  },

  getUser(): User | null {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  clearUser() {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      logger.error("Failed to clear user from localStorage", { error });
    }
  },

  // New method as requested
  clearSession() {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      // Also clear any supabase keys if possible/needed, though supabase.auth.signOut() handles its own
      // We'll iterate and clear Supabase keys just to be safe as per "Explicit Session Clearing"
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      logger.error("Failed to clear session from localStorage", { error });
    }
  }
};
