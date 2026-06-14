// components/themes/colorful/ColorfulConfirmation.tsx
import { Check, Store, MapPin, PartyPopper } from "lucide-react";
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
    delivery_notes: string | null;
    items: OrderItem[];
}

interface ShopConfig {
    slug: string;
    currency: string;
}

interface ColorfulConfirmationProps {
    shop: ShopConfig;
    order: OrderDetail | null;
    tracking: string;
}

export default function ColorfulConfirmation({ shop, order, tracking }: ColorfulConfirmationProps) {
    const router = useRouter();

    return (
        <div className="bg-[#FAF9F6] min-h-screen flex items-center justify-center py-12 px-6 text-center font-sans antialiased text-slate-800">
            <div className="max-w-md w-full bg-white border border-rose-100/50 rounded-[2rem] p-6 md:p-8 shadow-md space-y-6 flex flex-col items-center">

                {/* LE ROND DE FÊTE DE CÉLÉBRATION DE LA MAQUETTE */}
                <div className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center mx-auto shadow-sm">
                    <PartyPopper className="w-6 h-6 animate-bounce" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-black text-rose-600 leading-tight">
                        C'est dans la boîte !
                    </h1>
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-xs mx-auto">
                        Ta commande <span className="font-bold text-slate-600">#{tracking}</span> a bien été confirmée. <br />
                        Prépare-toi à déballer du lourd très bientôt.
                    </p>
                </div>

                {/* LE RECAPITULATIF DE LIVRAISON CYAN FLUO DE VOTRE MAQUETTE */}
                <div className="w-full p-5 bg-[#22D3EE] text-slate-900 rounded-[1.5rem] text-left flex items-start gap-3 shadow-inner">
                    <div className="w-8 h-8 rounded-full bg-white/10 text-slate-900 flex items-center justify-center shrink-0">
                        <MapPin className="w-4.5 h-4.5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider block">Adresse</span>
                        <p className="text-xs font-bold mt-1.5 leading-relaxed">
                            {order ? order.delivery_notes || "Cocody Riviera 3, Abidjan" : "123 Rue de la Fusée, 75011 Paris, France"}
                        </p>
                    </div>
                </div>

                {/* BOUTON D'ACTION GÉLULE RETOUR BOUTIQUE */}
                <button
                    onClick={() => router.push(`/${shop.slug}`)}
                    className="px-8 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-rose-900/10 cursor-pointer w-auto"
                >
                    <Store className="w-4 h-4" /> Retour à la boutique
                </button>

            </div>
        </div>
    );
}