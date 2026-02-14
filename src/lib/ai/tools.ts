// ============================================================
// LangChain Tools for the AI Agent
// WHY: Tools give the agent structured ways to interact with
// our data and cart. Using LangChain's tool() with Zod schemas
// ensures type-safe parameter validation and lets the model
// understand exactly what parameters each action accepts.
// ============================================================

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  searchFoods,
  getFoodById,
  getCategories,
  getAllFoods,
} from "@/lib/food-data";
import type { FoodItem } from "@/types";

/**
 * Formats food items for the AI to reference in its response.
 * WHY: The agent needs a concise text summary to compose its
 * response, while the full FoodItem objects are passed separately
 * for UI rendering. This avoids bloating the AI's context.
 */
function formatFoodForAgent(food: FoodItem): string {
  return `[ID:${food.id}] ${food.name} (${food.category}) - ${food.type} - ₹${food.price} - ${food.spiceLevel} spice - ${food.nutrition.calories} cal, ${food.nutrition.protein} protein`;
}

// ============================================================
// Tool Definitions
// ============================================================

export const searchFoodTool = tool(
  async (input) => {
    const results = searchFoods({
      query: input.query || undefined,
      category: input.category || undefined,
      type: input.type as "Vegetarian" | "Non-Vegetarian" | undefined,
      spiceLevel: input.spiceLevel || undefined,
      maxCalories: input.maxCalories || undefined,
      minProtein: input.minProtein || undefined,
      maxPrice: input.maxPrice || undefined,
    });

    if (results.length === 0) {
      return JSON.stringify({
        found: 0,
        message: "No items match those criteria.",
        items: [],
      });
    }

    // Cap results to avoid token bloat — agent can always refine
    const capped = results.slice(0, 8);

    return JSON.stringify({
      found: results.length,
      showing: capped.length,
      items: capped.map(formatFoodForAgent),
      // Full items for UI rendering — attached as metadata
      _foodItems: capped,
    });
  },
  {
    name: "search_food",
    description:
      "Search the restaurant menu by keywords, dietary type, category, spice level, nutrition, or price. Use this whenever the user asks about food options, recommendations, or has dietary requirements.",
    schema: z.object({
      query: z
        .string()
        .optional()
        .describe(
          "Search keywords (e.g., 'chicken', 'paneer', 'spicy', 'biryani'). Searches across name, description, category, and ingredients."
        ),
      category: z
        .string()
        .optional()
        .describe(
          "Filter by category (e.g., 'North Indian', 'South Indian', 'Mughlai', 'Beverages', 'Desserts')"
        ),
      type: z
        .enum(["Vegetarian", "Non-Vegetarian"])
        .optional()
        .describe("Filter by dietary type"),
      spiceLevel: z
        .string()
        .optional()
        .describe(
          "Filter by spice level (e.g., 'Mild', 'Medium', 'Hot', 'Sweet', 'Neutral')"
        ),
      maxCalories: z
        .number()
        .optional()
        .describe("Maximum calories per serving"),
      minProtein: z
        .number()
        .optional()
        .describe("Minimum protein in grams (numeric value, e.g., 20)"),
      maxPrice: z
        .number()
        .optional()
        .describe("Maximum price in INR"),
    }),
  }
);

export const getFoodDetailsTool = tool(
  async (input) => {
    const food = getFoodById(input.foodId);
    if (!food) {
      return JSON.stringify({ error: `No food found with ID ${input.foodId}` });
    }

    return JSON.stringify({
      item: formatFoodForAgent(food),
      description: food.description,
      ingredients: food.ingredients.join(", "),
      nutrition: food.nutrition,
      _foodItems: [food],
    });
  },
  {
    name: "get_food_details",
    description:
      "Get detailed information about a specific food item by its ID. Use this when the user asks about a specific dish's ingredients, nutrition, or description.",
    schema: z.object({
      foodId: z.number().describe("The ID of the food item"),
    }),
  }
);

export const getCategoriesList = tool(
  async () => {
    const categories = getCategories();
    return JSON.stringify({
      categories,
      totalItems: getAllFoods().length,
    });
  },
  {
    name: "get_categories",
    description:
      "List all available menu categories and the total number of items. Use this when the user asks what's available or wants to browse by category.",
    schema: z.object({}),
  }
);

/**
 * Cart tools — these don't actually modify server state.
 * WHY: Cart lives in the client (Zustand store). These tools
 * return structured instructions that the frontend interprets
 * to update the cart. This keeps the server stateless and the
 * cart authoritative on the client side.
 */
export const addToCartTool = tool(
  async (input) => {
    const food = getFoodById(input.foodId);
    if (!food) {
      return JSON.stringify({
        success: false,
        error: `Food item with ID ${input.foodId} not found`,
      });
    }

    return JSON.stringify({
      success: true,
      action: "add_to_cart",
      item: {
        foodId: food.id,
        name: food.name,
        price: food.price,
        quantity: input.quantity || 1,
      },
      _foodItem: food,
      message: `Added ${input.quantity || 1}x ${food.name} (₹${food.price} each) to cart`,
    });
  },
  {
    name: "add_to_cart",
    description:
      "Add a food item to the customer's cart. Use this when the user explicitly asks to add something, says 'yes' to adding a suggestion, or says things like 'I'll take that'.",
    schema: z.object({
      foodId: z.number().describe("The ID of the food item to add"),
      quantity: z
        .number()
        .optional()
        .default(1)
        .describe("How many to add (default: 1)"),
    }),
  }
);

export const removeFromCartTool = tool(
  async (input) => {
    return JSON.stringify({
      success: true,
      action: "remove_from_cart",
      foodId: input.foodId,
      message: `Removed item ${input.foodId} from cart`,
    });
  },
  {
    name: "remove_from_cart",
    description:
      "Remove a food item from the customer's cart. Use this when the user asks to remove something from their order.",
    schema: z.object({
      foodId: z.number().describe("The ID of the food item to remove"),
    }),
  }
);

export const getCartTool = tool(
  async (input) => {
    // Cart state is passed from the client — we just echo it back
    // so the agent can discuss it
    return JSON.stringify({
      action: "show_cart",
      cart: input.cartSummary || "Cart is currently empty",
    });
  },
  {
    name: "get_cart",
    description:
      "View the customer's current cart contents. Use this when the user asks to see their order, wants to know what's in their cart, or before checkout.",
    schema: z.object({
      cartSummary: z
        .string()
        .optional()
        .describe("Current cart summary (provided by system)"),
    }),
  }
);

/** All tools bundled for the agent */
export const agentTools = [
  searchFoodTool,
  getFoodDetailsTool,
  getCategoriesList,
  addToCartTool,
  removeFromCartTool,
  getCartTool,
];
