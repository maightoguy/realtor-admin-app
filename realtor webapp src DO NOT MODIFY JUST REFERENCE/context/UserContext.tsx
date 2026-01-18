/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
// src/context/UserContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import type { ReactNode } from "react";
import { authService } from "../services/authService";
import { userService } from "../services/apiService";
import { authManager } from "../services/authManager";
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
  const [user, setUser] = useState<User | null>(() => {
    try {
      const urlRecovery =
        window.location.search.includes("mode=recovery") ||
        window.location.hash.includes("type=recovery");
      const storageRecovery =
        localStorage.getItem("realtor_app_recovery_mode") === "1";
      if (urlRecovery || storageRecovery) return null;
    } catch {
      // ignore
    }
    return authManager.getUser();
  });
  const userRef = useRef<User | null>(null);
  const [loading, setLoading] = useState(() => !authManager.getUser());

  useEffect(() => {
    userRef.current = user;
  }, [user]);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      setError(null);

      const isRecovery = (() => {
        try {
          const urlRecovery =
            window.location.search.includes("mode=recovery") ||
            window.location.hash.includes("type=recovery");
          const storageRecovery =
            localStorage.getItem("realtor_app_recovery_mode") === "1";
          return urlRecovery || storageRecovery;
        } catch {
          return false;
        }
      })();

      if (isRecovery) {
        setUser(null);
        return;
      }

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
    fetchUser(!userRef.current);

    // Optional: Listen for auth changes
    const { data: authListener } = authService.onAuthStateChange(
      (event, _session) => {
        // Only refresh user data on explicit SIGNED_IN event or when session changes substantially
        if (event === "PASSWORD_RECOVERY") {
          try {
            localStorage.setItem("realtor_app_recovery_mode", "1");
          } catch {
            // ignore
          }
          setUser(null);
          setLoading(false);
          setError(null);
        } else if (event === "SIGNED_IN") {
          // If we already have a user, don't show loader (background refresh)
          // If we don't have a user (fresh login), show loader
          fetchUser(!userRef.current);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setLoading(false);
          try {
            localStorage.removeItem("realtor_app_recovery_mode");
          } catch {
            // ignore
          }
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
