/**
 * Shared book types + small parsing helpers used by both the All Books
 * showcase (client component) and the book detail page (server component).
 */

/** Shape of a community book as delivered by the API / stored in Mongo. */
export interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  tags?: string;
  imageUrl?: string;
  description?: string;
  ownerName?: string;
  ownerEmail?: string;
  createdAt?: string | Date;
}

/** Parse the comma-separated `tags` string into unique trimmed label chips. */
export function parseBookTags(tags?: string): string[] {
  return [...new Set((tags ?? "").split(",").map((t) => t.trim()).filter(Boolean))];
}

/**
 * Format an optional date (ISO string or Date), e.g. "Nov 2026".
 * Returns null when the value is absent or unparseable.
 */
export function formatBookDate(date?: string | Date) {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}
