import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Heart,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Social brand icons                                                        */
/* -------------------------------------------------------------------------- */

/**
 * lucide-react no longer ships brand logos, so the official Simple Icons
 * paths are inlined here as tiny components (same API: className prop).
 */
type SocialIconProps = React.SVGProps<SVGSVGElement>;

function SocialSvg({ children, ...props }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      {children}
    </svg>
  );
}

const FacebookIcon = (props: SocialIconProps) => (
  <SocialSvg {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 22.027 24 17.062 24 12.073z" />
  </SocialSvg>
);

const TwitterIcon = (props: SocialIconProps) => (
  <SocialSvg {...props}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </SocialSvg>
);

const InstagramIcon = (props: SocialIconProps) => (
  <SocialSvg {...props}>
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.667.935 19.876.63 19.111.333 18.241.131 16.964.072 15.68.011 15.273 0 12.001 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
  </SocialSvg>
);

const GithubIcon = (props: SocialIconProps) => (
  <SocialSvg {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.51-1.523.278-3.175 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.788 1.653.3 2.873.275 3.175.769.84 1.235 1.911 1.235 3.22 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </SocialSvg>
);

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

/** Static footer config — links point only to pages that exist in the app.
 * Edit the entries below to update the footer content in one place.
 */
const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/all-books", label: "All Books" },
  { href: "/add-book", label: "Add Book" },
  { href: "/signin", label: "Login" },
  { href: "/SignupForm", label: "Get Started" },
];

interface SocialLink {
  href: string;
  label: string;
  icon: React.ComponentType<SocialIconProps>;
}

const SOCIALS: SocialLink[] = [
  { href: "https://facebook.com", label: "Facebook", icon: FacebookIcon },
  { href: "https://twitter.com", label: "Twitter", icon: TwitterIcon },
  { href: "https://instagram.com", label: "Instagram", icon: InstagramIcon },
  { href: "https://github.com", label: "GitHub", icon: GithubIcon },
];

interface ContactItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string | null;
}

const CONTACT: ContactItem[] = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@booklibrary.com",
    href: "mailto:hello@booklibrary.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (555) 234-1098",
    href: "tel:+15552341098",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "221 Reader's Lane, Bookville",
    href: null,
  },
];

/* -------------------------------------------------------------------------- */
/*  Footer                                                                    */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*  Prerender-safe copyright year                                             */
/* -------------------------------------------------------------------------- */

/**
 * `new Date()` is unstable during prerendering, so the year is cached
 * (it changes at most once a year) — the recommended "Cache" fix for
 * this Next.js configuration.
 */
async function getCopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

/**
 * FooterPage — site-wide footer shown on every page via the root layout.
 *
 * Dark neutral band matching the site's header-band language: brand logo
 * + tagline, a short line about the website, quick links, contact info
 * and social icon buttons, closed by a copyright bar.
 */
const FooterPage = async () => {
  const year = await getCopyrightYear();
  return (
    <footer className="relative mt-auto overflow-x-clip bg-neutral-950 text-white">
      {/* Decorative glass circles + warm glow */}
      <div className="pointer-events-none absolute -top-24 right-1/4 size-64 rounded-full border border-white/10" aria-hidden />
      <div className="pointer-events-none absolute -top-40 right-32 size-80 rounded-full border border-white/10" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-amber-400/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 sm:pt-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* ------------------------------ Brand ------------------------------ */}
          <div className="min-w-0">
            <Link href="/" className="group inline-flex items-center gap-2.5 sm:gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/25 ring-1 ring-white/20 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                <BookOpen className="size-5" aria-hidden />
              </span>
              <span className="text-lg font-bold tracking-tight">
                Book<span className="text-amber-400">Library</span>
              </span>
            </Link>

            {/* Short line about the website */}
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              A community book library where readers discover, share and
              borrow their favourite stories — from timeless classics to the
              newest arrivals on the shelf.
            </p>

            {/* Social links */}
            <div className="mt-6 flex items-center gap-2.5" aria-label="Social links">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`BookLibrary on ${social.label}`}
                  className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/60 hover:bg-amber-400 hover:text-neutral-950 hover:shadow-lg hover:shadow-amber-400/30"
                >
                  <social.icon className="size-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {/* ---------------------------- Quick links ---------------------------- */}
          <nav aria-label="Footer navigation">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
              Quick Links
            </h2>

            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-white/60 transition-colors duration-200 hover:text-amber-400"
                  >
                    <span className="h-px w-3 bg-white/25 transition-all duration-200 group-hover:w-5 group-hover:bg-amber-400" aria-hidden />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ------------------------------- Contact ----------------------------- */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
              Contact Us
            </h2>

            <ul className="mt-4 space-y-3.5">
              {CONTACT.map((item) => {
                const content = (
                  <>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-amber-400">
                      <item.icon className="size-3.5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-semibold uppercase tracking-widest text-white/40">
                        {item.label}
                      </span>
                      <span className="block truncate text-sm text-white/70 group-hover:text-amber-400 transition-colors duration-200">
                        {item.value}
                      </span>
                    </span>
                  </>
                );
                return (
                  <li key={item.label}>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="group inline-flex items-center gap-3 text-left"
                      >
                        {content}
                      </a>
                    ) : (
                      <div className="group inline-flex items-center gap-3 text-left">
                        {content}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* --------------------------- Copyright bar --------------------------- */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/50">
            © {year} BookLibrary. All rights reserved.
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs text-white/50">
            Made with
            <Heart className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
            for readers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterPage;
