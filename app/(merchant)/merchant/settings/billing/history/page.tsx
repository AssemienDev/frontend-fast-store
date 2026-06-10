// src/app/merchant/settings/billing/history/page.tsx
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Download, FileText, ChevronDown, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Invoice {
    id: string;
    invoice_number: string;
    amount_paid: number;
    currency: string;
    created_at: string;
    download_url: string | null;
}

interface ActiveSub {
    plan_name: string;
    price?: number;
    status: string;
    end_date: string | null;
}

export default function MerchantBillingHistoryPage() {
    const router = useRouter();

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [sub, setSub] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiFetch<Invoice[]>("/merchant/subscription/invoices"),
            apiFetch<any>("/merchant/subscription")
        ])
            .then(([invsData, subData]) => {
                setInvoices(invsData);
                setSub(subData);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 animate-pulse">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-semibold">Chargement de vos factures...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-neutra min-h-screen py-16 md:py-24">
            <div className="max-w-xl mx-auto px-6 space-y-8">

                {/* EN-TÊTE */}
                <div className="flex items-center gap-4 pb-4 border-b border-slate-200/50">
                    <button onClick={() => router.push("/settings/billing")} className="btn btn-ghost btn-circle text-slate-500 cursor-pointer">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900">Historique</h1>
                        <p className="text-xs text-slate-400 font-semibold mt-1">Gérez et consultez vos factures d'abonnement.</p>
                    </div>
                </div>

                {/* COMPTEUR DU PROCHAIN PRÉLÈVEMENT PRÉVU (IMAGE 1) */}
                {sub && sub.end_date && (
                    <div className="p-6 bg-white border-t-4 border-primary border-x border-b border-slate-200/60 rounded-2xl shadow-sm flex items-center justify-between text-left">
                        <div>
                            <span className="text-[9px] text-[#0F766E] font-black uppercase tracking-wider block">Prochain prélèvement prévu</span>
                            <p className="text-2xl font-black text-slate-900 mt-2">
                                {sub.plan_name.includes("Croissance") ? "15 000" : "45 000"} FCFA
                            </p>
                        </div>
                        <div className="text-right text-xs font-black text-slate-800">
                            {new Date(sub.end_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                    </div>
                )}

                {/* LISTE DES FACTURES (IMAGE 1) */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-800">Factures payées</h3>

                    {invoices.length > 0 ? (
                        <div className="space-y-3">
                            {invoices.map((inv) => (
                                <div key={inv.id} className="p-4 bg-white border border-slate-200/60 rounded-2xl flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                      <FileText className="w-4.5 h-4.5" />
                    </span>
                                        <div className="text-left">
                                            <h4 className="text-xs font-black text-slate-850">
                                                {inv.amount_paid.toLocaleString()} {inv.currency === "XOF" ? "FCFA" : inv.currency}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 font-semibold mt-1">
                                                Le {new Date(inv.created_at).toLocaleDateString("fr-FR")} • {inv.invoice_number}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Statut payé & bouton de téléchargement */}
                                    <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-[#22C55E]" /> Payé
                    </span>
                                        {inv.download_url && (
                                            <a
                                                href={inv.download_url}
                                                target="_blank" rel="noopener noreferrer"
                                                className="p-2 hover:bg-slate-50 text-slate-400 hover:text-primary rounded-lg transition"
                                                title="Télécharger la facture PDF"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <button className="w-full py-3.5 rounded-xl bg-slate-100/60 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer mt-2">
                                Voir plus d'historique <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <p className="text-center text-slate-400 text-xs py-8">Aucune facture enregistrée pour le moment.</p>
                    )}
                </div>

            </div>
        </div>
    );
}