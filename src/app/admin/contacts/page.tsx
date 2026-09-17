"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Phone,
  Mail,
  UserX,
  UserCheck,
  Trash2,
  X,
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
  contacts as seed,
  type Contact,
  type Relationship,
} from "@/data/mock/contacts";

const RELATIONSHIPS: Relationship[] = [
  "Father",
  "Mother",
  "Guardian",
  "Emergency",
];

export default function ContactsPage() {
  /* ---------------- Data ---------------- */
  const [rows, setRows] = useState<Contact[]>(seed);

  /* ---------------- Async state slots (Phase 10) ---------------- */
  const [loading] = useState(false);
  const [error] = useState(false);

  /* ---------------- Filters ---------------- */
  const [query, setQuery] = useState("");
  const [relFilter, setRelFilter] = useState<"all" | Relationship>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Active" | "Inactive"
  >("all");

  /* ---------------- Modal state ---------------- */
  const [editing, setEditing] = useState<Contact | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Contact | null>(null);

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
        r.phone.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q) ||
        r.studentId.toLowerCase().includes(q);
      const matchesRel = relFilter === "all" || r.relationship === relFilter;
      const matchesStatus =
        statusFilter === "all" || r.status === statusFilter;
      return matchesQuery && matchesRel && matchesStatus;
    });
  }, [rows, query, relFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((r) => r.status === "Active").length,
      inactive: rows.filter((r) => r.status === "Inactive").length,
      students: new Set(rows.map((r) => r.studentId)).size,
    }),
    [rows]
  );

  const hasFilters =
    query.trim().length > 0 ||
    relFilter !== "all" ||
    statusFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setRelFilter("all");
    setStatusFilter("all");
  };

  /* ---------------- Actions ---------------- */
  const toggleStatus = (contact: Contact) => {
    const next = contact.status === "Active" ? "Inactive" : "Active";
    setRows((prev) =>
      prev.map((r) => (r.id === contact.id ? { ...r, status: next } : r))
    );
    pushToast(
      next === "Active" ? "success" : "info",
      next === "Active" ? "Contact activated" : "Contact deactivated",
      `${contact.name} is now ${next.toLowerCase()}.`
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
      "Contact removed",
      `${removed.name} has been removed from the directory.`
    );
  };

  const handleSave = (contact: Contact, isEdit: boolean) => {
    setRows((prev) => {
      const exists = prev.some((r) => r.id === contact.id);
      return exists
        ? prev.map((r) => (r.id === contact.id ? contact : r))
        : [contact, ...prev];
    });
    setEditing(null);
    setCreating(false);
    pushToast(
      "success",
      isEdit ? "Contact updated" : "Contact added",
      isEdit
        ? `${contact.name}'s details were saved.`
        : `${contact.name} has been added to the directory.`
    );
  };

  return (
    <PageContainer
      title="Contact Management"
      description="Manage the parent or guardian associated with each student."
      actions={
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center justify-center gap-2 h-10 sm:h-9 px-3 sm:px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </button>
      }
    >
      {/* ================= LOADING (Phase 10) ================= */}
      {loading ? (
        <div className="rounded-lg border border-border bg-surface">
          <LoadingState
            title="Loading contacts…"
            description="Fetching the directory from the server."
          />
        </div>
      ) : error ? (
        /* ================= ERROR (Phase 10) ================= */
        <div className="rounded-lg border border-border bg-surface">
          <ErrorState
            title="Couldn't load contacts"
            description="The server didn't respond. Check your connection and try again."
            onRetry={() => window.location.reload()}
          />
        </div>
      ) : (
        <>
          {/* ================= KPIs ================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <StatCard label="Total Contacts" value={stats.total} />
            <StatCard label="Active" value={stats.active} tone="success" />
            <StatCard
              label="Inactive"
              value={stats.inactive}
              tone="muted"
            />
            <StatCard label="Students Covered" value={stats.students} />
          </div>

          {/* ================= FILTERS ================= */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 mb-4">
            <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, phone, email or student…"
                className="w-full h-10 sm:h-9 rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
              />
            </div>

            <select
              value={relFilter}
              onChange={(e) =>
                setRelFilter(e.target.value as "all" | Relationship)
              }
              className="w-full sm:w-auto h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
            >
              <option value="all">All relationships</option>
              {RELATIONSHIPS.map((r) => (
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

          {/* ================= EMPTY ================= */}
          {filtered.length === 0 && (
            <div className="rounded-lg border border-border bg-surface">
              {rows.length === 0 ? (
                <EmptyState
                  icon={<UserPlus className="h-5 w-5" />}
                  title="No contacts yet"
                  description="Add your first parent or guardian to get started."
                  action={
                    <button
                      onClick={() => setCreating(true)}
                      className="h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Contact
                    </button>
                  }
                />
              ) : (
                <EmptyState
                  icon={<Users className="h-5 w-5" />}
                  title="No contacts match your filters"
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
                      <div className="mt-2">
                        <RelationshipBadge rel={r.relationship} />
                      </div>
                    </div>
                  </div>

                  {/* Student + reach */}
                  <div className="px-4 pb-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">
                        {r.studentName}{" "}
                        <span className="text-muted-foreground font-mono">
                          · {r.studentId}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate tabular-nums">{r.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate text-muted-foreground">
                        {r.email}
                      </span>
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
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Relationship</th>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Reach</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Actions
                    </th>
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

                      <td className="px-4 py-3 whitespace-nowrap font-medium">
                        {r.name}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <RelationshipBadge rel={r.relationship} />
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="leading-tight">
                          <div>{r.studentName}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {r.studentId}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1.5 text-foreground tabular-nums">
                            <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                            {r.phone}
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="max-w-[220px] truncate">
                              {r.email}
                            </span>
                          </div>
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
                            title="Edit contact"
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
                              r.status === "Active"
                                ? "Deactivate contact"
                                : "Activate contact"
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
                            title="Delete contact"
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
              Showing {filtered.length} of {rows.length} contacts
            </div>
          )}

          {/* ================= MODAL ================= */}
          {(creating || editing) && (
            <ContactModal
              contact={editing ?? undefined}
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
            title="Delete contact?"
            message={
              <>
                <span className="font-medium text-foreground">
                  {pendingDelete?.name}
                </span>{" "}
                will be permanently removed from the directory. This action
                cannot be undone.
              </>
            }
            confirmLabel="Delete contact"
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

function RelationshipBadge({ rel }: { rel: Relationship }) {
  const cls =
    rel === "Father"
      ? "bg-blue-light text-blue border border-blue/20"
      : rel === "Mother"
      ? "bg-success-light text-success border border-success/20"
      : rel === "Emergency"
      ? "bg-danger-light text-danger border border-danger/20"
      : "bg-inactive-bg text-inactive border border-inactive-border";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}
    >
      {rel}
    </span>
  );
}

/* =========================================================
   Contact modal
   ========================================================= */

function ContactModal({
  contact,
  onClose,
  onSave,
}: {
  contact?: Contact;
  onClose: () => void;
  onSave: (c: Contact) => void;
}) {
  const isEdit = Boolean(contact);

  const [form, setForm] = useState<Contact>(
    contact ?? {
      // eslint-disable-next-line react-hooks/purity
      id: `CT${String(Math.floor(Math.random() * 900) + 100)}`,
      name: "",
      phone: "",
      email: "",
      relationship: "Father",
      studentId: "",
      studentName: "",
      status: "Active",
    }
  );

  const set = <K extends keyof Contact>(key: K, value: Contact[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canSave =
    form.name.trim() && form.phone.trim() && form.studentId.trim();

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
            {isEdit ? "Edit Contact" : "Add Contact"}
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
          <Field label="Contact ID">
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
              placeholder="e.g. Imran Khan"
              className={inputCls}
            />
          </Field>

          <Field label="Relationship">
            <select
              value={form.relationship}
              onChange={(e) =>
                set("relationship", e.target.value as Relationship)
              }
              className={inputCls}
            >
              {RELATIONSHIPS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
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

          <Field label="Phone">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+92 300 0000000"
              className={inputCls}
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="name@example.com"
              className={inputCls}
            />
          </Field>

          <Field label="Student ID">
            <input
              value={form.studentId}
              onChange={(e) => set("studentId", e.target.value)}
              placeholder="e.g. ST001"
              className={inputCls}
            />
          </Field>

          <Field label="Student name">
            <input
              value={form.studentName}
              onChange={(e) => set("studentName", e.target.value)}
              placeholder="e.g. Ayesha Khan"
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
            {isEdit ? "Save changes" : "Add contact"}
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