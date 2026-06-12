// app/merchant/catalog/categories/page.tsx
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { GripVertical, Edit2, Trash2, Plus, HelpCircle, FolderPlus, AlertTriangle } from "lucide-react";


interface Category {
    id: string;
    name: string;
    slug: string;
    product_count: number;
}

export default function MerchantCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // États pour les modales unifiées
    const [categoryNameInput, setCategoryNameInput] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    const [submitting, setSubmitting] = useState(false);

    // Charger les catégories au montage de la page
    const loadCategories = () => {
        setLoading(true);
        apiFetch<Category[]>("/merchant/categories")
            .then((data) => {
                setCategories(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        loadCategories();
    }, []);

    // Action : Créer une catégorie
    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryNameInput) return;
        setSubmitting(true);
        setError(null);

        try {
            const newCat = await apiFetch<Category>("/merchant/categories", {
                method: "POST",
                body: JSON.stringify({ name: categoryNameInput }),
            });
            setCategories([...categories, newCat]);
            setIsAddModalOpen(false);
            setCategoryNameInput("");
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'ajout.");
        } finally {
            setSubmitting(false);
        }
    };

    // Action : Enregistrer les modifications
    const handleEditCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryToEdit || !categoryNameInput) return;
        setSubmitting(true);
        setError(null);

        try {
            const updatedCat = await apiFetch<Category>(`/merchant/categories/${categoryToEdit.id}`, {
                method: "PUT",
                body: JSON.stringify({ name: categoryNameInput }),
            });
            setCategories(categories.map(c => c.id === categoryToEdit.id ? updatedCat : c));
            setCategoryToEdit(null);
            setCategoryNameInput("");
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de la modification.");
        } finally {
            setSubmitting(false);
        }
    };

    // Action : Confirmer la suppression
    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;
        setSubmitting(true);
        setError(null);

        try {
            await apiFetch(`/merchant/categories/${categoryToDelete.id}`, {
                method: "DELETE",
            });
            setCategories(categories.filter(c => c.id !== categoryToDelete.id));
            setCategoryToDelete(null);
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de la suppression.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-6xl w-full mx-auto relative">

            {/* HEADER DE RECOUVREMENT */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Catégories</h1>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Gérez les catégories de produits de votre boutique.</p>
                </div>
                <button
                    onClick={() => {
                        setCategoryNameInput("");
                        setIsAddModalOpen(true);
                    }}
                    className="px-5 py-3 rounded-xl bg-primary text-white font-extrabold text-xs hover:opacity-95 transition flex items-center justify-center gap-2 shadow-md shadow-teal-900/10 cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Ajouter une catégorie
                </button>
            </div>

            {error && <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">{error}</div>}

            {/* LISTE DES CARTES CATÉGORIES */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 border rounded-2xl animate-pulse" />)}
                </div>
            ) : categories.length > 0 ? (
                <div className="space-y-4">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className="p-5 bg-white border border-slate-200/50 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition duration-200"
                        >
                            <div className="flex items-center gap-4">
                                {/* Poignée verticale de déplacement visuel de votre maquette */}
                                <span className="text-slate-300 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-5 h-5" />
                </span>
                                <div>
                                    <h3 className="text-sm md:text-base font-black text-slate-800 leading-snug">{cat.name}</h3>
                                    <p className="text-[10px] md:text-xs text-slate-400 font-semibold mt-0.5">{cat.product_count} produits</p>
                                </div>
                            </div>

                            {/* Raccourcis Modifier & Supprimer */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setCategoryToEdit(cat);
                                        setCategoryNameInput(cat.name);
                                    }}
                                    className="p-2 hover:bg-slate-50 text-slate-400 hover:text-primary rounded-lg transition cursor-pointer"
                                    title="Modifier le nom"
                                >
                                    <Edit2 className="w-4.5 h-4.5" />
                                </button>
                                <button
                                    onClick={() => setCategoryToDelete(cat)}
                                    className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                                    title="Supprimer la catégorie"
                                >
                                    <Trash2 className="w-4.5 h-4.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 p-8 border border-dashed border-slate-200 rounded-2xl bg-white max-w-md mx-auto">
                    <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium text-sm">Aucune catégorie créée pour le moment.</p>
                </div>
            )}

            {/* ========================================================= */}
            {/* 1. MODALE AJOUT DE CATÉGORIE (DAISYUI STYLE) */}
            {/* ========================================================= */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-sm w-full text-left space-y-5 shadow-2xl">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                            <FolderPlus className="w-5 h-5 text-primary" />
                            <h3 className="text-sm font-black text-slate-900">Nouvelle catégorie</h3>
                        </div>
                        <form onSubmit={handleAddCategory} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Nom de la catégorie</label>
                                <input
                                    type="text"
                                    required
                                    value={categoryNameInput}
                                    onChange={(e) => setCategoryNameInput(e.target.value)}
                                    placeholder="Ex: Électronique, Vêtements..."
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none focus:border-primary transition"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="w-1/2 py-3 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs">Annuler</button>
                                <button type="submit" disabled={submitting} className="w-1/2 py-3 rounded-xl bg-primary text-white font-extrabold text-xs flex items-center justify-center">
                                    {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Créer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 2. MODALE MODIFICATION DE CATÉGORIE */}
            {/* ========================================================= */}
            {categoryToEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-sm w-full text-left space-y-5 shadow-2xl">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                            <Edit2 className="w-5 h-5 text-primary" />
                            <h3 className="text-sm font-black text-slate-900">Modifier la catégorie</h3>
                        </div>
                        <form onSubmit={handleEditCategory} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Nouveau nom de la catégorie</label>
                                <input
                                    type="text"
                                    required
                                    value={categoryNameInput}
                                    onChange={(e) => setCategoryNameInput(e.target.value)}
                                    placeholder="Modifier le nom..."
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none focus:border-primary transition"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setCategoryToEdit(null)} className="w-1/2 py-3 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs">Annuler</button>
                                <button type="submit" disabled={submitting} className="w-1/2 py-3 rounded-xl bg-primary text-white font-extrabold text-xs flex items-center justify-center">
                                    {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Enregistrer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 3. MODALE CONFIRMATION DE SUPPRESSION (ACCORDÉON DE PROTECTION) */}
            {/* ========================================================= */}
            {categoryToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">Confirmer la suppression</h3>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                Voulez-vous vraiment supprimer la catégorie <strong className="text-slate-700">{categoryToDelete.name}</strong> ?
                            </p>
                            <p className="text-[10px] text-rose-500 font-bold mt-2">
                                *Les produits associés verront leur catégorie réinitialisée (ils ne seront pas supprimés).
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setCategoryToDelete(null)} disabled={submitting} className="w-1/2 py-3 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs">Annuler</button>
                            <button type="button" onClick={handleDeleteCategory} disabled={submitting} className="w-1/2 py-3 rounded-xl bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center">
                                {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Supprimer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}