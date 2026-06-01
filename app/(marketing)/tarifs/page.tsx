// app/(marketing)/tarifs/page.tsx
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Check, X, HelpCircle } from "lucide-react";

interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    billing_cycle: string;
    features: Record<string, boolean | string | number>;
}


export default function PricingPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    const merchantUrl = process.env.NEXT_PUBLIC_MERCHANT_URL || "http://marchand.localhost:3000";

    useEffect(() => {
        // Tente de récupérer les plans réels configurés en base de données
        apiFetch<Plan[]>("/storefront/plans")
            .then((data) => {
                setPlans(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div className="bg-neutral min-h-screen py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-6">

                {/* EN-TÊTE DE LA PAGE */}
                <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Des tarifs simples pour la croissance <br /> de votre boutique
                    </h1>
                    <p className="mt-6 text-sm md:text-base text-slate-500 leading-relaxed">
                        Choisissez le plan parfait pour commencer, développer et faire évoluer votre activité de commerce social en Afrique.
                    </p>
                </div>

                {/* GRILLE DE PRIX */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-stretch">

                    {loading ? (
                        /* SQUELETTE DE CHARGEMENT ANIMÉ (PULSE) */
                        <>
                            {[1, 2].map((i) => (
                                <div key={i} className="p-8 border border-slate-200 rounded-3xl bg-white animate-pulse h-[500px] flex flex-col justify-between">
                                    <div>
                                        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                                        <div className="h-8 bg-slate-200 rounded w-1/2 mb-6"></div>
                                        <div className="space-y-4">
                                            <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                                            <div className="h-3 bg-slate-200 rounded w-4/6"></div>
                                            <div className="h-3 bg-slate-200 rounded w-4/6"></div>
                                        </div>
                                    </div>
                                    <div className="h-12 bg-slate-200 rounded-xl w-full"></div>
                                </div>
                            ))}
                        </>
                    ) : plans.length > 0 ? (
                        /* RENDU DYNAMIQUE SI DES PLANS EXISTENT EN BDD */
                        plans.map((plan) => {
                            const isCroissance = plan.name.toLowerCase().includes("croissance");
                            return (
                                <div
                                    key={plan.id}
                                    className={`p-8 rounded-3xl text-left flex flex-col justify-between relative transition-all duration-200 ${
                                        isCroissance
                                            ? "border-2 border-primary bg-white shadow-xl shadow-primary/5"
                                            : "border border-slate-200 bg-white shadow-sm"
                                    }`}
                                >
                                    {isCroissance && (
                                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-[10px] font-extrabold uppercase rounded-full tracking-wider">
                      Recommandé
                    </span>
                                    )}

                                    <div>
                                        <h3 className="text-xl font-black text-slate-800">{plan.name}</h3>
                                        <div className="mt-4 flex items-baseline">
                                            <span className="text-4xl font-black text-slate-900">{plan.price.toLocaleString()}</span>
                                            <span className="text-sm text-slate-400 font-bold ml-2">{plan.currency === "XOF" || plan.currency === "XAF" ? "CFA" : plan.currency}/mois</span>
                                        </div>

                                        <ul className="mt-8 space-y-4 text-xs font-semibold text-slate-600">
                                            {Object.entries(plan.features).map(([feature, val]) => (
                                                <li key={feature} className="flex items-start gap-2.5">
                                                    {val === true ? (
                                                        <>
                                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                                            <span>{feature}</span>
                                                        </>
                                                    ) : val === false ? (
                                                        <>
                                                            <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                                                            <span className="text-slate-350 line-through font-normal">{feature}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                                            <span>{feature} : <strong className="text-slate-800 font-bold">{String(val)}</strong></span>
                                                        </>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <a
                                        href={merchantUrl}
                                        className={`mt-8 w-full py-3.5 text-center font-extrabold text-xs rounded-xl transition duration-200 ${
                                            isCroissance
                                                ? "bg-primary text-white hover:opacity-95"
                                                : "bg-slate-200/60 text-slate-700 hover:bg-slate-200/80"
                                        }`}
                                    >
                                        {plan.price === 0 ? "Commencer Gratuitement" : isCroissance ? "Choisir Croissance" : "Contacter les ventes"}
                                    </a>
                                </div>
                            );
                        })
                    ) : (
                        /* RENDU PAR DÉFAUT (IMAGE DE MAQUETTE EXACTE) SI LA BDD EST VIDE */
                        <>
                            {/* 1. PLAN DÉBUTANT */}
                            <div className="p-8 border border-slate-200 rounded-3xl bg-white shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Débutant</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed h-10">
                                        Parfait pour tester votre idée et lancer vos premières ventes.
                                    </p>
                                    <div className="mt-6 flex items-baseline">
                                        <span className="text-4xl font-black text-slate-900">0</span>
                                        <span className="text-xs text-slate-400 font-bold ml-2">CFA/mois</span>
                                    </div>

                                    <ul className="mt-8 space-y-4 text-xs font-semibold text-slate-600">
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Jusqu&#39;à 30 produits</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Paiements Mobile Money de base</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Frais de transaction retrait 5%</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                                            <span className="line-through">Intégration WhatsApp</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                                            <span className="line-through">Personalisation de référencement Seo</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                                            <span className="line-through">Création de commande manuellement</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                                            <span className="line-through"> Ajout de client manuellement</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                                            <span className="line-through"> Outils analytique</span>
                                        </li>
                                    </ul>
                                </div>

                                <a
                                    href={merchantUrl}
                                    className="mt-8 w-full py-3.5 text-center font-extrabold text-xs rounded-xl bg-slate-200/60 text-slate-700 hover:bg-slate-200/80 transition"
                                >
                                    Commencer Gratuitement
                                </a>
                            </div>

                            {/* 2. PLAN CROISSANCE (RECOMMANDÉ) */}
                            <div className="p-8 border-2 border-primary rounded-3xl bg-white shadow-xl shadow-teal-900/5 flex flex-col justify-between relative scale-105 transform z-10">
                            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-[9px] font-black uppercase rounded-full tracking-wider">
                              Recommandé
                            </span>

                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Croissance</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed h-10">
                                        Pour les marchands prêts à automatiser et scaler leurs ventes.
                                    </p>
                                    <div className="mt-6 flex items-baseline">
                                        <span className="text-4xl font-black text-slate-900">15 000</span>
                                        <span className="text-xs text-slate-400 font-bold ml-2">CFA/mois</span>
                                    </div>

                                    <ul className="mt-8 space-y-4 text-xs font-semibold text-slate-600">
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Produits illimités</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Paiements Mobile Money & Cryptomonnaie</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Frais de transaction retrait réduits(3.5%)</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Intégration WhatsApp</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Personalisation de référencement Seo</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Création de commande manuellement</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Ajout de client manuellement</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Outils analytique</span>
                                        </li>
                                    </ul>
                                </div>

                                <a
                                    href={merchantUrl}
                                    className="mt-8 w-full py-3.5 text-center font-extrabold text-xs rounded-xl bg-primary text-white hover:opacity-95 transition"
                                >
                                    Choisir Croissance
                                </a>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}