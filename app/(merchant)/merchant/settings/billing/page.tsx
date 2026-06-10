// src/app/merchant/settings/billing/page.tsx
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Check, Lock, Smartphone, CreditCard, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    billing_cycle: string;
    features: Record<string, boolean | string | number>;
}

interface ActiveSub {
    plan_id: string;
    plan_name: string;
    status: string;
    end_date: string | null;
}

export default function MerchantBillingSettingsPage() {
    const router = useRouter();

    const [plans, setPlans] = useState<Plan[]>([]);
    const [activeSub, setActiveSub] = useState<ActiveSub | null>(null);
    const [loading, setLoading] = useState(true);

    // États de modale de facturation
    const [selectedPlanToPay, setSelectedPlanToPay] = useState<Plan | null>(null);
    const [payoutMethod, setPayoutMethod] = useState("WAVE");
    const [payoutNumber, setPayoutNumber] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const loadBillingData = async () => {
        setLoading(true);
        try {
            const [plansData, subData] = await Promise.all([
                apiFetch<Plan[]>("/storefront/plans"),
                apiFetch<ActiveSub>("/merchant/subscription")
            ]);
            setPlans(plansData);
            setActiveSub(subData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBillingData();
    }, []);

    const handlePlanSelect = async (plan: Plan) => {
        if (plan.price === 0) {
            // Si plan gratuit Débutant, l'activation est immédiate sans paiement
            setLoading(true);
            try {
                await apiFetch("/merchant/subscription/change", {
                    method: "POST",
                    body: JSON.stringify({ plan_id: plan.id, payout_number: "00000000" })
                });
                loadBillingData();
            } catch (err) {
                alert("Une erreur est survenue lors de la souscription.");
                setLoading(false);
            }
        } else {
            // Si plan payant, on ouvre la modale de facturation Mobile Money
            setSelectedPlanToPay(plan);
            setPayoutNumber("");
        }
    };

    const handleConfirmPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlanToPay || !payoutNumber) return;
        setSubmitting(true);

        try {
            const res: any = await apiFetch("/merchant/subscription/change", {
                method: "POST",
                body: JSON.stringify({
                    plan_id: selectedPlanToPay.id,
                    payout_method: payoutMethod,
                    payout_number: payoutNumber
                })
            });

            setSuccessMsg(res.message);
            setTimeout(() => {
                setIsAddOpen();
            }, 2500);
        } catch (err: any) {
            alert(err.message || "Échec de validation de la transaction.");
        } finally {
            setSubmitting(false);
        }
    };

    const setIsAddOpen = () => {
        setSelectedPlanToPay(null);
        setSuccessMsg(null);
        loadBillingData(); // Recharger les informations de forfait à jour
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-6xl w-full mx-auto relative">

            {/* EN-TÊTE DE PAGE */}
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Abonnements</h1>
                <p className="text-xs md:text-sm text-slate-500 mt-3 leading-relaxed">
                    Choisissez le plan adapté pour propulser votre boutique en ligne. Passez à la vitesse supérieure sans frais cachés.
                </p>
                <Link href="/settings/billing/history" className="w-1/2 py-3 mt-10 rounded-xl bg-primary text-white font-extrabold text-xs flex items-center justify-center cursor-pointer">
                    Mon Historique
                </Link>

            </div>

            {loading ? (
                /* CHARGEMENT */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-[450px] bg-slate-50 border rounded-2xl animate-pulse" />)}
                </div>
            ) : (
                /* LISTE DES FORFAITS DE LA MAQUETTE */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
                    {plans.map((plan) => {
                        const isCroissance = plan.name.toLowerCase().includes("croissance");
                        const isCurrent = activeSub?.plan_id === plan.id;

                        return (
                            <div
                                key={plan.id}
                                className={`p-6 md:p-8 rounded-3xl text-left flex flex-col justify-between relative transition-all duration-200 ${
                                    isCroissance
                                        ? "border-2 border-primary bg-white shadow-xl shadow-teal-900/5 scale-105 transform z-10"
                                        : "border border-slate-200 bg-white shadow-sm"
                                }`}
                            >
                                {isCroissance && (
                                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-[9px] font-black uppercase rounded-full tracking-wider">
                    Recommandé
                  </span>
                                )}

                                <div>
                                    <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
                                    <p className="text-xs text-slate-400 font-semibold mt-1.5 leading-relaxed">
                                        {plan.name === "Débutant" ? "Pour lancer votre première boutique" : isCroissance ? "Pour les marchands qui accélèrent" : "Pour les grandes opérations"}
                                    </p>

                                    <div className="mt-4 flex items-baseline">
                                        <span className="text-3xl font-black text-slate-900">{plan.price.toLocaleString()}</span>
                                        <span className="text-xs text-slate-400 font-bold ml-1.5">{plan.currency} / mois</span>
                                    </div>

                                    <ul className="mt-8 space-y-4 text-xs font-semibold text-slate-600">
                                        {Object.entries(plan.features).map(([feat, val]) => (
                                            <li key={feat} className="flex items-start gap-2.5">
                                                <span className="text-[#22C55E] font-bold text-sm shrink-0 mt-0.5">✓</span>
                                                <span>{feat.replace(/_/g, " ")}: <strong className="text-slate-800">{String(val)}</strong></span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    onClick={() => handlePlanSelect(plan)}
                                    disabled={isCurrent}
                                    className={`mt-8 w-full py-3.5 text-center font-extrabold text-xs rounded-xl transition duration-200 cursor-pointer ${
                                        isCurrent
                                            ? "bg-slate-100 text-slate-450 border border-slate-200 cursor-not-allowed"
                                            : isCroissance
                                                ? "bg-primary text-white hover:opacity-95 shadow-md shadow-teal-900/10"
                                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                    }`}
                                >
                                    {isCurrent ? "Votre forfait actuel" : "Sélectionner ce plan"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ========================================================= */}
            {/* MODALE : VIREMENT MENSUEL MOBILE MONEY SIMULÉ (BILLING GATEWAY) */}
            {/* ========================================================= */}
            {selectedPlanToPay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-sm w-full text-left space-y-5 shadow-2xl">

                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                            <Smartphone className="w-5 h-5 text-primary" />
                            <h3 className="text-sm font-black text-slate-900">Encaissement Mobile Money</h3>
                        </div>

                        {successMsg ? (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold leading-relaxed flex items-start gap-2 animate-scaleIn">
                                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-tertiary" /> {successMsg}
                            </div>
                        ) : (
                            <form onSubmit={handleConfirmPayment} className="space-y-4">
                                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                                    Vous vous apprêtez à souscrire au forfait <strong className="text-slate-700">{selectedPlanToPay.name}</strong> pour un montant mensuel de <strong className="text-primary">{selectedPlanToPay.price.toLocaleString()} FCFA</strong>.
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Opérateur</label>
                                        <select
                                            value={payoutMethod}
                                            onChange={(e) => setPayoutMethod(e.target.value)}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                                        >
                                            <option value="WAVE">Wave</option>
                                            <option value="ORANGE_MONEY">Orange Money</option>
                                            <option value="MTN_MONEY">MTN Money</option>
                                            <option value="MOOV_MONEY">Moov Flooz</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Numéro Mobile Money</label>
                                        <input
                                            type="tel" required value={payoutNumber}
                                            onChange={(e) => setPayoutNumber(e.target.value)}
                                            placeholder="Ex: +22507..."
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setSelectedPlanToPay(null)} className="w-1/2 py-3 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs">Annuler</button>
                                    <button type="submit" disabled={submitting} className="w-1/2 py-3 rounded-xl bg-primary text-white font-extrabold text-xs flex items-center justify-center cursor-pointer">
                                        {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Valider"}
                                    </button>
                                </div>
                            </form>
                        )}

                    </div>
                </div>
            )}

        </div>
    );
}