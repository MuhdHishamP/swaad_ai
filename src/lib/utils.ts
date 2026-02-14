import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes with conflict resolution.
 * WHY: shadcn/ui convention — allows component consumers to
 * override styles without specificity wars.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as Indian Rupee currency.
 * WHY: Consistent currency display across all components.
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Resolves the image path for a food item.
 * WHY: Food images are stored in the public directory under /food-images/.
 * The Foods.json references them as "images/filename.png" —
 * this normalizes that to the actual served path.
 */
export function getFoodImagePath(imagePath: string): string {
  const filename = imagePath.replace("images/", "");
  return `/food-images/${filename}`;
}

/**
 * Truncates text to a maximum length, adding ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Generates a simple unique ID.
 * WHY: Used for message IDs and temporary client-side identifiers.
 * Avoids the need for uuid in client bundles.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
