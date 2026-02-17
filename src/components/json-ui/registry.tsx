"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "muted" | "success" | "warning" | "danger";

export interface JsonUiTextProps {
  text?: string;
  tone?: Tone;
  align?: "left" | "center" | "right";
  size?: "sm" | "md" | "lg";
  weight?: "normal" | "medium" | "semibold" | "bold";
}

export interface JsonUiStackProps {
  direction?: "vertical" | "horizontal";
  gap?: number;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
}

export interface JsonUiBadgeProps {
  label?: string;
  tone?: Tone;
}

export interface JsonUiImageProps {
  src?: string;
  alt?: string;
  aspectRatio?: "1:1" | "4:3" | "16:9";
}

export interface JsonUiCtaButtonProps {
  label?: string;
  action?: "open_menu" | "show_cart" | "checkout";
  variant?: "primary" | "secondary" | "ghost";
}

function toneClass(tone?: Tone): string {
  switch (tone) {
    case "muted":
      return "text-[var(--foreground-muted)]";
    case "success":
      return "text-[var(--success)]";
    case "warning":
      return "text-[var(--primary)]";
    case "danger":
      return "text-[var(--error)]";
    default:
      return "text-[var(--foreground)]";
  }
}

export const jsonUiRegistry = {
  text: (props: JsonUiTextProps) => (
    <p
      className={cn(
        toneClass(props.tone),
        props.align === "center" && "text-center",
        props.align === "right" && "text-right",
        props.size === "sm" && "text-xs",
        props.size === "md" && "text-sm",
        props.size === "lg" && "text-base",
        props.weight === "medium" && "font-medium",
        props.weight === "semibold" && "font-semibold",
        props.weight === "bold" && "font-bold"
      )}
    >
      {props.text ?? ""}
    </p>
  ),

  stack: (props: JsonUiStackProps, children: ReactNode) => (
    <div
      className={cn(
        "w-full",
        props.direction === "horizontal" ? "flex flex-row" : "flex flex-col",
        props.align === "start" && "items-start",
        props.align === "center" && "items-center",
        props.align === "end" && "items-end",
        props.align === "stretch" && "items-stretch",
        props.justify === "start" && "justify-start",
        props.justify === "center" && "justify-center",
        props.justify === "end" && "justify-end",
        props.justify === "between" && "justify-between"
      )}
      style={{ gap: `${Math.min(Math.max(props.gap ?? 2, 0), 8) * 0.25}rem` }}
    >
      {children}
    </div>
  ),

  badge: (props: JsonUiBadgeProps) => (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        "border-[var(--border)] bg-[var(--background-tertiary)]",
        toneClass(props.tone)
      )}
    >
      {props.label ?? ""}
    </span>
  ),

  image: (props: JsonUiImageProps) => {
    const ratioClass =
      props.aspectRatio === "1:1"
        ? "aspect-square"
        : props.aspectRatio === "4:3"
          ? "aspect-[4/3]"
          : "aspect-video";

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={props.src}
        alt={props.alt ?? ""}
        className={cn(
          "w-full rounded-lg border border-[var(--border)] object-cover",
          ratioClass
        )}
        loading="lazy"
      />
    );
  },

  cta_button: (
    props: JsonUiCtaButtonProps,
    onAction?: (action: string, label?: string) => void
  ) => (
    <button
      type="button"
      onClick={() => {
        if (typeof props.action !== "string") return;
        const safeLabel = typeof props.label === "string" ? props.label : undefined;
        onAction?.(props.action, safeLabel);
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        props.variant === "secondary" &&
          "border border-[var(--border)] bg-[var(--background-tertiary)] text-[var(--foreground)] hover:bg-[var(--background-elevated)]",
        props.variant === "ghost" &&
          "text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)]",
        (!props.variant || props.variant === "primary") &&
          "bg-[var(--primary)] text-black hover:bg-[var(--primary-hover)]"
      )}
    >
      {props.label ?? "Continue"}
    </button>
  ),
} as const;

export type JsonUiComponentType = keyof typeof jsonUiRegistry;
