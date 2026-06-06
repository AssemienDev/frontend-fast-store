// app/merchant/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {useMerchantAuthStore} from "@/store/merchantAuthStore";
import {
    Plus,
    ShoppingBag,
    Store,
    TrendingUp,
    ChevronRight
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";


interface ProductStat {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    slug: string;
    sales_count: number;
}


interface DashboardStats {
    sales_today: number;
    revenus_du_mois: number;
    pending_orders_count: number;
    total_customers: number;
    popular_products: ProductStat[];
}


export default function MerchantHomePage() {
    const router = useRouter();
    const { merchant, isAuthenticated} = useMerchantAuthStore();
    const [mounted, setMounted] = useState(false);

    // État pour les données du dashboard
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<any[]>([]); // Utilisez un schéma plus simple ici
    const [loadingStats, setLoadingStats] = useState(true);

    const [loading, setLoading] = useState(true);


    useEffect(() => {
        setMounted(true);

        // Garde d'authentification et de redirection automatique
        if (!isAuthenticated) {
            router.push("/register");
        } else if (merchant && !merchant.is_verified) {
            // Si connecté mais non-vérifié (OTP)
            router.push(`/verify-email?email=${encodeURIComponent(merchant.email)}`);
        } else if (merchant && merchant.role === "MERCHANT") {
            // Si l'onboarding de boutique (3 étapes) n'est pas encore complété
            router.push("/onboarding");
        }

        // Chargement des données du dashboard
        Promise.all([
            apiFetch<DashboardStats>("/merchant/dashboard/stats"),
            apiFetch<any[]>("/merchant/orders/recent") // Adaptez le schéma si nécessaire
        ]).then(([statsData, ordersData]) => {
            setStats(statsData);
            setRecentOrders(ordersData);
            setLoading(false);
        }).catch((err) => {
            console.error("Erreur lors du chargement du dashboard:", err);
            setLoading(false);
        });
    }, [isAuthenticated, merchant, router]);

    if (!mounted) return null;

    if (!isAuthenticated || !merchant || !merchant.is_verified || merchant.role === "MERCHANT") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-semibold">Chargement de votre espace de vente...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-semibold">Chargement de vos données...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-6xl w-full mx-auto">

            {/* 1. BANDEAU DE BIENVENUE & ACTIONS RAPIDES */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200/50">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                        Bonjour, {merchant.full_name?.split(" ")[0] || "Sarah"} !
                    </h1>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Voici un résumé de votre activité aujourd&#39;hui.</p>
                </div>

                {/* Raccourcis d'actions marchandes */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Link href="/catalog/new" className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-primary text-white font-extrabold text-xs hover:opacity-95 transition flex items-center justify-center gap-2 shadow-md shadow-primary/10 cursor-pointer">
                        <Plus className="w-4 h-4" /> Ajouter un produit
                    </Link>
                    <button className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-tertiary text-white font-extrabold text-xs hover:opacity-95 transition flex items-center justify-center gap-2 shadow-md shadow-tertiary/10 cursor-pointer">
                        <ShoppingBag className="w-4 h-4" /> Partager lien WhatsApp
                    </button>
                </div>
            </div>

            {/* 2. GRILLE COMPTEURS FINANCIERS ET LOGISTIQUES */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Ventes du jour */}
                    <div className="p-6 bg-white border border-slate-200/50 rounded-2xl shadow-sm flex flex-col justify-between h-40">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Ventes du jour</span>
                            <span className="p-1.5 rounded-lg bg-emerald-50 text-tertiary"><TrendingUp className="w-4 h-4" /></span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-black text-slate-900">{stats.sales_today.toLocaleString()} CFA</p>
                        </div>
                    </div>

                    {/* Revenus du mois */}
                    <div className="p-6 bg-white border border-slate-200/50 rounded-2xl shadow-sm flex flex-col justify-between h-40">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Revenus du mois</span>
                            <span className="p-1.5 rounded-lg bg-teal-50 text-primary"><Store className="w-4 h-4" /></span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-black text-slate-900">{stats.revenus_du_mois.toLocaleString()} CFA</p>
                        </div>
                    </div>

                    {/* Commandes en attente */}
                    <div className="p-6 bg-primary text-white rounded-3xl shadow-lg shadow-teal-900/10 flex items-center justify-between h-40 md:col-span-2 lg:col-span-1">
                        <div className="space-y-2">
                            <span className="text-[10px] text-teal-150 font-extrabold uppercase tracking-wider">Commandes en attente</span>
                            <p className="text-4xl font-black">{stats.pending_orders_count}</p>
                        </div>
                        <button className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs transition flex items-center gap-1.5 border border-white/10 cursor-pointer">
                            Traiter <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* 3. LISTE DES COMMANDES & PRODUITS POPULAIRES */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Dernières Commandes */}
                <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <h3 className="text-base font-black text-slate-900">Dernières Commandes</h3>
                        <button className="text-xs font-bold text-primary hover:underline cursor-pointer">Voir tout</button>
                    </div>

                    {recentOrders.length > 0 ? (
                        <div className="space-y-4">
                            {recentOrders.map((cmd) => (
                                <div key={cmd.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-2xl transition border border-transparent hover:border-slate-100 cursor-pointer">
                                    <div className="flex items-center gap-4">
                    <span className={`w-10 h-10 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${cmd.color || 'bg-slate-100 text-slate-800'}`}>
                      {cmd.initial || cmd.customer_name.charAt(0).toUpperCase() + cmd.customer_name.charAt(1).toLowerCase()}
                    </span>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-800">{cmd.customer_name}</h4>
                                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{cmd.code || "#CMD-" + cmd.tracking_number.slice(-4)} • {cmd.time || "Récemment"}</p>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-xs font-black text-slate-800">{cmd.total_amount.toLocaleString()} CFA</p>
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black ${
                                            cmd.payment_status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                        }`}>
                      {cmd.payment_status === "PAID" ? "PAYÉ" : "EN ATTENTE"}
                    </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-400 text-sm py-8">Aucune commande récente pour le moment.</p>
                    )}
                </div>

                {/* Produits Populaires */}
                <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <h3 className="text-base font-black text-slate-900">Produits Populaires</h3>
                        <span className="text-xs text-slate-400">★</span>
                    </div>

                    {stats && stats.popular_products.length > 0 ? (
                        <div className="space-y-4">
                            {stats.popular_products.map((prod) => (
                                <div key={prod.id} className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 border border-slate-100">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={prod.image_url || "/placeholder-product.png"} alt={prod.name} className="absolute inset-0 w-full h-full object-cover" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="text-xs font-black text-slate-800 leading-tight truncate">{prod.name}</h4>
                                        <p className="text-xs font-bold text-primary mt-1">{prod.price.toLocaleString()} CFA</p>
                                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Vendus : <span className="font-bold text-slate-600">{prod.sales_count}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-400 text-sm py-8">Pas encore de produits populaires.</p>
                    )}

                    <Link
                        href="/catalog"
                        className="w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold text-xs transition flex items-center justify-center gap-1.5 mt-3 cursor-pointer"
                    >
                        Voir le catalogue
                    </Link>
                </div>

            </div>

        </div>
    );
}