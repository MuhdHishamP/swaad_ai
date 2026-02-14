"use client";

import Image from "next/image";
import { Plus, Minus, Flame, Leaf, Info } from "lucide-react";
import { useState } from "react";
import { cn, formatPrice, getFoodImagePath, truncate } from "@/lib/utils";
import type { FoodItem } from "@/types";

interface FoodCardProps {
  food: FoodItem;
  /** Called when user clicks add-to-cart. Wired in Phase 4. */
  onAddToCart?: (food: FoodItem, quantity: number) => void;
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
export function FoodCard({ food, onAddToCart, compact = false }: FoodCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const isVeg = food.type === "Vegetarian";
  const imageSrc = getFoodImagePath(food.image);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] transition-all hover:border-[var(--border-hover)]",
        compact ? "w-[260px] shrink-0" : "w-full"
      )}
    >
      {/* Food Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--background-tertiary)]">
        {!imageError ? (
          <Image
            src={imageSrc}
            alt={food.name}
            fill
            sizes="(max-width: 640px) 260px, 300px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            🍛
          </div>
        )}

        {/* Veg/Non-Veg badge — top-left corner */}
        <div
          className={cn(
            "absolute top-2 left-2 flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium backdrop-blur-sm",
            isVeg
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          )}
        >
          {isVeg ? <Leaf className="h-3 w-3" /> : <Flame className="h-3 w-3" />}
          {isVeg ? "Veg" : "Non-Veg"}
        </div>

        {/* Spice level — top-right */}
        {food.spiceLevel && food.spiceLevel !== "Neutral" && food.spiceLevel !== "Sweet" && (
          <div className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-[var(--foreground-secondary)] backdrop-blur-sm">
            🌶️ {food.spiceLevel}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Name & Category */}
        <div>
          <h3 className="font-semibold text-sm text-[var(--foreground)] leading-tight">
            {food.name}
          </h3>
          <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
            {food.category}
          </p>
        </div>

        {/* Description — collapsed by default, expand on click */}
        {!compact && (
          <p className="text-xs text-[var(--foreground-secondary)] leading-relaxed">
            {showDetails ? food.description : truncate(food.description, 100)}
            {food.description.length > 100 && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="ml-1 text-[var(--primary)] hover:underline"
              >
                {showDetails ? "less" : "more"}
              </button>
            )}
          </p>
        )}

        {/* Nutrition badges */}
        <div className="flex flex-wrap gap-1.5">
          <NutritionBadge label="Cal" value={`${food.nutrition.calories}`} />
          {food.nutrition.protein && (
            <NutritionBadge label="Protein" value={food.nutrition.protein} highlight />
          )}
          {food.nutrition.carbs && (
            <NutritionBadge label="Carbs" value={food.nutrition.carbs} />
          )}
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-base font-bold text-[var(--primary)]">
            {formatPrice(food.price)}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Quantity selector */}
            <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--background-tertiary)]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-7 w-7 items-center justify-center text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-6 text-center text-xs font-medium text-[var(--foreground)]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="flex h-7 w-7 items-center justify-center text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Add button */}
            <button
              onClick={() => onAddToCart?.(food, quantity)}
              className="flex h-7 items-center gap-1 rounded-lg bg-[var(--primary)] px-3 text-xs font-semibold text-black hover:bg-[var(--primary-hover)] transition-colors"
              aria-label={`Add ${food.name} to cart`}
              id={`add-to-cart-${food.id}`}
            >
              <Plus className="h-3 w-3" />
              Add
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
