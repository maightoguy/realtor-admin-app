/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
// src/context/UserContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/authService";
import { userService } from "../services/apiService";
import { logger } from "../utils/logger";
import type { User } from "../services/types"; // Adjust path if needed

interface UserContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      setError(null);

      // Get current session/auth user
      const session = await authService.getSession();
      if (!session?.data?.session) {
        throw new Error("No active session");
      }

      // Fetch full user profile from database
      const profile = await userService.getById(session.data.session.user.id);
      if (!profile) {
        const created = await authService.ensureUserProfile();
        if (!created) {
          await authService.signOut();
          throw new Error("User profile not found");
        }
        setUser(created);
        return;
      }

      setUser(profile);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load profile";

      // Only set error if we were showing loader, otherwise silent fail or toast?
      // For now, let's keep setting error state but maybe not block if we have stale data?
      // Actually, if session check fails, we probably should handle it.
      // But if it's a background check and fails, maybe we shouldn't logout immediately unless it's a 401.

      setError(errorMessage);
      if (showLoader) {
        setUser(null);
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Initial load - show loader
    fetchUser(true);

    // Optional: Listen for auth changes
    const { data: authListener } = authService.onAuthStateChange(
      (event, _session) => {
        // Only refresh user data on explicit SIGNED_IN event or when session changes substantially
        if (event === "SIGNED_IN") {
          // Silent refresh on auth state change (e.g. tab focus)
          fetchUser(false);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        } else if (event === "TOKEN_REFRESHED") {
          // Do NOT re-fetch user profile on token refresh to avoid UI disruptions
          // The session is valid, just the token was updated
          logger.info(
            "🔄 [USER CONTEXT] Token refreshed, skipping profile fetch"
          );
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider
      value={{ user, loading, error, refreshUser: () => fetchUser(false) }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (undefined === context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
