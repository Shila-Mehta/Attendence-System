
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
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  classes as seed,
  type ClassRoom,
} from "@/data/mock/classes";
import { staff } from "@/data/mock/staff";

export default function ClassesPage() {
  const [rows, setRows] = useState<ClassRoom[]>(seed);
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Active" | "Archived"
  >("all");

  const [editing, setEditing] = useState<ClassRoom | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<ClassRoom | null>(null);

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

      const matchesGrade =
        gradeFilter === "all" || r.grade === gradeFilter;

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

  const toggleStatus = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status:
                r.status === "Active" ? "Archived" : "Active",
            }
          : r
      )
    );
  };

  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setDeleting(null);
  };

  const handleSave = (cls: ClassRoom) => {
    setRows((prev) => {
      const exists = prev.some((r) => r.id === cls.id);

      return exists
        ? prev.map((r) => (r.id === cls.id ? cls : r))
        : [cls, ...prev];
    });

    setEditing(null);
    setCreating(false);
  };

  return (
    <PageContainer
      title="Class Management"
      description="Manage classes and assign responsible staff."
      actions={
        <button
          onClick={() => setCreating(true)}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 h-10 sm:h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition"
        >
          <Plus className="h-4 w-4" />
          Add Class
        </button>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard label="Total Classes" value={stats.total} />
        <StatCard label="Active" value={stats.active} tone="success" />
        <StatCard
          label="Archived"
          value={stats.archived}
          tone="danger"
        />
        <StatCard
          label="Students Enrolled"
          value={stats.students}
        />
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-stretch lg:items-center gap-3">
        {/* Search */}
        <div className="relative w-full lg:flex-1 lg:min-w-[220px] lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by class, grade, room or ID…"
            className="w-full h-10 sm:h-9 rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          />
        </div>

        {/* Grade */}
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="w-full h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
        >
          <option value="all">All grades</option>

          {grades.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value as typeof statusFilter
            )
          }
          className="w-full h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
        >
          <option value="all">All statuses</option>
          <option value="Active">Active</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
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
            {filtered.length === 0 ? (
              <EmptyRow />
            ) : (
              filtered.map((r) => (
                <DesktopClassRow
                  key={r.id}
                  row={r}
                  teacherName={teacherName}
                  onEdit={() => setEditing(r)}
                  onToggleStatus={() => toggleStatus(r.id)}
                  onDelete={() => setDeleting(r)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface px-4 py-12 text-center text-sm text-muted-foreground">
            No classes match your filters.
          </div>
        ) : (
          filtered.map((r) => {
            const pct = Math.min(
              100,
              Math.round((r.studentCount / r.capacity) * 100)
            );

            return (
              <div
                key={r.id}
                className="rounded-lg border border-border bg-surface p-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {r.name}
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground font-mono">
                      {r.id}
                    </div>
                  </div>

                  <StatusBadge status={r.status} />
                </div>

                {/* Details */}
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                  <MobileDetail
                    label="Grade"
                    value={r.grade}
                  />

                  <MobileDetail
                    label="Section"
                    value={r.section}
                  />

                  <MobileDetail
                    label="Room"
                    value={r.room || "—"}
                  />

                  <MobileDetail
                    label="Teacher"
                    value={teacherName(r.teacherId)}
                  />

                  <MobileDetail
                    label="Assistant"
                    value={
                      r.assistantId
                        ? teacherName(r.assistantId)
                        : "—"
                    }
                  />

                  <div>
                    <div className="text-xs text-muted-foreground">
                      Enrollment
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />

                      <span className="text-sm">
                        {r.studentCount} / {r.capacity}
                      </span>
                    </div>

                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${
                          pct >= 90
                            ? "bg-warning"
                            : "bg-blue"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditing(r)}
                    className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md border border-border hover:bg-muted text-sm"
                  >
                    <Pencil className="h-4 w-4" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => toggleStatus(r.id)}
                    className={`inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md border border-border hover:bg-muted text-sm ${
                      r.status === "Active"
                        ? "text-danger"
                        : "text-success"
                    }`}
                  >
                    {r.status === "Active" ? (
                      <Archive className="h-4 w-4" />
                    ) : (
                      <ArchiveRestore className="h-4 w-4" />
                    )}

                    <span>
                      {r.status === "Active"
                        ? "Archive"
                        : "Restore"}
                    </span>
                  </button>

                  <button
                    onClick={() => setDeleting(r)}
                    className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-border text-danger hover:bg-danger/10"
                    title="Delete"
                    aria-label={`Delete ${r.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Showing {filtered.length} of {rows.length} classes
      </div>

      {/* Add/Edit Modal */}
      {(creating || editing) && (
        <ClassModal
          cls={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <DeleteModal
          cls={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={() => handleDelete(deleting.id)}
        />
      )}
    </PageContainer>
  );
}

/* ============================================================
   DESKTOP ROW
============================================================ */

function DesktopClassRow({
  row,
  teacherName,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  row: ClassRoom;
  teacherName: (id?: string) => string;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  const pct = Math.min(
    100,
    Math.round((row.studentCount / row.capacity) * 100)
  );

  return (
    <tr className="border-t border-border hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
        {row.id}
      </td>

      <td className="px-4 py-3 whitespace-nowrap font-medium">
        {row.name}
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        {row.grade}
      </td>

      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
        {row.room || "—"}
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <div className="leading-tight">
          <div>{teacherName(row.teacherId)}</div>

          {row.assistantId && (
            <div className="text-xs text-muted-foreground">
              Asst: {teacherName(row.assistantId)}
            </div>
          )}
        </div>
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />

          <span className="text-xs">
            {row.studentCount} / {row.capacity}
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
        <StatusBadge status={row.status} />
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onEdit}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Edit"
            aria-label={`Edit ${row.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            onClick={onToggleStatus}
            className={`p-2 rounded-md hover:bg-muted ${
              row.status === "Active"
                ? "text-danger"
                : "text-success"
            }`}
            title={
              row.status === "Active"
                ? "Archive"
                : "Restore"
            }
            aria-label={
              row.status === "Active"
                ? `Archive ${row.name}`
                : `Restore ${row.name}`
            }
          >
            {row.status === "Active" ? (
              <Archive className="h-4 w-4" />
            ) : (
              <ArchiveRestore className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={onDelete}
            className="p-2 rounded-md hover:bg-danger/10 text-danger"
            title="Delete"
            aria-label={`Delete ${row.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ============================================================
   MOBILE DETAIL
============================================================ */

function MobileDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-muted-foreground">
        {label}
      </div>

      <div className="mt-1 text-sm truncate">
        {value}
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY TABLE ROW
============================================================ */

function EmptyRow() {
  return (
    <tr>
      <td
        colSpan={8}
        className="px-4 py-12 text-center text-sm text-muted-foreground"
      >
        No classes match your filters.
      </td>
    </tr>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "danger"
      ? "text-danger"
      : "text-foreground";

  return (
    <div className="rounded-lg border border-border bg-surface p-3 sm:p-4">
      <div className="text-xs text-muted-foreground">
        {label}
      </div>

      <div
        className={`mt-1 text-xl sm:text-2xl font-semibold ${toneClass}`}
      >
        {value}
      </div>
    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  status,
}: {
  status: "Active" | "Archived";
}) {
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

/* ============================================================
   TEACHERS
============================================================ */

const TEACHERS = staff.filter(
  (s) => s.role === "Teacher" || s.role === "Assistant"
);

/* ============================================================
   ADD / EDIT MODAL
============================================================ */

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

  const set = <K extends keyof ClassRoom>(
    key: K,
    value: ClassRoom[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  const canSave =
    form.room.trim() && form.teacherId;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-t-xl sm:rounded-lg bg-surface border border-border shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-4 sm:px-5 h-14 border-b border-border">
          <h2 className="text-sm font-semibold">
            {isEdit ? "Edit Class" : "Add Class"}
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Class ID">
              <input
                value={form.id}
                onChange={(e) =>
                  set("id", e.target.value)
                }
                disabled={isEdit}
                className={inputCls}
              />
            </Field>

            <Field label="Class name">
              <select
                value={form.name}
                onChange={(e) =>
                  set("name", e.target.value)
                }
                className={inputCls}
              >
                {["Class A", "Class B", "Class C"].map(
                  (n) => (
                    <option key={n}>{n}</option>
                  )
                )}
              </select>
            </Field>

            <Field label="Grade">
              <select
                value={form.grade}
                onChange={(e) =>
                  set("grade", e.target.value)
                }
                className={inputCls}
              >
                {[
                  "Grade 1",
                  "Grade 2",
                  "Grade 3",
                  "Grade 4",
                  "Grade 5",
                  "Grade 6",
                ].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </Field>

            <Field label="Section">
              <input
                value={form.section}
                onChange={(e) =>
                  set("section", e.target.value)
                }
                maxLength={2}
                className={inputCls}
              />
            </Field>

            <Field label="Room">
              <input
                value={form.room}
                onChange={(e) =>
                  set("room", e.target.value)
                }
                placeholder="e.g. R-101"
                className={inputCls}
              />
            </Field>

            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) =>
                  set(
                    "status",
                    e.target.value as
                      | "Active"
                      | "Archived"
                  )
                }
                className={inputCls}
              >
                <option value="Active">
                  Active
                </option>
                <option value="Archived">
                  Archived
                </option>
              </select>
            </Field>

            <Field label="Responsible teacher">
              <select
                value={form.teacherId}
                onChange={(e) =>
                  set("teacherId", e.target.value)
                }
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
                  set(
                    "assistantId",
                    e.target.value || undefined
                  )
                }
                className={inputCls}
              >
                <option value="">
                  — None —
                </option>

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
                onChange={(e) =>
                  set(
                    "studentCount",
                    Number(e.target.value)
                  )
                }
                className={inputCls}
              />
            </Field>

            <Field label="Capacity">
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) =>
                  set(
                    "capacity",
                    Number(e.target.value)
                  )
                }
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 px-4 sm:px-5 py-3 sm:h-16 border-t border-border">
          <button
            onClick={onClose}
            className="w-full sm:w-auto h-10 sm:h-9 px-4 rounded-md border border-border text-sm hover:bg-muted"
          >
            Cancel
          </button>

          <button
            disabled={!canSave}
            onClick={() => onSave(form)}
            className="w-full sm:w-auto h-10 sm:h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? "Save changes" : "Add class"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DELETE MODAL
============================================================ */

function DeleteModal({
  cls,
  onClose,
  onConfirm,
}: {
  cls: ClassRoom;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm rounded-lg bg-surface border border-border shadow-xl">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
              <Trash2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold">
                Delete class?
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-medium text-foreground">
                  {cls.name}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-5 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full sm:w-auto h-10 sm:h-9 px-4 rounded-md border border-border text-sm hover:bg-muted"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="w-full sm:w-auto h-10 sm:h-9 px-4 rounded-md bg-danger text-white text-sm font-medium hover:opacity-90 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   INPUT / FIELD
============================================================ */

const inputCls =
  "w-full h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 disabled:bg-muted disabled:text-muted-foreground";

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

