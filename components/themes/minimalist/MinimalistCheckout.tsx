// components/themes/minimalist/MinimalistCheckout.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { apiFetch } from "@/lib/api";
import { Lock, ShieldCheck } from "lucide-react";

interface ShopConfig {
    slug: string;
    currency: string;
    default_payment_method: string;
    down_payment_percentage: number;
}

interface MinimalistCheckoutProps {
    shop: ShopConfig;
    shop_slug: string;
}

export default function MinimalistCheckout({ shop, shop_slug }: MinimalistCheckoutProps) {
    const router = useRouter();
    const { cartItems, getTotalAmount, clearCart } = useCartStore();

    // Saisie séparée Prénom / Nom de votre maquette
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [country, setCountry] = useState("Sénégal");

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
                    address: `${address}, ${city}, ${country}`
                },
                items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })),
                delivery_notes: `Commande passée en ligne sur le thème Minimaliste.`
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
        <div className="bg-white min-h-screen py-10 md:py-16 text-left text-slate-900 font-serif">
            <div className="max-w-5xl mx-auto px-6">

                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-none mb-8">
                        {error}
                    </div>
                )}

                {/* GRILLE GÉNERALE SANS ACCENTS ARONDIS */}
                <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* COLONNE GAUCHE : LIVRAISON & MODES (lg:col-span-7) */}
                    <div className="lg:col-span-7 space-y-10">

                        {/* SECTION 1 : LIVRAISON (CONFORME IMAGE) */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-black text-white font-sans font-bold flex items-center justify-center text-[10px]">
                  1
                </span>
                                <h3 className="text-sm font-black uppercase tracking-widest font-sans">Livration</h3>
                            </div>

                            <div className="space-y-4 font-sans text-xs">
                                {/* Ligne Prénom / Nom */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text" required value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Prénom"
                                        className="w-full p-3 bg-white border border-slate-300 rounded-none text-slate-800 placeholder-slate-400 focus:outline-none focus:border-black transition"
                                    />
                                    <input
                                        type="text" required value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Nom"
                                        className="w-full p-3 bg-white border border-slate-300 rounded-none text-slate-800 placeholder-slate-400 focus:outline-none focus:border-black transition"
                                    />
                                </div>

                                {/* Ligne Adresse / Ville */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text" required value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Adresse"
                                        className="w-full p-3 bg-white border border-slate-300 rounded-none text-slate-800 placeholder-slate-400 focus:outline-none focus:border-black transition"
                                    />
                                    <input
                                        type="text" required value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="Ville"
                                        className="w-full p-3 bg-white border border-slate-300 rounded-none text-slate-800 placeholder-slate-400 focus:outline-none focus:border-black transition"
                                    />
                                </div>

                                {/* Ligne WhatsApp / Pays */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="tel" required value={whatsapp}
                                        onChange={(e) => setWhatsapp(e.target.value)}
                                        placeholder="Num whatsapp"
                                        className="w-full p-3 bg-white border border-slate-300 rounded-none text-slate-800 placeholder-slate-400 focus:outline-none focus:border-black transition"
                                    />
                                    <select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="w-full p-3 bg-white border border-slate-300 rounded-none text-slate-700 focus:outline-none focus:border-black cursor-pointer font-bold"
                                    >
                                        <option value="Sénégal">Sénégal</option>
                                        <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                                        <option value="Cameroun">Cameroun</option>
                                        <option value="Togo">Togo</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2 : PAIEMENT (CONFORME IMAGE) */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-full border border-black bg-white text-black font-sans font-bold flex items-center justify-center text-[10px]">
                  2
                </span>
                                <h3 className="text-sm font-black uppercase tracking-widest font-sans">Paiement</h3>
                            </div>

                            {/* Sélecteurs de méthodes de paiements de maquette (Sans bords arrondis) */}
                            <div className="space-y-3 font-sans text-xs">
                                {isCOD ? (
                                    <div className="p-4 border border-black bg-slate-50 rounded-none flex items-center justify-between">
                                        <span className="font-bold text-slate-800 uppercase tracking-wider">Paiement à la livraison</span>
                                        <input type="radio" checked readOnly className="radio radio-xs rounded-none border-black checked:bg-black" />
                                    </div>
                                ) : isHybrid ? (
                                    <div className="p-4 border border-black bg-slate-50 rounded-none flex items-center justify-between">
                                        <span className="font-bold text-slate-800 uppercase tracking-wider">Acompte ({downPaymentPercent}%) + Reste à la livraison</span>
                                        <input type="radio" checked readOnly className="radio radio-xs rounded-none border-black checked:bg-black" />
                                    </div>
                                ) : (
                                    <div className="p-4 border border-black bg-slate-50 rounded-none flex items-center justify-between">
                                        <span className="font-bold text-slate-800 uppercase tracking-wider">Paiement en ligne (Mobile Money / Carte)</span>
                                        <input type="radio" checked readOnly className="radio radio-xs rounded-none border-black checked:bg-black" />
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* COLONNE DROITE : LE RÉCAPITULATIF RECTANGULAIRE SANS BORDS (lg:col-span-5) */}
                    <div className="lg:col-span-5 bg-white border border-slate-200 rounded-none p-6 md:p-8 space-y-6 shadow-sm">
                        <h3 className="text-base font-black uppercase tracking-widest border-b border-slate-100 pb-3">Résumé</h3>

                        {/* Liste épurée des articles achetés */}
                        <div className="space-y-4">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-4">
                                        {/* Image carrée minimaliste */}
                                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 relative overflow-hidden shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={item.image_url || "/placeholder-product.png"} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-xs font-black text-slate-800 leading-tight truncate max-w-[120px]">{item.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-semibold font-sans mt-1">Qté : {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-900">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Ventilation comptable d'acompte (%) */}
                        <div className="space-y-3.5 text-xs text-slate-500 font-semibold border-t border-slate-100 pt-4">
                            <div className="flex justify-between">
                                <span className="font-sans">Sous-total</span>
                                <span className="text-slate-800">{formatPrice(totalAmount)}</span>
                            </div>

                            {isHybrid && (
                                <>
                                    <div className="flex justify-between text-slate-900 font-bold border-b border-slate-50 pb-2">
                                        <span className="font-sans">Acompte en ligne ({downPaymentPercent}%) :</span>
                                        <span>{formatPrice(downPaymentAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400 font-normal">
                                        <span className="font-sans">Reste à payer au livreur :</span>
                                        <span>{formatPrice(remainingCodAmount)}</span>
                                    </div>
                                </>
                            )}

                            {isCOD && (
                                <div className="flex justify-between text-slate-400 font-normal">
                                    <span className="font-sans">Reste à payer à la livraison :</span>
                                    <span>{formatPrice(totalAmount)}</span>
                                </div>
                            )}
                        </div>

                        <hr className="border-slate-100" />

                        <div className="flex justify-between items-end">
              <span className="text-sm font-black uppercase tracking-wider text-[10px] text-slate-400 font-sans">
                {isHybrid ? "Acompte à payer" : "Total"}
              </span>
                            <span className="text-xl md:text-2xl font-black text-slate-900">
                {isHybrid ? formatPrice(downPaymentAmount) : formatPrice(totalAmount)}
              </span>
                        </div>

                        {/* Bouton d'achat rectangulaire noir solide de maquette */}
                        <button
                            type="submit"
                            disabled={submitting || cartItems.length === 0}
                            className="w-full h-12 bg-black hover:bg-slate-900 text-white font-sans font-black text-[11px] uppercase tracking-widest transition flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
                        >
                            {submitting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Lock className="w-3.5 h-3.5 stroke-[1.5]" />
                                    {isCOD
                                        ? "Confirmer la commande"
                                        : isHybrid
                                            ? `Payer l'acompte (${formatPrice(downPaymentAmount)})`
                                            : `Payer ${formatPrice(totalAmount)}`
                                    }
                                </>
                            )}
                        </button>

                        <p className="text-[10px] text-slate-400 text-center font-semibold font-sans flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-slate-300" /> Paiement sécurisé
                        </p>
                    </div>

                </form>

            </div>
        </div>
    );
}