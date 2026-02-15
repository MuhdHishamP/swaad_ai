/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { cn, formatPrice, getFoodImagePath } from "@/lib/utils";
import { useEffect, useState } from "react";

/**
 * Cart Drawer — Slide-in panel from the right.
 * WHY: A drawer (not a page) keeps the user in context.
 * They can review cart, adjust quantities, and close to
 * continue chatting without losing their place.
 */
export function CartDrawer() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isCartOpen);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotal = useCartStore((s) => s.getTotal);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, setCartOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setCartOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full sm:w-[400px] bg-[var(--background)] border-l border-[var(--border)] shadow-2xl transition-transform duration-300 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Your Cart
            </h2>
            {mounted && getItemCount() > 0 && (
              <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs font-bold text-black">
                {getItemCount()}
              </span>
            )}
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Content */}
        {!mounted || items.length === 0 ? (
          <EmptyCart onClose={() => setCartOpen(false)} isLoading={!mounted} />
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {items.map((item) => (
                <CartItemCard
                  key={`${item.food.id}-${item.selectedSize || "default"}`}
                  item={item}
                  onUpdateQuantity={(qty) => updateQuantity(item.food.id, qty)}
                  onRemove={() => removeItem(item.food.id)}
                />
              ))}
            </div>

            {/* Footer — Total + Actions */}
            <div className="border-t border-[var(--border)] px-4 py-4 space-y-3">
              {/* Subtotals */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm text-[var(--foreground-secondary)]">
                  <span>Subtotal ({getItemCount()} items)</span>
                  <span>{formatPrice(getTotal())}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-[var(--foreground-secondary)]">
                  <span>Delivery</span>
                  <span className="text-[var(--success)]">Free</span>
                </div>
                <div className="border-t border-[var(--border)] pt-1.5 flex items-center justify-between">
                  <span className="font-semibold text-[var(--foreground)]">
                    Total
                  </span>
                  <span className="text-lg font-bold text-[var(--primary)]">
                    {formatPrice(getTotal())}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 text-sm font-bold text-black hover:bg-[var(--primary-hover)] transition-colors glow-primary"
                onClick={() => {
                  setCartOpen(false);
                  router.push("/checkout");
                }}
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={clearCart}
                className="flex w-full items-center justify-center gap-1 rounded-lg py-2 text-xs text-[var(--foreground-muted)] hover:text-[var(--error)] transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/** Individual cart item card */
function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: { food: { id: number; name: string; image: string; category: string }; quantity: number; unitPrice: number; selectedSize?: string };
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] p-3">
      {/* Image */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--background-tertiary)]">
        <Image
          src={getFoodImagePath(item.food.image)}
          alt={item.food.name}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-[var(--foreground)] truncate">
          {item.food.name}
        </h3>
        <p className="text-xs text-[var(--foreground-muted)]">
          {item.food.category}
          {item.selectedSize && ` • ${item.selectedSize}`}
        </p>
        <p className="text-sm font-semibold text-[var(--primary)] mt-0.5">
          {formatPrice(item.unitPrice * item.quantity)}
        </p>
      </div>

      {/* Quantity + Remove */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={onRemove}
          className="flex h-6 w-6 items-center justify-center rounded text-[var(--foreground-muted)] hover:text-[var(--error)] hover:bg-[var(--background-tertiary)] transition-colors"
          aria-label={`Remove ${item.food.name}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--background-tertiary)]">
          <button
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            className="flex h-6 w-6 items-center justify-center text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-5 text-center text-xs font-medium text-[var(--foreground)]">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="flex h-6 w-6 items-center justify-center text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Empty cart state */
function EmptyCart({ onClose, isLoading = false }: { onClose: () => void; isLoading?: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)]">
        <ShoppingBag className="h-8 w-8 text-[var(--foreground-muted)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
        {isLoading ? "Loading your cart..." : "Your cart is empty"}
      </h3>
      <p className="text-sm text-[var(--foreground-secondary)] mb-6">
        {isLoading ? "Please wait a moment." : "Chat with our AI to discover and add dishes!"}
      </p>
      {!isLoading && (
        <button
          onClick={onClose}
          className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-black hover:bg-[var(--primary-hover)] transition-colors"
        >
          Start Ordering
        </button>
      )}
    </div>
  );
}
