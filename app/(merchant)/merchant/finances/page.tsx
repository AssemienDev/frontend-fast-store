// app/merchant/finance/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Coins, TrendingUp, Landmark, ShieldCheck, RefreshCw, Calendar, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface FinanceSummary {
    available_balance: number;
    pending_balance: number;
    monthly_revenue: number;
    online_prepaid: number;
    cod_expected: number;
    hybrid_advances_collected: number;
    hybrid_cod_due: number;
}

interface TransactionItem {
    id: string;
    amount: number;
    type: string; // CREDIT | DEBIT
    status: string;
    created_at: string;
}

export default function MerchantFinancePage() {
    const router = useRouter();

    const [summary, setSummary] = useState<FinanceSummary | null>(null);
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [activeTab, setActiveTab] = useState("Tout");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiFetch<FinanceSummary>("/merchant/finance/summary"),
            apiFetch<TransactionItem[]>(`/merchant/finance/transactions?type=${activeTab}`)
        ]).then(([sumData, txsData]) => {
            setSummary(sumData);
            setTransactions(txsData);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [activeTab]);

    if (loading || !summary) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 animate-pulse">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-semibold">Chargement des données financières...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-6xl w-full mx-auto relative">

            {/* EN-TÊTE */}
            <div className="pb-6 border-b border-slate-100">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Finance</h1>
                <p className="text-xs font-semibold text-slate-400 mt-1">Gérez vos revenus, retraits et consultez l&#39;historique des transactions.</p>
            </div>

            {/* RANGÉE DE TABLEAUX DE BORD (IMAGE 1) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* BANDEAU GAUCHE : SOLDE DISPONIBLE (lg:col-span-8) */}
                <div className="lg:col-span-8 p-8 rounded-3xl bg-[#0F766E] text-white flex flex-col justify-between h-56 shadow-lg shadow-teal-900/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                    <div>
                        <span className="text-[10px] text-teal-200 font-extrabold uppercase tracking-wider block">Disponible pour retrait</span>
                        <h2 className="text-4xl font-black mt-3 tracking-tight">{summary.available_balance.toLocaleString()} FCFA</h2>
                    </div>
                    <button
                        onClick={() => router.push("/finances/retraits")}
                        className="px-6 py-3.5 rounded-xl bg-white hover:bg-teal-50 text-primary font-black text-xs md:text-sm self-start transition cursor-pointer shadow-sm"
                    >
                        Retirer les fonds
                    </button>
                </div>

                {/* COMPTEURS DROITE : ATTENTE ET REVENUS MENSUELS (lg:col-span-4) */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Solde en attente */}
                    <div className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-sm flex items-start justify-between h-26">
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Solde en attente</span>
                            <p className="text-lg font-black text-slate-800 mt-1.5">{summary.pending_balance.toLocaleString()} FCFA</p>
                            <span className="text-[9px] font-semibold text-slate-400 block mt-1">Commandes en cours de livraison</span>
                        </div>
                        <span className="p-2 rounded-xl bg-amber-50 text-secondary shrink-0"><RefreshCw className="w-4 h-4 animate-spin-slow" /></span>
                    </div>

                    {/* Revenu ce mois */}
                    <div className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-sm flex items-start justify-between h-23">
                        <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Revenus ce mois</span>
                            <p className="text-lg font-black text-[#0F766E] mt-1.5">{summary.monthly_revenue.toLocaleString()} FCFA</p>
                        </div>
                        <span className="p-2 rounded-xl bg-emerald-50 text-tertiary shrink-0"><TrendingUp className="w-4 h-4" /></span>
                    </div>
                </div>

            </div>

            {/* VENTILATION AVANCÉE COMPTABLE DEMANDÉE (PIEMONT HYBRIDE / EN LIGNE / COD) */}
            <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Ventilation des encaissements</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Payé en Ligne</span>
                        <p className="text-sm font-black text-slate-800 mt-2">{summary.online_prepaid.toLocaleString()} F</p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">À la Livraison (COD)</span>
                        <p className="text-sm font-black text-slate-800 mt-2">{summary.cod_expected.toLocaleString()} F</p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Acomptes Encaissés (Hybrides)</span>
                        <p className="text-sm font-black text-primary mt-2">{summary.hybrid_advances_collected.toLocaleString()} F</p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Dû à la Livraison (Hybrides)</span>
                        <p className="text-sm font-black text-secondary mt-2">{summary.hybrid_cod_due.toLocaleString()} F</p>
                    </div>
                </div>
            </div>

            {/* TABLEAU DES TRANSACTIONS (IMAGE 1) */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <h3 className="text-base font-black text-slate-900">Historique des transactions</h3>

                    <div className="flex flex-wrap gap-1">
                        {["Tout", "Ventes", "Retraits", "Frais"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                    activeTab === tab ? "bg-slate-100 text-slate-800 font-black" : "text-slate-400 hover:bg-slate-50"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {transactions.length > 0 ? (
                    <div className="space-y-4">
                        {transactions.map((tx) => {
                            const isCredit = tx.type === "CREDIT";
                            return (
                                <div key={tx.id} className="p-4 border border-slate-150 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isCredit ? "bg-emerald-50 text-tertiary" : "bg-slate-100 text-slate-500"
                    }`}>
                      {isCredit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </span>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-800">
                                                {isCredit ? "Vente / Crédit boutique" : "Débit / Virement ou Frais"}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                                Le {new Date(tx.created_at).toLocaleDateString("fr-FR")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xs font-black ${isCredit ? "text-tertiary" : "text-slate-800"}`}>
                                            {isCredit ? "+" : "-"} {tx.amount.toLocaleString()} FCFA
                                        </p>
                                        <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase mt-1 ${
                                            tx.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                                        }`}>
                      {tx.status === "COMPLETED" ? "Réussi" : "En cours"}
                    </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-slate-400 text-xs py-8">Aucune transaction trouvée.</p>
                )}
            </div>

        </div>
    );
}