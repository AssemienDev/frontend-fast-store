// app/[shop_slug]/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { apiFetch } from "@/lib/api";
import { Search, ShoppingBag, Bell, Menu } from "lucide-react";
import Link from "next/link";
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
}

export default function StorefrontLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { shop_slug } = useParams() as { shop_slug: string };

    const [shop, setShop] = useState<ShopConfig | null>(null);
    const [loading, setLoading] = useState(true);

    // Zustand : Accès global au sélecteur d'articles du panier
    const { getTotalItems } = useCartStore();

    const homeUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || "http://localhost:3000";

    useEffect(() => {
        if (!shop_slug) return;

        // Charger les détails de configuration publique de la boutique
        apiFetch<ShopConfig>(`/storefront/${shop_slug}/shop`)
            .then((data) => {
                if (!data) {
                    router.push(homeUrl); // Retour à LinkBoutik si boutique inexistante
                    return;
                }
                setShop(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [shop_slug, router]);

    if (loading || !shop) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center animate-pulse">
                    <div className="w-10 h-10 border-4 border-slate-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-semibold">Chargement de la boutique...</p>
                </div>
            </div>
        );
    }

    // --- RENDU SÉCURISÉ : MODE MAINTENANCE / CONFIGURATION ---
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

    const primaryColor = shop.theme_settings?.primary_color || "#0F766E";

    return (
        <div className="bg-white min-h-screen font-sans antialiased text-slate-800 flex flex-col justify-between">

            {/* ========================================================= */}
            {/* INJECTION DYNAMIQUE DE LA COULEUR DE MARQUE DU MARCHAND (ÉLITE) */}
            {/* ========================================================= */}
            <style>{`
            :root {
              --color-primary: ${primaryColor};
            }
            .btn-primary-brand {
              background-color: ${primaryColor} !important;
              color: #ffffff !important;
            }
            .text-primary-brand {
              color: ${primaryColor} !important;
            }
            .border-primary-brand {
              border-color: ${primaryColor} !important;
            }
            .bg-primary-brand-light {
              background-color: ${primaryColor}15 !important;
            }
          `}</style>

            {/* HEADER DE LA VITRINE BOUTIQUE GLOBALE */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 px-6 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    {shop.theme_settings?.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={shop.theme_settings.logo_url} alt={shop.name} className="h-10 w-10 rounded-full object-cover border border-slate-100" />
                    ) : (
                        <span className="w-10 h-10 rounded-full bg-primary-brand-light text-primary-brand font-black text-sm flex items-center justify-center">
                      {shop.name.charAt(0).toUpperCase()}
                    </span>
                    )}
                    <span className="font-extrabold text-slate-800 tracking-tight text-base">{shop.name}</span>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-slate-500">
                    <Link href={`/${shop.slug}`} className={`${pathname === `/${shop.slug}` ? "text-primary-brand" : "hover:text-primary-brand transition"}`}>Accueil</Link>
                    <Link href={`/${shop.slug}/catalog`} className={`${pathname.includes("/catalog") ? "text-primary-brand" : "hover:text-primary-brand transition"}`}>Catalogue</Link>
                </nav>

                {/* RECHERCHE & PANIER CLIQUABLE AVEC UNREAD COMPTEUR ZUSTAND */}
                <div className="flex items-center gap-4">
                    <button className="p-2 rounded-full hover:bg-slate-50 text-slate-600">
                        <Search className="w-5 h-5" />
                    </button>

                    <Link
                        href={`/${shop.slug}/cart`}
                        className="p-2 rounded-full hover:bg-slate-50 text-slate-600 relative flex items-center justify-center"
                        title="Votre panier"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        {getTotalItems() > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center border-2 border-white animate-scaleIn">
                    {getTotalItems()}
                  </span>
                        )}
                    </Link>
                </div>
            </header>

            {/* CONTENU DE LA PAGE EN COURS DE LECTURE (ACCUEIL, CATALOGUE, PRODUIT, CART...) */}
            <main className="grow">
                {children}
            </main>

            {/* PIED DE PAGE DE LA VITRINE BOUTIQUE GLOBALE */}
            <footer className="bg-slate-50 border-t border-slate-100 py-12 px-6">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-150 pb-8">
                    <span className="font-extrabold text-primary-brand text-lg tracking-tight">{shop.name}</span>
                </div>
                <div className="max-w-5xl mx-auto text-center pt-8 text-[10px] text-slate-400 font-semibold">
                    &copy; {new Date().getFullYear()} {shop.name}. All rights reserved. Powered by LinkBoutik.
                </div>
            </footer>

        </div>
    );
}