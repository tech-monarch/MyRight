import { clsx, type ClassValue } from "clsx";

/**
 * Merges class names conditionally. Kept deliberately simple (no
 * tailwind-merge) since the design system doesn't rely on conflicting
 * utility overrides -- components pass explicit variants instead.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
