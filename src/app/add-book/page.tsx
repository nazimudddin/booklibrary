
"use client";

/**
 * AddBookPage — community book submission form.
 *
 * Layout mirrors the shared design (dark gradient header band, Owner
 * Information + Book Details sections, character-counted description,
 * reminder strip, full-width submit button) re-skinned in the site's
 * slate + amber colour scheme on a transparent frosted-glass card.
 *
 * On submit it POSTs the form to /api/books, which stores it in MongoDB.
 */

import { useState } from "react";
import { useSession } from "@/lib/auth-client";

import {
  BookOpen,
  Book,
  UserRound,
  Mail,
  BarChart3,
  Hash,
  Image as ImageIcon,
  FileText,
  Copy,
  Sparkles,
  Plus,
  CircleCheck,
  TriangleAlert,
  LoaderCircle,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

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
/*  Shared glass styles                                                       */
/* -------------------------------------------------------------------------- */

/** Frosted input / select / textarea surface (matches the navbar glass). */
const GLASS_FIELD =
  "w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2.5 text-sm text-slate-900 shadow-sm backdrop-blur-md placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-amber-400/70 focus:bg-white/70 focus:ring-3 focus:ring-amber-400/25";

/** Small icon that sits in front of each field label. */
function LabelIcon({
  icon: Icon,
}: {
  icon: React.ComponentType<{ className?: string }>;
}) {
  return <Icon className="size-3.5 shrink-0 text-slate-400" aria-hidden />;
}

function FieldLabel({
  htmlFor,
  icon,
  children,
  required,
}: {
  htmlFor: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-800"
    >
      <LabelIcon icon={icon} />
      {children}
      {required && <span className="text-red-500">*</span>}
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function AddBookPage() {
  const { data: session } = useSession();

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /* Owner fields are uncontrolled and prefilled from the session once it
     loads — no effect needed (keeps React Compiler happy). */
  const sessionKey = session?.user?.id ?? "guest";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Save the form reference before the async operation.
    const formElement = e.currentTarget;

    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const form = new FormData(formElement);

    // The copies value must be a positive whole number — reject anything
    // else with a friendly message before touching the server.
    const totalCopies = Number.parseInt(String(form.get("totalCopies")), 10);
    if (!Number.isInteger(totalCopies) || totalCopies < 1) {
      setErrorMessage(
        "Total Copies must be a valid positive number (at least 1)."
      );
      setIsLoading(false);
      return;
    }

    try {
      // The Next.js Proxy mints a JWT from the session cookie and forwards it
      // as a Bearer token to the backend.
      const response = await fetch("/api/backend/add-books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.get("title"),
          author: form.get("author"),
          category,
          tags: form.get("tags"),
          imageUrl: form.get("imageUrl"),
          description,
          ownerName: form.get("ownerName"),
          ownerEmail: form.get("ownerEmail"),
          totalCopies,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(
          data?.error || "Something went wrong. Please try again."
        );
        return;
      }

      setSuccessMessage(
        "Your book has been added to the library. Thank you!"
      );

      setDescription("");
      setCategory("");

      // Reset the form using the saved reference.
      formElement.reset();
    } catch (error) {
      console.error("Add book error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      {/* Ambient backdrop — soft amber & slate glows so the glass reads well */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-32 -left-24 size-[26rem] rounded-full bg-amber-300/25 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 size-[28rem] rounded-full bg-slate-400/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 size-72 rounded-full bg-amber-200/15 blur-3xl" />
      </div>

      <main className="relative z-10 w-full max-w-2xl">
        {/* ------------------------- Glass card shell ------------------------ */}
        <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/55 shadow-2xl shadow-slate-950/10 ring-1 ring-white/40 backdrop-blur-xl backdrop-saturate-150">
          {/* -------------------------- Header band ------------------------- */}
          <header className="relative overflow-hidden bg-neutral-900 px-6 py-6 sm:px-8">
            {/* Decorative glass circles */}
            <div
              className="pointer-events-none absolute -top-10 -right-6 size-36 rounded-full border border-white/10"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full border border-white/10"
              aria-hidden
            />

            <div className="relative flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/30 ring-1 ring-white/30">
                <BookOpen className="size-6" aria-hidden />
              </span>

              <div>
                <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                  Book Information
                </h1>
                <p className="mt-0.5 text-sm text-white/70">
                  Fill in the details to add your book.
                </p>
              </div>
            </div>
          </header>

          {/* ----------------------------- Form ----------------------------- */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-7 px-6 py-8 sm:px-8"
          >
            {/* ========================= Owner Information ===================== */}
            <section>
              <div className="flex items-center gap-2">
                <UserRound className="size-4 text-amber-500" aria-hidden />
                <h2 className="text-sm font-bold tracking-tight text-slate-900">
                  Owner Information
                </h2>
              </div>

              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {/* Your Name */}
                <div>
                  <FieldLabel htmlFor="ownerName" icon={UserRound}>
                    Your Name
                  </FieldLabel>

                  <input
                    key={`name-${sessionKey}`}
                    id="ownerName"
                    name="ownerName"
                    type="text"
                    placeholder="Your name"
                    defaultValue={session?.user?.name ?? ""}
                    className={GLASS_FIELD}
                    required
                  />
                </div>

                {/* Your Email */}
                <div>
                  <FieldLabel htmlFor="ownerEmail" icon={Mail}>
                    Your Email
                  </FieldLabel>

                  <input
                    key={`email-${sessionKey}`}
                    id="ownerEmail"
                    name="ownerEmail"
                    type="email"
                    placeholder="you@example.com"
                    defaultValue={session?.user?.email ?? ""}
                    className={GLASS_FIELD}
                    required
                  />
                </div>
              </div>
            </section>

            <hr className="border-white/70" />

            {/* =========================== Book Details ======================== */}
            <section>
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-amber-500" aria-hidden />
                <h2 className="text-sm font-bold tracking-tight text-slate-900">
                  Book Details
                </h2>
              </div>

              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {/* Book Title */}
                <div>
                  <FieldLabel htmlFor="title" icon={Book} required>
                    Book Title
                  </FieldLabel>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Enter book title"
                    className={GLASS_FIELD}
                    required
                  />
                </div>

                {/* Author Name */}
                <div>
                  <FieldLabel htmlFor="author" icon={UserRound} required>
                    Author Name
                  </FieldLabel>

                  <input
                    id="author"
                    name="author"
                    type="text"
                    placeholder="Enter author name"
                    className={GLASS_FIELD}
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <FieldLabel htmlFor="category" icon={BarChart3} required>
                    Category
                  </FieldLabel>

                  <div className="relative">
                    <select
                      id="category"
                      name="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`${GLASS_FIELD} appearance-none pr-9 ${
                        category ? "" : "text-slate-400"
                      }`}
                      required
                    >
                      <option value="" disabled>
                        Select category
                      </option>

                      {CATEGORIES.map((c) => (
                        <option
                          key={c}
                          value={c}
                          className="text-slate-900"
                        >
                          {c}
                        </option>
                      ))}
                    </select>

                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M4 6l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <FieldLabel htmlFor="tags" icon={Hash}>
                    Tags
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      (Optional, comma separated)
                    </span>
                  </FieldLabel>

                  <input
                    id="tags"
                    name="tags"
                    type="text"
                    placeholder="e.g. classic, drama"
                    className={GLASS_FIELD}
                  />
                </div>

                {/* Total Copies — how many physical copies exist to borrow */}
                <div>
                  <FieldLabel htmlFor="totalCopies" icon={Copy} required>
                    Total Copies
                  </FieldLabel>

                  <input
                    id="totalCopies"
                    name="totalCopies"
                    type="number"
                    min={1}
                    step={1}
                    defaultValue={1}
                    placeholder="e.g. 3"
                    className={GLASS_FIELD}
                    required
                  />

                  <p className="mt-1.5 text-xs text-slate-500">
                    Number of physical copies other readers can borrow.
                  </p>
                </div>
              </div>

              {/* Book Image URL */}
              <div className="mt-5">
                <FieldLabel htmlFor="imageUrl" icon={ImageIcon} required>
                  Book Image URL
                </FieldLabel>

                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  placeholder="https://example.com/book-image.jpg"
                  className={GLASS_FIELD}
                  required
                />

                <p className="mt-1.5 text-xs text-slate-500">
                  Add a valid image URL for your book cover.
                </p>
              </div>

              {/* Book Description */}
              <div className="mt-5">
                <FieldLabel htmlFor="description" icon={FileText} required>
                  Book Description
                </FieldLabel>

                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  placeholder="Write a short description about this book..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${GLASS_FIELD} resize-y`}
                  required
                />

                <p className="mt-1.5 text-right text-xs text-slate-500 tabular-nums">
                  {description.length} characters
                </p>
              </div>
            </section>

            {/* ---------------------------- Banners --------------------------- */}
            {successMessage && (
              <p
                role="status"
                className="flex items-start gap-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 text-sm text-emerald-800 backdrop-blur-md"
              >
                <CircleCheck
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden
                />
                {successMessage}
              </p>
            )}

            {errorMessage && (
              <p
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-red-200/80 bg-red-50/70 p-3.5 text-sm text-red-700 backdrop-blur-md"
              >
                <TriangleAlert
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden
                />
                {errorMessage}
              </p>
            )}

            {/* --------------------------- Reminder --------------------------- */}
            <div className="flex items-start gap-3 rounded-xl border border-amber-200/60 bg-amber-50/50 p-3.5 backdrop-blur-md">
              <Sparkles
                className="mt-0.5 size-4 shrink-0 text-amber-500"
                aria-hidden
              />

              <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                Please make sure all book information is correct before
                submitting. Your contribution helps other readers discover great
                books.
              </p>
            </div>

            {/* --------------------------- Submit ----------------------------- */}
            <button
              type="submit"
              disabled={isLoading}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 disabled:pointer-events-none disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <LoaderCircle
                    className="size-4 animate-spin"
                    aria-hidden
                  />
                  Adding Book...
                </>
              ) : (
                <>
                  <Plus className="size-4" aria-hidden />
                  Add Book to Library
                </>
              )}
            </button>
          </form>
        </div>

        {/* --------------------------- Footer note --------------------------- */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Every book you share makes our reading community stronger.
        </p>
      </main>
    </div>
  );
}

