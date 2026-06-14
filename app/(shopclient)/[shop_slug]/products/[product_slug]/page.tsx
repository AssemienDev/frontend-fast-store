// app/[shop_slug]/products/[product_slug]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

// Importation de nos 3 fiches produits thématiques
import ModernProductDetail from "@/components/themes/modern/ModernProductDetail";
import MinimalistProductDetail from "@/components/themes/minimalist/MinimalistProductDetail";
import ColorfulProductDetail from "@/components/themes/colorful/ColorfulProductDetail";

interface ProductDetail {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compare_at_price: number | null;
    images: string[] | null;
    has_variants: boolean;
    variants_taille: string[] | null;
    variants_couleur: string[] | null;
    variants_stock: {
        taille: string | null;
        couleur: string | null;
        stock: number;
        price: number;
        compare_at_price: number | null;
        sku: string;
    }[] | null;
    created_at: string;
}

interface ShopConfig {
    slug: string;
    currency: string;
    theme_style: string;
    theme_settings: {
        slogan?: string;
        logo_url?: string;
        primary_color?: string;
    };
}

export default function StorefrontProductDetailPage() {
    const router = useRouter();
    const { shop_slug, product_slug } = useParams() as { shop_slug: string; product_slug: string };

    const [shop, setShop] = useState<ShopConfig>();
    const [product, setProduct] = useState<ProductDetail>();
    const [loading, setLoading] = useState(true);

    const homeUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || "http://localhost:3000";

    useEffect(() => {
        if (!shop_slug || !product_slug) return;

        Promise.all([
            apiFetch<ShopConfig>(`/storefront/${shop_slug}/shop`),
            apiFetch<ProductDetail>(`/storefront/${shop_slug}/products/${product_slug}`)
        ])
            .then(([shopData, prodData]) => {
                if (!shopData || !prodData) {
                    router.push(homeUrl);
                    return;
                }
                setShop(shopData);
                setProduct(prodData);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [shop_slug, product_slug, router, homeUrl]);

    // Garde-fou d'assertion de type pour rassurer le compilateur TypeScript (le layout gérant déjà le loader)
    if (!shop || !product) return null;

    return (
        <>
            {/* AIGUILLAGE DU THÈME DE FICHE PRODUIT */}
            {shop.theme_style === "MODERN" && (
                <ModernProductDetail shop={shop} product={product} shop_slug={shop_slug} />
            )}
            {shop.theme_style === "MINIMALIST" && (
                <MinimalistProductDetail shop={shop} product={product} shop_slug={shop_slug} />
            )}
            {shop.theme_style === "COLORFUL" && (
                <ColorfulProductDetail shop={shop} product={product} shop_slug={shop_slug} />
            )}
        </>
    );
}