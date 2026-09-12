import { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function OfficeLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell role="office" title="Office">
      {children}
    </AppShell>
  );
}