"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Sun,
  BookOpen,
  CalendarX2,
  Trash2,
} from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  ToastContainer,
  type ToastMessage,
  type ToastTone,
} from "@/components/ui/Toast";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  overrides as seed,
  type DayOverride,
  type DayType,
} from "@/data/mock/calendar";

/* ---------------- date helpers ---------------- */

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtLong(d: Date) {
  return `${DOW[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/* ---------------- page ---------------- */

export default function CalendarPage() {
  const today = new Date();

  /* ---------------- Data ---------------- */
  const [cursor, setCursor] = useState(new Date(2026, 8, 1));
  const [overrides, setOverrides] = useState<DayOverride[]>(seed);

  /* ---------------- Async state slots (Phase 10) ---------------- */
  const [loading] = useState(false);
  const [error] = useState(false);

  /* ---------------- Selection ---------------- */
  const [selected, setSelected] = useState<Date | null>(null);

  /* ---------------- Confirm state ---------------- */
  const [resetTarget, setResetTarget] = useState<Date | null>(null);

  /* ---------------- Toasts ---------------- */
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const pushToast = (tone: ToastTone, title: string, description?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, tone, title, description }]);
  };
  const dismissToast = (id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  /* ---------------- day types ---------------- */

  const baseTypeFor = (d: Date): DayType => {
    const dow = d.getDay();
    return dow === 0 || dow === 6 ? "Non-Teaching" : "Teaching";
  };

  const typeFor = (d: Date): DayType => {
    const iso = toISO(d);
    return overrides.find((o) => o.date === iso)?.type ?? baseTypeFor(d);
  };

  const labelFor = (d: Date) =>
    overrides.find((o) => o.date === toISO(d))?.label;

  /* ---------------- calendar cells ---------------- */

  const cells = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list: { date: Date; inMonth: boolean }[] = [];

    for (let i = firstDow - 1; i >= 0; i--) {
      list.push({ date: new Date(year, month, -i), inMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      list.push({ date: new Date(year, month, i), inMonth: true });
    }
    while (list.length < 42) {
      const last = list[list.length - 1].date;
      const next = new Date(last);
      next.setDate(next.getDate() + 1);
      list.push({ date: next, inMonth: false });
    }
    return list;
  }, [year, month]);

  /* ---------------- month stats ---------------- */

  const monthStats = useMemo(() => {
    let teaching = 0;
    let holiday = 0;
    let nonTeaching = 0;
    const days = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= days; i++) {
      const type = typeFor(new Date(year, month, i));
      if (type === "Teaching") teaching++;
      else if (type === "Holiday") holiday++;
      else nonTeaching++;
    }
    return { teaching, holiday, nonTeaching };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, overrides]);

  /* ---------------- actions ---------------- */

  const setDayType = (date: Date, type: DayType, label?: string) => {
    const iso = toISO(date);
    const previous = typeFor(date);

    setOverrides((prev) => {
      const filtered = prev.filter((o) => o.date !== iso);
      if (type === baseTypeFor(date) && !label) return filtered;
      return [...filtered, { date: iso, type, label }];
    });

    // Only toast on a real change
    if (previous !== type || label !== undefined) {
      const typeLabel =
        type === "Non-Teaching" ? "Non-teaching day" : `${type} day`;
      pushToast(
        type === "Holiday" ? "warning" : "info",
        typeLabel,
        fmtLong(date)
      );
    }
  };

  const clearDay = (date: Date) => {
    const iso = toISO(date);
    setOverrides((prev) => prev.filter((o) => o.date !== iso));
    setResetTarget(null);
    pushToast(
      "info",
      "Reset to default",
      `${fmtLong(date)} now follows the base weekday rule.`
    );
  };

  const prevMonth = () => setCursor(new Date(year, month - 1, 1));
  const nextMonth = () => setCursor(new Date(year, month + 1, 1));
  const goToday = () =>
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));

  return (
    <>
      <PageContainer
        title="School Calendar"
        description="Configure teaching days, holidays and non-teaching days."
        actions={
          <button
            onClick={goToday}
            className="w-full sm:w-auto h-10 sm:h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Today
          </button>
        }
      >
        {loading ? (
          /* ================= LOADING (Phase 10) ================= */
          <div className="rounded-lg border border-border bg-surface">
            <LoadingState
              title="Loading calendar…"
              description="Fetching teaching days and overrides."
            />
          </div>
        ) : error ? (
          /* ================= ERROR (Phase 10) ================= */
          <div className="rounded-lg border border-border bg-surface">
            <ErrorState
              title="Couldn't load calendar"
              description="The server didn't respond. Check your connection and try again."
              onRetry={() => window.location.reload()}
            />
          </div>
        ) : (
          <>
            {/* ================= KPIs ================= */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <StatCard
                label="Teaching Days"
                value={monthStats.teaching}
                icon={<BookOpen className="h-4 w-4" />}
                tone="blue"
              />
              <StatCard
                label="Holidays"
                value={monthStats.holiday}
                icon={<Sun className="h-4 w-4" />}
                tone="danger"
              />
              <StatCard
                label="Non-Teaching Days"
                value={monthStats.nonTeaching}
                icon={<CalendarX2 className="h-4 w-4" />}
                tone="muted"
              />
            </div>

            {/* ================= Main layout ================= */}
            <div className="grid gap-4 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              {/* ---------- Calendar ---------- */}
              <div className="min-w-0 rounded-lg border border-border bg-surface overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between gap-2 px-3 sm:px-5 h-14 border-b border-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <h2 className="text-sm font-semibold truncate">
                      {MONTHS[month]} {year}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={prevMonth}
                      className="p-2 rounded-md hover:bg-muted transition-colors"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-2 rounded-md hover:bg-muted transition-colors"
                      aria-label="Next month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* DOW header */}
                <div className="grid grid-cols-7 border-b border-border">
                  {DOW.map((day) => (
                    <div
                      key={day}
                      className="py-2 sm:py-2.5 text-center text-[9px] sm:text-[11px] uppercase tracking-wider text-muted-foreground"
                    >
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{day.charAt(0)}</span>
                    </div>
                  ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7">
                  {cells.map(({ date, inMonth }, i) => {
                    const type = typeFor(date);
                    const label = labelFor(date);
                    const isSelected =
                      selected && toISO(selected) === toISO(date);
                    const isToday = toISO(date) === toISO(today);

                    const cellBg =
                      type === "Holiday"
                        ? "bg-danger-light/40"
                        : type === "Non-Teaching"
                        ? "bg-muted/40"
                        : "bg-surface";

                    return (
                      <button
                        key={i}
                        onClick={() => setSelected(date)}
                        className={`
                          relative min-w-0
                          min-h-[58px] sm:min-h-[72px] md:min-h-[78px]
                          p-1.5 sm:p-2
                          text-left
                          border-b border-r border-border
                          transition
                          ${cellBg}
                          ${!inMonth ? "opacity-40" : ""}
                          ${
                            isSelected
                              ? "ring-2 ring-blue ring-inset"
                              : "hover:bg-muted/40"
                          }
                        `}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[10px] sm:text-xs font-medium ${
                              isToday
                                ? "h-5 w-5 grid place-items-center rounded-full bg-navy text-white"
                                : ""
                            }`}
                          >
                            {date.getDate()}
                          </span>
                          <TypeDot type={type} />
                        </div>

                        {label && (
                          <div className="mt-1 text-[8px] sm:text-[10px] leading-tight text-muted-foreground line-clamp-2 break-words">
                            {label}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 sm:px-5 py-3 text-[11px] sm:text-xs text-muted-foreground">
                  <LegendDot color="bg-blue" label="Teaching" />
                  <LegendDot color="bg-danger" label="Holiday" />
                  <LegendDot color="bg-slate-400" label="Non-Teaching" />
                </div>
              </div>

              {/* ---------- Side panel ---------- */}
              <div className="rounded-lg border border-border bg-surface p-4 sm:p-5 h-fit lg:sticky lg:top-6">
                {selected ? (
                  <DayEditor
                    date={selected}
                    type={typeFor(selected)}
                    label={labelFor(selected)}
                    hasOverride={overrides.some(
                      (o) => o.date === toISO(selected)
                    )}
                    onSetType={(t, l) => setDayType(selected, t, l)}
                    onClear={() => setResetTarget(selected)}
                    onClose={() => setSelected(null)}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    <div className="text-xs uppercase tracking-wider mb-2">
                      Day details
                    </div>
                    <p>Select a day on the calendar to edit its type.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </PageContainer>

      {/* ================= CONFIRM RESET ================= */}
      <ConfirmDialog
        open={resetTarget !== null}
        title="Reset this day?"
        message={
          <>
            <span className="font-medium text-foreground">
              {resetTarget ? fmtLong(resetTarget) : ""}
            </span>{" "}
            will be restored to its default type (based on the weekday). Any
            custom label will be removed.
          </>
        }
        confirmLabel="Reset day"
        cancelLabel="Keep"
        tone="warning"
        icon={<Trash2 className="h-5 w-5" />}
        onConfirm={() => {
          if (resetTarget) clearDay(resetTarget);
        }}
        onCancel={() => setResetTarget(null)}
      />

      {/* ================= TOASTS ================= */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

/* =========================================================
   Stat card
   ========================================================= */

function StatCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  tone?: "default" | "blue" | "danger" | "muted";
}) {
  const toneClass =
    tone === "blue"
      ? "text-blue"
      : tone === "danger"
      ? "text-danger"
      : tone === "muted"
      ? "text-muted-foreground"
      : "text-foreground";

  return (
    <div className="rounded-lg border border-border bg-surface p-3 sm:p-4 min-w-0">
      <div className={`flex items-center gap-1.5 text-xs ${toneClass}`}>
        {icon}
        <span className="truncate">{label}</span>
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
   Type dot
   ========================================================= */

function TypeDot({ type }: { type: DayType }) {
  const color =
    type === "Teaching"
      ? "bg-blue"
      : type === "Holiday"
      ? "bg-danger"
      : "bg-slate-400";
  return (
    <span
      className={`h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0 rounded-full ${color}`}
    />
  );
}

/* =========================================================
   Legend
   ========================================================= */

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

/* =========================================================
   Day editor
   ========================================================= */

function DayEditor({
  date,
  type,
  label,
  hasOverride,
  onSetType,
  onClear,
  onClose,
}: {
  date: Date;
  type: DayType;
  label?: string;
  hasOverride: boolean;
  onSetType: (t: DayType, l?: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [draftLabel, setDraftLabel] = useState(label ?? "");

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Selected day
          </div>
          <div className="text-sm font-semibold mt-0.5 break-words">
            {fmtLong(date)}
          </div>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>

      {/* Current type */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-1.5">
          Current type
        </div>
        <TypePill type={type} />
      </div>

      {/* Change type */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-1.5">Change to</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <TypeButton
            active={type === "Teaching"}
            onClick={() => onSetType("Teaching")}
            color="blue"
          >
            Teaching
          </TypeButton>
          <TypeButton
            active={type === "Holiday"}
            onClick={() =>
              onSetType("Holiday", draftLabel || undefined)
            }
            color="danger"
          >
            Holiday
          </TypeButton>
          <TypeButton
            active={type === "Non-Teaching"}
            onClick={() => onSetType("Non-Teaching")}
            color="muted"
          >
            Non-Teaching
          </TypeButton>
        </div>
      </div>

      {/* Label */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-1.5">
          Label (optional)
        </div>
        <input
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
          onBlur={() => {
            if (
              type === "Holiday" &&
              draftLabel !== (label ?? "")
            ) {
              onSetType("Holiday", draftLabel || undefined);
            }
          }}
          placeholder="e.g. Public Holiday"
          className="w-full h-11 sm:h-10 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
        />
      </div>

      {/* Reset */}
      {hasOverride && (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1.5 min-h-9 text-xs text-danger hover:underline"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Reset to default
        </button>
      )}
    </div>
  );
}

/* =========================================================
   Type pill
   ========================================================= */

function TypePill({ type }: { type: DayType }) {
  const cls =
    type === "Teaching"
      ? "bg-blue-light text-blue border border-blue/20"
      : type === "Holiday"
      ? "bg-danger-light text-danger border border-danger/20"
      : "bg-inactive-bg text-inactive border border-inactive-border";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}
    >
      {type}
    </span>
  );
}

/* =========================================================
   Type button
   ========================================================= */

function TypeButton({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color: "blue" | "danger" | "muted";
}) {
  const activeCls =
    color === "blue"
      ? "bg-blue text-white border-blue"
      : color === "danger"
      ? "bg-danger text-white border-danger"
      : "bg-slate-700 text-white border-slate-700";

  return (
    <button
      onClick={onClick}
      className={`w-full min-h-10 sm:h-9 px-2 rounded-md border text-xs font-medium transition ${
        active ? activeCls : "border-border hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}