// components/themes/minimalist/MinimalistSearch.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Heart, HelpCircle, BookOpen } from "lucide-react";

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

interface MinimalistSearchProps {
    shop: ShopConfig;
    products: Product[];
    initialQuery: string;
    loading: boolean;
}

export default function MinimalistSearch({ shop, products, initialQuery, loading }: MinimalistSearchProps) {
    const router = useRouter();
    const [searchInput, setSearchQuery] = useState(initialQuery);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Met à jour l'URL avec les filtres pour recharger l'API
        router.push(`/${shop.slug}/search?q=${encodeURIComponent(searchInput)}`);
    };

    const formatPrice = (price: number) => {
        if (shop.currency === "XOF" || shop.currency === "XAF") return `${price.toLocaleString()} FCFA`;
        if (shop.currency === "USD") return `$${price.toLocaleString()}`;
        return `${price.toLocaleString()} ${shop.currency}`;
    };

    return (
        <div className="bg-white min-h-screen pb-24 text-left text-slate-900 font-serif">
            <div className="max-w-5xl mx-auto px-6 space-y-12 pt-10">

                {/* 1. BARRE DE RECHERCHE MINIMALISTE SANS BORDS NI BOUTONS (IMAGE MAQUETTE) */}
                <form onSubmit={handleSearchSubmit} className="relative w-full border-b border-slate-200 pb-3 flex items-center">
          <span className="text-slate-400 mr-3 shrink-0">
            <Search className="w-5 h-5 stroke-[1.5]" />
          </span>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher des pièces d'exception..."
                        className="w-full bg-transparent text-sm md:text-base text-slate-800 placeholder-slate-400 focus:outline-none leading-relaxed font-serif"
                    />
                </form>

                {/* 2. SECTION RÉSULTATS (SUGGESTIONS CURATÉES DE MAQUETTE) */}
                <div className="space-y-6">
                    <div className="flex justify-between items-baseline border-b border-slate-100 pb-3">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest font-sans">
              {searchInput ? "Résultats de recherche" : "Suggestions curatées"}
            </span>
                        {!loading && searchInput && (
                            <span className="text-[10px] text-slate-400 font-bold font-sans">{products.length} articles trouvés</span>
                        )}
                    </div>

                    {loading ? (
                        /* CHARGEMENT */
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
                            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-slate-50" />)}
                        </div>
                    ) : products.length > 0 ? (
                        /* GRILLE DE PRODUITS ÉPURÉE (SANS CADRE NI BOUTONS PANIER) */
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                            {products.map((prod) => {
                                const hasDiscount = prod.compare_at_price !== null;
                                return (
                                    <div
                                        key={prod.id}
                                        className="group flex flex-col justify-between cursor-pointer space-y-4"
                                        onClick={() => router.push(`/${shop.slug}/products/${prod.slug}`)}
                                    >
                                        {/* Cadre d'image vertical d'art */}
                                        <div className="relative aspect-[3/4] w-full bg-slate-50 overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={prod.images ? prod.images[0] : "/placeholder-product.png"}
                                                alt={prod.name}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                                            />

                                            <button className="absolute top-4 right-4 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-500 shadow-sm transition">
                                                <Heart className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {/* Infos textuelles épurées en bas */}
                                        <div className="space-y-1.5">
                                            <h3 className="text-xs md:text-sm font-black text-slate-800 leading-snug group-hover:underline">
                                                {prod.name}
                                            </h3>
                                            <div className="flex items-baseline gap-1.5 flex-wrap">
                                                <span className="text-xs font-bold text-slate-900">{formatPrice(prod.price)}</span>
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
                        /* AUCUN RÉSULTAT */
                        <div className="text-center py-16 p-8 border border-dashed border-slate-200 rounded-none bg-white max-w-md mx-auto">
                            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium text-xs font-sans">Aucun produit ne correspond à votre recherche.</p>
                            <button
                                onClick={() => { setSearchQuery(""); router.push(`/${shop.slug}/search`); }}
                                className="mt-3 text-xs text-black font-bold font-sans hover:underline"
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