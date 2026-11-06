"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  BookOpen,
  Menu,
  X,
  UserRound,
  LogOut,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Home,
  BookHeart,
  Repeat,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Navigation data                                                           */
/* -------------------------------------------------------------------------- */

/** Minimal prop type so lucide icons stay fully typed (no `any`). */
interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/** Links shown to visitors who are NOT signed in. */
const LOGGED_OUT_NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/all-books", label: "All Books", icon: BookOpen },
];

/** Links shown to signed-in users. */
const LOGGED_IN_NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/all-books", label: "All Books", icon: BookOpen },
  { href: "/add-book", label: "Add Book", icon: BookOpen },
  { href: "/my-books", label: "My Books", icon: BookHeart },
  { href: "/my-borrows", label: "My Borrows", icon: Repeat },
];

/* -------------------------------------------------------------------------- */
/*  Glass styles (shared so desktop & mobile stay consistent)                 */
/* -------------------------------------------------------------------------- */

/** Frosted-glass panel used by the bar and the mobile sheet. */
const GLASS_PANEL =
  "border border-white/60 bg-white/70 backdrop-blur-xl backdrop-saturate-150";

/** Desktop link: quiet pill that lights up on hover / active route. */
const linkClasses = (variant: "desktop" | "mobile", isActive: boolean) =>
  cn(
    "flex items-center transition-all duration-200",
    variant === "desktop"
      ? "rounded-full px-4 py-2 text-sm font-medium"
      : "w-full rounded-xl px-3 py-2.5 text-sm font-medium",
    variant === "mobile" ? "text-slate-700 hover:bg-slate-900/5" : "",
    isActive
      ? "bg-white/85 text-slate-900 shadow-sm ring-1 ring-white/70"
      : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-900"
  );

const NavbarPage = () => {
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  // Glass density deepens once the user scrolls away from the top.
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** A link counts as active when it matches the current route. */
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  /** Sidebar/desktop/mobile links depend on the auth state. */
  const navLinks =
    !isPending && session ? LOGGED_IN_NAV_LINKS : LOGGED_OUT_NAV_LINKS;

  /* ---------------------- Desktop navigation links ------------------------ */
  const desktopLinks = navLinks.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      className={linkClasses("desktop", isActive(link.href))}
    >
      {link.label}
    </Link>
  ));

  /* --------------------- Desktop avatar dropdown ------------------------- */
  const authContent = session ? (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="group h-10 gap-2 rounded-full border border-white/60 bg-white/50 p-1 pr-2 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white/80 hover:shadow-md sm:pr-3"
          >
            <Avatar className="size-8 ring-1 ring-white/70">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="bg-linear-to-br from-primary to-primary/60 text-sm font-semibold text-primary-foreground">
                {session.user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="ml-1 max-w-24 truncate text-sm font-medium text-slate-800">
              {session.user.name}
            </span>
            <ChevronDown
              className="size-4 text-slate-400 transition-transform duration-300 group-aria-expanded:rotate-180"
              aria-hidden
            />
          </Button>
        }
      />

      {/* Glass dropdown panel */}
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-60 rounded-2xl border border-slate-200/70 bg-white/80 p-2 shadow-xl shadow-slate-950/10 ring-0 backdrop-blur-xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1">
            <p className="text-sm font-semibold text-slate-900">
              {session.user.name}
            </p>
            <p className="truncate text-xs text-slate-500">
              {session.user.email}
            </p>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="-mx-2 my-2 bg-slate-200/70" />

          <DropdownMenuItem
            render={<Link href="/profile" />}
            className="gap-2 rounded-xl px-2.5 py-2"
          >
            <UserRound className="size-4 text-slate-500" aria-hidden />
            My Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            onClick={() => signOut()}
            className="gap-2 rounded-xl px-2.5 py-2"
          >
            <LogOut className="size-4" aria-hidden />
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <div className="flex items-center gap-1.5">
      <Link
        href="/signin"
        className="hidden items-center rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-900/5 hover:text-slate-900 sm:inline-flex"
      >
        Login
      </Link>
      <Link
        href="/SignupForm"
        className="group inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-slate-950/15 ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 sm:px-6"
      >
        Register
        <ArrowRight
          className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </div>
  );

  return (
    <header className="pointer-events-none sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      {/* Floating glass bar */}
      <nav
        className={cn(
          "pointer-events-auto mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300 sm:px-5",
          GLASS_PANEL,
          scrolled
            ? "bg-white/80 shadow-lg shadow-slate-950/[0.08]"
            : "bg-white/55 shadow-md shadow-slate-950/[0.04]"
        )}
      >
        {/* ------------------------------ Logo ------------------------------ */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5 sm:gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-slate-950/20 ring-1 ring-white/20 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
            <BookOpen className="size-5" aria-hidden />
          </div>
          <div className="leading-tight">
            <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              Book<span className="text-amber-500">Library</span>
            </h1>
            <p className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:block">
              Discover your next story
            </p>
          </div>
        </Link>

        {/* ---------------------- Desktop navigation ------------------------ */}
        <div className="hidden items-center gap-1 lg:flex">{desktopLinks}</div>

        {/* --------------------- Desktop authentication --------------------- */}
        <div className="hidden items-center gap-3 lg:flex">
          {!isPending && authContent}
        </div>

        {/* ----------------------- Mobile menu button ----------------------- */}
        <Button
          variant="outline"
          size="icon"
          className="size-10 rounded-xl border-white/60 bg-white/50 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/80 lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="size-5" aria-hidden />
          ) : (
            <Menu className="size-5" aria-hidden />
          )}
        </Button>
      </nav>

      {/* ------------------------- Mobile glass sheet ------------------------ */}
      {mobileMenuOpen && (
        <div
          className={cn(
            "pointer-events-auto mt-2 animate-in fade-in-0 slide-in-from-top-1 rounded-2xl p-3 shadow-xl shadow-slate-950/10 duration-300 lg:hidden",
            GLASS_PANEL
          )}
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={linkClasses("mobile", isActive(link.href))}
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-slate-900/5 text-slate-500">
                  <link.icon className="size-4" aria-hidden />
                </span>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile authentication row */}
          <div className="mt-2 border-t border-slate-200/70 pt-3">
            {!isPending &&
              (session ? (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-white/60 px-3 py-2.5 ring-1 ring-white/70">
                  <Avatar className="size-9 ring-1 ring-white/70">
                    <AvatarImage src={session.user.image || ""} />
                    <AvatarFallback className="bg-linear-to-br from-primary to-primary/60 text-sm font-semibold text-primary-foreground">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {session.user.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {session.user.email}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      aria-label="My profile"
                      className="flex size-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 transition-colors hover:bg-slate-900/5 hover:text-slate-900"
                    >
                      <UserRound className="size-4" aria-hidden />
                    </Link>
                    <button
                      onClick={() => signOut()}
                      aria-label="Logout"
                      className="flex size-9 items-center justify-center rounded-full border border-red-200/80 bg-red-50/60 text-red-500 transition-colors hover:bg-red-100"
                    >
                      <LogOut className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-white hover:text-slate-900"
                  >
                    Login
                  </Link>
                  <Link
                    href="/SignupForm"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-lg shadow-slate-950/15 transition-all hover:bg-primary/90"
                  >
                    Register
                  </Link>
                </div>
              ))}
          </div>

          {/* Tip card */}
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/70 bg-white/50 p-3">
            <Sparkles
              className="size-5 shrink-0 text-amber-500"
              aria-hidden
            />
            <p className="text-xs leading-relaxed text-slate-600">
              Discover amazing books and explore new stories.
            </p>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavbarPage;
