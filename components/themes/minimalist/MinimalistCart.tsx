// components/themes/minimalist/MinimalistCart.tsx
import { useCartStore } from "@/store/cartStore";
import { Plus, Minus, X, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ShopConfig {
    slug: string;
    currency: string;
}

interface MinimalistCartProps {
    shop: ShopConfig;
    shop_slug: string;
}

export default function MinimalistCart({ shop, shop_slug }: MinimalistCartProps) {
    const router = useRouter();

    // Zustand : Accès global à l'état et aux actions de votre panier d'achat
    const { cartItems, removeItem, updateQuantity, getTotalItems, getTotalAmount } = useCartStore();

    const formatPrice = (price: number) => {
        if (shop.currency === "XOF" || shop.currency === "XAF") return `${price.toLocaleString()} FCFA`;
        if (shop.currency === "USD") return `$${price.toLocaleString()}`;
        return `${price.toLocaleString()} ${shop.currency}`;
    };

    const totalAmount = getTotalAmount();
    const totalItems = getTotalItems();

    return (
        <div className="bg-white min-h-screen py-10 md:py-16 text-left text-slate-900 font-serif">
            <div className="max-w-xl mx-auto px-6 space-y-8">

                {/* EN-TÊTE DU PANIER DE MAQUETTE */}
                <div className="flex justify-between items-baseline border-b border-slate-100 pb-5">
                    <h1 className="text-3xl font-black tracking-tight">Panier</h1>
                    <span className="text-xs text-slate-400 font-bold font-sans">
            {totalItems} {totalItems <= 1 ? "article" : "articles"}
          </span>
                </div>

                {/* LISTE DES ARTICLES ÉPURÉS */}
                {cartItems.length > 0 ? (
                    <div className="space-y-6">

                        <div className="divide-y divide-slate-100">
                            {cartItems.map((item) => (
                                <div
                                    key={`${item.id}-${item.selected_taille || ""}-${item.selected_couleur || ""}`}
                                    className="py-6 flex items-start justify-between gap-6 relative"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Image carrée minimaliste */}
                                        <div className="w-20 h-20 bg-slate-50 border border-slate-100 relative overflow-hidden shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={item.image_url || "/placeholder-product.png"}
                                                alt={item.name}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="text-xs md:text-sm font-black text-slate-800 leading-snug">{item.name}</h3>
                                                <p className="text-[10px] text-slate-400 font-semibold font-sans mt-1 uppercase">
                                                    {item.selected_taille || item.selected_couleur
                                                        ? `${item.selected_taille ? "Taille: " + item.selected_taille : ""} ${item.selected_couleur ? "• Couleur: " + item.selected_couleur : ""}`
                                                        : "Taille Unique"
                                                    }
                                                </p>
                                            </div>

                                            {/* Sélecteur de quantité carré de votre maquette */}
                                            <div className="flex items-center gap-2 border border-slate-200 rounded-none bg-slate-50/50 p-0.5 w-24 justify-between font-sans">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.selected_taille, item.selected_couleur)}
                                                    className="w-6 h-6 rounded-none bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition flex items-center justify-center font-bold"
                                                >
                                                    <Minus className="w-2.5 h-2.5" />
                                                </button>
                                                <span className="text-[11px] font-bold text-slate-800">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.selected_taille, item.selected_couleur)}
                                                    className="w-6 h-6 rounded-none bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition flex items-center justify-center font-bold"
                                                >
                                                    <Plus className="w-2.5 h-2.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Prix aligné à droite et croix de suppression fine */}
                                    <div className="flex flex-col items-end justify-between h-20">
                                        <button
                                            onClick={() => removeItem(item.id, item.selected_taille, item.selected_couleur)}
                                            className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                            title="Retirer l'article"
                                        >
                                            <X className="w-4 h-4 stroke-[1.5]" />
                                        </button>
                                        <span className="text-xs md:text-sm font-bold text-slate-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                                    </div>

                                </div>
                            ))}
                        </div>

                        {/* TOTALS DU BAS (IMAGE CONFORME EN ALIGNEMENT HORIZONTAL) */}
                        <div className="pt-6 border-t border-slate-100 space-y-4 text-xs font-semibold text-slate-500">
                            <div className="flex justify-between">
                                <span className="font-sans font-bold">Sous-total</span>
                                <span className="text-slate-800">{formatPrice(totalAmount)}</span>
                            </div>

                            <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                                <span className="font-sans font-black uppercase tracking-wider text-[10px] text-slate-400">Total</span>
                                <span className="text-xl md:text-2xl font-black text-slate-900">{formatPrice(totalAmount)}</span>
                            </div>
                        </div>

                        {/* BOUTON D'ACHAT RECTANGULAIRE NOIR SOLIDE */}
                        <div className="pt-6">
                            <Link
                                href={`/${shop_slug}/checkout`}
                                className="w-full h-12 bg-black hover:bg-slate-900 text-white font-sans font-black text-[11px] uppercase tracking-widest transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                Procéder au paiement →
                            </Link>
                        </div>

                    </div>
                ) : (
                    /* PANIER VIDE SÉCURISÉ */
                    <div className="text-center py-20 p-8 border border-dashed border-slate-200 rounded-none bg-white font-sans">
                        <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-sm font-black text-slate-800">Votre panier est vide</h3>
                        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
                            Explorez notre catalogue et ajoutez vos articles coups de cœur pour lancer votre commande.
                        </p>
                        <Link
                            href={`/${shop_slug}/catalog`}
                            className="mt-6 inline-block h-10 px-6 bg-black hover:bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center"
                        >
                            Découvrir les produits
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}