// ============================================================
// Food Data Service
// WHY: Loads Foods.json at import time (build-time for SSR,
// module-init for API routes). 100 items (~128KB) is trivially
// small — no database needed. All search runs in-memory which
// is faster than any DB round-trip for this dataset size.
// ============================================================

import foodsData from "@/data/foods.json";
import type { FoodItem } from "@/types";

/** Type-cast the imported JSON. Validated at build time by TypeScript. */
const allFoods: FoodItem[] = foodsData.foods as FoodItem[];

/** Returns all food items. */
export function getAllFoods(): FoodItem[] {
  return allFoods;
}

/** Returns a single food item by ID, or undefined if not found. */
export function getFoodById(id: number): FoodItem | undefined {
  return allFoods.find((food) => food.id === id);
}

/** Returns all unique categories in the dataset. */
export function getCategories(): string[] {
  const categories = new Set(allFoods.map((food) => food.category));
  return Array.from(categories).sort();
}

/** Returns all unique food types (Vegetarian, Non-Vegetarian). */
export function getFoodTypes(): string[] {
  const types = new Set(allFoods.map((food) => food.type));
  return Array.from(types);
}

// ============================================================
// Search & Filter
// WHY: Multi-criteria search combines keyword matching with
// attribute filters. The keyword search checks name, description,
// category, and ingredients — covering most natural language
// queries. Filters narrow by dietary type, spice level, etc.
// ============================================================

export interface FoodSearchFilters {
  query?: string;
  category?: string;
  type?: "Vegetarian" | "Non-Vegetarian";
  spiceLevel?: string;
  maxCalories?: number;
  minProtein?: number;
  maxCarbs?: number;
  maxPrice?: number;
  ingredients?: string[];
}

/**
 * Searches and filters food items.
 * WHY: This is the primary function the AI agent calls via the
 * search_food tool. It supports both keyword queries and
 * structured filters, allowing the agent to handle requests like
 * "spicy vegetarian dishes under 300 calories" efficiently.
 */
export function searchFoods(filters: FoodSearchFilters): FoodItem[] {
  let results = [...allFoods];

  // Keyword search across multiple fields
  if (filters.query) {
    const query = filters.query.toLowerCase();
    const terms = query.split(/\s+/).filter(Boolean);

    results = results.filter((food) => {
      const searchableText = [
        food.name,
        food.description,
        food.category,
        food.type,
        food.spiceLevel,
        ...food.ingredients,
      ]
        .join(" ")
        .toLowerCase();

      // All search terms must match (AND logic for precision)
      return terms.every((term) => searchableText.includes(term));
    });
  }

  // Attribute filters
  if (filters.category) {
    const cat = filters.category.toLowerCase();
    results = results.filter((food) =>
      food.category.toLowerCase().includes(cat)
    );
  }

  if (filters.type) {
    results = results.filter((food) => food.type === filters.type);
  }

  if (filters.spiceLevel) {
    const spice = filters.spiceLevel.toLowerCase();
    results = results.filter((food) =>
      food.spiceLevel.toLowerCase().includes(spice)
    );
  }

  if (filters.maxCalories) {
    results = results.filter(
      (food) => food.nutrition.calories <= filters.maxCalories!
    );
  }

  if (filters.minProtein) {
    const minP = filters.minProtein;
    results = results.filter((food) => {
      const protein = parseFloat(food.nutrition.protein) || 0;
      return protein >= minP;
    });
  }

  if (filters.maxCarbs) {
    const maxC = filters.maxCarbs;
    results = results.filter((food) => {
      const carbs = parseFloat(food.nutrition.carbs) || 0;
      return carbs <= maxC;
    });
  }

  if (filters.maxPrice) {
    results = results.filter((food) => food.price <= filters.maxPrice!);
  }

  if (filters.ingredients && filters.ingredients.length > 0) {
    const searchIngredients = filters.ingredients.map((i) => i.toLowerCase());
    results = results.filter((food) =>
      searchIngredients.some((si) =>
        food.ingredients.some((fi) => fi.toLowerCase().includes(si))
      )
    );
  }

  return results;
}

/**
 * Returns foods grouped by category.
 * WHY: Used by the menu browse view for category tabs.
 */
export function getFoodsByCategory(): Record<string, FoodItem[]> {
  const grouped: Record<string, FoodItem[]> = {};
  for (const food of allFoods) {
    if (!grouped[food.category]) {
      grouped[food.category] = [];
    }
    grouped[food.category].push(food);
  }
  return grouped;
}
