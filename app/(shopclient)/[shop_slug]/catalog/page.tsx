// app/[shop_slug]/catalog/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

import ModernCatalog from "@/components/themes/modern/ModernCatalog";
import MinimalistCatalog from "@/components/themes/minimalist/MinimalistCatalog";
import ColorfulCatalog from "@/components/themes/colorful/ColorfulCatalog";

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

interface Category {
    id: string;
    name: string;
    slug: string;
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

export default function ShopStorefrontCatalogPage() {
    const router = useRouter();
    const { shop_slug } = useParams() as { shop_slug: string };
    const searchParams = useSearchParams();

    // Extraction des filtres depuis l'URL
    const activeCategoryId = searchParams.get("category") || "";
    const activeSort = searchParams.get("sort") || "newest"; // "newest" | "price_asc" | "price_desc"

    const [shop, setShop] = useState<ShopConfig>();
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const homeUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || "http://localhost:3000";

    useEffect(() => {
        if (!shop_slug) return;
        setLoading(true);

        // Charger les détails, catégories et produits triés/filtrés de la boutique
        Promise.all([
            apiFetch<ShopConfig>(`/storefront/${shop_slug}/shop`).catch(() => null),
            apiFetch<Category[]>(`/storefront/${shop_slug}/categories`).catch(() => []),
            apiFetch<Product[]>(`/storefront/${shop_slug}/products?category_id=${activeCategoryId}&sort_by=${activeSort}`).catch(() => [])
        ])
            .then(([shopData, catsData, prodsData]) => {
                if (!shopData) {
                    router.push(homeUrl);
                    return;
                }
                setShop(shopData);
                setCategories(catsData);
                setProducts(prodsData);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [shop_slug, activeCategoryId, activeSort, router, homeUrl]);

    if (!shop) return null;

    return (
        <>
            {shop.theme_style === "MODERN" && (
                <ModernCatalog
                    shop={shop}
                    categories={categories}
                    products={products}
                    activeCategoryId={activeCategoryId}
                    activeSort={activeSort}
                />
            )}
            {shop.theme_style === "MINIMALIST" && (
                <MinimalistCatalog
                    shop={shop}
                    categories={categories}
                    products={products}
                    activeCategoryId={activeCategoryId}
                    activeSort={activeSort}
                />
            )}
            {shop.theme_style === "COLORFUL" && (
                <ColorfulCatalog
                    shop={shop}
                    categories={categories}
                    products={products}
                    activeCategoryId={activeCategoryId}
                    activeSort={activeSort}
                />
            )}
        </>
    );
}