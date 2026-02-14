"use client";

import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types";
import { ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CartSummaryProps {
  items: CartItem[];
  total: number;
}

/**
 * Cart Summary — inline chat component.
 * WHY: Shows a compact cart overview within the chat flow
 * so users don't need to open the cart drawer to see what
 * they've ordered. Includes a checkout CTA.
 */
export function CartSummaryCard({ items, total }: CartSummaryProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] p-4 text-sm text-[var(--foreground-secondary)]">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span>Your cart is empty. Ask me to recommend something!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--background-tertiary)] px-4 py-2.5">
        <ShoppingCart className="h-4 w-4 text-[var(--primary)]" />
        <span className="text-sm font-semibold text-[var(--foreground)]">
          Your Cart ({items.length} {items.length === 1 ? "item" : "items"})
        </span>
      </div>

      {/* Items */}
      <div className="divide-y divide-[var(--border)]">
        {items.map((item) => (
          <div
            key={item.food.id}
            className="flex items-center justify-between px-4 py-2.5"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--foreground-muted)]">
                {item.quantity}x
              </span>
              <span className="text-sm text-[var(--foreground)]">
                {item.food.name}
              </span>
            </div>
            <span className="text-sm font-medium text-[var(--foreground)]">
              {formatPrice(item.unitPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Total + Checkout CTA */}
      <div className="border-t border-[var(--border)] bg-[var(--background-tertiary)] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-[var(--foreground)]">
            Total
          </span>
          <span className="text-base font-bold text-[var(--primary)]">
            {formatPrice(total)}
          </span>
        </div>
        <Link
          href="/checkout"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] py-2.5 text-sm font-semibold text-black hover:bg-[var(--primary-hover)] transition-colors"
        >
          Proceed to Checkout
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
