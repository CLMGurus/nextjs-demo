"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { InitialAuthUser, Organization } from "@/types/auth";

interface OrgsCookieData {
  currentOrganization: Organization | null;
  personalOrganization: Organization | null;
  organizations: Organization[] | null;
}

export function useInitializeAuth(initialAuthUser: InitialAuthUser) {
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  // prevents infinite loop
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (isAuthenticated !== false) return;

    const orgsCookieString = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_orgs="));

    let orgsData: OrgsCookieData | null = null;
    if (orgsCookieString) {
      try {
        orgsData = JSON.parse(
          decodeURIComponent(orgsCookieString.split("=")[1])
        ) as OrgsCookieData;
      } catch (error) {
        console.error("Failed to parse auth_orgs cookie:", error);
        toast("Failed to load organization data. Please try again.");
      }
    }

    const userData = initialAuthUser?.user ? initialAuthUser : null;

    if (userData && orgsData) {
      setAuthData({
        user: userData.user,
        isAuthenticated: true,
        currentOrganization: orgsData.currentOrganization || null,
        personalOrganization: orgsData.personalOrganization || null,
        organizations: orgsData.organizations || null,
        isLoading: false,
      });
    } else {
      setAuthData({
        user: null,
        isAuthenticated: false,
        currentOrganization: null,
        personalOrganization: null,
        organizations: null,
        isLoading: false,
      });
      if (userData || orgsData) {
        toast("Incomplete session data detected. Please log in again.");
        router.push("/login");
      }
    }
  }, [initialAuthUser, isAuthenticated, router, setAuthData]);
}
