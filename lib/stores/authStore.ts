import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Organization, AuthData } from "@/types/auth";

interface AuthState extends AuthData {
  setAuthData: (data: Partial<AuthState>) => void;
  selectCurrentOrganization: (organization: Organization) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      currentOrganization: null,
      personalOrganization: null,
      organizations: null,
      setAuthData: (data) =>
        set((state) => ({
          ...state,
          ...data,
          isLoading: false,
        })),
      selectCurrentOrganization: (organization: Organization) =>
        set({ currentOrganization: organization, isLoading: false }),
      signOut: () =>
        set({
          user: null,
          isAuthenticated: false,
          currentOrganization: null,
          personalOrganization: null,
          organizations: null,
          isLoading: false,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentOrganization: state.currentOrganization,
        personalOrganization: state.personalOrganization,
        organizations: state.organizations,
      }),
      version: 1,
    }
  )
);
