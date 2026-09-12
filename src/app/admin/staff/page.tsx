"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  UserX,
  UserCheck,
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

const ROLES: StaffRole[] = ["Admin", "Office", "Principal", "Teacher", "Assistant"];

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
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Inactive">("all");
  const [editing, setEditing] = useState<Staff | null>(null);
  const [creating, setCreating] = useState(false);

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
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [rows, query, roleFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((r) => r.status === "Active").length,
      teachers: rows.filter((r) => r.role === "Teacher" && r.status === "Active").length,
      support: rows.filter(
        (r) => (r.role === "Assistant" || r.role === "Office") && r.status === "Active"
      ).length,
    }),
    [rows]
  );

  const toggleStatus = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === "Active" ? "Inactive" : "Active" }
          : r
      )
    );
  };

  const handleSave = (member: Staff) => {
    setRows((prev) => {
      const exists = prev.some((r) => r.id === member.id);
      return exists
        ? prev.map((r) => (r.id === member.id ? member : r))
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
          className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition"
        >
          <Plus className="h-4 w-4" />
          Add Staff
        </button>
      }
    >
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Total Staff" value={stats.total} />
        <StatCard label="Active" value={stats.active} tone="success" />
        <StatCard label="Teachers" value={stats.teachers} />
        <StatCard label="Support Staff" value={stats.support} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, ID or department…"
            className="w-full h-9 rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "all" | StaffRole)}
          className="h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
        >
          <option value="all">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
        >
          <option value="all">All statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Classes</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No staff match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{r.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-navy text-white grid place-items-center text-xs font-semibold">
                        {initials(r.name)}
                      </div>
                      <span className="font-medium">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <RoleBadge role={r.role} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {r.department}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {r.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {r.phone}
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
                        title={r.status === "Active" ? "Deactivate" : "Activate"}
                      >
                        {r.status === "Active" ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
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

/* ---------------- sub-components ---------------- */

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

function RoleBadge({ role }: { role: StaffRole }) {
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {role}
    </span>
  );
}

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-lg bg-surface border border-border shadow-xl">
        <div className="flex items-center justify-between px-5 h-14 border-b border-border">
          <h2 className="text-sm font-semibold">{isEdit ? "Edit Staff" : "Add Staff"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 grid gap-4 sm:grid-cols-2">
          <Field label="Staff ID">
            <input value={form.id} onChange={(e) => set("id", e.target.value)} disabled={isEdit} className={inputCls} />
          </Field>
          <Field label="Full name">
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Fatima Iqbal" className={inputCls} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@school.edu" className={inputCls} />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+92 300 0000000" className={inputCls} />
          </Field>
          <Field label="Role">
            <select
              value={form.role}
              onChange={(e) => set("role", e.target.value as StaffRole)}
              className={inputCls}
            >
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Department">
            <select
              value={form.department}
              onChange={(e) => set("department", e.target.value)}
              className={inputCls}
            >
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
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
              onChange={(e) => set("status", e.target.value as "Active" | "Inactive")}
              className={inputCls}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
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
            {isEdit ? "Save changes" : "Add staff"}
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