// ============================================================
// Chat API Route — POST /api/chat
// WHY: Server-side API route keeps the Gemini API key secure
// and the agent logic off the client bundle. Next.js App Router
// route handlers are ideal — no separate server needed.
//
// Request: { message: string, sessionId: string, cart?: CartItem[] }
// Response: { blocks: MessageBlock[], textContent: string }
//   or: { error: string, code: string } on failure
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/ai/agent";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import type { ChatRequest, CartItem } from "@/types";

/**
 * POST /api/chat
 * Handles chat messages from the frontend.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: ChatRequest = await request.json();

    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json(
        { error: "Message is required", code: "INVALID_MESSAGE" },
        { status: 400 }
      );
    }

    if (!body.sessionId || typeof body.sessionId !== "string") {
      return NextResponse.json(
        { error: "Session ID is required", code: "INVALID_SESSION" },
        { status: 400 }
      );
    }

    // Sanitize — prevent prompt injection via excessively long messages
    const message = body.message.trim().slice(0, 1000);
    const sessionId = body.sessionId.trim().slice(0, 64);
    const cart: CartItem[] | undefined = body.cart;

    // Rate limiting
    const rateCheck = checkRateLimit(sessionId);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please wait a moment.",
          code: "RATE_LIMITED",
          retryAfterMs: rateCheck.retryAfterMs,
        },
        { status: 429 }
      );
    }

    // Invoke the AI agent
    const result = await chat(message, sessionId, cart);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Chat API Error]", error);

    // Differentiate between known errors and unexpected failures
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body", code: "PARSE_ERROR" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Something went wrong. Please try again.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * Reject non-POST methods with proper status.
 * WHY: Explicit method handling is better than silent 404s.
 */
export async function GET() {
  return NextResponse.json(
    {
      error: "This endpoint only accepts POST requests",
      code: "METHOD_NOT_ALLOWED",
    },
    { status: 405 }
  );
}
