"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  TrendingUp,
  XCircle,
  Filter,
} from "lucide-react";
import { ParentShell } from "@/components/layout/ParentShell";
import {
  parentAlerts,
  parentChild,
  parentRecords,
  type ParentAttendanceRecord,
} from "@/data/mock/parent";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type StatusFilter = "all" | "Present" | "Absent" | "Late";

function formatLong(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DOW[dt.getDay()]}, ${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

function monthKey(iso: string) {
  const [y, m] = iso.split("-");
  return `${y}-${m}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export default function ParentHistoryPage() {
  const unreadAlerts = parentAlerts.filter((a) => !a.read).length;

  const months = useMemo(() => {
    const set = new Set(parentRecords.map((r) => monthKey(r.date)));
    return Array.from(set).sort().reverse();
  }, []);

  const [month, setMonth] = useState<string>(months[0] ?? "");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    return parentRecords
      .filter((r) => (month ? monthKey(r.date) === month : true))
      .filter((r) => (status === "all" ? true : r.status === status))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [month, status]);

  const monthRecords = useMemo(
    () => parentRecords.filter((r) => monthKey(r.date) === month),
    [month]
  );

  const counts = useMemo(() => {
    const c = { present: 0, absent: 0, late: 0, total: monthRecords.length };
    for (const r of monthRecords) {
      if (r.status === "Present") c.present++;
      else if (r.status === "Absent") c.absent++;
      else if (r.status === "Late") c.late++;
    }
    const rate = c.total ? Math.round((c.present / c.total) * 100) : 0;
    return { ...c, rate };
  }, [monthRecords]);

  const overall = useMemo(() => {
    const c = { present: 0, absent: 0, late: 0, total: parentRecords.length };
    for (const r of parentRecords) {
      if (r.status === "Present") c.present++;
      else if (r.status === "Absent") c.absent++;
      else if (r.status === "Late") c.late++;
    }
    const rate = c.total ? Math.round((c.present / c.total) * 100) : 0;
    return { ...c, rate };
  }, []);

  return (
    <ParentShell
      childName={parentChild.name}
      childClass={`${parentChild.grade} · ${parentChild.class}`}
      alertCount={unreadAlerts}
    >
      <section className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Attendance history
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every day {parentChild.name.split(" ")[0]} has been marked since enrolment.
        </p>
      </section>

      {/* Overall summary */}
      <section className="rounded-lg border border-border bg-surface p-5 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-11 w-11 rounded-lg bg-blue-light text-blue grid place-items-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground">
              Overall attendance rate
            </div>
            <div className="text-2xl font-semibold">{overall.rate}%</div>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
            <MiniStat
              label="Present"
              value={overall.present}
              tone="success"
            />
            <MiniStat label="Absent" value={overall.absent} tone="danger" />
            <MiniStat label="Late" value={overall.late} tone="warning" />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="appearance-none h-9 pl-9 pr-9 rounded-md border border-input bg-surface text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-1">
          <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
          <FilterTab
            active={status === "all"}
            onClick={() => setStatus("all")}
            count={monthRecords.length}
          >
            All
          </FilterTab>
          <FilterTab
            active={status === "Present"}
            onClick={() => setStatus("Present")}
            count={counts.present}
          >
            Present
          </FilterTab>
          <FilterTab
            active={status === "Absent"}
            onClick={() => setStatus("Absent")}
            count={counts.absent}
          >
            Absent
          </FilterTab>
          <FilterTab
            active={status === "Late"}
            onClick={() => setStatus("Late")}
            count={counts.late}
          >
            Late
          </FilterTab>
        </div>
      </section>

      {/* Month summary */}
      <section className="grid gap-4 sm:grid-cols-3 mb-4">
        <MonthCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Present this month"
          value={counts.present}
          tone="success"
        />
        <MonthCard
          icon={<XCircle className="h-4 w-4" />}
          label="Absent this month"
          value={counts.absent}
          tone="danger"
        />
        <MonthCard
          icon={<Clock className="h-4 w-4" />}
          label="Late this month"
          value={counts.late}
          tone="warning"
        />
      </section>

      {/* Records list */}
      <section className="rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold">
              {month ? monthLabel(month) : "Attendance records"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} record{filtered.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-muted-foreground">
            No records match your filters.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((r) => (
              <RecordRow key={r.date} record={r} />
            ))}
          </ul>
        )}
      </section>

      <p className="mt-4 text-[11px] text-muted-foreground text-center">
        Records are kept for 2 years. Older records can be requested from the school office.
      </p>
    </ParentShell>
  );
}

/* ---------------- sub-components ---------------- */

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "danger" | "warning";
}) {
  const cls =
    tone === "success"
      ? "text-success"
      : tone === "danger"
      ? "text-danger"
      : "text-warning";
  return (
    <div>
      <div className={`text-lg font-semibold ${cls}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function MonthCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "success" | "danger" | "warning";
}) {
  const cls =
    tone === "success"
      ? "text-success"
      : tone === "danger"
      ? "text-danger"
      : "text-warning";
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className={`flex items-center gap-1.5 text-xs ${cls}`}>
        {icon}
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</div>
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-8 px-3 rounded-md text-xs font-medium transition inline-flex items-center gap-1.5 ${
        active ? "bg-navy text-white" : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
      {typeof count === "number" && (
        <span
          className={`inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] ${
            active ? "bg-white/20" : "bg-muted text-muted-foreground"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function RecordRow({ record }: { record: ParentAttendanceRecord }) {
  const statusCls =
    record.status === "Present"
      ? "bg-success-light text-success"
      : record.status === "Absent"
      ? "bg-danger-light text-danger"
      : "bg-warning-light text-warning";

  return (
    <li className="flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-3 px-5 py-4">
      <div className="w-40 shrink-0">
        <div className="text-sm font-medium">{formatLong(record.date)}</div>
        <div className="text-[11px] text-muted-foreground font-mono">
          {record.date}
        </div>
      </div>

      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusCls}`}
      >
        {record.status}
      </span>

      <div className="flex-1 min-w-0 text-sm">
        {record.status === "Late" && record.arrivalTime && (
          <span className="text-muted-foreground">
            Arrived at{" "}
            <span className="text-foreground font-medium">
              {record.arrivalTime}
            </span>
            {record.note && <span> — {record.note}</span>}
          </span>
        )}
        {record.status === "Absent" && (
          <span className="text-muted-foreground">
            {record.note ?? "No reason recorded"}
          </span>
        )}
        {record.status === "Present" && (
          <span className="text-muted-foreground">On time</span>
        )}
      </div>
    </li>
  );
}