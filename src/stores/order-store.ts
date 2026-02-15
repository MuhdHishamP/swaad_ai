// ============================================================
// Order Store — Zustand with localStorage persistence
// WHY: Track placed orders for confirmation page and order
// history. Separate from cart because order lifecycle is
// distinct (cart → order → delivered).
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, DeliveryAddress, Order } from "@/types";
import { generateId } from "@/lib/utils";

interface OrderState {
  orders: Order[];
  currentOrderId: string | null;

  /** Place an order from cart items + address */
  placeOrder: (items: CartItem[], total: number, address: DeliveryAddress) => string;
  /** Get a specific order by ID */
  getOrder: (orderId: string) => Order | undefined;
  /** Get the most recent order */
  getCurrentOrder: () => Order | undefined;
  /** Clear order history */
  clearOrders: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      currentOrderId: null,

      placeOrder: (items, total, address) => {
        const orderId = generateId();
        const order: Order = {
          id: orderId,
          items,
          total,
          deliveryAddress: address,
          paymentMethod: "cod",
          status: "confirmed",
          createdAt: Date.now(),
        };

        set((state) => ({
          orders: [order, ...state.orders],
          currentOrderId: orderId,
        }));

        return orderId;
      },

      getOrder: (orderId) => {
        return get().orders.find((o) => o.id === orderId);
      },

      getCurrentOrder: () => {
        const { currentOrderId, orders } = get();
        if (!currentOrderId) return undefined;
        return orders.find((o) => o.id === currentOrderId);
      },

      clearOrders: () => set({ orders: [], currentOrderId: null }),
    }),
    {
      name: "swaad-orders",
    }
  )
);
