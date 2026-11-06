import React from "react";
import { Quote, Star } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Static community reviews — pure presentation, no API calls.
 * Edit the REVIEWS array to change quotes, names or ratings.
 */
const REVIEWS = [
  {
    name: "Priya Sharma",
    role: "Read 40+ books this year",
    initials: "PS",
    rating: 5,
    quote:
      "The cleanest little library I've used. I searched one afternoon, found three classics and the covers made choosing easy. I keep coming back every weekend.",
  },
  {
    name: "Marcus Chen",
    role: "Sci-fi collector",
    initials: "MC",
    rating: 5,
    quote:
      "The New Arrivals shelf is genuinely addictive. Reserve, read, return — the whole thing works exactly the way it should. My reading streak has never been longer.",
  },
  {
    name: "Elena Petrova",
    role: "Book club host",
    initials: "EP",
    rating: 4,
    quote:
      "Our whole book club picks from here now. Star ratings are honest, the community shelves feel alive, and finding a title takes seconds instead of hours.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * ReaderReviews — static community testimonials band on the home page.
 *
 * Light frosted-glass cards with amber star ratings, initial avatars and
 * the shared `hero-in` entrance animation — consistent with the site's
 * slate + amber design language.
 */
export default function ReaderReviews() {
  return (
    <section className="relative overflow-x-clip bg-[linear-gradient(180deg,#fffbeb,#ffffff_55%,#f8fafc)] py-20 sm:py-24">
      {/* Ambient backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-20 right-1/4 size-[22rem] rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute bottom-1/4 -left-24 size-[20rem] rounded-full bg-slate-300/20 blur-3xl" />
      </div>

      {/* Section heading */}
      <div
        className="hero-in relative mx-auto flex max-w-2xl flex-col items-center px-4 text-center sm:px-6"
        style={{ animationDelay: "0ms" }}
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-700 backdrop-blur-sm">
          <Quote className="size-3.5 text-amber-500" aria-hidden />
          Community voices
        </p>

        <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Reader Reviews
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
          What our readers are saying about their time on the shelves.
        </p>
      </div>

      {/* Review cards */}
      <div className="relative mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-7 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {REVIEWS.map((review, index) => (
          // Entrance stagger on the wrapper; hover transforms live on the
          // inner card so animations never conflict.
          <div
            key={review.name}
            className="hero-in"
            style={{ animationDelay: `${120 + index * 90}ms` }}
          >
            <article className="group flex h-full flex-col rounded-2xl border border-white/60 bg-white/60 p-6 shadow-sm shadow-slate-950/5 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/50 hover:bg-white/80 hover:shadow-2xl hover:shadow-amber-400/15 sm:p-7">
              {/* Star rating */}
              <div
                className="flex items-center gap-1"
                aria-label={`Rated ${review.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, star) => (
                  <Star
                    key={star}
                    className={`size-4 ${
                      star < review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-200 text-slate-200"
                    }`}
                    aria-hidden
                  />
                ))}
              </div>

              <Quote
                className="mt-4 size-6 text-amber-300 transition-transform duration-300 group-hover:scale-110"
                aria-hidden
              />

              {/* Review text */}
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {review.quote}
              </p>

              {/* Reader */}
              <div className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-4 text-left">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-bold text-white shadow-md shadow-amber-400/30">
                  {review.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {review.name}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {review.role}
                  </p>
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
