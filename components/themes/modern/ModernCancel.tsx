// components/themes/modern/ModernCancel.tsx
import { XCircle, RefreshCw } from "lucide-react";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {useState} from "react";
import {apiFetch} from "@/lib/api";

interface ShopConfig {
    slug: string;
}

interface ModernCancelProps {
    shop: ShopConfig;
    tracking: string;
}

export default function ModernCancel({ shop, tracking }: ModernCancelProps) {
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
        <div className="bg-slate-50 min-h-screen flex items-center justify-center px-6 text-center">
            <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">

                <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                    <XCircle className="w-6 h-6" />
                </div>

                <div>
                    <h2 className="text-xl font-black text-slate-800">Échec du paiement</h2>
                    <p className="text-xs text-slate-400 font-semibold mt-1">La transaction a été annulée ou a échoué.</p>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Votre commande <strong className="text-slate-700">#{tracking}</strong> est enregistrée en attente, mais l&#39;acompte n&#39;a pas pu être validé. Veuillez réessayer de payer pour confirmer votre livraison.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={() => router.push(`/${shop.slug}/catalog`)}
                        className="w-1/2 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs cursor-pointer"
                    >
                        Retour au magasin
                    </button>
                    <button
                        onClick={handleRetryPayment}
                        className="w-1/2 py-3.5 rounded-xl bg-primary text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                        <RefreshCw className="w-4 h-4" /> Réessayer
                    </button>
                </div>

            </div>
        </div>
    );
}