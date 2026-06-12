// app/merchant/finance/withdraw/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMerchantAuthStore } from "@/store/merchantAuthStore";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Coins, Landmark, CheckCircle, Smartphone } from "lucide-react";

export default function WithdrawalRequestPage() {
    const router = useRouter();
    const { merchant, shop } = useMerchantAuthStore();

    const [availableBalance, setAvailableBalance] = useState(0);
    const [amountInput, setAmountInput] = useState("");
    const [payoutMethod, setPayoutMethod] = useState("WAVE"); // WAVE | ORANGE_MONEY | MTN_MONEY
    const [payoutNumber, setPayoutNumber] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        // Charger le solde décaissable actuel
        apiFetch<any>("/merchant/finance/summary")
            .then((data) => {
                setAvailableBalance(data.available_balance);
            })
            .catch(() => {});
    }, []);

    const requestedAmount = parseFloat(amountInput) || 0;

    // CALCULS COMPTABLES EN DIRECT DE LA MAQUETTE
    const withdrawalFeeRate = 3; // Frais de transfert fixes à 3%
    const withdrawalFee = requestedAmount * (withdrawalFeeRate / 100);

    // Frais de service : 1% pour les Premium, 2% pour les Starter gratuits
    const isPremium = merchant?.role === "MERCHANT"; // Basé sur le fait qu'il a franchi l'onboarding complet
    const serviceFeeRate = isPremium ? 1 : 2;
    const serviceFee = requestedAmount * (serviceFeeRate / 100);

    const netToReceive = requestedAmount - withdrawalFee - serviceFee;

    const handleToutRetirer = () => {
        setAmountInput(String(availableBalance));
    };

    const handleWithdrawSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (requestedAmount < 1000) {
            setError("Le montant minimal de retrait autorisé est de 1 000 FCFA.");
            return;
        }

        if (requestedAmount > availableBalance) {
            setError("Le montant demandé dépasse votre solde disponible.");
            return;
        }

        setSubmitting(true);

        try {
            await apiFetch("/merchant/finance/withdraw", {
                method: "POST",
                body: JSON.stringify({
                    amount: requestedAmount,
                    payout_method: payoutMethod,
                    payout_number: payoutNumber,
                }),
            });

            setSuccess("Votre demande de retrait a été enregistrée de manière sécurisée ! Elle sera traitée sous 2h.");
            setAmountInput("");
            setPayoutNumber("");

            setTimeout(() => {
                router.push("/finances");
            }, 2500);
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'envoi de votre demande de virement.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen py-4 md:py-8">
            <div className="max-w-4xl mx-auto px-6">

                {/* HEADER */}
                <div className="flex items-center gap-4 mb-10 pb-4 border-b border-slate-200/50">
                    <button onClick={() => router.push("/finances")} className="btn btn-ghost btn-circle text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900">Demande de Retrait</h1>
                        <p className="text-xs text-slate-400 font-semibold mt-1">Saisissez vos options de virement vers votre Mobile Money.</p>
                    </div>
                </div>

                {/* ALERTE DE RETOUR D'ÉTAT */}
                {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl mb-6">{error}</div>}
                {success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl mb-6 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> {success}
                    </div>
                )}

                {/* CARTE : SOLDE DISPONIBLE ACTUEL */}
                <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm text-left mb-6 space-y-1">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Solde Disponible</span>
                    <p className="text-3xl font-black text-[#0F766E]">{availableBalance.toLocaleString()} FCFA</p>
                    <span className="text-[10px] font-bold text-tertiary block mt-1">✓ Prêt à être retiré</span>
                </div>

                {/* FORMULAIRE DE RETRAIT (IMAGE 2) */}
                <form onSubmit={handleWithdrawSubmit} className="p-6 md:p-8 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-5 text-left">

                    <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">Nouveau Retrait</h2>

                    {/* Saisie montant avec bouton "Tout retirer" */}
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Montant à retirer (FCFA)</label>
                        <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-primary transition bg-white items-center">
                            <input
                                type="number" required value={amountInput}
                                onChange={(e) => setAmountInput(e.target.value)}
                                placeholder="Ex: 50000"
                                className="w-full px-4 py-3 text-xs md:text-sm text-slate-800 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleToutRetirer}
                                className="bg-slate-50 border-l border-slate-200 px-4 py-3 text-[10px] font-black text-primary hover:bg-slate-100 transition whitespace-nowrap cursor-pointer"
                            >
                                TOUT RETIRER
                            </button>
                        </div>
                    </div>

                    {/* Choix du mode de réception */}
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Mode de réception</label>
                        <div className="p-4 border-2 border-primary bg-primary/5 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-800">Mobile Money</h4>
                                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">MTN / Orange / Moov / Wave</p>
                                </div>
                            </div>
                            <input type="radio" checked readOnly className="radio radio-primary radio-sm" />
                        </div>
                    </div>

                    {/* Saisie de l'opérateur et du numéro */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Opérateur</label>
                            <select
                                value={payoutMethod}
                                onChange={(e) => setPayoutMethod(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                            >
                                <option value="WAVE">Wave</option>
                                <option value="ORANGE_MONEY">Orange Money</option>
                                <option value="MTN_MONEY">MTN Mobile Money</option>
                                <option value="MOOV_MONEY">Moov Flooz</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Numéro destinataire</label>
                            <input
                                type="tel" required value={payoutNumber}
                                onChange={(e) => setPayoutNumber(e.target.value)}
                                placeholder="Ex: +2250102030405"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* VENTILATION DES FRAIS (COMPTABILITÉ TRANSPARENTE EN DIRECT DE LA MAQUETTE) */}
                    {requestedAmount > 0 && (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 text-xs font-semibold text-slate-500 space-y-2">
                            <div className="flex justify-between">
                                <span>Frais de transfert ({withdrawalFeeRate}%) :</span>
                                <span className="text-slate-800">-{withdrawalFee.toLocaleString()} F</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span>Frais de service plateforme ({serviceFeeRate}%) :</span>
                                <span className="text-slate-800">-{serviceFee.toLocaleString()} F</span>
                            </div>
                            <div className="flex justify-between items-end pt-2 text-slate-800 font-black">
                                <span>Net à recevoir sur votre Mobile Money :</span>
                                <span className="text-sm text-tertiary">{Math.max(0, netToReceive).toLocaleString()} FCFA</span>
                            </div>
                        </div>
                    )}

                    {/* BOUTON CONFIRMER LE RETRAIT */}
                    <button
                        type="submit"
                        disabled={submitting || requestedAmount <= 0}
                        className="w-full py-4 rounded-xl bg-primary text-white font-extrabold text-xs md:text-sm hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-primary/10 disabled:opacity-40"
                    >
                        {submitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>Confirmer le retrait →</>
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
}