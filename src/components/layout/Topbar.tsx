"use client";

import { Bell, Menu, Search } from "lucide-react";

export function Topbar({
  title,
  onMenuClick,
}: {
  title?: string;
  onMenuClick?: () => void;
}) {
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center gap-3 px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 rounded-md hover:bg-muted"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="text-sm font-medium truncate">{title ?? "Dashboard"}</div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 h-9 w-64 px-3 rounded-md border border-border bg-background">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <button
          className="relative h-9 w-9 grid place-items-center rounded-md hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-danger" />
        </button>

        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-border">
          <div className="h-8 w-8 rounded-full bg-navy text-white grid place-items-center text-xs font-semibold">
            AK
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="text-xs font-medium">Admin User</div>
            <div className="text-[11px] text-muted-foreground">admin@school.edu</div>
          </div>
        </div>
      </div>
    </header>
  );
}