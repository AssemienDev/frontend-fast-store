// src/app/merchant/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMerchantAuthStore } from "@/store/merchantAuthStore";
import { apiFetch } from "@/lib/api";
import { Mail, Lock, Eye, EyeOff, Store } from "lucide-react";

export default function MerchantLoginPage() {
    const router = useRouter();
    const { merchant, setCredentials, isAuthenticated } = useMerchantAuthStore();

    const [form, setForm] = useState({ email: "", password: "", imp: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirection proactive si l'utilisateur est déjà connecté et vérifié
    useEffect(() => {
        if (isAuthenticated && merchant?.is_verified) {
            router.push("/");
        }
    }, [isAuthenticated, merchant, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await apiFetch<any>("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    imp: form.imp, // <--- ENVOI DU CHAMP PIÉGÉ AU SERVEUR
                }),
            });

            // Enregistrer les identifiants dans notre store Zustand
            setCredentials(res.user, res.access_token);

            // CONTROLE DE SÉCURITÉ : Si le compte n'est pas encore vérifié (OTP)
            if (!res.user.is_verified) {
                router.push(`/verify-email?email=${encodeURIComponent(res.user.email)}`);
                return;
            }

            // Si vérifié, on ouvre le tableau de bord
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Impossible de vous connecter. Veuillez vérifier vos identifiants.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#F7F9FB] min-h-screen flex items-center justify-center py-12 px-6">
            <div className="max-w-xl w-full bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm">

                {/* BOUTIQUE ICONE EN-TÊTE */}
                <div className="w-16 h-16 rounded-full bg-[#0F766E] text-[#A3FAEF] flex items-center justify-center mx-auto mb-6">
                    <Store className="w-6 h-6" />
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Bienvenue
                    </h1>
                    <p className="text-sm text-slate-600 mt-2 font-medium">
                        Connectez-vous à FastStore pour gérer votre boutique.
                    </p>
                </div>

                {/* ALERTES ERREURS */}
                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 mb-6 leading-relaxed">
                        {error}
                    </div>
                )}

                {/* FORMULAIRE */}
                <form onSubmit={handleLogin} className="space-y-5">
                    
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
                                placeholder="vous@exemple.com"
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition"
                            />
                        </div>
                    </div>

                    {/* MOT DE PASSE */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-[12px] font-black uppercase text-slate-700 tracking-wider">
                                Mot de passe
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-xs font-bold text-primary hover:underline"
                            >
                                Mot de passe oublié ?
                            </Link>
                        </div>
                        <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="••••••••"
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

                    {/* SE SOUVENIR DE MOI */}
                    <div className="flex items-center gap-2.5 pt-1">
                        <input
                            id="remember_checkbox"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                        />
                        <label htmlFor="remember_checkbox" className="text-xs font-semibold text-slate-500 cursor-pointer select-none">
                            Se souvenir de moi
                        </label>
                    </div>

                    {/* BOUTON SE CONNECTER */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-2 rounded-xl bg-third hover:bg-primary text-white font-extrabold text-xs md:text-sm hover:opacity-95 transition flex items-center justify-center shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            "Se connecter →"
                        )}
                    </button>

                    {/* LIEN DE CRÉATION DE COMPTE */}
                    <div className="text-center pt-4 text-sm font-semibold text-slate-500">
                        Pas encore de compte ?{" "}
                        <Link href="/merchant/register" className="text-primary hover:underline font-bold">
                            S&#39;inscrire
                        </Link>
                    </div>

                    {/* CONDITIONS EN BAS */}
                    <div className="text-[11px] cursor-pointer text-slate-400 text-center leading-relaxed border-t border-slate-100 pt-6">
                        En vous connectant, vous acceptez nos{" "}
                        <a href="http://localhost:3000/terms" target="_blank" className="text-slate-500 font-bold hover:underline">
                            Conditions d&#39;utilisation
                        </a>{" "}
                        et notre{" "}
                        <a href="http://localhost:3000/privacy" target="_blank" className="text-slate-500 font-bold hover:underline">
                            Politique de confidentialité
                        </a>.
                    </div>

                </form>
            </div>
        </div>
    );
}