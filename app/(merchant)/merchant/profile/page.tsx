// app/merchant/settings/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMerchantAuthStore } from "@/store/merchantAuthStore";
import { apiFetch } from "@/lib/api";
import { User, Mail, Phone, LogOut, CheckCircle, Smartphone } from "lucide-react";
import Link from "next/link";

export default function MerchantProfileSettingsPage() {
    const router = useRouter();
    const { merchant, updateMerchant, clearCredentials } = useMerchantAuthStore();

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        phone: "",
    });

    const [phonePrefix, setPhonePrefix] = useState("+225");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (merchant) {
            // Découper le préfixe téléphonique s'il existe
            let rawPhone = merchant.personal_phone || "";
            let detectedPrefix = "+225";

            const prefixes = ["+221", "+225", "+228", "+229", "+237", "+241", "+243"];
            const matchedPrefix = prefixes.find(p => rawPhone.startsWith(p));
            if (matchedPrefix) {
                detectedPrefix = matchedPrefix;
                rawPhone = rawPhone.replace(matchedPrefix, "");
            }

            setForm({
                full_name: merchant.full_name || "",
                email: merchant.email || "",
                phone: rawPhone,
            });
            setPhonePrefix(detectedPrefix);
            setLoading(false);
        }
    }, [merchant]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        const fullPhone = `${phonePrefix}${form.phone.replace(/\s+/g, "")}`;

        try {
            // Appel de l'API de mise à jour du profil utilisateur
            const updatedUser = await apiFetch<any>("/auth/profile", {
                method: "PUT",
                body: JSON.stringify({
                    full_name: form.full_name,
                    personal_phone: fullPhone,
                })
            });

            // Mettre à jour l'état local dans Zustand
            updateMerchant({
                full_name: updatedUser.full_name,
                personal_phone: updatedUser.personal_phone
            });

            setSuccess("Vos informations personnelles ont été enregistrées avec succès !");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || "Impossible de sauvegarder vos informations.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        clearCredentials();
        router.push("/");
    };

    if (loading || !merchant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 animate-pulse">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-semibold">Chargement de votre profil...</p>
                </div>
            </div>
        );
    }

    const initials = merchant.full_name ? merchant.full_name.charAt(0).toUpperCase() + (merchant.full_name.split(" ")[1]?.charAt(0).toUpperCase() || "") : "SO";

    return (
        <div className="bg-[#F8FAFC] min-h-screen py-12 px-6">
            <div className="max-w-xl mx-auto space-y-8">

                {/* AVATAR GÉANT EN-TÊTE DE LA MAQUETTE */}
                <div className="text-center space-y-4">
                    <div className="w-20 h-24 rounded-full bg-primary text-white font-black text-2xl flex items-center justify-center mx-auto shadow-inner border-2 border-white">
                        {initials}
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 leading-snug">Propriétaire de la boutique</h2>
                    </div>
                </div>

                {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">{error}</div>}
                {success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0" /> {success}
                    </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-6">

                    {/* CARTE 1 : INFORMATIONS PERSONNELLES (IMAGE PROFIL) */}
                    <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-4 text-left">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                            <User className="w-4.5 h-4.5 text-primary" />
                            <h3 className="text-sm font-black text-slate-800">Informations personnelles</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Nom complet */}
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Nom et prénom</label>
                                <input
                                    type="text" required value={form.full_name}
                                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                    placeholder="Votre nom complet"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none"
                                />
                            </div>

                            {/* Email (Lecture seule sécurisée) */}
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Adresse email</label>
                                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                                    <input
                                        type="email" disabled readOnly value={form.email}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-400 cursor-not-allowed select-none"
                                    />
                                </div>
                            </div>

                            {/* Téléphone personnel */}
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Numéro de téléphone</label>
                                <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:border-primary transition">
                                    <select
                                        value={phonePrefix}
                                        onChange={(e) => setPhonePrefix(e.target.value)}
                                        className="bg-slate-50/50 border-r border-slate-200 px-3 py-3 text-xs md:text-sm font-bold text-slate-600 focus:outline-none"
                                    >
                                        <option value="+221">🇸🇳 +221</option>
                                        <option value="+225">🇨🇮 +225</option>
                                        <option value="+228">🇹🇬 +228</option>
                                        <option value="+229">🇧🇯 +229</option>
                                        <option value="+237">🇨🇲 +237</option>
                                    </select>
                                    <input
                                        type="tel" required value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="07070707"
                                        className="w-full px-4 py-3 text-xs md:text-sm text-slate-800 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LIEN DE DECONNEXION RED DE LA MAQUETTE */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer transition"
                        >
                            Déconnexion du compte
                        </button>
                    </div>
                    <Link
                        href="/profile/security"
                        className="px-5 py-3 mt-10 rounded-xl bg-primary text-white font-extrabold text-xs hover:opacity-95 transition flex items-center justify-center gap-2 shadow-md shadow-teal-900/10 cursor-pointer whitespace-nowrap"
                    >
                        Modifier mot de passe
                    </Link>

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
        </div>
    );
}