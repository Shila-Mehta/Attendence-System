"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  LogIn,
  LogOut,
  Plus,
  Search,
  User,
  X,
  ClipboardList,
  Trash2,
  DoorOpen,
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
  frontDeskEntries as seed,
  type FrontDeskEntry,
} from "@/data/mock/office";

type EntryType = FrontDeskEntry["type"];

export default function FrontDeskPage() {
  /* ---------------- Data ---------------- */
  const [entries, setEntries] = useState<FrontDeskEntry[]>(seed);

  /* ---------------- Async state slots (Phase 10) ---------------- */
  const [loading] = useState(false);
  const [error] = useState(false);

  /* ---------------- Filters ---------------- */
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | EntryType>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  /* ---------------- Modal state ---------------- */
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<FrontDeskEntry | null>(
    null
  );

  /* ---------------- Toasts ---------------- */
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const pushToast = (tone: ToastTone, title: string, description?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, tone, title, description }]);
  };
  const dismissToast = (id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  /* ---------------- Counts ---------------- */
  const counts = useMemo(() => {
    const today = "2026-09-12";
    return {
      total: entries.length,
      late: entries.filter((e) => e.type === "Late Arrival").length,
      early: entries.filter((e) => e.type === "Early Collection").length,
      today: entries.filter((e) => e.date === today).length,
    };
  }, [entries]);

  /* ---------------- Filtered ---------------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries
      .filter((e) => {
        const matchesQuery =
          !q ||
          e.studentName.toLowerCase().includes(q) ||
          e.studentId.toLowerCase().includes(q) ||
          e.personName.toLowerCase().includes(q) ||
          e.reason.toLowerCase().includes(q);
        const matchesType = typeFilter === "all" || e.type === typeFilter;
        const matchesDate = !dateFilter || e.date === dateFilter;
        return matchesQuery && matchesType && matchesDate;
      })
      .sort((a, b) =>
        `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)
      );
  }, [entries, query, typeFilter, dateFilter]);

  const hasFilters =
    query.trim().length > 0 || typeFilter !== "all" || Boolean(dateFilter);

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setDateFilter("");
  };

  /* ---------------- Actions ---------------- */
  const handleSave = (entry: FrontDeskEntry) => {
    setEntries((prev) => [entry, ...prev]);
    setCreating(false);
    pushToast(
      "success",
      "Entry logged",
      `${entry.type} for ${entry.studentName} at ${entry.time}.`
    );
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const removed = pendingDelete;
    setEntries((prev) => prev.filter((e) => e.id !== removed.id));
    setPendingDelete(null);
    pushToast(
      "success",
      "Entry removed",
      `${removed.type} for ${removed.studentName} has been deleted.`
    );
  };

  return (
    <PageContainer
      title="Front-Desk Log"
      description="Record late arrivals and early collections."
      actions={
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center justify-center gap-2 h-10 sm:h-9 px-3 sm:px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          New Entry
        </button>
      }
    >
      {/* ================= LOADING (Phase 10) ================= */}
      {loading ? (
        <div className="rounded-lg border border-border bg-surface">
          <LoadingState
            title="Loading front-desk log…"
            description="Fetching entries from the server."
          />
        </div>
      ) : error ? (
        /* ================= ERROR (Phase 10) ================= */
        <div className="rounded-lg border border-border bg-surface">
          <ErrorState
            title="Couldn't load the log"
            description="The server didn't respond. Check your connection and try again."
            onRetry={() => window.location.reload()}
          />
        </div>
      ) : (
        <>
          {/* ================= KPIs ================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <StatCard
              icon={<ClipboardList className="h-4 w-4" />}
              label="Total entries"
              value={counts.total}
              tone="default"
            />
            <StatCard
              icon={<LogIn className="h-4 w-4" />}
              label="Late arrivals"
              value={counts.late}
              tone="warning"
            />
            <StatCard
              icon={<LogOut className="h-4 w-4" />}
              label="Early collections"
              value={counts.early}
              tone="danger"
            />
            <StatCard
              icon={<CalendarDays className="h-4 w-4" />}
              label="Today"
              value={counts.today}
              tone="blue"
            />
          </div>

          {/* ================= FILTERS ================= */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-4">
            <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by student, ID, person or reason…"
                className="w-full h-10 sm:h-9 rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
              />
            </div>

            <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as "all" | EntryType)
                }
                className="h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
              >
                <option value="all">All types</option>
                <option value="Late Arrival">Late Arrival</option>
                <option value="Early Collection">Early Collection</option>
              </select>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full h-10 sm:h-9 pl-9 pr-3 rounded-md border border-input bg-surface text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                />
              </div>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="h-10 sm:h-9 px-3 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* ================= EMPTY ================= */}
          {filtered.length === 0 && (
            <div className="rounded-lg border border-border bg-surface">
              {entries.length === 0 ? (
                <EmptyState
                  icon={<DoorOpen className="h-5 w-5" />}
                  title="No entries yet"
                  description="Log your first late arrival or early collection to get started."
                  action={
                    <button
                      onClick={() => setCreating(true)}
                      className="h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      New Entry
                    </button>
                  }
                />
              ) : (
                <EmptyState
                  icon={<ClipboardList className="h-5 w-5" />}
                  title="No entries match your filters"
                  description="Try adjusting your search or clearing the filters."
                  action={
                    <button
                      onClick={clearFilters}
                      className="h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted transition"
                    >
                      Clear filters
                    </button>
                  }
                />
              )}
            </div>
          )}

          {/* ================= MOBILE: cards ================= */}
          {filtered.length > 0 && (
            <div className="md:hidden space-y-3">
              {filtered.map((e) => (
                <article
                  key={e.id}
                  className="rounded-lg border border-border bg-surface overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 p-4">
                    <span
                      className={`h-10 w-10 rounded-lg border grid place-items-center shrink-0 ${
                        e.type === "Late Arrival"
                          ? "bg-warning-light text-warning border-warning/20"
                          : "bg-danger-light text-danger border-danger/20"
                      }`}
                    >
                      {e.type === "Late Arrival" ? (
                        <LogIn className="h-4 w-4" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {e.studentName}
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            {e.studentId} · {e.grade} · {e.className}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <TypeBadge type={e.type} />
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="px-4 pb-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span className="tabular-nums">
                        {fmtDate(e.date)} · {e.time}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <User className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span className="truncate">
                        {e.personName}{" "}
                        <span className="text-muted-foreground/70">
                          · {e.personRelation}
                        </span>
                      </span>
                    </div>
                    <div className="text-muted-foreground truncate">
                      {e.reason}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 border-t border-border">
                    <div className="h-11 flex items-center px-4 text-[11px] text-muted-foreground border-r border-border">
                      Logged by {e.loggedBy}
                    </div>
                    <button
                      onClick={() => setPendingDelete(e)}
                      className="h-11 flex items-center justify-center gap-1.5 text-xs font-medium text-danger hover:bg-danger-light transition"
                      aria-label={`Delete ${e.id}`}
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
              <table className="w-full text-sm min-w-[980px]">
                <thead>
                  <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Date & time</th>
                    <th className="px-4 py-3 font-medium">Reason</th>
                    <th className="px-4 py-3 font-medium">Person</th>
                    <th className="px-4 py-3 font-medium">Logged by</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr
                      key={e.id}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                        {e.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="leading-tight">
                          <div className="font-medium">{e.studentName}</div>
                          <div className="text-xs text-muted-foreground">
                            {e.grade} · {e.className}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <TypeBadge type={e.type} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="leading-tight">
                          <div>{fmtDate(e.date)}</div>
                          <div className="text-xs text-muted-foreground inline-flex items-center gap-1 tabular-nums">
                            <Clock className="h-3 w-3" />
                            {e.time}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground max-w-[200px] truncate">
                        {e.reason}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="leading-tight">
                          <div>{e.personName}</div>
                          <div className="text-xs text-muted-foreground">
                            {e.personRelation}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                        {e.loggedBy}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => setPendingDelete(e)}
                          className="p-2 rounded-md text-muted-foreground hover:bg-danger-light hover:text-danger transition-colors inline-flex items-center justify-center shrink-0"
                          title="Delete entry"
                          aria-label={`Delete entry for ${e.studentName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-3 text-xs text-muted-foreground">
              Showing {filtered.length} of {entries.length} entries
            </div>
          )}

          {/* ================= NEW ENTRY MODAL ================= */}
          {creating && (
            <NewEntryModal
              onClose={() => setCreating(false)}
              onSave={handleSave}
            />
          )}

          {/* ================= CONFIRM DELETE ================= */}
          <ConfirmDialog
            open={pendingDelete !== null}
            title="Delete this entry?"
            message={
              <>
                <span className="font-medium text-foreground">
                  {pendingDelete?.studentName}
                </span>{" "}
                · {pendingDelete?.type} on {pendingDelete?.date} at{" "}
                {pendingDelete?.time} will be removed. This action cannot be
                undone.
              </>
            }
            confirmLabel="Delete entry"
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
   Sub-components
   ========================================================= */

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "default" | "warning" | "danger" | "blue";
}) {
  const cls =
    tone === "warning"
      ? "text-warning"
      : tone === "danger"
      ? "text-danger"
      : tone === "blue"
      ? "text-blue"
      : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-surface p-3 sm:p-4 min-w-0">
      <div className={`flex items-center gap-1.5 text-xs ${cls}`}>
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div
        className={`mt-1 text-2xl sm:text-3xl font-semibold tabular-nums ${cls}`}
      >
        {value}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: EntryType }) {
  if (type === "Late Arrival") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-light text-warning border border-warning/20 whitespace-nowrap">
        <LogIn className="h-3 w-3" />
        Late Arrival
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-light text-danger border border-danger/20 whitespace-nowrap">
      <LogOut className="h-3 w-3" />
      Early Collection
    </span>
  );
}

/* =========================================================
   New entry modal
   ========================================================= */

const REASON_PRESETS = {
  "Late Arrival": [
    "Bus delayed",
    "Traffic",
    "Doctor's appointment",
    "Family matter",
    "Other",
  ],
  "Early Collection": [
    "Doctor's appointment",
    "Dentist",
    "Family emergency",
    "Medical leave",
    "Other",
  ],
};

const RELATIONS = [
  "Father",
  "Mother",
  "Guardian",
  "Sibling",
  "Transport",
  "Other",
];

function NewEntryModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (entry: FrontDeskEntry) => void;
}) {
  const today = "2026-09-12";
  const now = new Date();
  const timeNow = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  const [type, setType] = useState<EntryType>("Late Arrival");
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [grade, setGrade] = useState("Grade 5");
  const [className, setClassName] = useState("Class A");
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(timeNow);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [personName, setPersonName] = useState("");
  const [personRelation, setPersonRelation] = useState("Father");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const finalReason = reason === "Other" ? customReason : reason;

  const validate = () => {
    const next: Record<string, string> = {};
    if (!studentName.trim()) next.studentName = "Student name is required.";
    if (!studentId.trim()) next.studentId = "Student ID is required.";
    if (!date) next.date = "Date is required.";
    if (!time) next.time = "Time is required.";
    if (!finalReason.trim()) next.reason = "Please choose or enter a reason.";
    if (!personName.trim()) next.personName = "Person name is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const id = `FD${String(Math.floor(Math.random() * 900) + 100)}`;
    onSave({
      id,
      studentId: studentId.trim(),
      studentName: studentName.trim(),
      grade,
      className,
      type,
      time,
      date,
      reason: finalReason.trim(),
      personName: personName.trim(),
      personRelation,
      loggedBy: "Junaid Akhtar",
    });
  };

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
          <h2 className="text-sm font-semibold">New Front-Desk Entry</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto">
          {/* Type toggle */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1.5">
              Entry type
            </div>
            <div className="grid grid-cols-2 gap-2">
              <TypeToggle
                active={type === "Late Arrival"}
                onClick={() => setType("Late Arrival")}
                icon={<LogIn className="h-4 w-4" />}
                label="Late Arrival"
                tone="warning"
              />
              <TypeToggle
                active={type === "Early Collection"}
                onClick={() => setType("Early Collection")}
                icon={<LogOut className="h-4 w-4" />}
                label="Early Collection"
                tone="danger"
              />
            </div>
          </div>

          {/* Student */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Student name" error={errors.studentName}>
              <input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Daniyal Iqbal"
                className={inputCls}
              />
            </Field>
            <Field label="Student ID" error={errors.studentId}>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. ST012"
                className={inputCls}
              />
            </Field>
            <Field label="Grade">
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className={inputCls}
              >
                {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"].map(
                  (g) => (
                    <option key={g}>{g}</option>
                  )
                )}
              </select>
            </Field>
            <Field label="Class">
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className={inputCls}
              >
                {["Class A", "Class B", "Class C"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Date" error={errors.date}>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Time" error={errors.time}>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          {/* Reason */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1.5">
              Reason
            </div>
            <div className="flex flex-wrap gap-1.5">
              {REASON_PRESETS[type].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`h-8 px-3 rounded-md border text-xs transition ${
                    reason === r
                      ? "border-blue bg-blue-light text-blue"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {reason === "Other" && (
              <input
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describe the reason…"
                className={`${inputCls} mt-2`}
              />
            )}
            {errors.reason && (
              <p className="mt-1.5 text-xs text-danger">{errors.reason}</p>
            )}
          </div>

          {/* Person */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={
                type === "Late Arrival" ? "Dropped off by" : "Collected by"
              }
              error={errors.personName}
            >
              <input
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="e.g. Sajid Raza"
                className={inputCls}
              />
            </Field>
            <Field label="Relation">
              <select
                value={personRelation}
                onChange={(e) => setPersonRelation(e.target.value)}
                className={inputCls}
              >
                {RELATIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Notice */}
          <div className="flex items-start gap-2.5 rounded-md border border-border bg-muted/30 px-3 py-3 text-xs text-muted-foreground">
            <User className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="leading-relaxed">
              Logged against your account as{" "}
              <span className="text-foreground font-medium">Junaid Akhtar</span>
              . Parents of early collections are notified automatically.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center sm:justify-end gap-2.5 px-4 sm:px-5 py-3 sm:py-0 sm:h-16 border-t border-border shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto h-11 sm:h-9 px-4 rounded-md border border-border text-sm hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto h-11 sm:h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition"
          >
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
}

function TypeToggle({
  active,
  onClick,
  icon,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tone: "warning" | "danger";
}) {
  const activeCls =
    tone === "warning"
      ? "border-warning bg-warning-light text-warning"
      : "border-danger bg-danger-light text-danger";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-12 rounded-md border text-sm font-medium transition flex items-center justify-center gap-2 ${
        active ? activeCls : "border-border text-muted-foreground hover:bg-muted"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.split(" ")[0]}</span>
    </button>
  );
}

/* =========================================================
   Form primitives
   ========================================================= */

const inputCls =
  "w-full h-11 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 disabled:bg-muted disabled:text-muted-foreground";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label}
      </span>
      {children}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </label>
  );
}