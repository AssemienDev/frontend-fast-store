// src/app/merchant/settings/billing/renew/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, RefreshCw, CreditCard, ArrowRightLeft, ShieldCheck, Clock } from "lucide-react";

interface ActiveSubDetail {
    plan_id: string;
    plan_name: string;
    status: string;
    end_date: string | null;
    price?: number;
}

export default function MerchantBillingRenewPage() {
    const router = useRouter();

    const [sub, setSub] = useState<ActiveSubDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [renewing, setRenewing] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const loadSubscription = () => {
        setLoading(true);
        apiFetch<ActiveSubDetail>("/merchant/subscription")
            .then((data) => {
                setSub(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        loadSubscription();
    }, []);

    const handleRenewNow = async () => {
        if (!sub) return;
        setRenewing(true);
        setSuccess(null);

        try {
            const res: any = await apiFetch("/merchant/subscription/renew", {
                method: "POST"
            });
            setSuccess(res.message);
            setTimeout(() => {
                setSuccess(null);
                loadSubscription(); // Recharger la nouvelle date d'échéance à jour
            }, 2000);
        } catch (err: any) {
            alert(err.message || "Échec du renouvellement de votre abonnement.");
        } finally {
            setRenewing(false);
        }
    };

    if (loading || !sub) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 animate-pulse">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-semibold">Chargement de votre échéancier...</p>
                </div>
            </div>
        );
    }

    // Calcul du nombre de jours restants avant l'expiration
    const hasExpiration = sub.end_date !== null;
    const daysLeft = hasExpiration
        ? Math.ceil((new Date(sub.end_date!).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
        : null;

    const isExpiringSoon = daysLeft !== null && daysLeft <= 5; // Moins de 5 jours de validité

    return (
        <div className="bg-[#F8FAFC] min-h-screen py-16 md:py-24">
            <div className="max-w-xl mx-auto px-6 space-y-8">

                {/* HEADER */}
                <div className="flex items-center gap-4 pb-4 border-b border-slate-200/50">
                    <button onClick={() => router.push("/settings/billing")} className="btn btn-ghost btn-circle text-slate-500 cursor-pointer">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-primary" />
                        <h1 className="text-xl md:text-2xl font-black text-slate-900">Renouvellement</h1>
                    </div>
                </div>

                {/* NOTIFICATION D'ÉCHÉANCE EN COURS (IMAGE 2) */}
                {isExpiringSoon && (
                    <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl text-left flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-[#F59E0B] flex items-center justify-center shrink-0 border border-amber-200 animate-pulse">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-800">
                                Votre abonnement expire dans {daysLeft} jours
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                                Maintenez votre boutique en ligne et continuez à recevoir des commandes sans interruption.
                            </p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-start gap-2 animate-scaleIn">
                        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-tertiary" /> {success}
                    </div>
                )}

                {/* RÉCAPITULATIF DU PLAN ACTUEL (IMAGE 2) */}
                <div className="p-6 md:p-8 bg-white border border-slate-200/60 rounded-3xl shadow-sm text-left space-y-6">
                    <div className="flex justify-between items-center w-full">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Plan Actuel</span>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase rounded-md tracking-wider">
              {sub.status === "active" ? "Actif" : "Expiré"}
            </span>
                    </div>

                    <div className="flex justify-between items-baseline border-b border-slate-100 pb-5">
                        <h3 className="text-2xl font-black text-slate-800">{sub.plan_name}</h3>
                        <p className="text-xl font-black text-slate-800">
                            {sub.plan_name.includes("Croissance") ? "15 000" : "45 000"} <span className="text-xs font-semibold text-slate-400">FCFA/mois</span>
                        </p>
                    </div>

                    <ul className="space-y-4 text-xs font-semibold text-slate-600">
                        <li className="flex items-start gap-2.5">
                            <span className="text-tertiary font-bold">✓</span> Produits et commandes illimités
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="text-tertiary font-bold">✓</span> Support prioritaire WhatsApp
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="text-tertiary font-bold">✓</span> Outils marketing avancés
                        </li>
                    </ul>
                </div>

                {/* ACTIONS DE RENOUVELLEMENT OU DE CHANGEMENT (IMAGE 2) */}
                <div className="space-y-4">
                    <button
                        onClick={handleRenewNow}
                        disabled={renewing}
                        type="button"
                        className="w-full py-4 rounded-xl bg-primary text-white font-extrabold text-xs md:text-sm hover:opacity-95 transition flex items-center justify-center gap-2 shadow-md shadow-teal-900/10 cursor-pointer"
                    >
                        {renewing ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <CreditCard className="w-4 h-4" /> Renouveler maintenant
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => router.push("/settings/billing")}
                        type="button"
                        className="w-full py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-extrabold text-xs md:text-sm hover:bg-slate-50 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <ArrowRightLeft className="w-4 h-4 text-slate-400" /> Changer de plan
                    </button>
                </div>

            </div>
        </div>
    );
}