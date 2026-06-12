// app/(marketing)/faq/page.tsx
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Search, ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
    id: string;
    category: string;
    question: string;
    answer: string;
}

// 4 FAQs par défaut de la maquette (Fallback si la BDD est vide)
const DEFAULT_FAQS: FAQItem[] = [
    {
        id: "default-1",
        category: "Général",
        question: "Comment créer ma boutique ?",
        answer: "Pour créer votre boutique, cliquez simplement sur le bouton 'Créer ma boutique gratuitement'. Renseignez votre adresse email, choisissez le nom de votre boutique, configurez votre mot de passe et vous serez prêt à importer vos premiers produits en moins de 5 minutes."
    }
];

export default function FAQPage() {
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [openFaqId, setOpenFaqId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Tente de récupérer les FAQs depuis votre API de base de données
        apiFetch<FAQItem[]>("/storefront/faq")
            .then((data) => {
                if (data && data.length > 0) {
                    setFaqs(data);
                } else {
                    setFaqs(DEFAULT_FAQS);
                }
                setLoading(false);
            })
            .catch(() => {
                setFaqs(DEFAULT_FAQS);
                setLoading(false);
            });
    }, []);

    const toggleFaq = (id: string) => {
        setOpenFaqId(openFaqId === id ? null : id);
    };

    // Filtrage dynamique en temps réel selon la saisie de l'utilisateur
    const filteredFaqs = faqs.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-neutral min-h-screen py-16 md:py-24">
            <div className="max-w-3xl mx-auto px-6">

                {/* EN-TÊTE DE LA PAGE */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Comment pouvons-nous vous aider ?
                    </h1>
                    <p className="mt-4 text-sm md:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
                        Recherchez dans notre base de connaissances ou parcourez les questions fréquentes ci-dessous.
                    </p>
                </div>

                {/* BARRE DE RECHERCHE DYNAMIQUE (Écran 'FAQ') */}
                <div className="relative max-w-xl mx-auto mb-16">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher une réponse..."
                        className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition duration-150"
                    />
                </div>

                {/* SECTION QUESTIONS FRÉQUENTES */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2 border-b border-slate-200/60 pb-3">
                        <h2 className="text-lg md:text-xl font-black text-slate-900">
                            Questions Fréquentes
                        </h2>
                    </div>

                    {loading ? (
                        /* CHARGEMENT */
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-white border border-slate-200 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : filteredFaqs.length > 0 ? (
                        /* AFFICHAGE DES RÉSULTATS FILTRÉS */
                        <div className="space-y-3">
                            {filteredFaqs.map((faq) => {
                                const isOpen = openFaqId === faq.id;
                                return (
                                    <div
                                        key={faq.id}
                                        className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-200"
                                    >
                                        <button
                                            onClick={() => toggleFaq(faq.id)}
                                            className="w-full p-5 text-left cursor-pointer font-bold text-xs md:text-sm text-slate-800 flex justify-between items-center hover:bg-slate-50 transition duration-150"
                                        >
                                            <span>{faq.question}</span>
                                            <ChevronDown
                                                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                                    isOpen ? "transform rotate-180 text-primary" : ""
                                                }`}
                                            />
                                        </button>

                                        {isOpen && (
                                            <div className="px-5 pb-5 pt-1 bg-slate-50/50 border-t border-slate-100 text-[11px] md:text-xs text-slate-500 leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* AUCUN RÉSULTAT TROUVÉ */
                        <div className="text-center py-12 p-8 border border-dashed border-slate-200 rounded-2xl bg-white">
                            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium text-sm">
                                Aucun résultat pour &ldquo;{searchQuery}&rdquo;.
                            </p>
                            <button
                                onClick={() => setSearchQuery("")}
                                className="mt-3 text-xs text-primary font-bold hover:underline"
                            >
                                Réinitialiser la recherche
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}