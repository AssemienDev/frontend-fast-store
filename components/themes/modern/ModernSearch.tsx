// components/themes/modern/ModernSearch.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, Heart, Star, Sparkles } from "lucide-react";

interface ShopConfig {
    slug: string;
    currency: string;
}

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price: number | null;
    images: string[] | null;
    category_name?: string;
}

interface ModernSearchProps {
    shop: ShopConfig;
    products: Product[];
    initialQuery: string;
    loading: boolean;
}

export default function ModernSearch({ shop, products, initialQuery, loading }: ModernSearchProps) {
    const router = useRouter();
    const [searchInput, setSearchQuery] = useState(initialQuery);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Met à jour la recherche dans l'URL pour déclencher le chargement API
        router.push(`/${shop.slug}/search?q=${encodeURIComponent(searchInput)}`);
    };

    const handleRecentSearchClick = (query: string) => {
        setSearchQuery(query);
        router.push(`/${shop.slug}/search?q=${encodeURIComponent(query)}`);
    };

    const formatPrice = (price: number) => {
        if (shop.currency === "XOF" || shop.currency === "XAF") return `${price.toLocaleString()} FCFA`;
        if (shop.currency === "USD") return `$${price.toLocaleString()}`;
        return `${price.toLocaleString()} ${shop.currency}`;
    };

    return (
        <div className="bg-white min-h-screen pb-24 text-left">
            <div className="max-w-5xl mx-auto px-6 space-y-8 pt-6">

                {/* 1. BARRE DE RECHERCHE PRINCIPALE (IMAGE MAQUETTE) */}
                <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-3xl w-full">
                    <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </span>
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher des produits, marques ou catégories..."
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-brand transition shadow-inner"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-primary-brand px-6 py-3.5 rounded-xl font-extrabold text-xs md:text-sm hover:opacity-95 transition shadow"
                    >
                        Rechercher
                    </button>
                </form>

                <hr className="border-slate-100" />

                {/* 3. SECTION RÉSULTATS (LIVE RESULTS) */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-base md:text-lg font-black text-slate-900">Résultats de recherche</h2>
                        {!loading && (
                            <span className="text-xs text-slate-400 font-bold">{products.length} résultats trouvés</span>
                        )}
                    </div>

                    {loading ? (
                        /* CHARGEMENT */
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-56 bg-slate-100 rounded-2xl" />)}
                        </div>
                    ) : products.length > 0 ? (
                        /* GRILLE DE RÉSULTATS */
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {products.map((prod) => {
                                const hasDiscount = prod.compare_at_price !== null;
                                return (
                                    <div
                                        key={prod.id}
                                        className="bg-white border border-slate-150 rounded-2xl overflow-hidden hover:shadow-md transition duration-200 flex flex-col justify-between"
                                    >
                                        <div className="relative h-36 md:h-44 bg-slate-50 border-b border-slate-50">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={prod.images ? prod.images[0] : "/placeholder-product.png"}
                                                alt={prod.name}
                                                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                                                onClick={() => router.push(`/${shop.slug}/products/${prod.slug}`)}
                                            />

                                            {/* Badge Promotion */}
                                            {hasDiscount && (
                                                <span className="absolute top-3 left-3 px-2 py-1 bg-rose-500 text-white text-[8px] font-black uppercase rounded">
                          Soldes
                        </span>
                                            )}

                                        </div>

                                        {/* Détails de la carte */}
                                        <div className="p-4 flex flex-col justify-between grow space-y-3">
                                            <div>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">{prod.category_name || "Général"}</span>
                                                <h4
                                                    className="font-black text-slate-800 text-xs md:text-sm mt-1 leading-snug truncate cursor-pointer hover:text-primary-brand"
                                                    onClick={() => router.push(`/${shop.slug}/products/${prod.slug}`)}
                                                >
                                                    {prod.name}
                                                </h4>
                                            </div>

                                            <div className="flex justify-between items-center w-full">
                                                <div className="flex items-baseline gap-1.5 flex-wrap">
                                                    <span className="text-xs md:text-sm font-black text-primary-brand">{formatPrice(prod.price)}</span>
                                                    {hasDiscount && (
                                                        <span className="text-[10px] text-slate-400 font-bold line-through">{formatPrice(prod.compare_at_price!)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* AUCUN RÉSULTAT */
                        <div className="text-center py-16 p-8 border border-dashed border-slate-200 rounded-2xl bg-white max-w-md mx-auto">
                            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium text-sm">Aucun produit ne correspond à votre recherche.</p>
                            <button
                                onClick={() => { setSearchQuery(""); router.push(`/${shop.slug}/search`); }}
                                className="mt-3 text-xs text-primary-brand font-bold hover:underline"
                            >
                                Réinitialiser la recherche
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}