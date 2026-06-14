// components/themes/colorful/ColorfulCatalog.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, ChevronDown, Heart } from "lucide-react";
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

interface ColorfulCatalogProps {
    shop: ShopConfig;
    categories: Category[];
    products: Product[];
    activeCategoryId: string;
    activeSort: string;
}

export default function ColorfulCatalog({ shop, categories, products, activeCategoryId, activeSort }: ColorfulCatalogProps) {
    const router = useRouter();
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Trouver le nom de la catégorie active pour l'affichage de la bannière
    const activeCategory = categories.find(c => c.id === activeCategoryId);

    const formatPrice = (price: number) => {
        if (shop.currency === "XOF" || shop.currency === "XAF") return `${price.toLocaleString()} FCFA`;
        if (shop.currency === "USD") return `$${price.toLocaleString()}`;
        return `${price.toLocaleString()} ${shop.currency}`;
    };

    const handleSortChange = (sortKey: string) => {
        setShowSortDropdown(false);
        // Met à jour la clé de tri dans l'URL pour déclencher la requête API
        router.push(`/${shop.slug}/catalog?category=${activeCategoryId}&sort=${sortKey}`);
    };

    // Détection du badge "Nouveau" (produit créé il y a moins de 3 jours)
    const isNewProduct = (createdAtStr: string) => {
        const createdDate = new Date(createdAtStr).getTime();
        const limitDate = new Date().getTime() - (1000 * 3600 * 24 * 3);
        return createdDate >= limitDate;
    };

    return (
        <div className="bg-[#FAF9F6] min-h-screen pb-24 text-left font-sans antialiased text-slate-800">
            <div className="max-w-5xl mx-auto px-6 space-y-8">

                {/* 1. BANNIÈRE DE CATÉGORIE GÉANTE ET COLORÉE DE LA MAQUETTE */}
                <div className="relative h-44 md:h-52 w-full rounded-[2rem] bg-rose-500 overflow-hidden flex items-center p-8 md:p-12 shadow-md">
                    {/* Dégradé de texture de couleur douce en arrière-plan */}
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-rose-400 z-10" />
                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400 rounded-full blur-3xl opacity-60 -mr-10 -mt-10" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400 rounded-full blur-3xl opacity-50 -ml-10 -mb-10" />

                    <h1 className="text-3xl md:text-5xl font-black text-white relative z-20 tracking-tight leading-tight">
                        {activeCategory ? activeCategory.name : "Catalogue"}
                    </h1>
                </div>

                {/* 2. LE BOUTON FILTRE DE TRI INTERACTIF DE LA MAQUETTE */}
                <div className="flex items-center gap-3 pt-2 text-xs font-bold">

                    <button
                        onClick={() => router.push(`/${shop.slug}/catalog`)}
                        type="button"
                        className={`px-5 py-2.5 rounded-full transition cursor-pointer ${
                            !activeCategoryId
                                ? "bg-rose-600 text-white shadow-md shadow-rose-900/10"
                                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        Tout voir
                    </button>

                    <div className="relative inline-block text-left">
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            type="button"
                            className="px-5 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition text-slate-700 flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                {activeSort === "newest" ? "Filtres" : activeSort === "price_asc" ? "Prix croissant" : "Prix décroissant"}
              </span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>

                        {/* Menu de tri déroulant */}
                        {showSortDropdown && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setShowSortDropdown(false)} />
                                <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-2 text-xs font-semibold text-slate-500 space-y-1">
                                    <button onClick={() => handleSortChange("newest")} className="w-full p-2.5 text-left rounded-lg hover:bg-slate-50 hover:text-slate-900">Nouveautés (Plus récents)</button>
                                    <button onClick={() => handleSortChange("price_asc")} className="w-full p-2.5 text-left rounded-lg hover:bg-slate-50 hover:text-slate-900">Prix croissant</button>
                                    <button onClick={() => handleSortChange("price_desc")} className="w-full p-2.5 text-left rounded-lg hover:bg-slate-50 hover:text-slate-900">Prix décroissant</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* 3. GRILLE DE PRODUITS COLORÉS ULTRA-ARRONDIS ( md:grid-cols-4 ) */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                        {products.map((prod) => {
                            const isNew = isNewProduct(prod.created_at);
                            const hasDiscount = prod.compare_at_price !== null;

                            return (
                                <div
                                    key={prod.id}
                                    onClick={() => router.push(`/${shop.slug}/products/${prod.slug}`)}
                                    className="bg-white border border-rose-100/50 rounded-[2rem] overflow-hidden hover:shadow-lg transition duration-300 flex flex-col justify-between p-4 space-y-4 cursor-pointer"
                                >
                                    {/* Cadre d'image arrondi */}
                                    <div className="relative h-44 md:h-52 bg-slate-50 rounded-[1.5rem] overflow-hidden border border-slate-100">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={prod.images ? prod.images[0] : "/placeholder-product.png"}
                                            alt={prod.name}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />

                                        {/* Badge de maquette */}
                                        {hasDiscount ? (
                                            <span className="absolute top-4 left-4 px-2.5 py-1 bg-rose-600 text-white text-[8px] font-black uppercase rounded-full">
                        Promo
                      </span>
                                        ) : isNew ? (
                                            <span className="absolute top-4 left-4 px-2.5 py-1 bg-[#F59E0B] text-white text-[8px] font-black uppercase rounded-full">
                        Nouveau
                      </span>
                                        ) : null}

                                        <button className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white text-slate-500 shadow-sm transition">
                                            <Heart className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Infos et prix colorés en bas */}
                                    <div className="px-1 text-left">
                                        <h3 className="text-xs md:text-sm font-black text-slate-800 leading-tight truncate hover:text-rose-600">
                                            {prod.name}
                                        </h3>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 truncate">{prod.category_name || "Général"}</p>

                                        <div className="flex items-baseline gap-1.5 flex-wrap mt-2 font-black">
                                            <span className="text-xs md:text-sm text-rose-600">{formatPrice(prod.price)}</span>
                                            {hasDiscount && (
                                                <span className="text-[10px] text-slate-400 font-bold line-through">{formatPrice(prod.compare_at_price!)}</span>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-slate-400 text-sm py-16">Aucun produit disponible dans ce catalogue.</p>
                )}

                {/* BOUTON CHARGER PLUS (PAGINATION COLORÉE) */}
                {products.length >= 12 && (
                    <div className="text-center pt-12">
                        <button className="px-8 py-3 bg-white border border-rose-100 text-rose-600 font-extrabold text-xs rounded-full hover:bg-rose-50 transition">
                            Charger plus
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}