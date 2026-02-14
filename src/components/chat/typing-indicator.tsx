"use client";

/**
 * Typing Indicator — animated dots
 * WHY: Visual feedback during AI processing. Three dots with
 * staggered animation create a natural "thinking" appearance.
 * Keeps users engaged while waiting for the agent response.
 */
export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in" role="status" aria-label="Assistant is typing">
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-black text-sm font-bold">
        S
      </div>

      {/* Dots */}
      <div className="rounded-2xl rounded-tl-sm bg-[var(--background-secondary)] border border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-[var(--foreground-muted)]"
              style={{
                animation: "pulse-dot 1.4s infinite ease-in-out",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
