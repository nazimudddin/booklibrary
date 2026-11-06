import type { ComponentType } from "react";

import {
  BookOpen,
  Feather,
  Ghost,
  Heart,
  Landmark,
  Layers,
  Rocket,
  Smile,
  Sparkles,
  Sprout,
  UserRound,
} from "lucide-react";

/**
 * Category -> icon mapping shared by the All Books showcase and the book
 * detail page. Unknown categories fall back to a plain book icon so
 * dynamically-added categories never break the UI.
 */
export const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Fiction: BookOpen,
  Fantasy: Sparkles,
  "Science Fiction": Rocket,
  "Mystery & Thriller": Ghost,
  Romance: Heart,
  Biography: UserRound,
  History: Landmark,
  "Non-Fiction": Layers,
  "Self-Help": Sprout,
  Poetry: Feather,
  "Children's Books": Smile,
};

/** Default icon for categories without a dedicated mapping. */
export const DEFAULT_CATEGORY_ICON = BookOpen;

/**
 * Compiler-safe category icon renderer.
 *
 * Resolving the icon component *during render* (e.g.
 * `const Icon = CATEGORY_ICONS[...]`) trips the React Compiler rule
 * `react-hooks/static-components`, so this module-scope component
 * instead branches on the category and returns the known icon JSX
 * directly — no component variable is created while rendering.
 */
export function CategoryGlyph({
  category,
  className,
}: {
  category?: string;
  className?: string;
}) {
  switch (category?.trim()) {
    case "Fiction":
      return <BookOpen className={className} aria-hidden />;
    case "Fantasy":
      return <Sparkles className={className} aria-hidden />;
    case "Science Fiction":
      return <Rocket className={className} aria-hidden />;
    case "Mystery & Thriller":
      return <Ghost className={className} aria-hidden />;
    case "Romance":
      return <Heart className={className} aria-hidden />;
    case "Biography":
      return <UserRound className={className} aria-hidden />;
    case "History":
      return <Landmark className={className} aria-hidden />;
    case "Non-Fiction":
      return <Layers className={className} aria-hidden />;
    case "Self-Help":
      return <Sprout className={className} aria-hidden />;
    case "Poetry":
      return <Feather className={className} aria-hidden />;
    case "Children's Books":
      return <Smile className={className} aria-hidden />;
    default:
      return <BookOpen className={className} aria-hidden />;
  }
}
