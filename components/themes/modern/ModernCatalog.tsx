// components/themes/modern/ModernCatalog.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { SlidersHorizontal, ChevronDown, ShoppingCart, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ShopConfig {
    slug: string;
    currency: string;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price: number | null;
    images: string[] | null;
    category_name?: string;
    created_at: string;
}

interface ModernCatalogProps {
    shop: ShopConfig;
    categories: Category[];
    products: Product[];
    activeCategoryId: string;
    activeSort: string;
}

export default function ModernCatalog({ shop, categories, products, activeCategoryId, activeSort }: ModernCatalogProps) {
    const router = useRouter();
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Zustand : Action d'ajout au panier d'un clic
    const { addItem } = useCartStore();

    const formatPrice = (price: number) => {
        if (shop.currency === "XOF" || shop.currency === "XAF") return `${price.toLocaleString()} FCFA`;
        if (shop.currency === "USD") return `$${price.toLocaleString()}`;
        return `${price.toLocaleString()} ${shop.currency}`;
    };

    const handleSortChange = (sortKey: string) => {
        setShowSortDropdown(false);
        // Met à jour l'URL avec les filtres pour déclencher le rechargement API du parent
        router.push(`/${shop.slug}/catalog?category=${activeCategoryId}&sort=${sortKey}`);
    };

    // Détection du badge "Nouveau" (produit créé il y a moins de 3 jours)
    const isNewProduct = (createdAtStr: string) => {
        const createdDate = new Date(createdAtStr).getTime();
        const limitDate = new Date().getTime() - (1000 * 3600 * 24 * 3);
        return createdDate >= limitDate;
    };

    return (
        <div className="bg-white min-h-screen pb-24 text-left">
            <div className="max-w-5xl mx-auto px-6 space-y-6 pt-6">

                {/* EN-TÊTE DU CATALOGUE (TITRE & BOUTON FILTRE) */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h1 className="text-2xl font-black text-[#0F766E] tracking-tight">Catalogue</h1>

                    {/* LE BOUTON FILTRE DE TRI INTERACTIF */}
                    <div className="relative inline-block text-left">
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            type="button"
                            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                            <span>
                {activeSort === "newest" ? "Nouveautés" : activeSort === "price_asc" ? "Prix croissant" : "Prix décroissant"}
              </span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        {/* Menu déroulant de tri */}
                        {showSortDropdown && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setShowSortDropdown(false)} />
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-2 animate-scaleIn text-xs font-semibold text-slate-600 space-y-1">
                                    <button onClick={() => handleSortChange("newest")} className="w-full p-2.5 text-left rounded-lg hover:bg-slate-50 hover:text-slate-900">Plus récents (Nouveautés)</button>
                                    <button onClick={() => handleSortChange("price_asc")} className="w-full p-2.5 text-left rounded-lg hover:bg-slate-50 hover:text-slate-900">Prix croissant</button>
                                    <button onClick={() => handleSortChange("price_desc")} className="w-full p-2.5 text-left rounded-lg hover:bg-slate-50 hover:text-slate-900">Prix décroissant</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* GRILLE DU CATALOGUE À 4 COLONNES (CONFORME À VOTRE IMAGE 100%) */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                        {products.map((prod) => {
                            const isNew = isNewProduct(prod.created_at);
                            const hasDiscount = prod.compare_at_price !== null;

                            return (
                                <div
                                    key={prod.id}
                                    className="bg-white border border-slate-150 rounded-3xl overflow-hidden hover:shadow-md transition duration-200 flex flex-col justify-between"
                                >
                                    {/* ZONE IMAGE AVEC BADGES DE MAQUETTE */}
                                    <div className="relative h-44 md:h-52 w-full bg-slate-50 border-b border-slate-50">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={prod.images ? prod.images[0] : "/placeholder-product.png"}
                                            alt={prod.name}
                                            className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                                            onClick={() => router.push(`/${shop.slug}/products/${prod.slug}`)}
                                        />

                                        {/* Badge Nouveau (Sarcelle) */}
                                        {isNew && (
                                            <span className="absolute top-4 left-4 px-2.5 py-1 bg-primary text-white text-[8px] font-black uppercase rounded-md tracking-wider">
                        Nouveau
                      </span>
                                        )}

                                        {/* Badge Promo (Rouge) */}
                                        {hasDiscount && (
                                            <span className="absolute top-4 left-4 px-2.5 py-1 bg-rose-500 text-white text-[8px] font-black uppercase rounded-md tracking-wider">
                        Promo
                      </span>
                                        )}
                                    </div>

                                    {/* PIED DE CARTE (INFOS, PRIX & PANIER CLIC ZUSTAND) */}
                                    <div className="p-4 md:p-5 flex flex-col justify-between grow space-y-3">
                                        <div>
                                            <h3
                                                className="text-xs md:text-sm font-black text-slate-800 leading-snug truncate cursor-pointer hover:text-primary-brand"
                                                onClick={() => router.push(`/${shop.slug}/products/${prod.slug}`)}
                                            >
                                                {prod.name}
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase truncate">{prod.category_name || "Général"}</p>
                                        </div>

                                        <div className="flex justify-between items-center w-full">
                                            <div className="flex items-baseline gap-1.5 flex-wrap">
                                                <span className="text-xs md:text-sm font-black text-slate-900">{formatPrice(prod.price)}</span>
                                                {hasDiscount && (
                                                    <span className="text-[10px] text-slate-400 font-bold line-through">{formatPrice(prod.compare_at_price!)}</span>
                                                )}
                                            </div>

                                            {/* Bouton d'ajout panier Zustand d'un clic */}
                                            <button
                                                onClick={() => addItem({
                                                    id: prod.id,
                                                    name: prod.name,
                                                    price: prod.price,
                                                    image_url: prod.images ? prod.images[0] : null
                                                }, shop.slug)}
                                                type="button"
                                                className="btn-primary-brand w-8 h-8 rounded-full flex items-center justify-center text-white active:scale-90 transition cursor-pointer shadow-sm"
                                                title="Ajouter au panier"
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-slate-400 text-sm py-16">Aucun produit disponible dans cette catégorie pour le moment.</p>
                )}

                {/* BOUTON CHARGER PLUS (PAGINATION) DE VOTRE MAQUETTE */}
                {products.length >= 12 && (
                    <div className="text-center pt-8">
                        <button className="px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold text-xs transition inline-flex items-center gap-2 cursor-pointer shadow-sm">
                            <RefreshCw className="w-4 h-4 text-slate-400" /> Charger plus de produits
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}