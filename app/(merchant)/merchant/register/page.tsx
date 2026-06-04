// app/merchant/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { User, Mail, Lock, Phone, Eye, EyeOff } from "lucide-react";

export default function MerchantRegisterPage() {
    const router = useRouter();
    // AJOUT DE "imp" DANS L'ÉTAT INITIAL DU FORMULAIRE
    const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", imp: "" });
    const [phonePrefix, setPhonePrefix] = useState("+225");
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!acceptTerms) {
            setError("Vous devez accepter les conditions d'utilisation pour continuer.");
            return;
        }

        setLoading(true);

        try {
            const fullPhone = `${phonePrefix}${form.phone.replace(/\s+/g, "")}`;

            await apiFetch("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    full_name: form.name,
                    personal_phone: fullPhone,
                    imp: form.imp
                }),
            });

            router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de la création de votre boutique.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#F7F9FB] min-h-screen flex items-center justify-center py-12 px-6">
            <div className="max-w-xl w-full bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm">

                {/* EN-TÊTE DE LA CARTE */}
                <div className="text-center mb-8">
                    <h1 className=" text-2xl  font-bold text-slate-900 tracking-tight">
                        Créez votre boutique
                    </h1>
                    <p className="text-sm text-slate-700 mt-2 font-medium">
                        Rejoignez des milliers de marchands et développez votre activité.
                    </p>
                </div>

                {/* MESSAGES D'ERREUR */}
                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 mb-6 leading-relaxed">
                        {error}
                    </div>
                )}

                {/* FORMULAIRE */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/*
                      LE PIÈGE À BOT (HONEYPOT)
                      Rendu invisible pour l'humain par des styles absolus et de débordement.
                    */}
                    <div className="absolute opacity-0 -z-50 h-0 w-0 overflow-hidden pointer-events-none">
                        <label htmlFor="imp_field">Ne pas remplir ce champ si vous êtes humain</label>
                        <input
                            id="imp_field"
                            type="text"
                            name="imp"
                            tabIndex={-1}
                            autoComplete="off"
                            value={form.imp}
                            onChange={(e) => setForm({ ...form, imp: e.target.value })}
                        />
                    </div>

                    {/* NOM COMPLET */}
                    <div>
                        <label className="block text-[12px] font-black uppercase text-slate-700 tracking-wider mb-2">
                            Nom complet
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <User className="w-4 h-4" />
                          </span>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Votre nom complet"
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition"
                            />
                        </div>
                    </div>

                    {/* ADRESSE E-MAIL */}
                    <div>
                        <label className="block text-[12px]  font-black uppercase text-slate-700 tracking-wider mb-2">
                            Adresse e-mail
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Mail className="w-4 h-4" />
                          </span>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="vous@exemple.com"
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition"
                            />
                        </div>
                    </div>

                    {/* NUMÉRO DE TÉLÉPHONE */}
                    <div>
                        <label className="block text-[12px] font-black uppercase text-slate-700 tracking-wider mb-2">
                            Numéro de téléphone
                        </label>
                        <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-primary transition bg-white">
                            <select
                                value={phonePrefix}
                                onChange={(e) => setPhonePrefix(e.target.value)}
                                className="bg-slate-50/50 border-r border-slate-200 px-3 py-3 text-xs md:text-sm font-bold text-slate-600 focus:outline-none"
                            >
                                <option value="+221">+221 (SN)</option>
                                <option value="+225">+225 (CI)</option>
                                <option value="+228">+228 (TG)</option>
                                <option value="+229">+229 (BJ)</option>
                                <option value="+237">+237 (CM)</option>
                                <option value="+241">+241 (GA)</option>
                                <option value="+243">+243 (CD)</option>
                            </select>
                            <input
                                type="tel"
                                required
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="0707070707"
                                className="w-full px-4 py-3 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* MOT DE PASSE */}
                    <div>
                        <label className="block text-[12px] font-black uppercase text-slate-700 tracking-wider mb-2">
                            Mot de passe
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-4 h-4" />
                          </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="Au moins 8 caractères"
                                className="w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex cursor-pointer items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* ACCEPTATION CGU & PRIVACY */}
                    <div className="flex items-start cursor-pointer  gap-2.5 pt-2">
                        <input
                            id="terms_checkbox"
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                        />
                        <label htmlFor="terms_checkbox" className="text-[12px] md:text-xs font-semibold text-slate-600 leading-normal">
                            J&#39;accepte les{" "}
                            <a href="http://localhost:3000/terms" target="_blank" className="text-primary hover:underline font-bold">
                                conditions d&#39;utilisation
                            </a>{" "}
                            et la{" "}
                            <a href="http://localhost:3000/privacy" target="_blank" className="text-primary hover:underline font-bold">
                                politique de confidentialité
                            </a>.
                        </label>
                    </div>

                    {/* BOUTON D'INSCRIPTION */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-2 rounded-xl bg-third cursor-pointer hover:bg-primary text-white font-extrabold text-xs md:text-sm hover:opacity-95 transition flex items-center justify-center shadow-sm disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            "Créer ma boutique"
                        )}
                    </button>

                    {/* LIEN DE CONNEXION */}
                    <div className="text-center pt-4 text-sm font-semibold text-slate-500">
                        Déjà client ?{" "}
                        <Link href="/login" className="text-primary hover:underline font-bold">
                            Se connecter
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
}