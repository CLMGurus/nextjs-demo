"use client";

import { useInitializeAuth } from "@/lib/stores/useAuth";
import { useAuthStore } from "@/lib/stores/authStore";
import { useEffect } from "react";
import { InitialAuthData } from "@/types/auth";

interface ClientLayoutProps {
  initialAuthData: InitialAuthData;
  children: React.ReactNode;
}

export default function ClientLayout({
  initialAuthData,
  children,
}: ClientLayoutProps) {
  const { setAuthData } = useAuthStore();
  useInitializeAuth({ user: initialAuthData.user });

  useEffect(() => {
    if (initialAuthData) {
      setAuthData({
        user: initialAuthData.user,
        isAuthenticated: !!initialAuthData.user,
        currentOrganization: initialAuthData.currentOrganization,
        personalOrganization: initialAuthData.personalOrganization,
        organizations: initialAuthData.organizations,
        isLoading: false, // Ensure isLoading is set
      });
    }
  }, [initialAuthData, setAuthData]);

  return <>{children}</>;
}
