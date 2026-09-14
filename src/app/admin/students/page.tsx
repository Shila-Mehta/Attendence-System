
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
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  students as seed,
  type Student,
  type StudentStatus,
} from "@/data/mock/student";

export default function StudentsPage() {
  const [rows, setRows] = useState<Student[]>(seed);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | StudentStatus>("all");
  const [editing, setEditing] = useState<Student | null>(null);
  const [creating, setCreating] = useState(false);

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
    }),
    [rows]
  );

  const toggleStatus = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: r.status === "Active" ? "Inactive" : "Active",
            }
          : r
      )
    );
  };

  const deleteStudent = (id: string) => {
    const student = rows.find((r) => r.id === id);

    if (!student) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) return;

    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = (student: Student) => {
    setRows((prev) => {
      const exists = prev.some((r) => r.id === student.id);

      return exists
        ? prev.map((r) => (r.id === student.id ? student : r))
        : [student, ...prev];
    });

    setEditing(null);
    setCreating(false);
  };

  return (
    <PageContainer
      title="Student Management"
      description="Manage and maintain student records."
      actions={
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </button>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <StatCard label="Total Students" value={stats.total} />
        <StatCard label="Active" value={stats.active} tone="success" />
        <StatCard label="Inactive" value={stats.inactive} tone="danger" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 mb-4">
        <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, ID or guardian..."
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

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[850px] text-sm">
          <thead>
            <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Grade</th>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Guardian</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  No students match your search.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
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

                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.class}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="leading-tight">
                      <div>{r.guardianName}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.guardianPhone}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={r.status} />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {/* Edit */}
                      <button
                        onClick={() => setEditing(r)}
                        className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition"
                        title="Edit student"
                        aria-label={`Edit ${r.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      {/* Activate / Deactivate */}
                      <button
                        onClick={() => toggleStatus(r.id)}
                        className={`p-2 rounded-md hover:bg-muted transition ${
                          r.status === "Active"
                            ? "text-danger"
                            : "text-success"
                        }`}
                        title={
                          r.status === "Active"
                            ? "Deactivate student"
                            : "Activate student"
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

                      {/* Delete */}
                      <button
                        onClick={() => deleteStudent(r.id)}
                        className="p-2 rounded-md hover:bg-danger/10 text-danger transition"
                        title="Delete student"
                        aria-label={`Delete ${r.name}`}
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
        Showing {filtered.length} of {rows.length} students
      </div>

      {(creating || editing) && (
        <StudentModal
          student={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </PageContainer>
  );
}

/* ---------------- Stat Card ---------------- */

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
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs text-muted-foreground">{label}</div>

      <div
        className={`mt-1 text-2xl sm:text-2xl font-semibold ${toneClass}`}
      >
        {value}
      </div>
    </div>
  );
}

/* ---------------- Status Badge ---------------- */

function StatusBadge({
  status,
}: {
  status: "Active" | "Inactive";
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

/* ---------------- Student Modal ---------------- */

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

  const set = <K extends keyof Student>(
    key: K,
    value: Student[K]
  ) => {
    setForm((f) => ({
      ...f,
      [key]: value,
    }));
  };

  const canSave =
    form.name.trim() && form.guardianName.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg bg-surface border border-border shadow-xl my-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-5 h-14 border-b border-border bg-surface">
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

        {/* Form */}
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <Field label="Class">
            <select
              value={form.class}
              onChange={(e) => set("class", e.target.value)}
              className={inputCls}
            >
              {["Class A", "Class B", "Class C"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Guardian name">
            <input
              value={form.guardianName}
              onChange={(e) =>
                set("guardianName", e.target.value)
              }
              className={inputCls}
            />
          </Field>

          <Field label="Guardian phone">
            <input
              value={form.guardianPhone}
              onChange={(e) =>
                set("guardianPhone", e.target.value)
              }
              placeholder="+92 300 0000000"
              className={inputCls}
            />
          </Field>

          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) =>
                set(
                  "status",
                  e.target.value as StudentStatus
                )
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
              onChange={(e) =>
                set("enrolledAt", e.target.value)
              }
              className={inputCls}
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 px-4 sm:px-5 py-3 sm:h-16 border-t border-border bg-surface">
          <button
            onClick={onClose}
            className="h-10 sm:h-9 px-4 rounded-md border border-border text-sm hover:bg-muted transition"
          >
            Cancel
          </button>

          <button
            disabled={!canSave}
            onClick={() => onSave(form)}
            className="h-10 sm:h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? "Save changes" : "Add student"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Input ---------------- */

const inputCls =
  "w-full h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 disabled:bg-muted disabled:text-muted-foreground";

/* ---------------- Field ---------------- */

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


