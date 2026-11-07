import React, { Suspense } from "react";
import { connection } from "next/server";
import BooksShowcase from "./BooksShowcase";
import { BooksSkeleton } from "./BooksShowcase";
import type { Book } from "@/lib/types";
import { fetchPublicBooks } from "@/lib/public-books";

export const instant = false;

/**
 * AllBooksPage — fetches the collection from the existing API
 * (unchanged: POST-free GET with `cache: "no-store"`) and hands the
 * fetched data to the redesigned client showcase below.
 *
 * The fetch lives inside `BooksLoader` wrapped in <Suspense> so the
 * beautiful skeleton in `loading.tsx` / the fallback streams in while
 * the API responds — no backend or API behaviour is modified.
 */
const AllBooksPage = async () => {
  return (
    <Suspense fallback={<BooksSkeleton />}>
      <BooksLoader />
    </Suspense>
  );
};

/** Keeps the original fetch logic, but survives an unreachable API. */
async function BooksLoader() {
  // Render the public collection for each request. No session is read here.
  await connection();

  let books: Book[] = [];

  try {
    books = await fetchPublicBooks();
  } catch (error) {
    console.error("Failed to load All Books:", error);
    books = []; // server unreachable → the showcase shows its empty state
  }

  return <BooksShowcase books={books} />;
}

export default AllBooksPage;
