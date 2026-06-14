// src/app/[shop_slug]/cancel/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

import ModernCancel from "@/components/themes/modern/ModernCancel";
import MinimalistCancel from "@/components/themes/minimalist/MinimalistCancel";
import ColorfulCancel from "@/components/themes/colorful/ColorfulCancel";

interface ShopConfig {
    slug: string;
    currency: string;
    theme_style: string;
}

export default function PaymentCancelPage() {
    const router = useRouter();
    const { shop_slug } = useParams() as { shop_slug: string };
    const searchParams = useSearchParams();
    const tracking = searchParams.get("tracking") || "";

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

    if (!shop || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center animate-pulse">
                    <div className="w-10 h-10 border-4 border-slate-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-semibold">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {shop.theme_style === "MODERN" && (
                <ModernCancel shop={shop} tracking={tracking} />
            )}
            {shop.theme_style === "MINIMALIST" && (
                <MinimalistCancel shop={shop} tracking={tracking} />
            )}
            {shop.theme_style === "COLORFUL" && (
                <ColorfulCancel shop={shop} tracking={tracking} />
            )}
        </>
    );
}