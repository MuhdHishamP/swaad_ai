"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

/**
 * Chat Input Bar
 * WHY: Auto-expanding textarea (not input) for multi-line messages.
 * Shift+Enter for new lines, Enter to send — standard chat UX.
 * Input stays disabled during AI processing to prevent double-sends.
 */
export function ChatInput({
  onSend,
  isLoading,
  placeholder = "Ask about our menu, dietary options, or place an order...",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      if (input) {
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
      }
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    onSend(trimmed);
    setInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-[var(--border)] bg-[var(--background)] p-3 sm:p-4">
      <div className="mx-auto flex max-w-3xl flex-nowrap items-center gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className={cn(
              "w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] px-4 py-3 pr-12 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] placeholder:truncate overflow-hidden",
              "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all"
            )}
            aria-label="Chat message input"
            id="chat-input"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all",
            input.trim() && !isLoading
              ? "bg-[var(--primary)] text-black hover:bg-[var(--primary-hover)] shadow-lg shadow-[var(--primary-glow)]"
              : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)] cursor-not-allowed"
          )}
          aria-label="Send message"
          id="send-button"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>

      <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-[var(--foreground-muted)]">
        Swaad AI can make mistakes. Prices and availability may vary.
      </p>
    </div>
  );
}
