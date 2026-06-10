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
    LogOut, ChartBarStacked, BadgePercent, Megaphone, ListOrdered, UserRound, Landmark, DollarSign
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
    const [planName, setPlanName] = useState<string>("Chargement...");

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
            // 1. Charger les détails de la boutique
            if (!shop) {
                apiFetch<any>("/merchant/shop")
                    .then((shopData) => {
                        setShop(shopData);
                    })
                    .catch((err) => {
                        console.error("Échec du chargement de la boutique:", err);
                    });
            }

            // 2. NOUVEAU : Récupérer dynamiquement le forfait d'abonnement du marchand par l'API
            apiFetch<any>("/merchant/subscription")
                .then((subData) => {
                    setPlanName(subData.plan_name);
                })
                .catch(() => {
                    setPlanName("Forfait Gratuit");
                });
        }
    }, [isAuthenticated, merchant, pathname, shop, setShop]);

    if (!mounted) return null;

    const handleLogout = () => {
        clearCredentials();
        router.push("/");
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

                    {/* ACTIONS : CLOCHE, PROFIL CLIQUABLE & DECONNEXION */}
                    <div className="flex items-center gap-3">
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
                        {/* NOUVEAU : BOUTON AVATAR DE PROFIL CLIQUABLE (REDIRIGE VERS LA PAGE PROFIL) */}
                        <Link
                            href="/settings/profile"
                            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-200 transition"
                            title="Mon Profil"
                        >
                            <span className="font-extrabold text-xs text-slate-600">
                                {merchant?.full_name?.charAt(0).toUpperCase()}
                            </span>
                        </Link>

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
                                <h3 className="text-xs font-black text-slate-800 truncate">{merchant.full_name}</h3>
                                <span className="inline-block px-2 py-0.5 bg-amber-50 text-third text-[8px] font-black uppercase rounded-md mt-1 border border-amber-100">
                                  {planName}
                                </span>
                            </div>
                        </div>

                        {/* Menu de navigation des pages */}
                        <nav className="flex flex-col gap-1.5 text-xs font-bold text-slate-500">
                            <Link
                                href="/"
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition font-extrabold ${
                                    pathname === "/"
                                        ? "bg-third text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <Home className="w-4 h-4" /> Dashboard
                            </Link>
                            <Link
                                href="/catalog"
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/catalog")
                                        ? "bg-third text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <Layers className="w-4 h-4 text-slate-400" /> Produits
                            </Link>
                            <Link
                                href="/categories"
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/categories")
                                        ? "bg-third text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <ChartBarStacked  className="w-4 h-4 text-slate-400" /> Catégories
                            </Link>
                            <Link
                                href="/promo-code"
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/promo-code")
                                        ? "bg-third text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <BadgePercent className="w-4 h-4 text-slate-400" /> Code promo
                            </Link>
                            <Link
                                href="/marketing-shop"
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/marketing-shop")
                                        ? "bg-third text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <Megaphone className="w-4 h-4 text-slate-400" /> Code promo
                            </Link>
                            <Link
                                href="/commandes"
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/commandes")
                                        ? "bg-third text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <ListOrdered  className="w-4 h-4 text-slate-400" /> Commandes
                            </Link>
                            <Link
                                href="/clients"
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/clients")
                                        ? "bg-third text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <UserRound  className="w-4 h-4 text-slate-400" /> Clients
                            </Link>
                            <Link
                                href="/finances"
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/finances")
                                        ? "bg-third text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <Landmark  className="w-4 h-4 text-slate-400" /> Finances
                            </Link>
                            <Link
                                href="/settings/billing"
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/settings/billing")
                                        ? "bg-third text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <DollarSign className="w-4 h-4 text-slate-400" /> Abonnement
                            </Link>
                            <Link
                                href="/settings"
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/settings")
                                        ? "bg-third text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <Settings className="w-4 h-4 text-slate-400" /> Paramètre boutique
                            </Link>

                        </nav>

                    </div>

                    <div className="text-[9px] text-slate-400 font-semibold text-center border-t border-slate-100 pt-4">
                        LinkBoutik • Fait pour l&#39;Afrique
                    </div>
                </aside>
            </div>

        </div>
    );
}