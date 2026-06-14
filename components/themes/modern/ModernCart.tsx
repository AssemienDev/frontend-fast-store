// components/themes/modern/ModernCart.tsx
import { useCartStore, CartItem } from "@/store/cartStore";
import { Plus, Minus, Trash2, Lock, CreditCard, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ShopConfig {
    slug: string;
    currency: string;
}

interface ModernCartProps {
    shop: ShopConfig;
    shop_slug: string;
}

export default function ModernCart({ shop, shop_slug }: ModernCartProps) {
    const router = useRouter();

    // Zustand : Accès global à l'état et aux actions du panier
    const { cartItems, removeItem, updateQuantity, getTotalItems, getTotalAmount } = useCartStore();

    const formatPrice = (price: number) => {
        if (shop.currency === "XOF" || shop.currency === "XAF") return `${price.toLocaleString()} FCFA`;
        if (shop.currency === "USD") return `$${price.toLocaleString()}`;
        return `${price.toLocaleString()} ${shop.currency}`;
    };

    const totalAmount = getTotalAmount();
    const totalItems = getTotalItems();

    return (
        <div className="bg-white min-h-screen py-10 md:py-16 text-left">
            <div className="max-w-5xl mx-auto px-6 space-y-8">

                {/* EN-TÊTE DU PANIER */}
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Votre Panier</h1>
                    <p className="text-xs text-slate-400 font-semibold mt-2 leading-relaxed">
                        Vérifiez vos articles avant de passer au paiement. <br />
                        <span className="text-[#F59E0B] font-bold">* Les frais de livraison ne sont pas pris en compte par la plateforme.</span>
                    </p>
                </div>

                {/* ZONE BI-COLONNE : GAUCHE (ARTICLES) / DROITE (RÉSUMÉ ET INTEGRATIONS) */}
                {cartItems.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* COLONNE GAUCHE : LES ARTICLES DU PANIER (lg:col-span-8) */}
                        <div className="lg:col-span-8 space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={`${item.id}-${item.selected_taille || ""}-${item.selected_couleur || ""}`}
                                    className="p-5 bg-white border border-slate-200/60 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition duration-150"
                                >
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden relative shrink-0 border border-slate-100 bg-slate-50">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={item.image_url || "/placeholder-product.png"}
                                                alt={item.name}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-xs md:text-sm font-black text-slate-800 leading-snug">{item.name}</h3>
                                            <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase">
                                                {item.selected_taille || item.selected_couleur
                                                    ? `${item.selected_taille ? "Taille: " + item.selected_taille : ""} ${item.selected_couleur ? "• Couleur: " + item.selected_couleur : ""}`
                                                    : "Taille Unique"
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* Prix unitaire, sélecteur de quantité et bouton de suppression */}
                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
                                        <span className="text-xs md:text-sm font-black text-slate-900">{formatPrice(item.price)}</span>

                                        <div className="flex items-center gap-4">
                                            {/* Sélecteur de quantité rond de votre maquette */}
                                            <div className="flex items-center gap-3 border border-slate-200 rounded-full bg-slate-50/50 p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.selected_taille, item.selected_couleur)}
                                                    className="w-6 h-6 rounded-full bg-white border border-slate-150 text-slate-500 hover:bg-slate-100 transition flex items-center justify-center font-bold"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-xs font-bold text-slate-800">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.selected_taille, item.selected_couleur)}
                                                    className="w-6 h-6 rounded-full bg-white border border-slate-150 text-slate-500 hover:bg-slate-100 transition flex items-center justify-center font-bold"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {/* Bouton de retrait */}
                                            <button
                                                onClick={() => removeItem(item.id, item.selected_taille, item.selected_couleur)}
                                                className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                                            >
                                                <Trash2 className="w-4.5 h-4.5 text-rose-500" /> Retirer
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>

                        {/* COLONNE DROITE : RÉCAPITULATIF DE COMMANDE (lg:col-span-4) */}
                        <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-6">
                            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">Récapitulatif de commande</h3>

                            <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                                <span>Sous-total ({totalItems} articles)</span>
                                <span className="text-slate-800 font-bold">{formatPrice(totalAmount)}</span>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Total final strictement égal au sous-total (livraison hors plateforme) */}
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-black text-slate-800">Total</span>
                                <span className="text-xl md:text-2xl font-black text-primary-brand">{formatPrice(totalAmount)}</span>
                            </div>

                            <Link
                                href={`/${shop_slug}/checkout`}
                                className="w-full py-4 rounded-xl btn-primary-brand font-black text-xs md:text-sm hover:opacity-95 transition flex items-center justify-center gap-2 shadow-lg shadow-teal-950/15 cursor-pointer"
                            >
                                <Lock className="w-4 h-4" /> Passer au paiement
                            </Link>

                            {/* Icônes de cartes simulées de la maquette */}
                            <div className="flex justify-center gap-3 text-slate-300">
                                <CreditCard className="w-5 h-5" />
                                <CreditCard className="w-5 h-5" />
                                <CreditCard className="w-5 h-5" />
                            </div>
                        </div>

                    </div>
                ) : (
                    /* PANIER VIDE SÉCURISÉ */
                    <div className="text-center py-20 p-8 border border-dashed border-slate-200 rounded-3xl bg-white max-w-md mx-auto">
                        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-base font-black text-slate-800">Votre panier est vide</h3>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                            Explorez notre catalogue et ajoutez vos articles coups de cœur pour lancer votre commande.
                        </p>
                        <Link
                            href={`/${shop_slug}/catalog`}
                            className="mt-6 inline-block px-6 py-3 rounded-xl btn-primary-brand font-extrabold text-xs"
                        >
                            Découvrir les produits
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}