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
  GraduationCap,
  TrendingUp,
  Trash2,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageContainer } from "@/components/layout/PageContainer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  ToastContainer,
  type ToastMessage,
  type ToastTone,
} from "@/components/ui/Toast";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  attendanceTrend,
  classStatuses,
  principalKpis,
  principalStudents,
  unexplainedSummary as seed,
  type ClassStatus,
  type TrendPoint,
  type UnexplainedSummary,
} from "@/data/mock/principal";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function fmtDate(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function titleCase(s: string) {
  return s
    .split(" ")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export default function PrincipalDashboardPage() {
  const [range, setRange] = useState<"7d" | "30d">("7d");
  const [openClass, setOpenClass] = useState<ClassStatus | null>(null);

  /* ---------------- Unexplained (local) ---------------- */
  const [unexplained, setUnexplained] =
    useState<UnexplainedSummary[]>(seed);
  const [pendingDelete, setPendingDelete] =
    useState<UnexplainedSummary | null>(null);

  /* ---------------- Async state slots (Phase 10) ---------------- */
  const [loading] = useState(false);
  const [error] = useState(false);

  /* ---------------- Toasts ---------------- */
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const pushToast = (tone: ToastTone, title: string, description?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, tone, title, description }]);
  };
  const dismissToast = (id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  /* ---------------- Derived ---------------- */
  const submissionPct = Math.round(
    (principalKpis.classesSubmitted / principalKpis.classesTotal) * 100
  );

  const kpiData = useMemo(
    () => [
      {
        id: "total",
        icon: <Users className="h-4 w-4" />,
        label: "Total students",
        value: principalKpis.totalStudents,
        tone: "default" as const,
      },
      {
        id: "present",
        icon: <CheckCircle2 className="h-4 w-4" />,
        label: "Present today",
        value: principalKpis.presentToday,
        sub: `${principalKpis.attendanceRate}% attendance rate`,
        tone: "success" as const,
      },
      {
        id: "absent",
        icon: <XCircle className="h-4 w-4" />,
        label: "Absent today",
        value: principalKpis.absentToday,
        sub: `${unexplained.length} unexplained`,
        tone: "danger" as const,
      },
      {
        id: "late",
        icon: <Clock className="h-4 w-4" />,
        label: "Late today",
        value: principalKpis.lateToday,
        tone: "warning" as const,
      },
    ],
    [unexplained.length]
  );

  /* ---------------- Actions ---------------- */
  const confirmDelete = () => {
    if (!pendingDelete) return;
    const removed = pendingDelete;
    setUnexplained((prev) => prev.filter((item) => item.id !== removed.id));
    setPendingDelete(null);
    pushToast(
      "success",
      "Removed from view",
      `${removed.studentName}'s unexplained absence was cleared from the dashboard.`
    );
  };

  return (
    <PageContainer
      title="Principal Dashboard"
      description="Attendance KPIs, class status and unexplained absences at a glance."
    >
      {/* ================= LOADING (Phase 10) ================= */}
      {loading ? (
        <div className="rounded-lg border border-border bg-surface">
          <LoadingState
            title="Loading dashboard…"
            description="Fetching KPIs, class status and unexplained absences."
          />
        </div>
      ) : error ? (
        /* ================= ERROR (Phase 10) ================= */
        <div className="rounded-lg border border-border bg-surface">
          <ErrorState
            title="Couldn't load the dashboard"
            description="The server didn't respond. Check your connection and try again."
            onRetry={() => window.location.reload()}
          />
        </div>
      ) : (
        <>
          {/* ============ KPI ROW ============ */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {kpiData.map((kpi) => (
              <KpiCard key={kpi.id} {...kpi} />
            ))}
          </section>

          {/* ============ TREND + SUBMISSIONS ============ */}
          <section className="grid gap-4 lg:grid-cols-3 mb-6">
            {/* Trend chart */}
            <div className="lg:col-span-2 rounded-lg border border-border bg-surface">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-border">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-md bg-blue-light text-blue border border-blue/20 grid place-items-center shrink-0">
                      <TrendingUp className="h-4 w-4" />
                    </span>
                    <h2 className="text-sm font-semibold">Attendance trend</h2>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Present rate over recent school days
                  </p>
                </div>
                <div className="flex items-center gap-1 self-start sm:self-auto">
                  <RangeTab
                    active={range === "7d"}
                    onClick={() => setRange("7d")}
                  >
                    7 days
                  </RangeTab>
                  <RangeTab
                    active={range === "30d"}
                    onClick={() => setRange("30d")}
                  >
                    30 days
                  </RangeTab>
                </div>
              </div>

              <div className="p-3 sm:p-5">
                <div className="h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={attendanceTrend}
                      margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                      />
                      <YAxis
                        domain={[80, 100]}
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                        tickFormatter={(v: number) => `${v}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          fontSize: 12,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                        }}
                        formatter={((value: number) => [
                          `${value}%`,
                          "Rate",
                        ]) as never}
                        labelFormatter={((label: string, payload: unknown) => {
                          const first = Array.isArray(payload)
                            ? payload[0]
                            : undefined;
                          const p = (
                            first as { payload?: TrendPoint } | undefined
                          )?.payload;
                          return p
                            ? `${label} · ${fmtDate(p.date)}`
                            : label;
                        }) as never}
                      />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#2563eb" }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Submission status */}
            <div className="rounded-lg border border-border bg-surface">
              <div className="px-4 sm:px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-md bg-blue-light text-blue border border-blue/20 grid place-items-center shrink-0">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <h2 className="text-sm font-semibold">
                    Today&apos;s submissions
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Roll call completion by class
                </p>
              </div>

              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <ProgressRing value={submissionPct} />
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <div className="text-2xl font-semibold tabular-nums">
                      {principalKpis.classesSubmitted}
                      <span className="text-base text-muted-foreground">
                        /{principalKpis.classesTotal}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      classes submitted
                    </div>
                  </div>
                </div>

                <ul className="mt-5 space-y-2">
                  <StatusLine
                    label="Submitted"
                    value={
                      classStatuses.filter((c) => c.status === "Submitted")
                        .length
                    }
                    tone="success"
                  />
                  <StatusLine
                    label="Pending"
                    value={
                      classStatuses.filter((c) => c.status === "Pending").length
                    }
                    tone="muted"
                  />
                  <StatusLine
                    label="Overdue"
                    value={
                      classStatuses.filter((c) => c.status === "Overdue").length
                    }
                    tone="danger"
                  />
                </ul>
              </div>
            </div>
          </section>

          {/* ============ CLASS STATUS TABLE ============ */}
          <section className="rounded-lg border border-border bg-surface mb-6">
            <div className="px-4 sm:px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold">Class status</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Live submission and attendance rate per class
              </p>
            </div>

            <div className="overflow-x-auto overflow-y-hidden">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 sm:px-5 py-3 font-medium">Class</th>
                    <th className="px-4 sm:px-5 py-3 font-medium">Teacher</th>
                    <th className="px-4 sm:px-5 py-3 font-medium">Status</th>
                    <th className="px-4 sm:px-5 py-3 font-medium">Attendance</th>
                    <th className="px-4 sm:px-5 py-3 font-medium">Rate</th>
                    <th className="px-4 sm:px-5 py-3 font-medium text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {classStatuses.map((c) => (
                    <tr
                      key={c.classId}
                      className="border-t border-border hover:bg-muted/30 transition"
                    >
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                        <div className="leading-tight">
                          <div className="font-medium">
                            {c.grade} · {c.name}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {c.classId}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-muted-foreground">
                        {c.teacher}
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                        <SubmissionBadge status={c.status} />
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                        {c.status === "Submitted" ? (
                          <div className="flex items-center gap-3 text-xs tabular-nums">
                            <span className="inline-flex items-center gap-1 text-success">
                              <CheckCircle2 className="h-3 w-3" />
                              {c.present}
                            </span>
                            <span className="inline-flex items-center gap-1 text-danger">
                              <XCircle className="h-3 w-3" />
                              {c.absent}
                            </span>
                            <span className="inline-flex items-center gap-1 text-warning">
                              <Clock className="h-3 w-3" />
                              {c.late}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                        {c.status === "Submitted" ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 sm:w-24 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full ${
                                  c.rate >= 90
                                    ? "bg-success"
                                    : c.rate >= 75
                                    ? "bg-warning"
                                    : "bg-danger"
                                }`}
                                style={{ width: `${c.rate}%` }}
                              />
                            </div>
                            <span className="text-xs tabular-nums text-muted-foreground w-9 text-right">
                              {c.rate}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => setOpenClass(c)}
                          className="text-xs text-blue hover:underline inline-flex items-center gap-0.5"
                        >
                          View
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ============ UNEXPLAINED ABSENCES ============ */}
          <section className="rounded-lg border border-border bg-surface">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-5 py-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-md bg-danger-light text-danger border border-danger/20 grid place-items-center shrink-0">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <h2 className="text-sm font-semibold">
                    Unexplained absences
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently awaiting a parent response
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground self-start sm:self-auto">
                <Activity className="h-3.5 w-3.5" />
                {unexplained.length} active
              </div>
            </div>

            {unexplained.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                No unexplained absences.
              </div>
            ) : (
              <>
                {/* Column header — md+ only */}
                <div className="hidden md:grid items-center gap-3 px-4 sm:px-5 py-2.5 border-b border-border bg-muted/20 text-[11px] uppercase tracking-wider text-muted-foreground md:grid-cols-[minmax(0,1fr)_200px_150px_40px]">
                  <div>Student</div>
                  <div>Guardian</div>
                  <div className="text-right">Status</div>
                  <div className="text-center">Action</div>
                </div>

                <ul className="divide-y divide-border">
                  {unexplained.map((u) => (
                    <li
                      key={u.id}
                      className="grid items-center gap-4 px-4 sm:px-5 py-4 grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_200px_150px_40px]"
                    >
                      {/* Col 1 — Student */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-navy text-white grid place-items-center text-xs font-semibold shrink-0">
                          {initials(u.studentName)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {u.studentName}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {u.grade} · {u.className} · {fmtDate(u.date)}
                          </div>
                        </div>
                      </div>

                      {/* Col 2 — Guardian */}
                      <div className="hidden md:block min-w-0 text-xs text-muted-foreground">
                        <div className="truncate">{u.guardianName}</div>
                        <div className="tabular-nums truncate">
                          {u.guardianPhone}
                        </div>
                      </div>

                      {/* Col 3 — Status + Action */}
                      <div className="flex justify-between items-center sm:justify-end gap-3 md:contents">
                        <div className="flex justify-start sm:justify-end">
                          <UnexplainedBadge status={u.status} />
                        </div>
                        <button
                          onClick={() => setPendingDelete(u)}
                          className="p-2 rounded-md text-muted-foreground hover:bg-danger-light hover:text-danger transition-colors shrink-0"
                          title="Remove from dashboard"
                          aria-label={`Remove ${u.studentName} from dashboard`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* ============ CLASS DRAWER ============ */}
          {openClass && (
            <ClassDrawer
              cls={openClass}
              onClose={() => setOpenClass(null)}
            />
          )}

          {/* ============ CONFIRM DELETE ============ */}
          <ConfirmDialog
            open={pendingDelete !== null}
            title="Remove from dashboard?"
            message={
              <>
                <span className="font-medium text-foreground">
                  {pendingDelete?.studentName}
                </span>{" "}
                · {pendingDelete?.grade} · {pendingDelete?.className} will be
                cleared from the principal dashboard. The original record in
                the Office queue is not affected.
              </>
            }
            confirmLabel="Remove"
            cancelLabel="Keep"
            tone="danger"
            icon={<Trash2 className="h-5 w-5" />}
            onConfirm={confirmDelete}
            onCancel={() => setPendingDelete(null)}
          />

          {/* ============ TOASTS ============ */}
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </>
      )}
    </PageContainer>
  );
}

/* =========================================================
   Class drawer
   ========================================================= */

function ClassDrawer({
  cls,
  onClose,
}: {
  cls: ClassStatus;
  onClose: () => void;
}) {
  const students = useMemo(
    () =>
      principalStudents.filter(
        (s) => s.grade === cls.grade && s.className === cls.name
      ),
    [cls]
  );

  const totalMarked = cls.present + cls.absent + cls.late;
  const rate = cls.rate;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <aside className="relative w-full sm:max-w-md h-full bg-surface sm:border-l border-border shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 sm:px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <span className="h-11 w-11 rounded-lg bg-blue-light text-blue border border-blue/20 grid place-items-center shrink-0">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate">
                {cls.grade} · {cls.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                {cls.classId} · {cls.teacher}
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          <section className="rounded-md border border-border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                Submission status
              </div>
              <SubmissionBadge status={cls.status} />
            </div>

            {cls.status === "Submitted" ? (
              <>
                <div className="mt-3 flex items-end gap-2">
                  <div
                    className={`text-3xl font-semibold tabular-nums ${
                      rate >= 90
                        ? "text-success"
                        : rate >= 75
                        ? "text-warning"
                        : "text-danger"
                    }`}
                  >
                    {rate}%
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    attendance rate
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${
                      rate >= 90
                        ? "bg-success"
                        : rate >= 75
                        ? "bg-warning"
                        : "bg-danger"
                    }`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                {cls.status === "Pending"
                  ? "Waiting for the teacher to submit roll call."
                  : "Roll call is overdue — please follow up with the teacher."}
              </p>
            )}
          </section>

          <section className="grid grid-cols-3 gap-2 sm:gap-3">
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

          <section>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Class details
            </div>
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
              {cls.status === "Submitted" && (
                <InfoRow
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  label="Marked"
                  value={`${totalMarked} of ${cls.total}`}
                />
              )}
            </dl>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Students in this class
              </div>
              <div className="text-[11px] text-muted-foreground tabular-nums">
                {students.length} shown
              </div>
            </div>

            {students.length === 0 ? (
              <div className="rounded-md border border-border bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
                No student records in the drill-down dataset for this class
                yet.
              </div>
            ) : (
              <ul className="rounded-md border border-border divide-y divide-border">
                {students.map((s) => (
                  <li
                    key={s.studentId}
                    className="flex items-center gap-3 px-3 sm:px-4 py-2.5"
                  >
                    <div className="h-7 w-7 rounded-full bg-navy text-white grid place-items-center text-[11px] font-semibold shrink-0">
                      {initials(s.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono truncate">
                        {s.studentId}
                      </div>
                    </div>
                    <RatePill rate={s.rate} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 shrink-0">
          <button
            onClick={onClose}
            className="w-full h-10 rounded-md border border-border text-sm font-medium hover:bg-muted inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>
        </div>
      </aside>
    </div>
  );
}

/* =========================================================
   Helpers
   ========================================================= */

function RatePill({ rate }: { rate: number }) {
  const cls =
    rate >= 90
      ? "bg-success-light text-success border border-success/20"
      : rate >= 75
      ? "bg-warning-light text-warning border border-warning/20"
      : "bg-danger-light text-danger border border-danger/20";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium tabular-nums shrink-0 ${cls}`}
    >
      {rate}%
    </span>
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
    <div className="rounded-md border border-border bg-background p-3 text-center">
      <div
        className={`inline-flex items-center justify-center gap-1 text-[11px] ${cls} w-full`}
      >
        {icon} {label}
      </div>
      <div
        className={`mt-1 text-lg sm:text-xl font-semibold ${cls} tabular-nums`}
      >
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
    <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <dt className="text-xs text-muted-foreground w-20 shrink-0">{label}</dt>
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

function KpiCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  tone: "default" | "success" | "danger" | "warning";
}) {
  const cls =
    tone === "success"
      ? "text-success"
      : tone === "danger"
      ? "text-danger"
      : tone === "warning"
      ? "text-warning"
      : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-surface p-3 sm:p-4 min-w-0">
      <div className={`flex items-center gap-1.5 text-xs ${cls}`}>
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div
        className={`mt-1 text-2xl sm:text-3xl font-semibold tabular-nums ${cls}`}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-1 text-[11px] text-muted-foreground truncate">
          {sub}
        </div>
      )}
    </div>
  );
}

function RangeTab({
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
      className={`h-7 px-2.5 rounded-md text-xs font-medium transition ${
        active ? "bg-navy text-white" : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function ProgressRing({ value }: { value: number }) {
  const size = 68,
    stroke = 7,
    r = (size - stroke) / 2,
    c = 2 * Math.PI * r,
    dash = (value / 100) * c;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#2563eb"
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${c - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14"
        fontWeight="600"
        fill="#0f172a"
      >
        {value}%
      </text>
    </svg>
  );
}

function StatusLine({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "muted" | "danger";
}) {
  const dot =
    tone === "success"
      ? "bg-success"
      : tone === "danger"
      ? "bg-danger"
      : "bg-inactive-border";
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </li>
  );
}

function SubmissionBadge({ status }: { status: ClassStatus["status"] }) {
  const cls =
    status === "Submitted"
      ? "bg-success-light text-success border border-success/20"
      : status === "Pending"
      ? "bg-inactive-bg text-inactive border border-inactive-border"
      : "bg-danger-light text-danger border border-danger/20";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}
    >
      {titleCase(status)}
    </span>
  );
}

function UnexplainedBadge({
  status,
}: {
  status: "Awaiting parent" | "Parent responded" | "Escalated";
}) {
  const cls =
    status === "Awaiting parent"
      ? "bg-danger-light text-danger border border-danger/20"
      : status === "Parent responded"
      ? "bg-warning-light text-warning border border-warning/20"
      : "bg-navy text-white border border-navy";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}
    >
      {titleCase(status)}
    </span>
  );
}