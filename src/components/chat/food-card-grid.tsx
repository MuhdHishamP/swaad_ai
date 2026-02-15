"use client";

import { FoodCard } from "./food-card";
import type { FoodItem } from "@/types";

interface FoodCardGridProps {
  items: FoodItem[];
  onAddToCart?: (food: FoodItem, quantity: number) => void;
}

/**
 * Food Card Grid — displays multiple food cards in a scrollable layout.
 * WHY: Horizontal scroll for inline chat context (< 4 items),
 * responsive grid for larger sets. This prevents the chat from
 * being pushed down too far while still showing rich content.
 */
export function FoodCardGrid({ items, onAddToCart }: FoodCardGridProps) {
  if (items.length === 0) return null;

  // For small sets (1-3 items), use horizontal scroll in chat context
  // For larger sets, use a responsive grid
  const useScroll = items.length <= 4;

  if (useScroll) {
    return (
      <div className="w-full overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex gap-3" style={{ minWidth: "min-content" }}>
          {items.map((food, index) => (
            <FoodCard
              key={`${food.id}-${index}`}
              food={food}
              onAddToCart={onAddToCart}
              compact
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
      {items.map((food, index) => (
        <FoodCard
          key={`${food.id}-${index}`}
          food={food}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
