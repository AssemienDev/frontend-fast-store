// app/merchant/marketing/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useMerchantAuthStore } from "@/store/merchantAuthStore";
import { QRCodeCanvas } from "qrcode.react"; // Générateur de QR Code officiel
import { Download, Share2, Clipboard, Check, Lightbulb } from "lucide-react";
import {FaWhatsapp} from "react-icons/fa";

export default function MerchantMarketingPage() {
    const { shop, merchant } = useMerchantAuthStore();
    const [mounted, setMounted] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !merchant || !shop) return null;

    // 1. Détermination de l'URL publique de la boutique selon l'environnement (Local vs Prod)
    const getShopUrl = () => {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port ? `:${window.location.port}` : "";

        if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
            return `${protocol}//${shop.slug}.localhost${port}`;
        }
        const mainDomain = hostname.replace("marchand.", "");
        return `${protocol}//${shop.slug}.${mainDomain}`;
    };

    const shopUrl = getShopUrl();

    // 2. LOGIQUE DE TÉLÉCHARGEMENT DU QR CODE EN IMAGE PNG
    const handleDownloadQRCode = () => {
        const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
        if (!canvas) return;

        // Convertit le canvas en URL de données PNG
        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

        // Crée un lien virtuel pour forcer le téléchargement du navigateur
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${shop.slug}-qrcode.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    // 3. LOGIQUE DE COPIE DU LIEN EN UN CLIC
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shopUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Échec de copie de l'URL :", err);
        }
    };

    // 4. PARTAGER SUR WHATSAPP
    const handleShareWhatsApp = () => {
        const message = encodeURIComponent(`Découvrez ma boutique en ligne sur LinkBoutik ! Voici le lien pour commander : ${shopUrl}`);
        window.open(`https://wa.me/?text=${message}`, "_blank");
    };


    return (
        <div className="p-6 md:p-8 space-y-8 max-w-5xl w-full mx-auto">

            {/* EN-TÊTE DE LA PAGE */}
            <div className="pb-6 border-b border-slate-100">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Marketing</h1>
                <p className="text-xs font-semibold text-slate-400 mt-1">Gérez vos outils d&#39;acquisition et partagez votre boutique.</p>
            </div>

            {/* ZONE BI-COLONNE : GAUCHE (QR CODE) / DROITE (PARTAGE & CONSEILS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                {/* CARTE GAUCHE : QR CODE DYNAMIQUE DE LA BOUTIQUE (lg:col-span-5) */}
                <div className="lg:col-span-5 bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col items-center justify-between text-center min-h-[400px]">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">QR Code de la boutique</h2>
                        <p className="text-xs text-slate-400 font-semibold mt-1.5">Scannez pour commander</p>
                    </div>

                    {/* CONTENEUR DU QR CODE DE LA MAQUETTE */}
                    <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-center my-6 relative w-48 h-48 md:w-56 md:h-56 shadow-inner">
                        {/*
                          Le Canvas génère le QR Code réel pointant vers l'URL de sa boutique.
                          Nous incluons une taille adaptée pour l'export en téléchargement.
                        */}
                        <QRCodeCanvas
                            id="qr-code-canvas"
                            value={shopUrl}
                            size={200}
                            level={"H"} // Haute tolérance aux erreurs (permet d'imprimer proprement)
                            includeMargin={true}
                            imageSettings={{
                                src: shop.theme_settings.logo_url,
                                height: 40,
                                width: 40,
                                excavate: true, // crée un espace blanc derrière le logo
                            }}
                            className="rounded-lg bg-white p-2 shadow-sm border border-slate-100"
                        />
                    </div>

                    <button
                        onClick={handleDownloadQRCode}
                        type="button"
                        className="w-full py-4 rounded-xl bg-primary text-white font-extrabold text-xs md:text-sm hover:opacity-95 transition flex items-center justify-center gap-2 shadow-sm shadow-primary/10 cursor-pointer"
                    >
                        <Download className="w-4 h-4" /> Télécharger le QR Code
                    </button>
                </div>

                {/* SECTION DROITE : COPIE DE LIEN & CONSEILS D'UTILISATION (lg:col-span-7) */}
                <div className="lg:col-span-7 flex flex-col justify-between gap-6">

                    {/* S-CARD 1 : PARTAGER LE LIEN */}
                    <div className="p-6 md:p-8 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <Share2 className="w-5 h-5 text-primary" />
                            <h3 className="text-base font-black text-slate-800">Partager le lien</h3>
                        </div>

                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                            Partagez votre boutique directement avec vos clients sur les réseaux sociaux pour augmenter vos ventes.
                        </p>

                        {/* Rangée de boutons de partage */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleShareWhatsApp}
                                type="button"
                                className="flex-1 py-3 rounded-xl bg-[#22C55E]/10 hover:bg-[#22C55E]/20 text-[#22C55E] font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <FaWhatsapp /> WhatsApp
                            </button>

                            <button
                                onClick={handleCopyLink}
                                type="button"
                                className={`flex-1 py-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer border ${
                                    copied
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                                {copied ? "Copié !" : "Copier"}
                            </button>
                        </div>

                        {/* Affichage visuel du domaine de maquette */}
                        <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-center text-xs font-bold text-slate-500 tracking-wide select-all">
                            {shopUrl.replace("http://", "").replace("https://", "")}
                        </div>
                    </div>

                    {/* S-CARD 2 : CONSEILS D'UTILISATION (LÉGÈRETÉ TEXTURÉE DE MAQUETTE) */}
                    <div className="p-6 md:p-8 bg-[#FEF3C7]/20 border border-amber-200/60 rounded-3xl shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <Lightbulb className="w-5 h-5 text-[#F59E0B]" />
                            <h3 className="text-base font-black text-slate-800">Conseils d&#39;utilisation</h3>
                        </div>

                        <ul className="space-y-3.5 text-xs text-slate-500 font-semibold">
                            <li className="flex items-start gap-2.5">
                                <span className="text-[#F59E0B] font-bold text-sm shrink-0 mt-0.5">✓</span>
                                <span>Imprimez et placez-le près de votre caisse physique pour inviter les clients physiques à voir votre catalogue mobile.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="text-[#F59E0B] font-bold text-sm shrink-0 mt-0.5">✓</span>
                                <span>Ajoutez-le sur vos emballages produits ou vos cartes de visite pour fidéliser vos acheteurs après leur première commande.</span>
                            </li>
                        </ul>
                    </div>

                </div>

            </div>

        </div>
    );
}