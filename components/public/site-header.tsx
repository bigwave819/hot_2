"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { getDefaultRouteForRole } from "@/lib/auth-routes";
import type { AppUser } from "@/server/auth/config";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Rooms", href: "/rooms" },
  { label: "Gallery", href: "/gallery" },
  { label: "Dining", href: "/dining" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/**
 * Shared underline-draw-on-hover treatment for nav links: a 1px gold rule
 * that scales in from the left on hover/focus, permanently visible on the
 * active route. CSS-only (no JS), tied to the same duration/ease tokens
 * the GSAP-driven parts of the site use, so it reads as one motion
 * language rather than a separate hover convention.
 */
const navLinkUnderline =
  "relative pb-0.5 after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:bg-gold after:transition-transform after:duration-(--duration-hover) after:ease-(--ease-signature)";

export function SiteHeader({ user }: { user: AppUser | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-colors duration-(--duration-hover) ease-(--ease-signature-in-out)",
        scrolled ? "border-border bg-background/95 backdrop-blur-sm" : "border-transparent bg-background",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-xl font-medium tracking-tight text-foreground">
          Baobab Hotel
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-sm font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  navLinkUnderline,
                  active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {user ? (
            <Link
              href={user.role === "guest" ? "/bookings" : getDefaultRouteForRole(user.role)}
              className={buttonVariants({ size: "sm" })}
            >
              {user.role === "guest" ? "My Bookings" : "Dashboard"}
            </Link>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: "hairline", size: "sm" })}>
                Sign In
              </Link>
              <Link href="/rooms" className={buttonVariants({ size: "sm" })}>
                Book Your Stay
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="rounded-md p-2 text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto flex h-full w-72 flex-col gap-1 bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-lg font-medium tracking-tight">Baobab Hotel</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              {user ? (
                <Link
                  href={user.role === "guest" ? "/bookings" : getDefaultRouteForRole(user.role)}
                  onClick={() => setMobileOpen(false)}
                  className={buttonVariants({ className: "w-full" })}
                >
                  {user.role === "guest" ? "My Bookings" : "Dashboard"}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className={buttonVariants({ variant: "hairline", className: "w-full" })}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/rooms"
                    onClick={() => setMobileOpen(false)}
                    className={buttonVariants({ className: "w-full" })}
                  >
                    Book Your Stay
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}