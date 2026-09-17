"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
  Phone,
  Search,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  ToastContainer,
  type ToastMessage,
  type ToastTone,
} from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  principalStudents as seed,
  type PrincipalStudent,
} from "@/data/mock/principal";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function PrincipalStudentsPage() {
  /* ---------------- Data ---------------- */
  const [students, setStudents] = useState<PrincipalStudent[]>(seed);

  /* ---------------- Async state slots (Phase 10) ---------------- */
  const [loading] = useState(false);
  const [error] = useState(false);

  /* ---------------- Filters ---------------- */
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Active" | "Inactive"
  >("all");

  /* ---------------- Modal state ---------------- */
  const [openStudent, setOpenStudent] = useState<PrincipalStudent | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<PrincipalStudent | null>(null);

  /* ---------------- Toasts ---------------- */
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const pushToast = (tone: ToastTone, title: string, description?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, tone, title, description }]);
  };
  const dismissToast = (id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  /* ---------------- Derived ---------------- */
  const grades = useMemo(
    () => Array.from(new Set(students.map((s) => s.grade))).sort(),
    [students]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.guardianName.toLowerCase().includes(q);
      const matchesGrade = gradeFilter === "all" || s.grade === gradeFilter;
      const matchesStatus =
        statusFilter === "all" || s.status === statusFilter;
      return matchesQuery && matchesGrade && matchesStatus;
    });
  }, [students, query, gradeFilter, statusFilter]);

  const stats = useMemo(() => {
    const active = students.filter((s) => s.status === "Active");
    const avg = active.length
      ? Math.round(active.reduce((sum, s) => sum + s.rate, 0) / active.length)
      : 0;
    const flagged = active.filter((s) => s.rate < 85).length;
    return {
      total: students.length,
      active: active.length,
      avg,
      flagged,
    };
  }, [students]);

  const hasFilters =
    query.trim().length > 0 ||
    gradeFilter !== "all" ||
    statusFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setGradeFilter("all");
    setStatusFilter("all");
  };

  /* ---------------- Actions ---------------- */
  const confirmDelete = () => {
    if (!pendingDelete) return;
    const removed = pendingDelete;
    setStudents((prev) =>
      prev.filter((s) => s.studentId !== removed.studentId)
    );
    if (openStudent?.studentId === removed.studentId) setOpenStudent(null);
    setPendingDelete(null);
    pushToast(
      "success",
      "Student removed",
      `${removed.name} was removed from the drill-down list.`
    );
  };

  return (
    <PageContainer
      title="Student Drill-Down"
      description="View an individual student's attendance history and details."
    >
      {/* ================= LOADING (Phase 10) ================= */}
      {loading ? (
        <div className="rounded-lg border border-border bg-surface">
          <LoadingState
            title="Loading students…"
            description="Fetching the drill-down list from the server."
          />
        </div>
      ) : error ? (
        /* ================= ERROR (Phase 10) ================= */
        <div className="rounded-lg border border-border bg-surface">
          <ErrorState
            title="Couldn't load students"
            description="The server didn't respond. Check your connection and try again."
            onRetry={() => window.location.reload()}
          />
        </div>
      ) : (
        <>
          {/* ================= KPIs ================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <StatCard
              icon={<Users className="h-4 w-4" />}
              label="Total students"
              value={stats.total}
              tone="default"
            />
            <StatCard
              icon={<GraduationCap className="h-4 w-4" />}
              label="Active"
              value={stats.active}
              tone="success"
            />
            <StatCard
              icon={<TrendingUp className="h-4 w-4" />}
              label="Average rate"
              value={`${stats.avg}%`}
              tone="blue"
            />
            <StatCard
              icon={<XCircle className="h-4 w-4" />}
              label="Below 85%"
              value={stats.flagged}
              tone="danger"
            />
          </div>

          {/* ================= Filters ================= */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-4">
            <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by student, ID or guardian…"
                className="w-full h-10 sm:h-9 rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
              />
            </div>

            <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
              >
                <option value="all">All grades</option>
                {grades.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "Active" | "Inactive"
                  )
                }
                className="h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
              >
                <option value="all">All statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* ================= EMPTY ================= */}
          {filtered.length === 0 && (
            <div className="rounded-lg border border-border bg-surface">
              {students.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-5 w-5" />}
                  title="No students"
                  description="There are no students in the drill-down list yet."
                />
              ) : (
                <EmptyState
                  icon={<GraduationCap className="h-5 w-5" />}
                  title="No students match your filters"
                  description="Try adjusting your search or clearing the filters."
                  action={
                    hasFilters ? (
                      <button
                        onClick={clearFilters}
                        className="h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted transition"
                      >
                        Clear filters
                      </button>
                    ) : undefined
                  }
                />
              )}
            </div>
          )}

          {/* ================= MOBILE: cards ================= */}
          {filtered.length > 0 && (
            <div className="md:hidden space-y-3">
              {filtered.map((s) => (
                <article
                  key={s.studentId}
                  className="rounded-lg border border-border bg-surface overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 p-4">
                    <div className="h-11 w-11 rounded-full bg-navy text-white grid place-items-center text-sm font-semibold shrink-0">
                      {initials(s.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {s.name}
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            {s.studentId} · {s.grade} · {s.className}
                          </div>
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                    </div>
                  </div>

                  {/* Rate bar */}
                  <div className="px-4 pb-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span className="inline-flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Attendance rate
                      </span>
                      <span
                        className={`tabular-nums font-medium ${
                          s.rate >= 90
                            ? "text-success"
                            : s.rate >= 75
                            ? "text-warning"
                            : "text-danger"
                        }`}
                      >
                        {s.rate}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${
                          s.rate >= 90
                            ? "bg-success"
                            : s.rate >= 75
                            ? "bg-warning"
                            : "bg-danger"
                        }`}
                        style={{ width: `${s.rate}%` }}
                      />
                    </div>
                  </div>

                  {/* Counts */}
                  <div className="px-4 pb-3 grid grid-cols-3 gap-2 text-center">
                    <MiniCount label="Present" value={s.presentCount} tone="success" />
                    <MiniCount label="Absent" value={s.absentCount} tone="danger" />
                    <MiniCount label="Late" value={s.lateCount} tone="warning" />
                  </div>

                  {/* Guardian */}
                  <div className="px-4 pb-4 text-xs text-muted-foreground space-y-1">
                    <div className="truncate">{s.guardianName}</div>
                    <div className="flex items-center gap-2 tabular-nums">
                      <Phone className="h-3 w-3 shrink-0" />
                      {s.guardianPhone}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-[1fr_auto] border-t border-border">
                    <button
                      onClick={() => setOpenStudent(s)}
                      className="h-11 flex items-center justify-center gap-1.5 text-xs font-medium hover:bg-muted transition border-r border-border"
                    >
                      Details
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setPendingDelete(s)}
                      className="h-11 px-5 flex items-center justify-center gap-1.5 text-xs font-medium text-danger hover:bg-danger-light transition"
                      aria-label={`Delete ${s.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* ================= DESKTOP: table ================= */}
          {filtered.length > 0 && (
            <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-surface">
              <table className="w-full text-sm min-w-[980px]">
                <thead>
                  <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Class</th>
                    <th className="px-4 py-3 font-medium">Guardian</th>
                    <th className="px-3 py-3 font-medium text-right">Present</th>
                    <th className="px-3 py-3 font-medium text-right">Absent</th>
                    <th className="px-3 py-3 font-medium text-right">Late</th>
                    <th className="px-4 py-3 font-medium">Rate</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr
                      key={s.studentId}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                        {s.studentId}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-navy text-white grid place-items-center text-xs font-semibold shrink-0">
                            {initials(s.name)}
                          </div>
                          <span className="font-medium">{s.name}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {s.grade} · {s.className}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="leading-tight">
                          <div>{s.guardianName}</div>
                          <div className="text-xs text-muted-foreground tabular-nums">
                            {s.guardianPhone}
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap text-right tabular-nums font-medium text-success">
                        {s.presentCount}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right tabular-nums font-medium text-danger">
                        {s.absentCount}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right tabular-nums font-medium text-warning">
                        {s.lateCount}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full ${
                                s.rate >= 90
                                  ? "bg-success"
                                  : s.rate >= 75
                                  ? "bg-warning"
                                  : "bg-danger"
                              }`}
                              style={{ width: `${s.rate}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground w-9 text-right">
                            {s.rate}%
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={s.status} />
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setOpenStudent(s)}
                            className="h-8 px-3 rounded-md border border-border text-xs hover:bg-muted inline-flex items-center gap-1"
                          >
                            Details
                            <ChevronRight className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setPendingDelete(s)}
                            className="h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-danger hover:bg-danger-light inline-flex items-center justify-center transition-colors"
                            aria-label={`Delete ${s.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-3 text-xs text-muted-foreground">
              Showing {filtered.length} of {students.length} students
            </div>
          )}

          {/* ================= DRAWER ================= */}
          {openStudent && (
            <StudentDrawer
              student={openStudent}
              onClose={() => setOpenStudent(null)}
            />
          )}

          {/* ================= CONFIRM DELETE ================= */}
          <ConfirmDialog
            open={pendingDelete !== null}
            title="Remove student?"
            message={
              <>
                <span className="font-medium text-foreground">
                  {pendingDelete?.name}
                </span>{" "}
                will be removed from the drill-down list. This action cannot be
                undone.
              </>
            }
            confirmLabel="Remove student"
            cancelLabel="Keep"
            tone="danger"
            icon={<Trash2 className="h-5 w-5" />}
            onConfirm={confirmDelete}
            onCancel={() => setPendingDelete(null)}
          />

          {/* ================= TOASTS ================= */}
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </>
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
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone: "default" | "success" | "blue" | "danger";
}) {
  const cls =
    tone === "success"
      ? "text-success"
      : tone === "blue"
      ? "text-blue"
      : tone === "danger"
      ? "text-danger"
      : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-surface p-3 sm:p-4 min-w-0">
      <div className={`flex items-center gap-1.5 text-xs ${cls}`}>
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div
        className={`mt-1 text-2xl sm:text-3xl font-semibold ${cls} tabular-nums`}
      >
        {value}
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
      <div className={`text-lg font-semibold tabular-nums ${cls}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
        {label}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "Active" | "Inactive" }) {
  const cls =
    status === "Active"
      ? "bg-success-light text-success border border-success/20"
      : "bg-inactive-bg text-inactive border border-inactive-border";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   Student drawer
   ========================================================= */

function StudentDrawer({
  student,
  onClose,
}: {
  student: PrincipalStudent;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <aside className="relative w-full sm:max-w-md h-full bg-surface sm:border-l border-border shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 sm:px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-11 w-11 rounded-full bg-navy text-white grid place-items-center text-sm font-semibold shrink-0">
              {initials(student.name)}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate">
                {student.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                {student.studentId} · {student.grade} · {student.className}
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* Rate banner */}
          <section className="rounded-md border border-border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                Attendance rate
              </div>
              <StatusBadge status={student.status} />
            </div>
            <div className="mt-3 flex items-end gap-2">
              <div
                className={`text-3xl font-semibold tabular-nums ${
                  student.rate >= 90
                    ? "text-success"
                    : student.rate >= 75
                    ? "text-warning"
                    : "text-danger"
                }`}
              >
                {student.rate}%
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                overall
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full ${
                  student.rate >= 90
                    ? "bg-success"
                    : student.rate >= 75
                    ? "bg-warning"
                    : "bg-danger"
                }`}
                style={{ width: `${student.rate}%` }}
              />
            </div>
          </section>

          {/* Counts */}
          <section className="grid grid-cols-3 gap-2 sm:gap-3">
            <CountBox
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Present"
              value={student.presentCount}
              tone="success"
            />
            <CountBox
              icon={<XCircle className="h-4 w-4" />}
              label="Absent"
              value={student.absentCount}
              tone="danger"
            />
            <CountBox
              icon={<Clock className="h-4 w-4" />}
              label="Late"
              value={student.lateCount}
              tone="warning"
            />
          </section>

          {/* Student details */}
          <section>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Student details
            </h3>
            <dl className="rounded-md border border-border divide-y divide-border">
              <InfoRow
                icon={<GraduationCap className="h-3.5 w-3.5" />}
                label="Class"
                value={`${student.grade} · ${student.className}`}
              />
              <InfoRow
                icon={<User className="h-3.5 w-3.5" />}
                label="Guardian"
                value={student.guardianName}
              />
              <InfoRow
                icon={<Phone className="h-3.5 w-3.5" />}
                label="Phone"
                value={student.guardianPhone}
              />
              <InfoRow
                icon={<BookOpen className="h-3.5 w-3.5" />}
                label="Student ID"
                value={student.studentId}
                mono
              />
            </dl>
          </section>

          {/* Recent attendance */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                Recent attendance
              </h3>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                Last {student.recent.length} school days
              </span>
            </div>

            <ul className="rounded-md border border-border divide-y divide-border">
              {student.recent.map((r) => (
                <li
                  key={r.date}
                  className="
                    grid items-center px-3 sm:px-4 py-3
                    grid-cols-[1fr_auto] gap-3
                    sm:grid-cols-[110px_110px_minmax(0,1fr)] sm:gap-5
                  "
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums min-w-0">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{fmtDate(r.date)}</span>
                  </div>

                  <div className="flex justify-end sm:justify-start">
                    <RecentStatusPill status={r.status} />
                  </div>

                  <div className="col-span-2 sm:col-span-1 text-xs text-muted-foreground truncate">
                    {r.note ?? (r.status === "Present" ? "On time" : "—")}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 shrink-0">
          <button
            onClick={onClose}
            className="w-full h-10 rounded-md border border-border text-sm font-medium hover:bg-muted inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to list
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
    <div className="rounded-md border border-border bg-background p-3 text-center">
      <div
        className={`inline-flex items-center justify-center gap-1 text-[11px] ${cls} w-full`}
      >
        {icon}
        {label}
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
    <div className="flex items-center gap-4 px-3 sm:px-4 py-2.5">
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

function RecentStatusPill({
  status,
}: {
  status: "Present" | "Absent" | "Late";
}) {
  const cls =
    status === "Present"
      ? "bg-success-light text-success border border-success/20"
      : status === "Absent"
      ? "bg-danger-light text-danger border border-danger/20"
      : "bg-warning-light text-warning border border-warning/20";
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${cls}`}
    >
      {status}
    </span>
  );
}