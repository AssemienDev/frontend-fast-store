// app/merchant/customers/segments/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Lock, ShieldAlert, Sparkles, Heart, Crown, Clock, Eye } from "lucide-react";

interface SegmentsStats {
    nouveaux_count: number;
    fideles_count: number;
    gros_acheteurs_count: number;
    gros_acheteurs_threshold: number;
    inactifs_count: number;
}

export default function MerchantCustomerSegmentsPage() {
    const router = useRouter();
    const [stats, setStats] = useState<SegmentsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(true);

    useEffect(() => {
        // Tente de récupérer les statistiques des segments calculées en direct
        apiFetch<SegmentsStats>("/merchant/customers/segments")
            .then((data) => {
                setStats(data);
                setIsPremium(true);
                setLoading(false);
            })
            .catch((err: any) => {
                if (err.status === 402) {
                    setIsPremium(false); // Bloquer par le paywall d'abonnement
                }
                setLoading(false);
            });
    }, []);

    // Redirige vers le répertoire de clients principal avec la clé de segment active dans l'URL
    const handleViewSegment = (segmentKey: string) => {
        router.push(`/clients?segment=${segmentKey}`);
    };

    // --- CAS SÉCURITÉ : PAYWALL FORFAIT GRATUIT STARTER ---
    if (!isPremium) {
        return (
            <div className="p-8 max-w-xl mx-auto text-center space-y-6 bg-white border border-slate-200 rounded-3xl mt-12 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-[#F59E0B] flex items-center justify-center mx-auto border border-amber-100">
                    <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">Module Analytique : Segments Clients</h2>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                    Analysez automatiquement le comportement de vos acheteurs, ciblez vos campagnes promotionnelles de fidélité et identifiez instantanément vos inactifs pour les relancer ! Cette fonctionnalité requiert un forfait **Business** ou **Pro**.
                </p>
                <button
                    onClick={() => router.push("/billing")}
                    className="px-6 py-3 rounded-xl bg-primary text-white font-extrabold text-xs md:text-sm hover:opacity-95 transition inline-flex items-center gap-2 cursor-pointer shadow-md"
                >
                    <ShieldAlert className="w-4 h-4" /> Activer l&#39;offre Premium
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-6xl w-full mx-auto relative">

            {/* EN-TÊTE DE LA PAGE */}
            <div className="pb-6 border-b border-slate-100">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Segments Clients</h1>
                <p className="text-xs font-semibold text-slate-400 mt-1">Analysez et engagez vos groupes d&#39;acheteurs.</p>
            </div>

            {loading ? (
                /* CHARGEMENT */
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-50 border rounded-2xl animate-pulse" />)}
                </div>
            ) : stats ? (
                /* GRILLE DE SEGMENTS COMPLÈTE DE LA MAQUETTE */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* SEGMENT 1 : NOUVEAUX */}
                    <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between h-52">
                        <div>
                            <div className="w-10 h-10 rounded-full bg-teal-50 text-primary flex items-center justify-center shrink-0 border border-teal-100">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-black text-slate-900">{stats.nouveaux_count}</p>
                                <p className="text-xs font-bold text-slate-700 mt-1">Nouveaux</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleViewSegment("NOUVEAUX")}
                            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                        >
                            <Eye className="w-3.5 h-3.5" /> Voir
                        </button>
                    </div>

                    {/* SEGMENT 2 : FIDÈLES */}
                    <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between h-52">
                        <div>
                            <div className="w-10 h-10 rounded-full bg-emerald-50 text-tertiary flex items-center justify-center shrink-0 border border-emerald-100">
                                <Heart className="w-5 h-5" />
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-black text-slate-900">{stats.fideles_count}</p>
                                <p className="text-xs font-bold text-slate-700 mt-1">Fidèles</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleViewSegment("FIDELES")}
                            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                        >
                            <Eye className="w-3.5 h-3.5" /> Voir
                        </button>
                    </div>

                    {/* SEGMENT 3 : GROS ACHETEURS */}
                    <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between h-52">
                        <div>
                            <div className="w-10 h-10 rounded-full bg-amber-50 text-secondary flex items-center justify-center shrink-0 border border-amber-100">
                                <Crown className="w-5 h-5" />
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-black text-slate-900">{stats.gros_acheteurs_count}</p>
                                <p className="text-xs font-bold text-slate-700 mt-1">Gros acheteurs</p>
                                <p className="text-[10px] text-slate-400 font-semibold mt-1">Panier &gt; {Math.round(stats.gros_acheteurs_threshold / 1000)}K CFA</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleViewSegment("GROS")}
                            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                        >
                            <Eye className="w-3.5 h-3.5" /> Voir
                        </button>
                    </div>

                    {/* SEGMENT 4 : INACTIFS */}
                    <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between h-52">
                        <div>
                            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-black text-slate-900">{stats.inactifs_count}</p>
                                <p className="text-xs font-bold text-slate-700 mt-1">Inactifs</p>
                                <p className="text-[10px] text-rose-600 font-bold mt-1">&gt; 3 mois sans achat</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleViewSegment("INACTIFS")}
                            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                        >
                            <Eye className="w-3.5 h-3.5" /> Voir
                        </button>
                    </div>

                </div>
            ) : (
                <p className="text-center text-slate-400 text-sm">Une erreur est survenue lors de l&#39;analyse des segments.</p>
            )}

        </div>
    );
}