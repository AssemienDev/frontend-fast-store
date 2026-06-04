// app/merchant/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "FastStore - Espace Marchand",
    description: "Gérez votre boutique en ligne, vos produits, vos commandes et vos clients.",
};

export default function MerchantLayout({
                                           children,
                                       }: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-[#F8FAFC] min-h-screen text-slate-800 antialiased">
            {/*
        Toutes les pages de marchand.faststore.com s'afficheront ici.
        Nous n'incluons pas le Header et le Footer du site vitrine marketing.
      */}
            {children}
        </div>
    );
}