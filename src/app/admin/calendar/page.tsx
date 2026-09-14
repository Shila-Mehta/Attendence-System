
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
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ---------------- page ---------------- */

export default function CalendarPage() {
  const today = new Date();

  const [cursor, setCursor] = useState(
    new Date(2026, 8, 1)
  );

  const [overrides, setOverrides] =
    useState<DayOverride[]>(seed);

  const [selected, setSelected] =
    useState<Date | null>(null);

  const [resetTarget, setResetTarget] =
    useState<Date | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  /* ---------------- day types ---------------- */

  const baseTypeFor = (d: Date): DayType => {
    const dow = d.getDay();

    return dow === 0 || dow === 6
      ? "Non-Teaching"
      : "Teaching";
  };

  const typeFor = (d: Date): DayType => {
    const iso = toISO(d);

    return (
      overrides.find((o) => o.date === iso)?.type ??
      baseTypeFor(d)
    );
  };

  const labelFor = (d: Date) =>
    overrides.find((o) => o.date === toISO(d))?.label;

  /* ---------------- calendar cells ---------------- */

  const cells = useMemo(() => {
    const firstDow = new Date(
      year,
      month,
      1
    ).getDay();

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const list: {
      date: Date;
      inMonth: boolean;
    }[] = [];

    for (let i = firstDow - 1; i >= 0; i--) {
      list.push({
        date: new Date(year, month, -i),
        inMonth: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      list.push({
        date: new Date(year, month, i),
        inMonth: true,
      });
    }

    while (list.length < 42) {
      const last =
        list[list.length - 1].date;

      const next = new Date(last);

      next.setDate(next.getDate() + 1);

      list.push({
        date: next,
        inMonth: false,
      });
    }

    return list;
  }, [year, month]);

  /* ---------------- month stats ---------------- */

  const monthStats = useMemo(() => {
    let teaching = 0;
    let holiday = 0;
    let nonTeaching = 0;

    const days = new Date(
      year,
      month + 1,
      0
    ).getDate();

    for (let i = 1; i <= days; i++) {
      const type = typeFor(
        new Date(year, month, i)
      );

      if (type === "Teaching") {
        teaching++;
      } else if (type === "Holiday") {
        holiday++;
      } else {
        nonTeaching++;
      }
    }

    return {
      teaching,
      holiday,
      nonTeaching,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, overrides]);

  /* ---------------- actions ---------------- */

  const setDayType = (
    date: Date,
    type: DayType,
    label?: string
  ) => {
    const iso = toISO(date);

    setOverrides((prev) => {
      const filtered = prev.filter(
        (o) => o.date !== iso
      );

      if (
        type === baseTypeFor(date) &&
        !label
      ) {
        return filtered;
      }

      return [
        ...filtered,
        {
          date: iso,
          type,
          label,
        },
      ];
    });
  };

  const clearDay = (date: Date) => {
    const iso = toISO(date);

    setOverrides((prev) =>
      prev.filter((o) => o.date !== iso)
    );

    setResetTarget(null);
  };

  const prevMonth = () =>
    setCursor(
      new Date(year, month - 1, 1)
    );

  const nextMonth = () =>
    setCursor(
      new Date(year, month + 1, 1)
    );

  const goToday = () =>
    setCursor(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

  return (
    <PageContainer
      title="School Calendar"
      description="Configure teaching days, holidays and non-teaching days."
      actions={
        <button
          onClick={goToday}
          className="w-full sm:w-auto h-10 sm:h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted"
        >
          Today
        </button>
      }
    >
      {/* ================= KPIs ================= */}

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <StatCard
          label="Teaching Days"
          value={monthStats.teaching}
          icon={
            <BookOpen className="h-4 w-4" />
          }
          tone="blue"
        />

        <StatCard
          label="Holidays"
          value={monthStats.holiday}
          icon={
            <Sun className="h-4 w-4" />
          }
          tone="danger"
        />

        <StatCard
          label="Non-Teaching Days"
          value={monthStats.nonTeaching}
          icon={
            <CalendarX2 className="h-4 w-4" />
          }
          tone="muted"
        />
      </div>

      {/* ================= MAIN LAYOUT ================= */}

      <div className="grid gap-4 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ================= CALENDAR ================= */}

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
                className="p-2 rounded-md hover:bg-muted"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={nextMonth}
                className="p-2 rounded-md hover:bg-muted"
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
                {/* Full name on desktop */}
                <span className="hidden sm:inline">
                  {day}
                </span>

                {/* Short name on mobile */}
                <span className="sm:hidden">
                  {day.charAt(0)}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar grid */}

          <div className="grid grid-cols-7">
            {cells.map(
              ({ date, inMonth }, i) => {
                const type = typeFor(date);
                const label = labelFor(date);

                const isSelected =
                  selected &&
                  toISO(selected) ===
                    toISO(date);

                const isToday =
                  toISO(date) ===
                  toISO(today);

                const cellBg =
                  type === "Holiday"
                    ? "bg-danger-light/40"
                    : type === "Non-Teaching"
                    ? "bg-muted/40"
                    : "bg-surface";

                return (
                  <button
                    key={i}
                    onClick={() =>
                      setSelected(date)
                    }
                    className={`
                      relative
                      min-w-0
                      min-h-[58px]
                      sm:min-h-[72px]
                      md:min-h-[78px]
                      p-1.5
                      sm:p-2
                      text-left
                      border-b
                      border-r
                      border-border
                      transition
                      ${cellBg}
                      ${
                        !inMonth
                          ? "opacity-40"
                          : ""
                      }
                      ${
                        isSelected
                          ? "ring-2 ring-blue ring-inset"
                          : "hover:bg-muted/40"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`
                          text-[10px]
                          sm:text-xs
                          font-medium
                          ${
                            isToday
                              ? "h-5 w-5 grid place-items-center rounded-full bg-navy text-white"
                              : ""
                          }
                        `}
                      >
                        {date.getDate()}
                      </span>

                      <TypeDot type={type} />
                    </div>

                    {label && (
                      <div
                        className="
                          mt-1
                          text-[8px]
                          sm:text-[10px]
                          leading-tight
                          text-muted-foreground
                          line-clamp-2
                          break-words
                        "
                      >
                        {label}
                      </div>
                    )}
                  </button>
                );
              }
            )}
          </div>

          {/* Legend */}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 sm:px-5 py-3 text-[11px] sm:text-xs text-muted-foreground">
            <LegendDot
              color="bg-blue"
              label="Teaching"
            />

            <LegendDot
              color="bg-danger"
              label="Holiday"
            />

            <LegendDot
              color="bg-slate-400"
              label="Non-Teaching"
            />
          </div>
        </div>

        {/* ================= SIDE PANEL ================= */}

        <div className="rounded-lg border border-border bg-surface p-4 sm:p-5 h-fit lg:sticky lg:top-6">
          {selected ? (
            <DayEditor
              date={selected}
              type={typeFor(selected)}
              label={labelFor(selected)}
              hasOverride={overrides.some(
                (o) =>
                  o.date ===
                  toISO(selected)
              )}
              onSetType={(t, l) =>
                setDayType(
                  selected,
                  t,
                  l
                )
              }
              onClear={() =>
                setResetTarget(selected)
              }
              onClose={() =>
                setSelected(null)
              }
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              <div className="text-xs uppercase tracking-wider mb-2">
                Day details
              </div>

              <p>
                Select a day on the calendar
                to edit its type.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= RESET CONFIRMATION ================= */}

      {resetTarget && (
        <ResetConfirmation
          onClose={() =>
            setResetTarget(null)
          }
          onConfirm={() =>
            clearDay(resetTarget)
          }
        />
      )}
    </PageContainer>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  tone?:
    | "default"
    | "blue"
    | "danger"
    | "muted";
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
    <div className="rounded-lg border border-border bg-surface p-3 sm:p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        <span className="truncate">
          {label}
        </span>
      </div>

      <div
        className={`mt-1 text-xl sm:text-2xl font-semibold ${toneClass}`}
      >
        {value}
      </div>
    </div>
  );
}

/* ============================================================
   TYPE DOT
============================================================ */

function TypeDot({
  type,
}: {
  type: DayType;
}) {
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

/* ============================================================
   LEGEND
============================================================ */

function LegendDot({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`h-2 w-2 rounded-full ${color}`}
      />
      {label}
    </span>
  );
}

/* ============================================================
   DAY EDITOR
============================================================ */

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
  onSetType: (
    t: DayType,
    l?: string
  ) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [draftLabel, setDraftLabel] =
    useState(label ?? "");

  return (
    <div>
      {/* Header */}

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Selected day
          </div>

          <div className="text-sm font-semibold mt-0.5 break-words">
            {DOW[date.getDay()]},{" "}
            {date.getDate()}{" "}
            {MONTHS[date.getMonth()]}{" "}
            {date.getFullYear()}
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
        <div className="text-xs text-muted-foreground mb-1.5">
          Change to
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <TypeButton
            active={type === "Teaching"}
            onClick={() =>
              onSetType("Teaching")
            }
            color="blue"
          >
            Teaching
          </TypeButton>

          <TypeButton
            active={type === "Holiday"}
            onClick={() =>
              onSetType(
                "Holiday",
                draftLabel || undefined
              )
            }
            color="danger"
          >
            Holiday
          </TypeButton>

          <TypeButton
            active={
              type === "Non-Teaching"
            }
            onClick={() =>
              onSetType("Non-Teaching")
            }
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
          onChange={(e) =>
            setDraftLabel(e.target.value)
          }
          onBlur={() => {
            if (
              type === "Holiday" &&
              draftLabel !==
                (label ?? "")
            ) {
              onSetType(
                "Holiday",
                draftLabel || undefined
              );
            }
          }}
          placeholder="e.g. Public Holiday"
          className="
            w-full
            h-10
            sm:h-9
            rounded-md
            border
            border-input
            bg-surface
            px-3
            text-sm
            outline-none
            focus:border-blue
            focus:ring-2
            focus:ring-blue/20
          "
        />
      </div>

      {/* Reset */}

      {hasOverride && (
        <button
          onClick={onClear}
          className="
            inline-flex
            items-center
            gap-1.5
            min-h-9
            text-xs
            text-danger
            hover:underline
          "
        >
          <Trash2 className="h-3.5 w-3.5" />
          Reset to default
        </button>
      )}
    </div>
  );
}

/* ============================================================
   TYPE PILL
============================================================ */

function TypePill({
  type,
}: {
  type: DayType;
}) {
  const cls =
    type === "Teaching"
      ? "bg-blue-light text-blue"
      : type === "Holiday"
      ? "bg-danger-light text-danger"
      : "bg-muted text-muted-foreground";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}
    >
      {type}
    </span>
  );
}

/* ============================================================
   TYPE BUTTON
============================================================ */

function TypeButton({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color:
    | "blue"
    | "danger"
    | "muted";
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
      className={`
        w-full
        min-h-10
        sm:h-9
        px-2
        rounded-md
        border
        text-xs
        font-medium
        transition
        ${
          active
            ? activeCls
            : "border-border hover:bg-muted"
        }
      `}
    >
      {children}
    </button>
  );
}

/* ============================================================
   RESET CONFIRMATION
============================================================ */

function ResetConfirmation({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm rounded-lg bg-surface border border-border shadow-xl">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
              <Trash2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold">
                Reset day?
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                This will remove the custom
                setting and restore the
                day to its default type.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-5 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full sm:w-auto h-10 sm:h-9 px-4 rounded-md border border-border text-sm hover:bg-muted"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="w-full sm:w-auto h-10 sm:h-9 px-4 rounded-md bg-danger text-white text-sm font-medium hover:opacity-90 transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

