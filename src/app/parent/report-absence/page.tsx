"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  FileWarning,
  Info,
  Paperclip,
  Send,
  Upload,
  X,
} from "lucide-react";
import { ParentShell } from "@/components/layout/ParentShell";
import {
  absenceReasons,
  parentAlerts,
  parentChild,
  type AbsenceReasonId,
} from "@/data/mock/parent";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

export default function ReportAbsencePage() {
  const today = new Date();
  const [reason, setReason] = useState<AbsenceReasonId | "">("");
  const [fromDate, setFromDate] = useState<string>(toISO(today));
  const [toDate, setToDate] = useState<string>(toISO(today));
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const unreadAlerts = parentAlerts.filter((a) => !a.read).length;

  const dayCount = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diff = Math.floor((to.getTime() - from.getTime()) / 86400000) + 1;
    return diff > 0 ? diff : 0;
  }, [fromDate, toDate]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!reason) next.reason = "Please select a reason.";
    if (!fromDate) next.fromDate = "Select a start date.";
    if (!toDate) next.toDate = "Select an end date.";
    if (fromDate && toDate && new Date(toDate) < new Date(fromDate))
      next.toDate = "End date must be after start date.";
    if (notes.trim().length > 0 && notes.trim().length < 5)
      next.notes = "Please provide a slightly longer explanation.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    console.log("ABSENCE REPORTED (mock):", {
      studentId: parentChild.studentId,
      reason,
      fromDate,
      toDate,
      dayCount,
      notes,
      file,
    });
    setSubmitted(true);
  };

  const reset = () => {
    setSubmitted(false);
    setReason("");
    setNotes("");
    setFile(null);
    setErrors({});
    setFromDate(toISO(today));
    setToDate(toISO(today));
  };

  return (
    <ParentShell
      childName={parentChild.name}
      childClass={`${parentChild.grade} · ${parentChild.class}`}
      alertCount={unreadAlerts}
    >
      {submitted ? (
        <SuccessState
          reason={absenceReasons.find((r) => r.id === reason)?.label ?? ""}
          dayCount={dayCount}
          fromDate={fromDate}
          toDate={toDate}
          onReset={reset}
        />
      ) : (
        <>
          <section className="mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
              Report an absence
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Let the school know in advance so attendance is marked correctly.
            </p>
          </section>

          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Main column */}
            <div className="space-y-6">
              {/* Child (read-only) */}
              <Card>
                <CardHeader
                  icon={<FileWarning className="h-4 w-4" />}
                  title="Student"
                  desc="Absence is reported for this student."
                />
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-navy text-white grid place-items-center text-sm font-semibold">
                    {parentChild.name
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p[0]?.toUpperCase())
                      .join("")}
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-medium">{parentChild.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {parentChild.grade} · {parentChild.class} · {parentChild.room}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Reason */}
              <Card>
                <CardHeader
                  icon={<Info className="h-4 w-4" />}
                  title="Reason"
                  desc="Pick the option that best describes the absence."
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  {absenceReasons.map((r) => {
                    const active = reason === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setReason(r.id)}
                        className={`rounded-lg border p-4 text-left transition ${
                          active
                            ? "border-blue bg-blue-light/60 ring-2 ring-blue/30"
                            : "border-border hover:border-blue/40 hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium">{r.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {r.desc}
                            </div>
                          </div>
                          <span
                            className={`mt-0.5 h-4 w-4 rounded-full border-2 transition ${
                              active
                                ? "border-blue bg-blue"
                                : "border-muted-foreground/40"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {errors.reason && (
                  <p className="mt-2 text-xs text-danger">{errors.reason}</p>
                )}
              </Card>

              {/* Dates */}
              <Card>
                <CardHeader
                  icon={<CalendarDays className="h-4 w-4" />}
                  title="Dates"
                  desc="Single-day or multi-day absence."
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="From" error={errors.fromDate}>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="To" error={errors.toDate}>
                    <input
                      type="date"
                      value={toDate}
                      min={fromDate || undefined}
                      onChange={(e) => setToDate(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                  {dayCount === 0
                    ? "Pick a valid date range."
                    : dayCount === 1
                    ? `1 school day will be marked as absent.`
                    : `${dayCount} school days will be marked as absent.`}
                </div>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader
                  icon={<Paperclip className="h-4 w-4" />}
                  title="Additional details (optional)"
                  desc="Anything the office or teacher should know."
                />

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="e.g. Fever since last night, started medication this morning."
                  className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 resize-none"
                />
                {errors.notes && (
                  <p className="mt-1.5 text-xs text-danger">{errors.notes}</p>
                )}

                {/* Upload */}
                <div className="mt-4">
                  <div className="text-xs font-medium text-muted-foreground mb-1.5">
                    Attachment (optional)
                  </div>
                  {file ? (
                    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs">
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="flex-1 truncate">{file}</span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="p-1 rounded hover:bg-muted"
                        aria-label="Remove attachment"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setFile("medical-note.pdf")}
                      className="w-full rounded-md border border-dashed border-border bg-muted/20 px-4 py-4 text-center hover:border-blue/50 hover:bg-blue-light/30 transition"
                    >
                      <Upload className="h-4 w-4 mx-auto text-muted-foreground" />
                      <div className="mt-1 text-xs text-muted-foreground">
                        Click to attach a doctor&apos;s note or photo (mock)
                      </div>
                    </button>
                  )}
                </div>
              </Card>
            </div>

            {/* Side column */}
            <aside className="space-y-4 lg:sticky lg:top-6 h-fit">
              <div className="rounded-lg border border-border bg-surface p-5">
                <h3 className="text-sm font-semibold">Summary</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <Row label="Student" value={parentChild.name} />
                  <Row
                    label="Reason"
                    value={
                      reason
                        ? absenceReasons.find((r) => r.id === reason)!.label
                        : "—"
                    }
                  />
                  <Row
                    label="Dates"
                    value={
                      fromDate && toDate
                        ? fromDate === toDate
                          ? fmtShort(fromDate)
                          : `${fmtShort(fromDate)} → ${fmtShort(toDate)}`
                        : "—"
                    }
                  />
                  <Row
                    label="School days"
                    value={dayCount > 0 ? String(dayCount) : "—"}
                  />
                  <Row label="Attachment" value={file ?? "—"} />
                </dl>

                <button
                  type="submit"
                  className="mt-5 w-full h-10 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition inline-flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Submit report
                </button>
                <p className="mt-2 text-[11px] text-muted-foreground text-center">
                  The office will be notified immediately.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
                <div className="font-medium text-foreground mb-1">
                  When to report
                </div>
                <ul className="space-y-1">
                  <li>• Before 09:00 on the day of absence.</li>
                  <li>• For planned appointments, at least 1 day in advance.</li>
                  <li>• For multi-day illness, update dates when you know more.</li>
                </ul>
              </div>
            </aside>
          </form>
        </>
      )}
    </ParentShell>
  );
}

/* ---------------- sub-components ---------------- */

const inputCls =
  "w-full h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      {children}
    </section>
  );
}

function CardHeader({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-md bg-blue-light text-blue grid place-items-center">
          {icon}
        </span>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {desc && <p className="text-xs text-muted-foreground mt-1.5">{desc}</p>}
    </div>
  );
}

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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs text-muted-foreground shrink-0">{label}</dt>
      <dd className="text-xs text-right truncate">{value}</dd>
    </div>
  );
}

function fmtShort(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
}

function SuccessState({
  reason,
  dayCount,
  fromDate,
  toDate,
  onReset,
}: {
  reason: string;
  dayCount: number;
  fromDate: string;
  toDate: string;
  onReset: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-8 text-center">
      <div className="mx-auto h-14 w-14 rounded-full bg-success-light text-success grid place-items-center">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">Absence reported</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
        The school has been notified. You&apos;ll receive a confirmation once the
        office reviews the report.
      </p>

      <div className="mt-6 max-w-sm mx-auto rounded-md border border-border bg-background text-left divide-y divide-border">
        <SummaryLine label="Reason" value={reason} />
        <SummaryLine
          label="Dates"
          value={
            fromDate === toDate
              ? fmtShort(fromDate)
              : `${fmtShort(fromDate)} → ${fmtShort(toDate)}`
          }
        />
        <SummaryLine label="School days" value={String(dayCount)} />
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        <button
          onClick={onReset}
          className="h-9 px-4 rounded-md border border-border text-sm hover:bg-muted"
        >
          Report another absence
        </button>
      </div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}