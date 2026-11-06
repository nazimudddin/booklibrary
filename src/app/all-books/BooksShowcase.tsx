"use client";

/**
 * BooksShowcase — premium redesign of the All Books page.
 *
 * Renders the books fetched by the All Books page (the API call stays in
 * the server component; this file only receives the fetched data as the
 * `books` prop — the backend/API behaviour is untouched).
 *
 * Features
 *  1. "All Books" header band + attractive introduction section.
 *  2. Live title search with result count and clear button.
 *  3. Six category filter pills (top categories by count) + an "All Books"
 *     option; clicking a category shows only its books.
 *  4. Responsive cover-image cards with entrance staggering, hover lift,
 *     a shine sweep and an animated "View Details" reveal.
 *  5. Book detail modal (cover, description, tags, owner) with fade/pop
 *     animation, Escape + overlay-click close and body scroll lock.
 *  6. A gradient "Go to Detail Page" button inside the modal that
 *     navigates to /book/[id] (the book detail dynamic route).
 *  7. Loading skeleton, empty-search and image-fallback states.
 *
 * The visual language follows the site's shared design: frosted glass,
 * slate + amber palette, dark neutral header bands and the global
 * `hero-in` entrance keyframes from globals.css.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Eye,
  Library,
  RotateCcw,
  Search,
  SearchX,
  Tag,
  UserRound,
  X,
} from "lucide-react";

/* Shared book type, tag/date helpers and the category icon map live in
   `src/lib/types.ts` / `src/lib/categories.ts` (used by the detail page too). */
import { CategoryGlyph } from "@/lib/categories";
import { formatBookDate, parseBookTags, type Book } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

/* The `Book` interface lives in `src/lib/types.ts` and is shared with the
   /all-books/[id] detail page (same shape as the API / Mongo documents). */

/* -------------------------------------------------------------------------- */
/*  Category presentation                                                     */
/* -------------------------------------------------------------------------- */

/** All Books pill label — the sentinel value for "no category filter". */
const ALL_CATEGORY = "All Books";

/** Limit on how many category pills are shown (besides All Books). */
const MAX_CATEGORY_PILLS = 6;

/* Category -> icon mapping is shared from `src/lib/categories.ts`. */

/**
 * The top `n` categories by book count (ties broken alphabetically) —
 * the six filter pills shown under the search bar.
 */
function topCategories(books: Book[], n: number) {
  const counts = new Map<string, number>();
  for (const book of books) {
    const key = book.category?.trim() || "Other";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([category, count]) => ({ category, count }));
}

/* -------------------------------------------------------------------------- */
/*  Frosted field style (matches the shared design system)                    */
/* -------------------------------------------------------------------------- */

const GLASS_FIELD =
  "w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2.5 text-sm text-slate-900 shadow-sm backdrop-blur-md placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-amber-400/70 focus:bg-white/70 focus:ring-3 focus:ring-amber-400/25";

/* -------------------------------------------------------------------------- */
/*  Book cover with image-fallback state                                      */
/* -------------------------------------------------------------------------- */

const FALLBACK_COLORS = [
  "from-amber-200 via-amber-50 to-amber-100",
  "from-slate-200 via-slate-50 to-slate-100",
  "from-amber-100 via-orange-50 to-amber-200",
  "from-slate-100 via-amber-50 to-slate-200",
];

/**
 * Renders a cover image with three states: loading shimmer while it loads,
 * the image itself once loaded (with a soft fade-in + hover zoom), and an
 * elegant gradient fallback (initials + book icon) if the URL fails.
 */
function BookCover({
  book,
  index,
  className = "",
}: {
  book: Book;
  index: number;
  /** Extra classes for the `img` element itself (used in the modal). */
  className?: string;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");

  // A new book ID resets the state (matters for reused cards).
  const key = book._id;

  if (state === "error" || !book.imageUrl) {
    const tint = FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br ${tint}`}
        aria-label={`No cover available for ${book.title}`}
      >
        <BookOpen
          className="size-8 text-amber-500/70 sm:size-10"
          aria-hidden
        />
        <span className="px-3 text-center text-sm font-semibold tracking-wide text-slate-600/80 line-clamp-3">
          {book.title}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {state === "loading" && (
        <div
          className="absolute inset-0 ab-shimmer bg-gradient-to-br from-slate-100 via-white to-amber-50"
          aria-hidden
        />
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={key}
        src={book.imageUrl}
        alt={`Cover of ${book.title}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setState("loaded")}
        onError={() => setState("error")}
        className={`h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.06] ${
          state === "loaded" ? "opacity-100" : "opacity-0"
        } ${className}`}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Small helpers                                                             */
/* -------------------------------------------------------------------------- */

/* Date + tag formatting helpers are shared from `src/lib/types.ts`. */

/* -------------------------------------------------------------------------- */
/*  Book card                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Responsive frosted-glass card. The outer div carries the staggered
 * entrance animation (CSS animation fill overrides transforms, so hover
 * transforms live on the inner article instead).
 */
function BookCard({
  book,
  index,
  onOpen,
}: {
  book: Book;
  index: number;
  onOpen: (book: Book) => void;
}) {
  const added = formatBookDate(book.createdAt);

  return (
    // Outer wrapper: staggered entrance only.
    <div className="hero-in" style={{ animationDelay: `${Math.min(index * 60, 600)}ms` }}>
      <article
        role="button"
        tabIndex={0}
        aria-label={`View details for ${book.title}`}
        onClick={() => onOpen(book)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(book);
          }
        }}
        className="group/card flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/55 shadow-sm shadow-slate-950/5 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 outline-none hover:-translate-y-1.5 hover:border-amber-400/50 hover:bg-white/75 hover:shadow-2xl hover:shadow-amber-400/20 focus-visible:ring-3 focus-visible:ring-amber-400/40"
      >
        {/* ---------------------------- Cover ---------------------------- */}
        <div className="relative aspect-[3/4] shrink-0 overflow-hidden">
          <BookCover book={book} index={index} />

          {/* Shine sweep on hover */}
          <span
            className="pointer-events-none absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover/card:translate-x-full"
            aria-hidden
          />

          {/* Dark gradient foot for the View Details reveal */}
          <div
            className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-neutral-950/80 via-neutral-950/25 to-transparent pb-4 pt-12 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
            aria-hidden
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(book);
              }}
              className="mx-4 flex w-[calc(100%-2rem)] translate-y-4 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-neutral-950 opacity-0 shadow-lg shadow-amber-400/25 transition-all duration-300 delay-75 ease-out hover:bg-amber-300 group-hover/card:translate-y-0 group-hover/card:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
            >
              <Eye className="size-4" aria-hidden />
              View Details
            </button>
          </div>
        </div>

        {/* ---------------------------- Text ----------------------------- */}
        <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
          {/* Category chip */}
          <span
            className="mr-auto inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/80 px-2.5 py-1 text-[11px] font-semibold text-amber-700"
          >
            <CategoryGlyph category={book.category} className="size-3" />
            {book.category}
          </span>

          {/* Title — full text, no truncation */}
          <h3 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
            {book.title}
          </h3>

          {/* Author */}
          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            <UserRound className="size-3.5 shrink-0 text-slate-400" aria-hidden />
            <span className="truncate">{book.author}</span>
          </p>

          {/* Meta footer */}
          <p className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-slate-400">
            {added ? (
              <>
                <CalendarDays className="size-3" aria-hidden />
                Added {added}
              </>
            ) : (
              <>
                <Library className="size-3" aria-hidden />
                Community shelf
              </>
            )}
          </p>
        </div>
      </article>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Book detail modal                                                         */
/* -------------------------------------------------------------------------- */

function BookModal({ book, onClose }: { book: Book; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const added = formatBookDate(book.createdAt);
  const tags = parseBookTags(book.tags);

  // Scroll lock + Escape key + initial focus.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${book.title}`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 ab-fade-in bg-neutral-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 size-[28rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-amber-400/10 blur-3xl"
        aria-hidden
      />

      {/* Panel */}
      <div className="ab-pop-in relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/60 bg-white/90 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:rounded-3xl">
        {/* Close */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-neutral-900/80 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:rotate-90 hover:bg-neutral-800 focus-visible:ring-3 focus-visible:ring-amber-400/50 outline-none"
        >
          <X className="size-4" aria-hidden />
        </button>

        <div className="flex max-h-[85vh] flex-col overflow-y-auto sm:flex-row">
          {/* Cover side */}
          <div className="w-full shrink-0 sm:w-56">
            <div className="relative aspect-[3/4] w-full">
              <BookCover book={book} index={0} />
            </div>
          </div>

          {/* Details side */}
          <div className="flex flex-1 flex-col gap-3 p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-2 pr-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/80 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                <CategoryGlyph category={book.category} className="size-3" />
                {book.category}
              </span>
              {added && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                  <CalendarDays className="size-3" aria-hidden />
                  Added {added}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {book.title}
            </h2>

            <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <UserRound className="size-4 text-slate-400" aria-hidden />
              {book.author}
            </p>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag className="size-3 text-slate-400" aria-hidden />
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mt-1 max-h-44 overflow-y-auto pr-1 sm:max-h-56">
              <p className="text-sm leading-relaxed text-slate-600">
                {book.description}
              </p>
            </div>

            {/* --------------- Go to the full detail page --------------- */}
            <Link
              href={`/book/${encodeURIComponent(book._id)}`}
              onClick={onClose}
              className="group/link relative mt-4 block w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 px-6 py-3.5 text-center text-sm font-bold text-neutral-950 shadow-lg shadow-amber-400/30 ring-1 ring-amber-300/60 outline-none transition-all duration-300 ease-out hover:-translate-y-0.5 hover:from-amber-300 hover:via-amber-400 hover:to-orange-300 hover:shadow-xl hover:shadow-amber-500/40 focus-visible:ring-3 focus-visible:ring-amber-500/50 active:translate-y-0 active:scale-[0.99]"
            >
              {/* Shine sweep on hover */}
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 ease-out group-hover/link:translate-x-full"
                aria-hidden
              />

              <span className="relative inline-flex items-center justify-center gap-2">
                <BookOpen
                  className="size-4 transition-transform duration-300 group-hover/link:scale-110 group-hover/link:-rotate-6"
                  aria-hidden
                />
                Go to Detail Page
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover/link:translate-x-1"
                  aria-hidden
                />
              </span>
            </Link>

            {/* Owner footer */}
            <p className="mt-auto border-t border-slate-100 pt-3 text-xs text-slate-400">
              Shared by <span className="font-medium text-slate-500">{book.ownerName || "Anonymous"}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Skeleton (streaming fallback + route loading)                             */
/* -------------------------------------------------------------------------- */

export function BooksSkeleton() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fafc,#ffffff_40%,#fffbeb)]">
      {/* Header band */}
      <div className="relative overflow-hidden bg-neutral-950 pb-14 pt-16 sm:pb-16 sm:pt-20">
        <div className="mx-auto max-w-3xl space-y-4 px-6 text-center">
          <div className="mx-auto h-5 w-40 animate-pulse rounded-full bg-white/10" />
          <div className="mx-auto h-12 w-64 animate-pulse rounded-xl bg-white/10" />
          <div className="mx-auto h-4 w-80 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>

      {/* Cards */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-7 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/50 backdrop-blur-xl"
          >
            <div className="ab-shimmer aspect-[3/4] bg-gradient-to-br from-slate-100 via-white to-amber-50" />
            <div className="space-y-3 p-5">
              <div className="ab-shimmer h-5 w-20 rounded-full" />
              <div className="ab-shimmer h-5 w-full rounded-lg" />
              <div className="ab-shimmer h-4 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export default function BooksShowcase({ books }: { books: Book[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [selected, setSelected] = useState<Book | null>(null);

  const openBook = useCallback((book: Book) => setSelected(book), []);
  const closeBook = useCallback(() => setSelected(null), []);

  const clearFilters = useCallback(() => {
    setQuery("");
    setActiveCategory(ALL_CATEGORY);
  }, []);

  /** Six category pills for the current data. */
  const pills = useMemo(() => topCategories(books, MAX_CATEGORY_PILLS), [books]);

  /** Unique category count for the stats strip. */
  const categoryCount = useMemo(
    () => new Set(books.map((b) => (b.category?.trim() || "Other"))).size,
    [books]
  );

  /** Filtered set: active category + case-insensitive title search. */
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return books.filter((book) => {
      const inCategory =
        activeCategory === ALL_CATEGORY ||
        (book.category?.trim() || "Other") === activeCategory;
      const inSearch = !needle || book.title.toLowerCase().includes(needle);
      return inCategory && inSearch;
    });
  }, [books, query, activeCategory]);

  return (
    <div className="relative overflow-x-clip bg-[linear-gradient(180deg,#f8fafc,#ffffff_35%,#fffbeb)]">
      {/* ------------------------ Ambient backdrop ----------------------- */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-24 left-1/4 size-[24rem] rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute top-1/2 -right-32 size-[26rem] rounded-full bg-slate-300/25 blur-3xl" />
        <div className="absolute bottom-1/4 -left-24 size-[22rem] rounded-full bg-amber-200/20 blur-3xl" />
      </div>

      {/* ============================ Header ============================ */}
      <header className="relative overflow-hidden bg-neutral-950 pb-16 pt-20 text-white sm:pb-20 sm:pt-24">
        {/* Decorative glass circles */}
        <div className="pointer-events-none absolute -top-24 right-1/4 size-72 rounded-full border border-white/10" aria-hidden />
        <div className="pointer-events-none absolute -top-40 right-32 size-96 rounded-full border border-white/10" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 left-1/2 size-80 rounded-full bg-amber-400/10 blur-3xl" aria-hidden />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
          {/* Eyebrow */}
          <p
            className="hero-in inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm"
            style={{ animationDelay: "0ms" }}
          >
            <Library className="size-3.5 text-amber-400" aria-hidden />
            Our collection
          </p>

          {/* Header title */}
          <h1
            className="hero-in mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "90ms" }}
          >
            All Books
          </h1>

          <p
            className="hero-in mt-4 text-sm leading-relaxed text-white/60 sm:text-base"
            style={{ animationDelay: "180ms" }}
          >
            Every title on our shelves — browsable, searchable and ready when you are.
          </p>
        </div>
      </header>

      {/* ========================= Introduction ========================= */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6" aria-label="Introduction">
        <div className="hero-in mx-auto mt-14 max-w-2xl text-center sm:mt-16" style={{ animationDelay: "260ms" }}>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-balance sm:text-3xl">
            Find your next{" "}
            <span className="relative inline-block text-amber-500">
              great read
              <svg
                className="absolute -bottom-1.5 left-0 w-full text-amber-300"
                viewBox="0 0 120 8"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M2 6C30 2 90 2 118 6"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
            Wander through classics, sci-fi, romance, self-help and more — a living
            library shaped by our readers and community.
          </p>
        </div>

        {/* Stats strip */}
        <dl
          className="hero-in mx-auto mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 sm:mt-10"
          style={{ animationDelay: "340ms" }}
        >
          <div className="text-center">
            <dd className="text-2xl font-bold text-slate-900 tabular-nums">{books.length}</dd>
            <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">
              Titles
            </dt>
          </div>
          <div className="text-center">
            <dd className="text-2xl font-bold text-slate-900 tabular-nums">{categoryCount}</dd>
            <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">
              Categories
            </dt>
          </div>
          <div className="text-center">
            <dd className="text-2xl font-bold text-slate-900">∞</dd>
            <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">
              Stories to explore
            </dt>
          </div>
        </dl>

        {/* =========================== Search =========================== */}
        <div
          className="hero-in mx-auto mt-10 max-w-xl sm:mt-12"
          style={{ animationDelay: "420ms" }}
        >
          <div className="group relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-amber-500"
              aria-hidden
            />

            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books by title..."
              aria-label="Search books by title"
              className={`${GLASS_FIELD} rounded-full py-3.5 pl-11 pr-12 text-base shadow-md shadow-slate-950/5 focus:shadow-lg focus:shadow-amber-400/20`}
            />

            {/* Clear button */}
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200/80 text-slate-500 transition-all duration-200 hover:scale-110 hover:bg-slate-300/80 hover:text-slate-700"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </div>

          {/* Live result count */}
          <p
            className="mt-3 text-center text-xs tabular-nums text-slate-400 transition-opacity duration-300"
            aria-live="polite"
          >
            {query.trim() || activeCategory !== ALL_CATEGORY
              ? `${filtered.length} ${filtered.length === 1 ? "book" : "books"} found`
              : "Search or filter the collection below"}
          </p>
        </div>

        {/* ====================== Category filters ====================== */}
        <div
          className="hero-in mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3"
          style={{ animationDelay: "500ms" }}
          role="group"
          aria-label="Filter by category"
        >
          <button
            type="button"
            onClick={() => setActiveCategory(ALL_CATEGORY)}
            aria-pressed={activeCategory === ALL_CATEGORY}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 outline-none hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-amber-400/40 sm:px-5 ${
              activeCategory === ALL_CATEGORY
                ? "bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/30"
                : "border border-white/60 bg-white/60 text-slate-700 shadow-sm backdrop-blur-md hover:border-amber-300/70 hover:bg-white/80 hover:text-slate-900"
            }`}
          >
            <Library className="size-4" aria-hidden />
            All Books
            <span
              className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                activeCategory === ALL_CATEGORY
                  ? "bg-neutral-950/10 text-neutral-950"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {books.length}
            </span>
          </button>

          {pills.map(({ category, count }) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 outline-none hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-amber-400/40 sm:px-5 ${
                  isActive
                    ? "bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/30"
                    : "border border-white/60 bg-white/60 text-slate-700 shadow-sm backdrop-blur-md hover:border-amber-300/70 hover:bg-white/80 hover:text-slate-900"
                }`}
              >
                <CategoryGlyph
                  category={category}
                  className={`size-4 transition-colors duration-300 ${
                    isActive ? "text-neutral-950" : "text-amber-500"
                  }`}
                />
                {category}
                <span
                  className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                    isActive ? "bg-neutral-950/10 text-neutral-950" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ========================= Books grid ========================= */}
        <div className="relative z-10 pb-20 sm:pb-24">
          {filtered.length > 0 ? (
            <div
              key={`${activeCategory}`}
              className="mt-10 grid grid-cols-2 gap-4 sm:mt-12 sm:gap-7 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filtered.map((book, index) => (
                <BookCard key={book._id} book={book} index={index} onOpen={openBook} />
              ))}
            </div>
          ) : (
            /* ---------------------- Empty state ---------------------- */
            <div className="hero-in mx-auto mt-12 max-w-xl sm:mt-16">
              <div className="flex flex-col items-center gap-5 rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/60 p-10 text-center backdrop-blur-md sm:p-14">
                <span className="flex size-16 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-500 shadow-lg shadow-amber-400/20">
                  <SearchX className="size-7" aria-hidden />
                </span>

                {books.length === 0 ? (
                  <>
                    <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                      The shelf is empty
                    </h3>
                    <p className="max-w-sm text-sm leading-relaxed text-slate-500">
                      No books have been added to the library yet. Be the first to
                      share a wonderful read with the community.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                      No matching books
                    </h3>
                    <p className="max-w-sm text-sm leading-relaxed text-slate-500">
                      {query.trim() ? (
                        <>
                          We couldn&apos;t find a title matching{" "}
                          <span className="font-semibold text-slate-700">
                            “{query.trim()}”
                          </span>
                          {activeCategory !== ALL_CATEGORY && ` in ${activeCategory}`}. Try a
                          different search or category.
                        </>
                      ) : (
                        <>
                          Nothing in <span className="font-semibold text-slate-700">{activeCategory}</span>{" "}
                          yet. Try another category or browse all books.
                        </>
                      )}
                    </p>
                  </>
                )}

                {/* Reset button (only when filters are active) */}
                {(query || activeCategory !== ALL_CATEGORY) && books.length > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-1 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800"
                  >
                    <RotateCcw className="size-4" aria-hidden />
                    Clear search
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ======================= Details modal ======================= */}
        {selected && <BookModal book={selected} onClose={closeBook} />}
      </section>
    </div>
  );
}
