import { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function PrincipalLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell role="principal" title="Principal">
      {children}
    </AppShell>
  );
}