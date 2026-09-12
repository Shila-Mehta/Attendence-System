"use client";

import { ReactNode, useState } from "react";
import { Sidebar, NAV_BY_ROLE } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({
  role,
  title,
  children,
}: {
  role: keyof typeof NAV_BY_ROLE;
  title?: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar role={role} />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex">
            <Sidebar role={role} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}