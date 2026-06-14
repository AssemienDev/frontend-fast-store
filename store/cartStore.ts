// src/store/cartStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
    id: string;             // ID du produit
    name: string;
    price: number;
    image_url: string | null;
    quantity: number;
    selected_taille?: string;
    selected_couleur?: string;
}

interface CartState {
    cartItems: CartItem[];
    shopSlug: string | null; // Pour isoler le panier de manière étanche par boutique

    // Actions
    addItem: (item: Omit<CartItem, "quantity">, shopSlug: string) => void;
    removeItem: (itemId: string, selectedTaille?: string, selectedCouleur?: string) => void;
    updateQuantity: (itemId: string, quantity: number, selectedTaille?: string, selectedCouleur?: string) => void;
    clearCart: () => void;

    // Getters (Sélecteurs de calculs d'états)
    getTotalItems: () => number;
    getTotalAmount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cartItems: [],
            shopSlug: null,

            addItem: (item, shopSlug) => {
                const currentItems = get().cartItems;
                const currentShop = get().shopSlug;

                // ÉTAPE DE SÉCURITÉ SAAS : Si l'acheteur change de boutique, on vide le panier de la précédente boutique
                let itemsToProcess = currentItems;
                if (currentShop && currentShop !== shopSlug) {
                    itemsToProcess = [];
                }

                // Vérifie si le produit avec les mêmes variantes existe déjà
                const existingItemIndex = itemsToProcess.findIndex(
                    (i) =>
                        i.id === item.id &&
                        i.selected_taille === item.selected_taille &&
                        i.selected_couleur === item.selected_couleur
                );

                if (existingItemIndex > -1) {
                    // Si oui, on incrémente simplement la quantité de 1
                    const updatedItems = [...itemsToProcess];
                    updatedItems[existingItemIndex].quantity += 1;
                    set({ cartItems: updatedItems, shopSlug });
                } else {
                    // Sinon, on ajoute le nouvel élément
                    set({
                        cartItems: [...itemsToProcess, { ...item, quantity: 1 }],
                        shopSlug,
                    });
                }
            },

            removeItem: (itemId, selectedTaille, selectedCouleur) => {
                set((state) => ({
                    cartItems: state.cartItems.filter(
                        (item) =>
                            !(
                                item.id === itemId &&
                                item.selected_taille === selectedTaille &&
                                item.selected_couleur === selectedCouleur
                            )
                    ),
                }));
            },

            updateQuantity: (itemId, quantity, selectedTaille, selectedCouleur) => {
                if (quantity <= 0) {
                    get().removeItem(itemId, selectedTaille, selectedCouleur);
                    return;
                }

                set((state) => ({
                    cartItems: state.cartItems.map((item) =>
                        item.id === itemId &&
                        item.selected_taille === selectedTaille &&
                        item.selected_couleur === selectedCouleur
                            ? { ...item, quantity }
                            : item
                    ),
                }));
            },

            clearCart: () => {
                set({ cartItems: [], shopSlug: null });
            },

            // Fonctions de calcul en direct
            getTotalItems: () => {
                return get().cartItems.reduce((acc, item) => acc + item.quantity, 0);
            },

            getTotalAmount: () => {
                return get().cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
            },
        }),
        {
            name: "linkboutik_cart_storage", // Clé d'alignement officielle LinkBoutik
            storage: createJSONStorage(() => localStorage),
        }
    )
);