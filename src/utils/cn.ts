import clsx, { type ClassValue } from "clsx";
import { type ClassNameValue, extendTailwindMerge } from "tailwind-merge";

const twMerge: (...classLists: ClassNameValue[]) => string =
  extendTailwindMerge<string, string>({
    extend: {
      classGroups: {
        "text-title": ["text-title"],
        "text-h1": ["text-h1"],
        "text-h2": ["text-h2"],
        "text-h3": ["text-h3"],
        "text-h4": ["text-h4"],
        "text-large": ["text-large"],
        "text-default": ["text-default"],
        "text-small": ["text-small"],
        "text-action": ["text-action"],
        "text-link": ["text-link"],
      },
      conflictingClassGroups: {
        "text-title": [],
        "text-h1": [],
        "text-h2": [],
        "text-h3": [],
        "text-h4": [],
        "text-large": [],
        "text-default": [],
        "text-small": [],
        "text-action": [],
        "text-link": [],
      },
    },
  });

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
