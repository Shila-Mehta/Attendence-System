"use client";

import { ReactNode, useState } from "react";
import { Sidebar, NAV_BY_ROLE } from "./Sidebar";
import { Topbar } from "./Topbar";

const ROLE_LABEL: Record<keyof typeof NAV_BY_ROLE, string> = {
  admin: "Admin",
  office: "Office",
  principal: "Principal",
  teacher: "Teacher",
};

const ROLE_USER: Record<
  keyof typeof NAV_BY_ROLE,
  { name: string; email: string }
> = {
  admin: { name: "Usman Bashir", email: "usman@school.edu" },
  office: { name: "Junaid Akhtar", email: "junaid@school.edu" },
  principal: { name: "Nazia Rafiq", email: "nazia@school.edu" },
  teacher: { name: "Fatima Iqbal", email: "fatima@school.edu" },
};

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
  const user = ROLE_USER[role];

  return (
    <div className="min-h-[100dvh] flex bg-background overflow-x-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar role={role} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex shadow-2xl">
            <Sidebar role={role} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content view */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={title}
          role={ROLE_LABEL[role]}
          userName={user.name}
          userEmail={user.email}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}