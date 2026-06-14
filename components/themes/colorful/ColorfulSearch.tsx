// components/themes/colorful/ColorfulSearch.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { Search, Heart, Plus, RefreshCw, Sparkles } from "lucide-react";

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
    created_at: string;
}

interface ColorfulSearchProps {
    shop: ShopConfig;
    products: Product[];
    initialQuery: string;
    loading: boolean;
}

export default function ColorfulSearch({ shop, products, initialQuery, loading }: ColorfulSearchProps) {
    const router = useRouter();
    const [searchInput, setSearchQuery] = useState(initialQuery);

    // Zustand : Action d'ajout au panier
    const { addItem } = useCartStore();

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/${shop.slug}/search?q=${encodeURIComponent(searchInput)}`);
    };

    const formatPrice = (price: number) => {
        if (shop.currency === "XOF" || shop.currency === "XAF") return `${price.toLocaleString()} FCFA`;
        if (shop.currency === "USD") return `$${price.toLocaleString()}`;
        return `${price.toLocaleString()} ${shop.currency}`;
    };

    // Détection dynamique du badge "Nouveau" (créé aujourd'hui)
    const isNewProduct = (createdAtStr: string) => {
        const createdDate = new Date(createdAtStr).toDateString();
        const today = new Date().toDateString();
        return createdDate === today;
    };

    return (
        <div className="bg-[#FAF9F6] min-h-screen pb-24 text-left font-sans antialiased text-slate-800">
            <div className="max-w-5xl mx-auto px-6 space-y-10 pt-10">

                {/* 1. BARRE DE RECHERCHE ULTRA-RONDE AVEC BOUTON "GO!" DE LA MAQUETTE */}
                <form onSubmit={handleSearchSubmit} className="relative max-w-3xl w-full mx-auto">
          <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </span>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher un produit fun..."
                        className="w-full pl-14 pr-24 py-3.5 bg-white border-2 border-rose-100 focus:border-rose-600 focus:outline-none rounded-full text-xs md:text-sm text-slate-800 placeholder-slate-400 transition"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition cursor-pointer shadow-md shadow-rose-900/10"
                    >
                        Go!
                    </button>
                </form>

                <hr className="border-rose-100/30" />

                {/* 2. SECTION RÉSULTATS (LIVE RESULTS) */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black text-slate-900">Résultats de recherche</h2>
                        {!loading && searchInput && (
                            <span className="text-xs text-slate-400 font-bold">{products.length} articles trouvés</span>
                        )}
                    </div>

                    {loading ? (
                        /* CHARGEMENT */
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-56 bg-white border border-rose-100/40 rounded-[2rem]" />)}
                        </div>
                    ) : products.length > 0 ? (
                        /* GRILLE ASYMÉTRIQUE VISUELLE DE MAQUETTE ( md:grid-cols-12 ) */
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                            {products.map((prod, index) => {
                                const isFirstLargeCard = index === 0; // Le premier produit s'affiche en grand sur double largeur !
                                const isNew = isNewProduct(prod.created_at);
                                const hasDiscount = prod.compare_at_price !== null;

                                // CAS A : PREMIER GRAND ARTICLE D'IMPACT (INCRUSTATION SOMBRE DE MAQUETTE)
                                if (isFirstLargeCard) {
                                    return (
                                        <div
                                            key={prod.id}
                                            className="col-span-1 md:col-span-8 bg-slate-900 rounded-[2rem] overflow-hidden relative group cursor-pointer border border-rose-100/50 min-h-[380px] flex items-end"
                                            onClick={() => router.push(`/${shop.slug}/products/${prod.slug}`)}
                                        >
                                            {/* Image d'arrière-plan sombre */}
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={prod.images ? prod.images[0] : "/placeholder-product.png"}
                                                alt={prod.name}
                                                className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-102"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent z-10" />

                                            {/* Coeur de favoris */}
                                            <button className="absolute top-6 right-6 p-2 rounded-full bg-white/80 hover:bg-white text-slate-500 shadow-sm transition z-20">
                                                <Heart className="w-4 h-4" />
                                            </button>

                                            {/* Textes et Badges superposés en bas à gauche de la photo */}
                                            <div className="p-8 relative z-20 text-white space-y-3">
                                                {hasDiscount ? (
                                                    <span className="inline-block px-3 py-1 bg-[#F59E0B] text-white text-[8px] font-black uppercase rounded-full">
                            Promo
                          </span>
                                                ) : isNew ? (
                                                    <span className="inline-block px-3 py-1 bg-[#0F766E] text-white text-[8px] font-black uppercase rounded-full">
                            Nouveau
                          </span>
                                                ) : null}

                                                <h3 className="text-lg md:text-xl font-black">{prod.name}</h3>
                                                <p className="text-xs font-bold text-teal-300">{formatPrice(prod.price)}</p>
                                            </div>
                                        </div>
                                    );
                                }

                                // CAS B : LES AUTRES PETITS ARTICLES STANDARDS DE LA GRILLE (md:col-span-4)
                                return (
                                    <div
                                        key={prod.id}
                                        className="col-span-1 md:col-span-4 bg-white border border-rose-100/50 rounded-[2rem] overflow-hidden p-4 space-y-4 shadow-sm hover:shadow-lg transition duration-300 flex flex-col justify-between"
                                    >
                                        <div className="relative h-44 md:h-48 bg-slate-50 border border-slate-100 rounded-[1.5rem] overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={prod.images ? prod.images[0] : "/placeholder-product.png"}
                                                alt={prod.name}
                                                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                                                onClick={() => router.push(`/${shop.slug}/products/${prod.slug}`)}
                                            />

                                            {/* Badges de statuts */}
                                            {hasDiscount ? (
                                                <span className="absolute top-4 left-4 px-2.5 py-1 bg-rose-600 text-white text-[8px] font-black uppercase rounded-full">
                          Promo
                        </span>
                                            ) : isNew ? (
                                                <span className="absolute top-4 left-4 px-2.5 py-1 bg-teal-500 text-white text-[8px] font-black uppercase rounded-full">
                          Nouveau
                        </span>
                                            ) : null}

                                            <button className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white text-slate-500 shadow-sm transition">
                                                <Heart className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-end gap-3 px-1">
                                            <div>
                                                <h4
                                                    className="text-xs font-black text-slate-800 leading-tight truncate max-w-[130px] cursor-pointer hover:text-rose-600"
                                                    onClick={() => router.push(`/${shop.slug}/products/${prod.slug}`)}
                                                >
                                                    {prod.name}
                                                </h4>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 truncate">{prod.category_name || "Général"}</p>
                                                <p className="text-xs font-black text-rose-600 mt-2">{formatPrice(prod.price)}</p>
                                            </div>

                                            {/* Ajout Panier d'un clic */}
                                            <button
                                                onClick={() => addItem({
                                                    id: prod.id,
                                                    name: prod.name,
                                                    price: prod.price,
                                                    image_url: prod.images ? prod.images[0] : null
                                                }, shop.slug)}
                                                type="button"
                                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-600 flex items-center justify-center transition cursor-pointer shadow-sm active:scale-90"
                                                title="Ajouter au panier"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* AUCUN RÉSULTAT */
                        <div className="text-center py-16 p-8 border border-dashed border-rose-200 rounded-[2rem] bg-white max-w-md mx-auto">
                            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium text-xs">Aucun produit ne correspond à votre recherche.</p>
                            <button
                                onClick={() => { setSearchQuery(""); router.push(`/${shop.slug}/search`); }}
                                className="mt-3 text-xs text-rose-600 font-bold hover:underline"
                            >
                                Réinitialiser la recherche
                            </button>
                        </div>
                    )}
                </div>

                {/* BOUTON CHARGER PLUS DE VOTRE MAQUETTE */}
                {!loading && products.length >= 10 && (
                    <div className="text-center pt-8">
                        <button className="px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/50 font-black text-xs transition inline-flex items-center gap-2 cursor-pointer">
                            <RefreshCw className="w-4 h-4 text-slate-400" /> Charger plus
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}