"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  UserX,
  UserCheck,
  Trash2,
  X,
  Phone,
  GraduationCap,
  Users,
  UserPlus,
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
  students as seed,
  type Student,
  type StudentStatus,
} from "@/data/mock/student";

const GRADES = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
];

const CLASSES = ["Class A", "Class B", "Class C"];

export default function StudentsPage() {
  /* ---------------- Data ---------------- */
  const [rows, setRows] = useState<Student[]>(seed);

  /* ---------------- Async state (Phase 10 slots) ---------------- */
  // When you move to a real backend, set `loading` to true in a useEffect,
  // fetch data, then setLoading(false) / setError(true|false) / setRows(data).
  const [loading] = useState(false);
  const [error] = useState(false);

  /* ---------------- Filters ---------------- */
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StudentStatus>(
    "all"
  );

  /* ---------------- Modal state ---------------- */
  const [editing, setEditing] = useState<Student | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Student | null>(null);

  /* ---------------- Toasts ---------------- */
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const pushToast = (tone: ToastTone, title: string, description?: string) => {
    // eslint-disable-next-line react-hooks/purity
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, tone, title, description }]);
  };
  const dismissToast = (id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  /* ---------------- Filtered ---------------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.guardianName.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || r.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [rows, query, statusFilter]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((r) => r.status === "Active").length,
      inactive: rows.filter((r) => r.status === "Inactive").length,
      guardians: new Set(rows.map((r) => r.guardianPhone)).size,
    }),
    [rows]
  );

  const hasFilters = query.trim().length > 0 || statusFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
  };

  /* ---------------- Actions ---------------- */
  const toggleStatus = (student: Student) => {
    const next = student.status === "Active" ? "Inactive" : "Active";
    setRows((prev) =>
      prev.map((r) => (r.id === student.id ? { ...r, status: next } : r))
    );
    pushToast(
      next === "Active" ? "success" : "info",
      next === "Active" ? "Student activated" : "Student deactivated",
      `${student.name} is now ${next.toLowerCase()}.`
    );
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const removed = pendingDelete;
    setRows((prev) => prev.filter((r) => r.id !== removed.id));
    if (editing?.id === removed.id) setEditing(null);
    setPendingDelete(null);
    pushToast(
      "success",
      "Student removed",
      `${removed.name} has been deleted from the roster.`
    );
  };

  const handleSave = (student: Student, isEdit: boolean) => {
    setRows((prev) => {
      const exists = prev.some((r) => r.id === student.id);
      return exists
        ? prev.map((r) => (r.id === student.id ? student : r))
        : [student, ...prev];
    });
    setEditing(null);
    setCreating(false);
    pushToast(
      "success",
      isEdit ? "Student updated" : "Student added",
      isEdit
        ? `${student.name}'s details were saved.`
        : `${student.name} has been added to the roster.`
    );
  };

  return (
    <PageContainer
      title="Student Management"
      description="Manage and maintain student records."
      actions={
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center justify-center gap-2 h-10 sm:h-9 px-3 sm:px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </button>
      }
    >
      {/* ================= LOADING (Phase 10) ================= */}
      {loading ? (
        <div className="rounded-lg border border-border bg-surface">
          <LoadingState
            title="Loading students…"
            description="Fetching the roster from the server."
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
            <StatCard label="Total Students" value={stats.total} />
            <StatCard label="Active" value={stats.active} tone="success" />
            <StatCard
              label="Inactive"
              value={stats.inactive}
              tone="muted"
            />
            <StatCard label="Guardians" value={stats.guardians} />
          </div>

          {/* ================= FILTERS ================= */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 mb-4">
            <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, ID or guardian…"
                className="w-full h-10 sm:h-9 rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | StudentStatus)
              }
              className="w-full sm:w-auto h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
            >
              <option value="all">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* ================= EMPTY ================= */}
          {filtered.length === 0 && (
            <div className="rounded-lg border border-border bg-surface">
              {rows.length === 0 ? (
                <EmptyState
                  icon={<UserPlus className="h-5 w-5" />}
                  title="No students yet"
                  description="Add your first student to get started."
                  action={
                    <button
                      onClick={() => setCreating(true)}
                      className="h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Student
                    </button>
                  }
                />
              ) : (
                <EmptyState
                  icon={<Users className="h-5 w-5" />}
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
              {filtered.map((r) => (
                <article
                  key={r.id}
                  className="rounded-lg border border-border bg-surface overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 p-4">
                    <div className="h-11 w-11 rounded-full bg-navy text-white grid place-items-center text-sm font-semibold shrink-0">
                      {initials(r.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {r.name}
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            {r.id}
                          </div>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {r.grade} · {r.class}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Guardian */}
                  <div className="px-4 pb-4 space-y-1.5 text-xs">
                    <div className="text-muted-foreground">
                      Guardian: {r.guardianName}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span className="tabular-nums">{r.guardianPhone}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 border-t border-border">
                    <button
                      onClick={() => setEditing(r)}
                      className="h-11 flex items-center justify-center gap-1.5 text-xs font-medium hover:bg-muted transition border-r border-border"
                      aria-label={`Edit ${r.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => toggleStatus(r)}
                      className={`h-11 flex items-center justify-center gap-1.5 text-xs font-medium hover:bg-muted transition border-r border-border ${
                        r.status === "Active" ? "text-danger" : "text-success"
                      }`}
                      aria-label={
                        r.status === "Active"
                          ? `Deactivate ${r.name}`
                          : `Activate ${r.name}`
                      }
                    >
                      {r.status === "Active" ? (
                        <>
                          <UserX className="h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4" />
                          Activate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setPendingDelete(r)}
                      className="h-11 flex items-center justify-center gap-1.5 text-xs font-medium text-danger hover:bg-danger-light transition"
                      aria-label={`Delete ${r.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* ================= DESKTOP: table ================= */}
          {filtered.length > 0 && (
            <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-surface">
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Grade</th>
                    <th className="px-4 py-3 font-medium">Class</th>
                    <th className="px-4 py-3 font-medium">Guardian</th>
                    <th className="px-4 py-3 font-medium">Enrolled</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                        {r.id}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-[160px]">
                          <div className="h-8 w-8 rounded-full bg-navy text-white grid place-items-center text-xs font-semibold shrink-0">
                            {initials(r.name)}
                          </div>
                          <span className="font-medium truncate max-w-[180px]">
                            {r.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {r.grade}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {r.class}
                      </td>

                      <td className="px-4 py-3">
                        <div className="leading-tight min-w-[160px]">
                          <div>{r.guardianName}</div>
                          <div className="text-xs text-muted-foreground tabular-nums">
                            {r.guardianPhone}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground tabular-nums">
                        {r.enrolledAt}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={r.status} />
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditing(r)}
                            className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition"
                            title="Edit student"
                            aria-label={`Edit ${r.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => toggleStatus(r)}
                            className={`p-2 rounded-md hover:bg-muted transition ${
                              r.status === "Active"
                                ? "text-danger"
                                : "text-success"
                            }`}
                            title={
                              r.status === "Active" ? "Deactivate" : "Activate"
                            }
                            aria-label={
                              r.status === "Active"
                                ? `Deactivate ${r.name}`
                                : `Activate ${r.name}`
                            }
                          >
                            {r.status === "Active" ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </button>

                          <button
                            onClick={() => setPendingDelete(r)}
                            className="p-2 rounded-md hover:bg-danger-light text-danger transition"
                            title="Delete student"
                            aria-label={`Delete ${r.name}`}
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
              Showing {filtered.length} of {rows.length} students
            </div>
          )}

          {/* ================= MODAL ================= */}
          {(creating || editing) && (
            <StudentModal
              student={editing ?? undefined}
              onClose={() => {
                setCreating(false);
                setEditing(null);
              }}
              onSave={(s) => handleSave(s, Boolean(editing))}
            />
          )}

          {/* ================= CONFIRM DELETE ================= */}
          <ConfirmDialog
            open={pendingDelete !== null}
            title="Delete student?"
            message={
              <>
                <span className="font-medium text-foreground">
                  {pendingDelete?.name}
                </span>{" "}
                will be permanently removed from the roster. This action cannot
                be undone.
              </>
            }
            confirmLabel="Delete student"
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
   Helpers
   ========================================================= */

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/* =========================================================
   Stat card
   ========================================================= */

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "danger" | "muted";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "danger"
      ? "text-danger"
      : tone === "muted"
      ? "text-inactive"
      : "text-foreground";

  return (
    <div className="rounded-lg border border-border bg-surface p-3 sm:p-4 min-w-0">
      <div className="text-xs text-muted-foreground truncate">{label}</div>
      <div
        className={`mt-1 text-2xl sm:text-3xl font-semibold tabular-nums ${toneClass}`}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   Status badge
   ========================================================= */

function StatusBadge({ status }: { status: StudentStatus }) {
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
   Student modal
   ========================================================= */

function StudentModal({
  student,
  onClose,
  onSave,
}: {
  student?: Student;
  onClose: () => void;
  onSave: (s: Student) => void;
}) {
  const isEdit = Boolean(student);

  const [form, setForm] = useState<Student>(
    student ?? {
      // eslint-disable-next-line react-hooks/purity
      id: `ST${String(Math.floor(Math.random() * 900) + 100)}`,
      name: "",
      grade: "Grade 1",
      class: "Class A",
      guardianName: "",
      guardianPhone: "",
      status: "Active",
      enrolledAt: new Date().toISOString().slice(0, 10),
    }
  );

  const set = <K extends keyof Student>(key: K, value: Student[K]) =>
    setForm((f: Student): Student => ({ ...f, [key]: value }));

  const canSave = form.name.trim() && form.guardianName.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-lg bg-surface border border-border shadow-xl flex flex-col overflow-hidden">
        <div className="sm:hidden flex justify-center pt-2">
          <span className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="flex items-center justify-between px-4 sm:px-5 h-14 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold">
            {isEdit ? "Edit Student" : "Add Student"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
          <Field label="Student ID">
            <input
              value={form.id}
              onChange={(e) => set("id", e.target.value)}
              disabled={isEdit}
              className={inputCls}
            />
          </Field>

          <Field label="Full name">
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Ayesha Khan"
              className={inputCls}
            />
          </Field>

          <Field label="Grade">
            <select
              value={form.grade}
              onChange={(e) => set("grade", e.target.value)}
              className={inputCls}
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Class">
            <select
              value={form.class}
              onChange={(e) => set("class", e.target.value)}
              className={inputCls}
            >
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Guardian name">
            <input
              value={form.guardianName}
              onChange={(e) => set("guardianName", e.target.value)}
              placeholder="e.g. Imran Khan"
              className={inputCls}
            />
          </Field>

          <Field label="Guardian phone">
            <input
              value={form.guardianPhone}
              onChange={(e) => set("guardianPhone", e.target.value)}
              placeholder="+92 300 0000000"
              className={inputCls}
            />
          </Field>

          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) =>
                set("status", e.target.value as StudentStatus)
              }
              className={inputCls}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </Field>

          <Field label="Enrolled at">
            <input
              type="date"
              value={form.enrolledAt}
              onChange={(e) => set("enrolledAt", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 px-4 sm:px-5 py-3 sm:py-0 sm:h-16 border-t border-border shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto h-11 sm:h-9 px-4 rounded-md border border-border text-sm hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            disabled={!canSave}
            onClick={() => onSave(form)}
            className="w-full sm:w-auto h-11 sm:h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? "Save changes" : "Add student"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Form primitives
   ========================================================= */

const inputCls =
  "w-full h-11 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 disabled:bg-muted disabled:text-muted-foreground";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}