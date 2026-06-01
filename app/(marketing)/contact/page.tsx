// src/app/(marketing)/contact/page.tsx
"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { SendHorizontal, MessageCircle, Mail } from "lucide-react";

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", imp: ""  });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ success?: boolean; msg?: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            await apiFetch("/storefront/contact", {
                method: "POST",
                body: JSON.stringify(form),
            });
            setStatus({
                success: true,
                msg: "Votre message a bien été envoyé. Notre équipe commerciale vous recontactera très rapidement."
            });
            // Réinitialiser le formulaire
            setForm({ name: "", email: "", subject: "", message: "", imp: "" });
        } catch (err: any) {
            setStatus({
                success: false,
                msg: err.message || "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-neutral min-h-screen py-16 md:py-24">
            <div className="max-w-6xl mx-auto px-6">

                {/* EN-TÊTE DE LA PAGE */}
                <div className="text-left mb-12 md:mb-16">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Contactez-nous
                    </h1>
                    <p className="mt-4 text-sm md:text-base text-slate-500 max-w-3xl leading-relaxed">
                        Notre équipe est là pour vous aider. Envoyez-nous un message ou contactez-nous directement via WhatsApp pour une assistance rapide.
                    </p>
                </div>

                {/* CONTENU PRINCIPAL (DEUX SECTIONS : FORMULAIRE & DIRECT CONTACTS) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* CARTE GAUCHE : FORMULAIRE DE CONTACT (lg:col-span-7) */}
                    <div className="lg:col-span-7 bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm">
                        <h2 className="text-lg md:text-xl font-black text-slate-900 mb-6">
                            Envoyez un message
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* LIGNE NOM & EMAIL (RESPONSIVE) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Nom complet
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Votre nom"
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Adresse Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="vous@exemple.com"
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition"
                                    />
                                </div>
                            </div>
                            <input
                                id="imp_field"
                                type="text"
                                name="imp"
                                tabIndex={-1}
                                className="absolute opacity-0 -z-50 h-0 w-0 overflow-hidden pointer-events-none"
                                autoComplete="off"
                                value={form.imp}
                                onChange={(e) => setForm({ ...form, imp: e.target.value })}
                            />

                            {/* SUJET */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Sujet
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    placeholder="Entrer le sujet"
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition"
                                />
                            </div>

                            {/* MESSAGE */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Message
                                </label>
                                <textarea
                                    required
                                    rows={5}
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    placeholder="Comment pouvons-nous vous aider ?"
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition resize-none"
                                />
                            </div>

                            {/* ÉTAT DE RETOUR API */}
                            {status && (
                                <div className={`p-4 rounded-xl text-xs md:text-sm font-semibold border ${
                                    status.success
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-rose-50 text-rose-700 border-rose-200"
                                }`}>
                                    {status.msg}
                                </div>
                            )}

                            {/* BOUTON D'ENVOI */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-third text-white font-extrabold text-xs md:text-sm hover:opacity-95 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Envoyer le message <SendHorizontal className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* CARTE DROITE : DIRECT CONTACTS (lg:col-span-5) */}
                    <div className="lg:col-span-5 bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
                        <h2 className="text-lg md:text-xl font-black text-slate-900">
                            Contact Direct
                        </h2>

                        <div className="space-y-6">

                            {/* CONTACT 1 : WHATSAPP */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 text-sm md:text-base">Support WhatsApp</h4>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                        Réponse rapide garantie pour les marchands.
                                    </p>
                                    <a
                                        href="https://wa.me/2250100000000" // Ajustez avec votre numéro de support
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 text-xs font-bold text-tertiary hover:underline inline-flex items-center gap-1"
                                    >
                                        Discuter maintenant →
                                    </a>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* CONTACT 2 : EMAIL */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 text-sm md:text-base">Email Support</h4>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                        support@faststore.com
                                    </p>
                                    <a
                                        href="mailto:support@faststore.com"
                                        className="mt-3 text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                                    >
                                        Nous écrire →
                                    </a>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}