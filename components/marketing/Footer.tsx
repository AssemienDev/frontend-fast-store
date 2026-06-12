// components/marketing/Footer.tsx
import Link from "next/link";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#EAEAEA] border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">

                {/* LOGO */}
                <div className="flex items-center">
                  <span className="text-xl font-extrabold text-[#005F56] tracking-tight">
                    LinkBoutik
                  </span>
                </div>

                {/* COPYRIGHT */}
                <div className="text-slate-500 text-xs text-center">
                    &copy; {currentYear} LinkBoutik. Tous droits réservés.
                </div>

                {/* LIENS DE LÉGISLATION */}
                <div className="flex items-center gap-6 text-xs text-slate-600 font-medium">
                    <Link href="/terms" className="hover:text-[#005F56] transition">Conditions d&#39;utilisation</Link>
                    <Link href="/privacy" className="hover:text-[#005F56] transition">Politique de confidentialité</Link>
                </div>

            </div>
        </footer>
    );
}