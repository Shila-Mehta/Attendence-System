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
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ---------------- page ---------------- */

export default function CalendarPage() {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(2026, 8, 1)); // Sept 2026
  const [overrides, setOverrides] = useState<DayOverride[]>(seed);
  const [selected, setSelected] = useState<Date | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

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

  const monthStats = useMemo(() => {
    let teaching = 0;
    let holiday = 0;
    let nonTeaching = 0;
    const days = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= days; i++) {
      const t = typeFor(new Date(year, month, i));
      if (t === "Teaching") teaching++;
      else if (t === "Holiday") holiday++;
      else nonTeaching++;
    }
    return { teaching, holiday, nonTeaching };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, overrides]);

  const setDayType = (date: Date, type: DayType, label?: string) => {
    const iso = toISO(date);
    setOverrides((prev) => {
      const filtered = prev.filter((o) => o.date !== iso);
      // If the type matches the base rule, no override needed
      if (type === baseTypeFor(date) && !label) return filtered;
      return [...filtered, { date: iso, type, label }];
    });
  };

  const clearDay = (date: Date) => {
    const iso = toISO(date);
    setOverrides((prev) => prev.filter((o) => o.date !== iso));
  };

  const prevMonth = () => setCursor(new Date(year, month - 1, 1));
  const nextMonth = () => setCursor(new Date(year, month + 1, 1));
  const goToday = () => setCursor(new Date(today.getFullYear(), today.getMonth(), 1));

  return (
    <PageContainer
      title="School Calendar"
      description="Configure teaching days, holidays and non-teaching days."
      actions={
        <button
          onClick={goToday}
          className="h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted"
        >
          Today
        </button>
      }
    >
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
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

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar */}
        <div className="rounded-lg border border-border bg-surface">
          {/* Header */}
          <div className="flex items-center justify-between px-5 h-14 border-b border-border">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">
                {MONTHS[month]} {year}
              </h2>
            </div>
            <div className="flex items-center gap-1">
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
            {DOW.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-[11px] uppercase tracking-wider text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7">
            {cells.map(({ date, inMonth }, i) => {
              const type = typeFor(date);
              const label = labelFor(date);
              const isSelected = selected && toISO(selected) === toISO(date);
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
                  className={`relative min-h-[78px] p-2 text-left border-b border-r border-border transition
                    ${cellBg}
                    ${!inMonth ? "opacity-40" : ""}
                    ${isSelected ? "ring-2 ring-blue ring-inset" : "hover:bg-muted/40"}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-medium ${
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
                    <div className="mt-1 text-[10px] leading-tight text-muted-foreground line-clamp-2">
                      {label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 px-5 py-3 text-xs text-muted-foreground">
            <LegendDot color="bg-blue" label="Teaching" />
            <LegendDot color="bg-danger" label="Holiday" />
            <LegendDot color="bg-slate-400" label="Non-Teaching" />
          </div>
        </div>

        {/* Side panel */}
        <div className="rounded-lg border border-border bg-surface p-5 h-fit lg:sticky lg:top-6">
          {selected ? (
            <DayEditor
              date={selected}
              type={typeFor(selected)}
              label={labelFor(selected)}
              hasOverride={overrides.some((o) => o.date === toISO(selected))}
              onSetType={(t, l) => setDayType(selected, t, l)}
              onClear={() => clearDay(selected)}
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
    </PageContainer>
  );
}

/* ---------------- sub-components ---------------- */

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
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function TypeDot({ type }: { type: DayType }) {
  const color =
    type === "Teaching" ? "bg-blue" : type === "Holiday" ? "bg-danger" : "bg-slate-400";
  return <span className={`h-1.5 w-1.5 rounded-full ${color}`} />;
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

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
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Selected day
          </div>
          <div className="text-sm font-semibold mt-0.5">
            {DOW[date.getDay()]}, {date.getDate()} {MONTHS[date.getMonth()]}{" "}
            {date.getFullYear()}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>

      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-1.5">Current type</div>
        <TypePill type={type} />
      </div>

      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-1.5">
          Change to
        </div>
        <div className="grid grid-cols-3 gap-2">
          <TypeButton
            active={type === "Teaching"}
            onClick={() => onSetType("Teaching")}
            color="blue"
          >
            Teaching
          </TypeButton>
          <TypeButton
            active={type === "Holiday"}
            onClick={() => onSetType("Holiday", draftLabel || undefined)}
            color="danger"
          >
            Holiday
          </TypeButton>
          <TypeButton
            active={type === "Non-Teaching"}
            onClick={() => onSetType("Non-Teaching")}
            color="muted"
          >
            Non-Teach.
          </TypeButton>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-1.5">
          Label (optional)
        </div>
        <input
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
          onBlur={() => {
            if (type === "Holiday" && draftLabel !== (label ?? "")) {
              onSetType("Holiday", draftLabel || undefined);
            }
          }}
          placeholder="e.g. Public Holiday"
          className="w-full h-9 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
        />
      </div>

      {hasOverride && (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1.5 text-xs text-danger hover:underline"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Reset to default
        </button>
      )}
    </div>
  );
}

function TypePill({ type }: { type: DayType }) {
  const cls =
    type === "Teaching"
      ? "bg-blue-light text-blue"
      : type === "Holiday"
      ? "bg-danger-light text-danger"
      : "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {type}
    </span>
  );
}

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
      className={`h-8 px-2 rounded-md border text-xs font-medium transition ${
        active ? activeCls : "border-border hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}