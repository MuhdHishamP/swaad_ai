// ============================================================
// Rate Limiter — Token Bucket Algorithm
// WHY: Protects against runaway AI API costs. Gemini charges
// per token, so we rate-limit at the request level. Token bucket
// is simple yet effective — allows bursts while enforcing an
// average rate. In-memory is fine since this is a single-server app.
// ============================================================

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

/**
 * Simple in-memory rate limiter using token bucket algorithm.
 * 
 * Config rationale:
 * - 10 requests/minute per session — generous for normal use,
 *   prevents abuse (a real conversation rarely exceeds 5 msg/min)
 * - 30 global requests/minute — protects total API spend
 * - Burst of 5 — lets users send a few rapid messages
 */
const SESSION_LIMIT = 10; // requests per minute per session
const GLOBAL_LIMIT = 30;  // requests per minute total
const REFILL_RATE_MS = 60_000; // 1 minute window

const sessionBuckets = new Map<string, TokenBucket>();
const globalBucket: TokenBucket = {
  tokens: GLOBAL_LIMIT,
  lastRefill: Date.now(),
};

function refillBucket(bucket: TokenBucket, maxTokens: number): void {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;

  if (elapsed >= REFILL_RATE_MS) {
    bucket.tokens = maxTokens;
    bucket.lastRefill = now;
  }
}

/**
 * Checks if a request is allowed for the given session.
 * Returns { allowed: true } or { allowed: false, retryAfterMs }.
 */
export function checkRateLimit(sessionId: string): {
  allowed: boolean;
  retryAfterMs?: number;
} {
  // Global check
  refillBucket(globalBucket, GLOBAL_LIMIT);
  if (globalBucket.tokens <= 0) {
    const retryAfterMs = REFILL_RATE_MS - (Date.now() - globalBucket.lastRefill);
    return { allowed: false, retryAfterMs };
  }

  // Session check
  if (!sessionBuckets.has(sessionId)) {
    sessionBuckets.set(sessionId, {
      tokens: SESSION_LIMIT,
      lastRefill: Date.now(),
    });
  }

  const sessionBucket = sessionBuckets.get(sessionId)!;
  refillBucket(sessionBucket, SESSION_LIMIT);

  if (sessionBucket.tokens <= 0) {
    const retryAfterMs =
      REFILL_RATE_MS - (Date.now() - sessionBucket.lastRefill);
    return { allowed: false, retryAfterMs };
  }

  // Consume tokens
  globalBucket.tokens--;
  sessionBucket.tokens--;

  return { allowed: true };
}

/**
 * Cleanup stale sessions to prevent memory leaks.
 * WHY: Sessions that haven't sent a message in 10 minutes
 * are unlikely to return. Runs on a 5-minute interval.
 */
const STALE_THRESHOLD_MS = 10 * 60 * 1000;

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [sessionId, bucket] of sessionBuckets.entries()) {
      if (now - bucket.lastRefill > STALE_THRESHOLD_MS) {
        sessionBuckets.delete(sessionId);
      }
    }
  }, 5 * 60 * 1000);
}
