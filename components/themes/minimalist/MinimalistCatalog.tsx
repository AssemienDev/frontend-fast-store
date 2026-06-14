// components/themes/minimalist/MinimalistCatalog.tsx
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

interface MinimalistCatalogProps {
    shop: ShopConfig;
    categories: Category[];
    products: Product[];
    activeCategoryId: string;
    activeSort: string;
}

export default function MinimalistCatalog({ shop, categories, products, activeCategoryId, activeSort }: MinimalistCatalogProps) {
    const router = useRouter();
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Trouver le nom de la catégorie active pour le titre centré
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

    return (
        <div className="bg-white min-h-screen pb-24 text-left text-slate-900 font-serif">
            <div className="max-w-5xl mx-auto px-6 space-y-8">

                {/* TITRE DE LA CATÉGORIE CENTRÉ EN GRANDE TYPOGRAPHIE SERIF */}
                <div className="text-center py-10 border-b border-slate-100">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                        {activeCategory ? activeCategory.name : "Catalogue"}
                    </h1>
                </div>

                {/* BARRE DE FILTRE ÉPURÉE (CONFORME À VOTRE MAQUETTE) */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 font-sans text-xs">

                    {/* Bouton de filtrage interactif */}
                    <div className="relative inline-block text-left">
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            type="button"
                            className="flex items-center gap-2 font-bold text-slate-500 hover:text-black transition cursor-pointer"
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>
                {activeSort === "newest" ? "Filtrer" : activeSort === "price_asc" ? "Prix croissant" : "Prix décroissant"}
              </span>
                            <ChevronDown className="w-3 h-3" />
                        </button>

                        {/* Popover déroulant du tri */}
                        {showSortDropdown && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setShowSortDropdown(false)} />
                                <div className="absolute left-0 mt-3 w-48 bg-white border border-slate-200 rounded-none shadow-xl z-40 p-2 text-xs font-semibold text-slate-500 space-y-1">
                                    <button onClick={() => handleSortChange("newest")} className="w-full p-2.5 text-left hover:bg-slate-50 hover:text-slate-900">Nouveautés (Plus récents)</button>
                                    <button onClick={() => handleSortChange("price_asc")} className="w-full p-2.5 text-left hover:bg-slate-50 hover:text-slate-900">Prix croissant</button>
                                    <button onClick={() => handleSortChange("price_desc")} className="w-full p-2.5 text-left hover:bg-slate-50 hover:text-slate-900">Prix décroissant</button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Compteur dynamique */}
                    <span className="text-slate-400 font-medium">
            {products.length} {products.length <= 1 ? "Article" : "Articles"}
          </span>

                </div>

                {/* GRILLE D'ART ASYMÉTRIQUE DE VOTRE MAQUETTE ( md:grid-cols-12 ) */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-12 items-start pt-4">
                        {products.map((prod, index) => {
                            const isFirstLargeCard = index === 0; // Le premier produit prend 8 colonnes, les autres 4

                            return (
                                <div
                                    key={prod.id}
                                    className={`group flex flex-col justify-between cursor-pointer space-y-4 ${
                                        isFirstLargeCard
                                            ? "col-span-1 md:col-span-8 h-full"
                                            : "col-span-1 md:col-span-4"
                                    }`}
                                    onClick={() => router.push(`/${shop.slug}/products/${prod.slug}`)}
                                >
                                    {/* Photo verticale sans bordures (Aspect Ratio 3:4) */}
                                    <div className="relative aspect-[3/4] w-full bg-slate-50 overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={prod.images ? prod.images[0] : "/placeholder-product.png"}
                                            alt={prod.name}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                                        />

                                        <button className="absolute top-6 right-6 p-2 rounded-full bg-white/80 hover:bg-white text-slate-500 shadow-sm transition">
                                            <Heart className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Ligne d'infos : Titre à gauche, Prix à droite (Serif) */}
                                    <div className="flex justify-between items-baseline gap-4">
                                        <h3 className="text-xs md:text-sm font-black text-slate-800 leading-snug group-hover:underline">
                                            {prod.name}
                                        </h3>
                                        <span className="text-xs md:text-sm font-bold text-slate-900 shrink-0">
                      {formatPrice(prod.price)}
                    </span>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-slate-400 text-sm py-16 font-sans">Aucun produit disponible dans ce catalogue.</p>
                )}

                {/* BOUTON CHARGER PLUS (PAGINATION ÉPURÉE) */}
                {products.length >= 10 && (
                    <div className="text-center pt-12">
                        <button className="px-8 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-sans font-extrabold text-xs tracking-wider uppercase transition">
                            Charger plus
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}