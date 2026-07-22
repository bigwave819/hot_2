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
        "sticky top-0 z-40 w-full border-b transition-colors",
        scrolled ? "border-border bg-background/95 backdrop-blur-sm" : "border-transparent bg-background",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-xl font-medium text-foreground">
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
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link
              href={user.role === "guest" ? "/bookings" : getDefaultRouteForRole(user.role)}
              className={buttonVariants({ size: "sm" })}
            >
              {user.role === "guest" ? "My Bookings" : "Dashboard"}
            </Link>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Sign In
              </Link>
              <Link href="/rooms" className={buttonVariants({ size: "sm" })}>
                Book Your Stay
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-foreground md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto flex h-full w-72 flex-col gap-1 bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-lg font-medium">Baobab Hotel</span>
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
                    className={buttonVariants({ variant: "outline", className: "w-full" })}
                  >
                    Sign In
                  </Link>
                  <ThemeToggle />
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