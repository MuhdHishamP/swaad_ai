// ============================================================
// AI Agent — LangChain + Gemini Integration
// WHY: createReactAgent from LangGraph gives us a production-grade
// agent loop with built-in tool calling, error recovery, and
// message history. Using Gemini 2.5 Flash for its speed, cost
// efficiency, and strong function-calling capabilities.
//
// Architecture Decision: We use an agent (not a chain) because
// the conversation requires dynamic tool selection — the agent
// decides WHEN to search, WHEN to add to cart, WHEN to just chat.
// A static chain can't handle this flexibility.
// ============================================================

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent } from "langchain";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { agentTools } from "./tools";
import { buildSystemPrompt } from "./prompts";
import type { FoodItem, MessageBlock, CartItem } from "@/types";

// ============================================================
// Conversation Memory
// WHY: In-memory Map keyed by sessionId. Each session stores
// the last 20 messages to maintain context without token bloat.
// 20 messages ≈ 10 user-agent turns — covers most ordering
// sessions. Older messages are evicted FIFO.
//
// Trade-off: In-memory means sessions don't survive server restart.
// Acceptable for this use case — food ordering sessions are short.
// For production at scale, use Redis or a database.
// ============================================================

const MAX_HISTORY = 20;
const conversationMemory = new Map<string, BaseMessage[]>();

function getHistory(sessionId: string): BaseMessage[] {
  return conversationMemory.get(sessionId) || [];
}

function addToHistory(
  sessionId: string,
  messages: BaseMessage[]
): void {
  const history = getHistory(sessionId);
  history.push(...messages);

  // Evict oldest messages if over limit
  if (history.length > MAX_HISTORY) {
    const excess = history.length - MAX_HISTORY;
    history.splice(0, excess);
  }

  conversationMemory.set(sessionId, history);
}

// ============================================================
// Agent Initialization
// WHY: Lazy initialization — we only create the model and agent
// when first needed. This avoids errors on import when the API
// key isn't set (e.g., during build).
// ============================================================

let agentInstance: ReturnType<typeof createAgent> | null = null;

function getAgent() {
  if (agentInstance) return agentInstance;

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_API_KEY is not set. Add it to .env.local"
    );
  }

  /**
   * Model choice: configurable via environment variable, defaults to gemini-2.5-flash
   * WHY: Best balance of speed, cost, and capability for this use case.
   * - Fast responses (< 2s typical) → good chat UX
   * - Excellent function calling support
   * - Much cheaper than gemini-1.5-pro
   * - Sufficient quality for food recommendations
   */
  const model = new ChatGoogleGenerativeAI({
    model: process.env.GOOGLE_GEMINI_MODEL || "gemini-2.5-flash",
    apiKey,
    temperature: 0.7, // Warm personality, but not too random
    maxOutputTokens: 1024, // Cap output length to control costs
  });

  agentInstance = createAgent({
    model,
    tools: agentTools,
  });

  return agentInstance;
}

// ============================================================
// Response Processing
// WHY: The agent's tool calls contain _foodItems metadata that
// we extract to build structured MessageBlocks for the frontend.
// This separation keeps the AI focused on conversation while
// the frontend gets exact data it needs for rendering.
// ============================================================

interface AgentResult {
  blocks: MessageBlock[];
  textContent: string;
}

/**
 * Extracts food items from tool call results embedded in AI messages.
 * Tool results contain _foodItems arrays that we parse out.
 */
function extractFoodItemsFromMessages(messages: BaseMessage[]): FoodItem[] {
  const foodItemMap = new Map<number, FoodItem>();

  for (const msg of messages) {
    // Tool messages contain the result JSON
    if (msg._getType() === "tool") {
      try {
        const content =
          typeof msg.content === "string"
            ? msg.content
            : JSON.stringify(msg.content);
        const parsed = JSON.parse(content);

        if (parsed._foodItems && Array.isArray(parsed._foodItems)) {
          for (const item of parsed._foodItems) {
            foodItemMap.set(item.id, item);
          }
        }
        if (parsed._foodItem) {
          foodItemMap.set(parsed._foodItem.id, parsed._foodItem);
        }
      } catch {
        // Tool result wasn't JSON or didn't have food items — that's fine
      }
    }
  }

  return Array.from(foodItemMap.values());
}

/**
 * Extracts cart actions from tool results, including the full food item data.
 */
function extractCartActions(
  messages: BaseMessage[]
): Array<{ action: string; foodId?: number; foodItem?: FoodItem; quantity?: number; item?: Record<string, unknown> }> {
  const actions: Array<{
    action: string;
    foodId?: number;
    foodItem?: FoodItem;
    quantity?: number;
    item?: Record<string, unknown>;
  }> = [];

  for (const msg of messages) {
    if (msg._getType() === "tool") {
      try {
        const content =
          typeof msg.content === "string"
            ? msg.content
            : JSON.stringify(msg.content);
        const parsed = JSON.parse(content);

        if (parsed.action === "add_to_cart" && parsed.success) {
          actions.push({
            action: "add_to_cart",
            item: parsed.item,
            foodItem: parsed._foodItem as FoodItem | undefined,
            quantity: parsed.item?.quantity || 1,
          });
        }
        if (parsed.action === "remove_from_cart" && parsed.success) {
          actions.push({
            action: "remove_from_cart",
            foodId: parsed.foodId,
          });
        }
        if (parsed.action === "show_cart") {
          actions.push({ action: "show_cart" });
        }
      } catch {
        // Not a cart action
      }
    }
  }

  return actions;
}

/**
 * Processes the agent's response into structured blocks.
 */
function buildResponseBlocks(
  allMessages: BaseMessage[],
  finalText: string,
  cart?: CartItem[]
): MessageBlock[] {
  const blocks: MessageBlock[] = [];
  const foodItems = extractFoodItemsFromMessages(allMessages);
  const cartActions = extractCartActions(allMessages);

  // Add text block if agent produced a text response
  if (finalText.trim()) {
    blocks.push({ type: "text", content: finalText.trim() });
  }

  // Add food cards block if items were found
  if (foodItems.length > 0) {
    blocks.push({ type: "food_cards", items: foodItems });
  }

  // Add cart action blocks so the frontend can update the cart store
  for (const action of cartActions) {
    if (action.action === "add_to_cart" && action.foodItem) {
      blocks.push({
        type: "cart_action",
        action: "add",
        foodItem: action.foodItem,
        quantity: action.quantity || 1,
      });
    }
    if (action.action === "remove_from_cart" && action.foodId) {
      blocks.push({
        type: "cart_action",
        action: "remove",
        foodId: action.foodId,
        quantity: 1,
      });
    }
    if (action.action === "show_cart") {
      const cartItems: CartItem[] = cart || [];
      const total = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      blocks.push({
        type: "cart_summary",
        items: cartItems,
        total,
      });
    }
  }

  // If no blocks at all, ensure at least a text block
  if (blocks.length === 0) {
    blocks.push({
      type: "text",
      content: finalText || "I'm not sure how to help with that. Could you rephrase?",
    });
  }

  return blocks;
}

// ============================================================
// Main Chat Function
// ============================================================

/**
 * Sends a message to the AI agent and returns structured response blocks.
 * 
 * Flow:
 * 1. Build system prompt with cart context
 * 2. Load conversation history for session
 * 3. Invoke LangGraph agent (handles tool calling loop internally)
 * 4. Extract food items and cart actions from tool results
 * 5. Build structured MessageBlocks for frontend rendering
 * 6. Update conversation memory
 */
export async function chat(
  message: string,
  sessionId: string,
  cart?: CartItem[]
): Promise<AgentResult> {
  const agent = getAgent();

  // Build cart summary for the system prompt
  const cartSummary = cart && cart.length > 0
    ? cart
        .map(
          (item) =>
            `- ${item.quantity}x ${item.food.name} @ ₹${item.unitPrice} each`
        )
        .join("\n") + `\nTotal: ₹${cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)}`
    : "Cart is empty.";

  const systemPrompt = buildSystemPrompt(cartSummary);
  const history = getHistory(sessionId);

  // Compose messages for the agent
  const messages: BaseMessage[] = [
    new SystemMessage(systemPrompt),
    ...history,
    new HumanMessage(message),
  ];

  try {
    const result = await agent.invoke({
      messages,
    });

    // The agent returns all messages including intermediate tool calls.
    // Find the final AI message (the last one) for the text response.
    const responseMessages: BaseMessage[] = result.messages;
    const lastMessage = responseMessages[responseMessages.length - 1];

    // Extract text from the final AI message
    // WHY: LangChain messages can have string or ContentBlock[] content.
    // We handle both shapes safely.
    let finalText = "";
    if (typeof lastMessage.content === "string") {
      finalText = lastMessage.content;
    } else if (Array.isArray(lastMessage.content)) {
      finalText = lastMessage.content
        .filter((c): c is { type: "text"; text: string } =>
          typeof c === "object" && c !== null && "type" in c && c.type === "text" && "text" in c
        )
        .map((c) => c.text)
        .join("\n");
    }

    // Extract tool results from intermediate messages
    // The agent's messages include: [user, ...tool_calls, ...tool_results, final_ai]
    // We need the tool results (messages between user and final AI)
    const allResponseMessages = responseMessages.slice(messages.length);
    const blocks = buildResponseBlocks(allResponseMessages, finalText, cart);

    // Update conversation memory with just the user message and final AI response
    addToHistory(sessionId, [
      new HumanMessage(message),
      new AIMessage(finalText),
    ]);

    return {
      blocks,
      textContent: finalText,
    };
  } catch (error) {
    console.error("[AI Agent Error]", error);

    // Graceful fallback — don't crash, give user a useful response
    const fallbackMessage =
      error instanceof Error && error.message.includes("API_KEY")
        ? "I'm having trouble connecting to my brain right now. Please check the API key configuration."
        : "I hit a small snag processing your request. Could you try rephrasing? I'm here to help! 🍛";

    return {
      blocks: [{ type: "text", content: fallbackMessage }],
      textContent: fallbackMessage,
    };
  }
}
