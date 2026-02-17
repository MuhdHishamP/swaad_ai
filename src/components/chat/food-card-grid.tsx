"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FoodCard } from "./food-card";
import { CHAT_PRODUCT_LAYOUT_TARGET } from "./chat-product-layout-contract";
import type { FoodItem } from "@/types";

interface FoodCardGridProps {
  items: FoodItem[];
  onAddToCart?: (food: FoodItem, quantity: number) => void;
}

/**
 * Food Card Grid — displays multiple food cards in a scrollable layout.
 * WHY: Chat product cards now follow a carousel-only contract
 * across all result sizes on both mobile and desktop.
 */
export function FoodCardGrid({ items, onAddToCart }: FoodCardGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const isEmpty = items.length === 0;

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScrollable = scrollWidth - clientWidth;
    setShowLeftArrow(scrollLeft > 0);
    // Keep right arrow hidden when content fits; use threshold to avoid rounding flicker.
    setShowRightArrow(maxScrollable > 10 && scrollLeft < maxScrollable - 10);
  }, []);

  const getScrollStep = useCallback(() => {
    if (!scrollContainerRef.current) return 300;
    const container = scrollContainerRef.current;
    const firstCard = container.firstElementChild as HTMLElement | null;
    if (!firstCard) return 300;

    const firstCardWidth = firstCard.getBoundingClientRect().width;
    const computedStyle = window.getComputedStyle(container);
    const gap = parseFloat(computedStyle.columnGap || computedStyle.gap || "0");

    return Math.round(firstCardWidth + gap);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = getScrollStep();
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Initial check for arrows
  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, [handleScroll, items.length]);

  if (isEmpty) return null;

  return (
    <div className="relative group/carousel w-full">
      {/* Left Navigation Button - Desktop Only */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)] shadow-lg transition-all hover:bg-[var(--primary)] hover:text-black hover:scale-110 active:scale-95"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 scroll-smooth overscroll-x-contain pb-4 -mx-4 px-4 md:mx-0 md:px-0"
        aria-label="Recommended dishes"
      >
        {items.map((food, index) => (
          <div
            key={`${food.id}-${index}`}
            className="snap-start shrink-0 w-[280px] md:w-[320px] h-full"
          >
            <FoodCard
              food={food}
              onAddToCart={onAddToCart}
              compact={CHAT_PRODUCT_LAYOUT_TARGET.mode !== "carousel-only"}
            />
          </div>
        ))}
      </div>

      {/* Right Navigation Button - Desktop Only */}
      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-[var(--background-elevated)] border border-[var(--border)] text-[var(--foreground)] shadow-lg transition-all hover:bg-[var(--primary)] hover:text-black hover:scale-110 active:scale-95"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
