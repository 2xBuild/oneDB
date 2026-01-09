"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { apiClient } from "@/lib/api";
import type { User } from "@onedb/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      if (status === "loading") {
        return;
      }

      if (!session?.user?.email) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await apiClient.get<{ user: User }>("/auth/me");
      // Handle both possible response formats: { user: ... } or { data: { user: ... } }
      const userData = (response as any).user || (response as any).data?.user;
      if (!userData) {
        throw new Error("User data not found in response");
      }
      // Ensure dates are properly formatted (they come as strings from JSON)
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
        updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
      };
      setUser(user);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [session, status]);

  const login = useCallback(async (token: string) => {
    // This is kept for backward compatibility, but NextAuth handles login via signIn
    // The token parameter is ignored as NextAuth uses sessions
    await refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    setUser(null);
    await nextAuthSignOut({ callbackUrl: "/" });
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

