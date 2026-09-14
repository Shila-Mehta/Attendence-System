"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileEdit,
  GraduationCap,
  RefreshCw,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  liveClasses,
  unexplainedCases,
  type ClassSnapshot,
  type SubmissionStatus,
} from "@/data/mock/office";

function titleCase(s: string) {
  return s
    .split(" ")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export default function LiveAttendancePage() {
  const [rows] = useState<ClassSnapshot[]>(liveClasses);
  const [filter, setFilter] = useState<"all" | SubmissionStatus>("all");
  const [refreshedAt, setRefreshedAt] = useState<string>("09:14");
  const [refreshing, setRefreshing] = useState(false);
  const [openClass, setOpenClass] = useState<ClassSnapshot | null>(null);

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
          className="h-10 sm:h-9 px-4 sm:px-3.5 rounded-md border border-border text-sm font-medium sm:font-normal hover:bg-muted flex items-center justify-center gap-2 sm:gap-1.5 w-full sm:w-auto transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 sm:h-3.5 sm:w-3.5 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>
      }
    >
      {/* Header strip */}
      <div className="rounded-lg border border-border bg-surface px-4 py-4 sm:px-5 sm:py-4 mb-5 sm:mb-6 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 sm:gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0 w-full">
          <span className="h-10 w-10 rounded-lg bg-blue-light text-blue border border-blue/20 grid place-items-center shrink-0">
            <Activity className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">
              Morning roll call · 12 Sep 2026
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Last updated at {refreshedAt}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-4 text-xs w-full sm:w-auto mt-1 sm:mt-0 pt-3 sm:pt-0 border-t border-border sm:border-0">
          <span className="inline-flex items-center gap-1.5 text-success whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-success shrink-0" />
            {counts.submitted} submitted
          </span>
          <span className="inline-flex items-center gap-1.5 text-inactive whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-inactive-border shrink-0" />
            {counts.pending} pending
          </span>
          <span className="inline-flex items-center gap-1.5 text-warning whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-warning shrink-0" />
            {counts.draft} draft
          </span>
          <span className="inline-flex items-center gap-1.5 text-danger whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-danger shrink-0" />
            {counts.overdue} overdue
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
      <div
        className="flex items-center gap-2 mb-5 sm:mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap"
        style={{ scrollbarWidth: "none" }}
      >
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
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-6 py-16 text-center text-sm text-muted-foreground">
          No classes match this filter.
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <ClassCard
              key={c.classId}
              cls={c}
              onView={() => setOpenClass(c)}
            />
          ))}
        </div>
      )}

      {openClass && (
        <ClassDrawer cls={openClass} onClose={() => setOpenClass(null)} />
      )}
    </PageContainer>
  );
}

/* =========================================================
   Sub-components
   ========================================================= */

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
      : "text-inactive";

  const pct = total ? Math.round((value / total) * 100) : 0;

  return (
    <div className="rounded-lg border border-border bg-surface p-4 sm:p-5">
      <div className={`flex items-center gap-1.5 text-xs ${cls}`}>
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div
        className={`mt-2 text-2xl sm:text-3xl font-semibold tabular-nums ${cls}`}
      >
        {value}
      </div>
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
      className={`h-8 px-3 rounded-full text-xs font-medium transition shrink-0 whitespace-nowrap ${
        active ? "bg-navy text-white" : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function ClassCard({
  cls,
  onView,
}: {
  cls: ClassSnapshot;
  onView: () => void;
}) {
  const markedTotal = cls.present + cls.absent + cls.late;
  const pct = cls.total ? Math.round((markedTotal / cls.total) * 100) : 0;

  const palette: Record<
    SubmissionStatus,
    { label: string; badge: string; ring: string }
  > = {
    Submitted: {
      label: "Submitted",
      badge: "bg-success-light text-success border border-success/20",
      ring: "border-l-success",
    },
    Pending: {
      label: "Pending",
      badge: "bg-inactive-bg text-inactive border border-inactive-border",
      ring: "border-l-inactive-border",
    },
    Draft: {
      label: "Draft",
      badge: "bg-warning-light text-warning border border-warning/20",
      ring: "border-l-warning",
    },
    Overdue: {
      label: "Overdue",
      badge: "bg-danger-light text-danger border border-danger/20",
      ring: "border-l-danger",
    },
  };

  const p = palette[cls.status];

  return (
    <div
      onClick={onView}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView();
        }
      }}
      role="button"
      tabIndex={0}
      className={`rounded-lg border border-border bg-surface border-l-4 ${p.ring} overflow-hidden hover:shadow-md hover:border-blue/40 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue flex flex-col`}
    >
      {/* Header */}
      <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-border">
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
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${p.badge}`}
          >
            {titleCase(cls.status)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-4 sm:px-5 flex-1">
        {cls.status === "Pending" || cls.status === "Overdue" ? (
          <div className="text-xs text-muted-foreground py-4 sm:py-6 text-center">
            {cls.status === "Pending"
              ? "Waiting for teacher submission."
              : "Roll call is overdue — please follow up."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 text-center">
              <MiniCount label="Present" value={cls.present} tone="success" />
              <MiniCount label="Absent" value={cls.absent} tone="danger" />
              <MiniCount label="Late" value={cls.late} tone="warning" />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                <span>
                  {markedTotal} of {cls.total} marked
                </span>
                <span className="tabular-nums">{pct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full ${pct === 100 ? "bg-success" : "bg-blue"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 sm:px-5 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {cls.submittedAt
              ? `Submitted ${cls.submittedAt}`
              : cls.status === "Draft"
              ? "Draft in progress"
              : "Not yet submitted"}
          </span>
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="text-xs text-blue hover:underline inline-flex items-center gap-0.5 font-medium shrink-0 pl-2"
        >
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
    <div className="rounded-md border border-border bg-background py-2 sm:py-2.5">
      <div className={`text-base sm:text-lg font-semibold tabular-nums ${cls}`}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5 truncate px-1">
        {label}
      </div>
    </div>
  );
}

/* =========================================================
   Class drawer
   ========================================================= */

function ClassDrawer({
  cls,
  onClose,
}: {
  cls: ClassSnapshot;
  onClose: () => void;
}) {
  const marked = cls.present + cls.absent + cls.late;
  const relatedCases = unexplainedCases.filter(
    (c) => c.className === cls.name && c.grade === cls.grade
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <aside className="relative w-full sm:max-w-md h-full bg-surface sm:border-l border-border shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 py-4 sm:px-5 border-b border-border shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <span className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg bg-blue-light text-blue border border-blue/20 grid place-items-center shrink-0">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div className="min-w-0 pt-0.5">
              <h2 className="text-sm font-semibold truncate">
                {cls.grade} · {cls.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                {cls.classId} · {cls.room}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 sm:space-y-6">
          {/* Status banner */}
          <section className="rounded-md border border-border bg-muted/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                Submission status
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  cls.status === "Submitted"
                    ? "bg-success-light text-success border border-success/20"
                    : cls.status === "Pending"
                    ? "bg-inactive-bg text-inactive border border-inactive-border"
                    : cls.status === "Draft"
                    ? "bg-warning-light text-warning border border-warning/20"
                    : "bg-danger-light text-danger border border-danger/20"
                }`}
              >
                {titleCase(cls.status)}
              </span>
            </div>

            {cls.status === "Submitted" && (
              <div className="mt-3 flex items-end gap-2">
                <div className="text-3xl font-semibold tabular-nums leading-none">
                  {marked}
                  <span className="text-base font-normal text-muted-foreground">
                    /{cls.total}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mb-0.5">
                  students marked
                </div>
              </div>
            )}

            {cls.status === "Pending" && (
              <p className="mt-3 text-xs text-muted-foreground">
                Waiting for the teacher to submit roll call.
              </p>
            )}

            {cls.status === "Overdue" && (
              <p className="mt-3 text-xs text-muted-foreground">
                Roll call is overdue — please follow up with {cls.teacher}.
              </p>
            )}

            {cls.status === "Draft" && (
              <p className="mt-3 text-xs text-muted-foreground">
                Draft in progress — not yet submitted.
              </p>
            )}
          </section>

          {/* Counts */}
          {cls.status !== "Pending" && cls.status !== "Overdue" && (
            <section className="grid grid-cols-3 gap-3">
              <CountBox
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Present"
                value={cls.present}
                tone="success"
              />
              <CountBox
                icon={<XCircle className="h-4 w-4" />}
                label="Absent"
                value={cls.absent}
                tone="danger"
              />
              <CountBox
                icon={<Clock className="h-4 w-4" />}
                label="Late"
                value={cls.late}
                tone="warning"
              />
            </section>
          )}

          {/* Class info */}
          <section>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Class details
            </h3>
            <dl className="rounded-md border border-border divide-y divide-border">
              <InfoRow
                icon={<User className="h-3.5 w-3.5" />}
                label="Teacher"
                value={cls.teacher}
              />
              <InfoRow
                icon={<Users className="h-3.5 w-3.5" />}
                label="Enrolled"
                value={`${cls.total} students`}
              />
              <InfoRow
                icon={<BookOpen className="h-3.5 w-3.5" />}
                label="Class ID"
                value={cls.classId}
                mono
              />
              {cls.submittedAt && (
                <InfoRow
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  label="Submitted"
                  value={cls.submittedAt}
                />
              )}
            </dl>
          </section>

          {/* Unexplained cases in this class */}
          {relatedCases.length > 0 && (
            <section>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                Unexplained absences
              </h3>
              <ul className="rounded-md border border-border divide-y divide-border">
                {relatedCases.map((c) => (
                  <li key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {c.studentName}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono truncate">
                        {c.studentId}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 self-start sm:self-auto ${
                        c.status === "Awaiting parent"
                          ? "bg-danger-light text-danger border border-danger/20"
                          : c.status === "Parent responded"
                          ? "bg-warning-light text-warning border border-warning/20"
                          : "bg-navy text-white border border-navy"
                      }`}
                    >
                      {titleCase(c.status)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 pb-6 sm:pb-4 shrink-0">
          <button
            onClick={onClose}
            className="w-full h-11 sm:h-10 rounded-md border border-border text-sm font-medium hover:bg-muted inline-flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to board
          </button>
        </div>
      </aside>
    </div>
  );
}

function CountBox({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
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
    <div className="rounded-md border border-border bg-background p-2.5 sm:p-3 text-center">
      <div className={`inline-flex items-center gap-1 text-[11px] ${cls}`}>
        {icon}
        {label}
      </div>
      <div className={`mt-1 text-base sm:text-lg font-semibold ${cls} tabular-nums`}>
        {value}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 px-3 py-2.5 sm:px-4">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <dt className="text-xs text-muted-foreground w-16 sm:w-20 shrink-0">{label}</dt>
      <dd
        className={`text-sm flex-1 truncate ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}