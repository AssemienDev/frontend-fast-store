// app/[shop_slug]/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

// Importation de nos 3 écrans de paiement thématiques
import ModernCheckout from "@/components/themes/modern/ModernCheckout";
import MinimalistCheckout from "@/components/themes/minimalist/MinimalistCheckout";
import ColorfulCheckout from "@/components/themes/colorful/ColorfulCheckout";
import {FaWrench} from "react-icons/fa";

interface ShopConfig {
    id: string;
    name: string;
    slug: string;
    theme_style: string;
    theme_settings: {
        slogan?: string;
        logo_url?: string;
        primary_color?: string;
    };
    whatsapp_number: string;
    currency: string;
    is_test_mode: boolean;
    default_payment_method: string;
    down_payment_percentage: number;
}

export default function ShopStorefrontCheckoutPage() {
    const router = useRouter();
    const { shop_slug } = useParams() as { shop_slug: string };

    const [shop, setShop] = useState<ShopConfig>();
    const [loading, setLoading] = useState(true);

    const homeUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || "http://localhost:3000";

    useEffect(() => {
        if (!shop_slug) return;

        apiFetch<ShopConfig>(`/storefront/${shop_slug}/shop`)
            .then((shopData) => {
                if (!shopData) {
                    router.push(homeUrl);
                    return;
                }
                setShop(shopData);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [shop_slug, router, homeUrl]);

    if (!shop) return null;

    if (shop.is_test_mode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-6 text-center">
                <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-5">
                    <div className="text-4xl"><FaWrench className="text-[#F59E0B]" /></div>
                    <h2 className="text-xl font-black text-slate-800">Boutique en Maintenance</h2>
                    <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                        La boutique <strong className="text-slate-700">{shop.name}</strong> est actuellement en cours de configuration. Revenez d&#39;ici peu !
                    </p>
                    <button
                        onClick={() => router.push(homeUrl)}
                        className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs cursor-pointer transition"
                    >
                        Retourner à LinkBoutik
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {shop.theme_style === "MODERN" && (
                <ModernCheckout shop={shop} shop_slug={shop_slug} />
            )}
            {shop.theme_style === "MINIMALIST" && (
                <MinimalistCheckout shop={shop} shop_slug={shop_slug} />
            )}
            {shop.theme_style === "COLORFUL" && (
                <ColorfulCheckout shop={shop} shop_slug={shop_slug} />
            )}
        </>
    );
}