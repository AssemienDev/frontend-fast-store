// app/(marketing)/terms/page.tsx
"use client";

export default function TermsOfServicePage() {
    return (
        <div className="bg-neutral min-h-screen py-16 md:py-24">
            <div className="max-w-3xl mx-auto px-6">

                {/* EN-TÊTE DE LA PAGE */}
                <div className="text-left mb-12">
                    <p className="text-xs font-bold text-slate-400 mb-2">
                        Dernière mise à jour : 5 Mai 2026
                    </p>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Conditions d&#39;utilisation
                    </h1>
                    <p className="mt-6 text-sm md:text-base text-slate-500 leading-relaxed">
                        Veuillez lire attentivement ces conditions d&#39;utilisation avant d&#39;utiliser la plateforme FastStore. Elles régissent votre accès et votre utilisation de nos services de commerce social.
                    </p>
                </div>

                {/* ARTICLES DES CONDITIONS */}
                <div className="space-y-8">

                    {/* ARTICLE 1 : ÉLIGIBILITÉ */}
                    <div className="p-6 md:p-8 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-4">
                        <div className="flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shrink-0">
                1
              </span>
                            <h2 className="text-base md:text-lg font-black text-slate-800">
                                Éligibilité
                            </h2>
                        </div>
                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                            Pour utiliser FastStore, vous devez avoir au moins 18 ans et être capable de conclure des contrats juridiquement contraignants selon le droit applicable dans votre juridiction.
                        </p>
                        <ul className="pl-4 border-l-2 border-slate-100 space-y-2.5 text-xs text-slate-500 font-medium">
                            <li>• Vous devez fournir des informations exactes lors de votre inscription.</li>
                            <li>• Vous êtes responsable du maintien de la confidentialité de votre compte.</li>
                            <li>• L&#39;utilisation de FastStore pour des activités illégales est strictement interdite.</li>
                        </ul>
                    </div>

                    {/* ARTICLE 2 : FRAIS DE SERVICE */}
                    <div className="p-6 md:p-8 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-4">
                        <div className="flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shrink-0">
                2
              </span>
                            <h2 className="text-base md:text-lg font-black text-slate-800">
                                Frais de service
                            </h2>
                        </div>
                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                            FastStore facture des frais de transaction sur les ventes réalisées via la plateforme. Les détails de ces frais sont clairement indiqués dans votre tableau de bord marchand.
                        </p>
                        <p className="text-xs md:text-sm text-slate-500 leading-relaxed italic">
                            Nous nous réservons le droit de modifier nos tarifs avec un préavis de 30 jours. Les frais actuels sont automatiquement déduits avant les reversements sur votre compte bancaire ou mobile money.
                        </p>
                    </div>

                    {/* ARTICLE 3 : RESPONSABILITÉS DES MARCHANDS */}
                    <div className="p-6 md:p-8 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-4">
                        <div className="flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shrink-0">
                3
              </span>
                            <h2 className="text-base md:text-lg font-black text-slate-800">
                                Responsabilités des marchands
                            </h2>
                        </div>
                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                            En tant que marchand sur FastStore, vous êtes seul responsable de l&#39;inventaire, de l&#39;expédition et du service client lié à vos produits.
                        </p>
                        <ul className="pl-4 border-l-2 border-slate-100 space-y-2.5 text-xs text-slate-500 font-medium">
                            <li>• Les descriptions de produits doivent être honnêtes et précises.</li>
                            <li>• Vous devez honorer les commandes dans les délais promis.</li>
                            <li>• Vous êtes tenu de respecter toutes les lois fiscales locales applicables à vos ventes.</li>
                            <li>• Le traitement des retours et remboursements incombe au marchand.</li>
                        </ul>
                    </div>

                    {/* ARTICLE 4 : RÉSILIATION */}
                    <div className="p-6 md:p-8 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-4">
                        <div className="flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shrink-0">
                4
              </span>
                            <h2 className="text-base md:text-lg font-black text-slate-800">
                                Résiliation
                            </h2>
                        </div>
                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                            Vous pouvez fermer votre compte FastStore à tout moment. FastStore se réserve également le droit de suspendre ou de fermer votre compte en cas de violation de ces conditions.
                        </p>
                        <p className="text-xs md:text-sm text-slate-500 leading-relaxed italic">
                            En cas de résiliation, les fonds en attente seront versés selon le calendrier habituel, moins les éventuels remboursements ou frais impayés. Les données de votre boutique pourront être définitivement supprimées après 90 jours.
                        </p>
                    </div>

                </div>

                {/* SECTION FOOTER EMAIL LÉGAL */}
                <div className="mt-12 p-6 rounded-2xl bg-slate-150/40 border border-slate-200 text-center text-xs md:text-sm text-slate-500">
                    Pour toute question concernant ces conditions, veuillez contacter{" "}
                    <a
                        href="mailto:support@faststore.africa"
                        className="text-primary font-bold hover:underline"
                    >
                        support@faststore.africa
                    </a>.
                </div>

            </div>
        </div>
    );
}