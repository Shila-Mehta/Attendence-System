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
import {
  principalStudents as initialStudents,
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
  // Added local state to support deletions
  const [students, setStudents] = useState<PrincipalStudent[]>(initialStudents);
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Active" | "Inactive"
  >("all");
  const [openStudent, setOpenStudent] = useState<PrincipalStudent | null>(null);

  const handleDelete = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.studentId !== studentId));
  };

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
  }, [query, gradeFilter, statusFilter, students]);

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

  // Dynamically group KPIs to satisfy the mobile grid requirements
  const kpiData = [
    {
      id: "total",
      icon: <Users className="h-4 w-4" />,
      label: "Total students",
      value: stats.total,
      tone: "default" as const,
    },
    {
      id: "active",
      icon: <GraduationCap className="h-4 w-4" />,
      label: "Active",
      value: stats.active,
      tone: "success" as const,
    },
    {
      id: "avg",
      icon: <TrendingUp className="h-4 w-4" />,
      label: "Average rate",
      value: `${stats.avg}%`,
      tone: "blue" as const,
    },
    {
      id: "flagged",
      icon: <XCircle className="h-4 w-4" />,
      label: "Below 85%",
      value: stats.flagged,
      tone: "danger" as const,
    },
  ];

  // Mobile layout logic: 2 columns if exactly 4, 1 column if 3.
  const kpiGridClass =
    kpiData.length === 4
      ? "grid-cols-2 lg:grid-cols-4"
      : kpiData.length === 3
      ? "grid-cols-1 md:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <PageContainer
      title="Student Drill-Down"
      description="View an individual student's attendance history and details."
    >
      {/* ================= KPI row ================= */}
      <div className={`grid ${kpiGridClass} gap-3 sm:gap-4 mb-6`}>
        {kpiData.map((kpi) => (
          <StatCard key={kpi.id} {...kpi} />
        ))}
      </div>

      {/* ================= Filters ================= */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-0 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by student, ID or guardian…"
            className="w-full h-9 rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          >
            <option value="all">All grades</option>
            {grades.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "Active" | "Inactive")
            }
            className="h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          >
            <option value="all">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* ================= Table ================= */}
      <div className="overflow-x-auto overflow-y-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm min-w-[950px]">
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
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  No students match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
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

                  {/* ---- Split counts ---- */}
                  <td className="px-3 py-3 whitespace-nowrap text-right tabular-nums font-medium text-success">
                    {s.presentCount}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-right tabular-nums font-medium text-danger">
                    {s.absentCount}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-right tabular-nums font-medium text-warning">
                    {s.lateCount}
                  </td>

                  {/* ---- Rate ---- */}
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
                        onClick={() => handleDelete(s.studentId)}
                        className="h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-danger hover:bg-danger-light inline-flex items-center justify-center transition-colors"
                        aria-label="Delete Student"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Showing {filtered.length} of {students.length} students
      </div>

      {openStudent && (
        <StudentDrawer
          student={openStudent}
          onClose={() => setOpenStudent(null)}
        />
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
    <div className="rounded-lg border border-border bg-surface p-3 sm:p-4">
      <div className={`flex items-center gap-1.5 text-xs ${cls}`}>
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div
        className={`mt-1 text-xl sm:text-2xl font-semibold ${cls} tabular-nums`}
      >
        {value}
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
        <div className="border-t border-border p-4 shrink-0 pb-6 sm:pb-4">
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
      <div className={`inline-flex items-center justify-center gap-1 text-[11px] ${cls} w-full`}>
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