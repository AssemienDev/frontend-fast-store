// app/merchant/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // CORRIGÉ : Importation officielle du Router Next.js
import { apiFetch } from "@/lib/api";
import { useMerchantAuthStore } from "@/store/merchantAuthStore";
import {
    Camera,
    Store,
    AtSign,
    Phone,
    MapPin,
    CheckCircle,
    Image as ImageIcon,
    Share2,
    Coins
} from "lucide-react";
import Link from "next/link";

export default function MerchantSettingsPage() {
    const router = useRouter(); // CORRIGÉ : Instanciation du hook pour les redirections
    const { shop, setShop } = useMerchantAuthStore();

    const [form, setForm] = useState({
        name: "",
        slug: "", // Read-only Store Handle
        slogan: "",
        theme_style: "MODERN",
        whatsapp_number: "",
        address: "",
        business_category: "Mode & Beauté",
        currency: "XOF",
        logo_url: "",
        primary_color: "#0F766E",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        // Charger les informations actuelles de la boutique en base de données
        apiFetch<any>("/merchant/shop")
            .then((data) => {
                setForm({
                    name: data.name,
                    slug: data.slug.toLowerCase(), // Sécurise la casse en minuscules
                    slogan: data.theme_settings?.slogan || "",
                    theme_style: data.theme_style,
                    whatsapp_number: data.whatsapp_number || "",
                    address: data.address || "",
                    business_category: data.business_category || "Mode & Beauté",
                    currency: data.currency,
                    logo_url: data.theme_settings?.logo_url || "",
                    primary_color: data.theme_settings?.primary_color || "#0F766E",
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Gère l'upload de logo sécurisé (Max 2 Mo) sur Cloudflare R2
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
            setError(err.message || "Échec du téléchargement du logo sur Cloudflare R2.");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAllChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const updatedShop = await apiFetch<any>("/merchant/shop", {
                method: "PUT",
                body: JSON.stringify(form),
            });

            // Mettre à jour l'état de la boutique globale dans Zustand
            setShop(updatedShop);
            setSuccess("Toutes les modifications ont été enregistrées avec succès !");

            // Faire disparaître le message de succès au bout de 3 secondes
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || "Impossible d'enregistrer vos modifications.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 animate-pulse">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-semibold">Chargement de vos paramètres...</p>
                </div>
            </div>
        );
    }

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
                    className="px-5 py-3 mt-8 rounded-xl bg-primary text-white font-extrabold text-xs hover:opacity-95 transition flex items-center justify-center gap-2 shadow-md shadow-teal-900/10 cursor-pointer whitespace-nowrap"
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

                {/* ROW COMPOSÉ 1 : LOGO (GAUCHE) & IDENTITÉ NOM/HANDLE (DROITE) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">

                    {/* UPLOADER DE LOGO DE MAQUETTE */}
                    <div className="md:col-span-5 bg-white border border-slate-200/60 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm h-56">
                        <div className="relative w-24 h-24 rounded-full border border-slate-150 bg-slate-50/50 flex items-center justify-center overflow-hidden group shadow-inner">
                            {form.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={form.logo_url} alt="Logo" className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-slate-400" />
                            )}

                            {/* Rond de sélection caméra de maquette */}
                            <label
                                htmlFor="logo-input-settings"
                                className="absolute bottom-1 right-1 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center border-2 border-white cursor-pointer active:scale-95 transition shadow"
                            >
                                <Camera className="w-3.5 h-3.5" />
                            </label>
                            <input
                                id="logo-input-settings"
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                            />
                        </div>
                        <span className="text-[10px] font-black text-primary uppercase mt-4 block">Logo de la boutique</span>
                        <span className="text-[9px] text-slate-400 font-semibold block mt-1 leading-normal">PNG, JPG jusqu'à 2 Mo</span>
                    </div>

                    {/* SAISIE NOM & READ-ONLY HANDLE */}
                    <div className="md:col-span-7 bg-white border border-slate-200/60 rounded-3xl p-6 flex flex-col justify-center space-y-4 shadow-sm h-56 text-left">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Nom de la boutique</label>
                            <input
                                type="text" required value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none focus:border-primary"
                            />
                        </div>

                        {/* LE HANDLE DE BOUTIQUE (SLUG - LEGISLATION READ-ONLY) */}
                        <div>
                            <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-50 select-none cursor-not-allowed">
                            <span className="bg-slate-100 border-r border-slate-200 px-3 py-3 text-xs md:text-sm font-bold text-slate-400 flex items-center">
                              <AtSign className="w-4 h-4" />
                            </span>
                                <input
                                    type="text" readOnly disabled value={form.slug}
                                    className="w-full px-4 py-3 text-xs md:text-sm text-slate-400 focus:outline-none bg-slate-50 cursor-not-allowed font-bold"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* CARD 2 : CANAUX DE CONTACT */}
                <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-5 text-left">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <Share2 className="w-5 h-5 text-primary" />
                        <h3 className="text-base font-black text-slate-800">Canaux de contact</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Affichage d'état vert de maquette pour WhatsApp */}
                        <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center">
                  <Phone className="w-4.5 h-4.5" />
                </span>
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">WhatsApp Business</h4>
                                    <p className="text-xs md:text-sm font-black text-slate-800 mt-1">{form.whatsapp_number}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => router.push("/merchant/settings")} // CORRIGÉ : utilise router.push proprement
                                className="text-xs font-bold text-primary hover:underline cursor-pointer"
                            >
                                Modifier
                            </button>
                        </div>
                    </div>
                </div>

                {/* NOUVELLE CARD 3 : PRÉFÉRENCES DE LA BOUTIQUE (DEVISE D'AFFICHAGE COPIÉE DU PROFIL PERSONNEL) */}
                <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-4 text-left">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <Coins className="w-5 h-5 text-[#F59E0B]" />
                        <h3 className="text-base font-black text-slate-900">Préférences de la boutique</h3>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Devise d'affichage des prix de vente</label>
                        <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Coins className="w-4 h-4" />
              </span>
                            <select
                                value={form.currency}
                                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-700 focus:outline-none focus:border-primary transition cursor-pointer font-bold"
                            >
                                <option value="XOF">FCFA (XOF) - Afrique de l'Ouest</option>
                                <option value="XAF">FCFA (XAF) - Afrique Centrale</option>
                                <option value="USD">USD ($) - Dollar Américain</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* CARD 4 : INFORMATIONS LÉGALES */}
                <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-4 text-left">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <MapPin className="w-5 h-5 text-primary" />
                        <h3 className="text-base font-black text-slate-900">Informations légales</h3>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Adresse physique de l&#39;entreprise</label>
                        <textarea
                            rows={4} required value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-xs md:text-sm text-slate-800 focus:outline-none focus:border-primary transition resize-none leading-relaxed"
                            placeholder="Saisissez l'adresse de votre siège ou entrepôt..."
                        />
                    </div>
                </div>

                {/* BOUTON ENREGISTRER TOUT */}
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