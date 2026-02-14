"use client";

import { useState, useMemo } from "react";
import { getAllFoods, getCategories } from "@/lib/food-data";
import { FoodCard } from "@/components/chat/food-card";
import { useCartStore } from "@/stores/cart-store";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FoodItem } from "@/types";

/**
 * Menu Page — Full browsable menu with category filters.
 * WHY: Not everyone wants to chat. Some users prefer to browse
 * a traditional menu grid. This page uses the same FoodCard
 * component and cart store, maintaining consistency.
 */
export default function MenuPage() {
  const allFoods = useMemo(() => getAllFoods(), []);
  const categories = useMemo(() => getCategories(), []);
  const addToCart = useCartStore((s) => s.addItem);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<
    "Vegetarian" | "Non-Vegetarian" | null
  >(null);

  // Filter foods based on search and filters
  const filteredFoods = useMemo(() => {
    let results = allFoods;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (food) =>
          food.name.toLowerCase().includes(q) ||
          food.description.toLowerCase().includes(q) ||
          food.category.toLowerCase().includes(q) ||
          food.ingredients.some((ing) => ing.toLowerCase().includes(q))
      );
    }

    if (selectedCategory) {
      results = results.filter((food) => food.category === selectedCategory);
    }

    if (selectedType) {
      results = results.filter((food) => food.type === selectedType);
    }

    return results;
  }, [allFoods, searchQuery, selectedCategory, selectedType]);

  const handleAddToCart = (food: FoodItem, quantity: number) => {
    addToCart(food, quantity);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedType(null);
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedType;

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Our <span className="text-gradient">Menu</span>
          </h1>
          <p className="mt-1 text-[var(--foreground-secondary)]">
            Explore {allFoods.length}+ dishes across {categories.length} categories
          </p>
        </div>

        {/* Search + Filters Bar */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, ingredients, or categories..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] py-3 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              id="menu-search"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {/* Dietary type filters */}
            <button
              onClick={() =>
                setSelectedType(
                  selectedType === "Vegetarian" ? null : "Vegetarian"
                )
              }
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all",
                selectedType === "Vegetarian"
                  ? "border-green-500 bg-green-500/10 text-green-400"
                  : "border-[var(--border)] bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:border-green-500/50"
              )}
            >
              🌿 Vegetarian
            </button>
            <button
              onClick={() =>
                setSelectedType(
                  selectedType === "Non-Vegetarian" ? null : "Non-Vegetarian"
                )
              }
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all",
                selectedType === "Non-Vegetarian"
                  ? "border-red-500 bg-red-500/10 text-red-400"
                  : "border-[var(--border)] bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:border-red-500/50"
              )}
            >
              🍗 Non-Veg
            </button>

            <span className="h-6 w-px bg-[var(--border)] mx-1 self-center" />

            {/* Category filters */}
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat ? null : cat)
                }
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium border transition-all",
                  selectedCategory === cat
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:border-[var(--border-hover)]"
                )}
              >
                {cat}
              </button>
            ))}

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-[var(--error)] hover:bg-[var(--background-tertiary)] transition-all"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-[var(--foreground-muted)]">
          {filteredFoods.length} dish{filteredFoods.length !== 1 ? "es" : ""}{" "}
          {hasActiveFilters ? "found" : "available"}
        </p>

        {/* Food Grid */}
        {filteredFoods.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFoods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Filter className="h-12 w-12 text-[var(--foreground-muted)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
              No dishes found
            </h3>
            <p className="text-sm text-[var(--foreground-secondary)] mb-4">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={clearFilters}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-black hover:bg-[var(--primary-hover)] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
