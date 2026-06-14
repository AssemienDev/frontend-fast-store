// components/themes/colorful/ColorfulProductDetail.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";

interface ProductDetail {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compare_at_price: number | null;
    images: string[] | null;
    has_variants: boolean;
    variants_taille: string[] | null;
    variants_couleur: string[] | null;
    variants_stock: {
        taille: string | null;
        couleur: string | null;
        stock: number;
        price: number;
        compare_at_price: number | null;
        sku: string;
    }[] | null;
    created_at: string;
}

interface ShopConfig {
    slug: string;
    currency: string;
}

interface ColorfulProductDetailProps {
    shop: ShopConfig;
    product: ProductDetail;
    shop_slug: string;
}

export default function ColorfulProductDetail({ shop, product, shop_slug }: ColorfulProductDetailProps) {
    const router = useRouter();

    // États de sélection d'achat
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    // Zustand : Action d'ajout au panier
    const { addItem } = useCartStore();

    // Initialisation par défaut au montage
    useEffect(() => {
        if (product.has_variants) {
            if (product.variants_couleur && product.variants_couleur.length > 0) {
                setSelectedColor(product.variants_couleur[0]);
            }
            if (product.variants_taille && product.variants_taille.length > 0) {
                setSelectedSize(product.variants_taille[0]);
            }
        }
    }, [product]);

    // Trouver le tarif et stock spécifiques de la variante active
    const getSelectedVariantInfo = () => {
        if (!product.has_variants || !product.variants_stock) {
            return { price: product.price, compare_at_price: product.compare_at_price, stock: 99 };
        }

        const match = product.variants_stock.find(
            (v) =>
                (selectedSize ? v.taille === selectedSize : true) &&
                (selectedColor ? v.couleur === selectedColor : true)
        );

        return match
            ? { price: match.price, compare_at_price: match.compare_at_price, stock: match.stock }
            : { price: product.price, compare_at_price: product.compare_at_price, stock: 0 };
    };

    const activeInfo = getSelectedVariantInfo();

    // Vérifie si une taille spécifique est en rupture de stock
    const isSizeDisabled = (size: string) => {
        if (!product.variants_stock) return false;
        const match = product.variants_stock.find(
            (v) => v.taille === size && (selectedColor ? v.couleur === selectedColor : true)
        );
        return !match || match.stock === 0;
    };

    const formatPrice = (price: number) => {
        if (shop.currency === "XOF" || shop.currency === "XAF") return `${price.toLocaleString()} FCFA`;
        if (shop.currency === "USD") return `$${price.toLocaleString()}`;
        return `${price.toLocaleString()} ${shop.currency}`;
    };

    const handleAddToCart = () => {
        setLoading(true);
        addItem({
            id: product.id,
            name: product.name,
            price: activeInfo.price,
            image_url: product.images ? product.images[0] : null,
            selected_taille: selectedSize || undefined,
            selected_couleur: selectedColor || undefined
        }, shop_slug);

        setTimeout(() => {
            router.push(`/${shop_slug}/cart`);
        }, 500);
    };

    return (
        <div className="bg-[#FAF9F6] min-h-screen py-10 md:py-16 text-left text-slate-800 font-sans">
            <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">

                {/* COLONNE GAUCHE : GALERIE D'IMAGES DYNAMIQUES (md:col-span-6) */}
                <div className="md:col-span-6 space-y-4">
                    <div className="relative aspect-[3/4] w-full bg-slate-100 border border-slate-150 overflow-hidden rounded-[2rem] shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={product.images ? product.images[activeImageIndex] : "/placeholder-product.png"}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
                        />
                    </div>

                    {/* Miniatures d'images circulaires en bas */}
                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-3">
                            {product.images.map((imgUrl, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`w-14 h-14 rounded-full border-2 overflow-hidden relative transition ${
                                        activeImageIndex === idx ? "border-rose-600 scale-102" : "border-slate-200"
                                    }`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imgUrl} alt="Vignette" className="absolute inset-0 w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* COLONNE DROITE : DESCRIPTION & TUNNEL D'ACHAT VIVANT (md:col-span-6) */}
                <div className="md:col-span-6 space-y-6">

                    {/* NOM ET TARIF COLORÉS */}
                    <div className="space-y-3">
                        <h1 className="text-xl md:text-3xl font-black text-slate-950 tracking-tight leading-tight">
                            {product.name}
                        </h1>
                        <div className="flex items-baseline gap-3">
                            <span className="text-lg md:text-xl font-black text-rose-600">{formatPrice(activeInfo.price)}</span>
                            {activeInfo.compare_at_price && (
                                <span className="text-xs text-slate-400 font-bold line-through">{formatPrice(activeInfo.compare_at_price)}</span>
                            )}
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    {product.description && (
                        <div
                            className="text-xs md:text-sm text-slate-500 leading-relaxed pt-4"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    )}

                    {/* OPTIONS : SÉLECTION DES VARIANTES */}
                    {product.has_variants && (
                        <div className="space-y-6 border-t border-slate-100 pt-6">

                            {/* SÉLECTEUR DE COULEURS CIRCULAIRE ÉCLATANT */}
                            {product.variants_couleur && product.variants_couleur.length > 0 && (
                                <div className="space-y-2.5">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Couleur : {selectedColor}</span>
                                    <div className="flex items-center gap-3">
                                        {product.variants_couleur.map((color) => {
                                            const isSelected = selectedColor === color;
                                            return (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`w-8 h-8 rounded-full border-2 border-white cursor-pointer active:scale-95 transition flex items-center justify-center text-white ${
                                                        isSelected ? "ring-2 ring-offset-2 ring-rose-600" : ""
                                                    }`}
                                                    style={{ backgroundColor: color.toLowerCase() === "rouge éclatant" ? "#DC2626" : color.toLowerCase() }}
                                                    title={color}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* SÉLECTEUR DE TAILLES OVALE DYNAMIQUE */}
                            {product.variants_taille && product.variants_taille.length > 0 && (
                                <div className="space-y-2.5">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Taille</span>
                                    <div className="flex flex-wrap gap-2">
                                        {product.variants_taille.map((size) => {
                                            const isSelected = selectedSize === size;
                                            const disabled = isSizeDisabled(size);

                                            return (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    disabled={disabled}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`px-4 py-2 border rounded-full font-bold text-xs font-sans transition active:scale-95 ${
                                                        disabled
                                                            ? "bg-slate-100 border-slate-150 text-slate-300 opacity-60 cursor-not-allowed"
                                                            : isSelected
                                                                ? "bg-white border-2 border-rose-600 text-rose-600 font-black"
                                                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                                                    }`}
                                                >
                                                    {size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    {/* BOUTON D'AJOUT AU PANIER COLORÉ */}
                    <div className="pt-6 border-t border-slate-100">
                        <button
                            onClick={handleAddToCart}
                            disabled={activeInfo.stock === 0 || loading}
                            type="button"
                            className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-sans font-black text-xs uppercase tracking-wider rounded-full transition flex items-center justify-center gap-2 shadow-lg shadow-rose-900/10 disabled:opacity-40"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : activeInfo.stock === 0 ? (
                                "Rupture"
                            ) : (
                                <>
                                    <ShoppingBag className="w-4 h-4" /> Ajouter au panier
                                </>
                            )}
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}