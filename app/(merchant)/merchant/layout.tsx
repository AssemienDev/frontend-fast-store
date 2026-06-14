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
import Image from "next/image";
import { FaWrench } from "react-icons/fa";
import {TbPointFilled} from "react-icons/tb";


export default function MerchantLayout({
                                           children,
                                       }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { merchant, shop, setShop, isAuthenticated, clearCredentials } = useMerchantAuthStore();
    const [isPremium, setIsPremium] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [planName, setPlanName] = useState<string>("Chargement...");
    const [unreadCount, setUnreadCount] = useState<number>(0);

    const [togglingMode, setTogglingMode] = useState(false);

    useEffect(() => {
        setMounted(true);
        document.title = "LinkBoutik - Espace Marchand";
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

            apiFetch<any>("/merchant/shop")
                    .then((shopData) => {
                        console.log(shopData);
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
                setIsPremium(
                    subData.plan_name?.toUpperCase() !== "STARTER"
                );
            })
            .catch(() => {
                setPlanName("Starter");
            });
        apiFetch<{ count: number }>("/merchant/notifications/unread-count")
            .then((res) => {
                setUnreadCount(res.count);
            })
            .catch(() => setUnreadCount(0));
    }, [isAuthenticated, merchant, pathname, shop, setShop]);

    if (!mounted) return null;

    const handleLogout = () => {
        clearCredentials();
        console.log("logout");
        router.push("/login");
    };

    const handleToggleTestMode = async () => {
        if (!shop || togglingMode) return;
        setTogglingMode(true);
        try {
            const updatedShop = await apiFetch<any>("/merchant/shop/toggle-mode", { method: "PATCH" });
            setShop(updatedShop); // Met à jour l'état global du store Zustand
        } catch (err) {
            console.error("Échec de basculement de mode:", err);
        } finally {
            setTogglingMode(false);
        }
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
        <div className="drawer lg:drawer-open min-h-screen bg-white text-slate-800 antialiased">
            <input id="merchant-drawer" type="checkbox" className="drawer-toggle" />

            {/* SECTION DROITE : CONTENU DYNAMIQUE DES PAGES */}
            <div className="drawer-content bg-white flex flex-col min-h-screen">

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
                            <h2 className="text-sm font-black text-slate-800">
                                {shop ? shop.name : "Chargement..."}
                            </h2>
                        </div>
                    </div>

                    {shop && (
                        <div className="flex items-center gap-2 p-1.5 px-3 rounded-full bg-slate-50 border border-slate-150">
                            {/* Commutateur de mode (Toggle switch) */}
                            <input
                                type="checkbox"
                                checked={!shop.is_test_mode} // Si is_test_mode est False, la boutique est Live (checked)
                                disabled={togglingMode}
                                onChange={handleToggleTestMode}
                                className="toggle toggle-success toggle-xs cursor-pointer disabled:opacity-50"
                            />

                            {/* Affichage des badges de couleur de la maquette */}
                            {shop.is_test_mode ? (
                                <span className="text-[9px] font-black text-[#F59E0B] uppercase tracking-wide flex items-center gap-1 animate-pulse">
                                    <FaWrench className="text-[#F59E0B]" /> Mode Test
                                </span>
                            ) : (
                                <span className="text-[9px] font-black text-[#22C55E] uppercase tracking-wide flex items-center gap-1">
                                    <TbPointFilled className="text-[#22C55E]" /> Boutique Live
                                </span>
                            )}
                        </div>
                    )}

                    {/* Logo LinkBoutik */}
                    <div className="flex items-center gap-2">
                        <Image
                            src="/logo2.png"
                            alt="LinkBoutik"
                            width={150}
                            height={116}
                            priority
                        />
                    </div>

                    {/* ACTIONS : CLOCHE, PROFIL CLIQUABLE & DECONNEXION */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/notifications" // Redirige vers la page de fil de notifications
                            className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition"
                            title="Consulter vos notifications"
                        >
                            <Bell className="w-5 h-5" />
                            {/* Affiche la puce orange uniquement s'il y a au moins 1 notification non lue ! */}
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-white animate-pulse" />
                            )}
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-rose-50 border border-slate-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                            title="Se déconnecter"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                        {/* NOUVEAU : BOUTON AVATAR DE PROFIL CLIQUABLE (REDIRIGE VERS LA PAGE PROFIL) */}
                        <Link
                            href="/profile"
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
                <main className="grow bg-white">
                    {children}
                </main>
            </div>

            {/* SECTION GAUCHE : LE MENU DRAWER LATÉRAL COLLANT */}
            <div className="drawer-side bg-white z-50">
                <label htmlFor="merchant-drawer" className="drawer-overlay" />

                <aside className="w-64 h-full bg-white  border-r border-slate-200/60 p-6 flex flex-col justify-between">
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
                                onClick={() => {
                                    const drawer = document.getElementById("merchant-drawer") as HTMLInputElement;
                                    if (drawer) drawer.checked = false;
                                }}
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
                                onClick={() => {
                                    const drawer = document.getElementById("merchant-drawer") as HTMLInputElement;
                                    if (drawer) drawer.checked = false;
                                }}
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
                                onClick={() => {
                                    const drawer = document.getElementById("merchant-drawer") as HTMLInputElement;
                                    if (drawer) drawer.checked = false;
                                }}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/categories")
                                        ? "bg-third text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <ChartBarStacked  className="w-4 h-4 text-slate-400" /> Catégories
                            </Link>
                            { isPremium && (
                                <Link
                                    href="/promo-code"
                                    onClick={() => {
                                        const drawer = document.getElementById("merchant-drawer") as HTMLInputElement;
                                        if (drawer) drawer.checked = false;
                                    }}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                        pathname.startsWith("/promo-code")
                                            ? "bg-third text-white shadow-sm"
                                            : "hover:bg-slate-50 hover:text-slate-800"
                                    }`}
                                >
                                    <BadgePercent className="w-4 h-4 text-slate-400" /> Code promo
                                </Link>
                            )}
                            <Link
                                href="/marketing-shop"
                                onClick={() => {
                                    const drawer = document.getElementById("merchant-drawer") as HTMLInputElement;
                                    if (drawer) drawer.checked = false;
                                }}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/marketing-shop")
                                        ? "bg-third text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <Megaphone className="w-4 h-4 text-slate-400" /> Marketing
                            </Link>
                            <Link
                                href="/commandes"
                                onClick={() => {
                                    const drawer = document.getElementById("merchant-drawer") as HTMLInputElement;
                                    if (drawer) drawer.checked = false;
                                }}
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
                                onClick={() => {
                                    const drawer = document.getElementById("merchant-drawer") as HTMLInputElement;
                                    if (drawer) drawer.checked = false;
                                }}
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
                                onClick={() => {
                                    const drawer = document.getElementById("merchant-drawer") as HTMLInputElement;
                                    if (drawer) drawer.checked = false;
                                }}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/finances")
                                        ? "bg-third text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <Landmark  className="w-4 h-4 text-slate-400" /> Finances
                            </Link>
                            <Link
                                href="/billing"
                                onClick={() => {
                                    const drawer = document.getElementById("merchant-drawer") as HTMLInputElement;
                                    if (drawer) drawer.checked = false;
                                }}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/billing")
                                        ? "bg-third text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <DollarSign className="w-4 h-4 text-slate-400" /> Abonnement
                            </Link>
                            <Link
                                href="/settings"
                                onClick={() => {
                                    const drawer = document.getElementById("merchant-drawer") as HTMLInputElement;
                                    if (drawer) drawer.checked = false;
                                }}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/settings")
                                        ? "bg-third text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <Settings className="w-4 h-4 text-slate-400" /> Paramètre boutique
                            </Link>
                            <Link
                                href="/support"
                                onClick={() => {
                                    const drawer = document.getElementById("merchant-drawer") as HTMLInputElement;
                                    if (drawer) drawer.checked = false;
                                }}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition ${
                                    pathname.startsWith("/support")
                                        ? "bg-third text-white shadow-sm"
                                        : "hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <Settings className="w-4 h-4 text-slate-400" /> Service Assistance
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