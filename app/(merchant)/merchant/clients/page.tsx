// app/merchant/customers/page.tsx
"use client";

import { useState, useEffect } from "react";
import {useRouter, useSearchParams} from "next/navigation";
import { apiFetch } from "@/lib/api";
import {Search, UserPlus, Phone, Lock, ShieldAlert, Users, ChartAreaIcon} from "lucide-react";
import Link from "next/link";

interface Customer {
    id: string;
    full_name: string;
    phone_number: string;
    email: string | null;
    total_orders_count: number;
    total_spent: number;
}

export default function MerchantCustomersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeSegmentFilter = searchParams.get("segment") || ""; // Récupère le segment depuis l'URL

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);


    // Modales
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [isPremiumOpen, setIsPremiumOpen] = useState(false);
    const [isPremiumOpen2, setIsPremiumOpen2] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Formulaire d'ajout
    const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const data = await apiFetch<Customer[]>(`/merchant/customers?q=${search}`);
            setCustomers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, activeSegmentFilter]);

    // Déclencher la création (Gated Premium)
    const handleOpenAddModal = async (defaut:number) => {
        // Vérifier de manière asynchrone si le profil est Premium lors du clic
        try {
            const subData = await apiFetch<any>("/merchant/subscription");

            const isPremium =
                subData.plan_name?.toUpperCase() !== "STARTER";

            if (!isPremium) {
                if (defaut === 1) {
                    setIsPremiumOpen(true);
                } else if (defaut === 2) {
                    setIsPremiumOpen2(true);
                }
                return;
            }

            if (defaut === 1) {
                setIsAddOpen(true);
            } else if (defaut === 2) {
                router.push("/clients/segments");
            }
        } catch (err: any) {
            if (err.status === 402) {
                if(defaut === 1){
                    setIsPremiumOpen(true); // Bloquer par le paywall
                }else if(defaut === 2){
                    setIsPremiumOpen2(true); // Bloquer par le paywall
                }
            }
        }
    };

    const handleCreateCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const newCust = await apiFetch<Customer>("/merchant/customers", {
                method: "POST",
                body: JSON.stringify({
                    full_name: form.name,
                    phone_number: form.phone,
                    email: form.email || null,
                    address: form.address || null,
                    notes: form.notes || null
                })
            });

            setCustomers([newCust, ...customers]);
            setIsAddOpen(false);
            setForm({ name: "", phone: "", email: "", address: "", notes: "" });
        } catch (err: any) {
            alert(err.message || "Échec de création du client.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-6xl w-full mx-auto relative">

            {/* EN-TÊTE ET BOUTON CRÉATION */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Répertoire Clients</h1>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Gérez votre base de contacts, analysez la fidélité et relancez vos prospects.</p>
                    <button
                        onClick={() => handleOpenAddModal(2)}
                        type="button"
                        className="px-5 mt-4 py-3 rounded-xl bg-primary text-white font-extrabold text-xs hover:opacity-95 transition flex items-center justify-center gap-2 shadow-md shadow-teal-900/10 cursor-pointer"
                    >
                        <ChartAreaIcon className="w-4 h-4" /> Segmentations clients
                    </button>
                </div>
                <button
                    onClick={() => handleOpenAddModal(1)}
                    type="button"
                    className="px-5 py-3 rounded-xl bg-primary text-white font-extrabold text-xs hover:opacity-95 transition flex items-center justify-center gap-2 shadow-md shadow-teal-900/10 cursor-pointer"
                >
                    <UserPlus className="w-4 h-4" /> Nouveau Client
                </button>
            </div>

            {/* RANGÉE DE RECHERCHE ET BADGE D'ANNULATION DU FILTRE DE SEGMENT */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="relative flex-grow">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Chercher un nom ou téléphone..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none"
                    />
                </div>

                {/* COMPOSANT PREMIUM : Affiche un badge d'annulation si un filtre est actif */}
                {activeSegmentFilter && (
                    <div className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2.5 rounded-xl text-xs font-bold">
                    <span>Filtre actif : {
                        activeSegmentFilter === "NOUVEAUX" ? "Nouveaux" :
                            activeSegmentFilter === "FIDELES" ? "Fidèles" :
                                activeSegmentFilter === "GROS" ? "Gros acheteurs" : "Inactifs"
                    }</span>
                        <button
                            onClick={() => router.push("/merchant/customers")} // Réinitialise l'URL sans paramètre
                            className="text-primary hover:text-slate-800 font-extrabold cursor-pointer ml-1"
                            title="Annuler le filtre"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>

            {/* GRILLE DES CARTES CLIENTS */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-44 bg-slate-50 border rounded-2xl animate-pulse" />)}
                </div>
            ) : customers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {customers.map((c) => {
                        const initials = c.full_name.charAt(0).toUpperCase() + c.full_name.split(" ")[1]?.charAt(0).toUpperCase() || "";
                        return (
                            <div
                                key={c.id}
                                onClick={() => router.push(`/clients/details/${c.id}`)}
                                className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition duration-200 cursor-pointer flex flex-col justify-between h-48"
                            >
                                {/* Ligne d'en-tête (Avatar, Nom & Téléphone) */}
                                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-full bg-teal-50 text-primary font-black text-xs flex items-center justify-center shrink-0">
                    {initials}
                  </span>
                                    <div className="overflow-hidden">
                                        <h3 className="text-sm font-black text-slate-800 truncate leading-snug">{c.full_name}</h3>
                                        <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                                            <Phone className="w-3 h-3" /> {c.phone_number}
                                        </p>
                                    </div>
                                </div>

                                {/* Blocs intérieurs de fidélité de maquette */}
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl text-left">
                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Commandes</span>
                                        <span className="text-lg font-black text-slate-800 block mt-1">{c.total_orders_count}</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl text-left">
                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Total Dépensé</span>
                                        <span className="text-lg font-black text-primary block mt-1 truncate">
                      {Math.round(c.total_spent / 1000)}K F
                    </span>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 p-8 border border-dashed border-slate-200 rounded-2xl bg-white max-w-md mx-auto">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium text-sm">Aucun client trouvé dans le répertoire.</p>
                </div>
            )}

            {/* ========================================================= */}
            {/* 1. MODALE AJOUT NOUVEAU CLIENT (SÉCURISÉ PREMIUM) */}
            {/* ========================================================= */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-sm w-full text-left space-y-5 shadow-2xl">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                            <UserPlus className="w-5 h-5 text-primary" />
                            <h3 className="text-sm font-black text-slate-900">Nouveau Client CRM</h3>
                        </div>
                        <form onSubmit={handleCreateCustomer} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Nom complet *</label>
                                <input
                                    type="text" required value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Ex: Aminata Diallo"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Téléphone *</label>
                                <input
                                    type="tel" required value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="Ex: +221771234567"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Email (Optionnel)</label>
                                <input
                                    type="email" value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="aminata@example.com"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="w-1/2 py-3 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs">Annuler</button>
                                <button type="submit" disabled={submitting} className="w-1/2 py-3 rounded-xl bg-primary text-white font-extrabold text-xs flex items-center justify-center">
                                    {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Créer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 2. MODALE PAYWALL BILLING UPGRADE */}
            {/* ========================================================= */}
            {isPremiumOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-amber-50 text-[#F59E0B] flex items-center justify-center mx-auto border border-amber-100">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">Module Client Pro</h3>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                La création manuelle de fiches clients et la relance marketing d&#39;une base de prospects sont réservées exclusivement aux membres **Business** et **Pro**.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setIsPremiumOpen(false)} className="w-1/2 py-3 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs">Fermer</button>
                            <button
                                type="button"
                                onClick={() => router.push("/settings/billing")}
                                className="w-1/2 py-3 rounded-xl bg-[#F59E0B] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <ShieldAlert className="w-4 h-4" /> Passer Pro
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isPremiumOpen2 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-amber-50 text-[#F59E0B] flex items-center justify-center mx-auto border border-amber-100">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">Module Segmentation</h3>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                La création de fiches clients et la relance marketing de votre base de prospects sont réservées exclusivement aux membres Business et Pro.
                                Le système segmente automatiquement vos clients en 4 grandes catégories afin d’offrir une vue avancée des interactions et du comportement client.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setIsPremiumOpen2(false)} className="w-1/2 py-3 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs">Fermer</button>
                            <button
                                type="button"
                                onClick={() => router.push("/settings/billing")}
                                className="w-1/2 py-3 rounded-xl bg-[#F59E0B] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <ShieldAlert className="w-4 h-4" /> Passer Pro
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}