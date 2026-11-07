import React, { Suspense } from "react";
import { connection } from "next/server";
import HeroSection from "@/components/compo/HeroSection";
import NewArrivelsPage, {
  type ArrivalBook,
} from "@/components/compo/NewArrivels";
import HowBorrowingWorks from "@/components/compo/HowBorrowingWorks";
import ReaderReviews from "@/components/compo/ReaderReviews";
import { fetchNewArrivals } from "@/lib/public-books";

/**
 * Home — hero section + dynamic New Arrivals + two static sections.
 *
 * The book data is fetched directly HERE in the page file (no separate
 * component/hook/service) from the existing API:
 *   GET ${process.env.BACKEND_URL}/new-arrivals
 * The backend sorts by `createdAt: -1` and limits the response to six, so
 * the page receives exactly the newest books without client-side trimming.
 * The fetch
 * streams in behind a Suspense skeleton so the hero shows instantly.
 *
 * "How Borrowing Works" and "Reader Reviews" are static sections
 * (self-contained copy, no API involvement).
 */
export default function Home() {
  return (
    <>
      <HeroSection />

      <Suspense fallback={<ArrivelsSkeleton />}>
        <NewArrivalsLoader />
      </Suspense>

      <HowBorrowingWorks />

      <ReaderReviews />
    </>
  );
}

/** Fetches the latest six books from the public API. */
async function NewArrivalsLoader() {
  await connection();

  let books: ArrivalBook[] = [];

  try {
    // This endpoint never reads a session; MongoDB sorts and limits the data.
    books = (await fetchNewArrivals()) as ArrivalBook[];
  } catch (error) {
    console.error("Failed to load New Arrivals:", error);
    books = []; // API unreachable → the section shows its empty state
  }

  return <NewArrivelsPage books={books} />;
}

/** Loading skeleton that mirrors the New Arrivals section. */
function ArrivelsSkeleton() {
  return (
    <section className="relative overflow-x-clip">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
        {/* Header placeholders */}
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <div className="mx-auto h-5 w-44 animate-pulse rounded-full bg-slate-200" />
          <div className="mx-auto h-10 w-64 animate-pulse rounded-xl bg-slate-200" />
          <div className="mx-auto h-4 w-80 animate-pulse rounded-full bg-slate-200" />
        </div>

        {/* Card placeholders */}
        <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/50 backdrop-blur-xl"
            >
              <div className="ab-shimmer aspect-[3/4] bg-gradient-to-br from-slate-100 via-white to-amber-50" />
              <div className="space-y-3 p-5">
                <div className="ab-shimmer h-5 w-20 rounded-full" />
                <div className="ab-shimmer h-5 w-full rounded-lg" />
                <div className="ab-shimmer h-11 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* "See All Books" placeholder */}
        <div className="mt-12 flex justify-center">
          <div className="ab-shimmer h-14 w-52 rounded-full bg-gradient-to-r from-slate-100 via-white to-amber-50" />
        </div>
      </div>
    </section>
  );
}
