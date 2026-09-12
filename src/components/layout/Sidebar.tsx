"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookUser,
  CalendarDays,
  ClipboardCheck,
  FileSpreadsheet,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  MapPin,
  Megaphone,
  School,
  Settings2,
  ShieldCheck,
  Users,
  UserRoundCog,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export const NAV_BY_ROLE: Record<"admin" | "office" | "principal" | "teacher", NavSection[]> = {
  admin: [
    {
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Students", href: "/admin/students", icon: GraduationCap },
        { label: "Classes", href: "/admin/classes", icon: School },
        { label: "Contacts", href: "/admin/contacts", icon: BookUser },
        { label: "Staff", href: "/admin/staff", icon: UserRoundCog },
        { label: "Calendar", href: "/admin/calendar", icon: CalendarDays },
      ],
    },
    {
      title: "Attendance",
      items: [
        { label: "Settings", href: "/admin/attendance-settings", icon: Settings2 },
        { label: "CSV Import", href: "/admin/csv-import", icon: FileSpreadsheet },
      ],
    },
  ],
  office: [
    {
      items: [
        { label: "Live Attendance", href: "/office/live-attendance", icon: MapPin },
        { label: "Unexplained", href: "/office/unexplained-absence", icon: Megaphone },
        { label: "Front Desk", href: "/office/front-desk", icon: ClipboardCheck },
        { label: "Corrections", href: "/office/corrections", icon: ListChecks },
      ],
    },
  ],
  principal: [
    {
      items: [
        { label: "Dashboard", href: "/principal/dashboard", icon: LayoutDashboard },
        { label: "Students", href: "/principal/students", icon: GraduationCap },
      ],
    },
  ],
  teacher: [
    {
      items: [
        { label: "Roll Call", href: "/attendance/roll-call", icon: ClipboardCheck },
        { label: "Review", href: "/attendance/review", icon: ListChecks },
      ],
    },
  ],
};

export function Sidebar({
  role,
  className = "",
}: {
  role: keyof typeof NAV_BY_ROLE;
  className?: string;
}) {
  const pathname = usePathname();
  const sections = NAV_BY_ROLE[role];

  return (
    <aside
      className={`w-64 shrink-0 bg-navy text-sidebar-foreground flex flex-col ${className}`}
    >
      {/* Brand */}
      <div className="h-16 px-5 flex items-center gap-2 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg bg-white/10 grid place-items-center text-white">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-white">AttendEase</div>
          <div className="text-[11px] text-white/50">Attendance System</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        {sections.map((section, i) => (
          <div key={i} className="mb-4">
            {section.title && (
              <div className="px-5 mb-1.5 text-[11px] uppercase tracking-wider text-white/40">
                {section.title}
              </div>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`mx-2 flex items-center gap-3 px-3 h-9 rounded-md text-sm transition
                        ${
                          isActive
                            ? "bg-sidebar-accent text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border text-[11px] text-white/40">
        v0.1 · mock build
      </div>
    </aside>
  );
}