// app/merchant/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {useMerchantAuthStore} from "@/store/merchantAuthStore";
import {
    Plus,
    ShoppingBag,
    Store,
    Users,
    TrendingUp,
    LogOut,
    Layers
} from "lucide-react";


export default function MerchantHomePage() {
    const router = useRouter();
    const { merchant, isAuthenticated, clearCredentials } = useMerchantAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Redirection automatique si l'utilisateur n'est pas authentifié
        if (!isAuthenticated) {
            router.push("/register");
        }
    }, [isAuthenticated, router]);

    if (!mounted) return null;

    if (!isAuthenticated || !merchant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-semibold">Redirection vers l&#39;espace de connexion...</p>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        clearCredentials();
        router.push("/register");
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col">

            {/* BARRE DE NAVIGATION INTERNE MARCHAND */}
            <header className="bg-white border-b border-slate-200/60 px-6 h-16 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-sm">FS</span>
                    <span className="font-extrabold text-slate-800 text-sm tracking-tight">FastStore Marchand</span>
                </div>

                {/* PROFIL & LOGOUT */}
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-800">{merchant.full_name || "Commerçant"}</p>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">{merchant.role}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition"
                        title="Se déconnecter"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* CONTENU PRINCIPAL DU DASHBOARD */}
            <main className="grow max-w-7xl w-full mx-auto p-6 space-y-8">

                {/* EN-TÊTE DE BIENVENUE */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                            Bonjour, {merchant.full_name?.split(" ")[0] || "Sarah"} !
                        </h1>
                        <p className="text-xs text-slate-400 font-medium mt-1">Voici le résumé de l&#39;activité de votre boutique aujourd&#39;hui.</p>
                    </div>

                    {/* BOUTONS D'ACTIONS RAPIDES (Écran Dashboard) */}
                    <div className="flex gap-2 w-full md:w-auto">
                        <button className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:opacity-95 transition flex items-center justify-center gap-2 shadow-sm shadow-primary/10">
                            <Plus className="w-4 h-4" /> Ajouter un produit
                        </button>
                        <button className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center justify-center gap-2 shadow-sm">
                            <ShoppingBag className="w-4 h-4 text-slate-400" /> Créer une commande
                        </button>
                    </div>
                </div>

                {/* GRILLE DES COMPTEURS (METRICS) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* CARTE 1 : SOLDE DISPONIBLE */}
                    <div className="p-6 bg-white border border-slate-200/50 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Solde Disponible</span>
                            <span className="p-2 rounded-xl bg-emerald-50 text-[#22C55E]"><TrendingUp className="w-4 h-4" /></span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">450 000 FCFA</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1">Prêt pour le virement sur votre Mobile Money.</p>
                        </div>
                    </div>

                    {/* CARTE 2 : VENTES DU MOIS */}
                    <div className="p-6 bg-white border border-slate-200/50 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Ventes Cumulées</span>
                            <span className="p-2 rounded-xl bg-teal-50 text-[#0F766E]"><Store className="w-4 h-4" /></span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">1.2M FCFA</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1">Total généré sur l'ensemble de votre catalogue.</p>
                        </div>
                    </div>

                    {/* CARTE 3 : CLIENTS ENREGISTRÉS (CRM) */}
                    <div className="p-6 bg-white border border-slate-200/50 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between md:col-span-2 lg:col-span-1">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Répertoire Clients</span>
                            <span className="p-2 rounded-xl bg-amber-50 text-[#F59E0B]"><Users className="w-4 h-4" /></span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">142 clients</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1">Sauvegardés en toute sécurité hors de WhatsApp.</p>
                        </div>
                    </div>

                </div>

                {/* DIVISION INFÉRIEURE : PRODUITS POPULAIRES (Maquette 'Gestion des Produits') */}
                <div className="p-6 bg-white border border-slate-200/50 rounded-2xl shadow-sm space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Layers className="w-5 h-5 text-primary" />
                        <h3 className="text-base font-black text-slate-900">Vos Produits Populaires</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { id: 1, name: "Chemise Wax Blanket", price: "18 000 FCFA", stock: 15, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=150&q=80" },
                            { id: 2, name: "Huile essentielle", price: "8 500 FCFA", stock: 42, img: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=150&q=80" },
                            { id: 3, name: "Sac à main en paille", price: "25 000 FCFA", stock: 8, img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=150&q=80" }
                        ].map((prod) => (
                            <div key={prod.id} className="p-4 rounded-xl border border-slate-200/50 flex items-center gap-4 bg-slate-50/30">
                                <div className="w-14 h-14 rounded-lg overflow-hidden relative shrink-0 border border-slate-100">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={prod.img} alt={prod.name} className="absolute inset-0 w-full h-full object-cover" />
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="text-xs font-black text-slate-800 truncate">{prod.name}</h4>
                                    <p className="text-xs font-bold text-primary mt-1">{prod.price}</p>
                                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Stock restant : <span className="font-bold text-slate-600">{prod.stock}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </main>

        </div>
    );
}