import { PageContainer } from "@/components/layout/PageContainer";

export default function AdminDashboardPage() {
  return (
    <PageContainer
      title="Admin Dashboard"
      description="Overview of students, staff and today's attendance."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Students", value: "248" },
          { label: "Active", value: "232" },
          { label: "Inactive", value: "16" },
          { label: "Staff", value: "42" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}