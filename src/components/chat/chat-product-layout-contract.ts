/**
 * Chat Product Layout Contract (Phase 1)
 *
 * WHY: Locks scope and UX expectations before behavior changes.
 * This file is intentionally declarative; implementation happens in later phases.
 */

export const CHAT_PRODUCT_LAYOUT_SCOPE = {
  appliesTo: "chat",
  excludes: ["/menu"],
} as const;

export const CHAT_PRODUCT_LAYOUT_TARGET = {
  mode: "carousel-only",
  devices: ["mobile", "desktop"],
  interactions: {
    mobile: "swipe",
    desktop: ["horizontal-scroll", "arrow-buttons"],
  },
  behavior: {
    snapScrolling: true,
    revealNextCardPeek: true,
  },
} as const;

