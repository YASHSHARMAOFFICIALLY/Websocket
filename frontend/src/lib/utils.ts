import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge conditional class lists and dedupe conflicting Tailwind classes
// (e.g. "px-2" + "px-4" -> "px-4"). Used by every shadcn/ui component.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
