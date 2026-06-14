// app/[shop_slug]/track/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
    Truck,
    ArrowLeft,
    MapPin,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import {CiDeliveryTruck} from "react-icons/ci";
import {AiOutlineHome} from "react-icons/ai";
import {LuBox} from "react-icons/lu";
import {MdCheck} from "react-icons/md";

interface ShopConfig {
    slug: string;
    currency: string;
    theme_style: string;
    theme_settings: {
        primary_color?: string;
    };
}

interface OrderHistoryItem {
    status: string;
    title: string;
    description: string | null;
    created_at: string;
}

interface OrderItem {
    id: string;
    product_name: string;
    product_image_url: string | null;
    quantity: number;
    unit_price: number;
}

interface OrderDetail {
    id: string;
    tracking_number: string;
    customer_name: string;
    customer_phone: string;
    delivery_notes: string | null;
    total_amount: number;
    created_at: string;
    items: OrderItem[];
    status_history: OrderHistoryItem[];
}

export default function StorefrontTrackingPage() {
    const router = useRouter();
    const { shop_slug } = useParams() as { shop_slug: string };
    const searchParams = useSearchParams();
    const tracking = searchParams.get("tracking") || "";

    const [shop, setShop] = useState<ShopConfig>();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [trackingInput, setTrackingInput] = useState(tracking);

    const homeUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || "http://localhost:3000";

    useEffect(() => {
        if (!shop_slug) return;
        setLoading(true);

        // 1. Charger la configuration de la boutique
        apiFetch<ShopConfig>(`/storefront/${shop_slug}/shop`)
            .then((shopData) => {
                if (!shopData) {
                    router.push(homeUrl);
                    return;
                }
                setShop(shopData);

                // 2. Si un numéro de suivi est fourni dans l'URL, charger les détails de la commande
                if (tracking) {
                    apiFetch<OrderDetail>(`/storefront/${shop_slug}/orders/${tracking}`)
                        .then((orderData) => {
                            setOrder(orderData);
                            setLoading(false);
                        })
                        .catch(() => {
                            setOrder(null); // Jeton invalide ou inexistant
                            setLoading(false);
                        });
                } else {
                    setOrder(null);
                    setLoading(false);
                }
            })
            .catch(() => setLoading(false));
    }, [shop_slug, tracking, router, homeUrl]);

    if (loading || !shop) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center animate-pulse">
                    <div className="w-10 h-10 border-4 border-slate-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-semibold">Chargement de votre suivi...</p>
                </div>
            </div>
        );
    }

    const formatPrice = (price: number) => {
        if (shop.currency === "XOF" || shop.currency === "XAF") return `${price.toLocaleString()} FCFA`;
        if (shop.currency === "USD") return `$${price.toLocaleString()}`;
        return `${price.toLocaleString()} ${shop.currency}`;
    };

    const handleManualSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingInput.trim()) return;
        // Redirection unifiée vers l'adresse d'URL de suivi dynamique
        router.push(`/${shop.slug}/track?tracking=${trackingInput.trim().toUpperCase()}`);
    };

    // Helper pour trouver les jalons logistiques de la base de données
    const getStatusJalon = (statusKey: string) => {
        if (!order) return null;
        return order.status_history.find(h => h.status === statusKey);
    };

    const isConfirmed = getStatusJalon("CONFIRMED") !== null || getStatusJalon("PREPARING") !== null || getStatusJalon("SHIPPED") !== null || getStatusJalon("DELIVERED") !== null;
    const isPreparing = getStatusJalon("PREPARING") !== null || getStatusJalon("SHIPPED") !== null || getStatusJalon("DELIVERED") !== null;
    const isShipped = getStatusJalon("SHIPPED") !== null || getStatusJalon("DELIVERED") !== null;
    const isDelivered = getStatusJalon("DELIVERED") !== null;

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) + ", " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    };


    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-24 text-left font-sans antialiased text-slate-800">

            {/* --- CAS 1 : RECHERCHE MANUELLE SANS CODE ACTIF (IMAGE 2 EN FRANÇAIS) --- */}
            {!order ? (
                <div className="py-16 md:py-24 max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">

                    {/* CARTE GAUCHE : FORMULAIRE DE SAISIE */}
                    <div className="md:col-span-5 bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-center h-80">
                        <h2 className="text-lg font-black text-slate-900">Suivi manuel</h2>
                        <p className="text-xs text-slate-400 font-semibold mt-2 leading-relaxed">
                            Saisissez les informations de votre commande pour obtenir une mise à jour en direct de l&#39;avancée de votre livraison.
                        </p>

                        <form onSubmit={handleManualSearch} className="mt-6 space-y-4">
                            <input
                                type="text"
                                required
                                value={trackingInput}
                                onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
                                placeholder="Numéro de commande"
                                className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-none focus:border-primary-brand transition"
                            />
                            <button
                                type="submit"
                                className="w-full py-4 rounded-xl btn-primary-brand font-black text-xs md:text-sm hover:opacity-95 transition flex items-center justify-center gap-1.5 shadow"
                            >
                                Suivre ma commande <ArrowRight />
                            </button>
                        </form>
                    </div>

                    {/* CARTE DROITE : ILLUS DE CAMION EN POINTILLÉS DE LA MAQUETTE */}
                    <div className="md:col-span-7 border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-inner h-80 bg-slate-50/50">
                        <div className="text-slate-300">
                            <Truck className="w-12 h-12 mx-auto animate-pulse" />
                        </div>
                        <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-sm mt-4">
                            Prêt à voir l&#39;avancée de votre commande ? Remplissez le formulaire à gauche pour visualiser l&#39;état d&#39;avancement de votre commande.
                        </p>
                    </div>

                </div>
            ) : (
                /* --- CAS 2 : AFFICHAGE DE LA FACTURE ET TIMELINE (IMAGE 1 EN FRANÇAIS) --- */
                <div className="max-w-3xl mx-auto px-6 mt-8 space-y-6">

                    {/* BOUTON RETOUR MAGASIN */}
                    <div className="pb-2">
                        <Link
                            href={`/${shop.slug}`}
                            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-brand transition"
                        >
                            <ArrowLeft className="w-4 h-4" /> Retourner à la boutique
                        </Link>
                    </div>

                    {/* CARTE DE TÊTE : INFOS FACTURE */}
                    <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-1.5">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Code commande</span>
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">#{order.tracking_number}</h2>
                            <p className="text-[10px] text-slate-400 font-bold">
                                Commandé le {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                        </div>
                        <span className="px-3 py-1.5 rounded-lg bg-primary-brand-light text-primary-brand text-xs font-black uppercase border border-primary-brand/10">
                         <CiDeliveryTruck /> En livraison
                        </span>
                    </div>

                    {/* LA FRISE CHRONOLOGIQUE LIVE TRACKING (CONFORME MAQUETTE) */}
                    <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-6">
                        <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">Suivi en direct</h3>

                        <div className="space-y-6 relative pl-8 border-l border-slate-200/80 ml-4 py-2">

                            {/* Jalon 1 : Reçue */}
                            <div className="relative">
                                <span className={`absolute -left-12 top-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black ${
                                    isConfirmed ? "btn-primary-brand" : "bg-slate-200"
                                }`}>
                                  <MdCheck />
                                </span>
                                <div>
                                    <h4 className="font-black text-slate-800 text-xs md:text-sm">Commande reçue</h4>
                                    {isConfirmed && (
                                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Confirmée le {formatDate(order.created_at)}</p>
                                    )}
                                </div>
                            </div>

                            {/* Jalon 2 : Préparation */}
                            <div className="relative">
                            <span className={`absolute -left-12 top-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black ${
                                isPreparing ? "btn-primary-brand" : "bg-slate-200"
                            }`}>
                              <LuBox />
                            </span>
                                <div>
                                    <h4 className="font-black text-slate-800 text-xs md:text-sm">En préparation</h4>
                                    {isPreparing && getStatusJalon("PREPARING") && (
                                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Traitée le {formatDate(getStatusJalon("PREPARING")!.created_at)}</p>
                                    )}
                                </div>
                            </div>

                            {/* Jalon 3 : Expédiée */}
                            <div className="relative">
                                <span className={`absolute -left-12 top-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black ${
                                    isShipped ? "btn-primary-brand" : "bg-slate-200"
                                }`}>
                                  <CiDeliveryTruck />
                                </span>
                                <div>
                                    <h4 className="font-black text-slate-800 text-xs md:text-sm">Expédiée</h4>
                                    {isShipped && getStatusJalon("SHIPPED") && (
                                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Expédiée par transporteur le {formatDate(getStatusJalon("SHIPPED")!.created_at)}</p>
                                    )}
                                </div>
                            </div>

                            {/* Jalon 4 : Livrée */}
                            <div className="relative">
                                <span className={`absolute -left-12 top-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black ${
                                    isDelivered ? "btn-primary-brand" : "bg-slate-200"
                                }`}>
                                  <AiOutlineHome />
                                </span>
                                <div>
                                    <h4 className="font-black text-slate-800 text-xs md:text-sm">Livrée</h4>
                                    {isDelivered && getStatusJalon("DELIVERED") && (
                                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Livrée avec succès le {formatDate(getStatusJalon("DELIVERED")!.created_at)}</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* LISTE DES ARTICLES ACHETÉS */}
                    <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-6">
                        <h3 className="text-base font-black text-slate-900">Articles commandés ({order.items.length})</h3>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 border border-slate-100 bg-slate-50">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={item.product_image_url || "/placeholder-product.png"} alt={item.product_name} className="absolute inset-0 w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-800">{item.product_name}</h4>
                                            <p className="text-[10px] text-slate-400 font-semibold mt-1">Qté : {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-slate-850">{formatPrice(item.unit_price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* LIEU DE LIVRAISON */}
                    <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <MapPin className="w-5 h-5 text-primary-brand" />
                            <h3 className="text-base font-black text-slate-900">Lieu de livraison</h3>
                        </div>
                        <div className="space-y-3 text-xs text-slate-600 font-semibold text-left">
                            <p className="text-sm font-black text-slate-800">{order.customer_name}</p>
                            <p className="leading-relaxed">{order.delivery_notes || "Aucune adresse spécifique saisie."}</p>
                            <p className="text-slate-450 font-bold">{order.customer_phone}</p>
                        </div>
                    </div>

                </div>
            )}

        </div>
    );
}