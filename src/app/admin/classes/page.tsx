"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Archive, ArchiveRestore, X, Users } from "lucide-react";
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
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Archived">("all");
  const [editing, setEditing] = useState<ClassRoom | null>(null);
  const [creating, setCreating] = useState(false);

  const grades = useMemo(
    () => Array.from(new Set(seed.map((c) => c.grade))).sort(),
    []
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
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
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
          ? { ...r, status: r.status === "Active" ? "Archived" : "Active" }
          : r
      )
    );
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
          className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition"
        >
          <Plus className="h-4 w-4" />
          Add Class
        </button>
      }
    >
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Total Classes" value={stats.total} />
        <StatCard label="Active" value={stats.active} tone="success" />
        <StatCard label="Archived" value={stats.archived} tone="danger" />
        <StatCard label="Students Enrolled" value={stats.students} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by class, grade, room or ID…"
            className="w-full h-9 rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          />
        </div>

        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
        >
          <option value="all">All grades</option>
          {grades.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
        >
          <option value="all">All statuses</option>
          <option value="Active">Active</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
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
              <th className="px-4 py-3 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No classes match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const pct = Math.min(100, Math.round((r.studentCount / r.capacity) * 100));
                return (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{r.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{r.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.grade}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{r.room}</td>
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
                        <span className="text-xs">
                          {r.studentCount} / {r.capacity}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-28 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${pct >= 90 ? "bg-warning" : "bg-blue"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditing(r)}
                          className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(r.id)}
                          className={`p-2 rounded-md hover:bg-muted ${
                            r.status === "Active" ? "text-danger" : "text-success"
                          }`}
                          title={r.status === "Active" ? "Archive" : "Restore"}
                        >
                          {r.status === "Active" ? (
                            <Archive className="h-4 w-4" />
                          ) : (
                            <ArchiveRestore className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Showing {filtered.length} of {rows.length} classes
      </div>

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
    </PageContainer>
  );
}

/* ---------------- sub-components ---------------- */

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
    tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: "Active" | "Inactive" }) {
  const cls =
    status === "Active"
      ? "bg-success-light text-success border border-success/20"
      : "bg-inactive-bg text-inactive border border-inactive-border";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}>
      {status}
    </span>
  );
}

const TEACHERS = staff.filter((s) => s.role === "Teacher" || s.role === "Assistant");

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-lg bg-surface border border-border shadow-xl">
        <div className="flex items-center justify-between px-5 h-14 border-b border-border">
          <h2 className="text-sm font-semibold">{isEdit ? "Edit Class" : "Add Class"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 grid gap-4 sm:grid-cols-2">
          <Field label="Class ID">
            <input value={form.id} onChange={(e) => set("id", e.target.value)} disabled={isEdit} className={inputCls} />
          </Field>
          <Field label="Class name">
            <select value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls}>
              {["Class A", "Class B", "Class C"].map((n) => <option key={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="Grade">
            <select value={form.grade} onChange={(e) => set("grade", e.target.value)} className={inputCls}>
              {["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6"].map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Section">
            <input value={form.section} onChange={(e) => set("section", e.target.value)} maxLength={2} className={inputCls} />
          </Field>
          <Field label="Room">
            <input value={form.room} onChange={(e) => set("room", e.target.value)} placeholder="e.g. R-101" className={inputCls} />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => set("status", e.target.value as "Active" | "Archived")} className={inputCls}>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </select>
          </Field>
          <Field label="Responsible teacher">
            <select value={form.teacherId} onChange={(e) => set("teacherId", e.target.value)} className={inputCls}>
              {TEACHERS.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Assistant (optional)">
            <select
              value={form.assistantId ?? ""}
              onChange={(e) => set("assistantId", e.target.value || undefined)}
              className={inputCls}
            >
              <option value="">— None —</option>
              {TEACHERS.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
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

        <div className="flex items-center justify-end gap-2 px-5 h-16 border-t border-border">
          <button onClick={onClose} className="h-9 px-4 rounded-md border border-border text-sm hover:bg-muted">
            Cancel
          </button>
          <button
            disabled={!canSave}
            onClick={() => onSave(form)}
            className="h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? "Save changes" : "Add class"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 disabled:bg-muted disabled:text-muted-foreground";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}