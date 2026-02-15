/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  UtensilsCrossed,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

/**
 * App Header
 * WHY: Fixed header with glassmorphism provides navigation
 * between Chat and Menu views, plus a persistent cart access point.
 * The logo uses the brand gradient for visual identity.
 */
export function Header() {
  const pathname = usePathname();
  const toggleCart = useCartStore((s) => s.toggleCart);
  const itemCount = useCartStore((s) => s.getItemCount());
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch: Wait for mount to show cart count from localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      label: "Chat",
      href: "/",
      icon: MessageSquare,
      description: "AI-powered ordering",
    },
    {
      label: "Menu",
      href: "/menu",
      icon: UtensilsCrossed,
      description: "Browse our menu",
    },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 glass"
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          aria-label="Swaad AI — Home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-black font-bold text-lg">
            S
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight text-gradient">
              Swaad AI
            </span>
            <span className="text-[10px] leading-none text-[var(--foreground-muted)] hidden sm:block">
              Taste powered by intelligence
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1" role="navigation" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)]"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}

          {/* Cart Button — wired to cart store */}
          <button
            onClick={toggleCart}
            className="relative ml-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-all"
            aria-label={`Open cart${mounted && itemCount > 0 ? `, ${itemCount} items` : ""}`}
            id="cart-button"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-black">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
