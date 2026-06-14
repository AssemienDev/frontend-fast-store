// components/themes/minimalist/MinimalistCancel.tsx
import { X, RefreshCw, AlertTriangle } from "lucide-react";
import {useRouter, useSearchParams} from "next/navigation";
import {apiFetch} from "@/lib/api";
import {useState} from "react";

interface ShopConfig {
    slug: string;
}

interface MinimalistCancelProps {
    shop: ShopConfig;
    tracking: string;
}

export default function MinimalistCancel({ shop, tracking }: MinimalistCancelProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    
    const handleRetryPayment = async () => {
        if (!tracking || loading) return;
        setLoading(true);

        try {
            const res: any = await apiFetch(`/${shop.slug}/orders/${tracking}/retry-payment`, {
                method: "POST"
            });

            if (res.payment_url) {
                // Rediriger instantanément l'acheteur vers la passerelle pour sa nouvelle tentative de paiement
                window.location.href = res.payment_url;
            }
        } catch {
            alert("Impossible de relancer le paiement de cette commande pour le moment.");
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center px-6 text-center text-slate-900 font-serif">
            <div className="max-w-md w-full bg-white border border-slate-200 rounded-none p-6 md:p-8 shadow-sm space-y-6">

                {/* BOÎTE CARRÉE DE SÉCURITÉ DE RETOUR EN ÉCHEC */}
                <div className="w-14 h-14 rounded-none bg-white text-rose-600 flex items-center justify-center mx-auto border border-slate-200">
                    <X className="w-5 h-5 stroke-[1.5]" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
                        Échec du paiement
                    </h2>
                    <p className="text-[11px] text-slate-400 font-semibold font-sans mt-2 tracking-wide leading-relaxed">
                        La transaction a été annulée ou a échoué.
                    </p>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Votre commande <strong className="text-slate-700 font-bold">#{tracking}</strong> est bien enregistrée en attente, mais l&#39;acompte n&#39;a pas pu être validé. Veuillez réessayer de payer pour confirmer votre livraison.
                </p>

                {/* ACTIONS DE NAVIGATION ÉPURÉES */}
                <div className="space-y-3 pt-2">
                    <button
                        onClick={() => router.push(`/${shop.slug}/catalog`)}
                        className="w-full h-12 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-sans font-black text-[10px] uppercase tracking-widest transition flex items-center justify-center cursor-pointer"
                    >
                        Retour au magasin
                    </button>

                    <button
                        onClick={handleRetryPayment}
                        className="w-full h-12 bg-black hover:bg-slate-900 text-white font-sans font-black text-[10px] uppercase tracking-widest transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                        <RefreshCw className="w-3.5 h-3.5 stroke-[1.5]" /> Réessayer
                    </button>
                </div>

            </div>
        </div>
    );
}