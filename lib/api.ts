// src/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface RequestOptions extends RequestInit {
    token?: string;
}

/**
 * Client d'API universel pour communiquer avec le backend FastAPI (LinkBoutik).
 * Détecte intelligemment et injecte automatiquement le bon Token selon l'endpoint d'API ciblé.
 */
export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, headers, ...customConfig } = options;

    const defaultHeaders: Record<string, string> = {
        "Content-Type": "application/json",
    };

    // INJECTION AUTOMATIQUE DU TOKEN BASÉE SUR LE CHEMIN DE L'API APPELÉE
    if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
    } else if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;

        // 1. Détecter si la requête cible l'API d'Administration (/admin)
        const isAdminApi = endpoint.startsWith("/admin");

        // 2. Détecter si la requête cible l'API Marchande (/merchant ou /auth)
        const isMerchantApi = endpoint.startsWith("/merchant") || endpoint.startsWith("/auth");

        if (isAdminApi) {
            const adminToken = localStorage.getItem("linkboutik_admin_token");
            if (adminToken) {
                defaultHeaders["Authorization"] = `Bearer ${adminToken}`;
            }
        }
        else if (isMerchantApi) {
            const merchantToken = localStorage.getItem("linkboutik_merchant_token");
            if (merchantToken) {
                defaultHeaders["Authorization"] = `Bearer ${merchantToken}`;
            }
        }
    }

    // FUSION SÉCURISÉE DES HEADERS (Garantit que le Token n'est jamais jeté)
    const finalHeaders = {
        ...defaultHeaders,
        ...(headers as Record<string, string> || {}),
    };

    // SÉCURITÉ FORM DATA : Pour les uploads de fichiers, on supprime impérativement
    // le "Content-Type" pour laisser le navigateur l'injecter automatiquement avec la clé boundary
    if (customConfig.body instanceof FormData) {
        delete finalHeaders["Content-Type"];
    }

    const config: RequestInit = {
        method: options.method || "GET",
        headers: finalHeaders,
        ...customConfig,
    };

    // Permet de gérer les chemins relatifs ou absolus
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, config);

        // Si la requête échoue (statut hors 2xx)
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            throw {
                status: response.status,
                message:
                    Array.isArray(errorData.detail)
                        ? errorData.detail[0]?.msg
                        : errorData.detail || errorData.message || "Erreur serveur",
                errors: errorData.detail || null,
            };
        }

        // Gestion du cas des requêtes sans contenu en retour (ex: DELETE ou 204)
        if (response.status === 204) {
            return {} as T;
        }

        return (await response.json()) as T;
    } catch (error: any) {
        if (error.status) throw error;
        throw {
            status: 500,
            message: "Impossible de contacter le serveur de l'application. Veuillez vérifier votre connexion.",
        };
    }
}