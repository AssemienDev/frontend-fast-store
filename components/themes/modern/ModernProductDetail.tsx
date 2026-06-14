// components/themes/modern/ModernProductDetail.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { Heart, Plus, Minus, Check, ShoppingBag } from "lucide-react";

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

interface ModernProductDetailProps {
    shop: ShopConfig;
    product: ProductDetail;
    shop_slug: string;
}

export default function ModernProductDetail({ shop, product, shop_slug }: ModernProductDetailProps) {
    const router = useRouter();

    // États de sélection d'achat
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Zustand : Action d'ajout au panier d'élite
    const { addItem } = useCartStore();

    // Initialisation par défaut
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

    // Détection du badge "New"
    const isNewProduct = () => {
        const createdDate = new Date(product.created_at).toDateString();
        const today = new Date().toDateString();
        return createdDate === today;
    };

    // Trouver le tarif et stock spécifiques de la variante active sélectionnée
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

    // Vérifie si une taille spécifique est en rupture de stock pour la couleur sélectionnée
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
        for (let i = 0; i < quantity; i++) {
            addItem({
                id: product.id,
                name: product.name,
                price: activeInfo.price,
                image_url: product.images ? product.images[0] : null,
                selected_taille: selectedSize || undefined,
                selected_couleur: selectedColor || undefined
            }, shop_slug);
        }
        router.push(`/${shop_slug}/cart`);
    };

    return (
        <div className="bg-white min-h-screen py-10 md:py-16">
            <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">

                {/* COMPOSANT GALERIE IMAGES */}
                <div className="md:col-span-6 space-y-4">
                    <div className="relative h-72 md:h-[400px] w-full rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={product.images ? product.images[activeImageIndex] : "/placeholder-product.png"}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
                        />
                        <button className="absolute top-6 right-6 p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-500 shadow-sm transition">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>

                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-3">
                            {product.images.map((imgUrl, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`w-16 h-16 rounded-2xl border overflow-hidden relative transition ${
                                        activeImageIndex === idx ? "border-2 border-primary scale-102" : "border-slate-200"
                                    }`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imgUrl} alt="Vignette" className="absolute inset-0 w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* COMPOSANT FORMULAIRE D'OPTIONS */}
                <div className="md:col-span-6 space-y-6 text-left">

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{product.name}</h1>
                            {isNewProduct() && (
                                <span className="px-2.5 py-1 bg-primary text-white text-[9px] font-black uppercase rounded-md tracking-wider">
                  New
                </span>
                            )}
                        </div>

                        <div className="flex items-baseline gap-3">
                            <span className="text-xl md:text-2xl font-black text-primary-brand">{formatPrice(activeInfo.price)}</span>
                            {activeInfo.compare_at_price && (
                                <span className="text-sm text-slate-400 font-bold line-through">{formatPrice(activeInfo.compare_at_price)}</span>
                            )}
                        </div>
                    </div>

                    {product.description && (
                        <div
                            className="text-xs md:text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    )}

                    {product.has_variants && (
                        <div className="space-y-6 border-t border-slate-100 pt-6">

                            {product.variants_couleur && product.variants_couleur.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Color: {selectedColor}</span>
                                    <div className="flex items-center gap-3">
                                        {product.variants_couleur.map((color) => {
                                            const isSelected = selectedColor === color;
                                            return (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`w-7 h-7 rounded-full border border-slate-200 cursor-pointer active:scale-95 transition flex items-center justify-center text-white ${
                                                        isSelected ? "ring-2 ring-offset-2 ring-slate-800" : ""
                                                    }`}
                                                    style={{ backgroundColor: color.toLowerCase() === "crimson rush" ? "#DC2626" : color.toLowerCase() }}
                                                    title={color}
                                                >
                                                    {isSelected && <Check className="w-3.5 h-3.5" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {product.variants_taille && product.variants_taille.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Size (US)</span>
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
                                                    className={`px-4 py-2 border rounded-xl font-bold text-xs transition active:scale-95 ${
                                                        disabled
                                                            ? "bg-slate-50 border-slate-150 text-slate-300 line-through opacity-50 cursor-not-allowed"
                                                            : isSelected
                                                                ? "bg-primary-brand-light border-primary-brand text-primary-brand font-black"
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

                    {/* QUANTITÉ */}
                    <div className="space-y-2 border-t border-slate-100 pt-6">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Quantité</span>
                        <div className="flex items-center gap-3 border border-slate-200 rounded-xl bg-slate-50/50 w-32 justify-between p-1">
                            <button
                                type="button"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-150 text-slate-500 hover:bg-slate-100 transition flex items-center justify-center font-bold"
                            >
                                -
                            </button>
                            <span className="text-xs font-bold text-slate-800">{quantity}</span>
                            <button
                                type="button"
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-150 text-slate-500 hover:bg-slate-100 transition flex items-center justify-center font-bold"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleAddToCart}
                            disabled={activeInfo.stock === 0}
                            type="button"
                            className="w-full py-4 rounded-xl btn-primary-brand font-black text-xs md:text-sm hover:opacity-95 transition flex items-center justify-center gap-2 shadow-lg shadow-teal-950/15 disabled:opacity-40"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            {activeInfo.stock === 0
                                ? "Rupture de stock"
                                : `Add to Cart - ${formatPrice(activeInfo.price * quantity)}`
                            }
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}