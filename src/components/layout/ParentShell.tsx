"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Bell,
  CalendarCheck,
  ChevronDown,
  FileWarning,
  Home,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const TABS = [
  { label: "Home",           short: "Home",    href: "/parent/home",           icon: Home },
  { label: "Report Absence", short: "Absence", href: "/parent/report-absence", icon: FileWarning },
  { label: "History",        short: "History", href: "/parent/history",        icon: CalendarCheck },
  { label: "Alerts",         short: "Alerts",  href: "/parent/alerts",         icon: Bell },
];

export type ParentChildOption = {
  id: string;
  name: string;
  grade: string;
  className: string;
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function ParentShell({
  childName,
  childClass,
  childOptions,
  alertCount = 0,
  children,
}: {
  childName: string;
  childClass: string;
  childOptions?: ParentChildOption[];
  alertCount?: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // close child-switcher on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // fall back to a single-child list if none provided
  const options: ParentChildOption[] =
    childOptions && childOptions.length > 0
      ? childOptions
      : [{ id: "self", name: childName, grade: "", className: childClass }];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ================= Header ================= */}
      <header className="h-16 bg-navy text-white shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-full flex items-center gap-3">
          <Link href="/parent/home" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-white/10 grid place-items-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline text-sm font-semibold">
              AttendEase
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* Child switcher */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 h-10 pl-1 pr-2 sm:pr-3 rounded-full hover:bg-white/10 transition"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <div className="h-8 w-8 rounded-full bg-white/10 grid place-items-center text-xs font-semibold">
                  {initialsOf(childName)}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-xs font-medium">{childName}</div>
                  <div className="text-[11px] text-white/60">{childClass}</div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-white/60" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-surface text-foreground shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                    Your children
                  </div>
                  <ul className="py-1">
                    {options.map((c) => {
                      const active = c.name === childName;
                      return (
                        <li key={c.id}>
                          <button
                            onClick={() => setMenuOpen(false)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted transition ${
                              active ? "bg-muted/60" : ""
                            }`}
                          >
                            <div className="h-8 w-8 rounded-full bg-navy text-white grid place-items-center text-xs font-semibold shrink-0">
                              {initialsOf(c.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">
                                {c.name}
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate">
                                {c.grade
                                  ? `${c.grade} · ${c.className}`
                                  : c.className}
                              </div>
                            </div>
                            {active && (
                              <span className="h-2 w-2 rounded-full bg-blue shrink-0" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {options.length === 1 && (
                    <div className="px-4 py-2.5 text-[11px] text-muted-foreground border-t border-border">
                      Only one child linked to this account.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Alerts bell */}
            <Link
              href="/parent/alerts"
              className="relative h-9 w-9 grid place-items-center rounded-md hover:bg-white/10"
              aria-label="Alerts"
            >
              <Bell className="h-4 w-4" />
              {alertCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-[10px] font-semibold grid place-items-center">
                  {alertCount}
                </span>
              )}
            </Link>

            {/* Sign out — text on desktop, icon on mobile */}
            <Link
              href="/parent-login"
              className="hidden sm:inline-flex h-9 px-3 rounded-md border border-white/20 text-xs hover:bg-white/10 items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Link>
            <Link
              href="/parent-login"
              className="sm:hidden h-9 w-9 grid place-items-center rounded-md hover:bg-white/10"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ================= Desktop pill tabs ================= */}
      <nav className="hidden md:block bg-surface border-b border-border shrink-0">
        <div className="max-w-5xl mx-auto px-6">
          <ul className="flex items-center gap-1 py-3">
            {TABS.map((t) => {
              const active =
                pathname === t.href || pathname.startsWith(t.href + "/");
              const Icon = t.icon;
              return (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className={`inline-flex items-center gap-2 h-9 px-4 rounded-full text-sm transition ${
                      active
                        ? "bg-blue-light text-blue font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t.label}</span>
                    {t.href === "/parent/alerts" && alertCount > 0 && (
                      <span className="ml-0.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-danger text-white text-[10px] font-semibold">
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

      {/* ================= Content ================= */}
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">{children}</div>
      </main>

      {/* ================= Footer (desktop only) ================= */}
      <footer className="hidden md:block border-t border-border bg-surface shrink-0">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} AttendEase</span>
          <span>Parent portal</span>
        </div>
      </footer>

      {/* ================= Mobile bottom tab bar ================= */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border">
        <ul className="grid grid-cols-4 pb-[env(safe-area-inset-bottom)]">
          {TABS.map((t) => {
            const active =
              pathname === t.href || pathname.startsWith(t.href + "/");
            const Icon = t.icon;
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className={`relative flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] transition ${
                    active
                      ? "text-blue after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:w-8 after:h-0.5 after:rounded-full after:bg-blue"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="relative">
                    <Icon className="h-5 w-5" />
                    {t.href === "/parent/alerts" && alertCount > 0 && (
                      <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-[10px] font-semibold grid place-items-center">
                        {alertCount}
                      </span>
                    )}
                  </span>
                  <span className={active ? "font-medium" : ""}>{t.short}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}