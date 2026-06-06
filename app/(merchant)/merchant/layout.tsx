// app/merchant/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMerchantAuthStore } from "@/store/merchantAuthStore";
import {
    Home,
    Layers,
    BarChart3,
    Headphones,
    Settings,
    Bell,
    Menu,
    LogOut
} from "lucide-react";
import Link from "next/link";
import {apiFetch} from "@/lib/api";


export default function MerchantLayout({
                                           children,
                                       }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { merchant, shop, setShop, isAuthenticated, clearCredentials } = useMerchantAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        document.title = "FastStore - Espace Marchand";
    }, []);

    useEffect(() => {
        const isAuthPage =
            pathname.includes("/login") ||
            pathname.includes("/register") ||
            pathname.includes("/verify-email") ||
            pathname.includes("/onboarding") ||
            pathname.includes("/forgot-password") ||
            pathname.includes("/reset-password");

        const shouldLoadShop = isAuthenticated && merchant?.is_verified && !isAuthPage && !shop;

        if (shouldLoadShop) {
            apiFetch<any>("/merchant/shop")
                .then((shopData) => {
                    setShop(shopData); // Enregistre la boutique de façon globale
                })
                .catch((err) => {
                    console.error("Échec du chargement de la boutique:", err);
                });
        }
    }, [isAuthenticated, merchant, pathname, shop, setShop]);

    if (!mounted) return null;

    const handleLogout = () => {
        clearCredentials();
        router.push("/register");
    };

    // SÉCURITÉ DE VÉRIFICATION DE L'ONBOARDING COMPLET :
    // Le Drawer ne doit s'afficher que si le marchand est entièrement connecté, vérifié,
    // et qu'il n'est pas sur les écrans d'authentification/onboarding.
    const isAuthPage =
        pathname.includes("/login") ||
        pathname.includes("/register") ||
        pathname.includes("/verify-email") ||
        pathname.includes("/onboarding") ||
        pathname.includes("/forgot-password") ||
        pathname.includes("/reset-password");

    const showDashboardLayout = isAuthenticated && merchant?.is_verified && !isAuthPage;

    // CAS 1 : ÉCRANS D'AUTHENTIFICATION / ONBOARDING (PAS DE TIROIR/DRAWER VISIBLE)
    if (!showDashboardLayout) {
        return (
            <div className="bg-[#F7F9FB] min-h-screen text-slate-800 antialiased">
                {children}
            </div>
        );
    }


    return (
        <div className="drawer lg:drawer-open min-h-screen bg-slate-50/50 text-slate-850 antialiased">
            <input id="merchant-drawer" type="checkbox" className="drawer-toggle" />

            {/* SECTION DROITE : CONTENU DYNAMIQUE DES PAGES */}
            <div className="drawer-content flex flex-col min-h-screen">

                {/* EN-TÊTE GLOBAL DES BOUTIQUES */}
                <header className="bg-white border-b border-slate-200/60 px-6 h-16 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        {/* Bouton burger mobile */}
                        <label htmlFor="merchant-drawer" className="btn btn-ghost btn-circle lg:hidden text-slate-600 cursor-pointer">
                            <Menu className="w-5 h-5" />
                        </label>

                        {/* Titre de la boutique */}
                        <div className="hidden md:block">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ma Boutique</p>
                            <h2 className="text-sm font-black text-slate-850">
                                {shop ? shop.name : "Chargement..."}
                            </h2>
                        </div>
                    </div>

                    {/* Logo FastStore */}
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-primary tracking-tight">FastStore</span>
                    </div>

                    {/* Notifications & Déconnexion */}
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-white" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-rose-50 border border-slate-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                            title="Se déconnecter"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* CONTENU DE LA PAGE EN COURS DE LECTURE (DASHBOARD, PRODUITS, PARAMÈTRES, ETC.) */}
                <main className="grow">
                    {children}
                </main>
            </div>

            {/* SECTION GAUCHE : LE MENU DRAWER LATÉRAL COLLANT */}
            <div className="drawer-side z-50">
                <label htmlFor="merchant-drawer" className="drawer-overlay" />

                <aside className="w-64 h-full bg-white border-r border-slate-200/60 p-6 flex flex-col justify-between">
                    <div className="space-y-8">

                        {/* Fiche propriétaire de la boutique */}
                        <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-full overflow-hidden relative shrink-0 border border-slate-200">
                                <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">
                                    {merchant?.full_name?.charAt(0)?.toUpperCase()}
                                </div>
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="text-xs font-black text-slate-800 truncate">{merchant.full_name || "Commerçant"}</h3>
                                <span className="inline-block px-2 py-0.5 bg-amber-50 text-[#F59E0B] text-[8px] font-black uppercase rounded-md mt-1 border border-amber-100">
                              Premium Plan
                            </span>
                            </div>
                        </div>

                        {/* Menu de navigation des pages */}
                        <nav className="flex flex-col gap-1.5 text-xs font-bold text-slate-500">
                            <Link
                                href="/"
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition font-extrabold ${
                                    pathname === "/"
                                        ? "bg-[#F59E0B] text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <Home className="w-4 h-4" /> Dashboard
                            </Link>
                            <Link
                                href="/catalog"
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/catalog")
                                        ? "bg-[#F59E0B] text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <Layers className="w-4 h-4 text-slate-400" /> Produits
                            </Link>
                            <Link
                                href="/analytics"
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/analytics")
                                        ? "bg-[#F59E0B] text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <BarChart3 className="w-4 h-4 text-slate-400" /> Sales Analytics
                            </Link>
                            <Link
                                href="/support"
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/support")
                                        ? "bg-[#F59E0B] text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <Headphones className="w-4 h-4 text-slate-400" /> Customer Support
                            </Link>
                            <Link
                                href="/settings"
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/settings")
                                        ? "bg-[#F59E0B] text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <Settings className="w-4 h-4 text-slate-400" /> Store Settings
                            </Link>
                        </nav>

                    </div>

                    <div className="text-[9px] text-slate-400 font-semibold text-center border-t border-slate-100 pt-4">
                        LinkBoutik • Fait pour l'Afrique
                    </div>
                </aside>
            </div>

        </div>
    );
}