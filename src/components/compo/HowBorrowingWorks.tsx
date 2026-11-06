import React from "react";
import { BookOpenCheck, BookMarked, Search } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Static content for the section — pure presentation, no API calls.
 * Edit the STEPS array to change the copy, icons or wording.
 */
const STEPS = [
  {
    step: "01",
    title: "Find your book",
    text: "Browse the whole catalogue or search by title and category until you spot the story you're longing for.",
    icon: Search,
  },
  {
    step: "02",
    title: "Reserve & borrow",
    text: "Open the book, hit View Details and reserve it for your account — the shelf is yours while you read.",
    icon: BookMarked,
  },
  {
    step: "03",
    title: "Read & return",
    text: "Enjoy every page at your own pace, then return the book so another reader can discover it too.",
    icon: BookOpenCheck,
  },
];

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * HowBorrowingWorks — static 3-step explainer band on the home page.
 *
 * Matches the site's dark header-band language (neutral-950 background,
 * amber accents, frosted glass cards, `hero-in` entrance animation).
 */
export default function HowBorrowingWorks() {
  return (
    <section className="relative overflow-x-clip bg-neutral-950 py-20 text-white sm:py-24">
      {/* Decorative glass circles */}
      <div className="pointer-events-none absolute -top-24 right-1/4 size-72 rounded-full border border-white/10" aria-hidden />
      <div className="pointer-events-none absolute -top-40 right-32 size-96 rounded-full border border-white/10" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 left-1/2 size-80 rounded-full bg-amber-400/10 blur-3xl" aria-hidden />

      {/* Section heading */}
      <div
        className="hero-in relative mx-auto flex max-w-2xl flex-col items-center px-4 text-center sm:px-6"
        style={{ animationDelay: "0ms" }}
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
          <BookOpenCheck className="size-3.5 text-amber-400" aria-hidden />
          Simple process
        </p>

        <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
          How Borrowing Works
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">
          Three small steps between you and your next great story — no forms,
          no queues, no fines.
        </p>
      </div>

      {/* Step cards */}
      <div className="relative mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:gap-8">
        {STEPS.map((item, index) => (
          // Entrance stagger on the wrapper; hover transforms live on the
          // inner card so animations never conflict.
          <div
            key={item.step}
            className="hero-in"
            style={{ animationDelay: `${120 + index * 90}ms` }}
          >
            <article className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-amber-400/10">
              {/* Big amber step number */}
              <p className="text-4xl font-bold text-amber-400 tabular-nums">
                {item.step}
              </p>

              <span className="mt-5 inline-flex size-11 items-center justify-center rounded-xl bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/25 transition-transform duration-300 group-hover:scale-110">
                <item.icon className="size-5" aria-hidden />
              </span>

              <h3 className="mt-4 text-lg font-bold tracking-tight">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {item.text}
              </p>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
