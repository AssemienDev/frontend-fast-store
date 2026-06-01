// components/marketing/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";


export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname(); // Récupère le chemin actuel (ex: "/", "/blog", etc.)

    // Fonction utilitaire pour vérifier si le lien est actif
    const isActive = (path: string) => pathname === path;

    // Détermine dynamiquement l'URL de l'espace marchand selon l'environnement
    const merchantUrl =
        process.env.NEXT_PUBLIC_MERCHANT_URL || "http://marchand.localhost:3000";

    return (
        <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                {/* LOGO & MENU BURGER MOBILE */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-slate-700 lg:hidden focus:outline-none"
                        aria-label="Toggle Menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>

                    <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-[#005F56] tracking-tight">
              FastStore
            </span>
                    </Link>
                </div>

                {/* LIENS DE NAVIGATION (DESKTOP) */}
                <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
                    <Link href="/" className={`transition ${isActive("/") ? "text-primary font-bold" : "text-slate-600 hover:text-primary"}`}>Accueil</Link>
                    <Link href="/tarifs" className={`transition ${isActive("/tarifs") ? "text-primary font-bold" : "text-slate-600 hover:text-primary"}`}>Pricing</Link>
                    <Link href="/faq" className={`transition ${isActive("/faq") ? "text-primary font-bold" : "text-slate-600 hover:text-primary"}`}>FAQ</Link>
                    <Link href="/blog" className={`transition ${isActive("/blog") ? "text-primary font-bold" : "text-slate-600 hover:text-primary"}`}>Blog</Link>
                    <Link href="/about" className={`transition ${isActive("/about") ? "text-primary font-bold" : "text-slate-600 hover:text-primary"}`}>A propos</Link>
                    <Link href="/contact" className={`transition ${isActive("/contact") ? "text-primary font-bold" : "text-slate-600 hover:text-primary"}`}>Contact</Link>
                </div>

                {/* BOUTON CONNEXION */}
                <div className="flex items-center">
                    <a
                        href={merchantUrl}
                        className="bg-[#005F56] hover:bg-[#004d45] text-white px-6 py-2.5 rounded-lg text-sm font-bold tracking-wide transition shadow-sm"
                    >
                        Connexion
                    </a>
                </div>
            </div>

            {/* MENU MOBILE DÉROULANT */}
            {isOpen && (
                <div className="lg:hidden bg-white border-b border-slate-100 px-6 py-4 space-y-3 flex flex-col text-sm font-medium text-slate-600">
                    <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-[#005F56] py-2 border-b border-slate-50">Accueil</Link>
                    <Link href="/tarifs" onClick={() => setIsOpen(false)} className="hover:text-[#005F56] py-2 border-b border-slate-50">Pricing</Link>
                    <Link href="/faq" onClick={() => setIsOpen(false)} className="hover:text-[#005F56] py-2 border-b border-slate-50">FAQ</Link>
                    <Link href="/blog" onClick={() => setIsOpen(false)} className="hover:text-[#005F56] py-2 border-b border-slate-50">Blog</Link>
                    <Link href="/about" onClick={() => setIsOpen(false)} className="hover:text-[#005F56] py-2 border-b border-slate-50">A propos</Link>
                    <Link href="/contact" onClick={() => setIsOpen(false)} className="hover:text-[#005F56] py-2">Contact</Link>
                </div>
            )}
        </nav>
    );
}