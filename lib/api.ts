// lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface RequestOptions extends RequestInit {
    token?: string;
}

/**
 * Client d'API universel pour communiquer avec le backend FastAPI.
 */
export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, headers, ...customConfig } = options;

    const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
    };

    // Injecte automatiquement le Token JWT s'il est présent
    if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
    } else if (typeof window !== "undefined") {
        // Côté navigateur : récupère automatiquement le token dans le localStorage
        const savedToken = localStorage.getItem("faststore_token");
        if (savedToken) {
            defaultHeaders["Authorization"] = `Bearer ${savedToken}`;
        }
    }

    const config: RequestInit = {
        method: options.method || "GET",
        headers: {
            ...defaultHeaders,
            ...headers,
        },
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
                message: errorData.detail || "Une erreur est survenue lors de la communication avec le serveur.",
            };
        }

        // Gestion du cas des requêtes sans contenu en retour (ex: DELETE ou 204)
        if (response.status === 204) {
            return {} as T;
        }

        return (await response.json()) as T;
    } catch (error: any) {
        // Si l'erreur est déjà formatée
        if (error.status) throw error;

        // Erreur réseau générique
        throw {
            status: 500,
            message: "Impossible de contacter le serveur de l'application. Veuillez vérifier votre connexion.",
        };
    }
}