"use client";

/**
 * MyBooksPage — the signed-in user's own shelf (route /my-books).
 *
 * Data comes from the existing Express backend, resolved from the logged-in
 * session (never from a client-sent userId):
 *   GET    /api/backend/my-books          → only the caller's books
 *   PUT    /api/backend/update-book/:id   → saves edits (owner-only)
 *   DELETE /api/backend/delete-book/:id   → removes an owned book
 *
 * Editing happens in a modal (all fields pre-filled) and deletion always
 * asks through a styled confirmation modal — never the browser's confirm().
 * Changes update the table instantly and confirm with a floating toast.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/lib/auth-client";

import {
  ArrowLeft,
  BookHeart,
  BookX,
  CircleCheck,
  Copy,
  Library,
  LoaderCircle,
  SquarePen,
  Trash2,
  TriangleAlert,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

/** Shape of one book document as returned by the backend API. */
interface MyBook {
  _id: string;
  title: string;
  author: string;
  category?: string;
  tags?: string;
  imageUrl?: string;
  description?: string;
  totalCopies?: number;
  availableCopies?: number;
  createdAt?: string;
}

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

/** Category list kept in sync with the Add Book page's <select>. */
const CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Mystery & Thriller",
  "Science Fiction",
  "Fantasy",
  "Romance",
  "Biography",
  "History",
  "Self-Help",
  "Poetry",
  "Children's Books",
  "Other",
];

/* -------------------------------------------------------------------------- */
/*  Shared glass styles (same surface language as the Add Book page)          */
/* -------------------------------------------------------------------------- */

/** Frosted input / select / textarea surface. */
const GLASS_FIELD =
  "w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2.5 text-sm text-slate-900 shadow-sm backdrop-blur-md placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-amber-400/70 focus:bg-white/70 focus:ring-3 focus:ring-amber-400/25";

/** Small label row used inside the edit modal form. */
function ModalLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-slate-800"
    >
      {children}
      {required && <span className="text-red-500">*</span>}
    </label>
  );
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
/*  Floating toast                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Toast — the site's glass banner language in a floating pill that auto
 * fades after a few seconds. tone="error" shares the same layout in red.
 */
function Toast({ message, tone }: { message: string; tone: "success" | "error" }) {
  const success = tone === "success";
  return (
    <div
      role={success ? "status" : "alert"}
      className={
        "hero-in pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2.5 rounded-full border px-5 py-3 text-sm font-medium shadow-xl backdrop-blur-xl " +
        (success
          ? "border-emerald-200/80 bg-emerald-50/90 text-emerald-800 shadow-emerald-900/10"
          : "border-red-200/80 bg-red-50/90 text-red-700 shadow-red-900/10")
      }
    >
      {success ? (
        <CircleCheck className="size-4 shrink-0" aria-hidden />
      ) : (
        <TriangleAlert className="size-4 shrink-0" aria-hidden />
      )}
      {message}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Edit modal                                                                */
/* -------------------------------------------------------------------------- */

/**
 * EditBookModal — every field of the book pre-filled; submits to
 * /update-book/:id and closes itself on success via onSubmit.
 */
function EditBookModal({
  book,
  isSaving,
  errorMessage,
  onClose,
  onSubmit,
}: {
  book: MyBook;
  isSaving: boolean;
  errorMessage: string;
  onClose: () => void;
  onSubmit: (form: FormData) => void;
}) {
  // key={book._id} from the caller resets every defaultValue per book.
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Update ${book.title}`}
    >
      <div className="hero-in my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl shadow-slate-950/25 ring-1 ring-white/40">
        {/* Header band */}
        <header className="relative flex items-center gap-4 overflow-hidden bg-neutral-900 px-6 py-5 sm:px-8">
          <div
            className="pointer-events-none absolute -top-10 -right-6 size-36 rounded-full border border-white/10"
            aria-hidden
          />
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/30 ring-1 ring-white/30">
            <SquarePen className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              Update Book
            </h2>
            <p className="text-sm text-white/70">Editing “{book.title}”</p>
          </div>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(new FormData(e.currentTarget));
          }}
          className="flex flex-col gap-5 px-6 py-7 sm:px-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <ModalLabel htmlFor="edit-title" required>
                Book Title
              </ModalLabel>
              <input
                id="edit-title"
                name="title"
                type="text"
                defaultValue={book.title}
                className={GLASS_FIELD}
                required
              />
            </div>

            <div>
              <ModalLabel htmlFor="edit-author" required>
                Author Name
              </ModalLabel>
              <input
                id="edit-author"
                name="author"
                type="text"
                defaultValue={book.author}
                className={GLASS_FIELD}
                required
              />
            </div>

            <div>
              <ModalLabel htmlFor="edit-category" required>
                Category
              </ModalLabel>
              <select
                id="edit-category"
                name="category"
                defaultValue={book.category}
                className={GLASS_FIELD}
                required
              >
                <option value="" disabled>
                  Select category
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <ModalLabel htmlFor="edit-tags">Tags</ModalLabel>
              <input
                id="edit-tags"
                name="tags"
                type="text"
                defaultValue={book.tags ?? ""}
                placeholder="e.g. classic, drama"
                className={GLASS_FIELD}
              />
            </div>

            <div>
              <ModalLabel htmlFor="edit-totalCopies" required>
                Total Copies
              </ModalLabel>
              <input
                id="edit-totalCopies"
                name="totalCopies"
                type="number"
                min={1}
                step={1}
                defaultValue={book.totalCopies ?? 1}
                className={GLASS_FIELD}
                required
              />
              {typeof book.availableCopies === "number" && (
                <p className="mt-1.5 text-xs text-slate-500">
                  Currently available: <strong>{book.availableCopies}</strong> —
                  copies already borrowed stay counted.
                </p>
              )}
            </div>

            <div>
              <ModalLabel htmlFor="edit-imageUrl" required>
                Book Image URL
              </ModalLabel>
              <input
                id="edit-imageUrl"
                name="imageUrl"
                type="url"
                defaultValue={book.imageUrl}
                placeholder="https://example.com/book-image.jpg"
                className={GLASS_FIELD}
                required
              />
            </div>
          </div>

          <div>
            <ModalLabel htmlFor="edit-description" required>
              Book Description
            </ModalLabel>
            <textarea
              id="edit-description"
              name="description"
              rows={4}
              defaultValue={book.description}
              className={`${GLASS_FIELD} resize-y`}
              required
            />
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-200/80 bg-red-50/80 p-3.5 text-sm text-red-700"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              {errorMessage}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-400 hover:text-neutral-950 disabled:pointer-events-none disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden />
                  Saving...
                </>
              ) : (
                <>
                  <SquarePen className="size-4" aria-hidden />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Delete confirmation modal                                                 */
/* -------------------------------------------------------------------------- */

/**
 * DeleteBookModal — a styled confirmation dialog (NOT confirm()) that
 * removes the book via /delete-book/:id once the user confirms.
 */
function DeleteBookModal({
  book,
  isDeleting,
  errorMessage,
  onClose,
  onConfirm,
}: {
  book: MyBook;
  isDeleting: boolean;
  errorMessage: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Delete ${book.title}`}
    >
      <div className="hero-in w-full max-w-md overflow-hidden rounded-2xl border border-white/60 bg-white p-6 shadow-2xl shadow-slate-950/25 ring-1 ring-white/40 sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-sm">
          <Trash2 className="size-6" aria-hidden />
        </span>

        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Delete this book?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          “<strong>{book.title}</strong>” will be permanently removed from the
          library shelves. This action cannot be undone.
        </p>

        {errorMessage && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200/80 bg-red-50/80 p-3.5 text-sm text-red-700"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {errorMessage}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-500 disabled:pointer-events-none disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="size-4" aria-hidden />
                Delete Book
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function MyBooksPage() {
  const { data: session, isPending } = useSession();

  /** Books owned by the signed-in user (fetched with the session cookie). */
  const [books, setBooks] = useState<MyBook[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [apiError, setApiError] = useState("");

  /** Modal states — null means closed. */
  const [editingBook, setEditingBook] = useState<MyBook | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [deletingBook, setDeletingBook] = useState<MyBook | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  /** Floating toast with an auto-dismiss timer. */
  const [toast, setToast] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function showToast(message: string, tone: "success" | "error") {
    setToast({ message, tone });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }

  /** Fetch this user's own books once the session id is known. */
  useEffect(() => {
    if (!session?.user?.id) return;

    // The `ignore` flag stops a stale response from landing afterwards.
    let ignore = false;

    (async () => {
      try {
        const response = await fetch("/api/backend/my-books");
        const data = await response.json().catch(() => null);
        if (ignore) return;

        if (!response.ok) {
          setApiError(
            data?.error || "Could not load your books. Please log in again."
          );
        } else {
          setBooks(Array.isArray(data) ? data : []);
        }
        setHasLoaded(true);
      } catch (error) {
        console.error("My books fetch error:", error);
        if (!ignore) {
          setHasLoaded(true);
          setApiError("Could not load your books. Please refresh the page.");
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [session?.user?.id]);

  /** Save the edited fields for one owned book. */
  const handleEditSubmit = async (form: FormData) => {
    if (!editingBook) return;
    setIsSaving(true);
    setEditError("");

    try {
      const response = await fetch(
        `/api/backend/update-book/${encodeURIComponent(editingBook._id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: form.get("title"),
            author: form.get("author"),
            category: form.get("category"),
            tags: form.get("tags"),
            imageUrl: form.get("imageUrl"),
            description: form.get("description"),
            totalCopies: form.get("totalCopies"),
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setEditError(data?.error || "Could not update the book. Please try again.");
        return;
      }

      // Swap in the saved document so the table updates without a refresh.
      if (data?.book) {
        setBooks((prev) =>
          prev.map((b) => (b._id === editingBook._id ? data.book : b))
        );
      }
      setEditingBook(null);
      showToast("Book updated successfully!", "success");
    } catch (error) {
      console.error("Update book error:", error);
      setEditError("Could not update the book. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  /** Delete one owned book after the confirmation modal was accepted. */
  const handleDelete = async () => {
    if (!deletingBook) return;
    setIsDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch(
        `/api/backend/delete-book/${encodeURIComponent(deletingBook._id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setDeleteError(data?.error || "Could not delete the book. Please try again.");
        return;
      }

      // The book vanishes from the table immediately.
      setBooks((prev) => prev.filter((b) => b._id !== deletingBook._id));
      setDeletingBook(null);
      showToast("Book deleted from the library!", "success");
    } catch (error) {
      console.error("Delete book error:", error);
      setDeleteError("Could not delete the book. Please try again.");
    } finally {
      setIsDeleting(false);
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
            Log in to manage your books
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-slate-500">
            Your personal shelf keeps every book you shared with the library so
            you can update its details or remove it safely.
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
            <BookHeart className="size-3.5 text-amber-400" aria-hidden />
            Your personal shelf
          </p>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            My Books
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">
            Only the books you added — edit any detail or remove a book any
            time.
          </p>
        </div>
      </header>

      {/* ----------------------------- Table card -------------------------- */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-10 sm:px-6">
        {apiError && (
          <p
            role="alert"
            className="hero-in mb-4 flex items-start gap-2.5 rounded-xl border border-red-200/80 bg-red-50/80 p-3.5 text-sm text-red-700"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {apiError}
          </p>
        )}

        <div
          className="hero-in overflow-hidden rounded-2xl border border-white/60 bg-white/60 shadow-2xl shadow-slate-950/10 ring-1 ring-white/40 backdrop-blur-xl backdrop-saturate-150"
          style={{ animationDelay: "120ms" }}
        >
          {/* Loading state (first session/blob fetch) */}
          {isPending || (!hasLoaded && !apiError) ? (
            <div className="space-y-3 p-6 sm:p-8">
              {Array.from({ length: 3 }).map((_, row) => (
                <div
                  key={row}
                  className="ab-shimmer h-14 rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : books.length === 0 ? (
            /* ------------------------- Empty state ------------------------ */
            <div className="flex flex-col items-center gap-4 p-10 text-center sm:p-14">
              <span className="flex size-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                <BookX className="size-6" aria-hidden />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                No books added yet
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-slate-500">
                Share your first book with the library — afterwards it appears
                here where you can keep it edited and up to date.
              </p>
              <Link
                href="/add-book"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-400/25 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-amber-300"
              >
                <BookHeart className="size-4" aria-hidden />
                Add a book
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
                    <th scope="col" className="px-4 py-3.5 sm:px-6">
                      Category
                    </th>
                    <th scope="col" className="hidden px-4 py-3.5 sm:table-cell sm:px-6">
                      Copies
                    </th>
                    <th scope="col" className="hidden px-4 py-3.5 md:table-cell sm:px-6">
                      Added
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right sm:px-6">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {books.map((book) => (
                    <tr
                      key={book._id}
                      className="transition-colors duration-150 hover:bg-amber-50/40"
                    >
                      {/* Book: cover thumbnail + title + author */}
                      <td className="px-4 py-3.5 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={
                              "h-12 w-9 shrink-0 overflow-hidden rounded-md bg-slate-100 shadow-sm " +
                              (book.imageUrl ? "" : "opacity-50")
                            }
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={book.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/book/${book._id}`}
                              className="block truncate font-semibold text-slate-900 transition-colors hover:text-amber-600"
                            >
                              {book.title}
                            </Link>
                            <p className="truncate text-xs text-slate-500">
                              {book.author}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 sm:px-6">
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          {book.category || "Other"}
                        </span>
                      </td>

                      <td className="hidden px-4 py-3.5 text-slate-600 tabular-nums sm:table-cell sm:px-6">
                        <span className="inline-flex items-center gap-1.5">
                          <Copy className="size-3.5 text-slate-400" aria-hidden />
                          {typeof book.availableCopies === "number"
                            ? `${book.availableCopies} / ${book.totalCopies ?? "—"}`
                            : (book.totalCopies ?? "—")}
                        </span>
                      </td>

                      <td className="hidden px-4 py-3.5 text-slate-600 tabular-nums md:table-cell sm:px-6">
                        {formatDate(book.createdAt)}
                      </td>

                      {/* Actions: Edit + Delete */}
                      <td className="px-4 py-3.5 text-right sm:px-6">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBook(book);
                              setEditError("");
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:text-slate-900"
                          >
                            <SquarePen className="size-3.5" aria-hidden />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingBook(book);
                              setDeleteError("");
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50"
                          >
                            <Trash2 className="size-3.5" aria-hidden />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------ Modals ----------------------------- */}
      {editingBook && (
        <EditBookModal
          key={editingBook._id}
          book={editingBook}
          isSaving={isSaving}
          errorMessage={editError}
          onClose={() => setEditingBook(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {deletingBook && (
        <DeleteBookModal
          key={deletingBook._id}
          book={deletingBook}
          isDeleting={isDeleting}
          errorMessage={deleteError}
          onClose={() => setDeletingBook(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* ------------------------------ Toast ------------------------------ */}
      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </section>
  );
}
