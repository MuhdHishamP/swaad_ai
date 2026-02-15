"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cart-store";
import type { Message } from "@/types";

/**
 * Module-level set — survives component remounts.
 * WHY: When useRef was used, navigating away (e.g., checkout → home)
 * would reset the ref, causing old cart_action blocks to be
 * re-processed and items to reappear in the cart after clearing.
 */
const processedCartActions = new Set<string>();

/**
 * Hook to process cart actions embedded in AI messages.
 * DETACHES logic from the view layer (ChatContainer).
 */
export function useCartProcessor(messages: Message[]) {
  const addToCart = useCartStore((s) => s.addItem);
  const removeFromCart = useCartStore((s) => s.removeItem);

  useEffect(() => {
    for (const message of messages) {
      if (
        message.role === "assistant" &&
        message.blocks &&
        !processedCartActions.has(message.id)
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
          processedCartActions.add(message.id);
        }
      }
    }
  }, [messages, addToCart, removeFromCart]);
}
