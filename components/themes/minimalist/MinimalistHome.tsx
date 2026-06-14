// components/themes/minimalist/MinimalistHome.tsx
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
    images: string[] | null;
    category_name?: string;
}

interface MinimalistHomeProps {
    shop: ShopConfig;
    categories: Category[];
    products: Product[];
}

export default function MinimalistHome({ shop, categories, products }: MinimalistHomeProps) {
    const router = useRouter();

    const formatPrice = (price: number) => {
        if (shop.currency === "XOF" || shop.currency === "XAF") return `${price.toLocaleString()} FCFA`;
        if (shop.currency === "USD") return `$${price.toLocaleString()}`;
        return `${price.toLocaleString()} ${shop.currency}`;
    };

    return (
        <div className="bg-white flex flex-col min-h-screen text-slate-900 font-serif">

            {/* 1. HERO SECTION MINIMALISTE PLEIN ÉCRAN */}
            <section className="relative h-[550px] md:h-[650px] w-full bg-slate-100 overflow-hidden flex items-end md:items-center">
                {/* Image d'ambiance de luxe épurée */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
                    alt="Collection Printemps Minimaliste"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10 z-10" />

                {/* Encadré de description à gauche (Glassmorphism de maquette) */}
                <div className="relative z-20 max-w-7xl mx-auto w-full px-6 mb-12 md:mb-0">
                    <div className="p-8 md:p-10 bg-white/80 backdrop-blur-md border border-white/50 max-w-sm rounded-none text-left space-y-5 shadow-sm">
                        <p className="text-xs text-slate-600 font-sans tracking-wide leading-relaxed">
                            {shop.theme_settings?.slogan || "Collection Printemps. L'élégance dans la simplicité."}
                        </p>
                        <Link
                            href={`/${shop.slug}/catalog`}
                            className="inline-block px-8 py-3 bg-black hover:bg-slate-900 text-white font-sans text-xs font-bold tracking-widest uppercase transition duration-150"
                        >
                            Explorer
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2. SECTION DES CATÉGORIES (MENU TEXTUEL HORIZONTAL DE MAQUETTE) */}
            {categories.length > 0 && (
                <section className="py-12 bg-white max-w-5xl mx-auto w-full px-6">
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-[10px] md:text-xs font-bold tracking-widest text-slate-500 uppercase font-sans">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/${shop.slug}/catalog?category=${cat.id}`}
                                className="hover:text-black hover:underline underline-offset-4 transition"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* 3. SECTION DES NOUVEAUTÉS (GRILLE D'ART SANS BORDURES NI OMBRES) */}
            <section className="py-16 max-w-5xl mx-auto px-6 space-y-12">
                <div className="flex justify-between items-baseline border-b border-slate-100 pb-4">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Nouveautés</h2>
                    <Link href={`/${shop.slug}/catalog`} className="text-xs font-bold text-slate-400 hover:text-black font-sans transition">
                        Tout voir
                    </Link>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                        {products.map((prod) => (
                            <div
                                key={prod.id}
                                onClick={() => router.push(`/${shop.slug}/products/${prod.slug}`)}
                                className="group flex flex-col justify-between cursor-pointer space-y-4 text-left"
                            >
                                {/* Image verticale de maquette (Aspect Ratio 3:4) */}
                                <div className="relative aspect-[3/4] w-full bg-slate-50 overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={prod.images ? prod.images[0] : "/placeholder-product.png"}
                                        alt={prod.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                                    />
                                </div>

                                {/* Titre & Prix épurés en bas (Sans boutons interactifs) */}
                                <div className="space-y-1.5">
                                    <h3 className="text-xs md:text-sm font-black text-slate-800 leading-snug group-hover:underline">
                                        {prod.name}
                                    </h3>
                                    <p className="text-[10px] md:text-xs text-slate-500 font-bold font-sans">
                                        {formatPrice(prod.price)}
                                    </p>
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-400 text-sm py-12 font-sans">Aucun produit configuré pour le moment.</p>
                )}
            </section>

        </div>
    );
}