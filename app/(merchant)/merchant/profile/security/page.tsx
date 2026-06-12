// app/merchant/settings/security/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useMerchantAuthStore } from "@/store/merchantAuthStore";
import { apiFetch } from "@/lib/api";
import {ShieldAlert, ShieldCheck, Key, Lock, CheckCircle, Smartphone, ChevronRight, EyeOff, Eye} from "lucide-react";
import { useRouter } from "next/navigation";

interface TwoFactorSetupResponse {
    secret: string;
    qr_code_url: string;
}

export default function MerchantSecuritySettingsPage() {
    const router = useRouter();
    const { merchant, updateMerchant } = useMerchantAuthStore();
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Formulaire de changement de mot de passe
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // États pour la modale d'activation 2FA
    const [is2faModalOpen, setIs2faModalOpen] = useState(false);
    const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);
    const [otpCode, setOtpCode] = useState("");
    const [verifying2fa, setVerifying2fa] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !merchant) return null;

    // Action : Changement de mot de passe
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            await apiFetch("/auth/change-password", {
                method: "PATCH",
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                }),
            });

            setSuccess("Votre mot de passe a été modifié avec succès !");
            setCurrentPassword("");
            setNewPassword("");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de la mise à jour.");
        } finally {
            setLoading(false);
        }
    };

    /* // Action : Lancer l'assistant d'activation 2FA
    const handleStart2faSetup = async () => {
        setError(null);
        setSuccess(null);
        try {
            const res = await apiFetch<TwoFactorSetupResponse>("/auth/2fa/setup", { method: "POST" });
            setSetupData(res);
            setIs2faModalOpen(true);
        } catch (err: any) {
            alert("Impossible de lancer la configuration de la double authentification.");
        }
    };

    // Action : Soumettre le premier code de synchronisation 2FA
    const handleEnable2fa = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!setupData || otpCode.length !== 6) return;
        setVerifying2fa(true);
        setError(null);

        try {
            await apiFetch("/auth/2fa/enable", {
                method: "POST",
                body: JSON.stringify({
                    code: otpCode,
                    secret: setupData.secret
                })
            });

            // Mettre à jour l'état local pour refléter le succès immédiatement
            updateMerchant({ two_factor_enabled: true });

            setSuccess("La double authentification (2FA) a été activée sur votre compte !");
            setIs2faModalOpen(false);
            setSetupData(null);
            setOtpCode("");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || "Le code saisi est incorrect.");
        } finally {
            setVerifying2fa(false);
        }
    };

    const is2faActive = merchant.two_factor_enabled;*/

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-4xl w-full mx-auto relative">

            {/* EN-TÊTE */}
            <div className="pb-6 border-b border-slate-100">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Paramètres de sécurité</h1>
                <p className="text-xs font-semibold text-slate-400 mt-1">Gérez la protection de votre compte et vos sessions actives.</p>
            </div>

            {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">{error}</div>}
            {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" /> {success}
                </div>
            )}

            {/* BANDEAU SUPÉRIEUR DYNAMIQUE D'ÉTAT SÉCURITÉ DE LA MAQUETTE
            <div className={`p-6 rounded-3xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md transition-all duration-300 ${
                is2faActive
                    ? "bg-[#0F766E] shadow-teal-950/10"
                    : "bg-amber-600/90 shadow-amber-950/10"
            }`}>
                <div className="space-y-2 text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-150">Account Protection</span>
                    <h2 className="text-xl md:text-2xl font-black">
                        {is2faActive ? "Votre compte est hautement sécurisé" : "Votre compte est partiellement sécurisé"}
                    </h2>
                    <p className="text-xs text-white/80 leading-relaxed max-w-xl">
                        {is2faActive
                            ? "Merci d'avoir activé la double authentification. Vos données financières et votre catalogue sont protégés."
                            : "Activez la double authentification pour ajouter une couche de protection d'accès supplémentaire à votre espace marchand."
                        }
                    </p>
                </div>
                {!is2faActive && (
                    <button
                        onClick={handleStart2faSetup}
                        className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs whitespace-nowrap self-start md:self-auto cursor-pointer shadow"
                    >
                        Sécuriser maintenant
                    </button>
                )}
            </div>*/}

            {/* ZONE BI-COLONNE : MODIFICATION MOT DE PASSE (GAUCHE) & CONFIGURATION 2FA (DROITE) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                {/* CARTE GAUCHE : CHANGEMENT DE MOT DE PASSE (lg:col-span-6) */}
                <div className="lg:col-span-6 bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between text-left space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                            <Key className="w-5 h-5 text-primary" />
                            <h3 className="text-base font-black text-slate-800">Modifier le mot de passe</h3>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">

                            {/* MOT DE PASSE ACTUEL */}
                            <div className="relative">
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">
                                    Mot de passe actuel
                                </label>

                                <input
                                    type={showPassword1 ? "text" : "password"}
                                    required
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword1(!showPassword1)}
                                    className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* NOUVEAU MOT DE PASSE */}
                            <div className="relative">
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">
                                    Nouveau mot de passe
                                </label>

                                <input
                                    type={showPassword2 ? "text" : "password"}
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword2(!showPassword2)}
                                    className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* BOUTON SUBMIT */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl bg-primary text-white font-extrabold text-xs hover:opacity-95 transition flex items-center justify-center cursor-pointer shadow-sm shadow-primary/10 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    "Mettre à jour"
                                )}
                            </button>

                        </form>
                    </div>
                </div>

                {/* CARTE DROITE : CONFIGURATION DOUBLE AUTHENTIFICATION (lg:col-span-6)
                <div className="lg:col-span-6 bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between text-left space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-5 h-5 text-primary" />
                                <h3 className="text-base font-black text-slate-800">Double authentification (2FA)</h3>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                is2faActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
                            }`}>
                            {is2faActive ? "Activé" : "Désactivé"}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                            Utilisez une application d'authentification (comme Google Authenticator ou Authy) pour recevoir des codes de sécurité uniques à chaque connexion.
                        </p>

                        {/* Bouton d'activation / Détails de maquette
                        {!is2faActive && (
                            <button
                                onClick={handleStart2faSetup}
                                type="button"
                                className="w-full p-4 border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition cursor-pointer text-xs font-bold text-slate-700 shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">🔐</span>
                                    <span>Configurer l'application d'authentification</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>
                </div>  */}

            </div>

            {/* ========================================================= */}
            {/* ASSISTANT DE CONFIGURATION MODALE DE DOUBLE AUTH (2FA) */}
            {/* =========================================================
            {is2faModalOpen && setupData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">

                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-left">
                            <Smartphone className="w-5 h-5 text-primary" />
                            <h3 className="text-sm font-black text-slate-900">Configurer mon application 2FA</h3>
                        </div>

                        <form onSubmit={handleEnable2fa} className="space-y-4 text-left">
                            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                                1. Scannez le QR Code ci-dessous avec votre application d'authentification (Google Authenticator / Authy) :
                            </p>

                            {/* Rendu dynamique du QR Code via notre API backend sécurisée
                            <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-center w-40 h-40 mx-auto shadow-inner">
                                {/* eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={setupData.qr_code_url}
                                    alt="QR Code d'activation 2FA"
                                    className="w-full h-full object-contain rounded-lg p-1 bg-white border border-slate-100"
                                />
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                                    Ou saisissez manuellement la clé secrète dans votre application :
                                </p>
                                <p className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-center text-xs font-black text-primary tracking-widest select-all uppercase">
                                    {setupData.secret}
                                </p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">
                                    2. Saisissez le code à 6 chiffres affiché par votre application
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                                    placeholder="Ex: 123456"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm font-black text-primary tracking-widest focus:outline-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setIs2faModalOpen(false); setSetupData(null); }}
                                    className="w-1/2 py-3 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs text-center"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={verifying2fa || otpCode.length !== 6}
                                    className="w-1/2 py-3 rounded-xl bg-primary text-white font-extrabold text-xs flex items-center justify-center cursor-pointer"
                                >
                                    {verifying2fa ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        "Activer"
                                    )}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}*/}

        </div>
    );
}