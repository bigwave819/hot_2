import type { UserRole } from "@/server/auth/config";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  BedDouble,
  CreditCard,
  Images,
  UtensilsCrossed,
  FileText,
  UserCog,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
};

export const DASHBOARD_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["receptionist", "admin"] },
  {
    label: "Reservations",
    href: "/dashboard/reservations",
    icon: CalendarCheck,
    roles: ["receptionist", "admin"],
  },
  { label: "Guests", href: "/dashboard/guests", icon: Users, roles: ["receptionist", "admin"] },
  { label: "Rooms", href: "/dashboard/rooms", icon: BedDouble, roles: ["receptionist", "admin"] },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard, roles: ["receptionist", "admin"] },
  { label: "Gallery", href: "/dashboard/admin/gallery", icon: Images, roles: ["admin"] },
  { label: "Restaurant Menu", href: "/dashboard/admin/menu", icon: UtensilsCrossed, roles: ["admin"] },
  { label: "Website Content", href: "/dashboard/admin/content", icon: FileText, roles: ["admin"] },
  { label: "Users", href: "/dashboard/admin/users", icon: UserCog, roles: ["admin"] },
  { label: "Reports", href: "/dashboard/admin/reports", icon: BarChart3, roles: ["admin"] },
  { label: "Settings", href: "/dashboard/admin/settings", icon: Settings, roles: ["admin"] },
];

export function getNavForRole(role: UserRole): NavItem[] {
  return DASHBOARD_NAV.filter((item) => item.roles.includes(role));
}