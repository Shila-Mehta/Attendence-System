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
import {
  staff as seed,
  type Staff,
  type StaffRole,
} from "@/data/mock/staff";

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

  /* ---------------- Filtered staff ---------------- */

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((r) => {
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q);

      const matchesRole =
        roleFilter === "all" || r.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" || r.status === statusFilter;

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [rows, query, roleFilter, statusFilter]);

  /* ---------------- Stats ---------------- */

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

  /* ---------------- Toggle status ---------------- */

  const toggleStatus = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status:
                r.status === "Active" ? "Inactive" : "Active",
            }
          : r
      )
    );
  };

  /* ---------------- Delete staff ---------------- */

  const handleDelete = (member: Staff) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${member.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setRows((prev) =>
      prev.filter((r) => r.id !== member.id)
    );

    // Close edit modal if the deleted staff member was being edited.
    if (editing?.id === member.id) {
      setEditing(null);
    }
  };

  /* ---------------- Save staff ---------------- */

  const handleSave = (member: Staff) => {
    setRows((prev) => {
      const exists = prev.some((r) => r.id === member.id);

      return exists
        ? prev.map((r) =>
            r.id === member.id ? member : r
          )
        : [member, ...prev];
    });

    setEditing(null);
    setCreating(false);
  };

  return (
    <PageContainer
      title="Staff Management"
      description="Create or deactivate staff and assign roles."
      actions={
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center justify-center gap-2 h-9 px-3 sm:px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Staff
        </button>
      }
    >
      {/* ================= KPIs ================= */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard
          label="Total Staff"
          value={stats.total}
        />

        <StatCard
          label="Active"
          value={stats.active}
          tone="success"
        />

        <StatCard
          label="Teachers"
          value={stats.teachers}
        />

        <StatCard
          label="Support Staff"
          value={stats.support}
        />
      </div>

      {/* ================= FILTERS ================= */}

      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 mb-4">
        {/* Search */}

        <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, ID or department…"
            className="w-full h-10 sm:h-9 rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          />
        </div>

        {/* Role */}

        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(
              e.target.value as "all" | StaffRole
            )
          }
          className="w-full sm:w-auto h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
        >
          <option value="all">All roles</option>

          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
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
          className="w-full sm:w-auto h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
        >
          <option value="all">All statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* ================= TABLE ================= */}

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">
                ID
              </th>

              <th className="px-4 py-3 font-medium">
                Name
              </th>

              <th className="px-4 py-3 font-medium">
                Role
              </th>

              <th className="px-4 py-3 font-medium">
                Department
              </th>

              <th className="px-4 py-3 font-medium">
                Contact
              </th>

              <th className="px-4 py-3 font-medium">
                Classes
              </th>

              <th className="px-4 py-3 font-medium">
                Status
              </th>

              <th className="px-4 py-3 font-medium text-right">
                Actions
              </th>
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
                  {/* ID */}

                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                    {r.id}
                  </td>

                  {/* Name */}

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

                  {/* Role */}

                  <td className="px-4 py-3 whitespace-nowrap">
                    <RoleBadge role={r.role} />
                  </td>

                  {/* Department */}

                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {r.department}
                  </td>

                  {/* Contact */}

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

                  {/* Classes */}

                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.assignedClassIds.length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        —
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs">
                        <BookOpen className="h-3 w-3 text-muted-foreground" />

                        {r.assignedClassIds.length}
                      </div>
                    )}
                  </td>

                  {/* Status */}

                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={r.status} />
                  </td>

                  {/* Actions */}

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {/* Edit */}

                      <button
                        onClick={() => setEditing(r)}
                        className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition"
                        title="Edit staff"
                        aria-label={`Edit ${r.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      {/* Activate / Deactivate */}

                      <button
                        onClick={() => toggleStatus(r.id)}
                        className={`p-2 rounded-md hover:bg-muted transition ${
                          r.status === "Active"
                            ? "text-danger hover:text-danger"
                            : "text-success hover:text-success"
                        }`}
                        title={
                          r.status === "Active"
                            ? "Deactivate"
                            : "Activate"
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
                        onClick={() => handleDelete(r)}
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

      {/* Result count */}

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
          onSave={handleSave}
        />
      )}
    </PageContainer>
  );
}

/* =========================================================
   Helper Functions
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
   STAT CARD
   ========================================================= */

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
    <div className="rounded-lg border border-border bg-surface p-4 min-w-0">
      <div className="text-xs text-muted-foreground">
        {label}
      </div>

      <div
        className={`mt-1 text-2xl sm:text-3xl font-semibold tabular-nums ${toneClass}`}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
   ========================================================= */

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

/* =========================================================
   ROLE BADGE
   ========================================================= */

function RoleBadge({
  role,
}: {
  role: StaffRole;
}) {
  const cls =
    role === "Teacher"
      ? "bg-blue-light text-blue"
      : role === "Admin"
      ? "bg-navy text-white"
      : role === "Principal"
      ? "bg-success-light text-success"
      : role === "Office"
      ? "bg-warning-light text-warning"
      : "bg-muted text-muted-foreground";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}
    >
      {role}
    </span>
  );
}

/* =========================================================
   STAFF MODAL
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

  const set = <K extends keyof Staff>(
    key: K,
    value: Staff[K]
  ) => {
    setForm((f) => ({
      ...f,
      [key]: value,
    }));
  };

  const canSave =
    form.name.trim() && form.email.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Overlay */}

      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}

      <div className="relative w-full max-w-lg max-h-[calc(100vh-1.5rem)] sm:max-h-[90vh] rounded-lg bg-surface border border-border shadow-xl flex flex-col overflow-hidden">
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
              onChange={(e) =>
                set("id", e.target.value)
              }
              disabled={isEdit}
              className={inputCls}
            />
          </Field>

          <Field label="Full name">
            <input
              value={form.name}
              onChange={(e) =>
                set("name", e.target.value)
              }
              placeholder="e.g. Fatima Iqbal"
              className={inputCls}
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                set("email", e.target.value)
              }
              placeholder="name@school.edu"
              className={inputCls}
            />
          </Field>

          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) =>
                set("phone", e.target.value)
              }
              placeholder="+92 300 0000000"
              className={inputCls}
            />
          </Field>

          <Field label="Role">
            <select
              value={form.role}
              onChange={(e) =>
                set(
                  "role",
                  e.target.value as StaffRole
                )
              }
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
              onChange={(e) =>
                set("department", e.target.value)
              }
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
              onChange={(e) =>
                set("joinedAt", e.target.value)
              }
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
                    | "Inactive"
                )
              }
              className={inputCls}
            >
              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </Field>
        </div>

        {/* Footer */}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 px-4 sm:px-5 py-3 sm:h-16 border-t border-border shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto h-10 sm:h-9 px-4 rounded-md border border-border text-sm hover:bg-muted transition"
          >
            Cancel
          </button>

          <button
            disabled={!canSave}
            onClick={() => onSave(form)}
            className="w-full sm:w-auto h-10 sm:h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? "Save changes" : "Add staff"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INPUT STYLES
   ========================================================= */

const inputCls =
  "w-full h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 disabled:bg-muted disabled:text-muted-foreground";

/* =========================================================
   FORM FIELD
   ========================================================= */

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

