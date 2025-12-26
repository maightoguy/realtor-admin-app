/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
// src/context/UserContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/authService";
import { userService } from "../services/apiService";
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

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current session/auth user
      const session = await authService.getSession();
      if (!session?.data?.session) {
        throw new Error("No active session");
      }

      // Fetch full user profile from database
      const profile = await userService.getById(session.data.session.user.id);
      if (!profile) {
        throw new Error("User profile not found");
      }

      setUser(profile);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load profile";
      
      // If session exists but profile is missing, force signout
      if (errorMessage === "User profile not found") {
        authService.signOut();
      }

      setError(errorMessage);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // Optional: Listen for auth changes
    const { data: authListener } = authService.onAuthStateChange(
      (event, _session) => {
        if (event === "SIGNED_IN") {
          fetchUser();
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider
      value={{ user, loading, error, refreshUser: fetchUser }}
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
