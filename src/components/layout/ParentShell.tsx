"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
  Bell,
  CalendarCheck,
  Home,
  LogOut,
  ShieldCheck,
  UserCircle2,
  FileWarning,
} from "lucide-react";

const TABS = [
  { label: "Home",             href: "/parent/home",           icon: Home },
  { label: "Report Absence",   href: "/parent/report-absence", icon: FileWarning },
  { label: "History",          href: "/parent/history",        icon: CalendarCheck },
  { label: "Alerts",           href: "/parent/alerts",         icon: Bell },
];

export function ParentShell({
  childName,
  childClass,
  alertCount = 0,
  children,
}: {
  childName: string;
  childClass: string;
  alertCount?: number;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-full flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/10 grid place-items-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">AttendEase</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/10 grid place-items-center text-xs font-semibold">
                {childName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase())
                  .join("")}
              </div>
              <div className="leading-tight">
                <div className="text-xs font-medium">{childName}</div>
                <div className="text-[11px] text-white/60">{childClass}</div>
              </div>
            </div>

            <Link
              href="/parent/alerts"
              className="relative h-9 w-9 grid place-items-center rounded-md hover:bg-white/10"
              aria-label="Alerts"
            >
              <Bell className="h-4 w-4" />
              {alertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger" />
              )}
            </Link>

            <Link
              href="/parent-login"
              className="h-9 px-3 rounded-md border border-white/20 text-xs hover:bg-white/10 inline-flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ul className="flex items-center gap-1 -mb-px overflow-x-auto">
            {TABS.map((t) => {
              const active = pathname === t.href || pathname.startsWith(t.href + "/");
              const Icon = t.icon;
              return (
                <li key={t.href} className="shrink-0">
                  <Link
                    href={t.href}
                    className={`flex items-center gap-2 h-11 px-3 border-b-2 text-sm transition ${
                      active
                        ? "border-blue text-blue font-medium"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t.label}</span>
                    {t.href === "/parent/alerts" && alertCount > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-danger text-white text-[10px] font-semibold">
                        {alertCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} AttendEase</span>
          <span className="inline-flex items-center gap-1.5">
            <UserCircle2 className="h-3.5 w-3.5" />
            Parent portal
          </span>
        </div>
      </footer>
    </div>
  );
}