// app/(marketing)/layout.tsx
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import {Metadata} from "next";


export const metadata: Metadata = {
    title: {
        default: "FastStore Commerce Cloud ",
        template: "%s | FastStore", // Gabarit dynamique : injecte le titre de la page active à la place de %s
    },
    description: "FastStore centralise vos ventes, fiches produits et commandes sur les réseaux sociaux (Facebook, Instagram, TikTok) et WhatsApp en Afrique.",
    keywords: ["E-commerce", "SaaS", "WhatsApp", "Afrique", "Vente en ligne", "Boutique en ligne", "Mobile Money", "Côte d'Ivoire", "Sénégal"],
    authors: [{ name: "FastStore Team" }],

    // Balises OpenGraph (Optimisation du partage de liens sur WhatsApp, Facebook, LinkedIn)
    openGraph: {
        title: "FastStore Commerce Cloud",
        description: "Vendez facilement sur WhatsApp et les réseaux sociaux grâce à votre catalogue automatisé.",
        url: "https://faststore.com",
        siteName: "FastStore",
        locale: "fr_FR",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "FastStore Commerce Cloud",
        description: "Votre boutique en ligne configurée en moins de 10 minutes.",
    },
};

export default function MarketingLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Barre de navigation globale */}
            <Navbar />

            {/* Contenu dynamique de la page */}
            <main className="grow">
                {children}
            </main>

            {/* Pied de page global */}
            <Footer />
        </div>
    );
}