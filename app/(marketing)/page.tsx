// app/(marketing)/page.tsx
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
    TrendingUp,
    MessageSquare,
    ClipboardCheck,
    Users,
    Wallet,
    Rocket,
    X, MoveRight, Check, Star, ArrowLeft, ArrowRight
} from "lucide-react";
import {Plan} from "@/interfaces/Plan";
import {FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp} from "react-icons/fa";


export default function MarketingLandingPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);

    const socials = [
        { icon: FaFacebookF, name: "Facebook" },
        { icon: FaInstagram, name: "Instagram" },
        { icon: FaTiktok, name: "TikTok" },
        { icon: FaWhatsapp, name: "WhatsApp" },
    ];

    // États pour l'accordéon FAQ
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const merchantUrl = process.env.NEXT_PUBLIC_MERCHANT_URL || "http://marchand.localhost:3000";

    useEffect(() => {
        // Charge les plans réels depuis la base de données
        apiFetch<Plan[]>("/storefront/plans")
            .then((data) => {
                setPlans(data);
                setLoadingPlans(false);
            })
            .catch(() => {
                setLoadingPlans(false);
            });
    }, []);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };


    return (
        <div className="bg-neutral min-h-screen font-sans text-slate-800 antialiased">

            {/* 1. HERO SECTION */}
            <section className="px-6 py-16 md:py-24 bg-primary/15 rounded-4xl max-w-4xl mx-auto text-center flex flex-col items-center">
        <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 mb-6">
          Déjà utilisé par des commerçants africains pour vendre plus rapidement
        </span>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                    Arrêtez de répondre &ldquo;Quel est le prix ?&rdquo; toute la journée.
                </h1>
                <p className="mt-6 text-sm md:text-base text-slate-600 max-w-2xl leading-relaxed">
                    LinkBoutik aide les commerçants qui vendent sur Facebook, Instagram, TikTok et WhatsApp à centraliser leurs ventes, leurs commandes et leurs clients sur une seule plateforme.
                </p>
                <p className="mt-4 text-xs md:text-sm text-slate-500 max-w-xl">
                    Créez votre boutique en ligne en quelques minutes et permettez à vos clients de consulter vos produits et passer commande facilement, pendant que vous gérez votre activité sans stress.
                </p>

                <a
                    href={merchantUrl}
                    className="mt-8 px-8 py-4 rounded-xl bg-third text-white font-extrabold text-sm md:text-base hover:opacity-95 transition duration-200 flex items-center gap-2 shadow-md shadow-primary/10"
                >
                    Créer ma boutique gratuitement <ArrowRight />
                </a>

                {/* Note étoiles */}
                <div className="mt-6 flex items-center gap-2">
                    <div className="flex gap-0.5 text-secondary">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                        ))}
                    </div>
                    <span className="text-xs font-bold text-slate-500">+200 commerçants déjà inscrits</span>
                </div>
            </section>

            {/* 2. SECTION LES PROBLÈMES */}
            <section className="py-16 bg-slate-100/60 border-y border-slate-200/50">
                <div className="max-w-xl mx-auto px-6">
                    <h2 className="text-xl md:text-2xl font-black text-center text-slate-900">
                        Vous perdez des ventes chaque jour.
                    </h2>

                    <div className="mt-8 space-y-3 ">
                        {[
                            "Répondre aux mêmes questions toute la journée (\"Quel est le prix ?\")",
                            "Oublier certaines commandes dans WhatsApp",
                            "Perdre des clients qui n'obtiennent pas de réponse rapidement",
                            "Ne pas savoir quels clients reviennent acheter",
                            "Gérer les commandes dans plusieurs conversations"
                        ].map((text, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-white border-l-4 border-red-600 shadow-sm flex items-start gap-3">
                <X className="w-5 h-5 rounded-md  text-rose-600 font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5"/>

                                <span className="text-xs md:text-sm font-semibold text-slate-700">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. SECTION AUTOMATISATION FLOW */}
            <section className="py-16 max-w-xl mx-auto px-6 text-center">
                <h2 className="text-xl md:text-2xl font-black text-third">
                    LinkBoutik automatise votre commerce.
                </h2>

                <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-around gap-2 text-[10px] md:text-xs font-bold text-primary">
                    {socials.map(({ icon: Icon, name }) => (
                        <span
                            key={name}
                            className="w-8 h-8 rounded bg-white border border-slate-200/60 flex items-center justify-center text-slate-500"
                                            >
                          <Icon size={14} />
                        </span>
                    ))}
                    <MoveRight className="text-slate-400"/>
                    <span className="px-4 py-2.5 rounded-lg bg-third text-white font-extrabold">LinkBoutik</span>
                    <MoveRight className="text-slate-400"/>
                    <span className="font-extrabold text-primary">Commandes + Clients</span>
                </div>
            </section>

            {/* 4. SECTION CARACTÉRISTIQUES CHECKLIST */}
            <section className="py-16 bg-white border-y border-slate-100">
                <div className="max-w-md mx-auto px-6">
                    <div className="space-y-4">
                        {[
                            "Boutique pro & Catalogue 24h/24",
                            "Commande sans compte",
                            "Paiement en ligne / Livraison",
                            "Bouton WhatsApp intégré",
                            "Gestion commandes & Suivi clients",
                            "Statistiques détaillées"
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                <Check  className="w-6 h-6 rounded-full  text-tertiary flex items-center justify-center text-xs font-bold shrink-0" />
                                <span className="text-xs md:text-sm font-bold text-slate-700">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. SECTION COMMENT ÇA MARCHE */}
            <section className="py-16 bg-[#E0E3E5] text-center">
                <div className="max-w-xl mx-auto px-6">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900">Comment ça marche ?</h2>

                    <div className="mt-10 space-y-6 text-left">
                        {[
                            { num: "1", title: "Ajoutez vos produits", desc: "Importez photo, prix et description en quelques secondes." },
                            { num: "2", title: "Partagez votre boutique", desc: "Lien unique pour Facebook, WhatsApp, Instagram et TikTok." },
                            { num: "3", title: "Recevez des commandes", desc: "Les clients commandent directement sur votre catalogue." },
                            { num: "4", title: "Livrez et encaissez", desc: "Utilisez votre système de livraison et encaissez sereinement." }
                        ].map((step) => (
                            <div key={step.num} className="flex items-start gap-4">
                                <span className="w-8 h-8 rounded-full bg-third text-white font-bold flex items-center justify-center text-sm shrink-0">
                                  {step.num}
                                </span>
                                <div>
                                    <h4 className="font-black text-third text-sm md:text-base">{step.title}</h4>
                                    <p className="text-xs md:text-sm text-slate-500 mt-1">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. GRID PLUS QU'UNE BOUTIQUE */}
            <section className="py-16 max-w-4xl mx-auto px-6">
                <h2 className="text-xl md:text-2xl font-black text-center text-slate-900">Plus qu&#39;une boutique en ligne.</h2>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { icon: TrendingUp, title: "Augmentez vos ventes", desc: "Un catalogue en ligne accélère la conversion des clients indécis." },
                        { icon: MessageSquare, title: "Réduisez les messages répétitifs", desc: "Vos clients ont accès aux prix et stocks instantanément." },
                        { icon: ClipboardCheck, title: "Gérez vos commandes facilement", desc: "Suivez le statut de préparation et de livraison sans feuille de papier." },
                        { icon: Users, title: "Conservez vos clients", desc: "Accédez à l'historique d'achat de vos clients fidèles." },
                        { icon: Wallet, title: "Compatible Mobile Money", desc: "Encaissez par Orange Money, MTN, Wave ou Moov." },
                        { icon: Rocket, title: "En moins de 5 minutes", desc: "Aucun savoir technique requis pour configurer votre boutique." }
                    ].map((item, idx) => {
                        const IconComponent = item.icon; // Instancie l'icône dynamiquement
                        return (
                            <div key={idx} className="p-5 bg-white border border-slate-200/50 rounded-xl flex items-start gap-4 shadow-sm hover:shadow-md transition">
                                <div className="text-third bg-primary/10 p-2.5 rounded-lg shrink-0">
                                    <IconComponent className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 text-xs md:text-sm">{item.title}</h4>
                                    <p className="text-[11px] md:text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 7. TEASER TABLEAU DE BORD (DASHBOARD PREVIEW) */}
            <section className="py-16 bg-primary text-white">
                <div className="max-w-xl mx-auto px-6 text-center">
                    <h2 className="text-xl md:text-2xl font-black">Pilotez votre activité depuis un seul tableau de bord.</h2>

                    {/* Simulation HTML de l'écran du Tableau de Bord */}
                    <div className="mt-10 p-6 rounded-2xl bg-black/20 border border-white/10 text-left shadow-2xl">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Ventes</span>
                                <p className="text-base md:text-lg font-black mt-1">450 000 FCFA</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Commandes</span>
                                <p className="text-base md:text-lg font-black mt-1">24</p>
                            </div>
                        </div>

                        {/* Range sliders d'indicateurs de performance (Teaser) */}
                        <div className="mt-6 space-y-4">
                            <div>
                                <div className="flex justify-between text-[10px] text-white/80 font-bold mb-1">
                                    <span>Produits Vedettes (P1)</span>
                                    <span>78%</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                                    <div className="h-full bg-tertiary rounded-full" style={{ width: "78%" }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] text-white/80 font-bold mb-1">
                                    <span>Nouveaux Clients (P2)</span>
                                    <span>45%</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                                    <div className="h-full bg-secondary rounded-full" style={{ width: "45%" }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. SECTION CITATIONS / TEMOIGNAGES */}
            <section className="py-16 max-w-xl mx-auto px-6 space-y-4">
                {[
                    { text: "Je ne passe plus mes journées à répondre aux mêmes questions.", author: "— Fatou, Mode & Accessoires" },
                    { text: "Mes clients commandent même quand je dors.", author: "— Ibrahim, High-Tech" },
                    { text: "J'ai enfin une liste de tous mes clients.", author: "— Amadou, Cosmétiques" }
                ].map((quote, idx) => (
                    <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200/50 shadow-sm">
                        <p className="text md:text-sm font-semibold text-slate-700 italic">&ldquo;{quote.text}&rdquo;</p>
                        <p className="text-[15px] font-bold text-third mt-3">{quote.author}</p>
                    </div>
                ))}
            </section>

            {/* 9. SECTION LES PLANS (TARIFS) */}
            <section id="tarifs" className="py-16 bg-white border-t border-slate-100">
                <div className="max-w-xl mx-auto px-6 text-center">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900">Choisissez l&#39;offre adaptée à votre activité.</h2>

                    <div className="mt-10 space-y-6">

                        {loadingPlans ? (
                            /* SQUELETTE DE CHARGEMENT ANIMÉ (PULSE) */
                            <div className="space-y-6 text-left">
                                {[1, 2].map((i) => (
                                    <div key={i} className="p-8 border border-slate-200 rounded-3xl bg-slate-50/50 animate-pulse h-[280px] flex flex-col justify-between">
                                        <div>
                                            <div className="h-3 bg-slate-200 rounded w-1/4 mb-4"></div>
                                            <div className="h-6 bg-slate-200 rounded w-1/2 mb-6"></div>
                                            <div className="space-y-3">
                                                <div className="h-2.5 bg-slate-200 rounded w-5/6"></div>
                                                <div className="h-2.5 bg-slate-200 rounded w-4/6"></div>
                                                <div className="h-2.5 bg-slate-200 rounded w-3/6"></div>
                                            </div>
                                        </div>
                                        <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
                                    </div>
                                ))}
                            </div>
                        ) : plans.length > 0 ? (
                            /* RENDU DYNAMIQUE DEPUIS VOTRE BASE DE DONNÉES (POSTGRESQL) */
                            plans.map((plan) => {
                                const isBusiness = plan.name.toLowerCase().includes("business");
                                return (
                                    <div
                                        key={plan.id}
                                        className={`p-8 rounded-3xl text-left relative transition-all duration-200 ${
                                            isBusiness
                                                ? "border-2 border-primary bg-neutra shadow-lg"
                                                : "border border-slate-200 bg-white"
                                        }`}
                                    >
                                        {isBusiness && (
                                            <span className="absolute -top-3 right-6 px-3 py-1 bg-primary text-white text-[9px] font-black uppercase rounded-full">
                                          Recommandé
                                        </span>
                                        )}
                                        <span className={`text-xs font-bold uppercase tracking-widest ${isBusiness ? "text-primary" : "text-slate-400"}`}>
                                        {plan.name}
                                      </span>
                                        <h3 className="text-2xl font-black text-slate-800 mt-2">
                                            {plan.price === 0 ? (
                                                "Gratuit"
                                            ) : (
                                                <>
                                                    {plan.price.toLocaleString()} {plan.currency === "XOF" || plan.currency === "XAF" ? "FCFA" : plan.currency}
                                                    <span className="text-xs font-semibold text-slate-400">
                                              {plan.billing_cycle === "monthly" ? " /mois" : ` /${plan.billing_cycle}`}
                                            </span>
                                                </>
                                            )}
                                        </h3>

                                        <ul className="mt-6 space-y-3.5 text-xs text-slate-600 font-semibold">
                                            {Object.entries(plan.features).map(([feature, val]) => (
                                                <li key={feature} className="flex items-center gap-2">
                                                    {typeof val === "boolean" && val === true ? (
                                                        <>
                                                            <span className="text-tertiary font-bold">✓</span>
                                                            <span>{feature.replace(/_/g, " ")}</span>
                                                        </>
                                                    ) : typeof val === "boolean" && val === false ? (
                                                        <>
                                                            <span className="text-rose-500 font-bold">✕</span>
                                                            <span className="text-slate-400 line-through">{feature.replace(/_/g, " ")}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-tertiary font-bold">✓</span>
                                                            <span>{feature.replace(/_/g, " ")} : <span className="font-bold text-slate-800">{String(val)}</span></span>
                                                        </>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                        <a
                                            href={merchantUrl}
                                            className={`mt-8 block w-full py-3.5 text-center rounded-xl font-extrabold text-xs transition duration-200 ${
                                                isBusiness
                                                    ? "bg-primary text-white hover:opacity-95"
                                                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            {plan.price === 0 ? "Commencer" : "Créer ma boutique"}
                                        </a>
                                    </div>
                                );
                            })
                        ) : (
                            /* PLANS PAR DÉFAUT (FALLBACK) SI LA BASE DE DONNÉES EST VIDE */
                            <div className="space-y-6 text-left">
                                {/* Plan 1 : Recommandé (Business) */}
                                <div className="p-8 border-2 border-primary rounded-3xl bg-neutra shadow-lg relative text-left">
                                    <span className="absolute -top-3 right-6 px-3 py-1 bg-primary text-white text-[9px] font-black uppercase rounded-full">
                                      Recommandé
                                    </span>
                                    <span className="text-xs font-bold text-primary uppercase tracking-widest">Business</span>
                                    <h3 className="text-2xl font-black text-slate-800 mt-2">15 000 FCFA <span className="text-xs font-semibold text-slate-400">/mois</span></h3>

                                    <ul className="mt-6 space-y-3.5 text-xs text-slate-600 font-semibold">
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
                                            <span>Frais de transaction retrait réduits (3.5%)</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Statistiques avancé</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Sous-domaine offert</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Notification WhatsApp</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Personalisation de référencement Seo</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Création de commande personnalisée</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Création de fiche client</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Création de code promo</span>
                                        </li>
                                    </ul>
                                    <a href={merchantUrl} className="mt-8 block w-full py-3.5 text-center rounded-xl bg-primary text-white font-extrabold text-xs hover:opacity-95 transition">
                                        Créer ma boutique
                                    </a>
                                </div>

                                {/* Plan 2 : Gratuit (Starter) */}
                                <div className="p-8 border border-slate-200 rounded-3xl text-left bg-white">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Starter</span>
                                    <h3 className="text-2xl font-black text-slate-800 mt-2">Gratuit</h3>

                                    <ul className="mt-6 space-y-3.5 text-xs text-slate-600 font-medium">
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
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Statistiques de base</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                                            <span>Sous-domaine offert</span>
                                        </li>
                                    </ul>
                                    <a href={merchantUrl} className="mt-8 block w-full py-3.5 text-center rounded-xl bg-white border border-slate-200 text-slate-600 font-extrabold text-xs hover:bg-slate-50 transition">
                                        Commencer
                                    </a>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </section>

            {/* 10. SECTION QUESTIONS FRÉQUENTES (FAQ ACCORDEON) */}
            <section id="faq" className="py-16 max-w-xl mx-auto px-6">
                <h2 className="text-xl md:text-2xl font-black text-center text-slate-900">Questions fréquentes</h2>

                <div className="mt-10 space-y-3">
                    {[
                        { q: "Dois-je savoir coder ?", a: "Non, absolument pas. LinkBoutik est conçu pour être aussi simple d'utilisation qu'une application de messagerie. Vous importez vos photos et prix en quelques clics." },
                        { q: "Paiements Mobile Money ?", a: "Oui, nous supportons tous les grands opérateurs d'Afrique de l'Ouest et Centrale (Wave, MTN, Orange, Moov) pour vos opérations." }
                    ].map((item, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                            <button
                                onClick={() => toggleFaq(idx)}
                                className="w-full p-4 text-left cursor-pointer font-bold text-lg  text-slate-800 flex justify-between items-center hover:bg-slate-50 transition"
                            >
                                <span>{item.q}</span>
                                <span className="text-primary text-lg font-bold">{openFaq === idx ? "−" : "+"}</span>
                            </button>
                            {openFaq === idx && (
                                <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-slate-500 leading-relaxed">
                                    {item.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* 11. SECTION DE FIN DE TUNNEL */}
            <section id="contact" className="py-20 bg-primary text-white text-center">
                <div className="max-w-xl mx-auto px-6">
                    <h2 className="text-2xl md:text-4xl font-black leading-tight">Commencez à vendre plus dès aujourd&#39;hui.</h2>
                    <p className="mt-4 text-xs md:text-sm text-white/80">
                        Transformez vos visiteurs Facebook, Instagram et WhatsApp en clients organisés.
                    </p>

                    <a
                        href={merchantUrl}
                        className="mt-8 inline-block px-8 py-4 rounded-xl bg-white text-primary font-black text-xs md:text-sm hover:opacity-95 transition shadow-lg"
                    >
                        Créer ma boutique gratuitement
                    </a>
                    <p className="mt-4 text-[10px] text-white/60">Aucune carte bancaire requise. Configuration en quelques minutes.</p>
                </div>
            </section>
        </div>
    );
}