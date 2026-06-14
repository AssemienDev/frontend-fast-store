// app/[shop_slug]/cart/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

// Importation de nos 3 paniers d'achats thématiques
import ModernCart from "@/components/themes/modern/ModernCart";
import MinimalistCart from "@/components/themes/minimalist/MinimalistCart";
import ColorfulCart from "@/components/themes/colorful/ColorfulCart";

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
}

export default function ShopStorefrontCartPage() {
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

    return (
        <>
            {/* AIGUILLAGE DYNAMIQUE DU PANIER */}
            {shop.theme_style === "MODERN" && (
                <ModernCart shop={shop} shop_slug={shop_slug} />
            )}
            {shop.theme_style === "MINIMALIST" && (
                <MinimalistCart shop={shop} shop_slug={shop_slug} />
            )}
            {shop.theme_style === "COLORFUL" && (
                <ColorfulCart shop={shop} shop_slug={shop_slug} />
            )}
        </>
    );
}