"use client";

/**
 * BookDetail — full-page detail view for a single book (route /book/[id]).
 *
 * The layout deliberately mirrors the approved All Books modal design
 * (cover left, details right, category chip, tags, description, owner
 * footer) scaled up for a full page, wrapped in the site's dark header
 * band + slate & amber glass visual language.
 *
 * Server-side: BookDetail receives the already-fetched book (or null on
 * failure/unknown id). It is a client component so the cover image can
 * handle load/error fallback states — and so the borrow button can talk
 * to the active session.
 */

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";

import {
  ArrowLeft,
  BookOpen,
  BookMarked,
  BookX,
  CalendarDays,
  CircleCheck,
  Copy,
  Feather,
  Ghost,
  Heart,
  Landmark,
  Layers,
  Library,
  LoaderCircle,
  Rocket,
  Sparkles,
  Sprout,
  Smile,
  Tag,
  TriangleAlert,
  UserRound,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface BookData {
  _id: string;
  title: string;
  author: string;
  category: string;
  tags?: string;
  imageUrl?: string;
  description?: string;
  ownerName?: string;
  ownerEmail?: string;
  createdAt?: string;
  /** Physical copies from the Add Book form. */
  totalCopies?: number;
  /** Copies currently free to borrow (decreases on every borrow). */
  availableCopies?: number;
}

/* -------------------------------------------------------------------------- */
/*  Category icons (module-scope mapping — React Compiler-safe pattern)       */
/* -------------------------------------------------------------------------- */

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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

const DEFAULT_CATEGORY_ICON = BookOpen;

const FALLBACK_COLORS = [
  "from-amber-200 via-amber-50 to-amber-100",
  "from-slate-200 via-slate-50 to-slate-100",
  "from-amber-100 via-orange-50 to-amber-200",
  "from-slate-100 via-amber-50 to-slate-200",
];

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
/*  Cover image with load / error fallback states                             */
/* -------------------------------------------------------------------------- */

function CoverImage({
  book,
  tintIndex,
}: {
  book: BookData;
  tintIndex: number;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");

  if (state === "error" || !book.imageUrl) {
    const tint = FALLBACK_COLORS[tintIndex % FALLBACK_COLORS.length];
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br ${tint}`}
        aria-label={`No cover available for ${book.title}`}
      >
        <BookOpen className="size-10 text-amber-500/70" aria-hidden />
        <span className="px-6 text-center font-semibold text-slate-600/80 line-clamp-3">
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
        src={book.imageUrl}
        alt={`Cover of ${book.title}`}
        decoding="async"
        onLoad={() => setState("loaded")}
        onError={() => setState("error")}
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          state === "loaded" ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Loading skeleton (streaming fallback + route loading)                     */
/* -------------------------------------------------------------------------- */

export function DetailSkeleton() {
  return (
    <section className="relative min-h-screen overflow-x-clip bg-[linear-gradient(180deg,#f8fafc,#ffffff_35%,#fffbeb)]">
      {/* Header band */}
      <div className="relative overflow-hidden bg-neutral-950 pb-14 pt-20 sm:pb-16 sm:pt-24">
        <div className="mx-auto max-w-3xl space-y-4 px-6 text-center">
          <div className="mx-auto h-5 w-36 animate-pulse rounded-full bg-white/10" />
          <div className="mx-auto h-12 w-72 animate-pulse rounded-xl bg-white/10" />
          <div className="mx-auto h-4 w-64 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>

      {/* Detail card shell */}
      <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6">
        <div className="flex flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/50 backdrop-blur-xl sm:flex-row">
          <div className="ab-shimmer aspect-[3/4] w-full shrink-0 bg-gradient-to-br from-slate-100 via-white to-amber-50 sm:w-72" />
          <div className="flex w-full flex-1 flex-col gap-3 p-6 sm:p-8">
            <div className="ab-shimmer h-5 w-32 rounded-full" />
            <div className="ab-shimmer h-8 w-3/4 rounded-lg" />
            <div className="ab-shimmer h-4 w-40 rounded-lg" />
            <div className="mt-4 space-y-2">
              <div className="ab-shimmer h-3.5 w-full rounded" />
              <div className="ab-shimmer h-3.5 w-11/12 rounded" />
              <div className="ab-shimmer h-3.5 w-10/12 rounded" />
            </div>
            <div className="ab-shimmer mt-6 h-11 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Unknown book state                                                        */
/* -------------------------------------------------------------------------- */

function BookNotFound() {
  return (
    <section className="relative min-h-screen overflow-x-clip bg-[linear-gradient(180deg,#f8fafc,#ffffff_35%,#fffbeb)]">
      <header className="relative overflow-hidden bg-neutral-950 pb-14 pt-20 text-white sm:pb-16 sm:pt-24">
        <div
          className="hero-in mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
          style={{ animationDelay: "0ms" }}
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
            <Library className="size-3.5 text-amber-400" aria-hidden />
            Book details
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Book not found
          </h1>
          <p className="mt-4 text-sm text-white/60 sm:text-base">
            This title is no longer on the shelf.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-4 pb-24 pt-12 sm:px-6">
        <div className="hero-in flex flex-col items-center gap-5 rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/60 p-10 text-center backdrop-blur-md sm:p-14">
          <span className="flex size-16 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-500 shadow-lg shadow-amber-400/20">
            <BookX className="size-7" aria-hidden />
          </span>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Nothing to show here
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-slate-500">
            The book you are looking for isn&apos;t in the collection. It may have
            been removed, or the link is incorrect.
          </p>
          <Link
            href="/all-books"
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to All Books
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main detail view                                                          */
/* -------------------------------------------------------------------------- */

export default function BookDetail({ book }: { book: BookData | null }) {
  // Unknown / removed / failed fetch → friendly not-found state.
  // (The guard stays here so the content component always mounts WITH a
  // book, keeping its React hooks unconditional.)
  if (!book || typeof book.title !== "string" || !book.title.trim()) {
    return <BookNotFound />;
  }

  return <BookDetailContent book={book} />;
}

/* -------------------------------------------------------------------------- */
/*  Borrow action                                                             */
/* -------------------------------------------------------------------------- */

/**
 * BorrowPanel — "Available Copies" display + the Borrow This Book button.
 *
 * Copy counts are managed by the backend:
 *  - POST /borrow-book atomically decrements the counter only when a
 *    copy is free, and refuses a second active borrow by the same user.
 * The panel only reflects the value the backend returns.
 */
function BorrowPanel({
  book,
  className,
}: {
  book: BookData;
  className?: string;
}) {
  const { data: session, isPending } = useSession();

  // Starts from the server-rendered value and updates after every response.
  const [availableCopies, setAvailableCopies] = useState(
    book.availableCopies ?? book.totalCopies
  );
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /** Ask the backend to borrow one copy for the logged-in user. */
  const handleBorrow = async () => {
    if (!session?.user) return;

    setIsBorrowing(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Identity (userId / userName / userEmail) is only informational —
      // the backend verifies the Bearer JWT itself and never trusts the
      // body for who is borrowing.
      const response = await fetch("/api/backend/borrow-book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: book._id,
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(data?.error || "Could not borrow this book. Please try again.");
        return;
      }

      setSuccessMessage("Book borrowed! You can return it any time from My Borrows.");
      if (typeof data?.availableCopies === "number") {
        setAvailableCopies(data.availableCopies);
      }
    } catch (error) {
      console.error("Borrow error:", error);
      setErrorMessage("Could not borrow this book. Please try again.");
    } finally {
      setIsBorrowing(false);
    }
  };

  const copiesLabel = availableCopies === undefined ? "Not specified" : availableCopies;
  const noCopies = availableCopies !== undefined && availableCopies <= 0;

  return (
    <div className={className}>
      {/* Copies + action */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-slate-50/80 p-3.5 backdrop-blur-md">
        {/* The clear "Available Copies" label */}
        <p
          className={`flex items-center gap-2 text-sm font-medium ${
            noCopies ? "text-red-600" : "text-slate-700"
          }`}
        >
          <Copy className="size-4 shrink-0 text-slate-400" aria-hidden />
          Available Copies:{" "}
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
              noCopies
                ? "bg-red-100 text-red-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {copiesLabel}
          </span>
        </p>

        {/* While the session loads, keep the space stable (nothing yet). */}
        {isPending ? null : !session ? (
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-amber-300/70 hover:bg-amber-50 hover:text-slate-900"
          >
            <BookMarked className="size-4" aria-hidden />
            Log in to borrow
          </Link>
        ) : noCopies ? (
          // Zero copies left → the borrow button is disabled with this label.
          <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-200/80 px-4 py-2.5 text-sm font-semibold text-slate-400">
            <BookX className="size-4" aria-hidden />
            Currently Unavailable
          </span>
        ) : (
          <button
            type="button"
            onClick={handleBorrow}
            disabled={isBorrowing}
            className="group inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-400/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-300 disabled:pointer-events-none disabled:opacity-60"
          >
            {isBorrowing ? (
              <>
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
                Borrowing...
              </>
            ) : (
              <>
                <BookMarked className="size-4" aria-hidden />
                Borrow This Book
              </>
            )}
          </button>
        )}
      </div>

      {/* Borrow result messages */}
      {successMessage && (
        <p
          role="status"
          className="mt-2 flex items-start gap-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/80 p-3.5 text-sm text-emerald-800"
        >
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          {successMessage}
        </p>
      )}

      {errorMessage && (
        <p
          role="alert"
          className="mt-2 flex items-start gap-2.5 rounded-xl border border-red-200/80 bg-red-50/80 p-3.5 text-sm text-red-700"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {errorMessage}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main detail view (book always present)                                    */
/* -------------------------------------------------------------------------- */

function BookDetailContent({ book }: { book: BookData }) {
  const Icon = CATEGORY_ICONS[book.category] ?? DEFAULT_CATEGORY_ICON;
  const added = formatAdded(book.createdAt);
  const tags = [
    ...new Set((book.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean)),
  ];

  return (
    <section className="relative overflow-x-clip bg-[linear-gradient(180deg,#f8fafc,#ffffff_35%,#fffbeb)]">
      {/* ------------------------ Ambient backdrop ----------------------- */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-24 left-1/4 size-[24rem] rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute top-1/2 -right-32 size-[26rem] rounded-full bg-slate-300/25 blur-3xl" />
        <div className="absolute bottom-1/4 -left-24 size-[22rem] rounded-full bg-amber-200/20 blur-3xl" />
      </div>

      {/* --------------------------- Header band ------------------------- */}
      <header className="relative overflow-hidden bg-neutral-950 pb-14 pt-20 text-white sm:pb-16 sm:pt-24">
        <div
          className="pointer-events-none absolute -top-24 right-1/4 size-72 rounded-full border border-white/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-40 right-32 size-96 rounded-full border border-white/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 left-1/2 size-80 rounded-full bg-amber-400/10 blur-3xl"
          aria-hidden
        />

        <div
          className="hero-in relative mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
          style={{ animationDelay: "0ms" }}
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
            <Library className="size-3.5 text-amber-400" aria-hidden />
            Book details
          </p>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {book.title}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">
            Everything about this title — cover, story, tags and who shared it.
          </p>
        </div>
      </header>

      {/* --------------------------- Detail card ------------------------- */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-20 sm:px-6 sm:pb-24">
        {/* Back link */}
        <Link
          href="/all-books"
          className="hero-in mt-8 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300/70 hover:bg-white/80 hover:text-slate-900"
          style={{ animationDelay: "120ms" }}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to All Books
        </Link>

        {/* Card (mirrors the approved modal panel) */}
        <div
          className="hero-in mt-8 flex flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/60 shadow-2xl shadow-slate-950/10 ring-1 ring-white/40 backdrop-blur-xl backdrop-saturate-150 sm:flex-row"
          style={{ animationDelay: "220ms" }}
        >
          {/* Cover side */}
          <div className="w-full shrink-0 sm:w-72">
            <div className="relative aspect-[3/4] w-full">
              <CoverImage book={book} tintIndex={0} />
            </div>
          </div>

          {/* Details side */}
          <div className="flex flex-1 flex-col gap-3 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/80 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                <Icon className="size-3" aria-hidden />
                {book.category}
              </span>
              {added && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                  <CalendarDays className="size-3" aria-hidden />
                  Added {added}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
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
            <p className="mt-1 text-sm leading-relaxed text-slate-600 sm:text-base">
              {book.description}
            </p>

            {/* Available copies + borrow action */}
            <BorrowPanel book={book} className="mt-3" />

            {/* Owner footer */}
            <p className="mt-auto border-t border-slate-100 pt-3 text-xs text-slate-400">
              Shared by{" "}
              <span className="font-medium text-slate-500">
                {book.ownerName || "Anonymous"}
              </span>
            </p>
          </div>
        </div>

        {/* CTA row */}
        <div className="hero-in mt-10 flex flex-wrap items-center justify-center gap-4" style={{ animationDelay: "320ms" }}>
          <Link
            href="/all-books"
            className="group inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-400/25 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-amber-300"
          >
            <BookOpen className="size-4" aria-hidden />
            Browse more books
          </Link>
        </div>
      </div>
    </section>
  );
}
