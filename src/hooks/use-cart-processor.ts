"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/stores/cart-store";
import type { Message } from "@/types";

/**
 * Hook to process cart actions embedded in AI messages.
 * DETACHES logic from the view layer (ChatContainer).
 */
export function useCartProcessor(messages: Message[]) {
  const addToCart = useCartStore((s) => s.addItem);
  const removeFromCart = useCartStore((s) => s.removeItem);
  
  // Track which messages we've already processed for cart actions
  // to avoid duplicate additions on re-renders
  const processedCartActions = useRef<Set<string>>(new Set());

  useEffect(() => {
    for (const message of messages) {
      if (
        message.role === "assistant" &&
        message.blocks &&
        !processedCartActions.current.has(message.id)
      ) {
        let hasCartAction = false;
        for (const block of message.blocks) {
          if (block.type === "cart_action") {
            hasCartAction = true;
            if (block.action === "add" && block.foodItem) {
              addToCart(block.foodItem, block.quantity || 1);
            } else if (block.action === "remove" && block.foodId) {
              removeFromCart(block.foodId);
            }
          }
        }
        if (hasCartAction) {
          processedCartActions.current.add(message.id);
        }
      }
    }
  }, [messages, addToCart, removeFromCart]);
}
