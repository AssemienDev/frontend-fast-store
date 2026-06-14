// app/[shop_slug]/confirmation/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

import ModernConfirmation from "@/components/themes/modern/ModernConfirmation";
import MinimalistConfirmation from "@/components/themes/minimalist/MinimalistConfirmation";
import ColorfulConfirmation from "@/components/themes/colorful/ColorfulConfirmation";

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
}

interface OrderDetail {
    id: string;
    tracking_number: string;
    customer_name: string;
    total_amount: number;
    items: OrderItem[];
}

interface ShopConfig {
    slug: string;
    currency: string;
    theme_style: string;
    theme_settings: {
        primary_color?: string;
    };
}

export default function OrderConfirmationPage() {
    const router = useRouter();
    const { shop_slug } = useParams() as { shop_slug: string };
    const searchParams = useSearchParams();
    const tracking = searchParams.get("tracking") || "";

    const [shop, setShop] = useState<ShopConfig>();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const homeUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || "http://localhost:3000";

    useEffect(() => {
        if (!tracking || !shop_slug) return;

        Promise.all([
            apiFetch<ShopConfig>(`/storefront/${shop_slug}/shop`).catch(() => null),
            apiFetch<OrderDetail>(`/storefront/${shop_slug}/orders/${tracking}`).catch(() => null)
        ])
            .then(([shopData, orderData]) => {
                if (!shopData) {
                    router.push(homeUrl);
                    return;
                }
                setShop(shopData);
                setOrder(orderData);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [tracking, shop_slug, router, homeUrl]);

    if (!shop || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center animate-pulse">
                    <div className="w-10 h-10 border-4 border-slate-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-semibold">Chargement ...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {shop.theme_style === "MODERN" && (
                <ModernConfirmation shop={shop} order={order} tracking={tracking} />
            )}
            {shop.theme_style === "MINIMALIST" && (
                <MinimalistConfirmation shop={shop} order={order} tracking={tracking} />
            )}
            {shop.theme_style === "COLORFUL" && (
                <ColorfulConfirmation shop={shop} order={order} tracking={tracking} />
            )}
        </>
    );
}