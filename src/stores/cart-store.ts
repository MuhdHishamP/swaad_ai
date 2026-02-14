// ============================================================
// Cart Store — Zustand with localStorage persistence
// WHY: Cart state needs to survive page refreshes and navigation.
// Zustand's persist middleware handles serialization/hydration
// transparently. We store the full FoodItem reference in each
// CartItem so the cart is self-contained (no refetching needed).
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, FoodItem } from "@/types";

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;

  /** Add item or increment quantity if already in cart */
  addItem: (food: FoodItem, quantity?: number, size?: string) => void;
  /** Remove item entirely from cart */
  removeItem: (foodId: number) => void;
  /** Update quantity of specific item */
  updateQuantity: (foodId: number, quantity: number) => void;
  /** Clear all items */
  clearCart: () => void;
  /** Toggle cart drawer visibility */
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;

  /** Computed: total price */
  getTotal: () => number;
  /** Computed: total item count */
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      addItem: (food: FoodItem, quantity: number = 1, size?: string) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.food.id === food.id &&
              item.selectedSize === size
          );

          if (existingIndex >= 0) {
            // Item exists — increment quantity
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + quantity,
            };
            return { items: updated };
          }

          // Resolve unit price — use size variant price if applicable
          let unitPrice = food.price;
          if (size && food.sizeVariants) {
            const variant = food.sizeVariants.find((v) => v.size === size);
            if (variant) unitPrice = variant.price;
          }

          // New item
          const newItem: CartItem = {
            food,
            quantity,
            selectedSize: size,
            unitPrice,
          };

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (foodId: number) => {
        set((state) => ({
          items: state.items.filter((item) => item.food.id !== foodId),
        }));
      },

      updateQuantity: (foodId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(foodId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.food.id === foodId
              ? { ...item, quantity: Math.min(quantity, 10) }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      setCartOpen: (open: boolean) => set({ isCartOpen: open }),

      getTotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce(
          (count, item) => count + item.quantity,
          0
        );
      },
    }),
    {
      name: "swaad-cart",
      /**
       * WHY partial storage: We only persist `items`, not UI state
       * like `isCartOpen`. This prevents the cart drawer from
       * popping open on every page load.
       */
      partialize: (state) => ({ items: state.items }),
    }
  )
);
