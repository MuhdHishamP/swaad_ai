"use client";

import { useState } from "react";
import Image from "next/image";
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  Flame,
  Leaf,
  Users,
  Zap,
} from "lucide-react";
import { cn, formatPrice, getFoodImagePath } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { FoodItem } from "@/types";
import { useEffect } from "react";

/**
 * Food Detail Modal — Full-screen modal with rich food details.
 * WHY: Assignment requires a detail view when clicking food items.
 * Shows everything: large image, full description, ingredients,
 * complete nutrition grid, size variants, and add-to-cart.
 */
export function FoodDetailModal({
  food,
  onClose,
}: {
  food: FoodItem;
  onClose: () => void;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    food.sizeVariants?.[0]?.size
  );

  // Resolve current price based on size
  const currentPrice = selectedSize
    ? food.sizeVariants?.find((v) => v.size === selectedSize)?.price || food.price
    : food.price;

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleAddToCart = () => {
    addItem(food, quantity, selectedSize);
    onClose();
  };

  const isVeg = food.type === "Vegetarian";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[61] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${food.name}`}
      >
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-2xl animate-fade-in-up">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Hero Image */}
          <div className="relative h-56 sm:h-72 w-full bg-[var(--background-tertiary)]">
            <Image
              src={getFoodImagePath(food.image)}
              alt={food.name}
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-cover"
              priority
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />

            {/* Badges on image */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm",
                  isVeg
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                )}
              >
                {isVeg ? <Leaf className="h-3 w-3" /> : <Flame className="h-3 w-3" />}
                {isVeg ? "Veg" : "Non-Veg"}
              </span>
              {food.spiceLevel && food.spiceLevel !== "None" && (
                <span className="flex items-center gap-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
                  🌶️ {food.spiceLevel}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                  {food.name}
                </h2>
                <span className="text-xl font-bold text-[var(--primary)] whitespace-nowrap">
                  {formatPrice(currentPrice)}
                </span>
              </div>
              <p className="text-sm text-[var(--foreground-secondary)] flex items-center gap-2">
                {food.category}
                <span className="text-[var(--foreground-muted)]">•</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  Serves {food.serves}
                </span>
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
              {food.description}
            </p>

            {/* Size Variants */}
            {food.sizeVariants && food.sizeVariants.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">
                  Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {food.sizeVariants.map((variant) => (
                    <button
                      key={variant.size}
                      onClick={() => setSelectedSize(variant.size)}
                      className={cn(
                        "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                        selectedSize === variant.size
                          ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                          : "border-[var(--border)] bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:border-[var(--border-hover)]"
                      )}
                    >
                      {variant.size} — {formatPrice(variant.price)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">
                Ingredients
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {food.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="rounded-full bg-[var(--background-secondary)] border border-[var(--border)] px-3 py-1 text-xs text-[var(--foreground-secondary)]"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Nutrition Grid */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">
                Nutrition Info
              </h3>
              <div className="grid grid-cols-4 gap-2">
                <NutritionTile
                  icon={<Zap className="h-4 w-4 text-amber-400" />}
                  label="Calories"
                  value={`${food.nutrition.calories}`}
                  unit="kcal"
                />
                <NutritionTile
                  icon={<span className="text-sm">💪</span>}
                  label="Protein"
                  value={food.nutrition.protein}
                />
                <NutritionTile
                  icon={<span className="text-sm">🌾</span>}
                  label="Carbs"
                  value={food.nutrition.carbs}
                />
                <NutritionTile
                  icon={<span className="text-sm">🥑</span>}
                  label="Fat"
                  value={food.nutrition.fat}
                />
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex items-center gap-3 pt-2">
              {/* Quantity */}
              <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--background-secondary)]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 items-center justify-center text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-[var(--foreground)]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="flex h-10 w-10 items-center justify-center text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add button */}
              <button
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 text-sm font-bold text-black hover:bg-[var(--primary-hover)] transition-colors glow-primary"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart — {formatPrice(currentPrice * quantity)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** Single nutrition stat tile */
function NutritionTile({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] p-2.5 text-center">
      <span className="mb-1">{icon}</span>
      <span className="text-sm font-semibold text-[var(--foreground)]">
        {value}
        {unit && <span className="text-[10px] text-[var(--foreground-muted)]"> {unit}</span>}
      </span>
      <span className="text-[10px] text-[var(--foreground-muted)]">{label}</span>
    </div>
  );
}
