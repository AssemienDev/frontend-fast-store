// src/app/merchant/catalog/edit/[id]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Upload, Trash2, Tag, Box, DollarSign, Layers, Image as ImageIcon, Check, Clock } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Chargement asynchrone sécurisé de l'éditeur WYSIWYG
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => <div className="h-40 bg-slate-50 border border-slate-200 rounded-2xl animate-pulse" />,
});
import "react-quill-new/dist/quill.snow.css";

interface Category {
    id: string;
    name: string;
}

export default function EditProductPage() {
    const router = useRouter();
    const { id } = useParams() as { id: string };

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // État du formulaire produit
    const [form, setForm] = useState({
        name: "",
        category_id: "",
        description: "",
        price: 0,
        compare_at_price: "",
        sku: "",
        stock_quantity: 0,
        is_featured: false,
        status: "ACTIVE",
        images: [] as string[],
        has_variants: false,
    });

    // États pour les variantes
    const [taillesInput, setTaillesInput] = useState("");
    const [couleursInput, setCouleursInput] = useState("");
    const [variantRows, setVariantRows] = useState<any[]>([]);

    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    // 1. CHARGEMENT DES DONNÉES DU PRODUIT ET CATÉGORIES
    useEffect(() => {
        if (!id) return;

        Promise.all([
            apiFetch<any>(`/merchant/products/${id}`),
            apiFetch<Category[]>("/merchant/categories")
        ])
            .then(([prodData, catsData]) => {
                setCategories(catsData);

                // Pré-remplir le formulaire
                setForm({
                    name: prodData.name,
                    category_id: prodData.category_id || "",
                    description: prodData.description || "",
                    price: prodData.price,
                    compare_at_price: prodData.compare_at_price ? String(prodData.compare_at_price) : "",
                    sku: prodData.sku || "",
                    stock_quantity: prodData.stock_quantity,
                    is_featured: prodData.is_featured,
                    status: prodData.status,
                    images: prodData.images || [],
                    has_variants: prodData.has_variants,
                });

                if (prodData.has_variants) {
                    setTaillesInput(prodData.variants_taille?.join(", ") || "");
                    setCouleursInput(prodData.variants_couleur?.join(", ") || "");
                    setVariantRows(prodData.variants_stock || []);
                }

                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || "Impossible de charger les données du produit.");
                setLoading(false);
            });
    }, [id]);

    // 2. GÉNÉRATEUR DE VARIANTES CROISÉES DYNAMIQUES AVEC PRÉSERVATION D'ÉTAT
    useEffect(() => {
        if (!form.has_variants) return;

        const tailles = taillesInput.split(",").map(t => t.trim()).filter(Boolean);
        const couleurs = couleursInput.split(",").map(c => c.trim()).filter(Boolean);

        if (tailles.length === 0 && couleurs.length === 0) {
            return;
        }

        const combinations: any[] = [];
        const basePrice = form.price || 0;
        const baseComparePrice = form.compare_at_price ? parseFloat(form.compare_at_price) : null;

        if (tailles.length > 0 && couleurs.length > 0) {
            tailles.forEach(t => {
                couleurs.forEach(c => {
                    // SÉCURISÉ : On cherche si cette ligne existait déjà avant pour préserver sa saisie manuelle !
                    const existing = variantRows.find(r => r.taille === t && r.couleur === c);
                    combinations.push({
                        taille: t,
                        couleur: c,
                        price: existing ? existing.price : basePrice,
                        compare_at_price: existing ? existing.compare_at_price : baseComparePrice,
                        stock: existing ? existing.stock : 0,
                        sku: existing ? existing.sku : `${form.sku ? form.sku + '-' : ''}${t}-${c}`.toUpperCase()
                    });
                });
            });
        } else if (tailles.length > 0) {
            tailles.forEach(t => {
                const existing = variantRows.find(r => r.taille === t);
                combinations.push({
                    taille: t,
                    couleur: null,
                    price: existing ? existing.price : basePrice,
                    compare_at_price: existing ? existing.compare_at_price : baseComparePrice,
                    stock: existing ? existing.stock : 0,
                    sku: existing ? existing.sku : `${form.sku ? form.sku + '-' : ''}${t}`.toUpperCase()
                });
            });
        } else {
            couleurs.forEach(c => {
                const existing = variantRows.find(r => r.couleur === c);
                combinations.push({
                    taille: null,
                    couleur: c,
                    price: existing ? existing.price : basePrice,
                    compare_at_price: existing ? existing.compare_at_price : baseComparePrice,
                    stock: existing ? existing.stock : 0,
                    sku: existing ? existing.sku : `${form.sku ? form.sku + '-' : ''}${c}`.toUpperCase()
                });
            });
        }

        setVariantRows(combinations);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taillesInput, couleursInput, form.has_variants]);

    // Upload d'image R2
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (form.images.length >= 5) {
            setError("Vous pouvez ajouter un maximum de 5 images pour un produit.");
            return;
        }

        const file = files[0];
        if (file.size > 5 * 1024 * 1024) {
            setError("Le fichier est trop volumineux (Max 5 Mo).");
            return;
        }

        setError(null);
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await apiFetch<{ url: string }>("/merchant/upload", {
                method: "POST",
                body: formData,
            });

            setForm({ ...form, images: [...form.images, res.url] });
        } catch (err: any) {
            setError(err.message || "Échec du chargement de l'image.");
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
    };

    // Actions d'éditions d'attributs de la matrice
    const handleVariantPriceChange = (index: number, priceVal: number) => {
        const updated = [...variantRows];
        updated[index].price = priceVal;
        setVariantRows(updated);
    };

    const handleVariantComparePriceChange = (index: number, comparePriceVal: number | null) => {
        const updated = [...variantRows];
        updated[index].compare_at_price = comparePriceVal;
        setVariantRows(updated);
    };

    const handleVariantStockChange = (index: number, stockVal: number) => {
        const updated = [...variantRows];
        updated[index].stock = stockVal;
        setVariantRows(updated);
    };

    const handleVariantSkuChange = (index: number, skuVal: string) => {
        const updated = [...variantRows];
        updated[index].sku = skuVal;
        setVariantRows(updated);
    };

    // Traiter la sauvegarde de modification
    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const totalStock = form.has_variants
            ? variantRows.reduce((acc, r) => acc + r.stock, 0)
            : form.stock_quantity;

        const taillesList = form.has_variants ? taillesInput.split(",").map(t => t.trim()).filter(Boolean) : null;
        const couleursList = form.has_variants ? couleursInput.split(",").map(c => c.trim()).filter(Boolean) : null;

        try {
            await apiFetch(`/merchant/products/${id}`, {
                method: "PUT",
                body: JSON.stringify({
                    ...form,
                    compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
                    stock_quantity: totalStock,
                    variants_taille: taillesList,
                    variants_couleur: couleursList,
                    variants_stock: form.has_variants ? variantRows : null
                }),
            });

            router.push("/catalog");
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'enregistrement du produit.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-semibold">Chargement des données du produit...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-24">
            {/* HEADER COULISSANT */}
            <div className="bg-white border-b border-slate-200/60 sticky top-0 z-40">
                <div className="max-w-3xl mx-auto h-16 px-6 flex items-center justify-between">
                    <Link href="/merchant/catalog" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition">
                        <ArrowLeft className="w-4 h-4" /> Retour au catalogue
                    </Link>
                    <span className="text-sm font-black text-slate-800">Modifier le produit</span>
                    <div className="w-16 h-10" />
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-6 mt-8 space-y-6">
                {error && <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700">{error}</div>}

                <form onSubmit={handleSaveChanges} className="space-y-6">

                    {/* MÉDIAS (R2 INTEGRATION) */}
                    <div className="p-6 bg-white border border-slate-200/60 rounded-3xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Médias</span>
                            <span className="text-slate-400 text-xs font-bold">{form.images.length}/5</span>
                        </div>

                        <div className="border-2 border-dashed border-slate-200 hover:border-primary rounded-2xl p-8 text-center transition bg-slate-50/50 relative">
                            <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-700">Ajouter des photos</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-semibold">PNG, JPG jusqu'à 5 Mo</p>
                            <input
                                type="file"
                                accept="image/*"
                                disabled={form.images.length >= 5}
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            />
                        </div>

                        {form.images.length > 0 && (
                            <div className="flex flex-wrap gap-3 pt-2">
                                {form.images.map((imgUrl, idx) => (
                                    <div key={idx} className="w-16 h-16 rounded-xl border border-slate-150 overflow-hidden relative group">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={imgUrl} alt="Vignette" className="absolute inset-0 w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(idx)}
                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* INFORMATIONS GÉNÉRALES */}
                    <div className="p-6 bg-white border border-slate-200/60 rounded-3xl space-y-4">
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3">Informations Générales</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Nom du produit *</label>
                                <input
                                    type="text" required value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Ex: Montre connectée Série 5"
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none focus:border-primary transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Catégorie *</label>
                                <select
                                    required value={form.category_id}
                                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-700 focus:outline-none"
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>


                    {/* OPTIONS DE VARIANTES COMPLÈTES AVEC TARIFICATION DYNAMIQUE SUR LES COMBINAISONS */}
                    <div className="p-6 bg-white border border-slate-200/60 rounded-3xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Variantes (Optionnel)</h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox" id="variants-toggle"
                                    checked={form.has_variants}
                                    onChange={(e) => setForm({ ...form, has_variants: e.target.checked })}
                                    className="toggle toggle-primary toggle-sm cursor-pointer"
                                />
                                <label htmlFor="variants-toggle" className="text-[10px] font-bold text-slate-500 cursor-pointer">Activer les tailles/couleurs</label>
                            </div>
                        </div>

                        {form.has_variants ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Tailles (Séparez par des virgules)</label>
                                        <input
                                            type="text" value={taillesInput}
                                            onChange={(e) => setTaillesInput(e.target.value)}
                                            placeholder="Ex: S, M, L"
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Couleurs (Séparez par des virgules)</label>
                                        <input
                                            type="text" value={couleursInput}
                                            onChange={(e) => setCouleursInput(e.target.value)}
                                            placeholder="Ex: Bleu, Rouge"
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Grille dynamique (Héritage et surcharges comptables) */}
                                {variantRows.length > 0 && (
                                    <div className="space-y-3 pt-2">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Matrice de Stock & Tarification par variante</span>
                                        <div className="border border-slate-200/60 rounded-2xl overflow-hidden bg-slate-50/20 divide-y divide-slate-100">
                                            {variantRows.map((vRow, idx) => (
                                                <div key={idx} className="p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs font-bold text-slate-700">
                                                    <div className="min-w-[150px]">
                                                        {vRow.taille && <span className="px-2.5 py-1 bg-teal-50 text-primary rounded-lg border border-teal-100/50 mr-1.5">Taille : {vRow.taille}</span>}
                                                        {vRow.couleur && <span className="px-2.5 py-1 bg-amber-50 text-secondary rounded-lg border border-amber-100/50">Couleur : {vRow.couleur}</span>}
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full lg:w-auto">
                                                        <div>
                                                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Prix (CFA)</label>
                                                            <input
                                                                type="number" required value={vRow.price || ""}
                                                                onChange={(e) => handleVariantPriceChange(idx, parseFloat(e.target.value) || 0)}
                                                                placeholder="Prix"
                                                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Prix Barré (CFA)</label>
                                                            <input
                                                                type="number" value={vRow.compare_at_price || ""}
                                                                onChange={(e) => handleVariantComparePriceChange(idx, e.target.value ? parseFloat(e.target.value) : null)}
                                                                placeholder="Promo"
                                                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Stock</label>
                                                            <input
                                                                type="number" required value={vRow.stock || "0"}
                                                                onChange={(e) => handleVariantStockChange(idx, parseInt(e.target.value) || 0)}
                                                                placeholder="Stock"
                                                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">SKU</label>
                                                            <input
                                                                type="text" value={vRow.sku}
                                                                onChange={(e) => handleVariantSkuChange(idx, e.target.value)}
                                                                placeholder="SKU"
                                                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs uppercase"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* INVENTAIRE STANDARD SI PAS DE VARIANTES */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Stock initial *</label>
                                    <input
                                        type="number" required value={form.stock_quantity || ""}
                                        onChange={(e) => setForm({ ...form, stock_quantity: parseInt(e.target.value) || 0 })}
                                        placeholder="0"
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Référence Inventaire / SKU (Optionnel)</label>
                                    <input
                                        type="text" value={form.sku}
                                        onChange={(e) => setForm({ ...form, sku: e.target.value })}
                                        placeholder="Ex: WX-2023-A"
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* TARIFICATION */}
                    {!form.has_variants && (<div className="p-6 bg-white border border-slate-200/60 rounded-3xl space-y-4">
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3">Tarification</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Prix de vente * (FCFA)</label>
                                <input
                                    type="number" required value={form.price || ""}
                                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                                    placeholder="FCFA 0"
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Prix barré (Optionnel)</label>
                                <input
                                    type="number" value={form.compare_at_price}
                                    onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                                    placeholder="FCFA 0"
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>)}

                    {/* DESCRIPTION EDITABLE */}
                    <div className="p-6 bg-white border border-slate-200/60 rounded-3xl space-y-4">
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3">Détails</h3>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                Description détaillée
                            </label>

                            <div className="quill-editor-wrapper">
                                <ReactQuill
                                    theme="snow"
                                    value={form.description}
                                    // Met à jour l'HTML de la description dans l'état réactif
                                    onChange={(content) => setForm({ ...form, description: content })}
                                    placeholder="Décrivez les caractéristiques, avantages et spécifications de votre produit..."
                                    modules={{
                                        toolbar: [
                                            [{ header: [1, 2, false] }],
                                            ["bold", "italic", "underline", "strike"],
                                            [{ list: "ordered" }, { list: "bullet" }],
                                            ["clean"],
                                        ],
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* OPTIONS PUBLICATION */}
                    <div className="p-4 bg-white border border-slate-200/60 rounded-3xl flex justify-around gap-4 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox" id="featured-toggle"
                                checked={form.is_featured}
                                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                                className="toggle toggle-secondary toggle-sm cursor-pointer"
                            />
                            <label htmlFor="featured-toggle" className="cursor-pointer">Mettre en vedette (Accueil)</label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox" id="status-toggle"
                                checked={form.status === "ACTIVE"}
                                onChange={(e) => setForm({ ...form, status: e.target.checked ? "ACTIVE" : "DRAFT" })}
                                className="toggle toggle-success toggle-sm cursor-pointer"
                            />
                            <label htmlFor="status-toggle" className="cursor-pointer">Publier directement (En ligne)</label>
                        </div>
                    </div>

                    {/* BOUTON ENREGISTRER */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-4 rounded-xl bg-primary text-white font-extrabold text-xs md:text-sm hover:opacity-95 transition flex items-center justify-center shadow-md disabled:opacity-50 cursor-pointer"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            "Enregistrer les modifications"
                        )}
                    </button>

                </form>
            </main>
        </div>
    );
}