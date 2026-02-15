"use client";

import { cn } from "@/lib/utils";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
}

/**
 * Message Bubble — renders user and assistant text messages.
 * WHY: Distinct visual treatment for each role:
 * - User: right-aligned, primary color background
 * - Assistant: left-aligned, with avatar, subtle background
 * This follows established chat UI conventions.
 */
export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-black text-sm font-bold">
          S
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-[var(--primary)] text-black"
            : "rounded-tl-sm bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)]"
        )}
      >
        {/* Render text with basic formatting */}
        <div className="whitespace-pre-wrap break-words">
          {formatMessageText(message.content)}
        </div>
      </div>
    </div>
  );
}

/**
 * Basic text formatting for assistant messages.
 * Handles: bold (**text**), bullet points, and monetary values.
 */
function formatMessageText(text: string): React.ReactNode {
  // Clean up any trailing/leading whitespace per line
  const lines = text.split("\n").map((line) => line.trimEnd());

  return lines.map((line, lineIdx) => {
    // Basic bold parsing: **text**
    const parts = line.split(/(\*\*.*?\*\*)/g);
    
    return (
      <div key={lineIdx}>
        {parts.map((part, partIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={partIdx} className="font-bold">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        })}
      </div>
    );
  });
}
