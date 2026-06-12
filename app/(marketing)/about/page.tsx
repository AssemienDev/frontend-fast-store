// app/(marketing)/about/page.tsx
"use client";

import { MousePointerClick, HeartHandshake, TrendingUp, Globe } from "lucide-react";
import CountUp from "react-countup";

export default function AboutPage() {
    const merchantUrl = process.env.NEXT_PUBLIC_MERCHANT_URL || "http://marchand.localhost:3000";

    return (
        <div className="bg-neutral min-h-screen">

            {/* 1. HERO SECTION (Digitaliser le commerce) */}
            <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                {/* TEXTE GAUCHE */}
                <div className="lg:col-span-7 space-y-6 text-left">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Digitaliser le commerce <br />
                        en Afrique, simplement.
                    </h1>
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl">
                        Nous croyons que chaque commerçant mérite des outils puissants et accessibles. LinkBoutik est conçu pour transformer votre smartphone en un centre de gestion complet, stimulant votre croissance et connectant vos produits au monde.
                    </p>
                    <div className="pt-4">
                        <a
                            href={merchantUrl}
                            className="px-8 py-4 rounded-xl bg-primary text-white font-extrabold text-sm md:text-base hover:opacity-95 transition duration-200 shadow-md shadow-primary/10"
                        >
                            Rejoindre l&#39;aventure
                        </a>
                    </div>
                </div>

                {/* IMAGE DROITE */}
                <div className="lg:col-span-5 relative h-72 md:h-100 w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200/45">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/aPropos.webp"
                        alt="Commerçante africaine gérant sa boutique sur smartphone"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>
            </section>

            {/* 2. SECTION VALEURS FONDAMENTALES */}
            <section className="py-16 md:py-24 bg-white border-y border-slate-200/40">
                <div className="max-w-7xl mx-auto px-6 text-center">

                    <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                        Nos Valeurs Fondamentales
                    </h2>
                    <p className="mt-4 text-xs md:text-sm text-slate-500 max-w-xl mx-auto">
                        Les principes qui guident la conception de chaque fonctionnalité de LinkBoutik.
                    </p>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* VALEUR 1 : SIMPLICITÉ */}
                        <div className="p-8 border border-slate-200/60 rounded-2xl bg-slate-50/50 flex flex-col items-center text-center shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                                <MousePointerClick className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800">Simplicité</h3>
                            <p className="mt-3 text-xs md:text-sm text-slate-500 leading-relaxed">
                                Des interfaces épurées et intuitives. Pas de jargon technique, juste des actions claires pour gérer vos ventes en quelques tapotements.
                            </p>
                        </div>

                        {/* VALEUR 2 : PROXIMITÉ */}
                        <div className="p-8 border border-slate-200/60 rounded-2xl bg-slate-50/50 flex flex-col items-center text-center shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-6">
                                <HeartHandshake className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800">Proximité</h3>
                            <p className="mt-3 text-xs md:text-sm text-slate-500 leading-relaxed">
                                Conçu en Afrique, pour l&#39;Afrique. Nous comprenons les réalités du marché local, des moyens de paiements.
                            </p>
                        </div>

                        {/* VALEUR 3 : CROISSANCE */}
                        <div className="p-8 border border-slate-200/60 rounded-2xl bg-slate-50/50 flex flex-col items-center text-center shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center mb-6">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800">Croissance</h3>
                            <p className="mt-3 text-xs md:text-sm text-slate-500 leading-relaxed">
                                Votre succès est notre métrique principale. Nos outils d&#39;analyse et de visibilité sont bâtis pour propulser votre chiffre d&#39;affaires.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* 3. SECTION IMPACT BANNER */}
            <section className="py-20 bg-primary text-white text-center">
                <div className="max-w-4xl mx-auto px-6">

                    <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center mx-auto mb-6">
                        <Globe className="w-6 h-6 animate-pulse" />
                    </div>

                    <h2 className="text-2xl md:text-4xl font-black">
                        Un Impact Local, Une Vision Globale
                    </h2>
                    <p className="mt-4 text-xs md:text-sm text-teal-100 max-w-2xl mx-auto leading-relaxed">
                        Depuis notre lancement, nous accompagnons quotidiennement des milliers de petites et moyennes entreprises dans leur transition numérique.
                    </p>

                    {/* GRILLE DE COMPTEURS (STATS) */}
                    <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">

                        <div className="space-y-2 text-center">
                            <p className="text-3xl md:text-4xl font-black tracking-tight">
                                <CountUp end={200} duration={2} suffix="+" />
                            </p>
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-teal-200">
                                Marchands
                            </p>
                        </div>

                        <div className="space-y-2 text-center">
                            <p className="text-3xl md:text-4xl font-black tracking-tight">
                                <CountUp end={3} duration={2} />
                            </p>
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-teal-200">
                                Pays
                            </p>
                        </div>

                        <div className="space-y-2 text-center">
                            <p className="text-3xl md:text-4xl font-black tracking-tight">
                                <CountUp end={50} duration={2} suffix="K+" />
                            </p>
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-teal-200">
                                Transactions
                            </p>
                        </div>

                        <div className="space-y-2 text-center">
                            <p className="text-3xl md:text-4xl font-black tracking-tight">
                                <CountUp end={24} duration={2} suffix="/7" />
                            </p>
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-teal-200">
                                Support
                            </p>
                        </div>

                    </div>

                </div>
            </section>

        </div>
    );
}