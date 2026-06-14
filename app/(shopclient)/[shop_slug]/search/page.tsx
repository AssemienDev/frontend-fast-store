// app/[shop_slug]/search/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

import ModernSearch from "@/components/themes/modern/ModernSearch";
import MinimalistCatalog from "@/components/themes/minimalist/MinimalistCatalog";
import ColorfulCatalog from "@/components/themes/colorful/ColorfulCatalog";
import MinimalSearch from "@/components/themes/minimalist/MinimalSearch";
import ColorfulSearch from "@/components/themes/colorful/ColorfulSearch";

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

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price: number | null;
    images: string[] | null;
    category_name?: string;
    is_featured: boolean;
    created_at: string;
}

export default function ShopStorefrontSearchPage() {
    const router = useRouter();
    const { shop_slug } = useParams() as { shop_slug: string };
    const searchParams = useSearchParams();

    // Extraction du terme recherché depuis l'URL
    const queryParam = searchParams.get("q") || "";

    const [shop, setShop] = useState<ShopConfig>();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const homeUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || "http://localhost:3000";

    useEffect(() => {
        if (!shop_slug) return;
        setLoading(true);

        // Charger les détails et les produits correspondants à la recherche
        Promise.all([
            apiFetch<ShopConfig>(`/storefront/${shop_slug}/shop`).catch(() => null),
            apiFetch<Product[]>(`/storefront/${shop_slug}/products?q=${queryParam}`).catch(() => [])
        ])
            .then(([shopData, prodsData]) => {
                if (!shopData) {
                    router.push(homeUrl);
                    return;
                }
                setShop(shopData);
                setProducts(prodsData);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [shop_slug, queryParam, router, homeUrl]);

    if (!shop) return null;

    return (
        <>
            {shop.theme_style === "MODERN" && (
                <ModernSearch
                    shop={shop}
                    products={products}
                    initialQuery={queryParam}
                    loading={loading}
                />
            )}
            {shop.theme_style === "MINIMALIST" && (
                <MinimalSearch
                    shop={shop}
                    products={products}
                    initialQuery={queryParam}
                    loading={loading}
                />
            )}
            {shop.theme_style === "COLORFUL" && (
                <ColorfulSearch
                    shop={shop}
                    products={products}
                    initialQuery={queryParam}
                    loading={loading}
                />
            )}
        </>
    );
}