"use client";

import { useRef, useEffect, useState } from "react";
import { useChatStore } from "@/stores/chat-store";
import { useCartStore } from "@/stores/cart-store";
import { useCartProcessor } from "@/hooks/use-cart-processor";
import { MessageRenderer } from "./message-renderer";
import { ChatInput } from "./chat-input";
import { TypingIndicator } from "./typing-indicator";
import { FoodCardSkeleton } from "./food-card-skeleton";
import { Sparkles, ArrowDown } from "lucide-react";
import type { FoodItem } from "@/types";

/**
 * Chat Container — the main chat interface.
 * WHY: Full-height layout with:
 * - Scrollable message area that auto-scrolls to latest message
 * - Fixed input bar at the bottom
 * - Welcome screen for first-time users
 * 
 * Uses the chat store for all state management so components
 * stay dumb and testable.
 */
export function ChatContainer() {
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const addToCart = useCartStore((s) => s.addItem);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  
  // Custom hook to handle cart actions (add/remove) from AI messages
  useCartProcessor(messages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
    setUserScrolledUp(false);
  };

  // Check scroll position to toggle "New Message" button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    if (isNearBottom) {
      setShowScrollButton(false);
      setUserScrolledUp(false);
    } else {
      setUserScrolledUp(true);
    }
  };

  // Auto-scroll logic: only if user hasn't manually scrolled up
  useEffect(() => {
    if (!userScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (messages.length > 0) {
      // If new message arrives and user is scrolled up, show button
      setShowScrollButton(true);
    }
  }, [messages, isLoading, userScrolledUp]);

  const cartItems = useCartStore((s) => s.items);

  const handleSend = (content: string) => {
    sendMessage(content, cartItems);
  };

  const handleAddToCart = (food: FoodItem, quantity: number) => {
    addToCart(food, quantity);
  };

  // Quick suggestion chips for new users
  const suggestions = [
    "Show me vegetarian options 🌿",
    "What's spicy and popular? 🌶️",
    "I want something under ₹200",
    "Surprise me with a recommendation!",
  ];

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      {/* Messages area */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 relative scroll-smooth"
        role="log" 
        aria-live="polite" 
        aria-relevant="additions"
      >
        <div className="mx-auto max-w-3xl space-y-4 pb-4">
          {messages.length === 0 ? (
            <WelcomeScreen
              suggestions={suggestions}
              onSuggestionClick={handleSend}
            />
          ) : (
            <>
              {messages.map((message) => (
                <MessageRenderer
                  key={message.id}
                  message={message}
                  onAddToCart={handleAddToCart}
                />
              ))}
              {isLoading && (
                <div className="pl-11 space-y-2 animate-fade-in-up">
                  {/* Show a few skeleton cards to indicate "thinking about food" */}
                  <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                    <TypingIndicator />
                    <span>Finding the best options...</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[80%]">
                    <FoodCardSkeleton />
                    <FoodCardSkeleton />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Floating "New Message" / "Scroll to Bottom" Button */}
        {showScrollButton && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-10 animate-fade-in-up">
            <button
              onClick={scrollToBottom}
              className="flex items-center gap-2 bg-[var(--primary)] text-black px-4 py-2 rounded-full shadow-lg hover:bg-[var(--primary-hover)] transition-all font-medium text-sm"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Input bar — fixed at bottom */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}

/** Welcome screen shown when chat is empty. */
function WelcomeScreen({
  suggestions,
  onSuggestionClick,
}: {
  suggestions: string[];
  onSuggestionClick: (text: string) => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-in">
      {/* Brand icon */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)] text-black">
        <Sparkles className="h-8 w-8" />
      </div>

      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
        Welcome to <span className="text-gradient">Swaad AI</span>
      </h2>
      <p className="text-[var(--foreground-secondary)] mb-8 max-w-md">
        I&apos;m your AI food assistant. Tell me what you&apos;re craving, your
        dietary preferences, or just ask me to surprise you!
      </p>

      {/* Suggestion chips */}
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="rounded-full border border-[var(--border)] bg-[var(--background-secondary)] px-4 py-2 text-sm text-[var(--foreground-secondary)] transition-all hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
