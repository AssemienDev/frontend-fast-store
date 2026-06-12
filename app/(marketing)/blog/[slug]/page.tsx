// app/(marketing)/blog/[slug]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Calendar, Tag, Clock } from "lucide-react";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    category: string;
    summary: string;
    content: string; // Contenu rédigé complet (supporte l'HTML)
    cover_image_url: string;
    published_at: string;
    reading_time?: string;
}

// Articles complets par défaut pour l'affichage immédiat (Fallback)
const LOCAL_ARTICLES_DB: Record<string, BlogPost> = {
    "5-strategies-instagram-clients-fideles": {
        id: "post-featured",
        title: "5 stratégies infaillibles pour convertir vos abonnés Instagram en clients fidèles",
        slug: "5-strategies-instagram-clients-fideles",
        category: "Conseils",
        summary: "Apprenez à utiliser les stories, les messages directs et la vitrine LinkBoutik pour créer un tunnel de vente fluide et naturel sur les réseaux sociaux.",
        cover_image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
        published_at: "12 Octobre 2024",
        reading_time: "5 min de lecture",
        content: `
      <p>Aujourd'hui, posséder des milliers d'abonnés sur Instagram ne garantit plus automatiquement des ventes. L'algorithme change, la concurrence s'accroît et l'attention des utilisateurs diminue. Pour transformer vos abonnés passifs en acheteurs fidèles et réguliers, vous devez structurer votre démarche.</p>
      
      <h3>1. Optimisez votre biographie pour la conversion</h3>
      <p>Votre biographie est votre carte de visite numérique. Elle doit expliquer clairement ce que vous vendez, à qui vous vous adressez, et surtout proposer un appel à l'action précis vers votre catalogue. Remplacez votre lien générique par votre lien unique de boutique LinkBoutik (ex: <em>linkboutik.ci/votre-boutique</em>).</p>
      
      <h3>2. Utilisez les Stories pour créer de l'urgence</h3>
      <p>Les Stories sont l'outil parfait pour stimuler l'achat impulsif. Présentez régulièrement vos produits en situation réelle. Utilisez le sticker de lien pour rediriger directement vos clients sur la fiche produit de votre catalogue LinkBoutik en précisant que le stock est limité.</p>
      
      <h3>3. Automatisez vos réponses aux prix</h3>
      <p>C'est l'erreur la plus fréquente : répondre "Prix en DM" ou passer des heures à écrire le tarif sous chaque commentaire. En affichant vos prix de manière transparente sur votre catalogue en ligne LinkBoutik, vous qualifiez vos clients. Ceux qui vous contactent sont déjà d'accord sur le prix et prêts à valider.</p>

      <h3>4. Offrez une expérience d'achat fluide via WhatsApp</h3>
      <p>L'acheteur mobile en Afrique de l'Ouest et Centrale veut de la rapidité et du contact humain. Grâce à notre intégration, vos clients remplissent leur panier sur votre boutique LinkBoutik et sont redirigés sur votre WhatsApp en un clic avec un récapitulatif pré-rempli. Vous n'avez plus qu'à convenir de l'heure de livraison.</p>

      <h3>5. Créez un programme de fidélisation simple</h3>
      <p>Conserver un client existant coûte 5 fois moins cher que d'en acquérir un nouveau. Utilisez notre CRM pour identifier vos meilleurs clients et envoyez-leur un code promo exclusif (ex: SOLDES10) par message de remerciement après leur achat.</p>
    `
    }
};

export default function BlogPostDetailPage() {
    const { slug } = useParams() as { slug: string };
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    const merchantUrl = process.env.NEXT_PUBLIC_MERCHANT_URL || "http://marchand.localhost:3000";

    useEffect(() => {
        if (!slug) return;

        // Tente de récupérer les détails du bon article depuis l'API
        apiFetch<BlogPost>(`/storefront/blog/${slug}`)
            .then((data) => {
                if (data) {
                    setPost(data);
                } else {
                    setPost(LOCAL_ARTICLES_DB[slug] || null);
                }
                setLoading(false);
            })
            .catch(() => {
                // En cas de panne de BDD, on récupère notre base d'articles mockés locale
                setPost(LOCAL_ARTICLES_DB[slug] || null);
                setLoading(false);
            });
    }, [slug]);

    if (loading) {
        return (
            <div className="bg-neutral min-h-screen py-24 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">Chargement de votre lecture...</p>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="bg-neutral min-h-screen py-24 text-center">
                <h2 className="text-2xl font-black text-slate-800">Article introuvable</h2>
                <p className="text-slate-500 mt-2 text-sm">L&#39;article que vous recherchez n&#39;existe pas ou a été retiré.</p>
                <Link href="/blog" className="mt-6 inline-block text-sm text-primary font-bold hover:underline">
                    ← Retourner au blog
                </Link>
            </div>
        );
    }

    return (
        <article className="bg-neutral min-h-screen pb-24">

            {/* 1. SECTION EN-TÊTE / COVER */}
            <div className="relative h-64 md:h-112.5 w-full bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 to-transparent" />

                {/* BOUTON RETOUR SÉCURISÉ */}
                <div className="absolute top-6 left-6 max-w-7xl mx-auto w-full px-6 z-10">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition backdrop-blur-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> Retourner au blog
                    </Link>
                </div>

                {/* TITRE ET COMPOSANTS MÉTADONNÉES EN BAS DE L'IMAGE */}
                <div className="absolute bottom-10 left-0 right-0 max-w-4xl mx-auto px-6 text-white">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-teal-300">
                        <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {post.category}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.published_at}</span>
                        {post.reading_time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.reading_time}</span>}
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black mt-4 leading-tight">
                        {post.title}
                    </h1>
                </div>
            </div>

            {/* 2. SECTION CORPS DE L'ARTICLE (TYPOGRAPHIE ÉPURÉE) */}
            <div className="max-w-3xl mx-auto px-6 mt-12">
                <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed border-l-2 border-primary pl-4 mb-8">
                    {post.summary}
                </p>

                {/* CONTENU TEXTE PRINCIPAL */}
                <div
                    className="rich-text-article text-sm md:text-base text-slate-700 leading-relaxed space-y-6"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* SIGN-OFF DE FIN D'ARTICLE */}
                <div className="border-t border-slate-200 mt-16 pt-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-2xl border shadow-sm">
                    <div>
                        <h4 className="font-black text-slate-800 text-sm">Développez votre commerce</h4>
                        <p className="text-xs text-slate-500 mt-1">Gérez vos clients, stocks et paiements de manière professionnelle.</p>
                    </div>
                    <a
                        href={merchantUrl}
                        className="px-6 py-3 rounded-xl bg-primary text-white font-extrabold text-xs hover:opacity-95 transition whitespace-nowrap shrink-0"
                    >
                        Créer ma boutique gratuitement
                    </a>
                </div>
            </div>
        </article>
    );
}