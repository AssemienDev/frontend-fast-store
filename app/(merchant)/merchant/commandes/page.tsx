// app/merchant/orders/page.tsx
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useMerchantAuthStore } from "@/store/merchantAuthStore";
import {
    Download, Plus, Search, Calendar, ChevronDown,
    ShoppingBag, Users, FolderPlus, Lock, ShieldAlert
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
    id: string;
    tracking_number: string;
    customer_name: string;
    customer_phone: string;
    current_status: string;
    payment_status: string;
    total_amount: number;
    created_at: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    stock_quantity: number;
}

interface Customer {
    id: string;
    full_name: string;
    phone_number: string;
}

interface DashboardPeriodStats {
    total_sales: number;
    orders_count: number;
    average_cart: number;
    delivered_pct: number;
    processing_pct: number;
    cancelled_pct: number;
}

export default function MerchantOrdersPage() {
    const router = useRouter();
    const { shop } = useMerchantAuthStore();

    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    const [activeTab, setActiveTab] = useState("Toutes");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(false); // Gère la modale d'upgrade du CSV

    // États pour les calculs de période dynamiques
    const [stats, setStats] = useState<DashboardPeriodStats | null>(null);

    // États pour la création manuelle
    const [isCreateOpen, setIsAddOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [newCustomerForm, setNewCustomerForm] = useState({ name: "", phone: "", email: "" });

    const [selectedItems, setSelectedItems] = useState<{ product_id: string; quantity: number }[]>([{ product_id: "", quantity: 1 }]);
    const [orderStatus, setOrderStatus] = useState("PENDING");
    const [paymentStatus, setPaymentStatus] = useState("UNPAID");
    const [deliveryNotes, setDeliveryNotes] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");


    const loadData = async () => {
        setLoading(true);
        try {
            const [ordersData, statsData, prodsData, custsData, subData] = await Promise.all([
                apiFetch<Order[]>(`/merchant/orders?status=${activeTab}&q=${search}`),
                apiFetch<DashboardPeriodStats>("/merchant/orders/stats"),
                apiFetch<Product[]>("/merchant/products"),
                apiFetch<Customer[]>("/merchant/customers").catch(() => []),
                apiFetch<any>("/merchant/subscription")
            ]);

            setOrders(ordersData);
            setStats(statsData);
            setProducts(prodsData);
            setCustomers(custsData);
            setIsPremium(
                subData.plan_name?.toUpperCase() !== "STARTER"
            );
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, search]);

    const handleExportCSV = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/merchant/orders/export`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("linkboutik_merchant_token")}`
                }
            });

            if (!response.ok) throw new Error();

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `export-ventes-${shop?.slug || "boutique"}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (err) {
            alert("Une erreur est survenue lors de l'exportation.");
        }
    };

    const handleCreateManualOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const validItems = selectedItems.filter(item => item.product_id !== "");
        if (validItems.length === 0) {
            alert("Veuillez ajouter au moins un produit.");
            setSubmitting(false);
            return;
        }

        try {
            const payload = {
                customer_id: isNewCustomer ? null : selectedCustomerId,
                new_customer: isNewCustomer ? {
                    full_name: newCustomerForm.name,
                    phone_number: newCustomerForm.phone,
                    email: newCustomerForm.email || null,
                } : null,
                items: validItems,
                delivery_address: deliveryAddress || null,
                delivery_notes: deliveryNotes || null,
                current_status: orderStatus,
                payment_status: paymentStatus
            };

            await apiFetch("/merchant/orders/manual", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            setIsAddOpen(false);
            loadData();
            setDeliveryAddress("");
        } catch (err: any) {
            alert(err.message || "Impossible d'enregistrer la commande.");
        } finally {
            setSubmitting(false);
        }
    };

    const addProductRow = () => {
        setSelectedItems([...selectedItems, { product_id: "", quantity: 1 }]);
    };

    const removeProductRow = (index: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: "product_id" | "quantity", value: string | number) => {
        const updated = [...selectedItems];

        if (field === "product_id") {
            // Si on modifie le produit, on s'assure d'assigner une chaîne (string)
            updated[index].product_id = String(value);
        } else if (field === "quantity") {
            // Si on modifie la quantité, on s'assure d'assigner un entier (number)
            updated[index].quantity = Number(value);
        }

        setSelectedItems(updated);
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-6xl w-full mx-auto relative">

            {/* HEADER PRINCIPAL */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Historique des commandes</h1>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Vue simplifiée de toutes les commandes de la boutique.</p>
                </div>
                { isPremium && (
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="px-5 py-3 rounded-xl bg-primary text-white font-extrabold text-xs hover:opacity-95 transition flex items-center justify-center gap-2 shadow-md shadow-teal-900/10 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Nouvelle Commande
                    </button>
                )}
            </div>

            {/* BANDEAU FINANCIER D'ÉLITE */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#0F766E] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg shadow-teal-900/10">
                <div>
                    <span className="text-[10px] text-teal-200 font-extrabold uppercase tracking-wider">Total des ventes sur la période</span>
                    <h2 className="text-3xl md:text-4xl font-black mt-2 tracking-tight">{(stats?.total_sales || 0).toLocaleString()} FCFA</h2>
                </div>
                <div className="flex gap-4">
                    <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-800/60 text-center min-w-[100px]">
                        <span className="text-[9px] text-teal-200 font-bold uppercase tracking-wider block">Commandes</span>
                        <span className="text-lg font-black block mt-1">{stats?.orders_count || 0}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-800/60 text-center min-w-[100px]">
                        <span className="text-[9px] text-teal-200 font-bold uppercase tracking-wider block">Panier Moyen</span>
                        <span className="text-lg font-black block mt-1">{Math.round(stats?.average_cart || 0).toLocaleString()} F</span>
                    </div>
                </div>
            </div>

            {/* GRILLE D'HISTORIQUE DE TRAVAIL (CORRIGÉE PIXEL-PERFECT) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* COLONNE GAUCHE (CONTIENT LES FILTRES ET LE TABLEAU DES COMMANDES DANS LE MÊME BLOC) */}
                <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">

                        {/* Recherche */}
                        <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher..."
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs focus:outline-none focus:border-primary transition"
                            />
                        </div>

                        {/* Onglets filtres */}
                        <div className="flex flex-wrap gap-1">
                            {["Toutes", "PENDING", "PAID", "DELIVERED", "CANCELLED"].map((tab) => {
                                const labelMap: Record<string, string> = { Toutes: "Toutes", PENDING: "En attente", PAID: "Payé", DELIVERED: "Livré", CANCELLED: "Annulé" };
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                                            activeTab === tab ? "bg-slate-100 text-slate-800 font-black" : "text-slate-400 hover:bg-slate-50"
                                        }`}
                                    >
                                        {labelMap[tab] || tab}
                                    </button>
                                );
                            })}
                        </div>

                    </div>

                    {/* Rendu des cartes de commandes de maquette */}
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-slate-50 border rounded-2xl" />
                            ))}
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="space-y-3">
                            {orders.map((cmd) => {
                                const isDelivered = cmd.current_status === "DELIVERED";
                                const isCancelled = cmd.current_status === "CANCELLED";
                                const isPaid = cmd.payment_status === "PAID";
                                return (
                                    <Link href={`/commandes/details/${cmd.id}`}
                                        key={cmd.id}
                                        className="p-4 border border-slate-200/50 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition"
                                    >
                                        <div className="flex items-center gap-4">
                                          <span className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-black text-xs flex items-center justify-center shrink-0">
                                            {cmd.customer_name.charAt(0).toUpperCase()}
                                          </span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-xs font-black text-slate-800">{cmd.tracking_number}</h4>
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                                        isDelivered ? "bg-emerald-50 text-emerald-700" : isCancelled ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                                                    }`}>
                                                    {cmd.current_status === "DELIVERED" ? "LIVRÉ" : cmd.current_status === "CANCELLED" ? "ANNULÉ" : "EN COURS"}
                                                  </span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                                    {cmd.customer_name} • {new Date(cmd.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="text-xs font-black text-slate-800">{cmd.total_amount.toLocaleString()} F</p>
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black ${
                                                isPaid ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                                            }`}>
                                                {isPaid ? "PAYÉ" : "NON PAYÉ"}
                                              </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-slate-400 text-xs py-8">Aucune commande trouvée dans cet onglet.</p>
                    )}
                </div>

                {/* COLONNE DROITE : STATISTIQUES & EXPORT CSV (lg:col-span-4) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* RÉPARTITION DYNAMIQUE DE MAQUETTE PAR STATUT (SANS DONNÉE EN DUR !) */}
                    <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Répartition par statut</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                                    <span>Livrées</span>
                                    <span>{stats ? stats.delivered_pct : 0}%</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div className="h-full bg-tertiary rounded-full transition-all duration-300" style={{ width: `${stats ? stats.delivered_pct : 0}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                                    <span>En cours</span>
                                    <span>{stats ? stats.processing_pct : 0}%</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div className="h-full bg-secondary rounded-full transition-all duration-300" style={{ width: `${stats ? stats.processing_pct : 0}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                                    <span>Annulées</span>
                                    <span>{stats ? stats.cancelled_pct : 0}%</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div className="h-full bg-rose-500 rounded-full transition-all duration-300" style={{ width: `${stats ? stats.cancelled_pct : 0}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* EXPORT COMPTABLE */}
                    <div className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm text-center space-y-5">
                        <div className="w-12 h-12 rounded-full bg-teal-50 text-primary flex items-center justify-center mx-auto">
                            <Download className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-slate-800">Exporter l&#39;historique</h4>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1.5 leading-relaxed">
                                Téléchargez un rapport CSV détaillé pour votre comptabilité analytique.
                            </p>
                        </div>
                        { isPremium ? (<button
                            onClick={handleExportCSV}
                            type="button"
                            className="w-full py-3.5 rounded-xl bg-primary text-white font-extrabold text-xs hover:opacity-95 transition cursor-pointer shadow-sm"
                        >
                            Générer CSV
                        </button>) : (
                            <button
                                type="button"
                                onClick={() => router.push("/billing")}
                                className="w-full cursor-pointer py-3 rounded-xl bg-[#F59E0B] text-white font-extrabold text-xs flex items-center justify-center gap-1.5"
                            >
                                <ShieldAlert className="w-4 h-4" /> S&#39;abonner
                            </button>
                        )}
                    </div>

                </div>

            </div>

            {/* ========================================================= */}
            {/* MODALE : CRÉER UNE COMMANDE MANUELLE (CRM & INVENTAIRE) */}
            {/* ========================================================= */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-md w-full text-left space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">

                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                            <ShoppingBag className="w-5 h-5 text-primary" />
                            <h3 className="text-sm font-black text-slate-900">Nouvelle commande manuelle</h3>
                        </div>

                        <form onSubmit={handleCreateManualOrder} className="space-y-4">

                            {/* ÉTAPE A : GESTION CLIENT */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Client de la vente</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsNewCustomer(!isNewCustomer)}
                                        className="text-[10px] font-black text-primary hover:underline"
                                    >
                                        {isNewCustomer ? "← Choisir client existant" : "+ Créer nouveau client à la volée"}
                                    </button>
                                </div>

                                {isNewCustomer ? (
                                    <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl space-y-3">
                                        <input
                                            type="text" required placeholder="Nom complet du client"
                                            value={newCustomerForm.name}
                                            onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                                        />
                                        <input
                                            type="tel" required placeholder="Numéro de téléphone(whatsapp)"
                                            value={newCustomerForm.phone}
                                            onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                                        />
                                    </div>
                                ) : (
                                    <select
                                        required
                                        value={selectedCustomerId}
                                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                    >
                                        <option value="">Sélectionner un client du CRM</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.phone_number})</option>)}
                                    </select>
                                )}
                            </div>

                            {/* ÉTAPE B : ASSIGNATION DES PRODUITS MULTIPLES */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Produits vendus</span>

                                {selectedItems.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <select
                                            required
                                            value={item.product_id}
                                            onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                                            className="w-2/3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                        >
                                            <option value="">Choisir produit</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.price.toLocaleString()} F)</option>)}
                                        </select>
                                        <input
                                            type="number" required min={1}
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                                            className="w-1/6 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center"
                                        />
                                        {selectedItems.length > 1 && (
                                            <button
                                                type="button" onClick={() => removeProductRow(index)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <button
                                    type="button" onClick={addProductRow}
                                    className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                    + Ajouter un produit
                                </button>
                            </div>

                            {/* ÉTAPE C : STATUT DE COMMANDE */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Statut Commande</label>
                                    <select
                                        value={orderStatus}
                                        onChange={(e) => setOrderStatus(e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                    >
                                        <option value="PENDING">En attente</option>
                                        <option value="CONFIRMED">Payé & Expédié</option>
                                        <option value="DELIVERED">Livré</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Statut Paiement</label>
                                    <select
                                        value={paymentStatus}
                                        onChange={(e) => setPaymentStatus(e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                    >
                                        <option value="UNPAID">Non payé (À livrer)</option>
                                        <option value="PAID">Payé</option>
                                    </select>
                                </div>
                            </div>

                            {/*  ADRESSE DE LIVRAISON DE COMMANDE */}
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Adresse de livraison</label>
                                <input
                                    type="text"
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    placeholder="Ex: Cocody Riviera 3, Villa 14"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Instructions / Note de livraison</label>
                                <input
                                    type="text"
                                    value={deliveryNotes}
                                    onChange={(e) => setDeliveryNotes(e.target.value)}
                                    placeholder="Ex: Livraison à Cocody ce soir"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                />
                            </div>

                            {/* BOUTONS DE SOUMISSION */}
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="w-1/2 py-3 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs">Annuler</button>
                                <button type="submit" disabled={submitting} className="w-1/2 py-3 rounded-xl bg-primary text-white font-extrabold text-xs flex items-center justify-center cursor-pointer">
                                    {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Enregistrer"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}


        </div>
    );
}