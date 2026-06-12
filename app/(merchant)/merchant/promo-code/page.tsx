// app/merchant/catalog/promos/page.tsx
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Ticket, Percent, Coins, Share2, Calendar, Clock, Plus, Trash2, Edit2, Lock, ShieldAlert } from "lucide-react";
import {router} from "next/client";

interface PromoCode {
    id: string;
    code: string;
    discount_type: string; // PERCENTAGE | FIXED_AMOUNT
    discount_value: number;
    min_order_amount: number;
    usage_limit: number | null;
    use_count: number;
    expires_at: string | null;
    is_active: boolean;
}

export default function MerchantPromosPage() {
    const [promos, setPromos] = useState<PromoCode[]>([]);
    const [activeTab, setActiveTab] = useState<"ACTIVE" | "EXPIRED">("ACTIVE");
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(true); // Gère le verrouillage d'abonnement
    const [error, setError] = useState<string | null>(null);

    // États pour les modales unifiées
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [promoToEdit, setPromoToEdit] = useState<PromoCode | null>(null);
    const [promoToDelete, setPromoToDelete] = useState<PromoCode | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Formulaire d'ajout/édition
    const [form, setForm] = useState({
        code: "",
        discount_type: "PERCENTAGE",
        discount_value: 0,
        min_order_amount: 0,
        usage_limit: "",
        expires_at: ""
    });

    const loadPromos = async () => {
        setLoading(true);
        try {
            const data = await apiFetch<PromoCode[]>("/merchant/promos");
            setPromos(data);
            setIsPremium(true);
        } catch (err: any) {
            if (err.status === 402) {
                setIsPremium(false); // Bloque l'interface si l'abonnement n'est pas premium
            } else {
                setError(err.message || "Échec du chargement des codes promo.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPromos();
    }, []);

    const handleCreatePromo = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const newPromo = await apiFetch<PromoCode>("/merchant/promos", {
                method: "POST",
                body: JSON.stringify({
                    ...form,
                    usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
                    expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
                }),
            });
            setPromos([newPromo, ...promos]);
            setIsAddOpen(false);
            resetForm();
        } catch (err: any) {
            setError(err.message || "Échec de la création du code.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditPromo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!promoToEdit) return;
        setSubmitting(true);
        setError(null);

        try {
            const updated = await apiFetch<PromoCode>(`/merchant/promos/${promoToEdit.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    ...form,
                    usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
                    expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
                }),
            });
            setPromos(promos.map(p => p.id === promoToEdit.id ? updated : p));
            setPromoToEdit(null);
            resetForm();
        } catch (err: any) {
            setError(err.message || "Échec de la modification.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePromo = async () => {
        if (!promoToDelete) return;
        setSubmitting(true);

        try {
            await apiFetch(`/merchant/promos/${promoToDelete.id}`, { method: "DELETE" });
            setPromos(promos.filter(p => p.id !== promoToDelete.id));
            setPromoToDelete(null);
        } catch (err: any) {
            setError(err.message || "Échec de la suppression.");
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setForm({ code: "", discount_type: "PERCENTAGE", discount_value: 0, min_order_amount: 0, usage_limit: "", expires_at: "" });
    };

    // Filtrer les codes selon l'onglet actif (Actifs vs Expirés)
    const displayedPromos = promos.filter((p) => {
        const isExpired = p.expires_at && new Date(p.expires_at) < new Date();
        if (activeTab === "ACTIVE") return p.is_active && !isExpired;
        return !p.is_active || isExpired;
    });

    // --- CAS SÉCURITÉ : INVITATION MISE À NIVEAU (SI FORFAIT GRATUIT) ---
    if (!isPremium) {
        return (
            <div className="p-8 max-w-xl mx-auto text-center space-y-6 bg-white border border-slate-200 rounded-3xl mt-12 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-[#F59E0B] flex items-center justify-center mx-auto border border-amber-100 animate-bounce">
                    <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">Module Premium : Codes Promo</h2>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                    Générez des codes de réduction personnalisés pour vos Stories, fidélisez vos meilleurs acheteurs et augmentez vos ventes sur WhatsApp ! Cette fonctionnalité d'élite requiert un forfait **Business** ou **Pro**.
                </p>
                <button
                    onClick={() => router.push("/billing")}
                    className="px-6 py-3 rounded-xl bg-primary text-white font-extrabold text-xs md:text-sm hover:opacity-95 transition inline-flex items-center gap-2 cursor-pointer shadow-md shadow-primary/10"
                >
                    <ShieldAlert className="w-4 h-4" /> Passer au forfait Premium
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-6xl w-full mx-auto relative">

            {/* EN-TÊTE ET BOUTON CRÉATION */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Codes Promo</h1>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Gérez vos réductions et offres spéciales.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsAddOpen(true); }}
                    className="px-5 py-3 rounded-xl bg-primary text-white font-extrabold text-xs hover:opacity-95 transition flex items-center justify-center gap-2 shadow-md shadow-teal-900/10 cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Nouveau Code
                </button>
            </div>

            {error && <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">{error}</div>}

            {/* ONGLETS ACTIFS (3) / EXPIRÉS (12) DE MAQUETTE */}
            <div className="border-b border-slate-200 flex gap-6 text-xs md:text-sm font-black text-slate-400">
                <button
                    onClick={() => setActiveTab("ACTIVE")}
                    className={`pb-3 transition relative cursor-pointer ${activeTab === "ACTIVE" ? "text-slate-900 border-b-2 border-primary" : "hover:text-slate-600"}`}
                >
                    Actifs ({promos.filter(p => p.is_active && (!p.expires_at || new Date(p.expires_at) >= new Date())).length})
                </button>
                <button
                    onClick={() => setActiveTab("EXPIRED")}
                    className={`pb-3 transition relative cursor-pointer ${activeTab === "EXPIRED" ? "text-slate-900 border-b-2 border-primary" : "hover:text-slate-600"}`}
                >
                    Expirés ({promos.filter(p => !p.is_active || (p.expires_at && new Date(p.expires_at) < new Date())).length})
                </button>
            </div>

            {/* GRILLE DES CARTES DE CODES PROMO */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-44 bg-slate-50 border rounded-2xl animate-pulse" />)}
                </div>
            ) : displayedPromos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {displayedPromos.map((promo) => {
                        const isPercentage = promo.discount_type === "PERCENTAGE";
                        const hasExpiration = promo.expires_at !== null;
                        const daysLeft = hasExpiration ? Math.ceil((new Date(promo.expires_at!).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;

                        return (
                            <div key={promo.id} className="bg-white border border-slate-200/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between h-48 relative">

                                {/* Ligne d'en-tête (Tag de valeur de réduction & badge actif) */}
                                <div className="flex justify-between items-center w-full">
                  <span className="px-2.5 py-1.5 rounded-lg bg-primary text-white text-[10px] font-black tracking-wide flex items-center gap-1">
                    {isPercentage ? <Percent className="w-3 h-3" /> : <Coins className="w-3 h-3" />}
                      {isPercentage ? `-${promo.discount_value}%` : `-${promo.discount_value.toLocaleString()} CFA`}
                  </span>
                                    <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-wider ${
                                        promo.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                                    }`}>
                    {promo.is_active ? "Actif" : "Inactif"}
                  </span>
                                </div>

                                {/* Nom du Code & Compteur d'usages cumulatif */}
                                <div className="space-y-1 pt-4 grow">
                                    <h3 className="text-lg font-black text-slate-900 tracking-wide uppercase">{promo.code}</h3>
                                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                                        👥 {promo.use_count} / {promo.usage_limit ? promo.usage_limit : "∞"} utilisations
                                    </p>
                                </div>

                                {/* Pied de carte (Date d'expiration & boutons d'actions) */}
                                <div className="flex justify-between items-center border-t border-slate-100 pt-3 w-full">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                        {hasExpiration ? (
                                            daysLeft && daysLeft <= 2 ? (
                                                <span className="text-[#F59E0B] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Expire dans {daysLeft}j
                        </span>
                                            ) : (
                                                <span className="text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Expire le {new Date(promo.expires_at!).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </span>
                                            )
                                        ) : (
                                            <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Sans expiration
                      </span>
                                        )}
                                    </div>

                                    {/* Actions (Édition & Suppression Hybride) */}
                                    <div className="flex items-center gap-1 text-slate-400">
                                        <button
                                            onClick={() => {
                                                setPromoToEdit(promo);
                                                setForm({
                                                    code: promo.code,
                                                    discount_type: promo.discount_type,
                                                    discount_value: promo.discount_value,
                                                    min_order_amount: promo.min_order_amount,
                                                    usage_limit: promo.usage_limit ? String(promo.usage_limit) : "",
                                                    expires_at: promo.expires_at ? promo.expires_at.slice(0, 16) : ""
                                                });
                                            }}
                                            className="p-1.5 hover:bg-slate-50 hover:text-primary rounded-lg transition cursor-pointer"
                                            title="Modifier"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setPromoToDelete(promo)}
                                            className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition cursor-pointer"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 p-8 border border-dashed border-slate-200 rounded-2xl bg-white max-w-md mx-auto">
                    <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium text-sm">Aucun code promo créé dans cet onglet.</p>
                </div>
            )}

            {/* ========================================================= */}
            {/* 1. MODALE AJOUT (SPA) */}
            {/* ========================================================= */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-md w-full text-left space-y-4 shadow-2xl">
                        <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2"><Plus className="w-4 h-4" /> Nouveau Code Promo</h3>
                        <form onSubmit={handleCreatePromo} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Code de réduction (Majuscules)</label>
                                <input
                                    type="text" required value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    placeholder="Ex: SOLDES2024"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Type de réduction</label>
                                    <select
                                        value={form.discount_type}
                                        onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-700"
                                    >
                                        <option value="PERCENTAGE">Pourcentage (%)</option>
                                        <option value="FIXED_AMOUNT">Valeur fixe (CFA)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Valeur de réduction</label>
                                    <input
                                        type="number" required value={form.discount_value || ""}
                                        onChange={(e) => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })}
                                        placeholder="Ex: 15 ou 1500"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Usage Max (Optionnel)</label>
                                    <input
                                        type="number" value={form.usage_limit}
                                        onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                                        placeholder="Ex: 100, ou laisser vide pour infini"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-850"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Date d'expiration</label>
                                    <input
                                        type="datetime-local" value={form.expires_at}
                                        onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-700 focus:outline-none"
                                    />
                                </div>
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
            {/* 2. MODALE SUPPRESSION HYBRIDE DE PROTECTION */}
            {/* ========================================================= */}
            {promoToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">Supprimer le code promo</h3>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                Voulez-vous vraiment supprimer le code <strong className="text-slate-700">{promoToDelete.code}</strong> ?
                            </p>
                            {promoToDelete.use_count > 0 ? (
                                <p className="text-[10px] text-[#F59E0B] font-bold mt-2">
                                    *Ce code ayant déjà été utilisé {promoToDelete.use_count} fois, il sera désactivé et archivé pour ne pas fausser votre comptabilité analytique de ventes.
                                </p>
                            ) : (
                                <p className="text-[10px] text-rose-500 font-bold mt-2">
                                    *Ce code n'ayant jamais servi, il sera définitivement effacé de la base de données de la boutique.
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setPromoToDelete(null)} disabled={submitting} className="w-1/2 py-3 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs">Annuler</button>
                            <button type="button" onClick={handleDeletePromo} disabled={submitting} className="w-1/2 py-3 rounded-xl bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center">
                                {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Supprimer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}