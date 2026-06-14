// components/themes/modern/ModernConfirmation.tsx
import { Check, ShoppingBag, FolderCheck } from "lucide-react";
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
}

interface ShopConfig {
    slug: string;
    currency: string;
}

interface ModernConfirmationProps {
    shop: ShopConfig;
    order: OrderDetail | null;
    tracking: string;
}

export default function ModernConfirmation({ shop, order, tracking }: ModernConfirmationProps) {
    const router = useRouter();

    const formatPrice = (price: number) => {
        if (shop.currency === "XOF" || shop.currency === "XAF") return `${price.toLocaleString()} FCFA`;
        if (shop.currency === "USD") return `$${price.toLocaleString()}`;
        return `${price.toLocaleString()} ${shop.currency}`;
    };

    return (
        <div className="bg-slate-50 min-h-screen flex items-center justify-center py-12 px-6 text-center">
            <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">

                {/* ROND VERT DE SÉCURITÉ DE LA MAQUETTE */}
                <div className="w-16 h-16 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto border border-teal-100">
                    <Check className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Commande Confirmée !</h1>
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-xs mx-auto">
                        Merci pour votre achat ! Nous avons bien reçu votre commande et préparons son expédition.
                    </p>
                </div>

                {/* BADGE DE NUMÉRO DE SUIVI DE COMMANDE */}
                <div className="px-4 py-2.5 bg-teal-50/60 border border-teal-100 text-primary-brand font-black text-xs rounded-full inline-block">
                    Numéro de Commande : #{tracking}
                </div>

                {/* CADRE RÉCAPITULATIF DE LA FACTURE */}
                {order && (
                    <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl text-left space-y-4">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Récapitulatif</span>

                        <div className="space-y-2 text-xs font-semibold text-slate-600 border-b border-slate-100 pb-3">
                            {order.items.map(item => (
                                <div key={item.id} className="flex justify-between">
                                    <span>{item.product_name}</span>
                                    <span className="text-slate-400">Qty: {item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-end pt-1">
                            <span className="text-[10px] text-slate-400 font-black uppercase">Total Payé</span>
                            <span className="text-base font-black text-primary-brand">{formatPrice(order.total_amount)}</span>
                        </div>
                    </div>
                )}

                {/* BOUTONS D'ACTIONS DE BAS DE FACTURE */}
                <div className="flex gap-3">
                    <button
                        onClick={() => router.push(`/${shop.slug}`)}
                        className="w-1/2 py-3.5 rounded-xl btn-primary-brand font-extrabold text-xs transition shadow cursor-pointer"
                    >
                        Retourner à la boutique
                    </button>

                    <button
                        onClick={() => router.push(`/${shop.slug}/track?tracking=${tracking}`)}
                        className="w-1/2 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition cursor-pointer"
                    >
                        Suivi de commande
                    </button>
                </div>

            </div>
        </div>
    );
}