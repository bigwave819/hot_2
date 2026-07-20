import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, type AppUser, type UserRole } from "./config";

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});


export async function getCurrentUser(): Promise<AppUser | null> {
  const session = await getSession();
  if (!session?.user) return null;
  if (!session.user.isActive) return null;
  return session.user;
}

export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(allowed: UserRole[]): Promise<AppUser> {
  const user = await requireUser();
  if (!allowed.includes(user.role)) {
    redirect("/");
  }
  return user;
}