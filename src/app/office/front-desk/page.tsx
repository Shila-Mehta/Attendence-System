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
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  frontDeskEntries as seed,
  type FrontDeskEntry,
} from "@/data/mock/office";

type EntryType = FrontDeskEntry["type"];

export default function FrontDeskPage() {
  const [entries, setEntries] = useState<FrontDeskEntry[]>(seed);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | EntryType>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [creating, setCreating] = useState(false);

  const counts = useMemo(() => {
    const today = "2026-09-12";
    return {
      total: entries.length,
      late: entries.filter((e) => e.type === "Late Arrival").length,
      early: entries.filter((e) => e.type === "Early Collection").length,
      today: entries.filter((e) => e.date === today).length,
    };
  }, [entries]);

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

  const handleSave = (entry: FrontDeskEntry) => {
    setEntries((prev) => [entry, ...prev]);
    setCreating(false);
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <PageContainer
      title="Front-Desk Log"
      description="Record late arrivals and early collections."
      actions={
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          New entry
        </button>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-4">
        <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by student, ID, person or reason…"
            className="w-full h-9 rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | EntryType)}
            className="flex-1 sm:flex-none h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          >
            <option value="all">All types</option>
            <option value="Late Arrival">Late Arrival</option>
            <option value="Early Collection">Early Collection</option>
          </select>

          <div className="relative flex-1 sm:flex-none">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-surface text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>

        {(query || typeFilter !== "all" || dateFilter) && (
          <button
            onClick={() => {
              setQuery("");
              setTypeFilter("all");
              setDateFilter("");
            }}
            className="h-9 px-3 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted w-full sm:w-auto text-left sm:text-center"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Date & time</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Person</th>
              <th className="px-4 py-3 font-medium">Logged by</th>
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
                  No entries match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
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
                      <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
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
                      onClick={() => handleDelete(e.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:bg-danger-light hover:text-danger transition-colors inline-flex items-center justify-center shrink-0"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Showing {filtered.length} of {entries.length} entries
      </div>

      {creating && (
        <NewEntryModal
          onClose={() => setCreating(false)}
          onSave={handleSave}
        />
      )}
    </PageContainer>
  );
}

/* ---------------- sub-components ---------------- */

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
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className={`flex items-center gap-1.5 text-xs ${cls}`}>
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</div>
    </div>
  );
}

function TypeBadge({ type }: { type: EntryType }) {
  if (type === "Late Arrival") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning-light text-warning">
        <LogIn className="h-3 w-3" />
        Late Arrival
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-danger-light text-danger">
      <LogOut className="h-3 w-3" />
      Early Collection
    </span>
  );
}

/* ---------------- modal ---------------- */

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

const RELATIONS = ["Father", "Mother", "Guardian", "Sibling", "Transport", "Other"];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-xl bg-surface border border-border shadow-xl max-h-[95dvh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 h-14 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold">New front-desk entry</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted"
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
                {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"].map((g) => (
                  <option key={g}>{g}</option>
                ))}
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
                type === "Late Arrival"
                  ? "Dropped off by"
                  : "Collected by"
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
              <span className="text-foreground font-medium">Junaid Akhtar</span>.
              Parents of early collections are notified automatically.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center sm:justify-end gap-2.5 px-4 sm:px-5 py-3 sm:py-0 sm:h-16 border-t border-border shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto h-10 sm:h-9 px-4 rounded-md border border-border text-sm font-medium sm:font-normal hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto h-10 sm:h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition"
          >
            Save entry
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
        active
          ? activeCls
          : "border-border text-muted-foreground hover:bg-muted"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.split(" ")[0]}</span>
    </button>
  );
}

const inputCls =
  "w-full h-10 sm:h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20";

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
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label}
      </span>
      {children}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </label>
  );
}