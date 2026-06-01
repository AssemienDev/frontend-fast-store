// app/(marketing)/privacy/page.tsx
"use client";

import Link from "next/link";
import { Database, Settings, ShieldCheck, Cookie, Store, Headphones, ArrowRight } from "lucide-react";

export default function PrivacyPolicyPage() {
    const merchantUrl = process.env.NEXT_PUBLIC_MERCHANT_URL || "http://marchand.localhost:3000";

    // Fonction pour faire défiler la page de manière fluide vers la section cliquée
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // Compense la hauteur de la Navbar collante
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="bg-neutral min-h-screen py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-6">

                {/* EN-TÊTE DE LA PAGE */}
                <div className="text-left mb-16 max-w-3xl">
                    <p className="text-xs font-bold text-slate-400 mb-2">
                        Dernière mise à jour : 10 Mai 2026
                    </p>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Politique de confidentialité
                    </h1>
                    <p className="mt-6 text-sm md:text-base text-slate-800 leading-relaxed">
                        Chez FastStore, nous accordons une importance primordiale à la protection de vos données. Cette politique explique de manière transparente comment nous collectons, utilisons et protégeons vos informations.
                    </p>
                </div>

                {/* CONTENU PRINCIPAL (SOMMAIRE À GAUCHE, CARTES DE CONTENU À DROITE) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* SOMMAIRE COLLANT (DESKTOP) */}
                    <aside className="hidden lg:block lg:col-span-3 sticky top-28 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">
                            Sommaire
                        </p>
                        <nav className="flex flex-col gap-3.5 text-xs font-semibold text-slate-500">
                            <button
                                onClick={() => scrollToSection("collecte")}
                                className="text-left cursor-pointer hover:text-primary transition duration-150"
                            >
                                1. Collecte des données
                            </button>
                            <button
                                onClick={() => scrollToSection("utilisation")}
                                className="text-left  cursor-pointer hover:text-primary transition duration-150"
                            >
                                2. Utilisation
                            </button>
                            <button
                                onClick={() => scrollToSection("securite")}
                                className="text-left cursor-pointer hover:text-primary transition duration-150"
                            >
                                3. Sécurité
                            </button>
                            <button
                                onClick={() => scrollToSection("cookies")}
                                className="text-left  cursor-pointer hover:text-primary transition duration-150"
                            >
                                4. Cookies & Traceurs
                            </button>
                        </nav>
                    </aside>

                    {/* FLUX DE CONTENU DROITE (lg:col-span-9) */}
                    <div className="lg:col-span-9 space-y-8">

                        {/* CARD 1 : COLLECTE DES DONNÉES */}
                        <section
                            id="collecte"
                            className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6"
                        >
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <Database className="w-5 h-5" />
                                </div>
                                <h2 className="text-base md:text-lg font-black text-slate-800">
                                    1. Collecte des données
                                </h2>
                            </div>
                            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                                Nous collectons différents types d&#39;informations dans le cadre de la fourniture de nos services de commerce social. Ces données incluent :
                            </p>

                            <div className="space-y-4 text-xs md:text-sm">
                                <div className="pl-4 border-l-2 border-slate-100">
                                    <p className="font-bold text-slate-800">Données d&#39;identification :</p>
                                    <p className="text-slate-500 text-xs mt-1">Nom, prénom, adresse e-mail, numéro de téléphone (notamment pour l&#39;intégration WhatsApp).</p>
                                </div>
                                <div className="pl-4 border-l-2 border-slate-100">
                                    <p className="font-bold text-slate-800">Données de transaction :</p>
                                    <p className="text-slate-500 text-xs mt-1">Historique des commandes, informations de facturation et de livraison.</p>
                                </div>
                                <div className="pl-4 border-l-2 border-slate-100">
                                    <p className="font-bold text-slate-800">Données techniques :</p>
                                    <p className="text-slate-500 text-xs mt-1">Adresse IP, type d&#39;appareil, navigateur utilisé pour optimiser notre interface mobile-first.</p>
                                </div>
                            </div>
                        </section>

                        {/* CARD 2 : UTILISATION DE VOS DONNÉES */}
                        <section
                            id="utilisation"
                            className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6"
                        >
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <h2 className="text-base md:text-lg font-black text-slate-800">
                                    2. Utilisation de vos données
                                </h2>
                            </div>
                            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                                Les informations que nous collectons sont utilisées exclusivement pour améliorer votre expérience marchand et assurer le bon fonctionnement de la plateforme :
                            </p>

                            {/* SOUS-GRILLE VISUELLE DE CARTES */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* SUB-CARD 1 : GESTION DE BOUTIQUE */}
                                <div className="p-5 border border-slate-150 rounded-2xl flex flex-col justify-between">
                                    <div className="flex items-center gap-3">
                                        <Store className="w-5 h-5 text-primary shrink-0" />
                                        <h4 className="font-bold text-slate-800 text-xs md:text-sm">Gestion de boutique</h4>
                                    </div>
                                    <p className="text-[11px] md:text-xs text-slate-500 mt-3 leading-relaxed">
                                        Pour créer et maintenir votre catalogue produit et gérer vos commandes.
                                    </p>
                                </div>

                                {/* SUB-CARD 2 : SUPPORT CLIENT */}
                                <div className="p-5 border border-slate-150 rounded-2xl flex flex-col justify-between">
                                    <div className="flex items-center gap-3">
                                        <Headphones className="w-5 h-5 text-primary shrink-0" />
                                        <h4 className="font-bold text-slate-800 text-xs md:text-sm">Support client</h4>
                                    </div>
                                    <p className="text-[11px] md:text-xs text-slate-500 mt-3 leading-relaxed">
                                        Pour vous assister rapidement via notre support intégré ou par e-mail.
                                    </p>
                                </div>

                            </div>
                        </section>

                        {/* CARD 3 : SÉCURITÉ */}
                        <section
                            id="securite"
                            className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6"
                        >
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h2 className="text-base md:text-lg font-black text-slate-800">
                                    3. Sécurité
                                </h2>
                            </div>
                            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                                La sécurité de vos données financières et personnelles est notre priorité. Nous utilisons des protocoles de chiffrement standards de l'industrie pour protéger vos informations lors des transferts et au repos.
                            </p>
                            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                                L&#39;accès à vos données est strictement limité aux employés de FastStore qui en ont besoin pour accomplir leurs tâches. Nous ne vendons <strong>jamais</strong> vos données à des tiers.
                            </p>

                            <Link
                                href="/about" // Redirige par exemple vers la page infrastructure d'About
                                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                            >
                                En savoir plus sur notre infrastructure <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </section>

                        {/* CARD 4 : COOKIES & TRACEURS */}
                        <section
                            id="cookies"
                            className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6"
                        >
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <Cookie className="w-5 h-5" />
                                </div>
                                <h2 className="text-base md:text-lg font-black text-slate-800">
                                    4. Cookies & Traceurs
                                </h2>
                            </div>
                            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                                FastStore utilise des cookies essentiels pour maintenir votre session active et sécuriser votre compte. Nous utilisons également des cookies analytiques anonymisés pour comprendre comment nos marchands utilisent l'application et améliorer notre interface mobile.
                            </p>
                        </section>

                    </div>

                </div>

            </div>
        </div>
    );
}