"use client";

/**
 * HeroSection — modern split-layout hero for an online book library.
 *
 * Features
 *  1. Auto-playing background image slider (crossfade + slow Ken Burns zoom).
 *  2. Segmented timeline progress bar that fills smoothly while the active
 *     slide plays and resets from 0 on every slide change.
 *  3. Staggered fade/slide-up text entrance animation on every slide change.
 *  4. Responsive split layout: branding + CTAs on the left, a fanned "book
 *     stack" of featured covers on the right. Pauses on hover; a play/pause
 *     control is included.
 *
 * All slide content lives in the `SLIDES` constant — edit it to change the
 * hero's copy, links, images and featured book.
 */

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Pause, Play, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

/** How long each slide stays on screen (ms). */
const SLIDE_DURATION = 7000;

interface Slide {
  id: string;
  /** Small kicker text above the title. */
  eyebrow: string;
  /** Main headline. */
  title: string;
  /** Supporting paragraph. */
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  /** Full-bleed background photo (landscape crop). */
  background: string;
  /** Featured book shown in the right-hand stack (portrait cover crop). */
  cover: string;
  featured: { title: string; author: string; rating: number };
}

const SLIDES: Slide[] = [
  {
    id: "collection",
    eyebrow: "Featured collection",
    title: "Rediscover the joy of reading",
    description:
      "Browse more than 12,000 novels, biographies and rare editions — borrow, bookmark and read anywhere, on any device.",
    primaryCta: { label: "Browse the library", href: "/library" },
    secondaryCta: { label: "How it works", href: "/about" },
    background:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1920&q=80",
    cover:
      "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?auto=format&fit=crop&w=480&h=720&q=80",
    featured: { title: "The Midnight Library", author: "Matt Haig", rating: 4.8 },
  },
  {
    id: "arrivals",
    eyebrow: "New arrivals",
    title: "Stories that stay with you",
    description:
      "Fresh releases added every week, handpicked by our editors and fellow readers. Find your next unputdownable book.",
    primaryCta: { label: "Explore new arrivals", href: "/new" },
    secondaryCta: { label: "See what's trending", href: "/trending" },
    background:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1920&q=80",
    cover:
      "https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=480&h=720&q=80",
    featured: { title: "Project Hail Mary", author: "Andy Weir", rating: 4.9 },
  },
  {
    id: "shelf",
    eyebrow: "Reader's choice",
    title: "Every shelf has a story",
    description:
      "Join a community of 40,000+ readers sharing reviews, lists and reading challenges. Your library, beautifully organised.",
    primaryCta: { label: "Join for free", href: "/signup" },
    secondaryCta: { label: "Meet the readers", href: "/community" },
    background:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1920&q=80",
    cover:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=480&h=720&q=80",
    featured: { title: "Klara and the Sun", author: "Kazuo Ishiguro", rating: 4.6 },
  },
];

/** Small stats strip under the CTAs. */
const STATS = [
  { value: "12k+", label: "Titles" },
  { value: "4.8", label: "Avg. rating" },
  { value: "200+", label: "Genres" },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Timer state lives in refs so the autoplay loop never re-renders per frame.
  const elapsedRef = useRef(0);
  const pausedRef = useRef(false);
  // The progress fill of the currently active segment.
  const progressRef = useRef<HTMLSpanElement>(null);

  /** Keep the ref and state in sync whenever pause status changes. */
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  /** Jump to a slide and restart its timer (also used by all manual controls). */
  const goTo = (index: number) => {
    elapsedRef.current = 0;
    setActive(((index % SLIDES.length) + SLIDES.length) % SLIDES.length);
  };

  /* Autoplay engine --------------------------------------------------------- */
  // A single requestAnimationFrame loop drives BOTH the slide timer and the
  // progress-bar fill, so they are always perfectly in sync. Pausing just
  // stops the elapsed time from accumulating; the bar freezes in place and
  // resumes (or resets) from where it is.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = now - last;
      last = now;

      if (!pausedRef.current) {
        elapsedRef.current += dt;
        if (elapsedRef.current >= SLIDE_DURATION) {
          elapsedRef.current = 0;
          // Advance to the next slide (wraps back to the first one).
          setActive((current) => (current + 1) % SLIDES.length);
        }
      }

      // Paint the progress bar directly on the DOM node — no re-render.
      const progress = Math.min(elapsedRef.current / SLIDE_DURATION, 1);
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const slide = SLIDES[active];

  return (
    <section
      // Pause autoplay while the cursor rests on the hero (desktop nicety).
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative isolate overflow-hidden bg-neutral-950 text-white min-h-[580px] sm:min-h-[660px] flex flex-col"
    >
      {/* ---------------------------------------------------------------- */}
      {/* 1. Background slider (all layers stacked, crossfaded by opacity) */}
      {/* ---------------------------------------------------------------- */}
      <div className="absolute inset-0" aria-hidden>
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={s.background}
              alt=""
              fill
              priority={i === 0} // first slide is the LCP image
              sizes="100vw"
              // Ken Burns zoom only runs on the active layer.
              className={`object-cover ${i === active ? "hero-ken" : ""}`}
            />
          </div>
        ))}

        {/* Legibility gradients — dark on the left where the text sits. */}
        <div className="absolute inset-0 bg-neutral-950/55 sm:bg-transparent sm:bg-gradient-to-r sm:from-neutral-950/90 sm:via-neutral-950/60 sm:to-neutral-950/20" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-neutral-950/80 to-transparent" />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 2 & 4. Split layout: content (left) + featured stack (right)      */}
      {/* ---------------------------------------------------------------- */}
      <div className="relative mx-auto flex w-full max-w-7xl flex-1 items-center px-6 py-16 sm:px-10 lg:px-12">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT — branding, copy and CTAs */}
          {/* `key` remounts the block on slide change, re-triggering the
              staggered hero-in entrance animations. */}
          <div key={slide.id} className="order-2 lg:order-1 lg:max-w-xl" aria-live="polite">
            {/* Eyebrow badge */}
            <p
              className="hero-in inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase backdrop-blur-sm"
              style={{ animationDelay: "0ms" }}
            >
              <BookOpen className="size-3.5 text-amber-400" aria-hidden />
              {slide.eyebrow}
            </p>

            {/* Headline */}
            <h1
              className="hero-in mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
              style={{ animationDelay: "90ms" }}
            >
              {slide.title}
            </h1>

            {/* Description */}
            <p
              className="hero-in mt-5 max-w-md text-base leading-relaxed text-white/70 sm:text-lg"
              style={{ animationDelay: "180ms" }}
            >
              {slide.description}
            </p>

            {/* CTA buttons */}
            <div
              className="hero-in mt-9 flex flex-wrap items-center gap-4"
              style={{ animationDelay: "270ms" }}
            >
              <Link
                href={slide.primaryCta.href}
                className="group inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-400/25 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-amber-300"
              >
                {slide.primaryCta.label}
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
              <Link
                href={slide.secondaryCta.href}
                className="inline-flex items-center rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white/90 backdrop-blur-sm transition-colors duration-200 hover:border-white/50 hover:bg-white/10"
              >
                {slide.secondaryCta.label}
              </Link>
            </div>

            {/* Stats strip */}
            <dl
              className="hero-in mt-10 flex items-center gap-6 sm:gap-8"
              style={{ animationDelay: "360ms" }}
            >
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-xl font-bold sm:text-2xl">{stat.value}</dd>
                  <dd className="text-xs text-white/60">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* RIGHT — featured book stack (fanned covers with idle float) */}
          <div className="relative order-1 mx-auto h-[300px] w-[280px] sm:h-[380px] sm:w-[360px] lg:order-2">
            {/* Warm glow behind the stack */}
            <div
              className="absolute -inset-10 rounded-full bg-amber-400/15 blur-3xl"
              aria-hidden
            />

            {/* Back covers — pull the neighbouring slides' covers for variety. */}
            {[-1, 1].map((offset) => {
              const neighbour = SLIDES[mod(active + offset)];
              return (
                <div
                  key={offset}
                  aria-hidden
                  className="absolute top-1/2 h-[65%] w-[38%] overflow-hidden rounded-xl border border-white/15 opacity-70 shadow-xl transition-transform duration-500"
                  style={{
                    left: offset === -1 ? "9%" : "53%",
                    transform: `translateY(-50%) rotate(${-offset * 10}deg)`,
                    zIndex: 1,
                  }}
                >
                  <Image
                    src={neighbour.cover}
                    alt=""
                    fill
                    sizes="140px"
                    className="object-cover brightness-50 saturate-50"
                  />
                </div>
              );
            })}

            {/* Front cover — remounts per slide so it pops in. */}
            <div
              key={slide.id}
              className="hero-in absolute left-1/2 top-1/2 z-10 h-[80%] w-[52%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-white/25"
              style={{ animationDelay: "120ms" }}
            >
              <Image
                src={slide.cover}
                alt={`Cover of ${slide.featured.title}`}
                fill
                sizes="220px"
                className="object-cover"
              />
            </div>

            {/* Glass rating card under the front cover */}
            <div
              key={`meta-${slide.id}`}
              className="hero-in absolute bottom-2 left-1/2 z-20 w-64 -translate-x-1/2 rounded-xl border border-white/15 bg-neutral-900/70 p-3 backdrop-blur-md sm:bottom-0"
              style={{ animationDelay: "240ms" }}
            >
              <p className="truncate text-sm font-semibold">{slide.featured.title}</p>
              <div className="mt-0.5 flex items-center justify-between">
                <p className="truncate text-xs text-white/60">{slide.featured.author}</p>
                <p className="flex items-center gap-1 text-xs font-medium text-amber-400">
                  <Star className="size-3.5 fill-amber-400" aria-hidden />
                  {slide.featured.rating.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 2. Timeline indicators + play/pause (fills sync with autoplay)   */}
      {/* ---------------------------------------------------------------- */}
      <div className="relative w-full px-6 pb-8 sm:px-10 lg:px-12">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4">
          {/* One segment per slide. The active segment's fill is driven by
              the rAF engine above via progressRef. Clicking jumps to a slide. */}
          <div
            className="flex flex-1 items-center gap-2"
            role="tablist"
            aria-label="Hero slides"
          >
            {SLIDES.map((s, i) => {
              const isActive = i === active;
              return (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to slide ${i + 1}: ${s.eyebrow}`}
                  onClick={() => goTo(i)}
                  className={`group relative h-1.5 overflow-hidden rounded-full bg-white/25 transition-all duration-300 ${
                    isActive ? "flex-[2_1_64px]" : "flex-1 hover:bg-white/40"
                  }`}
                >
                  {/* Completed slides keep a solid static fill. */}
                  {i < active && (
                    <span className="absolute inset-0 bg-amber-400/70" aria-hidden />
                  )}
                  {/* Active slide: smooth, timer-synced fill. */}
                  {isActive && (
                    <span
                      ref={progressRef}
                      className="absolute inset-0 origin-left bg-amber-400"
                      style={{ transform: "scaleX(0)" }}
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Slide counter */}
          <p className="hidden shrink-0 text-xs tabular-nums text-white/60 sm:block">
            {String(active + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </p>

          {/* Play / pause control */}
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Resume autoplay" : "Pause autoplay"}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white/80 backdrop-blur-sm transition-colors hover:border-white/50 hover:bg-white/10"
          >
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </button>
        </div>
      </div>
    </section>
  );
}

/** Safe modulo — keeps wrap-around neighbours (e.g. -1 -> last slide) valid. */
function mod(n: number) {
  return ((n % SLIDES.length) + SLIDES.length) % SLIDES.length;
}
