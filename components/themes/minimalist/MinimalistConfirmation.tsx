// components/themes/minimalist/MinimalistConfirmation.tsx
import { Check, ArrowLeft, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
}

interface OrderDetail {
    id: string;
    tracking_number: string;
    customer_name: string;
    total_amount: number;
    items: OrderItem[];
    created_at: string;
}

interface ShopConfig {
    slug: string;
    currency: string;
}

interface MinimalistConfirmationProps {
    shop: ShopConfig;
    order: OrderDetail | null;
    tracking: string;
}

export default function MinimalistConfirmation({ shop, order, tracking }: MinimalistConfirmationProps) {
    const router = useRouter();

    const formatPrice = (price: number) => {
        if (shop.currency === "XOF" || shop.currency === "XAF") return `${price.toLocaleString()} FCFA`;
        if (shop.currency === "USD") return `$${price.toLocaleString()}`;
        return `${price.toLocaleString()} ${shop.currency}`;
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center py-16 px-6 text-center text-slate-900 font-serif">
            <div className="max-w-md w-full bg-white border border-slate-200 rounded-none p-6 md:p-8 shadow-sm space-y-6">

                {/* BOÎTE CARRÉE DE SÉCURITÉ ULTRA-FINE DE LA MAQUETTE */}
                <div className="w-14 h-14 rounded-none bg-white text-slate-800 flex items-center justify-center mx-auto border border-slate-200">
                    <Check className="w-5 h-5 stroke-[1.5]" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
                        Merci pour votre commande
                    </h1>
                    <p className="text-[11px] text-slate-400 font-semibold font-sans mt-2 tracking-wide leading-relaxed">
                        Votre paiement a été validé avec succès.
                    </p>
                </div>

                {/* FACTURE RECTANGULAIRE COMPTABLE DE MAQUETTE */}
                <div className="border border-slate-200 bg-slate-50/30 rounded-none p-6 text-xs font-semibold text-slate-500 text-left space-y-4 font-sans">
                    <div className="flex justify-between items-baseline">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400">Identifiant d'achat</span>
                        <span className="text-slate-800 font-black font-mono select-all">#{tracking}</span>
                    </div>

                    <div className="flex justify-between items-baseline border-t border-slate-100 pt-3">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400">Date</span>
                        <span className="text-slate-800 font-bold">
              {order ? new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "Aujourd'hui"}
            </span>
                    </div>

                    <div className="flex justify-between items-end border-t border-slate-100 pt-3 font-serif">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-sans">Total</span>
                        <span className="text-lg font-black text-slate-900">
              {order ? formatPrice(order.total_amount) : "0 €"}
            </span>
                    </div>
                </div>

                {/* ACTIONS DE BAS DE FACTURE COMPLÈTES (BOUTONS RECTANGULAIRES NOIRS SANS BORDS) */}
                <div className="space-y-3 pt-2">
                    <button
                        onClick={() => router.push(`/${shop.slug}`)}
                        className="w-full h-12 bg-black hover:bg-slate-900 text-white font-sans font-black text-[10px] uppercase tracking-widest transition flex items-center justify-center cursor-pointer shadow-sm"
                    >
                        Retourner au magasin
                    </button>

                    <button
                        onClick={() => router.push(`/${shop.slug}/track?tracking=${tracking}`)}
                        className="w-full h-12 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-sans font-black text-[10px] uppercase tracking-widest transition flex items-center justify-center cursor-pointer"
                    >
                        Suivi de commande
                    </button>
                </div>

            </div>
        </div>
    );
}