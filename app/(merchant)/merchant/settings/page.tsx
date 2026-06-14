// app/merchant/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useMerchantAuthStore } from "@/store/merchantAuthStore";
import { HexColorPicker } from "react-colorful"; // Sélecteur de couleur flottant
import {
    Camera,
    Store,
    AtSign,
    Phone,
    MapPin,
    CheckCircle,
    Image as ImageIcon,
    Share2,
    Coins,
    Palette,
    Layers,
    Globe,
    Check
} from "lucide-react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import Link from "next/link";

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


export default function MerchantSettingsPage() {
    const router = useRouter();
    const { shop, setShop } = useMerchantAuthStore();

    const [form, setForm] = useState({
        name: "",
        slug: "",
        slogan: "",
        theme_style: "MODERN",
        whatsapp_number: "",
        instagram_handle: "",
        address: "",
        business_category: "Mode & Beauté",
        currency: "XOF",
        logo_url: "",
        primary_color: "#0F766E",
        seo_description: "",
        default_payment_method: "ONLINE", // "ONLINE" | "CASH_ON_DELIVERY" | "PARTIAL_HYBRID"
        down_payment_percentage: 0
    });

    const [whatsappPrefix, setWhatsappPrefix] = useState("+225");
    const [whatsappRaw, setWhatsappRaw] = useState("");

    const [isOtherCategory, setIsOtherCategory] = useState(false);
    const [customCategory, setCustomCategory] = useState("");
    const [showColorPicker, setShowColorPicker] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        apiFetch<any>("/merchant/shop")
            .then((data) => {
                // Découper l'indicatif WhatsApp
                let rawWa = data.whatsapp_number || "";
                let detectedPrefix = "+225";
                const prefixes = ["+221", "+225", "+228", "+229", "+237", "+241", "+243"];
                const matchedPrefix = prefixes.find(p => rawWa.startsWith(p));
                if (matchedPrefix) {
                    detectedPrefix = matchedPrefix;
                    rawWa = rawWa.replace(matchedPrefix, "");
                }

                // Vérifier si le secteur d'activité est personnalisé (Autre)
                const isStandard = STANDARD_CATEGORIES.includes(data.business_category);
                setIsOtherCategory(!isStandard && data.business_category);
                if (!isStandard) {
                    setCustomCategory(data.business_category || "");
                }

                setForm({
                    name: data.name,
                    slug: data.slug.toLowerCase(),
                    slogan: data.theme_settings?.slogan || "",
                    theme_style: data.theme_style,
                    whatsapp_number: data.whatsapp_number || "",
                    instagram_handle: data.theme_settings?.instagram_handle || "",
                    address: data.address || "",
                    business_category: data.business_category || "Mode & Beauté",
                    currency: data.currency,
                    logo_url: data.theme_settings?.logo_url || "",
                    primary_color: data.theme_settings?.primary_color || "#0F766E",
                    seo_description: data.seo_description || "",
                    default_payment_method: data.default_payment_method || "ONLINE",
                    down_payment_percentage: data.down_payment_percentage || 0,
                });

                setWhatsappPrefix(detectedPrefix);
                setWhatsappRaw(rawWa);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setError("Le logo est trop volumineux. La taille maximale autorisée est de 2 Mo.");
            return;
        }

        setError(null);
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await apiFetch<{ url: string }>("/merchant/upload", {
                method: "POST",
                body: formData,
            });

            setForm((prev) => ({ ...prev, logo_url: res.url }));
        } catch (err: any) {
            setError(err.message || "Échec de l'upload du logo sur Cloudflare R2.");
        } finally {
            setSaving(false);
        }
    };

    const handleCategoryChange = (val: string) => {
        if (val === "Autre (Saisir manuellement)") {
            setIsOtherCategory(true);
            setForm({ ...form, business_category: customCategory || "Autre" });
        } else {
            setIsOtherCategory(false);
            setForm({ ...form, business_category: val });
        }
    };

    const handleCustomCategoryChange = (val: string) => {
        setCustomCategory(val);
        setForm({ ...form, business_category: val });
    };

    const handleSaveAllChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        const fullWhatsApp = `${whatsappPrefix}${whatsappRaw.replace(/\s+/g, "")}`;

        try {
            const updatedShop = await apiFetch<any>("/merchant/shop", {
                method: "PUT",
                body: JSON.stringify({
                    ...form,
                    whatsapp_number: fullWhatsApp
                }),
            });

            setShop(updatedShop);
            setSuccess("Toutes les modifications ont été enregistrées avec succès !");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || "Impossible d'enregistrer vos modifications.");
        } finally {
            setSaving(false);
        }
    };

    const getContrastClass = (hexColor: string) => {
        const hex = hexColor.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16) || 0;
        const g = parseInt(hex.substring(2, 4), 16) || 0;
        const b = parseInt(hex.substring(4, 6), 16) || 0;
        const yiq = (r * 299 + g * 587 + b * 114) / 1000;
        return yiq >= 128 ? "text-slate-900" : "text-white";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutra animate-pulse">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-semibold">Chargement de vos paramètres...</p>
                </div>
            </div>
        );
    }

    const isCustomColorActive = form.primary_color;
    const customContrastClass = form.primary_color;

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-4xl w-full mx-auto relative">

            {/* EN-TÊTE DE LA PAGE */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Paramètres de la boutique</h1>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Gérez l&#39;identité de votre marque et votre présence légale.</p>
                </div>
                <Link
                    href="/settings/notifications"
                    className="px-5 py-3 rounded-xl bg-primary text-white font-extrabold text-xs hover:opacity-95 transition flex items-center justify-center gap-2 shadow-md shadow-primary/10 cursor-pointer whitespace-nowrap"
                >
                    Configuration Notifications
                </Link>
            </div>

            {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">{error}</div>}
            {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" /> {success}
                </div>
            )}

            <form onSubmit={handleSaveAllChanges} className="space-y-6">

                {/* CARD 1 : LOGO & IDENTITÉ NOM/HANDLE */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    <div className="md:col-span-5 bg-white border border-slate-200/60 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm h-56">
                        <div className="relative w-24 h-24 rounded-full border border-slate-150 bg-slate-50/50 flex items-center justify-center overflow-hidden group shadow-inner">
                            {form.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={form.logo_url} alt="Logo" className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-slate-400" />
                            )}
                            <label
                                htmlFor="logo-input-settings"
                                className="absolute bottom-1 right-1 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center border-2 border-white cursor-pointer active:scale-95 transition shadow"
                            >
                                <Camera className="w-3.5 h-3.5" />
                            </label>
                            <input id="logo-input-settings" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </div>
                        <span className="text-[10px] font-black text-primary uppercase mt-4 block">Logo de la boutique</span>
                        <span className="text-[9px] text-slate-400 font-semibold block mt-1 leading-normal">PNG, JPG jusqu'à 2 Mo</span>
                    </div>

                    <div className="md:col-span-7 bg-white border border-slate-200/60 rounded-3xl p-6 flex flex-col justify-center space-y-4 shadow-sm h-56 text-left">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Nom de la boutique</label>
                            <input
                                type="text" required value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Handle de la boutique</label>
                            <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-50 select-none cursor-not-allowed">
                <span className="bg-slate-100 border-r border-slate-200 px-3 py-3 text-xs md:text-sm font-bold text-slate-400 flex items-center">
                  <AtSign className="w-4 h-4" />
                </span>
                                <input type="text" readOnly disabled value={form.slug} className="w-full px-4 py-3 text-xs md:text-sm text-slate-400 focus:outline-none bg-slate-50 cursor-not-allowed font-bold" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CARD 2 : CANAUX DE CONTACT (WHATSAPP ÉDITABLE & INSTAGRAM) */}
                <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-5 text-left">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <Share2 className="w-5 h-5 text-primary" />
                        <h3 className="text-base font-black text-slate-800">Canaux de contact</h3>
                    </div>
                    <div className="w-full">
                        <div className="flex flex-col md:flex-row gap-4">
                            <label className="block w-1/4 font-black uppercase text-slate-500 tracking-wider mb-2">WhatsApp*</label>
                            <div className="flex w-full border border-slate-200 rounded-xl overflow-hidden focus-within:border-primary transition bg-slate-50/50">
                                <select
                                    value={whatsappPrefix}
                                    onChange={(e) => setWhatsappPrefix(e.target.value)}
                                    className="bg-slate-100 border-r border-slate-200 px-3 py-3 text-xs font-bold text-slate-500 focus:outline-none"
                                >
                                    <option value="+221">🇸🇳 +221</option>
                                    <option value="+225">🇨🇮 +225</option>
                                    <option value="+228">🇹🇬 +228</option>
                                    <option value="+229">🇧🇯 +229</option>
                                    <option value="+237">🇨🇲 +237</option>
                                </select>
                                <input
                                    type="tel" required value={whatsappRaw}
                                    onChange={(e) => setWhatsappRaw(e.target.value)}
                                    placeholder="07070707"
                                    className="w-full px-4 py-3 text-xs text-slate-800 focus:outline-none bg-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CARD 3 : IDENTITÉ VISUELLE, SLOGAN & COULEURS (Nouveau) */}
                <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-5 text-left">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <Palette className="w-5 h-5 text-primary" />
                        <h3 className="text-base font-black text-slate-800">Identité Visuelle & Thème</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Slogan de la marque</label>
                            <input
                                type="text" value={form.slogan}
                                onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                                placeholder="Ex: La qualité avant tout"
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none focus:border-primary transition"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Template de style</label>
                            <select
                                value={form.theme_style}
                                onChange={(e) => setForm({ ...form, theme_style: e.target.value })}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-700 focus:outline-none"
                            >
                                <option value="MODERN">Moderne (Bannières d'appel)</option>
                                <option value="MINIMALIST">Minimaliste (Luxe épuré)</option>
                                <option value="COLORFUL">Coloré (Dynamique)</option>
                            </select>
                        </div>
                    </div>

                    {/* SÉLECTEUR DE COULEURS AVEC PICKER FLOTTANT (ZÉRO-BUG CONTRASTE) */}
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Couleur principale de marque</label>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 p-3 bg-slate-50/50 border border-slate-150 rounded-2xl relative">

                            {/* Le bouton d'encre coloré */}
                            <div
                                style={{ backgroundColor: isCustomColorActive ? form.primary_color : "#ffffff" }}
                                className={`relative w-8 h-8 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition shadow-sm ${
                                    isCustomColorActive ? "ring-2 ring-offset-2 ring-slate-800" : ""
                                }`}
                            >
                                {isCustomColorActive ? (
                                    <Check className={`w-4 h-4 z-10 drop-shadow-sm ${customContrastClass}`} />
                                ) : (
                                    <button type="button" onClick={() => setShowColorPicker(!showColorPicker)} className="text-xs z-10 select-none">🎨</button>
                                )}
                                <input
                                    type="color" value={form.primary_color}
                                    onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                            </div>

                            {showColorPicker && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setShowColorPicker(false)} />
                                    <div className="absolute left-0 mt-3 p-3 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 animate-scaleIn">
                                        <HexColorPicker color={form.primary_color} onChange={(color) => setForm({ ...form, primary_color: color })} />
                                    </div>
                                </>
                            )}

                            <span className="text-[10px] font-black uppercase text-slate-400 bg-white border border-slate-150 px-2.5 py-1.5 rounded-lg ml-2 font-mono shadow-inner">
                {form.primary_color}
              </span>
                        </div>
                    </div>
                </div>

                {/* CARD 4 : CONFIGURATION DE PRÉFÉRENCES (DEVISE & SECTEUR D'ACTIVITÉ AUTRE INCLUS) */}
                <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-5 text-left">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <Coins className="w-5 h-5 text-[#F59E0B]" />
                        <h3 className="text-base font-black text-slate-900">Préférences de la boutique</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Devise d'affichage des prix</label>
                            <select
                                value={form.currency}
                                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-700 focus:outline-none"
                            >
                                <option value="XOF">FCFA (XOF) - Afrique de l'Ouest</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Secteur d'activité</label>
                            <select
                                value={isOtherCategory ? "Autre (Saisir manuellement)" : form.business_category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-700 focus:outline-none"
                            >
                                {STANDARD_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Saisie personnalisée si "Autre" choisi */}
                    {isOtherCategory && (
                        <div className="mt-3 animate-fadeIn">
                            <input
                                type="text" required value={customCategory}
                                onChange={(e) => handleCustomCategoryChange(e.target.value)}
                                placeholder="Saisissez votre catégorie personnalisée"
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none focus:border-primary transition"
                            />
                        </div>
                    )}

                    {/* CONFIGURATION DE PAIEMENT SÉCURISÉ & ACOMPTE EN % (NOUVEAU) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-700 tracking-wider mb-2">Méthode de paiement de la boutique</label>
                            <select
                                value={form.default_payment_method}
                                onChange={(e) => setForm({ ...form, default_payment_method: e.target.value })}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-700 focus:outline-none"
                            >
                                <option value="ONLINE">Paiement en ligne complet</option>
                                <option value="CASH_ON_DELIVERY">Paiement 100% à la livraison (COD)</option>
                                <option value="PARTIAL_HYBRID">Acompte en ligne + Reste à la livraison</option>
                            </select>
                        </div>

                        {/* Saisie du pourcentage de l'acompte si l'option hybride est sélectionnée */}
                        {form.default_payment_method === "PARTIAL_HYBRID" && (
                            <div className="animate-fadeIn">
                                <label className="block text-[10px] font-black uppercase text-slate-700 tracking-wider mb-2">Pourcentage de l&#39;acompte (%)</label>
                                <input
                                    type="number" required min={1} max={100}
                                    value={form.down_payment_percentage}
                                    onChange={(e) => setForm({ ...form, down_payment_percentage: parseFloat(e.target.value) || 0 })}
                                    placeholder="Ex: 20 (pour 20% d'acompte)"
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-850 focus:outline-none focus:border-primary transition"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* CARD 5 : ADRESSE PHYSIQUE & DESCRIPTION RÉFÉRENCEMENT SEO */}
                <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-4 text-left">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <MapPin className="w-5 h-5 text-primary" />
                        <h3 className="text-base font-black text-slate-900">Informations légales & Référencement</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Adresse physique de l&#39;entreprise</label>
                            <textarea
                                rows={3} required value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs md:text-sm text-slate-800 focus:outline-none focus:border-primary resize-none leading-relaxed"
                                placeholder="Ex: Cocody Riviera 3, Villa 14, Abidjan, Côte d'Ivoire"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Description SEO (Moteurs de recherche)</label>
                            <textarea
                                rows={3} required value={form.seo_description}
                                onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                                className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs md:text-sm text-slate-800 focus:outline-none focus:border-primary resize-none leading-relaxed"
                                placeholder="Décrivez brièvement votre boutique pour améliorer votre classement sur Google (Max 160 caractères)."
                            />
                        </div>
                    </div>
                </div>

                {/* BOUTON ENREGISTRER */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 rounded-xl bg-primary text-white font-extrabold text-xs md:text-sm hover:opacity-95 transition flex items-center justify-center shadow-md cursor-pointer disabled:opacity-50"
                >
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        "Enregistrer les modifications"
                    )}
                </button>

            </form>
        </div>
    );
}