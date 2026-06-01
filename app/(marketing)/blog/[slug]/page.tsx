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
        summary: "Apprenez à utiliser les stories, les messages directs et la vitrine FastStore pour créer un tunnel de vente fluide et naturel sur les réseaux sociaux.",
        cover_image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
        published_at: "12 Octobre 2024",
        reading_time: "5 min de lecture",
        content: `
      <p>Aujourd'hui, posséder des milliers d'abonnés sur Instagram ne garantit plus automatiquement des ventes. L'algorithme change, la concurrence s'accroît et l'attention des utilisateurs diminue. Pour transformer vos abonnés passifs en acheteurs fidèles et réguliers, vous devez structurer votre démarche.</p>
      
      <h3>1. Optimisez votre biographie pour la conversion</h3>
      <p>Votre biographie est votre carte de visite numérique. Elle doit expliquer clairement ce que vous vendez, à qui vous vous adressez, et surtout proposer un appel à l'action précis vers votre catalogue. Remplacez votre lien générique par votre lien unique de boutique FastStore (ex: <em>faststore.ci/votre-boutique</em>).</p>
      
      <h3>2. Utilisez les Stories pour créer de l'urgence</h3>
      <p>Les Stories sont l'outil parfait pour stimuler l'achat impulsif. Présentez régulièrement vos produits en situation réelle. Utilisez le sticker de lien pour rediriger directement vos clients sur la fiche produit de votre catalogue FastStore en précisant que le stock est limité.</p>
      
      <h3>3. Automatisez vos réponses aux prix</h3>
      <p>C'est l'erreur la plus fréquente : répondre "Prix en DM" ou passer des heures à écrire le tarif sous chaque commentaire. En affichant vos prix de manière transparente sur votre catalogue en ligne FastStore, vous qualifiez vos clients. Ceux qui vous contactent sont déjà d'accord sur le prix et prêts à valider.</p>

      <h3>4. Offrez une expérience d'achat fluide via WhatsApp</h3>
      <p>L'acheteur mobile en Afrique de l'Ouest et Centrale veut de la rapidité et du contact humain. Grâce à notre intégration, vos clients remplissent leur panier sur votre boutique FastStore et sont redirigés sur votre WhatsApp en un clic avec un récapitulatif pré-rempli. Vous n'avez plus qu'à convenir de l'heure de livraison.</p>

      <h3>5. Créez un programme de fidélisation simple</h3>
      <p>Conserver un client existant coûte 5 fois moins cher que d'en acquérir un nouveau. Utilisez notre CRM pour identifier vos meilleurs clients et envoyez-leur un code promo exclusif (ex: SOLDES10) par message de remerciement après leur achat.</p>
    `
    },
    "comment-gerer-son-stock-efficacement": {
        id: "post-1",
        title: "Comment gérer son stock efficacement quand on vend sur les réseaux sociaux ?",
        slug: "comment-gerer-son-stock-efficacement",
        category: "Conseils",
        summary: "Des méthodes simples et des outils pratiques pour éviter les ruptures de stock et toujours satisfaire vos clients.",
        cover_image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
        published_at: "10 Octobre 2024",
        reading_time: "4 min de lecture",
        content: `
      <p>La gestion de stock est le talon d'Achille de nombreux commerçants sur les réseaux sociaux. Vendre un article que vous n'avez plus en stock à un client génère de la frustration et dégrade l'image de votre marque. Voici comment professionnaliser votre inventaire.</p>
      
      <h3>Le problème des ventes multicanales</h3>
      <p>Lorsque vous publiez un produit sur Facebook, Instagram et WhatsApp en même temps, les commandes peuvent affluer de toutes parts. Sans outil centralisé, il est presque impossible de savoir en temps réel s'il vous reste 2 ou 0 robes rouges en taille M.</p>
      
      <h3>Centralisez votre inventaire</h3>
      <p>La solution consiste à utiliser une plateforme centrale de gestion. Lorsque vous enregistrez vos produits sur FastStore, vous pouvez définir la quantité exacte disponible pour chaque article. Le système décompte automatiquement les pièces vendues et empêche les clients d'acheter un produit en rupture de stock.</p>
    `
    },
    "histoire-de-sarah-1000-commandes": {
        id: "post-2",
        title: "L'histoire de Sarah : de 0 à 1000 commandes grâce à sa boutique automatisée",
        slug: "histoire-de-sarah-1000-commandes",
        category: "Success Stories",
        summary: "Découvrez le parcours inspirant d'une créatrice de bijoux qui a structuré ses ventes avec FastStore.",
        cover_image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
        published_at: "05 Octobre 2024",
        reading_time: "6 min de lecture",
        content: `
      <p>Sarah a lancé sa marque de bijoux artisanaux depuis sa chambre à Abidjan. En moins de 18 mois, elle est passée de quelques ventes amicales à plus de 1000 commandes expédiées à travers toute la sous-région. Elle nous partage sa formule de réussite.</p>
      
      <blockquote>"Je passais 8 heures par jour sur mon téléphone à donner mes tarifs et mes frais de livraison. Aujourd'hui, ma boutique en ligne fait tout le travail pendant que je me concentre sur la création."</blockquote>
      
      <h3>L'élément déclencheur : l'automatisation</h3>
      <p>Sarah explique qu'elle perdait de nombreux clients car elle mettait parfois plusieurs heures à répondre aux messages d'intérêt sur Instagram. En installant son lien FastStore dans sa bio, ses abonnés ont pu commencer à commander en autonomie totale, même au milieu de la nuit.</p>
    `
    },
    "nouveau-acceptez-les-paiements-mobile-money": {
        id: "post-3",
        title: "Nouveau : Acceptez les paiements Mobile Money en ligne sur FastStore",
        slug: "nouveau-acceptez-les-paiements-mobile-money",
        category: "Mises à jour",
        summary: "Nous avons intégré de nouvelles solutions de paiement pour simplifier la vie de vos clients et sécuriser vos revenus.",
        cover_image_url: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=1200&q=80",
        published_at: "01 Octobre 2024",
        reading_time: "3 min de lecture",
        content: `
      <p>Nous sommes fiers de vous annoncer le déploiement d'une mise à jour majeure très attendue : l'intégration des paiements en ligne par Mobile Money (Wave, Orange Money, MTN, Moov) directement sur vos vitrines FastStore.</p>
      
      <h3>Sécurisez vos acomptes et évitez les faux bonds</h3>
      <p>La livraison contre remboursement comporte des risques élevés de refus de livraison ou de clients absents. Avec notre nouveau système de paiement, vous pouvez désormais configurer un paiement complet ou un acompte en ligne obligatoire au moment de l'achat pour couvrir les frais de livraison.</p>
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
                        <h4 className="font-black text-slate-800 text-sm">Développez votre commerce social</h4>
                        <p className="text-xs text-slate-500 mt-1">Gérez vos clients, stocks et paiements WhatsApp de manière professionnelle.</p>
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