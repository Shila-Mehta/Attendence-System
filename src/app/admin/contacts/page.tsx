
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
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
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
  const [rows, setRows] = useState<Contact[]>(seed);
  const [query, setQuery] = useState("");
  const [relFilter, setRelFilter] =
    useState<"all" | Relationship>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Active" | "Inactive"
  >("all");

  const [editing, setEditing] = useState<Contact | null>(null);
  const [creating, setCreating] = useState(false);

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

      const matchesRel =
        relFilter === "all" ||
        r.relationship === relFilter;

      const matchesStatus =
        statusFilter === "all" ||
        r.status === statusFilter;

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

  const toggleStatus = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status:
                r.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : r
      )
    );
  };

  const deleteContact = (id: string) => {
    const contact = rows.find((r) => r.id === id);

    if (!contact) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${contact.name}?`
    );

    if (!confirmed) return;

    setRows((prev) =>
      prev.filter((r) => r.id !== id)
    );
  };

  const handleSave = (contact: Contact) => {
    setRows((prev) => {
      const exists = prev.some(
        (r) => r.id === contact.id
      );

      return exists
        ? prev.map((r) =>
            r.id === contact.id ? contact : r
          )
        : [contact, ...prev];
    });

    setEditing(null);
    setCreating(false);
  };

  return (
    <PageContainer
      title="Contact Management"
      description="Manage the parent or guardian associated with each student."
      actions={
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center justify-center gap-2 h-10 sm:h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </button>
      }
    >
      {/* ================= KPIs ================= */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          label="Total contacts"
          value={stats.total}
        />

        <StatCard
          label="Active"
          value={stats.active}
          tone="success"
        />

        <StatCard
          label="Inactive"
          value={stats.inactive}
          tone="danger"
        />

        <StatCard
          label="Students covered"
          value={stats.students}
        />
      </div>

      {/* ================= Filters ================= */}

      <div className="flex flex-col gap-3 mb-4">
        {/* Search */}

        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search by name, phone, email or student..."
            className="w-full h-10 sm:h-9 rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          />
        </div>

        {/* Select Filters */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-2 sm:gap-3">
          <select
            value={relFilter}
            onChange={(e) =>
              setRelFilter(
                e.target.value as
                  | "all"
                  | Relationship
              )
            }
            className="w-full lg:w-auto h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          >
            <option value="all">
              All relationships
            </option>

            {RELATIONSHIPS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as typeof statusFilter
              )
            }
            className="w-full lg:w-auto h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          >
            <option value="all">
              All statuses
            </option>

            <option value="Active">Active</option>
            <option value="Inactive">
              Inactive
            </option>
          </select>
        </div>
      </div>

      {/* ================= Table ================= */}

      <div className="w-full overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">
                ID
              </th>

              <th className="px-4 py-3 font-medium">
                Contact
              </th>

              <th className="px-4 py-3 font-medium">
                Relationship
              </th>

              <th className="px-4 py-3 font-medium">
                Student
              </th>

              <th className="px-4 py-3 font-medium">
                Reach
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
                  colSpan={7}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  No contacts match your filters.
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

                  {/* Contact */}

                  <td className="px-4 py-3 whitespace-nowrap font-medium">
                    {r.name}
                  </td>

                  {/* Relationship */}

                  <td className="px-4 py-3 whitespace-nowrap">
                    <RelationshipBadge
                      rel={r.relationship}
                    />
                  </td>

                  {/* Student */}

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="leading-tight">
                      <div>{r.studentName}</div>

                      <div className="text-xs text-muted-foreground font-mono">
                        {r.studentId}
                      </div>
                    </div>
                  </td>

                  {/* Reach */}

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

                  {/* Status */}

                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge
                      status={r.status}
                    />
                  </td>

                  {/* Actions */}

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {/* Edit */}

                      <button
                        onClick={() =>
                          setEditing(r)
                        }
                        className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition"
                        title="Edit contact"
                        aria-label={`Edit ${r.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      {/* Activate / Deactivate */}

                      <button
                        onClick={() =>
                          toggleStatus(r.id)
                        }
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

                      {/* Delete */}

                      <button
                        onClick={() =>
                          deleteContact(r.id)
                        }
                        className="p-2 rounded-md hover:bg-danger/10 text-danger transition"
                        title="Delete contact"
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
        Showing {filtered.length} of {rows.length} contacts
      </div>

      {/* ================= Modal ================= */}

      {(creating || editing) && (
        <ContactModal
          contact={editing ?? undefined}
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
   Stat Card
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
    <div className="rounded-lg border border-border bg-surface p-3 sm:p-4 min-w-0">
      <div className="text-xs text-muted-foreground truncate">
        {label}
      </div>

      <div
        className={`mt-1 text-xl sm:text-2xl font-semibold tabular-nums ${toneClass}`}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   Status Badge
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
   Relationship Badge
   ========================================================= */

function RelationshipBadge({
  rel,
}: {
  rel: Relationship;
}) {
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
   Contact Modal
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
      id: `CT${String(
        // eslint-disable-next-line react-hooks/purity
        Math.floor(Math.random() * 900) + 100
      )}`,
      name: "",
      phone: "",
      email: "",
      relationship: "Father",
      studentId: "",
      studentName: "",
      status: "Active",
    }
  );

  const set = <K extends keyof Contact>(
    key: K,
    value: Contact[K]
  ) =>
    setForm((f) => ({
      ...f,
      [key]: value,
    }));

  const canSave =
    form.name.trim() &&
    form.phone.trim() &&
    form.studentId.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Overlay */}

      <div
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}

      <div className="relative w-full max-w-lg max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] rounded-lg bg-surface border border-border shadow-xl flex flex-col my-auto">
        {/* Header */}

        <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-5 h-14 border-b border-border shrink-0 bg-surface">
          <h2 className="text-sm font-semibold">
            {isEdit
              ? "Edit Contact"
              : "Add Contact"}
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
              placeholder="e.g. Imran Khan"
              className={inputCls}
            />
          </Field>

          <Field label="Relationship">
            <select
              value={form.relationship}
              onChange={(e) =>
                set(
                  "relationship",
                  e.target.value as Relationship
                )
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

          <Field label="Phone">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) =>
                set("phone", e.target.value)
              }
              placeholder="+92 300 0000000"
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
              placeholder="name@example.com"
              className={inputCls}
            />
          </Field>

          <Field label="Student ID">
            <input
              value={form.studentId}
              onChange={(e) =>
                set("studentId", e.target.value)
              }
              placeholder="e.g. ST001"
              className={inputCls}
            />
          </Field>

          <Field label="Student name">
            <input
              value={form.studentName}
              onChange={(e) =>
                set("studentName", e.target.value)
              }
              placeholder="e.g. Ayesha Khan"
              className={inputCls}
            />
          </Field>
        </div>

        {/* Footer */}

        <div className="sticky bottom-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 px-4 sm:px-5 py-3 sm:h-16 border-t border-border shrink-0 bg-surface">
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
            {isEdit
              ? "Save changes"
              : "Add contact"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Input
   ========================================================= */

const inputCls =
  "w-full h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 disabled:bg-muted disabled:text-muted-foreground";

/* =========================================================
   Field
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


