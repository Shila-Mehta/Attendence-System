"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Unlock,
  LogOut,
  StickyNote,
  Save,
  RotateCcw,
  Users,
  AlertTriangle,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  reviewSubmission as seed,
  type ReviewRow,
  type ReviewStatus,
  type LeftEarlyReason,
} from "@/data/mock/review";

const LEFT_EARLY_REASONS: LeftEarlyReason[] = [
  "Medical",
  "Family",
  "Appointment",
  "Other",
];

export default function ReviewPage() {
  const [rows, setRows] = useState<ReviewRow[]>(seed.rows);
  const [locked, setLocked] = useState(seed.locked);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [leftEarlyFor, setLeftEarlyFor] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let leftEarly = 0;
    for (const r of rows) {
      if (r.status === "Present") present++;
      else if (r.status === "Absent") absent++;
      else if (r.status === "Late") late++;
      if (r.leftEarly) leftEarly++;
    }
    return { present, absent, late, leftEarly, total: rows.length };
  }, [rows]);

  const update = (studentId: string, patch: Partial<ReviewRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, ...patch } : r))
    );
    setDirty(true);
    setJustSaved(false);
  };

  const handleSave = () => {
    setDirty(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2200);
  };

  const handleDiscard = () => {
    setRows(seed.rows);
    setDirty(false);
    setEditingNote(null);
    setLeftEarlyFor(null);
  };

  const toggleLock = () => {
    if (locked) {
      setLocked(false);
    } else {
      if (dirty) {
        handleSave();
      }
      setLocked(true);
    }
  };

  return (
    <PageContainer
      title="Post-Submit Review"
      description="Review submitted attendance and manage late / left-early actions."
      actions={
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {dirty && (
            <>
              <button
                onClick={handleDiscard}
                className="h-10 sm:h-9 px-3 rounded-md border border-border text-sm font-medium sm:font-normal hover:bg-muted inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-none transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Discard
              </button>
              <button
                onClick={handleSave}
                className="h-10 sm:h-9 px-3 rounded-md border border-border text-sm font-medium sm:font-normal hover:bg-muted inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-none transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                Save
              </button>
            </>
          )}
          <button
            onClick={toggleLock}
            className={`h-10 sm:h-9 px-4 rounded-md text-sm font-medium transition inline-flex items-center justify-center gap-1.5 w-full sm:w-auto ${
              locked
                ? "border border-border hover:bg-muted"
                : "bg-blue text-white hover:bg-navy"
            }`}
          >
            {locked ? (
              <>
                <Unlock className="h-3.5 w-3.5" />
                Unlock
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" />
                Finalise
              </>
            )}
          </button>
        </div>
      }
    >
      {/* Banners */}
      {justSaved && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-success/30 bg-success-light text-success px-4 py-2.5 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Changes saved. (Mock)
        </div>
      )}

      {locked && (
        <div className="mb-4 flex items-start gap-3 rounded-md border border-success/30 bg-success-light text-success px-4 py-3 text-sm">
          <Lock className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <div className="font-medium">Attendance finalised.</div>
            <div className="text-xs mt-0.5">
              Records are locked. Unlock to make further corrections — the Office
              may need to be notified.
            </div>
          </div>
        </div>
      )}

      {/* Submission card */}
      <div className="rounded-lg border border-border bg-surface mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="h-9 w-9 rounded-lg bg-blue-light text-blue border border-blue/20 grid place-items-center shrink-0">
              <Users className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground truncate">
                {seed.grade} · {seed.className} · {seed.room}
              </div>
              <div className="text-sm font-medium truncate">
                Submitted by {seed.submittedBy} at {seed.submittedAt}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-mono self-start sm:self-auto">
            {seed.id}
          </div>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
          <Counter
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Present"
            value={counts.present}
            tone="success"
          />
          <Counter
            icon={<XCircle className="h-4 w-4" />}
            label="Absent"
            value={counts.absent}
            tone="danger"
          />
          <Counter
            icon={<Clock className="h-4 w-4" />}
            label="Late"
            value={counts.late}
            tone="warning"
          />
          <Counter
            icon={<LogOut className="h-4 w-4" />}
            label="Left early"
            value={counts.leftEarly}
            tone="muted"
          />
        </div>
      </div>

      {/* Attendance table */}
      <div className="overflow-x-auto overflow-y-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm min-w-[750px]">
          <thead>
            <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Late / Left early</th>
              <th className="px-4 py-3 font-medium">Note</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.studentId} className="border-t border-border align-top">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-navy text-white grid place-items-center text-xs font-semibold shrink-0">
                      {initials(r.name)}
                    </div>
                    <div className="leading-tight min-w-0">
                      <div className="font-medium truncate">{r.name}</div>
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        {r.studentId}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusPill status={r.status} />
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="space-y-1 text-xs">
                    {r.status === "Late" && r.arrivalTime && (
                      <div className="inline-flex items-center gap-1.5 text-warning">
                        <Clock className="h-3 w-3 shrink-0" />
                        Arrived {r.arrivalTime}
                      </div>
                    )}
                    {r.leftEarly && r.leftEarlyTime && (
                      <div className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <LogOut className="h-3 w-3 shrink-0" />
                        Left {r.leftEarlyTime}
                        {r.leftEarlyReason && (
                          <span className="text-muted-foreground truncate max-w-[120px]">
                            · {r.leftEarlyReason}
                          </span>
                        )}
                      </div>
                    )}
                    {r.status !== "Late" && !r.leftEarly && (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3 max-w-[200px]">
                  {editingNote === r.studentId ? (
                    <NoteEditor
                      initial={r.note ?? ""}
                      onCancel={() => setEditingNote(null)}
                      onSave={(note) => {
                        update(r.studentId, { note: note.trim() || undefined });
                        setEditingNote(null);
                      }}
                    />
                  ) : r.note ? (
                    <button
                      onClick={() => setEditingNote(r.studentId)}
                      className="text-xs text-left text-foreground hover:underline line-clamp-2"
                    >
                      {r.note}
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingNote(r.studentId)}
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 whitespace-nowrap"
                    >
                      <StickyNote className="h-3 w-3 shrink-0" />
                      Add note
                    </button>
                  )}
                </td>

                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <ActionButton
                      label="Present"
                      tone="success"
                      active={r.status === "Present"}
                      onClick={() =>
                        update(r.studentId, {
                          status: "Present",
                          arrivalTime: undefined,
                        })
                      }
                    />
                    <ActionButton
                      label="Absent"
                      tone="danger"
                      active={r.status === "Absent"}
                      onClick={() =>
                        update(r.studentId, {
                          status: "Absent",
                          arrivalTime: undefined,
                          leftEarly: false,
                          leftEarlyTime: undefined,
                          leftEarlyReason: undefined,
                        })
                      }
                    />
                    <ActionButton
                      label="Late"
                      tone="warning"
                      active={r.status === "Late"}
                      onClick={() =>
                        update(r.studentId, {
                          status: "Late",
                          arrivalTime: r.arrivalTime ?? "09:00",
                        })
                      }
                    />
                    <button
                      onClick={() => setLeftEarlyFor(r.studentId)}
                      className={`ml-1 h-8 px-2 rounded-md border text-xs inline-flex items-center gap-1 shrink-0 transition-colors ${
                        r.leftEarly
                          ? "border-muted-foreground/40 bg-muted text-foreground"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                      title={r.leftEarly ? "Edit left-early" : "Mark left-early"}
                    >
                      <LogOut className="h-3 w-3" />
                      <span className="hidden sm:inline">Left early</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer hint */}
      <div className="mt-3 text-xs text-muted-foreground">
        {counts.total} students · {counts.absent} absence
        {counts.absent === 1 ? "" : "s"} need follow-up by the Office.
      </div>

      {/* Left-early modal */}
      {leftEarlyFor && (
        <LeftEarlyModal
          studentName={rows.find((r) => r.studentId === leftEarlyFor)!.name}
          initial={rows.find((r) => r.studentId === leftEarlyFor)!}
          onClose={() => setLeftEarlyFor(null)}
          onSave={(patch) => {
            update(leftEarlyFor, patch);
            setLeftEarlyFor(null);
          }}
          onRemove={() => {
            update(leftEarlyFor, {
              leftEarly: false,
              leftEarlyTime: undefined,
              leftEarlyReason: undefined,
            });
            setLeftEarlyFor(null);
          }}
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

function Counter({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "success" | "danger" | "warning" | "muted";
}) {
  const cls =
    tone === "success"
      ? "text-success"
      : tone === "danger"
      ? "text-danger"
      : tone === "warning"
      ? "text-warning"
      : "text-muted-foreground";

  return (
    <div className="px-4 py-3">
      <div className={`flex items-center gap-1.5 text-xs ${cls}`}>
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className={`mt-1 text-xl font-semibold ${cls} tabular-nums`}>
        {value}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ReviewStatus }) {
  const cls =
    status === "Present"
      ? "bg-success-light text-success"
      : status === "Absent"
      ? "bg-danger-light text-danger"
      : "bg-warning-light text-warning";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}>
      {status}
    </span>
  );
}

function ActionButton({
  label,
  tone,
  active,
  onClick,
}: {
  label: string;
  tone: "success" | "danger" | "warning";
  active: boolean;
  onClick: () => void;
}) {
  const activeCls =
    tone === "success"
      ? "bg-success text-white border-success"
      : tone === "danger"
      ? "bg-danger text-white border-danger"
      : "bg-warning text-white border-warning";

  const hoverCls =
    tone === "success"
      ? "hover:bg-success-light hover:text-success"
      : tone === "danger"
      ? "hover:bg-danger-light hover:text-danger"
      : "hover:bg-warning-light hover:text-warning";

  return (
    <button
      onClick={onClick}
      className={`h-8 px-2.5 rounded-md border text-xs font-medium transition shrink-0 ${
        active ? activeCls : `border-border text-muted-foreground ${hoverCls}`
      }`}
    >
      {label}
    </button>
  );
}

function NoteEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <div className="space-y-1.5 min-w-[160px]">
      <textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
        className="w-full rounded-md border border-input bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 resize-none"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSave(value)}
          className="h-7 px-2 rounded-md bg-blue text-white text-xs font-medium hover:bg-navy"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="h-7 px-2 rounded-md border border-border text-xs hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function LeftEarlyModal({
  studentName,
  initial,
  onClose,
  onSave,
  onRemove,
}: {
  studentName: string;
  initial: ReviewRow;
  onClose: () => void;
  onSave: (patch: Partial<ReviewRow>) => void;
  onRemove: () => void;
}) {
  const [time, setTime] = useState(initial.leftEarlyTime ?? "13:00");
  const [reason, setReason] = useState<LeftEarlyReason | "">(
    initial.leftEarlyReason ?? ""
  );

  const canSave = Boolean(time) && Boolean(reason);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-xl bg-surface border border-border shadow-xl max-h-[95dvh] flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-5 h-14 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold">Mark left early</h2>
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground p-1.5 rounded-md"
          >
            Close
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          <div className="text-sm text-muted-foreground truncate">
            Student: <span className="text-foreground font-medium">{studentName}</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Time left
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-10 sm:h-9 w-full rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as LeftEarlyReason | "")}
              className="h-10 sm:h-9 w-full rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
            >
              <option value="">Select a reason…</option>
              {LEFT_EARLY_REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-start gap-2.5 rounded-md border border-warning/30 bg-warning-light text-warning px-3 py-2.5 text-xs">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="leading-relaxed">
              Parent will be notified about early collection.
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center sm:justify-between gap-2 px-4 sm:px-5 py-3 sm:py-0 sm:h-16 border-t border-border shrink-0">
          {initial.leftEarly ? (
            <button
              onClick={onRemove}
              className="w-full sm:w-auto h-10 sm:h-9 px-3 rounded-md text-sm text-danger hover:bg-danger-light transition"
            >
              Remove
            </button>
          ) : (
            <span className="hidden sm:inline" />
          )}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto h-10 sm:h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              disabled={!canSave}
              onClick={() =>
                onSave({
                  leftEarly: true,
                  leftEarlyTime: time,
                  leftEarlyReason: reason as LeftEarlyReason,
                })
              }
              className="w-full sm:w-auto h-10 sm:h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}