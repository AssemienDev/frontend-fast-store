// components/themes/modern/ModernCheckout.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { apiFetch } from "@/lib/api";
import { User, MapPin, Phone, CreditCard, Lock, Smartphone, ShieldCheck } from "lucide-react";

interface ShopConfig {
    slug: string;
    currency: string;
    default_payment_method: string;
    down_payment_percentage: number;
}

interface ModernCheckoutProps {
    shop: ShopConfig;
    shop_slug: string;
}

export default function ModernCheckout({ shop, shop_slug }: ModernCheckoutProps) {
    const router = useRouter();
    const { cartItems, getTotalAmount, clearCart } = useCartStore();

    const [form, setForm] = useState({ name: "", phone: "", address: "", city: "" });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatPrice = (price: number) => {
        if (shop.currency === "XOF" || shop.currency === "XAF") return `${price.toLocaleString()} FCFA`;
        if (shop.currency === "USD") return `$${price.toLocaleString()}`;
        return `${price.toLocaleString()} ${shop.currency}`;
    };

    const totalAmount = getTotalAmount();

    // CALCULS DU PAIEMENT HYBRIDE EN DIRECT DE LA MAQUETTE
    const isCOD = shop.default_payment_method === "CASH_ON_DELIVERY";
    const isHybrid = shop.default_payment_method === "PARTIAL_HYBRID";

    const downPaymentPercent = shop.down_payment_percentage || 0;
    const downPaymentAmount = isHybrid ? totalAmount * (downPaymentPercent / 100) : 0;
    const remainingCodAmount = isHybrid ? totalAmount - downPaymentAmount : isCOD ? totalAmount : 0;

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const payload = {
                new_customer: {
                    full_name: form.name,
                    phone_number: form.phone,
                    address: `${form.address}, ${form.city}`
                },
                items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })),
                delivery_notes: `Commande passée en ligne.`
            };

            const res: any = await apiFetch(`/${shop_slug}/orders`, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            // Vider le panier global local
            clearCart();

            if (res.payment_url) {
                // Si paiement requis (ONLINE ou PARTIAL_HYBRID) -> Envoyer vers la passerelle de paiement Mobile Money
                window.location.href = res.payment_url;
            } else {
                // Si paiement à la livraison (CASH_ON_DELIVERY) -> Envoyer directement sur la page success
                router.push(`/${shop_slug}/confirmation?tracking=${res.tracking_number}`);
            }
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de la validation.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen py-10 md:py-16 text-left">
            <div className="max-w-5xl mx-auto px-6">

                {/* BANDEAU INDICATEUR D'ÉTAPES (CART -> CHECKOUT) */}
                <div className="flex justify-center items-center gap-10 mb-12 text-xs font-bold text-slate-400">
                    <div className="flex items-center gap-2 text-emerald-600">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</span>
                        <span>Panier</span>
                    </div>
                    <div className="h-px bg-slate-200 w-16" />
                    <div className="flex items-center gap-2 text-primary-brand">
                        <span className="w-5 h-5 rounded-full bg-primary-brand text-white flex items-center justify-center text-[10px]">2</span>
                        <span>Paiement</span>
                    </div>
                </div>

                {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl mb-6">{error}</div>}

                {/* COLO BI-COLONNE : FORMULAIRES (GAUCHE) & RECAPITULATIF (DROITE) */}
                <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* COLONNE GAUCHE : LIVRAISON & MODES (lg:col-span-7) */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* CARTE : INFORMATIONS DE LIVRAISON (IMAGE PAIEMENT) */}
                        <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-4">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                <MapPin className="w-5 h-5 text-primary-brand" />
                                <h3 className="text-base font-black text-slate-900">Informations de livraison</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Nom complet *</label>
                                    <input
                                        type="text" required value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Ex: John Doe"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Adresse de livraison (Rue, Villa...) *</label>
                                    <input
                                        type="text" required value={form.address}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        placeholder="Ex: 123 Rue de la Riviera"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Ville / Pays *</label>
                                        <input
                                            type="text" required value={form.city}
                                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                                            placeholder="Ex: Abidjan"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Numéro WhatsApp *</label>
                                        <input
                                            type="tel" required value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            placeholder="Ex: +225..."
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CARTE : CHOIX DU MODE DE PAIEMENT CONFORME AUX RÈGLES */}
                        <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-4">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                <CreditCard className="w-5 h-5 text-primary-brand" />
                                <h3 className="text-base font-black text-slate-900">Mode de paiement de la boutique</h3>
                            </div>

                            {/* Affichage adaptatif de la méthode configurée par le marchand */}
                            <div className="space-y-3">
                                {isCOD ? (
                                    <div className="p-4 border-2 border-primary-brand bg-primary-brand-light rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">💵</span>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800">Paiement 100% à la livraison</h4>
                                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Réglez la totalité en espèces au livreur.</p>
                                            </div>
                                        </div>
                                        <input type="radio" checked readOnly className="radio radio-primary radio-sm" />
                                    </div>
                                ) : isHybrid ? (
                                    <div className="p-4 border-2 border-primary-brand bg-primary-brand-light rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">⚖️</span>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800">Acompte en ligne ({downPaymentPercent}%) + Reste à la livraison</h4>
                                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Payez l'acompte maintenant, le reste en main propre.</p>
                                            </div>
                                        </div>
                                        <input type="radio" checked readOnly className="radio radio-primary radio-sm" />
                                    </div>
                                ) : (
                                    <div className="p-4 border-2 border-primary-brand bg-primary-brand-light rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">💳</span>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800">Paiement 100% en ligne sécurisé</h4>
                                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Réglez la totalité via Mobile Money ou Carte.</p>
                                            </div>
                                        </div>
                                        <input type="radio" checked readOnly className="radio radio-primary radio-sm" />
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* COLONNE DROITE : RÉCAPITULATIF DE COMMANDE (lg:col-span-5) */}
                    <div className="lg:col-span-5 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-6">
                        <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">Récapitulatif de commande</h3>

                        {/* Liste des articles rapides */}
                        <div className="space-y-4">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.image_url || "/placeholder-product.png"} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0" />
                                        <div>
                                            <h4 className="text-xs font-black text-slate-800 leading-tight truncate max-w-[120px]">{item.name}</h4>
                                            <p className="text-[10px] text-slate-400 mt-1">Qté : {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-slate-850">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Ventilation comptable dynamique d'acompte (%) */}
                        <div className="space-y-3 text-xs text-slate-500 font-semibold border-t border-slate-100 pt-4">
                            <div className="flex justify-between">
                                <span>Sous-total</span>
                                <span className="text-slate-800">{formatPrice(totalAmount)}</span>
                            </div>

                            {isHybrid && (
                                <>
                                    <div className="flex justify-between text-primary-brand font-bold">
                                        <span>Acompte en ligne exigé ({downPaymentPercent}%) :</span>
                                        <span>{formatPrice(downPaymentAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400 font-normal">
                                        <span>Reste dû à la livraison :</span>
                                        <span>{formatPrice(remainingCodAmount)}</span>
                                    </div>
                                </>
                            )}

                            {isCOD && (
                                <div className="flex justify-between text-slate-400 font-normal">
                                    <span>Reste à payer à la livraison :</span>
                                    <span>{formatPrice(totalAmount)}</span>
                                </div>
                            )}
                        </div>

                        <hr className="border-slate-100" />

                        <div className="flex justify-between items-end">
              <span className="text-sm font-black text-slate-800">
                {isHybrid ? "Acompte à payer" : "Total"}
              </span>
                            <span className="text-xl md:text-2xl font-black text-primary-brand">
                {isHybrid ? formatPrice(downPaymentAmount) : formatPrice(totalAmount)}
              </span>
                        </div>

                        {/* Bouton de paiement avec étiquette dynamique selon le mode */}
                        <button
                            type="submit"
                            disabled={submitting || cartItems.length === 0}
                            className="w-full py-4 rounded-xl btn-primary-brand font-black text-xs md:text-sm hover:opacity-95 transition flex items-center justify-center gap-2 shadow-lg shadow-teal-950/15 disabled:opacity-40 cursor-pointer"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    {isCOD
                                        ? "Confirmer ma commande à la livraison"
                                        : isHybrid
                                            ? `Payer l'acompte (${formatPrice(downPaymentAmount)})`
                                            : "Payer maintenant"
                                    }
                                </>
                            )}
                        </button>

                        <p className="text-[10px] text-slate-400 text-center font-semibold flex items-center justify-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-slate-300" /> Paiement sécurisé SSL crypté
                        </p>
                    </div>

                </form>

            </div>
        </div>
    );
}