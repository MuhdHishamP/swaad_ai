/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  MapPin,
  Clock,
  MessageSquare,
  UtensilsCrossed,
  Sparkles,
} from "lucide-react";
import { useOrderStore } from "@/stores/order-store";
import { formatPrice } from "@/lib/utils";

/**
 * Order Confirmed Page — Post-purchase celebration.
 * WHY: Closing the loop with a satisfying confirmation creates
 * trust and a complete ordering experience. Shows order details,
 * estimated delivery time, and next-step CTAs.
 */
export default function OrderConfirmedPage() {
  const getCurrentOrder = useOrderStore((s) => s.getCurrentOrder);
  const order = getCurrentOrder();
  const [showConfetti, setShowConfetti] = useState(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null);

  // Initialize client-side only values
  useEffect(() => {
    setEstimatedMinutes(30 + Math.floor(Math.random() * 15));
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!order || estimatedMinutes === null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Package className="mb-4 h-16 w-16 text-[var(--foreground-muted)]" />
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
          {!order ? "No order found" : "Loading confirmation..."}
        </h2>
        <p className="text-sm text-[var(--foreground-secondary)] mb-6">
          {!order ? "Looks like you haven't placed an order yet." : "Preparing your order details..."}
        </p>
        {!order && (
          <Link
            href="/"
            className="rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-black hover:bg-[var(--primary-hover)] transition-colors"
          >
            Start Ordering
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6">
      {/* Confetti overlay */}
      {showConfetti && <ConfettiOverlay />}

      <div className="mx-auto max-w-lg space-y-6 animate-fade-in-up">
        {/* Success Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--success)]/10 border-2 border-[var(--success)]">
            <CheckCircle2 className="h-10 w-10 text-[var(--success)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Order Confirmed! 🎉
          </h1>
          <p className="mt-1 text-[var(--foreground-secondary)]">
            Thank you for your order
          </p>
        </div>

        {/* Order Details Card */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] p-5 space-y-4">
          {/* Order ID */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--foreground-secondary)]">
              Order ID
            </span>
            <span className="text-sm font-mono font-semibold text-[var(--foreground)]">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          {/* Estimated Time */}
          <div className="flex items-center gap-3 rounded-lg bg-[var(--primary-soft)] p-3">
            <Clock className="h-5 w-5 text-[var(--primary)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Estimated Delivery
              </p>
              <p className="text-xs text-[var(--foreground-secondary)]">
                {estimatedMinutes}–{estimatedMinutes + 10} minutes
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] mb-2">
              <Package className="h-4 w-4 text-[var(--primary)]" />
              Items ({order.items.length})
            </h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={`${item.food.id}-${item.selectedSize || ""}`}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-[var(--foreground-secondary)]">
                    {item.quantity}x {item.food.name}
                  </span>
                  <span className="font-medium text-[var(--foreground)]">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
            <span className="font-semibold text-[var(--foreground)]">Total</span>
            <span className="text-lg font-bold text-[var(--primary)]">
              {formatPrice(order.total)}
            </span>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] mb-2">
              <MapPin className="h-4 w-4 text-[var(--primary)]" />
              Delivery Address
            </h3>
            <div className="rounded-lg bg-[var(--background-tertiary)] p-3 text-sm text-[var(--foreground-secondary)]">
              <p className="font-medium text-[var(--foreground)]">
                {order.deliveryAddress.fullName}
              </p>
              <p>{order.deliveryAddress.addressLine1}</p>
              {order.deliveryAddress.addressLine2 && (
                <p>{order.deliveryAddress.addressLine2}</p>
              )}
              <p>
                {order.deliveryAddress.city} — {order.deliveryAddress.pincode}
              </p>
              <p>{order.deliveryAddress.phone}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--foreground-secondary)]">Payment</span>
            <span className="font-medium text-[var(--foreground)]">
              Cash on Delivery
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 text-sm font-bold text-black hover:bg-[var(--primary-hover)] transition-colors glow-primary"
          >
            <MessageSquare className="h-4 w-4" />
            Back to Chat
          </Link>
          <Link
            href="/menu"
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] py-3 text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:border-[var(--border-hover)] transition-all"
          >
            <UtensilsCrossed className="h-4 w-4" />
            Browse Menu
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Simple confetti animation using CSS */
function ConfettiOverlay() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Array<{ left: number; delay: number; duration: number; color: string }>>([]);
  
  useEffect(() => {
    setMounted(true);
    const colors = ["#f59e0b", "#22c55e", "#ef4444", "#3b82f6", "#a855f7"];
    const newParticles = Array.from({ length: 30 }).map(() => ({
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);
  }, []);
  
  if (!mounted || particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${p.left}%`,
            top: `-5%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          <Sparkles
            className="h-4 w-4"
            style={{ color: p.color }}
          />
        </div>
      ))}
    </div>
  );
}
