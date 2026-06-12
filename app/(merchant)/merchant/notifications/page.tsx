// app/merchant/notifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Bell, ShoppingBag, CreditCard, AlertCircle, CheckCircle, MailOpen, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: string; // "ORDER" | "FINANCE" | "SYSTEM"
    is_read: boolean;
    created_at: string;
}

export default function MerchantNotificationFeedPage() {
    const router = useRouter();

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await apiFetch<NotificationItem[]>("/merchant/notifications/feed");
            setNotifications(data);
        } catch (err) {
            console.error("Échec chargement des notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    // Action : Marquer une notification spécifique comme lue
    const handleMarkAsRead = async (id: string) => {
        try {
            await apiFetch(`/merchant/notifications/${id}/read`, { method: "PATCH" });
            // Mettre à jour l'état local
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    // Action : Tout marquer comme lu d'un coup
    const handleMarkAllAsRead = async () => {
        try {
            await apiFetch("/merchant/notifications/read-all", { method: "POST" });
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type: string) => {
        if (type === "ORDER") return <ShoppingBag className="w-5 h-5 text-primary" />;
        if (type === "FINANCE") return <CreditCard className="w-5 h-5 text-secondary" />;
        return <AlertCircle className="w-5 h-5 text-slate-500" />;
    };

    const getIconBackground = (type: string) => {
        if (type === "ORDER") return "bg-teal-50";
        if (type === "FINANCE") return "bg-amber-50";
        return "bg-slate-100";
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen py-2 md:py-8">
            <div className="max-w-lg mx-auto space-y-8">

                {/* EN-TÊTE DE LA PAGE */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-slate-200/50">
                    <div className="flex items-center gap-3">
                        <div className="text-left">
                            <h1 className="text-xl md:text-2xl font-black text-slate-900">Notifications</h1>
                            <p className="text-xs text-slate-400 font-semibold mt-1">Consultez et gérez vos alertes d'activité récentes.</p>
                        </div>
                    </div>

                    {/* Bouton de nettoyage rapide */}
                    {notifications.filter(n => !n.is_read).length > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
                        >
                            <MailOpen className="w-4 h-4" /> Tout marquer comme lu
                        </button>
                    )}
                </div>

                {/* LISTE DU FIL D'ACTUALITÉ */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 border rounded-2xl animate-pulse" />)}
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => { if (!notif.is_read) handleMarkAsRead(notif.id); }}
                                className={`p-4 border rounded-2xl flex items-start justify-between gap-4 transition-all duration-150 cursor-pointer ${
                                    notif.is_read
                                        ? "bg-white border-slate-200/50 opacity-70"
                                        : "bg-white border-primary border-2 shadow-sm shadow-primary/5"
                                }`}
                            >
                                <div className="flex items-start gap-4 text-left">
                                    {/* Icône de catégorie colorée */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getIconBackground(notif.type)}`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div>
                                        <h4 className="text-xs md:text-sm font-black text-slate-800 leading-snug">{notif.title}</h4>
                                        <p className="text-[10px] md:text-xs text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                                        <p className="text-[9px] text-slate-400 font-semibold mt-2">
                                            Le {new Date(notif.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                </div>

                                {/* Bulle d'état de non-lecture */}
                                {!notif.is_read && (
                                    <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-2" title="Non lu" />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 p-8 border border-dashed border-slate-200 rounded-2xl bg-white max-w-sm mx-auto">
                        <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium text-sm">Votre fil de notifications est vide.</p>
                    </div>
                )}

            </div>
        </div>
    );
}