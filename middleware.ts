// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get("host") || "";

    // Définir le domaine principal (à adapter en production, ex: faststore.com)
    const allowedDomains = ["localhost:3000", "faststore.com", "faststore.africa"];

    // Trouver si le hostname actuel correspond à l'un de nos domaines de base
    const mainDomain = allowedDomains.find(domain => hostname.includes(domain)) || "localhost:3000";

    // Extraire le sous-domaine (ex: "admin", "marchand", "maboutique")
    let subdomain = "";
    if (hostname !== mainDomain) {
        // CORRIGÉ : Ajout des backticks autour du remplacement
        subdomain = hostname.replace(`.${mainDomain}`, "");
    }

    // Éviter de réécrire les fichiers statiques (images, css, js) et les routes d'API internes
    if (
        url.pathname.startsWith("/_next") ||
        url.pathname.startsWith("/api") ||
        url.pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // Cas 1 : admin.faststore.com -> Redirection interne vers le dossier /admin
    if (subdomain === "admin") {
        // CORRIGÉ : Ajout des backticks pour la chaîne dynamique
        url.pathname = `/admin${url.pathname}`;
        return NextResponse.rewrite(url);
    }

    // Cas 2 : marchand.faststore.com -> Redirection interne vers le dossier /merchant
    if (subdomain === "marchand") {
        // CORRIGÉ : Ajout des backticks pour la chaîne dynamique
        url.pathname = `/merchant${url.pathname}`;
        return NextResponse.rewrite(url);
    }

    // Cas 3 : Tout autre sous-domaine (ex: maboutique.faststore.com) -> Redirection vers la boutique dynamique /[shop_slug]
    if (subdomain && subdomain !== "www") {
        // CORRIGÉ : Ajout des backticks pour la chaîne dynamique
        url.pathname = `/${subdomain}${url.pathname}`;
        return NextResponse.rewrite(url);
    }

    // Cas 4 : Pas de sous-domaine (faststore.com) -> On laisse l'accès normal au site vitrine / marketing
    return NextResponse.next();
}