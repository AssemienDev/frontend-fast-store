// components/themes/colorful/ColorfulHome.tsx
import { useCartStore } from "@/store/cartStore";
import { Heart, Plus, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ShopConfig {
    name: string;
    slug: string;
    theme_settings: {
        slogan?: string;
    };
    currency: string;
}

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price: number;
    images: string[] | null;
    category_name?: string;
}

interface ColorfulHomeProps {
    shop: ShopConfig;
    categories: Category[];
    products: Product[];
}

export default function ColorfulHome({ shop, categories, products }: ColorfulHomeProps) {
    const router = useRouter();
    const { addItem } = useCartStore();

    const formatPrice = (price: number) => {
        if (shop.currency === "XOF" || shop.currency === "XAF") return `${price.toLocaleString()} FCFA`;
        if (shop.currency === "USD") return `$${price.toLocaleString()}`;
        return `${price.toLocaleString()} ${shop.currency}`;
    };

    return (
        <div className="bg-[#FAF9F6] min-h-screen pb-24 text-left font-sans antialiased text-slate-800">

            {/* 1. SECTION HERO DYNAMIQUE ET COLORÉE (Vivez en couleurs. Play Hard.) */}
            <section className="relative h-[380px] md:h-[500px] w-full flex items-center overflow-hidden bg-rose-50/50">
                {/* Arrière-plan dynamique et vivant */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80"
                    alt="Vivez en couleurs. Play Hard."
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent z-10" />

                <div className="max-w-5xl mx-auto w-full px-6 relative z-20 space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                            Vivez en couleurs. <br />
                            <span className="text-rose-600 font-extrabold block mt-2">Play Hard.</span>
                        </h1>
                    </div>
                    <p className="text-xs md:text-sm text-slate-700 max-w-sm font-semibold leading-relaxed">
                        {shop.theme_settings?.slogan || "Découvrez notre collection pétillante et exprimez votre style."}
                    </p>
                    <Link
                        href={`/${shop.slug}/catalog`}
                        className="inline-block px-8 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs md:text-sm transition transform active:scale-95 shadow-md shadow-rose-900/10"
                    >
                        Explorer
                    </Link>
                </div>
            </section>

            {/* 2. SECTION DES CATÉGORIES (SHOP PAR CATÉGORIE - EXTRA ROUNDED PILLS) */}
            {categories.length > 0 && (
                <section className="py-16 max-w-5xl mx-auto px-6 space-y-8">
                    <h2 className="text-xl font-black text-slate-900">Shop par Catégorie</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/${shop.slug}/catalog?category=${cat.id}`}
                                className="p-6 rounded-[2rem] bg-rose-50/30 border border-rose-100 hover:bg-rose-50 hover:border-rose-200 transition text-center flex flex-col justify-center h-28 cursor-pointer shadow-sm"
                            >
                                <span className="text-xs md:text-sm font-black text-slate-800 leading-snug">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* 3. SECTION DES NOUVEAUTÉS (GRID DE CARTES EXTRA ROUNDED 2rem) */}
            <section className="py-16 max-w-5xl mx-auto px-6 space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-900">Les Nouveautés</h2>
                    <Link href={`/${shop.slug}/catalog`} className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
                        Voir tout <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {products.map((prod, index) => {
                            const isEven = prod.compare_at_price;
                            return (
                                <div
                                    key={prod.id}
                                    className="bg-white border border-rose-100/50 rounded-[2rem] overflow-hidden hover:shadow-lg transition duration-300 flex flex-col justify-between p-4 space-y-4"
                                >
                                    {/* Cadre d'image arrondi */}
                                    <div className="relative h-44 md:h-52 bg-slate-50 rounded-[1.5rem] overflow-hidden border border-slate-100">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={prod.images ? prod.images[0] : "/placeholder-product.png"}
                                            alt={prod.name}
                                            className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                                            onClick={() => router.push(`/${shop.slug}/products/${prod.slug}`)}
                                        />

                                        {/* Badge de maquette (Alternance Jaune / Rouge selon l'index) */}
                                        {isEven && (
                                            <span className="absolute top-4 left-4 px-2.5 py-1 bg-rose-600 text-white text-[8px] font-black uppercase rounded-full">
                                        Promo
                                      </span>
                                        )}

                                        <button className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white text-slate-500 shadow-sm transition">
                                            <Heart className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Infos et Action de panier direct */}
                                    <div className="flex justify-between items-end gap-3 px-1">
                                        <div>
                                            <h3
                                                className="text-xs md:text-sm font-black text-slate-800 leading-tight truncate max-w-[140px] cursor-pointer hover:text-rose-600"
                                                onClick={() => router.push(`/${shop.slug}/products/${prod.slug}`)}
                                            >
                                                {prod.name}
                                            </h3>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 truncate">{prod.category_name || "Général"}</p>

                                            {/* Prix coloré en rose contrasté de maquette */}
                                            <p className="text-xs md:text-sm font-black text-rose-600 mt-2">{formatPrice(prod.price)}</p>
                                        </div>

                                        {/* Bouton d'ajout panier */}
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
                    <p className="text-center text-slate-400 text-sm py-12">Aucun produit configuré.</p>
                )}
            </section>

        </div>
    );
}