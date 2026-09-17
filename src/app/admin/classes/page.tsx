"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
  X,
  Users,
  BookOpen,
  School,
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
import { classes as seed, type ClassRoom } from "@/data/mock/classes";
import { staff } from "@/data/mock/staff";

const GRADES = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
];

const CLASS_NAMES = ["Class A", "Class B", "Class C"];

const TEACHERS = staff.filter(
  (s) => s.role === "Teacher" || s.role === "Assistant"
);

export default function ClassesPage() {
  /* ---------------- Data ---------------- */
  const [rows, setRows] = useState<ClassRoom[]>(seed);

  /* ---------------- Async state slots (Phase 10) ---------------- */
  const [loading] = useState(false);
  const [error] = useState(false);

  /* ---------------- Filters ---------------- */
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Active" | "Archived"
  >("all");

  /* ---------------- Modal state ---------------- */
  const [editing, setEditing] = useState<ClassRoom | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ClassRoom | null>(null);

  /* ---------------- Toasts ---------------- */
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const pushToast = (tone: ToastTone, title: string, description?: string) => {
    // eslint-disable-next-line react-hooks/purity
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, tone, title, description }]);
  };
  const dismissToast = (id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  /* ---------------- Helpers ---------------- */
  const grades = useMemo(
    () => Array.from(new Set(rows.map((c) => c.grade))).sort(),
    [rows]
  );

  const teacherName = (id?: string) =>
    staff.find((s) => s.id === id)?.name ?? "—";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.grade.toLowerCase().includes(q) ||
        r.room.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);
      const matchesGrade = gradeFilter === "all" || r.grade === gradeFilter;
      const matchesStatus =
        statusFilter === "all" || r.status === statusFilter;
      return matchesQuery && matchesGrade && matchesStatus;
    });
  }, [rows, query, gradeFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((r) => r.status === "Active").length,
      archived: rows.filter((r) => r.status === "Archived").length,
      students: rows
        .filter((r) => r.status === "Active")
        .reduce((sum, r) => sum + r.studentCount, 0),
    }),
    [rows]
  );

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
  const toggleStatus = (cls: ClassRoom) => {
    const next = cls.status === "Active" ? "Archived" : "Active";
    setRows((prev) =>
      prev.map((r) => (r.id === cls.id ? { ...r, status: next } : r))
    );
    pushToast(
      next === "Active" ? "success" : "info",
      next === "Active" ? "Class restored" : "Class archived",
      `${cls.grade} · ${cls.name} is now ${next.toLowerCase()}.`
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
      "Class removed",
      `${removed.grade} · ${removed.name} has been deleted.`
    );
  };

  const handleSave = (cls: ClassRoom, isEdit: boolean) => {
    setRows((prev) => {
      const exists = prev.some((r) => r.id === cls.id);
      return exists
        ? prev.map((r) => (r.id === cls.id ? cls : r))
        : [cls, ...prev];
    });
    setEditing(null);
    setCreating(false);
    pushToast(
      "success",
      isEdit ? "Class updated" : "Class added",
      isEdit
        ? `${cls.grade} · ${cls.name} was saved.`
        : `${cls.grade} · ${cls.name} has been added.`
    );
  };

  return (
    <PageContainer
      title="Class Management"
      description="Manage classes and assign responsible staff."
      actions={
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center justify-center gap-2 h-10 sm:h-9 px-3 sm:px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Class
        </button>
      }
    >
      {/* ================= LOADING (Phase 10) ================= */}
      {loading ? (
        <div className="rounded-lg border border-border bg-surface">
          <LoadingState
            title="Loading classes…"
            description="Fetching the class list from the server."
          />
        </div>
      ) : error ? (
        /* ================= ERROR (Phase 10) ================= */
        <div className="rounded-lg border border-border bg-surface">
          <ErrorState
            title="Couldn't load classes"
            description="The server didn't respond. Check your connection and try again."
            onRetry={() => window.location.reload()}
          />
        </div>
      ) : (
        <>
          {/* ================= KPIs ================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <StatCard label="Total Classes" value={stats.total} />
            <StatCard label="Active" value={stats.active} tone="success" />
            <StatCard
              label="Archived"
              value={stats.archived}
              tone="muted"
            />
            <StatCard label="Students Enrolled" value={stats.students} />
          </div>

          {/* ================= FILTERS ================= */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 mb-4">
            <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by class, grade, room or ID…"
                className="w-full h-10 sm:h-9 rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
              />
            </div>

            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full sm:w-auto h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
            >
              <option value="all">All grades</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
              className="w-full sm:w-auto h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
            >
              <option value="all">All statuses</option>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* ================= EMPTY ================= */}
          {filtered.length === 0 && (
            <div className="rounded-lg border border-border bg-surface">
              {rows.length === 0 ? (
                <EmptyState
                  icon={<School className="h-5 w-5" />}
                  title="No classes yet"
                  description="Add your first class to get started."
                  action={
                    <button
                      onClick={() => setCreating(true)}
                      className="h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Class
                    </button>
                  }
                />
              ) : (
                <EmptyState
                  icon={<BookOpen className="h-5 w-5" />}
                  title="No classes match your filters"
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
              {filtered.map((r) => {
                const pct = Math.min(
                  100,
                  Math.round((r.studentCount / r.capacity) * 100)
                );

                return (
                  <article
                    key={r.id}
                    className="rounded-lg border border-border bg-surface overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 p-4">
                      <div className="h-11 w-11 rounded-lg bg-blue-light text-blue border border-blue/20 grid place-items-center shrink-0">
                        <School className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">
                              {r.grade} · {r.name}
                            </div>
                            <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                              {r.id} · Room {r.room || "—"}
                            </div>
                          </div>
                          <StatusBadge status={r.status} />
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Teacher: {teacherName(r.teacherId)}
                          {r.assistantId && (
                            <span> · Asst: {teacherName(r.assistantId)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Enrollment */}
                    <div className="px-4 pb-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {r.studentCount} of {r.capacity} enrolled
                        </span>
                        <span className="tabular-nums">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${
                            pct >= 90 ? "bg-warning" : "bg-blue"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
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
                            ? `Archive ${r.name}`
                            : `Restore ${r.name}`
                        }
                      >
                        {r.status === "Active" ? (
                          <>
                            <Archive className="h-4 w-4" />
                            Archive
                          </>
                        ) : (
                          <>
                            <ArchiveRestore className="h-4 w-4" />
                            Restore
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
                );
              })}
            </div>
          )}

          {/* ================= DESKTOP: table ================= */}
          {filtered.length > 0 && (
            <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-surface">
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Class</th>
                    <th className="px-4 py-3 font-medium">Grade</th>
                    <th className="px-4 py-3 font-medium">Room</th>
                    <th className="px-4 py-3 font-medium">Teacher</th>
                    <th className="px-4 py-3 font-medium">Enrollment</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((r) => {
                    const pct = Math.min(
                      100,
                      Math.round((r.studentCount / r.capacity) * 100)
                    );

                    return (
                      <tr
                        key={r.id}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                          {r.id}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap font-medium">
                          {r.name}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {r.grade}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                          {r.room || "—"}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="leading-tight">
                            <div>{teacherName(r.teacherId)}</div>
                            {r.assistantId && (
                              <div className="text-xs text-muted-foreground">
                                Asst: {teacherName(r.assistantId)}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs tabular-nums">
                              {r.studentCount} / {r.capacity}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-28 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full ${
                                pct >= 90 ? "bg-warning" : "bg-blue"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={r.status} />
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditing(r)}
                              className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition"
                              title="Edit class"
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
                                r.status === "Active" ? "Archive" : "Restore"
                              }
                              aria-label={
                                r.status === "Active"
                                  ? `Archive ${r.name}`
                                  : `Restore ${r.name}`
                              }
                            >
                              {r.status === "Active" ? (
                                <Archive className="h-4 w-4" />
                              ) : (
                                <ArchiveRestore className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              onClick={() => setPendingDelete(r)}
                              className="p-2 rounded-md hover:bg-danger-light text-danger transition"
                              title="Delete class"
                              aria-label={`Delete ${r.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-3 text-xs text-muted-foreground">
              Showing {filtered.length} of {rows.length} classes
            </div>
          )}

          {/* ================= ADD / EDIT MODAL ================= */}
          {(creating || editing) && (
            <ClassModal
              cls={editing ?? undefined}
              onClose={() => {
                setCreating(false);
                setEditing(null);
              }}
              onSave={(c) => handleSave(c, Boolean(editing))}
            />
          )}

          {/* ================= CONFIRM DELETE ================= */}
          <ConfirmDialog
            open={pendingDelete !== null}
            title="Delete class?"
            message={
              <>
                <span className="font-medium text-foreground">
                  {pendingDelete?.grade} · {pendingDelete?.name}
                </span>{" "}
                will be permanently removed. This action cannot be undone.
              </>
            }
            confirmLabel="Delete class"
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

function StatusBadge({ status }: { status: "Active" | "Archived" }) {
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
   Add / Edit modal
   ========================================================= */

function ClassModal({
  cls,
  onClose,
  onSave,
}: {
  cls?: ClassRoom;
  onClose: () => void;
  onSave: (c: ClassRoom) => void;
}) {
  const isEdit = Boolean(cls);

  const [form, setForm] = useState<ClassRoom>(
    cls ?? {
      // eslint-disable-next-line react-hooks/purity
      id: `CL${String(Math.floor(Math.random() * 900) + 100)}`,
      name: "Class A",
      grade: "Grade 1",
      section: "A",
      room: "",
      teacherId: TEACHERS[0]?.id ?? "",
      assistantId: undefined,
      studentCount: 0,
      capacity: 30,
      status: "Active",
    }
  );

  const set = <K extends keyof ClassRoom>(key: K, value: ClassRoom[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canSave = form.room.trim() && form.teacherId;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-lg bg-surface border border-border shadow-xl flex flex-col overflow-hidden">
        {/* Grabber (mobile) */}
        <div className="sm:hidden flex justify-center pt-2">
          <span className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 h-14 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold">
            {isEdit ? "Edit Class" : "Add Class"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
          <Field label="Class ID">
            <input
              value={form.id}
              onChange={(e) => set("id", e.target.value)}
              disabled={isEdit}
              className={inputCls}
            />
          </Field>

          <Field label="Class name">
            <select
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputCls}
            >
              {CLASS_NAMES.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>

          <Field label="Grade">
            <select
              value={form.grade}
              onChange={(e) => set("grade", e.target.value)}
              className={inputCls}
            >
              {GRADES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </Field>

          <Field label="Section">
            <input
              value={form.section}
              onChange={(e) => set("section", e.target.value)}
              maxLength={2}
              className={inputCls}
            />
          </Field>

          <Field label="Room">
            <input
              value={form.room}
              onChange={(e) => set("room", e.target.value)}
              placeholder="e.g. R-101"
              className={inputCls}
            />
          </Field>

          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) =>
                set("status", e.target.value as "Active" | "Archived")
              }
              className={inputCls}
            >
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </select>
          </Field>

          <Field label="Responsible teacher">
            <select
              value={form.teacherId}
              onChange={(e) => set("teacherId", e.target.value)}
              className={inputCls}
            >
              {TEACHERS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Assistant (optional)">
            <select
              value={form.assistantId ?? ""}
              onChange={(e) =>
                set("assistantId", e.target.value || undefined)
              }
              className={inputCls}
            >
              <option value="">— None —</option>
              {TEACHERS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Enrolled">
            <input
              type="number"
              min={0}
              value={form.studentCount}
              onChange={(e) => set("studentCount", Number(e.target.value))}
              className={inputCls}
            />
          </Field>

          <Field label="Capacity">
            <input
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => set("capacity", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
        </div>

        {/* Footer */}
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
            {isEdit ? "Save changes" : "Add class"}
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