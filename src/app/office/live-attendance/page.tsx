"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileEdit,
  Users,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  liveClasses,
  type ClassSnapshot,
  type SubmissionStatus,
} from "@/data/mock/office";

export default function LiveAttendancePage() {
  const [rows, setRows] = useState<ClassSnapshot[]>(liveClasses);
  const [filter, setFilter] = useState<"all" | SubmissionStatus>("all");
  const [refreshedAt, setRefreshedAt] = useState<string>("09:14");
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter]
  );

  const counts = useMemo(() => {
    let submitted = 0;
    let pending = 0;
    let overdue = 0;
    let draft = 0;
    for (const r of rows) {
      if (r.status === "Submitted") submitted++;
      else if (r.status === "Pending") pending++;
      else if (r.status === "Overdue") overdue++;
      else if (r.status === "Draft") draft++;
    }
    return { submitted, pending, overdue, draft };
  }, [rows]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      setRefreshedAt(`${hh}:${mm}`);
      setRefreshing(false);
    }, 600);
  };

  return (
    <PageContainer
      title="Live Attendance Board"
      description="Monitor class attendance and submission status in real time."
      actions={
        <button
          onClick={handleRefresh}
          className="h-9 px-3 rounded-md border border-border text-sm hover:bg-muted inline-flex items-center gap-1.5"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      }
    >
      {/* Header strip */}
      <div className="rounded-lg border border-border bg-surface px-4 py-3 mb-4 flex flex-wrap items-center gap-3">
        <span className="h-9 w-9 rounded-lg bg-blue-light text-blue grid place-items-center shrink-0">
          <Activity className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">
            Morning roll call · 12 Sep 2026
          </div>
          <div className="text-xs text-muted-foreground">
            Last updated at {refreshedAt}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 text-success">
            <span className="h-2 w-2 rounded-full bg-success" />
            {counts.submitted} submitted
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            {counts.pending} pending
          </span>
          <span className="inline-flex items-center gap-1 text-warning">
            <span className="h-2 w-2 rounded-full bg-warning" />
            {counts.draft} draft
          </span>
          <span className="inline-flex items-center gap-1 text-danger">
            <span className="h-2 w-2 rounded-full bg-danger" />
            {counts.overdue} overdue
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Submitted"
          value={counts.submitted}
          total={rows.length}
          tone="success"
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Pending"
          value={counts.pending}
          total={rows.length}
          tone="muted"
        />
        <StatCard
          icon={<FileEdit className="h-4 w-4" />}
          label="Draft"
          value={counts.draft}
          total={rows.length}
          tone="warning"
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Overdue"
          value={counts.overdue}
          total={rows.length}
          tone="danger"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-1 mb-4">
        <FilterTab active={filter === "all"} onClick={() => setFilter("all")}>
          All ({rows.length})
        </FilterTab>
        <FilterTab
          active={filter === "Submitted"}
          onClick={() => setFilter("Submitted")}
        >
          Submitted ({counts.submitted})
        </FilterTab>
        <FilterTab
          active={filter === "Pending"}
          onClick={() => setFilter("Pending")}
        >
          Pending ({counts.pending})
        </FilterTab>
        <FilterTab
          active={filter === "Draft"}
          onClick={() => setFilter("Draft")}
        >
          Draft ({counts.draft})
        </FilterTab>
        <FilterTab
          active={filter === "Overdue"}
          onClick={() => setFilter("Overdue")}
        >
          Overdue ({counts.overdue})
        </FilterTab>
      </div>

      {/* Class grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <ClassCard key={c.classId} cls={c} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-border bg-surface px-6 py-16 text-center text-sm text-muted-foreground">
          No classes match this filter.
        </div>
      )}
    </PageContainer>
  );
}

/* ---------------- sub-components ---------------- */

function StatCard({
  icon,
  label,
  value,
  total,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  total: number;
  tone: "success" | "muted" | "warning" | "danger";
}) {
  const cls =
    tone === "success"
      ? "text-success"
      : tone === "danger"
      ? "text-danger"
      : tone === "warning"
      ? "text-warning"
      : "text-muted-foreground";

  const pct = total ? Math.round((value / total) * 100) : 0;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className={`flex items-center gap-1.5 text-xs ${cls}`}>
        {icon}
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">
        {pct}% of classes
      </div>
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-8 px-3 rounded-md text-xs font-medium transition ${
        active ? "bg-navy text-white" : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function ClassCard({ cls }: { cls: ClassSnapshot }) {
  const markedTotal = cls.present + cls.absent + cls.late;
  const pct = cls.total ? Math.round((markedTotal / cls.total) * 100) : 0;

  const palette: Record<
    SubmissionStatus,
    { label: string; badge: string; ring: string }
  > = {
    Submitted: {
      label: "Submitted",
      badge: "bg-success-light text-success",
      ring: "border-l-success",
    },
    Pending: {
      label: "Pending",
      badge: "bg-muted text-muted-foreground",
      ring: "border-l-muted-foreground/40",
    },
    Draft: {
      label: "Draft",
      badge: "bg-warning-light text-warning",
      ring: "border-l-warning",
    },
    Overdue: {
      label: "Overdue",
      badge: "bg-danger-light text-danger",
      ring: "border-l-danger",
    },
  };

  const p = palette[cls.status];

  return (
    <div
      className={`rounded-lg border border-border bg-surface border-l-4 ${p.ring} overflow-hidden hover:shadow-sm transition`}
    >
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">
              {cls.grade} · {cls.name}
            </div>
            <div className="text-xs text-muted-foreground truncate mt-0.5">
              {cls.room} · {cls.teacher}
            </div>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${p.badge}`}
          >
            {p.label}
          </span>
        </div>
      </div>

      {/* Attendance counts — only when there is data */}
      <div className="px-4 py-3">
        {cls.status === "Pending" || cls.status === "Overdue" ? (
          <div className="text-xs text-muted-foreground py-4 text-center">
            {cls.status === "Pending"
              ? "Waiting for teacher submission."
              : "Roll call is overdue — please follow up."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              <MiniCount
                label="Present"
                value={cls.present}
                tone="success"
              />
              <MiniCount label="Absent" value={cls.absent} tone="danger" />
              <MiniCount label="Late" value={cls.late} tone="warning" />
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                <span>
                  {markedTotal} of {cls.total} marked
                </span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full ${
                    pct === 100 ? "bg-success" : "bg-blue"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {cls.submittedAt
            ? `Submitted ${cls.submittedAt}`
            : cls.status === "Draft"
            ? "Draft in progress"
            : "Not yet submitted"}
        </span>
        <button className="inline-flex items-center gap-0.5 text-blue hover:underline">
          View
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function MiniCount({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "danger" | "warning";
}) {
  const cls =
    tone === "success"
      ? "text-success"
      : tone === "danger"
      ? "text-danger"
      : "text-warning";
  return (
    <div className="rounded-md border border-border bg-background py-2">
      <div className={`text-lg font-semibold ${cls}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}