import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names conditionally, and resolves conflicts between
 * Tailwind utilities correctly (e.g. a component's own "bg-white" vs. a
 * caller's override "bg-navy"). Without twMerge, two classes for the
 * same CSS property both end up in the output string, and which one
 * actually wins depends on their order in Tailwind's generated
 * stylesheet, not the order they appear here, that's a real bug that
 * happened (see Card's bg-white default silently beating a caller's
 * bg-navy override), not a hypothetical one, hence pulling this in
 * despite the general preference for fewer dependencies.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
