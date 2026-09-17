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
  Mail,
  Phone,
  BookOpen,
} from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  ToastContainer,
  type ToastMessage,
  type ToastTone,
} from "@/components/ui/Toast";
import {
  staff as seed,
  type Staff,
  type StaffRole,
} from "@/data/mock/staff";
import { classes } from "@/data/mock/classes";

const ROLES: StaffRole[] = [
  "Admin",
  "Office",
  "Principal",
  "Teacher",
  "Assistant",
];

const DEPARTMENTS = [
  "Primary",
  "Secondary",
  "Front Office",
  "Leadership",
  "Operations",
];

export default function StaffPage() {
  const [rows, setRows] = useState<Staff[]>(seed);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | StaffRole>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Active" | "Inactive"
  >("all");

  const [editing, setEditing] = useState<Staff | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Staff | null>(null);

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
        r.email.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || r.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || r.status === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [rows, query, roleFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((r) => r.status === "Active").length,
      teachers: rows.filter(
        (r) => r.role === "Teacher" && r.status === "Active"
      ).length,
      support: rows.filter(
        (r) =>
          (r.role === "Assistant" || r.role === "Office") &&
          r.status === "Active"
      ).length,
    }),
    [rows]
  );

  /* ---------------- Actions ---------------- */
  const toggleStatus = (member: Staff) => {
    const next = member.status === "Active" ? "Inactive" : "Active";
    setRows((prev) =>
      prev.map((r) => (r.id === member.id ? { ...r, status: next } : r))
    );
    pushToast(
      next === "Active" ? "success" : "info",
      next === "Active" ? "Staff activated" : "Staff deactivated",
      `${member.name} is now ${next.toLowerCase()}.`
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
      "Staff removed",
      `${removed.name} has been deleted from the roster.`
    );
  };

  const handleSave = (member: Staff, isEdit: boolean) => {
    setRows((prev) => {
      const exists = prev.some((r) => r.id === member.id);
      return exists
        ? prev.map((r) => (r.id === member.id ? member : r))
        : [member, ...prev];
    });
    setEditing(null);
    setCreating(false);
    pushToast(
      "success",
      isEdit ? "Staff updated" : "Staff added",
      isEdit
        ? `${member.name}'s details were saved.`
        : `${member.name} has been added to the roster.`
    );
  };

  return (
    <PageContainer
      title="Staff Management"
      description="Create or deactivate staff and assign roles."
      actions={
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center justify-center gap-2 h-10 sm:h-9 px-3 sm:px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Staff
        </button>
      }
    >
      {/* ================= KPIs ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard label="Total Staff" value={stats.total} />
        <StatCard label="Active" value={stats.active} tone="success" />
        <StatCard label="Teachers" value={stats.teachers} />
        <StatCard label="Support Staff" value={stats.support} />
      </div>

      {/* ================= FILTERS ================= */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 mb-4">
        <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, ID or department…"
            className="w-full h-10 sm:h-9 rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "all" | StaffRole)}
          className="w-full sm:w-auto h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
        >
          <option value="all">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
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
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* ================= MOBILE: cards (< md) ================= */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface px-4 py-12 text-center text-sm text-muted-foreground">
            No staff match your filters.
          </div>
        ) : (
          filtered.map((r) => (
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
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <RoleBadge role={r.role} />
                    <span className="text-xs text-muted-foreground">
                      {r.department}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact + classes */}
              <div className="px-4 pb-4 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{r.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>{r.phone}</span>
                </div>
                {r.assignedClassIds.length > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {r.assignedClassIds.length} class
                      {r.assignedClassIds.length === 1 ? "" : "es"}
                    </span>
                  </div>
                )}
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
                  className={`h-11 flex items-center justify-center gap-1.5 text-xs font-medium hover:bg-muted transition border-r border-border ${r.status === "Active" ? "text-danger" : "text-success"
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
          ))
        )}
      </div>

      {/* ================= DESKTOP: table (md+) ================= */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Classes</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  No staff match your filters.
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

                  <td className="px-4 py-3 whitespace-nowrap">
                    <RoleBadge role={r.role} />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {r.department}
                  </td>

                  <td className="px-4 py-3">
                    <div className="space-y-1 text-xs min-w-[210px]">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[190px]">
                          {r.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span>{r.phone}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.assignedClassIds.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs">
                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                        {r.assignedClassIds.length}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={r.status} />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditing(r)}
                        className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition"
                        title="Edit staff"
                        aria-label={`Edit ${r.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => toggleStatus(r)}
                        className={`p-2 rounded-md hover:bg-muted transition ${r.status === "Active"
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
                        title="Delete staff"
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
        Showing {filtered.length} of {rows.length} staff members
      </div>

      {/* ================= MODAL ================= */}
      {(creating || editing) && (
        <StaffModal
          member={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={(m) => handleSave(m, Boolean(editing))}
        />
      )}

      {/* ================= CONFIRM DELETE ================= */}
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete staff member?"
        message={
          <>
            <span className="font-medium text-foreground">
              {pendingDelete?.name}
            </span>{" "}
            will be permanently removed from the roster. This action cannot be
            undone.
          </>
        }
        confirmLabel="Delete staff"
        cancelLabel="Keep"
        tone="danger"
        icon={<Trash2 className="h-5 w-5" />}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
      {/* ================= TOASTS ================= */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
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

function RoleBadge({ role }: { role: StaffRole }) {
  const cls =
    role === "Teacher"
      ? "bg-blue-light text-blue border border-blue/20"
      : role === "Admin"
        ? "bg-navy text-white border border-navy"
        : role === "Principal"
          ? "bg-success-light text-success border border-success/20"
          : role === "Office"
            ? "bg-warning-light text-warning border border-warning/20"
            : "bg-inactive-bg text-inactive border border-inactive-border";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}
    >
      {role}
    </span>
  );
}

/* =========================================================
   Staff modal
   ========================================================= */

function StaffModal({
  member,
  onClose,
  onSave,
}: {
  member?: Staff;
  onClose: () => void;
  onSave: (s: Staff) => void;
}) {
  const isEdit = Boolean(member);

  const [form, setForm] = useState<Staff>(
    member ?? {
      // eslint-disable-next-line react-hooks/purity
      id: `SF${String(Math.floor(Math.random() * 900) + 100)}`,
      name: "",
      email: "",
      phone: "",
      role: "Teacher",
      department: "Primary",
      joinedAt: new Date().toISOString().slice(0, 10),
      assignedClassIds: [],
      status: "Active",
    }
  );

  const set = <K extends keyof Staff>(key: K, value: Staff[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canSave = form.name.trim() && form.email.trim();

  const assignedClasses = classes.filter((c) =>
    form.assignedClassIds.includes(c.id)
  );

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
            {isEdit ? "Edit Staff" : "Add Staff"}
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
          <Field label="Staff ID">
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
              placeholder="e.g. Fatima Iqbal"
              className={inputCls}
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="name@school.edu"
              className={inputCls}
            />
          </Field>

          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+92 300 0000000"
              className={inputCls}
            />
          </Field>

          <Field label="Role">
            <select
              value={form.role}
              onChange={(e) => set("role", e.target.value as StaffRole)}
              className={inputCls}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Department">
            <select
              value={form.department}
              onChange={(e) => set("department", e.target.value)}
              className={inputCls}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Joined at">
            <input
              type="date"
              value={form.joinedAt}
              onChange={(e) => set("joinedAt", e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) =>
                set("status", e.target.value as "Active" | "Inactive")
              }
              className={inputCls}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </Field>

          {/* Read-only assigned classes (edit only) */}
          {isEdit && (
            <div className="sm:col-span-2">
              <div className="text-xs font-medium text-muted-foreground mb-1.5">
                Assigned classes
              </div>

              {assignedClasses.length === 0 ? (
                <div className="rounded-md border border-border bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground">
                  Not assigned to any class.
                </div>
              ) : (
                <ul className="rounded-md border border-border divide-y divide-border">
                  {assignedClasses.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {c.grade} · {c.name}
                        </div>
                        <div className="text-muted-foreground font-mono">
                          {c.id} · {c.room}
                        </div>
                      </div>
                      <span className="text-muted-foreground shrink-0 tabular-nums">
                        {c.studentCount} students
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-2 text-[11px] text-muted-foreground">
                Class assignments are managed from{" "}
                <span className="font-medium text-foreground">
                  Class Management
                </span>
                .
              </p>
            </div>
          )}
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
            {isEdit ? "Save changes" : "Add staff"}
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