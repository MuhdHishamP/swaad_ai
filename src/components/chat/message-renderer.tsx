"use client";

import { MessageBubble } from "./message-bubble";
import { FoodCardGrid } from "./food-card-grid";
import { CartSummaryCard } from "./cart-summary";
import type { Message, MessageBlock, FoodItem } from "@/types";

interface MessageRendererProps {
  message: Message;
  onAddToCart?: (food: FoodItem, quantity: number) => void;
}

/**
 * Message Renderer — the bridge between AI structured output and React components.
 * 
 * WHY: This is the KEY DIFFERENTIATOR of the entire app. Instead of
 * rendering plain text, the AI returns structured blocks with types
 * that map 1:1 to React components:
 * 
 *   "text"           → MessageBubble (plain text)
 *   "food_cards"     → FoodCardGrid (rich food cards with images)
 *   "cart_summary"   → CartSummaryCard (cart overview)
 *   "checkout_prompt → CartSummaryCard with checkout CTA
 * 
 * Each message can contain MULTIPLE blocks, so a single AI response
 * can show text + food cards + a cart update simultaneously.
 */
export function MessageRenderer({ message, onAddToCart }: MessageRendererProps) {
  // User messages are always plain text
  if (message.role === "user") {
    return (
      <div className="animate-fade-in-up">
        <MessageBubble message={message} />
      </div>
    );
  }

  // Assistant messages may have structured blocks
  const blocks = message.blocks;

  // Fallback: no blocks → render as plain text
  if (!blocks || blocks.length === 0) {
    return (
      <div className="animate-fade-in-up">
        <MessageBubble message={message} />
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in-up">
      {blocks.map((block, index) => (
        <BlockRenderer
          key={`${message.id}-block-${index}`}
          block={block}
          message={message}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}

/** Renders a single block based on its type. */
function BlockRenderer({
  block,
  message,
  onAddToCart,
}: {
  block: MessageBlock;
  message: Message;
  onAddToCart?: (food: FoodItem, quantity: number) => void;
}) {
  switch (block.type) {
    case "text":
      return (
        <MessageBubble
          message={{
            ...message,
            content: block.content,
          }}
        />
      );

    case "food_cards":
      return (
        <div className="pl-11">
          {/* pl-11 aligns with assistant bubble (avatar width + gap) */}
          <FoodCardGrid
            items={block.items}
            onAddToCart={onAddToCart}
          />
        </div>
      );

    case "cart_summary":
      return (
        <div className="pl-11">
          <CartSummaryCard items={block.items} total={block.total} />
        </div>
      );

    case "checkout_prompt":
      return (
        <div className="pl-11">
          <CartSummaryCard items={block.items} total={block.total} />
        </div>
      );

    default:
      return null;
  }
}
