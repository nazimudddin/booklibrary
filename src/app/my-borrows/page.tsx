"use client";

/**
 * MyBorrowsPage — the borrower's own borrowing history (route /my-borrows).
 *
 * Data comes from the existing Express backend through the Next.js Proxy:
 *   GET  /api/backend/my-borrows/:userId  → records joined with
 *                                                   their book info
 *   POST /api/backend/return-book      → flips a record from
 *                                                 "borrowed" to "returned"
 *                                                 AND increments the book's
 *                                                 available copies (the
 *                                                 backend guards against
 *                                                 returning twice).
 *
 * The page re-uses the site's visual language: dark header band, frosted
 * glass table card, amber accents and the shared entrance animations.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

import {
  ArrowLeft,
  BookOpen,
  BookX,
  CircleCheck,
  Library,
  LoaderCircle,
  Repeat,
  TriangleAlert,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface BorrowedBook {
  _id: string;
  title: string;
  author: string;
  imageUrl?: string;
}

interface BorrowRecord {
  _id: string;
  bookId: string;
  userName?: string;
  userEmail?: string;
  /** "borrowed" while the copy is out, "returned" afterwards. */
  status: "borrowed" | "returned";
  borrowedAt: string;
  returnedAt: string | null;
  /** Enriched book info from the backend join (may be missing if the book was removed). */
  book: BorrowedBook | null;
}

/** Format an ISO date like "Nov 5, 2026". */
function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function MyBorrowsPage() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  /** Records are keyed by borrow id so returning one is a cheap update. */
  const [records, setRecords] = useState<Record<string, BorrowRecord>>({});
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isReturning, setIsReturning] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /** Fetch this user's borrow records once the session id is known. */
  useEffect(() => {
    if (!userId) return;

    // The `ignore` flag stops a stale response from landing afterwards.
    let ignore = false;

    (async () => {
      try {
        const response = await fetch(
          `/api/backend/my-borrows/${encodeURIComponent(userId)}`
        );
        const data = await response.json();
        if (ignore) return;
        setRecords(
          Object.fromEntries(
            (Array.isArray(data) ? data : []).map(
              (r: BorrowRecord) => [r._id, r] as [string, BorrowRecord]
            )
          )
        );
        setHasLoaded(true);
      } catch (error) {
        console.error("My borrows fetch error:", error);
        if (!ignore) {
          setHasLoaded(true);
          setErrorMessage(
            "Could not load your borrows. Please refresh the page."
          );
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [userId]);

  /** Ask the backend to return one borrowed copy. */
  const handleReturn = async (borrowId: string) => {
    setIsReturning((prev) => ({ ...prev, [borrowId]: true }));
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // The backend allows returning only the caller's own borrow, so the
      // Bearer JWT must travel with the request.
      const response = await fetch("/api/backend/return-book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ borrowId }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(data?.error || "Could not return the book. Please try again.");
        return;
      }

      // The record is no longer "borrowed", so take its row off the table
      // immediately. The backend keeps it in MongoDB with status "returned"
      // and already stops listing it here.
      setRecords((prev) => {
        const next = { ...prev };
        delete next[borrowId];
        return next;
      });
      setSuccessMessage("Book returned — a copy is back on the shelf!");
    } catch (error) {
      console.error("Return error:", error);
      setErrorMessage("Could not return the book. Please try again.");
    } finally {
      setIsReturning((prev) => ({ ...prev, [borrowId]: false }));
    }
  };

  /* ------------------------------ Signed out ------------------------------ */

  if (!isPending && !session) {
    return (
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16">
        <div
          className="hero-in flex flex-col items-center gap-5 rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/60 p-10 text-center backdrop-blur-md sm:p-14"
          style={{ animationDelay: "0ms" }}
        >
          <span className="flex size-16 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-500 shadow-lg shadow-amber-400/20">
            <Library className="size-7" aria-hidden />
          </span>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Log in to see your borrows
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-slate-500">
            Your borrowed books and their due shelf keep every page of your
            reading journey in one place.
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Go to Login
          </Link>
        </div>
      </section>
    );
  }

  const recordList = Object.values(records);

  return (
    <section className="relative overflow-x-clip bg-[linear-gradient(180deg,#f8fafc,#ffffff_35%,#fffbeb)] pb-20">
      {/* --------------------------- Header band --------------------------- */}
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
            <Repeat className="size-3.5 text-amber-400" aria-hidden />
            Your borrowing history
          </p>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            My Borrows
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">
            Every book you borrowed — return one any time with a single click.
          </p>
        </div>
      </header>

      {/* ----------------------------- Table card -------------------------- */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-10 sm:px-6">
        {/* Result banners */}
        {successMessage && (
          <p
            role="status"
            className="hero-in flex items-start gap-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/80 p-3.5 text-sm text-emerald-800"
          >
            <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
            {successMessage}
          </p>
        )}

        {errorMessage && (
          <p
            role="alert"
            className="hero-in flex items-start gap-2.5 rounded-xl border border-red-200/80 bg-red-50/80 p-3.5 text-sm text-red-700"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {errorMessage}
          </p>
        )}

        <div
          className="hero-in overflow-hidden rounded-2xl border border-white/60 bg-white/60 shadow-2xl shadow-slate-950/10 ring-1 ring-white/40 backdrop-blur-xl backdrop-saturate-150"
          style={{ animationDelay: "120ms" }}
        >
          {/* Loading state (first session/blob fetch) */}
          {isPending || (!hasLoaded && !errorMessage) ? (
            <div className="space-y-3 p-6 sm:p-8">
              {Array.from({ length: 3 }).map((_, row) => (
                <div
                  key={row}
                  className="ab-shimmer h-14 rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : recordList.length === 0 ? (
            /* ------------------------- Empty state ------------------------ */
            <div className="flex flex-col items-center gap-4 p-10 text-center sm:p-14">
              <span className="flex size-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                <BookX className="size-6" aria-hidden />
              </span>
              <h2 className="text-lg font-bold text-slate-900">No borrows yet</h2>
              <p className="max-w-sm text-sm leading-relaxed text-slate-500">
                When you borrow a book, it lands here with its record so you
                can return it without searching for it again.
              </p>
              <Link
                href="/all-books"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-400/25 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-amber-300"
              >
                <BookOpen className="size-4" aria-hidden />
                Browse the shelves
              </Link>
            </div>
          ) : (
            /* --------------------------- The table ------------------------ */
            <div className="overflow-x-auto">
              <table className="w-full min-w-160 text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500">
                    <th scope="col" className="px-4 py-3.5 sm:px-6">
                      Book
                    </th>
                    <th scope="col" className="hidden px-4 py-3.5 md:table-cell">
                      Borrowed On
                    </th>
                    <th scope="col" className="hidden px-4 py-3.5 md:table-cell">
                      Returned On
                    </th>
                    <th scope="col" className="hidden px-4 py-3.5 sm:table-cell">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right sm:px-6">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recordList.map((record) => {
                    const isReturningThis = Boolean(isReturning[record._id]);
                    return (
                      <tr
                        key={record._id}
                        className="transition-colors duration-150 hover:bg-amber-50/40"
                      >
                        {/* Book: cover thumbnail + title + author */}
                        <td className="px-4 py-3.5 sm:px-6">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={record.book?.imageUrl}
                              alt=""
                              className={
                                "h-12 w-9 shrink-0 rounded-md object-cover shadow-sm " +
                                (record.book?.imageUrl
                                  ? ""
                                  : "pointer-events-none opacity-0")
                              }
                            />
                            <div className="min-w-0">
                              {record.book ? (
                                <Link
                                  href={`/book/${record.book._id}`}
                                  className="block truncate font-semibold text-slate-900 transition-colors hover:text-amber-600"
                                >
                                  {record.book.title}
                                </Link>
                              ) : (
                                <span className="block truncate font-semibold text-slate-400">
                                  Book removed
                                </span>
                              )}
                              <p className="truncate text-xs text-slate-500">
                                {record.book?.author || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="hidden px-4 py-3.5 text-slate-600 tabular-nums md:table-cell">
                          {formatDate(record.borrowedAt)}
                        </td>

                        <td className="hidden px-4 py-3.5 text-slate-600 tabular-nums md:table-cell">
                          {formatDate(record.returnedAt)}
                        </td>

                        {/* Status */}
                        <td className="hidden px-4 py-3.5 sm:table-cell">
                          {record.status === "returned" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              <CircleCheck className="size-3" aria-hidden />
                              Returned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                              <Repeat className="size-3" aria-hidden />
                              Borrowed
                            </span>
                          )}
                        </td>

                        {/* Action: Return Book (disabled once returned) */}
                        <td className="px-4 py-3.5 text-right sm:px-6">
                          {record.status === "returned" || !record.book ? (
                            <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-400">
                              <Repeat className="size-3.5" aria-hidden />
                              Returned
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleReturn(record._id)}
                              disabled={isReturningThis}
                              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-slate-950/15 ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-400 hover:text-neutral-950 disabled:pointer-events-none disabled:opacity-60"
                            >
                              {isReturningThis ? (
                                <>
                                  <LoaderCircle
                                    className="size-3.5 animate-spin"
                                    aria-hidden
                                  />
                                  Returning...
                                </>
                              ) : (
                                <>
                                  <Repeat className="size-3.5" aria-hidden />
                                  Return Book
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
