import React from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ArrowRight,
  Library,
  Sparkles,
  Eye,
  UserRound,
} from "lucide-react";
import Image from "next/image";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface ArrivalBook {
  _id: string;
  title: string;
  author: string;
  category: string;
  imageUrl?: string;
  tags?: string;
  description?: string;
  ownerName?: string;
  ownerEmail?: string;
  createdAt?: string;
}

/** Format an optional createdAt date, e.g. "Nov 2026". */
function formatAdded(date?: string) {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * NewArrivelsPage — the "New Arrivals" section for the home page.
 *
 * It receives ONLY the fetched data via props (the fetching lives in the
 * home page file). Shows book cards (image, title, author, category and
 * a "View Details" button that navigates to /book/<_id>) plus a
 * "See All Books" button below the grid. Matches the site's frosted
 * glass + amber design with the shared `hero-in` entrance animation.
 */
const NewArrivelsPage = ({ books }: { books: ArrivalBook[] }) => {
  return (
    <section className="relative overflow-x-clip bg-[linear-gradient(180deg,#ffffff,#f8fafc_60%,#fffbeb)] py-20 sm:py-24">
      {/* Ambient backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-16 left-1/3 size-[22rem] rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute bottom-1/3 -left-24 size-[20rem] rounded-full bg-slate-300/25 blur-3xl" />
      </div>

      {/* --------------------------- Section heading --------------------------- */}
      <div
        className="hero-in relative mx-auto max-w-2xl px-4 text-center sm:px-6"
        style={{ animationDelay: "0ms" }}
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-700 backdrop-blur-sm">
          <Sparkles className="size-3.5 text-amber-500" aria-hidden />
          Fresh on the shelves
        </p>

        <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          New Arrivals
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
          The six most recent books shared with the library. Be the first to
          dive into something new.
        </p>
      </div>

      {/* ----------------------------- Empty state ----------------------------- */}
      {books.length === 0 ? (
        <div
          className="hero-in relative mx-auto mt-12 max-w-xl px-4 sm:px-6"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex flex-col items-center gap-5 rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/60 p-10 text-center backdrop-blur-md sm:p-14">
            <span className="flex size-16 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-500 shadow-lg shadow-amber-400/20">
              <Library className="size-7" aria-hidden />
            </span>
            <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
              No books yet
            </h3>
            <p className="max-w-sm text-sm leading-relaxed text-slate-500">
              The library is still empty. Be the first to share a wonderful
              read with the community.
            </p>
            <Link
              href="/all-books"
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800"
            >
              <ArrowRight className="size-4" aria-hidden />
              See All Books
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* ------------------------- Book cards grid ------------------------- */}
          <div className="relative z-10 mx-auto mt-12 max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book, index) => (
                // Entrance stagger on the wrapper; hover transforms live
                // on the inner card so animations never conflict.
                <div
                  key={book._id}
                  className="hero-in"
                  style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
                >
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/60 shadow-sm shadow-slate-950/5 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/50 hover:bg-white/75 hover:shadow-2xl hover:shadow-amber-400/20">
                    {/* Book image */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Image
                        src={book.imageUrl || "/images/placeholder-book.png"}
                        alt={`Cover of ${book.title}`}
                        unoptimized
                        loading="lazy"
                        width={400}
                        height={533}
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      />

                      {/* Shine sweep on hover */}
                      <span
                        className="pointer-events-none absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                        aria-hidden
                      />

                      {/* Latest badge */}
                      <span className="absolute left-3 top-3 z-10 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-950 shadow-md">
                        New
                      </span>
                    </div>

                    {/* Text + actions */}
                    <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
                      {/* Category */}
                      <p className="mr-auto inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/80 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                        {book.category}
                      </p>

                      {/* Title */}
                      <h3 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                        {book.title}
                      </h3>

                      {/* Author */}
                      <p className="flex items-center gap-1.5 text-sm text-slate-500">
                        <UserRound
                          className="size-3.5 shrink-0 text-slate-400"
                          aria-hidden
                        />
                        <span className="truncate">{book.author}</span>
                      </p>

                      {formatAdded(book.createdAt) && (
                        <p className="flex items-center gap-1.5 text-xs text-slate-400">
                          <CalendarDays className="size-3" aria-hidden />
                          Added {formatAdded(book.createdAt)}
                        </p>
                      )}

                      {/* View Details — opens the book's detail page */}
                      <Link
                        href={`/book/${book._id}`}
                        aria-label={`View details for ${book.title}`}
                        className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-400 hover:text-neutral-950 hover:shadow-lg hover:shadow-amber-400/30"
                      >
                        <Eye className="size-4" aria-hidden />
                        View Details
                        <ArrowRight
                          className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                          aria-hidden
                        />
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>

            {/* ------------------------ See All Books ------------------------ */}
            <div className="mt-12 flex justify-center">
              <Link
                href="/all-books"
                className="hero-in group inline-flex items-center gap-2 rounded-full bg-amber-400 px-8 py-4 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-400/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-amber-400/40"
                style={{ animationDelay: "220ms" }}
              >
                <Library className="size-4" aria-hidden />
                See All Books
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default NewArrivelsPage;
