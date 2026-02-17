# Chat Carousel Migration Plan

## Objective
Move chat product-card rendering to a horizontal carousel UX on both mobile and desktop.

## Phase 1 (Implemented)
- Scope is explicitly chat-only.
- `/menu` remains grid-based and out of this migration.
- Target UX is defined as carousel-only.
- Mobile uses swipe interaction.
- Desktop uses horizontal scroll plus arrow buttons.
- Snap scrolling and visible next-card peek are required for discoverability.

## Current Status
- Contract is defined in `src/components/chat/chat-product-layout-contract.ts`.
- No runtime behavior changes were made in Phase 1.

## Next Phase
Phase 2 will apply the contract by removing grid fallback in the chat product list renderer.
