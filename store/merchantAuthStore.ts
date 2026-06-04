// store/merchantAuthStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface MerchantProfile {
    id: string;
    email: string;
    full_name: string | null;
    personal_phone: string | null;
    avatar_url: string | null;
    role: string; // "MERCHANT" ou "STAFF"
    language: string;
    is_verified: boolean;
}

interface MerchantAuthState {
    merchant: MerchantProfile | null;
    token: string | null;
    isAuthenticated: boolean;

    // Actions
    setCredentials: (merchant: MerchantProfile, token: string) => void;
    clearCredentials: () => void;
    updateMerchant: (updatedFields: Partial<MerchantProfile>) => void;
}

export const useMerchantAuthStore = create<MerchantAuthState>()(
    persist(
        (set) => ({
            merchant: null,
            token: null,
            isAuthenticated: false,

            setCredentials: (merchant, token) => {
                set({ merchant, token, isAuthenticated: true });
                if (typeof window !== "undefined") {
                    localStorage.setItem("faststore_merchant_token", token);
                }
            },

            clearCredentials: () => {
                set({ merchant: null, token: null, isAuthenticated: false });
                if (typeof window !== "undefined") {
                    localStorage.removeItem("faststore_merchant_token");
                }
            },

            updateMerchant: (updatedFields) => {
                set((state) => ({
                    merchant: state.merchant ? { ...state.merchant, ...updatedFields } : null,
                }));
            },
        }),
        {
            name: "faststore_merchant_auth_storage", // Clé d'isolation LocalStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
);