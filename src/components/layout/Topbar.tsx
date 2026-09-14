"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, Menu, Search, UserCircle2 } from "lucide-react";

export function Topbar({
  title,
  role = "Admin",
  userName = "Admin User",
  userEmail = "admin@school.edu",
  onMenuClick,
}: {
  title?: string;
  role?: string;
  userName?: string;
  userEmail?: string;
  onMenuClick?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center gap-3 px-4 sm:px-6 shrink-0 relative z-30">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 rounded-md hover:bg-muted transition-colors shrink-0"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="text-sm font-medium truncate">{title ?? "Dashboard"}</div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 h-9 w-64 px-3 rounded-md border border-border bg-background">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            placeholder="Search…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
          />
        </div>

        <button
          className="relative h-9 w-9 grid place-items-center rounded-md hover:bg-muted transition-colors shrink-0"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-danger" />
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 h-10 pl-1 pr-2 sm:pr-3 rounded-full hover:bg-muted transition-colors max-w-[180px] sm:max-w-none"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div className="h-8 w-8 rounded-full bg-navy text-white grid place-items-center text-xs font-semibold shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left leading-tight min-w-0">
              <div className="text-xs font-medium truncate">{userName}</div>
              <div className="text-[11px] text-muted-foreground truncate">{role}</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-surface shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-navy text-white grid place-items-center text-sm font-semibold shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {userName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {userEmail}
                    </div>
                  </div>
                </div>
              </div>

              <ul className="py-1">
                <li>
                  <Link
                    href="/staff-login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-muted transition-colors"
                  >
                    <UserCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">Switch account</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/staff-login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left text-danger hover:bg-danger-light transition-colors"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span className="truncate">Sign out</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}