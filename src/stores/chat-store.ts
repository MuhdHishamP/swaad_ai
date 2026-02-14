// ============================================================
// Chat Store — Zustand
// WHY: Zustand over Context API for its minimal boilerplate,
// built-in selector optimization (no unnecessary re-renders),
// and straightforward persistence. The store manages messages,
// loading state, and communicates with the chat API.
// ============================================================

import { create } from "zustand";
import type { Message, MessageBlock, CartItem } from "@/types";
import { generateId } from "@/lib/utils";

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;

  /** Send a message and get AI response */
  sendMessage: (content: string, cart?: CartItem[]) => Promise<void>;
  /** Add a message directly (for system messages or cart updates) */
  addMessage: (message: Message) => void;
  /** Clear all messages */
  clearMessages: () => void;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Session ID for conversation continuity.
 * WHY: Generated once per browser session, stored in sessionStorage.
 * This maps to the server-side conversation memory so the agent
 * maintains context across messages within a single visit.
 */
function getSessionId(): string {
  if (typeof window === "undefined") return "server";

  let sessionId = sessionStorage.getItem("swaad-session-id");
  if (!sessionId) {
    sessionId = generateId();
    sessionStorage.setItem("swaad-session-id", sessionId);
  }
  return sessionId;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  sendMessage: async (content: string, cart?: CartItem[]) => {
    const trimmed = content.trim();
    if (!trimmed || get().isLoading) return;

    // Optimistic: add user message immediately
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          sessionId: getSessionId(),
          cart,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        // Rate limiting — show specific message
        if (response.status === 429) {
          throw new Error(
            errorData?.error || "Too many messages. Please wait a moment."
          );
        }

        throw new Error(
          errorData?.error || `Request failed (${response.status})`
        );
      }

      const data: { blocks: MessageBlock[]; textContent: string } =
        await response.json();

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: data.textContent,
        blocks: data.blocks,
        timestamp: Date.now(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      // Add error as assistant message so user sees it in chat
      const errorMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: errorMessage,
        blocks: [{ type: "text", content: errorMessage }],
        timestamp: Date.now(),
      };

      set((state) => ({
        messages: [...state.messages, errorMsg],
        isLoading: false,
        error: errorMessage,
      }));
    }
  },

  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  clearMessages: () => {
    set({ messages: [], error: null });
    // Clear server-side memory too
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("swaad-session-id");
    }
  },

  clearError: () => set({ error: null }),
}));
