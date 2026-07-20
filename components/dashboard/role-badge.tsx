import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/server/auth/config";

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  receptionist: "Receptionist",
  guest: "Guest",
};

const ROLE_VARIANT: Record<UserRole, "info" | "success" | "default"> = {
  admin: "info",
  receptionist: "success",
  guest: "default",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return <Badge variant={ROLE_VARIANT[role]}>{ROLE_LABEL[role]}</Badge>;
}