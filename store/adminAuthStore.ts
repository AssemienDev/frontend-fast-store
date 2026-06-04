// store/adminAuthStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AdminProfile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: "SUPER_ADMIN";
}

interface AdminAuthState {
    admin: AdminProfile | null;
    token: string | null;
    isAdminAuthenticated: boolean;

    // Actions
    setAdminCredentials: (admin: AdminProfile, token: string) => void;
    clearAdminCredentials: () => void;
    updateAdmin: (updatedFields: Partial<AdminProfile>) => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
    persist(
        (set) => ({
            admin: null,
            token: null,
            isAdminAuthenticated: false,

            setAdminCredentials: (admin, token) => {
                set({ admin, token, isAdminAuthenticated: true });
                if (typeof window !== "undefined") {
                    localStorage.setItem("faststore_admin_token", token);
                }
            },

            clearAdminCredentials: () => {
                set({ admin: null, token: null, isAdminAuthenticated: false });
                if (typeof window !== "undefined") {
                    localStorage.removeItem("faststore_admin_token");
                }
            },

            updateAdmin: (updatedFields) => {
                set((state) => ({
                    admin: state.admin ? { ...state.admin, ...updatedFields } : null,
                }));
            },
        }),
        {
            name: "faststore_admin_auth_storage", // Clé d'isolation LocalStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
);