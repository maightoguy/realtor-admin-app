import type { User } from "./types";

const USER_STORAGE_KEY = "realtor_admin_user";

export const authManager = {
  saveUser(user: User) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
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
    localStorage.removeItem(USER_STORAGE_KEY);
  },
};

