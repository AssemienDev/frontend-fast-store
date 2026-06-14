// src/components/themes/colorful/ColorfulCancel.tsx
import { XCircle, RefreshCw, ShoppingBag } from "lucide-react";
import {useRouter, useSearchParams} from "next/navigation";
import {useState} from "react";
import {apiFetch} from "@/lib/api";

interface ShopConfig {
    slug: string;
}

interface ColorfulCancelProps {
    shop: ShopConfig;
    tracking: string;
}

export default function ColorfulCancel({ shop, tracking }: ColorfulCancelProps) {
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
        <div className="bg-[#FAF9F6] min-h-screen flex items-center justify-center px-6 text-center font-sans antialiased text-slate-800">
            <div className="max-w-md w-full bg-white border border-rose-100/50 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6 flex flex-col items-center">

                {/* BOÎTE RONDE DE SÉCURITÉ DE RETOUR EN ÉCHEC */}
                <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100/40">
                    <XCircle className="w-5 h-5 stroke-[2.5]" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl md:text-2xl font-black text-rose-600 leading-tight">
                        Échec du paiement
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-1">La transaction a été annulée ou a échoué.</p>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Votre commande <strong className="text-slate-700">#{tracking}</strong> est bien enregistrée en attente, mais l'acompte n'a pas pu être validé de manière sécurisée (vérifiez que votre solde Mobile Money est suffisant).
                </p>

                {/* ACTIONS DE NAVIGATION OVOÏDES */}
                <div className="flex gap-3 w-full">
                    <button
                        onClick={() => router.push(`/${shop.slug}/catalog`)}
                        className="w-1/2 py-3.5 rounded-full border border-slate-200 text-slate-600 font-extrabold text-xs hover:bg-slate-50 transition cursor-pointer"
                    >
                        Retour au magasin
                    </button>

                    <button
                        onClick={handleRetryPayment}
                        className="w-1/2 py-3.5 rounded-full bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow shadow-rose-900/10"
                    >
                        <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" /> Réessayer
                    </button>
                </div>

            </div>
        </div>
    );
}