// components/themes/modern/ModernHome.tsx
import { useCartStore } from "@/store/cartStore";
import {Heart, Plus, ChevronLeft, ChevronRight, ArrowRight} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ShopConfig {
    name: string;
    slug: string;
    theme_settings: {
        slogan?: string;
        logo?: string;
    };
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
    images: string[] | null;
    category_name?: string;
}

interface ModernHomeProps {
    shop: ShopConfig;
    categories: Category[];
    products: Product[];
}

export default function ModernHome({ shop, categories, products }: ModernHomeProps) {
    const router = useRouter();
    const { addItem } = useCartStore();

    const formatPrice = (price: number) => {
        if (shop.currency === "XOF" || shop.currency === "XAF") return `${price.toLocaleString()} FCFA`;
        if (shop.currency === "USD") return `$${price.toLocaleString()}`;
        return `${price.toLocaleString()} ${shop.currency}`;
    };

    return (
        <div className="bg-white flex flex-col">

            {/* BANNIÈRE HERO DE LA BOUTIQUE */}
            <section className="relative bg-slate-900 h-[380px] md:h-[500px] w-full flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"
                    alt="Bannière d'accueil boutique"
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent z-10" />

                <div className="max-w-5xl mx-auto w-full px-6 relative z-20 text-white space-y-6 text-left">
                  <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-teal-300 text-[10px] font-black uppercase tracking-wider border border-white/5">
                    Nouvelle Collection
                  </span>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-xl">
                        {shop.theme_settings?.slogan || "L'Élégance Moderne, Redéfinie."}
                    </h1>
                    <p className="text-xs md:text-sm text-slate-300 max-w-lg leading-relaxed">
                        Découvrez notre sélection exclusive d&#39;articles conçus pour un style de vie contemporain et audacieux.
                    </p>
                    <Link
                        href={`/${shop.slug}/catalog`}
                        className="btn-primary-brand inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-extrabold text-xs md:text-sm hover:opacity-95 transition shadow-lg shadow-teal-950/20"
                    >
                        Acheter Maintenant <ArrowRight />
                    </Link>
                </div>
            </section>

            {/* SECTION DES CATÉGORIES */}
            {categories.length > 0 && (
                <section className="py-16 max-w-5xl mx-auto px-6 space-y-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black text-slate-900">Catégories</h2>
                        <Link href={`/${shop.slug}/catalog`} className="text-xs font-bold text-primary-brand hover:underline">
                            Tout voir →
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/${shop.slug}/catalog?category=${cat.slug}`}
                                className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200/80 hover:shadow-sm text-center flex flex-col justify-center h-28 transition cursor-pointer"
                            >
                                <span className="text-sm font-black text-slate-800 leading-snug">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* SECTION DES NOUVEAUTÉS */}
            <section className="py-16 max-w-5xl mx-auto px-6 space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-900">Nouveautés</h2>
                    <div className="flex gap-1.5">
                        <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"><ChevronLeft className="w-4 h-4" /></button>
                        <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {products.map((prod) => (
                            <div
                                key={prod.id}
                                className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-md transition duration-200 flex flex-col justify-between"
                            >
                                <div className="relative h-44 md:h-56 bg-slate-50 border-b border-slate-50">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={prod.images ? prod.images[0] : shop.theme_settings.logo}
                                        alt={prod.name}
                                        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                                        onClick={() => router.push(`/${shop.slug}/products/${prod.slug}`)}
                                    />
                                    <button className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-slate-500 shadow-sm transition">
                                        <Heart className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-4 md:p-5 flex flex-col justify-between space-y-3">
                                    <div>
                                        <h3
                                            className="text-xs md:text-sm font-black text-slate-800 leading-snug truncate cursor-pointer hover:text-primary-brand"
                                            onClick={() => router.push(`/${shop.slug}/products/${prod.slug}`)}
                                        >
                                            {prod.name}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase">{prod.category_name || "Général"}</p>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-xs md:text-sm font-black text-slate-900">{formatPrice(prod.price)}</span>
                                        <button
                                            onClick={() => addItem({
                                                id: prod.id,
                                                name: prod.name,
                                                price: prod.price,
                                                image_url: prod.images ? prod.images[0] : null
                                            }, shop.slug)}
                                            type="button"
                                            className="btn-primary-brand w-8 h-8 rounded-full flex items-center justify-center text-white active:scale-90 transition cursor-pointer shadow"
                                            title="Ajouter au panier"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-400 text-sm py-12">Aucun produit vedette configuré en ligne.</p>
                )}
            </section>

        </div>
    );
}