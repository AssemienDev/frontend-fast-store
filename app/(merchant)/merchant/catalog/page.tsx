// src/app/merchant/catalog/page.tsx
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Search, Plus, Trash2, Edit2, Eye, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useMerchantAuthStore } from "@/store/merchantAuthStore";

interface Product {
    id: string;
    name: string;
    price: number;
    compare_at_price: number | null;
    sku: string | null;
    stock_quantity: number;
    images: string[] | null;
    status: string; // ACTIVE | DRAFT
    category_id?: string;
    slug: string;
}

export default function MerchantCatalogPage() {
    const { shop } = useMerchantAuthStore();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCat, setSelectedCat] = useState("0");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // États de contrôle SaaS (Paywall d'ajout)
    const [isPremium, setIsPremium] = useState(false);

    // État pour la modale de suppression jolie
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        // Charge en simultané les produits, les catégories et l'abonnement actif du marchand
        Promise.all([
            apiFetch<Product[]>("/merchant/products"),
            apiFetch<any[]>("/merchant/categories"),
            apiFetch<any>("/merchant/subscription").catch(() => null) // Récupération sécurisée du forfait
        ]).then(([prodsData, catsData, subData]) => {
            setProducts(prodsData);
            setCategories(catsData);

            // Si le marchand dispose d'un forfait Premium actif (Business/Pro)
            if (subData && (subData.plan_name.includes("Croissance") || subData.plan_name.includes("Pro") || subData.plan_name.includes("Business"))) {
                setIsPremium(true);
            } else {
                setIsPremium(false);
            }
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, []);

    // Basculer l'état (Toggle Switch) en ligne/hors ligne
    const handleToggleStatus = async (id: string) => {
        try {
            const updatedProd = await apiFetch<Product>(`/merchant/products/${id}/toggle`, {
                method: "PATCH"
            });
            setProducts(products.map(p => p.id === id ? { ...p, status: updatedProd.status } : p));
        } catch (err) {
            console.error("Échec du toggle status:", err);
        }
    };

    const getProductPreviewUrl = (productSlug: string) => {
        if (typeof window === "undefined" || !shop) return "#";

        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port ? `:${window.location.port}` : "";

        const shopSlug = shop.slug || "ma-boutique";

        if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
            return `${protocol}//${shopSlug}.localhost${port}/${productSlug}`;
        }

        const mainDomain = hostname.replace("marchand.", "");
        return `${protocol}//${shopSlug}.${mainDomain}/${productSlug}`;
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        setDeleting(true);

        try {
            await apiFetch(`/merchant/products/${productToDelete.id}`, {
                method: "DELETE"
            });
            setProducts(products.filter(p => p.id !== productToDelete.id));
            setProductToDelete(null);
        } catch (err) {
            console.error("Erreur de suppression:", err);
        } finally {
            setDeleting(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));

        if (selectedCat == "0") return matchesSearch;
        return matchesSearch && p.category_id === selectedCat;
    });

    console.log(filteredProducts);

    // BARRIÈRE D'AFFICHAGE SAAS : Un marchand gratuit (non premium) est limité à 30 produits maximum.
    // S'il atteint ou dépasse 30 produits, le bouton "Ajouter un produit" disparaît.
    const canAddProduct = isPremium || products.length < 30;

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-6xl w-full mx-auto relative">

            {/* EN-TÊTE DU CATALOGUE (DYNAMISÉ AVEC LA BARRIÈRE DE PAIEMENT) */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Produits</h1>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Gérez votre inventaire et vos disponibilités.</p>
                </div>

                {/* Le bouton d'ajout disparaît automatiquement de l'écran si la limite de l'offre gratuite est atteinte */}
                {canAddProduct ? (
                    <Link
                        href="/catalog/new"
                        className="px-5 py-3 rounded-xl bg-primary text-white font-extrabold text-xs hover:opacity-95 transition flex items-center justify-center gap-2 shadow-md shadow-teal-900/10 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Ajouter un produit
                    </Link>
                ) : (
                    <div className="px-4 py-2 rounded-xl bg-amber-50 text-[#F59E0B] border border-amber-200 text-xs font-bold leading-normal">
                        Limite atteinte (Forfait gratuit 30/30)
                    </div>
                )}
            </div>

            {/* BARRE DE RECHERCHE & FILTRES CATÉGORIES */}
            <div className="space-y-4">
                <div className="relative max-w-2xl w-full">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un produit (nom, SKU...)"
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition shadow-sm"
                    />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    {[{ id: "0", name: "Tous" }, ...categories].map((cat) => {
                        const isActive = selectedCat === cat.id;

                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCat(cat.id)}
                                className={`px-5 py-2 rounded-full text-xs font-bold border transition cursor-pointer ${
                                    isActive
                                        ? "bg-[#F59E0B] text-white border-[#F59E0B]"
                                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                {cat.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* GRILLE DU CATALOGUE DE PRODUITS */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />)}
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredProducts.map((prod) => {
                        const isOutOfStock = prod.stock_quantity === 0;
                        const isOffline = prod.status === "DRAFT";

                        return (
                            <div key={prod.id} className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between">

                                <div className="relative h-48 md:h-52 w-full bg-slate-50 border-b border-slate-100">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={prod.images ? prod.images[0] : "/placeholder-product.png"}
                                        alt={prod.name}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />

                                    {isOutOfStock ? (
                                        <span className="absolute top-4 right-4 px-2.5 py-1 bg-rose-500 text-white text-[9px] font-black uppercase rounded-md tracking-wider">
                                            Rupture
                                        </span>
                                    ) : isOffline ? (
                                        <span className="absolute top-4 right-4 px-2.5 py-1 bg-slate-400 text-white text-[9px] font-black uppercase rounded-md tracking-wider">
                                            Hors ligne
                                        </span>
                                    ) : (
                                        <span className="absolute top-4 right-4 px-2.5 py-1 bg-[#22C55E] text-white text-[9px] font-black uppercase rounded-md tracking-wider">
                                            En ligne
                                        </span>
                                    )}
                                </div>

                                <div className="p-5 grow flex flex-col justify-between space-y-4">
                                    <div>
                                        <h3 className="text-sm font-black text-slate-800 leading-snug truncate">{prod.name}</h3>
                                        <p className="text-[10px] text-slate-400 font-semibold mt-1">Réf: {prod.sku || "Aucune"}</p>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <p className="text-lg font-black text-primary">{prod.price.toLocaleString()} CFA</p>

                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold ${
                                            isOutOfStock
                                                ? "bg-rose-50 text-rose-600"
                                                : prod.stock_quantity <= 5
                                                    ? "bg-amber-50 text-amber-600"
                                                    : "bg-slate-50 text-slate-600"
                                        }`}>
                                            {prod.stock_quantity} en stock
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-2">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`toggle-${prod.id}`}
                                                checked={!isOffline}
                                                onChange={() => handleToggleStatus(prod.id)}
                                                className="toggle toggle-primary toggle-sm cursor-pointer"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2 text-slate-400">
                                            <a
                                                href={getProductPreviewUrl(prod.slug)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-slate-50 hover:text-primary rounded-lg transition cursor-pointer"
                                                title="Prévisualiser sur votre boutique"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </a>

                                            <Link
                                                href={`/catalog/edit/${prod.id}`}
                                                className="p-2 hover:bg-slate-50 hover:text-primary rounded-lg transition"
                                                title="Modifier l'article"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Link>

                                            <button
                                                onClick={() => setProductToDelete(prod)}
                                                className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition cursor-pointer"
                                                title="Supprimer l'article"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 p-8 border border-dashed border-slate-200 rounded-2xl bg-white max-w-md mx-auto">
                    <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium text-sm">Aucun produit trouvé dans votre catalogue.</p>
                </div>
            )}

            {/* MODALE DE SUPPRESSION HYBRIDE */}
            {productToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="relative bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
                        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">Confirmer la suppression</h3>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                Êtes-vous sûr de vouloir supprimer définitivement le produit <strong className="text-slate-700">{productToDelete.name}</strong> ?
                            </p>
                            <p className="text-[10px] text-rose-500 font-bold mt-2">
                                *Cette action détruira définitivement toutes les images liées sur votre stockage Cloudflare R2.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setProductToDelete(null)}
                                disabled={deleting}
                                className="w-1/2 py-3 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs hover:bg-slate-50 transition cursor-pointer"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                                className="w-1/2 py-3 rounded-xl bg-rose-600 text-white font-extrabold text-xs hover:bg-rose-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-rose-900/10"
                            >
                                {deleting ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    "Supprimer"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}