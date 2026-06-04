// app/merchant/onboarding/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMerchantAuthStore } from "@/store/merchantAuthStore";
import { apiFetch } from "@/lib/api";
import { Store, Palette, Check, Phone, Layers, Coins, Image as ImageIcon } from "lucide-react";

export default function OnboardingPage() {
    const router = useRouter();
    const { merchant, isAuthenticated, updateMerchant } = useMerchantAuthStore();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ÉTAT DE CRÉATION DE BOUTIQUE (Regroupe les 3 étapes)
    const [shopData, setShopData] = useState({
        name: "",
        slogan: "",
        theme_style: "MODERN", // MODERN | MINIMALIST | COLORFUL
        whatsapp_number: "",
        address: "",
        business_category: "Mode & Beauté",
        currency: "XOF", // XOF | XAF | USD
        logo_url: "",
        primary_color: "#0F766E", // Couleur de marque par défaut (Teal)
    });

    const STANDARD_CATEGORIES = [
        "Mode, Vêtements & Chaussures",
        "Beauté, Cosmétiques & Maquillage",
        "Électronique, Smartphones & Informatique",
        "Alimentation, Restauration & Épicerie",
        "Maison, Déco & Mobilier",
        "Santé, Pharmacie & Bien-être",
        "Bijoux, Montres & Accessoires",
        "Éducation, Livres & Papeterie",
        "Autre (Saisir manuellement)"
    ];

    const [isOtherCategory, setIsOtherCategory] = useState(false);
    const [customCategory, setCustomCategory] = useState("");

    // Gère le changement de sélection dans le dropdown
    const handleCategoryChange = (val: string) => {
        if (val === "Autre (Saisir manuellement)") {
            setIsOtherCategory(true);
            setShopData({ ...shopData, business_category: customCategory || "Autre" });
        } else {
            setIsOtherCategory(false);
            setShopData({ ...shopData, business_category: val });
        }
    };

    // Gère la saisie manuelle personnalisée
    const handleCustomCategoryChange = (val: string) => {
        setCustomCategory(val);
        setShopData({ ...shopData, business_category: val });
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Veuillez sélectionner un fichier image valide (PNG, JPG, JPEG).");
            return;
        }

        // Validation de taille côté client (2 Mo)
        const maxLimit = 2 * 1024 * 1024;
        if (file.size > maxLimit) {
            setError("Ce fichier est trop volumineux. La taille maximale autorisée est de 2 Mo.");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            // Utilisation de FormData pour envoyer le fichier physique au backend
            const formData = new FormData();
            formData.append("file", file);

            const res = await apiFetch<{ url: string }>("/merchant/upload", {
                method: "POST",
                body: formData,
                headers: {}
            });

            // Enregistrer l'URL publique R2 retournée par le serveur dans l'état de la boutique
            setShopData({ ...shopData, logo_url: res.url });
        } catch (err: any) {
            setError(err.message || "Échec de l'envoi de votre logo en sauvegarde.");
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour retirer le logo chargé
    const handleRemoveLogo = () => {
        setShopData({ ...shopData, logo_url: "" });
    };

    useEffect(() => {
        // Garde de verrouillage : redirige si pas connecté ou si le marchand a déjà sa boutique active
        if (!isAuthenticated) {
            router.push("/register");
        }
    }, [isAuthenticated, router]);

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (step === 1 && !shopData.name) {
            setError("Veuillez donner un nom à votre boutique.");
            return;
        }
        if (step === 2 && !shopData.theme_style) {
            setError("Veuillez sélectionner une identité visuelle.");
            return;
        }

        setStep(step + 1);
    };

    const handleSubmitOnboarding = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!shopData.whatsapp_number) {
            setError("Veuillez saisir votre numéro WhatsApp professionnel.");
            setLoading(false);
            return;
        }

        try {
            await apiFetch("/merchant/shop", {
                method: "POST",
                body: JSON.stringify(shopData),
            });

            // On déverrouille l'accès du marchand connecté dans son store
            updateMerchant({ role: "MERCHANT" }); // Confirme son onboarding complet

            router.push("/"); // Ouvre l'accès au tableau de bord !
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'enregistrement de votre boutique.");
        } finally {
            setLoading(false);
        }
    };

    // Liste de pastilles de couleurs pour l'étape 3
    const brandColors = ["#0F766E", "#0284C7", "#D97706", "#DC2626", "#7C3AED", "#16A34A", "#09090B"];

    return (
        <div className="bg-[#F8FAFC] min-h-screen flex flex-col items-center justify-center py-12 px-6">
            <div className="max-w-xl w-full bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">

                {/* BANDEAU INDICATEUR D'ÉTAPES EN HAUT */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-400">Étape {step} sur 3</span>
                    <div className="flex gap-1">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-1.5 w-8 rounded-full transition-all duration-300 ${
                                    s <= step ? "bg-primary" : "bg-slate-150"
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 mb-6">
                        {error}
                    </div>
                )}

                {/* ========================================================= */}
                {/* ÉTAPE 1 : NOM & SLOGAN DE BOUTIQUE (COPIE CONFORME MAQUETTE) */}
                {/* ========================================================= */}
                {step === 1 && (
                    <form onSubmit={handleNextStep} className="space-y-6">
                        {/* Illustration de maquette */}
                        <div className="h-40 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
                            <div className="text-primary text-center">
                                <Store className="w-12 h-12 mx-auto animate-bounce" />
                                <span className="text-[10px] font-black uppercase tracking-widest block mt-2">Configuration Initiale</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <h1 className="text-2xl font-black text-slate-950">Création de boutique</h1>
                            <p className="text-xs md:text-sm text-slate-500 mt-2">
                                Commençons par les bases. Comment souhaitez-vous appeler votre espace de vente ?
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-2">
                                    Nom de la boutique <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Store className="w-4 h-4" />
                                  </span>
                                    <input
                                        type="text"
                                        required
                                        value={shopData.name}
                                        onChange={(e) => setShopData({ ...shopData, name: e.target.value })}
                                        placeholder="Ex: Ma Boutique Élégante"
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-2">
                                    Slogan (Optionnel)
                                </label>
                                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Palette className="w-4 h-4" />
                  </span>
                                    <input
                                        type="text"
                                        value={shopData.slogan}
                                        onChange={(e) => setShopData({ ...shopData, slogan: e.target.value })}
                                        placeholder="Ex: La qualité avant tout"
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 font-semibold mt-1.5 leading-normal">
                                    Une phrase d&#39;accroche courte pour définir votre marque.
                                </p>
                            </div>
                        </div>

                        <button type="submit" className="w-full py-4 rounded-xl bg-third hover:bg-primary text-white font-extrabold text-xs md:text-sm hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                            Suivant →
                        </button>
                    </form>
                )}

                {/* ========================================================= */}
                {/* ÉTAPE 2 : CHOIX DU THÈME VISUEL (PIXEL-PERFECT MAQUETTE) */}
                {/* ========================================================= */}
                {step === 2 && (
                    <form onSubmit={handleNextStep} className="space-y-6 max-w-4xl mx-auto w-full">
                        <div className="text-center">
                            <h2 className="text-xl md:text-2xl font-black text-slate-900">Choisissez votre style</h2>
                            <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-md mx-auto">
                                L&#39;apparence de votre boutique est la première impression de vos clients. Sélectionnez un thème qui correspond à l'identité de votre marque. Vous pourrez le modifier plus tard.
                            </p>
                        </div>

                        {/* GRILLE DES THÈMES SÉLECTIONNABLES */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    key: "MODERN",
                                    name: "Moderne",
                                    desc: "Épuré, professionnel et orienté vers la conversion avec des contrastes forts.",
                                    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80" // Preview Moderne (Sombre, épuré)
                                },
                                {
                                    key: "MINIMALIST",
                                    name: "Minimaliste",
                                    desc: "Laisse vos produits respirer avec beaucoup d'espace blanc et des lignes fines.",
                                    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80" // Preview Minimaliste (Blanc, lignes fines)
                                },
                                {
                                    key: "COLORFUL",
                                    name: "Coloré",
                                    desc: "Vibrant et audacieux, parfait pour les marques de mode, beauté et style de vie.",
                                    img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80" // Preview Coloré (Vibrant, abstrait)
                                }
                            ].map((theme) => {
                                const isSelected = shopData.theme_style === theme.key;
                                return (
                                    <button
                                        key={theme.key}
                                        type="button"
                                        onClick={() => setShopData({ ...shopData, theme_style: theme.key })}
                                        className={`rounded-2xl border text-left flex flex-col overflow-hidden cursor-pointer transition-all duration-200 bg-white ${
                                            isSelected
                                                ? "border-2 border-primary shadow-lg shadow-teal-900/5 scale-[1.02] transform"
                                                : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                                        }`}
                                    >
                                        {/* ILLUSTRATION DE PRÉVISUALISATION EN HAUT */}
                                        <div className="relative h-32 md:h-36 w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={theme.img}
                                                alt={`Aperçu du thème ${theme.name}`}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* CONTENU TEXTE & SÉLECTEUR CIRCULAIRE EN BAS */}
                                        <div className="p-5 space-y-2.5 grow flex flex-col justify-between">
                                            <div className="flex justify-between items-center w-full">
                                                <span className="text-sm font-black text-slate-800">{theme.name}</span>

                                                {/* SÉLECTEUR CIRCULAIRE DE MAQUETTE */}
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-250 ${
                                                    isSelected
                                                        ? "border-primary bg-primary text-white"
                                                        : "border-slate-300 bg-white"
                                                }`}>
                                                    {isSelected && <span className="text-[10px] font-bold">✓</span>}
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                                                {theme.desc}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* BOUTONS DE NAVIGATION */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-1/3 py-4 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs md:text-sm hover:bg-slate-50 transition duration-150"
                            >
                                Retour
                            </button>
                            <button
                                type="submit"
                                className="w-2/3 py-4 rounded-xl bg-third hover:bg-primary text-white font-extrabold text-xs md:text-sm hover:opacity-95 transition duration-150 flex items-center justify-center"
                            >
                                Suivant →
                            </button>
                        </div>
                    </form>
                )}

                {/* ========================================================= */}
                {/* ÉTAPE 3 : INFORMATIONS D'ENTREPRISE, LOGO ET COULEURS */}
                {/* ========================================================= */}
                {step === 3 && (
                    <form onSubmit={handleSubmitOnboarding} className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl md:text-2xl font-black text-slate-900">Détails de l&#39;entreprise</h2>
                            <p className="text-xs md:text-sm text-slate-400 mt-2">Dernière étape ! Configurez vos contacts de livraison et votre identité de marque.</p>
                        </div>

                        <div className="space-y-4">
                            {/* WhatsApp pro */}
                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-2">
                                    Numéro WhatsApp Professionnel <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Phone className="w-4 h-4" />
                                  </span>
                                    <input
                                        type="tel"
                                        required
                                        value={shopData.whatsapp_number}
                                        onChange={(e) => setShopData({ ...shopData, whatsapp_number: e.target.value })}
                                        placeholder="Ex: +2250102030405"
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none focus:border-primary transition"
                                    />
                                </div>
                            </div>

                            {/* Devise & Catégorie (Ligne responsive) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* SÉLECTEUR DE CATÉGORIE DYNAMIQUE (ÉCRAN 'DETAILS ENTREPRISE') */}
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-2">
                                        Catégorie d&#39;activité
                                    </label>
                                    <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                      <Layers className="w-4 h-4" />
                                    </span>
                                        <select
                                            value={isOtherCategory ? "Autre (Saisir manuellement)" : shopData.business_category}
                                            onChange={(e) => handleCategoryChange(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-700 focus:outline-none focus:border-primary transition cursor-pointer"
                                        >
                                            {STANDARD_CATEGORIES.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* CHAMP DE SAISIE MANUELLE (AFFICHE UNIQUEMENT SI "AUTRE" EST SÉLECTIONNÉ) */}
                                    {isOtherCategory && (
                                        <div className="mt-3 animate-fadeIn">
                                            <input
                                                type="text"
                                                required
                                                value={customCategory}
                                                onChange={(e) => handleCustomCategoryChange(e.target.value)}
                                                placeholder="Saisissez votre catégorie personnalisée"
                                                className="w-full px-4 py-3 bg-white border border-primary rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition"
                                            />
                                            <p className="text-[10px] text-primary font-bold mt-1.5 leading-normal">
                                                Indiquez précisément votre secteur pour nous aider à optimiser votre catalogue.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-2">
                                        Devise de vente
                                    </label>
                                    <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                      <Coins className="w-4 h-4" />
                                    </span>
                                        <select
                                            value={shopData.currency}
                                            onChange={(e) => setShopData({ ...shopData, currency: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-700 focus:outline-none focus:border-primary transition"
                                        >
                                            <option value="XOF">XOF (FCFA UEMOA)</option>
                                            <option value="XAF">XAF (FCFA CEMAC)</option>
                                            <option value="USD">USD (Dollar)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>


                            {/* CHARGEMENT DU LOGO AVEC VALIDATION DE TAILLE (MAX 2 MO) */}
                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-2">
                                    Logo de votre boutique (Max 2 Mo)
                                </label>

                                <div className="flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-150 rounded-2xl">
                                    {/* APERÇU DU LOGO (AFFICHE UNE ICÔNE PAR DÉFAUT OU L'IMAGE CHARGÉE) */}
                                    <div className="w-14 h-14 rounded-full border border-slate-200 bg-white flex items-center justify-center overflow-hidden relative shrink-0">
                                        {shopData.logo_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={shopData.logo_url}
                                                alt="Aperçu du logo"
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="w-5 h-5 text-slate-400" />
                                        )}
                                    </div>

                                    {/* ACTIONS DE CHARGEMENT */}
                                    <div className="flex-grow">
                                        {shopData.logo_url ? (
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Logo chargé avec succès</span>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveLogo}
                                                    className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                                                >
                                                    Retirer l&#39;image
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                {/* Bouton stylisé personnalisé masquant l'input file par défaut du navigateur */}
                                                <label
                                                    htmlFor="logo_file_input"
                                                    className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold cursor-pointer inline-block transition shadow-sm"
                                                >
                                                    Choisir un fichier
                                                </label>
                                                <input
                                                    id="logo_file_input"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                    className="hidden" // Cache l'input natif moche
                                                />
                                                <span className="text-[10px] text-slate-400 font-semibold block mt-1.5 leading-normal">
                                                    Formats acceptés : PNG, JPG. Max 2 Mo.
                                                  </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Couleur principale de marque */}
                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider mb-2">
                                    Couleur principale de votre boutique
                                </label>
                                <div className="flex flex-wrap items-center gap-3 mt-1.5 p-3 bg-slate-50/50 border border-slate-150 rounded-2xl">
                                    {brandColors.map((color) => {
                                        const isSelected = shopData.primary_color === color;
                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setShopData({ ...shopData, primary_color: color })}
                                                style={{ backgroundColor: color }}
                                                className={`w-8 h-8 rounded-full cursor-pointer transition transform active:scale-95 flex items-center justify-center text-white ${
                                                    isSelected ? "ring-2 ring-offset-2 ring-slate-800" : ""
                                                }`}
                                                title={color}
                                            >
                                                {isSelected && <Check className="w-4 h-4" />}
                                            </button>
                                        );
                                    })}
                                    <input
                                        type="color"
                                        value={shopData.primary_color}
                                        onChange={(e) => setShopData({ ...shopData, primary_color: e.target.value })}
                                        className="w-8 h-8 rounded-md cursor-pointer border border-slate-200"
                                        title="Choisir une autre couleur"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => setStep(2)} className="w-1/3 py-4 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs md:text-sm hover:bg-slate-50 transition">
                                Retour
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-2/3 py-4 rounded-xl bg-third hover:bg-primary text-white font-extrabold text-xs md:text-sm hover:opacity-95 transition flex items-center justify-center disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    "Créer ma boutique"
                                )}
                            </button>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
}