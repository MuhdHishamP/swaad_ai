// ============================================================
// Core Domain Types
// WHY: Centralized type definitions ensure consistency across
// the entire stack — from data layer to AI responses to UI.
// All types derive from the Foods.json schema.
// ============================================================

/** Mirrors the structure of each item in Foods.json */
export interface FoodItem {
  id: number;
  name: string;
  image: string;
  description: string;
  category: string;
  type: "Vegetarian" | "Non-Vegetarian";
  spiceLevel: string;
  ingredients: string[];
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  price: number;
  serves: number;
  /** Some items have size-based pricing variants */
  sizeVariants?: SizeVariant[];
}

export interface SizeVariant {
  size: string;
  price: number;
}

// ============================================================
// Cart Types
// WHY: Cart items extend FoodItem with quantity and optional
// size selection. Keeping this separate from FoodItem avoids
// polluting the data layer with UI state.
// ============================================================

export interface CartItem {
  food: FoodItem;
  quantity: number;
  selectedSize?: string;
  /** Resolved price based on size selection or base price */
  unitPrice: number;
}

// ============================================================
// Chat / AI Response Types
// WHY: The AI agent returns structured blocks that map 1:1
// to React components. This type system is the contract between
// the backend AI and the frontend renderer.
// ============================================================

/** Union of all possible block types the AI can return */
export type MessageBlockType =
  | "text"
  | "food_cards"
  | "cart_summary"
  | "checkout_prompt"
  | "cart_action";

export interface TextBlock {
  type: "text";
  content: string;
}

export interface FoodCardsBlock {
  type: "food_cards";
  items: FoodItem[];
}

export interface CartSummaryBlock {
  type: "cart_summary";
  items: CartItem[];
  total: number;
}

export interface CheckoutPromptBlock {
  type: "checkout_prompt";
  items: CartItem[];
  total: number;
}

export interface CartActionBlock {
  type: "cart_action";
  action: "add" | "remove";
  foodItem?: FoodItem;
  foodId?: number;
  quantity: number;
}

export type MessageBlock =
  | TextBlock
  | FoodCardsBlock
  | CartSummaryBlock
  | CheckoutPromptBlock
  | CartActionBlock;

/** A single message in the conversation */
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Structured blocks for rich UI rendering (assistant only) */
  blocks?: MessageBlock[];
  timestamp: number;
}

// ============================================================
// Order & User Types
// ============================================================

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  pincode: string;
  instructions?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  deliveryAddress: DeliveryAddress;
  paymentMethod: "cod";
  status: "confirmed" | "preparing" | "out_for_delivery" | "delivered";
  createdAt: number;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

// ============================================================
// API Types
// ============================================================

export interface ChatRequest {
  message: string;
  sessionId: string;
  /** Current cart state so AI can reference it */
  cart?: CartItem[];
}

export interface ChatResponse {
  blocks: MessageBlock[];
  /** Raw text content for screen readers / fallback */
  textContent: string;
}

export interface ApiError {
  error: string;
  code: string;
  details?: string;
}
