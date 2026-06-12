// app/merchant/verify-email/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMerchantAuthStore } from "@/store/merchantAuthStore";
import { apiFetch } from "@/lib/api";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const { merchant, setCredentials, updateMerchant, isAuthenticated } = useMerchantAuthStore();
    const targetEmail = email || merchant?.email || "";

    // État pour les 4 chiffres de l'OTP
    const [otp, setOtp] = useState<string[]>(["", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Références d'inputs pour gérer la mise au point automatique (auto-focus)
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Si aucun e-mail n'est disponible (ni en URL ni dans le store), on renvoie à l'inscription
        if (isAuthenticated && merchant?.is_verified) {
            router.push("/");
            return;
        }

        // 2. Si aucun email n'est détecté
        if (!targetEmail && !isAuthenticated) {
            router.push("/register");
        }
    }, [targetEmail, isAuthenticated, merchant, router]);

    // Gère la saisie d'un chiffre
    const handleChange = (value: string, index: number) => {
        if (isNaN(Number(value))) return; // N'autorise que les chiffres

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1); // Ne garde que le dernier caractère saisi
        setOtp(newOtp);

        // Focus automatique sur le champ suivant s'il y a une saisie
        if (value && index < 4) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    // Gère la suppression (Backspace)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            const newOtp = [...otp];
            newOtp[index] = "";
            setOtp(newOtp);

            // Focus automatique sur le champ précédent lors du retour arrière
            if (index > 0) {
                inputsRef.current[index - 1]?.focus();
            }
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setLoading(true);

        const fullCode = otp.join("");
        if (fullCode.length < 5) {
            setError("Veuillez saisir l'intégralité du code à 5 chiffres.");
            setLoading(false);
            return;
        }

        try {
            const updatedUser = await apiFetch<any>("/auth/verify-email", {
                method: "POST",
                body: JSON.stringify({
                    email: targetEmail,
                    code: fullCode,
                }),
            });

            setCredentials(updatedUser.user, updatedUser.access_token);

            // Mettre à jour l'état local du marchand connecté pour lever la restriction
            if (isAuthenticated) {
                updateMerchant({ is_verified: true });
            }

            setSuccessMsg("Votre compte a été vérifié avec succès !");
            setTimeout(() => {
                router.push("/onboarding"); // Redirection vers le tableau de bord marchand
            }, 1500);
        } catch (err: any) {
            if (err.message && err.message.includes("déjà vérifié")) {
                if (isAuthenticated) {
                    updateMerchant({ is_verified: true });
                }
                setSuccessMsg("Compte déjà actif. Redirection vers l'onboarding...");
                setTimeout(() => {
                    router.push("/onboarding");
                }, 1500);
            } else {
                setError(err.message || "Le code saisi est incorrect ou a expiré.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError(null);
        setSuccessMsg(null);
        setResendLoading(true);

        try {
            const res = await apiFetch<{ message: string }>("/auth/resend-otp", {
                method: "POST",
                body: JSON.stringify({ email: targetEmail }),
            });
            setSuccessMsg(res.message);
        } catch (err: any) {
            setError(err.message || "Impossible de renvoyer le code pour le moment.");
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen flex items-center justify-center px-6">
            <div className="max-w-md w-full bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm text-center">

                {/* ENVELOPPE DE HAUT DE PAGE */}
                <div className="w-16 h-16 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-6 h-6" />
                </div>

                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Vérification Email
                </h1>
                <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed max-w-sm mx-auto">
                    Nous avons envoyé un code de vérification à l&#39;adresse valable que 15 min <br />
                    <span className="font-bold text-slate-700">{targetEmail}</span>.
                </p>

                {/* NOTIFICATIONS ET ALERTES */}
                {error && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl mt-6">
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl mt-6">
                        {successMsg}
                    </div>
                )}

                {/* BLOC DES 4 BOÎTES DE SAISIE OTP (IMAGE MAQUETTE) */}
                <form onSubmit={handleVerify} className="mt-8 space-y-6">
                    <div className="flex justify-center gap-3">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                required
                                maxLength={1}
                                value={digit}
                                ref={(el) => { inputsRef.current[index] = el; }}
                                onChange={(e) => handleChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="w-12 h-16 text-center text-xl font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-third hover:bg-primary text-white font-extrabold text-xs cursor-pointer md:text-sm hover:opacity-95 transition flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            "Vérifier"
                        )}
                    </button>

                    {/* LIEN DE RENVOI DE CODE */}
                    <div className="text-xs md:text-sm cursor-pointer font-semibold text-slate-500 pt-2">
                        Vous n&#39;avez pas reçu le code ?{" "}
                        <button
                            type="button"
                            disabled={resendLoading}
                            onClick={handleResendOtp}
                            className="text-primary hover:underline font-bold disabled:opacity-50 cursor-pointer"
                        >
                            {resendLoading ? "Envoi..." : "Renvoyer le code"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}