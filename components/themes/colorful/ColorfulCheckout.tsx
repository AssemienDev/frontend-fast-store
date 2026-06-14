// components/themes/colorful/ColorfulCheckout.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { apiFetch } from "@/lib/api";
import { MapPin, CreditCard, Lock, ShieldCheck, Smartphone, Check } from "lucide-react";

interface ShopConfig {
    slug: string;
    currency: string;
    default_payment_method: string;
    down_payment_percentage: number;
}

interface ColorfulCheckoutProps {
    shop: ShopConfig;
    shop_slug: string;
}

export default function ColorfulCheckout({ shop, shop_slug }: ColorfulCheckoutProps) {
    const router = useRouter();
    const { cartItems, getTotalAmount, clearCart } = useCartStore();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [whatsapp, setWhatsapp] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatPrice = (price: number) => {
        if (shop.currency === "XOF" || shop.currency === "XAF") return `${price.toLocaleString()} FCFA`;
        if (shop.currency === "USD") return `$${price.toLocaleString()}`;
        return `${price.toLocaleString()} ${shop.currency}`;
    };

    const totalAmount = getTotalAmount();

    // CALCULS DU PAIEMENT HYBRIDE DYNAMIQUE (ONLINE | CASH_ON_DELIVERY | PARTIAL_HYBRID)
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
                    full_name: `${firstName} ${lastName}`.trim(),
                    phone_number: whatsapp,
                    address: `${address}, ${city}`
                },
                items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })),
                delivery_notes: `Commande passée en ligne sur le thème Coloré.`
            };

            const res: any = await apiFetch(`/${shop_slug}/orders`, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            // Vider le panier
            clearCart();

            if (res.payment_url) {
                window.location.href = res.payment_url;
            } else {
                router.push(`/${shop_slug}/confirmation?tracking=${res.tracking_number}&status=success`);
            }
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de la validation.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-[#FAF9F6] min-h-screen py-10 md:py-16 text-left font-sans antialiased text-slate-800">
            <div className="max-w-5xl mx-auto px-6">

                {/* BANDEAU INDICATEUR D'ÉTAPES (CART -> CHECKOUT COLORÉ) */}
                <div className="flex justify-center items-center gap-10 mb-12 text-xs font-bold text-slate-400">
                    <div className="flex items-center gap-2 text-emerald-600">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</span>
                        <span>Panier</span>
                    </div>
                    <div className="h-1 bg-teal-500 w-16 rounded-full" />
                    <div className="flex items-center gap-2 text-rose-600">
                        <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">2</span>
                        <span>Paiement</span>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl mb-8">
                        {error}
                    </div>
                )}

                <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* COLONNE GAUCHE (lg:col-span-7) */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* CARTE 1 : CONFIGURATION DE LIVRAISON (IMAGE PAIEMENT COLORÉ) */}
                        <div className="p-6 bg-white border border-rose-100/40 rounded-[2rem] shadow-sm space-y-4">
                            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">Contact & Livraison</h3>

                            <div className="space-y-4 text-xs font-semibold">
                                {/* Prénom / Nom */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Prénom</label>
                                        <input
                                            type="text" required value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="Jean"
                                            className="w-full p-3 bg-white border border-rose-100 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none focus:border-rose-600 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Nom</label>
                                        <input
                                            type="text" required value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Dupont"
                                            className="w-full p-3 bg-white border border-rose-100 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none focus:border-rose-600 transition"
                                        />
                                    </div>
                                </div>

                                {/* Adresse */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Adresse de livraison</label>
                                    <input
                                        type="text" required value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="123 Rue de la République"
                                        className="w-full p-3 bg-white border border-rose-100 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none focus:border-rose-600 transition"
                                    />
                                </div>

                                {/* Ville / WhatsApp */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Ville</label>
                                        <input
                                            type="text" required value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="Paris"
                                            className="w-full p-3 bg-white border border-rose-100 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none focus:border-rose-600 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">whatsapp</label>
                                        <input
                                            type="tel" required value={whatsapp}
                                            onChange={(e) => setWhatsapp(e.target.value)}
                                            placeholder="75001"
                                            className="w-full p-3 bg-white border border-rose-100 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none focus:border-rose-600 transition"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CARTE 2 : MOYEN DE PAIEMENT DE LA BOUTIQUE (IMAGE PAIEMENT COLORÉ) */}
                        <div className="p-6 bg-white border border-rose-100/40 rounded-[2rem] shadow-sm space-y-4">
                            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">Moyen de Paiement</h3>

                            <div className="space-y-3 text-xs font-bold text-slate-600">
                                {isCOD ? (
                                    <div className="p-4 border-2 border-primary bg-primary-brand-light rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">💵</span>
                                            <h4 className="text-xs font-black text-slate-850">Paiement 100% à la livraison</h4>
                                        </div>
                                        <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center text-white text-[10px]">✓</div>
                                    </div>
                                ) : isHybrid ? (
                                    <div className="p-4 border-2 border-primary bg-primary-brand-light rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">⚖️</span>
                                            <h4 className="text-xs font-black text-slate-850">Acompte en ligne ({downPaymentPercent}%) + Reste</h4>
                                        </div>
                                        <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center text-white text-[10px]">✓</div>
                                    </div>
                                ) : (
                                    <div className="p-4 border-2 border-primary bg-primary-brand-light rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">💳</span>
                                            <h4 className="text-xs font-black text-slate-850">Paiement en ligne (Mobile Money / Carte)</h4>
                                        </div>
                                        <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center text-white text-[10px]">✓</div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* COLONNE DROITE : RÉCAPITULATIF ROSE COLORÉ (lg:col-span-5) */}
                    <div className="lg:col-span-5 bg-white border border-rose-100/40 rounded-[2rem] p-6 shadow-sm space-y-6">
                        <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">Récapitulatif</h3>

                        {/* Liste des articles rapides de la commande */}
                        <div className="space-y-4">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.image_url || "/placeholder-product.png"} alt={item.name} className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0" />
                                        <div className="text-left">
                                            <h4 className="text-xs font-black text-slate-800 leading-tight truncate max-w-[120px]">{item.name}</h4>
                                            <p className="text-[9px] text-slate-400 mt-1">Qté : {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-slate-850">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Code promo input de votre maquette */}
                        <div className="flex gap-2 border-t border-slate-100 pt-4">
                            <input
                                type="text" placeholder="Code promo"
                                className="w-2/3 p-2.5 bg-slate-50 border border-rose-100 rounded-xl text-xs focus:outline-none focus:border-rose-600"
                            />
                            <button type="button" className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition">Appliquer</button>
                        </div>

                        {/* Ventilation comptable d'acompte (%) */}
                        <div className="space-y-3.5 text-xs text-slate-500 font-semibold border-t border-slate-100 pt-4">
                            <div className="flex justify-between">
                                <span>Sous-total</span>
                                <span className="text-slate-800">{formatPrice(totalAmount)}</span>
                            </div>

                            {isHybrid && (
                                <>
                                    <div className="flex justify-between text-rose-600 font-bold border-b border-slate-50 pb-2">
                                        <span>Acompte en ligne exigé ({downPaymentPercent}%) :</span>
                                        <span>{formatPrice(downPaymentAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400 font-normal">
                                        <span>Reste à payer au livreur :</span>
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
                                    <span className="text-xl md:text-2xl font-black text-rose-600">
                        {isHybrid ? formatPrice(downPaymentAmount) : formatPrice(totalAmount)}
                      </span>
                        </div>

                        {/* Bouton d'achat ovale de la maquette */}
                        <button
                            type="submit"
                            disabled={submitting || cartItems.length === 0}
                            className="w-full py-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs md:text-sm hover:opacity-95 transition flex items-center justify-center gap-2 shadow-lg shadow-rose-900/10 cursor-pointer"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    {isCOD
                                        ? "Confirmer ma commande"
                                        : isHybrid
                                            ? `Payer l'acompte (${formatPrice(downPaymentAmount)})`
                                            : `Payer ${formatPrice(totalAmount)}`
                                    }
                                </>
                            )}
                        </button>

                        <p className="text-[10px] text-slate-400 text-center font-semibold flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-slate-300" /> Paiement 100% sécurisé
                        </p>
                    </div>

                </form>

            </div>
        </div>
    );
}