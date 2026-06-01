// app/(marketing)/blog/page.tsx
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { ArrowRight, BookOpen } from "lucide-react";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    category: string;
    summary: string;
    content: string;
    cover_image_url: string;
    is_featured?: boolean;
    published_at: string;
}

// Données par défaut de la maquette (Fallback si la BDD est vide)
const DEFAULT_POSTS: BlogPost[] = [
    {
        id: "post-featured",
        title: "5 stratégies infaillibles pour convertir vos abonnés Instagram en clients fidèles",
        slug: "5-strategies-instagram-clients-fideles",
        category: "Conseils",
        summary: "Apprenez à utiliser les stories, les messages directs et la vitrine FastStore pour créer un tunnel de vente fluide et naturel sur les réseaux sociaux. Découvrez des exemples concrets pour...",
        content: "",
        cover_image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
        is_featured: true,
        published_at: "12 Octobre 2024"
    },
    {
        id: "post-1",
        title: "Comment gérer son stock efficacement quand on...",
        slug: "comment-gerer-son-stock-efficacement",
        category: "Conseils",
        summary: "Des méthodes simples et des outils pratiques pour éviter les ruptures de stock et toujours satisfaire vos clients.",
        content: "",
        cover_image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=80",
        published_at: "10 Oct 2024"
    },
    {
        id: "post-2",
        title: "L'histoire de Sarah : de 0 à 1000 commandes...",
        slug: "histoire-de-sarah-1000-commandes",
        category: "Success Stories",
        summary: "Découvrez le parcours inspirant d'une créatrice de bijoux qui a structuré ses ventes avec FastStore.",
        content: "",
        cover_image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
        published_at: "05 Oct 2024"
    },
    {
        id: "post-3",
        title: "Nouveau : Acceptez les paiements Mobile Money",
        slug: "nouveau-acceptez-les-paiements-mobile-money",
        category: "Mises à jour",
        summary: "Nous avons intégré de nouvelles solutions de paiement pour simplifier la vie de vos clients et sécuriser vos revenus.",
        content: "",
        cover_image_url: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=500&q=80",
        published_at: "01 Oct 2024"
    }
];

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("Tous les articles");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Tente de récupérer les articles depuis l'API publique
        apiFetch<BlogPost[]>("/storefront/blog")
            .then((data) => {
                if (data && data.length > 0) {
                    setPosts(data);
                } else {
                    setPosts(DEFAULT_POSTS);
                }
                setLoading(false);
            })
            .catch(() => {
                setPosts(DEFAULT_POSTS);
                setLoading(false);
            });
    }, []);

    const categories = [
        "Tous les articles",
        ...Array.from(new Set(posts.map((post) => post.category)))
    ];

    // Filtrer les articles selon la catégorie sélectionnée (sans casser la mise en avant "À la une")
    const filteredPosts = posts.filter((post) => {
        if (selectedCategory === "Tous les articles") return true;
        return post.category === selectedCategory;
    });

    // Trouver l'article "À la une" (Featured) pour la mise en page principale
    const featuredPost = posts.find((post) => post.is_featured === true);

    // Filtrer les articles secondaires (exclure l'article vedette de la grille du bas)
    const gridPosts = filteredPosts.filter((post) => post.id !== featuredPost?.id);

    return (
        <div className="bg-neutral min-h-screen py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-6">

                {/* EN-TÊTE DE LA PAGE */}
                <div className="max-w-3xl mb-12">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Ressources & Inspirations
                    </h1>
                    <p className="mt-4 text-sm md:text-base text-slate-500 leading-relaxed">
                        Découvrez nos conseils, astuces et témoignages pour développer votre activité sur les réseaux sociaux avec FastStore.
                    </p>
                </div>

                {/* BOUTONS DE FILTRAGE DES CATÉGORIES (Écran 'Blog') */}
                <div className="flex flex-wrap gap-2 mb-16">
                    {categories.map((category) => {
                        const isActive = selectedCategory === category;
                        return (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-5 py-2.5 rounded-full text-xs font-bold transition duration-200 border ${
                                    isActive
                                        ? "bg-primary text-white border-primary"
                                        : "bg-white text-slate-500 border-slate-200/60 hover:bg-slate-50"
                                }`}
                            >
                                {category}
                            </button>
                        );
                    })}
                </div>

                {loading ? (
                    /* CHARGEMENT */
                    <div className="space-y-8 animate-pulse">
                        <div className="h-80 bg-white border border-slate-200 rounded-3xl" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-64 bg-white border border-slate-200 rounded-2xl" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-16">

                        {/* L'ARTICLE À LA UNE (Seulement si "Tous les articles" ou sa catégorie est sélectionnée) */}
                        {featuredPost && (selectedCategory === "Tous les articles" || selectedCategory === featuredPost.category) && (
                            <div className="bg-white border border-slate-200/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition duration-200 grid grid-cols-1 lg:grid-cols-12">
                                <div className="lg:col-span-6 relative h-64 lg:h-auto min-h-[300px]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={featuredPost.cover_image_url}
                                        alt={featuredPost.title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <span className="absolute top-6 left-6 px-4 py-1.5 bg-secondary text-white text-[10px] font-black uppercase rounded-lg tracking-wider">
                    À la une
                  </span>
                                </div>
                                <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center">
                  <span className="text-xs font-bold text-primary">
                    {featuredPost.category} <span className="text-slate-300 mx-2">•</span> {featuredPost.published_at}
                  </span>
                                    <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-4 leading-snug">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="mt-4 text-xs md:text-sm text-slate-500 leading-relaxed">
                                        {featuredPost.summary}
                                    </p>
                                    <a
                                        href={`/blog/${featuredPost.slug}`}
                                        className="mt-6 text-xs font-black text-primary hover:opacity-85 transition inline-flex items-center gap-1.5"
                                    >
                                        Lire l'article <ArrowRight className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* GRILLE DES ARTICLES SECONDAIRES */}
                        <div>
                            {gridPosts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {gridPosts.map((post) => (
                                        <div
                                            key={post.id}
                                            className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="relative h-48 w-full">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={post.cover_image_url}
                                                        alt={post.title}
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="p-6">
                          <span className="text-[10px] font-bold text-primary">
                            {post.category} <span className="text-slate-300 mx-1.5">•</span> {post.published_at}
                          </span>
                                                    <h3 className="font-black text-slate-900 text-sm md:text-base mt-3 leading-snug line-clamp-2">
                                                        {post.title}
                                                    </h3>
                                                    <p className="mt-3 text-xs text-slate-500 leading-relaxed line-clamp-3">
                                                        {post.summary}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-6 pt-0">
                                                <a
                                                    href={`/blog/${post.slug}`}
                                                    className="text-xs font-black text-primary hover:opacity-85 transition inline-flex items-center gap-1.5"
                                                >
                                                    Lire la suite <ArrowRight className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* AUCUN ARTICLE SUR LA CATÉGORIE */
                                <div className="text-center py-16 p-8 border border-dashed border-slate-200 rounded-2xl bg-white max-w-md mx-auto">
                                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium text-sm">
                                        Aucun article publié pour le moment dans la catégorie &ldquo;{selectedCategory}&rdquo;.
                                    </p>
                                    <button
                                        onClick={() => setSelectedCategory("Tous les articles")}
                                        className="mt-3 text-xs text-primary font-bold hover:underline"
                                    >
                                        Voir tous les articles
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}