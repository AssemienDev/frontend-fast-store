// app/merchant/reset-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";

export default function MerchantResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";
    const email = searchParams.get("email") || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass1, setShowPass1] = useState(false);
    const [showPass2, setShowPass2] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // État de force du mot de passe (0 à 4)
    const [strengthScore, setStrengthScore] = useState(0);

    // Calcule la force du mot de passe à la volée
    useEffect(() => {
        let score = 0;
        if (!newPassword) {
            setStrengthScore(0);
            return;
        }

        if (newPassword.length >= 8) score += 1; // Longueur minimale
        if (/[A-Z]/.test(newPassword)) score += 1; // Contient une majuscule
        if (/[0-9]/.test(newPassword)) score += 1; // Contient un chiffre
        if (/[^A-Za-z0-9]/.test(newPassword)) score += 1; // Contient un caractère spécial

        setStrengthScore(score);
    }, [newPassword]);

    useEffect(() => {
        if (!token || !email) {
            setError("Le lien de réinitialisation est incomplet ou invalide.");
        }
    }, [token, email]);

    const getStrengthColor = (index: number) => {
        // Si la barre de progression indexée est en dessous du score calculé
        if (index < strengthScore) {
            if (strengthScore === 1) return "bg-rose-500"; // Très Faible
            if (strengthScore === 2) return "bg-amber-500"; // Faible
            if (strengthScore === 3) return "bg-yellow-500"; // Moyen
            return "bg-tertiary"; // Fort (Vert)
        }
        return "bg-slate-200"; // Inactif
    };

    const isFormValid =
        strengthScore >= 3 &&
        newPassword === confirmPassword &&
        token &&
        email;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!isFormValid) return;

        setLoading(true);

        try {
            await apiFetch("/auth/reset-password", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    token,
                    new_password: newPassword,
                }),
            });

            setSuccess("Votre mot de passe a bien été réinitialisé ! Redirection vers l'écran de connexion...");
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Le lien de réinitialisation a expiré ou est invalide.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center px-6">
            <div className="max-w-md w-full bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm">

                {/* LOGO */}
                <div className="text-center mb-6">
          <span className="text-2xl font-black text-primary tracking-tight">
            FastStore
          </span>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                        Nouveau mot de passe
                    </h1>
                    <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed max-w-xs mx-auto">
                        Créez un nouveau mot de passe fort pour sécuriser votre compte.
                    </p>
                </div>

                {/* ALERTES ERREURS ET SUCCÈS */}
                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl mb-6 leading-relaxed">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl mb-6 leading-relaxed flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* NOUVEAU MOT DE PASSE */}
                    <div>
                        <label className="block text-[12px] font-black uppercase text-slate-700 tracking-wider mb-2">
                            Nouveau mot de passe
                        </label>
                        <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
                            <input
                                type={showPass1 ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Entrez votre nouveau mot de passe"
                                className="w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass1(!showPass1)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex cursor-pointer items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showPass1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* BARRES DE COMPORTEMENT DE FORCE (IMAGE MAQUETTE) */}
                        <div className="mt-3 flex items-center gap-1.5">
                            {[0, 1, 2, 3].map((index) => (
                                <div
                                    key={index}
                                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${getStrengthColor(index)}`}
                                />
                            ))}
                        </div>
                        <p className="text-[10px] text-right font-semibold text-slate-400 mt-1.5 uppercase">
                            Force du mot de passe
                        </p>
                    </div>

                    {/* CONFIRMER LE MOT DE PASSE */}
                    <div>
                        <label className="block text-[12px] font-black uppercase text-slate-700 tracking-wider mb-2">
                            Confirmer le mot de passe
                        </label>
                        <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
                            <input
                                type={showPass2 ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Répétez le mot de passe"
                                className="w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass2(!showPass2)}
                                className="absolute cursor-pointer inset-y-0 right-0 pr-3.5 flex cursor-pointer items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showPass2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Message de confirmation de mot de passe */}
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-[10px] font-bold text-rose-500 mt-1.5">
                                Les deux mots de passe ne correspondent pas.
                            </p>
                        )}
                    </div>

                    {/* BOUTON METTRE À JOUR */}
                    <button
                        type="submit"
                        disabled={!isFormValid || loading}
                        className="w-full py-4 rounded-xl bg-third hover:bg-primary text-white font-extrabold text-xs md:text-sm hover:opacity-95 transition flex items-center justify-center shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            "Mettre à jour le mot de passe"
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
}