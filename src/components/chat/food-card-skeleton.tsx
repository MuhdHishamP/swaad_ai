"use client";

import { cn } from "@/lib/utils";

interface FoodCardSkeletonProps {
  compact?: boolean;
}

/**
 * Skeleton loader for FoodCard.
 * Mimics the structure of FoodCard with pulsing gray boxes.
 */
export function FoodCardSkeleton({ compact = false }: FoodCardSkeletonProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] flex flex-col animate-pulse",
        compact ? "w-[260px] shrink-0" : "w-full h-full"
      )}
    >
      {/* Image Skeleton */}
      <div className="relative aspect-[4/3] bg-[var(--background-tertiary)] shrink-0" />

      {/* Content Skeleton */}
      <div className="p-3 flex flex-col flex-grow space-y-3">
        {/* Name & Category */}
        <div className="space-y-2">
          <div className="h-4 w-3/4 rounded bg-[var(--background-tertiary)]" />
          <div className="h-3 w-1/2 rounded bg-[var(--background-tertiary)]" />
        </div>

        {/* Description (only if not compact) */}
        {!compact && (
          <div className="space-y-1">
            <div className="h-2 w-full rounded bg-[var(--background-tertiary)]" />
            <div className="h-2 w-5/6 rounded bg-[var(--background-tertiary)]" />
          </div>
        )}

        {/* Nutrition Badges */}
        <div className="flex gap-2 pt-1">
          <div className="h-5 w-12 rounded bg-[var(--background-tertiary)]" />
          <div className="h-5 w-12 rounded bg-[var(--background-tertiary)]" />
        </div>

        {/* Price & Button Skeleton - Pushed to bottom */}
        <div className="flex items-center justify-between pt-3 mt-auto">
          <div className="h-6 w-16 rounded bg-[var(--background-tertiary)]" />
          <div className="h-8 w-20 rounded-lg bg-[var(--background-tertiary)]" />
        </div>
      </div>
    </div>
  );
}
