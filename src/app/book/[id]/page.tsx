import React, { Suspense } from "react";
import BookDetail, { DetailSkeleton } from "./BookDetail";

export const instant = false;

/**
 * BookDetailPage — detail page for a single book at /book/[id].
 *
 * The API request lives right here in the page file: it fetches one book
 * by its MongoDB `_id` from the existing community backend
 * (GET `${process.env.BACKEND_URL}/book/[id]` with `cache: "no-store"`).
 * The backend books collection itself is untouched by the page.
 *
 * Suspense so the detail skeleton streams in while the API responds;
 * BookDetail (the design component) just receives the fetched book.
 */
const BookDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      {/* The params promise is awaited inside the boundary so the page
          keeps a static shell (Cache Components requirement). */}
      <BookLoader paramsPromise={params} />
    </Suspense>
  );
};

/** Fetches the requested book directly from the single-book API. */
async function BookLoader({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  let book = null;

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/book/${encodeURIComponent(id)}`,
      { cache: "no-store" }
    );

    if (response.ok) {
      book = await response.json();
    }
  } catch {
    book = null; // server unreachable → friendly not-found state
  }

  return <BookDetail book={book} />;
}

export default BookDetailPage;
