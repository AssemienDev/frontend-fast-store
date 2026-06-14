// components/themes/colorful/ColorfulCart.tsx
import { useCartStore, CartItem } from "@/store/cartStore";
import { Plus, Minus, X, Lock, ShoppingBag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ShopConfig {
    slug: string;
    currency: string;
}

interface ColorfulCartProps {
    shop: ShopConfig;
    shop_slug: string;
}

export default function ColorfulCart({ shop, shop_slug }: ColorfulCartProps) {
    const router = useRouter();

    // Zustand : Accès global au store de panier LinkBoutik
    const { cartItems, removeItem, updateQuantity, getTotalItems, getTotalAmount } = useCartStore();

    const formatPrice = (price: number) => {
        if (shop.currency === "XOF" || shop.currency === "XAF") return `${price.toLocaleString()} FCFA`;
        if (shop.currency === "USD") return `$${price.toLocaleString()}`;
        return `${price.toLocaleString()} ${shop.currency}`;
    };

    const totalAmount = getTotalAmount();
    const totalItems = getTotalItems();

    return (
        <div className="bg-[#FAF9F6] min-h-screen py-10 md:py-16 text-left font-sans antialiased text-slate-800">
            <div className="max-w-5xl mx-auto px-6 space-y-8">

                {/* EN-TÊTE DU PANIER COLORÉ */}
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Votre Panier</h1>
                    <p className="text-xs text-slate-400 font-semibold mt-2 leading-relaxed">
                        Vérifiez vos articles avant de passer votre commande. <br />
                        <span className="text-rose-600 font-bold">* Les frais de livraison ne sont pas pris en compte par la plateforme.</span>
                    </p>
                </div>

                {/* ZONE BI-COLONNE : GAUCHE (ARTICLES EXTRA-ARRONDIS) / DROITE (RÉSUMÉ ROSE) */}
                {cartItems.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* COLONNE GAUCHE (lg:col-span-8) */}
                        <div className="lg:col-span-8 space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={`${item.id}-${item.selected_taille || ""}-${item.selected_couleur || ""}`}
                                    className="p-5 bg-white border border-rose-100/35 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition relative"
                                >
                                    {/* Croix de suppression fine en haut à droite */}
                                    <button
                                        onClick={() => removeItem(item.id, item.selected_taille, item.selected_couleur)}
                                        className="absolute top-5 right-5 text-slate-300 hover:text-rose-600 transition cursor-pointer"
                                        title="Retirer"
                                    >
                                        <X className="w-4 h-4 stroke-[2.5]" />
                                    </button>

                                    <div className="flex items-center gap-4 text-left">
                                        {/* Miniature produit dans une boîte arrondie d'illustration */}
                                        <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl relative overflow-hidden shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={item.image_url || "/placeholder-product.png"}
                                                alt={item.name}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-xs md:text-sm font-black text-slate-800 leading-snug">{item.name}</h3>
                                            <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">
                                                {item.selected_taille || item.selected_couleur
                                                    ? `${item.selected_taille ? "Size: " + item.selected_taille : ""} ${item.selected_couleur ? "• Color: " + item.selected_couleur : ""}`
                                                    : "Taille Unique"
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* Saisie quantité en gélule et prix coloré */}
                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
                                        <span className="text-xs md:text-sm font-black text-rose-600">{formatPrice(item.price)}</span>

                                        {/* Gélule de quantité de maquette */}
                                        <div className="flex items-center gap-3 border border-slate-200 rounded-full bg-slate-50/50 p-1 w-24 justify-between">
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
                                    </div>

                                </div>
                            ))}
                        </div>

                        {/* COLONNE DROITE : RÉSUMÉ DE LA CARTE ROSE (lg:col-span-4) */}
                        <div className="lg:col-span-4 bg-rose-50/50 border border-rose-100/60 rounded-[2rem] p-6 space-y-6 shadow-sm">
                            <h3 className="text-base font-black text-slate-900 border-b border-rose-100/60 pb-3">Résumé de la commande</h3>

                            <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                                <span>Sous-total ({totalItems} articles)</span>
                                <span className="text-slate-800 font-bold">{formatPrice(totalAmount)}</span>
                            </div>

                            <hr className="border-rose-100/60" />

                            {/* Rendu unifié sans livraison plateforme */}
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-black text-slate-800">Total</span>
                                <span className="text-xl md:text-2xl font-black text-rose-600">{formatPrice(totalAmount)}</span>
                            </div>

                            {/* Bouton d'achat ovoïde */}
                            <Link
                                href={`/${shop_slug}/checkout`}
                                className="w-full py-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs md:text-sm transition flex items-center justify-center gap-1.5 shadow-lg shadow-rose-900/10 cursor-pointer"
                            >
                                Passer commande <ArrowRight className="w-4 h-4" />
                            </Link>

                            <p className="text-[10px] text-slate-400 text-center font-semibold flex items-center justify-center gap-1">
                                <Lock className="w-3.5 h-3.5 text-slate-300" /> Secure Checkout
                            </p>
                        </div>

                    </div>
                ) : (
                    /* PANIER VIDE */
                    <div className="text-center py-20 p-8 border border-dashed border-rose-200 rounded-[2rem] bg-white max-w-md mx-auto">
                        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-base font-black text-slate-800">Votre panier est vide</h3>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
                            Explorez notre catalogue et ajoutez vos articles préférés pour commencer votre commande.
                        </p>
                        <Link
                            href={`/${shop_slug}/catalog`}
                            className="mt-6 inline-block px-8 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-900/10"
                        >
                            Découvrir les produits
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}