// app/merchant/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Mail, ArrowLeft } from "lucide-react";

export default function MerchantForgotPasswordPage() {
    const [form, setForm] = useState({ email: "", imp: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setLoading(true);

        try {
            const res = await apiFetch<{ message: string }>("/auth/password-recovery", {
                method: "POST",
                body: JSON.stringify({
                    email: form.email,
                    imp: form.imp,
                }),
            });

            setSuccessMsg(res.message);
            setForm({ email: "", imp: "" });
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de la demande de réinitialisation.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center px-6">
            <div className="max-w-md w-full bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm">

                {/* LOGO PLATEFORME */}
                <div className="text-center mb-6">
          <span className="text-2xl font-black text-primary tracking-tight">
            FastStore
          </span>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                        Mot de passe oublié
                    </h1>
                    <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed max-w-xs mx-auto">
                        Saisissez votre email pour recevoir un lien de réinitialisation
                    </p>
                </div>

                {/* NOTIFICATIONS ET ALERTES */}
                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl mb-6 leading-relaxed">
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl mb-6 leading-relaxed">
                        {successMsg}
                    </div>
                )}

                {/* FORMULAIRE */}
                <form onSubmit={handleSubmit} className="space-y-6">

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

                    {/* EMAIL */}
                    <div>
                        <label className="block text-[12px] font-black uppercase text-slate-700 tracking-wider mb-2">
                            Email
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
                                placeholder="nom@exemple.com"
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition"
                            />
                        </div>
                    </div>

                    {/* BOUTON D'ENVOI */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-third hover:bg-primary text-white font-extrabold text-xs md:text-sm hover:opacity-95 transition flex items-center justify-center shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            "Envoyer le lien"
                        )}
                    </button>

                    {/* RETOUR CONNEXION */}
                    <div className="text-center pt-2">
                        <Link
                            href="login"
                            className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1.5"
                        >
                            <ArrowLeft className="w-4 h-4" /> Retour à la connexion
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
}