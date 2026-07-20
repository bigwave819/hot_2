"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { getNavForRole } from "@/lib/dashboard-nav";
import { RoleBadge } from "@/components/dashboard/role-badge";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { cn } from "@/lib/utils";
import type { AppUser } from "@/server/auth/config";

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ user, onNavigate }: { user: AppUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = getNavForRole(user.role);

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({ user, children }: { user: AppUser; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-secondary/40">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <Link href="/dashboard" className="font-display px-6 py-6 text-xl font-medium">
          Baobab Hotel
        </Link>
        <NavLinks user={user} />
        <div className="border-t border-border p-4">
          <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <div className="mt-2 flex items-center justify-between">
            <RoleBadge role={user.role} />
            <SignOutButton />
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col bg-card">
            <div className="flex items-center justify-between px-6 py-6">
              <span className="font-display text-xl font-medium">Baobab Hotel</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks user={user} onNavigate={() => setMobileOpen(false)} />
            <div className="border-t border-border p-4">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex items-center justify-between">
                <RoleBadge role={user.role} />
                <SignOutButton />
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-card px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display text-lg font-medium">Baobab Hotel</span>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}