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

interface ShopProfile {
    id: string;
    name: string;
    slug: string;
    logo: string;
    currency: string;
    theme_style: string;
    theme_settings: any;
    whatsapp_number: string | null;
    address: string | null;
    business_category: string | null;
}


interface MerchantAuthState {
    merchant: MerchantProfile | null;
    shop: ShopProfile | null;
    token: string | null;
    isAuthenticated: boolean;

    // Actions
    setCredentials: (merchant: MerchantProfile, token: string) => void;
    setShop: (shop: ShopProfile) => void;
    clearCredentials: () => void;
    updateMerchant: (updatedFields: Partial<MerchantProfile>) => void;
}

export const useMerchantAuthStore = create<MerchantAuthState>()(
    persist(
        (set) => ({
            merchant: null,
            shop: null,
            token: null,
            isAuthenticated: false,

            setCredentials: (merchant, token) => {
                set({ merchant, token, isAuthenticated: true });
                if (typeof window !== "undefined") {
                    localStorage.setItem("linkboutik_merchant_token", token);
                }
            },

            setShop: (shop) => {
                set({ shop });
            },

            clearCredentials: () => {
                set({ merchant: null, token: null, isAuthenticated: false });
                if (typeof window !== "undefined") {
                    localStorage.removeItem("linkboutik_merchant_token");
                }
            },

            updateMerchant: (updatedFields) => {
                set((state) => ({
                    merchant: state.merchant ? { ...state.merchant, ...updatedFields } : null,
                }));
            },
        }),
        {
            name: "linkboutik_merchant_auth_storage", // Clé d'isolation LocalStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
);