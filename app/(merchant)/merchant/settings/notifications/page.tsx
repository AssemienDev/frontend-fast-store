// app/merchant/settings/notifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useMerchantAuthStore } from "@/store/merchantAuthStore";
import { ShoppingBag, CreditCard, CheckCircle, Lock, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MerchantNotificationsSettingsPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        order_in_app: true,
        order_email: true,
        order_whatsapp: false,
        finance_in_app: true,
        finance_email: true,
        finance_whatsapp: false
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isPremium, setIsPremium] = useState(false); // Gère la modale d'upgrade
    const [isPremiumOpen, setIsPremiumOpen] = useState(false); // Gère la modale d'upgrade
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        // Charger les préférences actuelles depuis l'API
        apiFetch<any>("/merchant/notifications")
            .then((data) => {
                setForm({
                    order_in_app: data.order_in_app,
                    order_email: data.order_email,
                    order_whatsapp: data.order_whatsapp,
                    finance_in_app: data.finance_in_app,
                    finance_email: data.finance_email,
                    finance_whatsapp: data.finance_whatsapp
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));

        apiFetch<any>("/merchant/subscription")
            .then((subData) => {
                setIsPremium(
                    subData.plan_name?.toUpperCase() !== "STARTER"
                );
            })
    }, []);

    const handleWhatsappToggle = (checked: boolean, field: "order_whatsapp" | "finance_whatsapp") => {
        setForm((prev) => ({ ...prev, [field]: checked }));
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await apiFetch("/merchant/notifications", {
                method: "PUT",
                body: JSON.stringify(form),
            });

            setSuccess("Vos préférences de notifications ont été enregistrées avec succès !");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            if (err.status === 402) {
                setIsPremiumOpen(true); // Ouvre la modale paywall
                // Décoche la case WhatsApp localement pour refléter l'échec d'accès
                setForm((prev) => ({ ...prev, order_whatsapp: false, finance_whatsapp: false }));
            } else {
                setError(err.message || "Impossible de sauvegarder vos préférences.");
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 animate-pulse">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-semibold">Chargement de vos préférences...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-2xl w-full mx-auto relative">

            {/* EN-TÊTE DE LA PAGE */}
            <div className="pb-6 border-b border-slate-100">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
                <p className="text-xs font-semibold text-slate-400 mt-1">Restez informé - Choisissez comment vous souhaitez recevoir vos alertes.</p>
            </div>

            {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">{error}</div>}
            {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" /> {success}
                </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">

                {/* CARD 1 : NOUVELLES COMMANDES (NEW ORDERS) */}
                <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-6 text-left">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <span className="p-2 rounded-xl bg-teal-50 text-primary shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </span>
                        <h3 className="text-sm font-black text-slate-800">Nouvelles Commandes</h3>
                    </div>

                    <div className="space-y-5">
                        {/* Toggle WhatsApp (Premium) */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-bold text-slate-700">Alertes WhatsApp</h4>
                            </div>
                            <input
                                type="checkbox"
                                checked={form.order_whatsapp}
                                onChange={(e) => handleWhatsappToggle(e.target.checked, "order_whatsapp")}
                                className="toggle toggle-primary toggle-sm cursor-pointer"
                            />
                        </div>

                        <hr className="border-slate-100" />

                        {/* Toggle E-mail */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-bold text-slate-700">E-mail</h4>
                            </div>
                            <input
                                type="checkbox"
                                checked={form.order_email}
                                onChange={(e) => setForm({ ...form, order_email: e.target.checked })}
                                className="toggle toggle-primary toggle-sm cursor-pointer"
                            />
                        </div>

                        <hr className="border-slate-100" />

                        {/* Toggle E-mail */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-bold text-slate-700">Dans l&#39;application</h4>
                            </div>
                            <input
                                type="checkbox"
                                checked={form.order_in_app}
                                onChange={(e) => setForm({ ...form, order_in_app: e.target.checked })}
                                className="toggle toggle-primary toggle-sm cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* CARD 2 : FACTURATION & RETRAITS (BILLING & PAYOUTS) */}
                <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-6 text-left">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <span className="p-2 rounded-xl bg-emerald-50 text-[#22C55E] shrink-0">
              <CreditCard className="w-5 h-5" />
            </span>
                        <h3 className="text-sm font-black text-slate-800">Facturation & Retraits</h3>
                    </div>

                    <div className="space-y-5">
                        {/* Toggle E-mail */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-bold text-slate-700">Dans l&#39;application</h4>
                            </div>
                            <input
                                type="checkbox"
                                checked={form.finance_whatsapp}
                                onChange={(e) => setForm({ ...form, finance_whatsapp: e.target.checked })}
                                className="toggle toggle-primary toggle-sm cursor-pointer"
                            />
                        </div>
                        <hr className="border-slate-100" />

                        {/* Toggle E-mail */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-bold text-slate-700">E-mail</h4>
                            </div>
                            <input
                                type="checkbox"
                                checked={form.finance_email}
                                onChange={(e) => setForm({ ...form, finance_email: e.target.checked })}
                                className="toggle toggle-primary toggle-sm cursor-pointer"
                            />
                        </div>
                        <hr className="border-slate-100" />

                        {/* Toggle E-mail */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-bold text-slate-700">Dans l&#39;application</h4>
                            </div>
                            <input
                                type="checkbox"
                                checked={form.finance_in_app}
                                onChange={(e) => setForm({ ...form, finance_in_app: e.target.checked })}
                                className="toggle toggle-primary toggle-sm cursor-pointer"
                            />
                        </div>
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

            {/* ========================================================= */}
            {/* MODALE : SÉCURITÉ PAYWALL PREMIUM SUR ALERTE WHATSAPP */}
            {/* ========================================================= */}
            {isPremiumOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-amber-50 text-[#F59E0B] flex items-center justify-center mx-auto border border-amber-100">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">Fonctionnalité Premium</h3>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                La réception instantanée d&#39;alertes de ventes et de commandes directement sur votre compte WhatsApp est réservée exclusivement aux membres **Business** et **Pro**.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setIsPremiumOpen(false)} className="w-1/2 py-3 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs">Fermer</button>
                            <button
                                type="button"
                                onClick={() => router.push("/billing")}
                                className="w-1/2 py-3 px-5 rounded-xl bg-[#F59E0B] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              Activer l&#39;offre Premium
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}