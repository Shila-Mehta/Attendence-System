import { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function AttendanceLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell role="teacher" title="Attendance">
      {children}
    </AppShell>
  );
}