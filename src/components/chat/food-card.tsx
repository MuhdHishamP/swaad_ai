/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import { Plus, Minus, Flame, Leaf, Sparkles, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { cn, formatPrice, getFoodImagePath, truncate } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { FoodItem } from "@/types";

interface FoodCardProps {
  food: FoodItem;
  /** Called when user clicks add-to-cart. Wired in Phase 4. */
  onAddToCart?: (food: FoodItem, quantity: number) => void;
  /** Called when user clicks the card body to view details */
  onCardClick?: () => void;
  /** Compact mode for inline chat display */
  compact?: boolean;
}

/**
 * Food Card — The hero component of Dynamic UI Generation.
 * WHY: This is what makes the chat experience visual and interactive.
 * Each card shows: image → name → badges → nutrition → price → add button.
 * The design follows the Indian restaurant convention:
 * - Green dot for vegetarian, red for non-veg
 * - Spice level indicator with flame icons
 * - Nutritional highlights as compact badges
 */
export function FoodCard({ food, onAddToCart, onCardClick, compact = false }: FoodCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  
  const cartItemsCount = useCartStore((s) => s.items.length);

  // Reset quantity to 1 if cart is cleared
  useEffect(() => {
    if (cartItemsCount === 0) {
      setQuantity(1);
    }
  }, [cartItemsCount]);

  const handleAdd = () => {
    if (!onAddToCart) return;
    
    // Optimistic UI update
    setIsAdded(true);
    onAddToCart(food, quantity);

    // Reset after animation
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const isVeg = food.type === "Vegetarian";
  const imageSrc = getFoodImagePath(food.image);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] transition-all duration-300 hover:shadow-lg hover:border-[var(--primary)]/50 flex flex-col",
        compact ? "w-[260px] shrink-0 snap-center" : "w-full h-full"
      )}
    >
      {/* Food Image */}
      <div
        className={cn(
          "relative aspect-[4/3] overflow-hidden bg-[var(--background-tertiary)] shrink-0",
          onCardClick && "cursor-pointer"
        )}
        onClick={onCardClick}
        role={onCardClick ? "button" : undefined}
        tabIndex={onCardClick ? 0 : undefined}
        onKeyDown={onCardClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onCardClick(); } } : undefined}
        aria-label={onCardClick ? `View details for ${food.name}` : undefined}
      >
        {!imageError ? (
          <Image
            src={imageSrc}
            alt={food.name}
            fill
            sizes="(max-width: 640px) 260px, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--background-tertiary)] opacity-50">
             <div className="text-[var(--foreground-muted)] opacity-20 transform -rotate-12">
               <Sparkles className="w-16 h-16" />
             </div>
          </div>
        )}

        {/* Veg/Non-Veg badge — Minimalist Icon */}
        <div
          className={cn(
            "absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full backdrop-blur-md border shadow-sm",
            isVeg
              ? "bg-green-100/80 border-green-200 text-green-700 dark:bg-green-900/50 dark:border-green-800 dark:text-green-400"
              : "bg-red-100/80 border-red-200 text-red-700 dark:bg-red-900/50 dark:border-red-800 dark:text-red-400"
          )}
          title={isVeg ? "Vegetarian" : "Non-Vegetarian"}
        >
          {isVeg ? <Leaf className="h-3.5 w-3.5" /> : <Flame className="h-3.5 w-3.5" />}
        </div>

        {/* Spice level — Minimalist with gradient */}
        {food.spiceLevel && food.spiceLevel !== "Neutral" && food.spiceLevel !== "Sweet" && (
          <div className="absolute top-2 right-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md border border-white/10 flex items-center gap-1">
            <span>🌶️</span>
            <span>{food.spiceLevel}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-grow space-y-2">
        {/* Name & Category */}
        <div>
          <h3 className="font-semibold text-sm text-[var(--foreground)] leading-tight line-clamp-1" title={food.name}>
            {food.name}
          </h3>
          <p className="text-xs text-[var(--foreground-muted)] mt-0.5 font-medium">
            {food.category}
          </p>
        </div>

        {/* Description — collapsed by default, expand on click */}
        {!compact && (
          <div className="text-xs text-[var(--foreground-secondary)] leading-relaxed line-clamp-2 min-h-[2.5em]">
            <p>
              {showDetails ? food.description : truncate(food.description, 80)}
              {food.description.length > 80 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(!showDetails);
                  }}
                  className="ml-1 text-[var(--primary)] hover:underline cursor-pointer font-medium"
                >
                  {showDetails ? "less" : "more"}
                </button>
              )}
            </p>
          </div>
        )}

        {/* Nutrition badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <NutritionBadge label="Cal" value={`${food.nutrition.calories}`} />
          {food.nutrition.protein && (
            <NutritionBadge label="Protein" value={food.nutrition.protein} highlight />
          )}
          {food.nutrition.carbs && (
            <NutritionBadge label="Carbs" value={food.nutrition.carbs} />
          )}
        </div>

        {/* Price & Add to Cart — Pushed to bottom */}
        <div className="flex items-center justify-between pt-3 mt-auto">
          <span className="text-base font-bold text-[var(--primary)]">
            {formatPrice(food.price)}
          </span>

          <div className="flex items-center gap-2">
            {/* Quantity selector */}
            <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--background-tertiary)]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-9 w-9 items-center justify-center text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer active:scale-95"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium text-[var(--foreground)]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="flex h-9 w-9 items-center justify-center text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer active:scale-95"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add button */}
            <button
              onClick={handleAdd}
              disabled={isAdded}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow active:scale-95 active:shadow-none min-w-[80px] justify-center",
                isAdded 
                  ? "bg-green-500 text-white hover:bg-green-600 border border-green-600"
                  : "bg-[var(--primary)] text-black hover:bg-[var(--primary-hover)]"
              )}
              aria-label={`Add ${food.name} to cart`}
              id={`add-to-cart-${food.id}`}
            >
              {isAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  Added
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Compact nutrition badge */
function NutritionBadge({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium",
        highlight
          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
          : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)]"
      )}
    >
      {label}: {value}
    </span>
  );
}
