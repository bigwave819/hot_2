import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getDefaultRouteForRole } from "@/lib/auth-routes";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect(getDefaultRouteForRole(user.role));
  }

  return <>{children}</>;
}