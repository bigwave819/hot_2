import type { UserRole } from "@/server/auth/config";

/** Where each role lands after login when no valid `redirect` param is present. */
export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case "admin":
    case "receptionist":
      return "/dashboard";
    case "guest":
    default:
      return "/";
  }
}

/** Is this role allowed to land on the given path at all? Mirrors middleware.ts's route groups. */
export function isRouteAllowedForRole(path: string, role: UserRole): boolean {
  if (path.startsWith("/dashboard/admin")) return role === "admin";
  if (path.startsWith("/dashboard")) return role === "receptionist" || role === "admin";
  return true; // guest-area and public routes are open to any authenticated role
}

/** Resolve the safe post-login destination: honor `redirect` if the role is actually allowed there. */
export function resolveLoginRedirect(role: UserRole, redirectParam: string | null): string {
  if (redirectParam && redirectParam.startsWith("/") && isRouteAllowedForRole(redirectParam, role)) {
    return redirectParam;
  }
  return getDefaultRouteForRole(role);
}