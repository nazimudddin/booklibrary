/**
 * Route-level loading UI for /all-books — a premium skeleton mirroring
 * the real page: dark header band, search placeholder and frosted
 * cover-card shells with a shimmer sweep.
 */
import { BooksSkeleton } from "./BooksShowcase";

export default function Loading() {
  return <BooksSkeleton />;
}
