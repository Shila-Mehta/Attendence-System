"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Filter,
  TrendingUp,
  XCircle,
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

  const childOptions = [
    {
      id: parentChild.studentId,
      name: parentChild.name,
      grade: parentChild.grade,
      className: parentChild.class,
    },
  ];

  return (
    <ParentShell
      childName={parentChild.name}
      childClass={`${parentChild.grade} · ${parentChild.class}`}
      childOptions={childOptions}
      alertCount={unreadAlerts}
    >
      {/* ================= Heading ================= */}
      <section className="mb-5">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Attendance history
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every day {parentChild.name.split(" ")[0]} has been marked since
          enrolment.
        </p>
      </section>

      {/* ================= Overall summary ================= */}
      <section className="rounded-lg border border-border bg-surface p-4 sm:p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-11 w-11 rounded-lg bg-blue-light text-blue border border-blue/20 grid place-items-center shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">
                Overall attendance rate
              </div>
              <div className="text-2xl font-semibold tabular-nums">
                {overall.rate}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center shrink-0">
            <MiniStat label="Present" value={overall.present} tone="success" />
            <MiniStat label="Absent" value={overall.absent} tone="danger" />
            <MiniStat label="Late" value={overall.late} tone="warning" />
          </div>
        </div>
      </section>

      {/* ================= Filters ================= */}
      <section className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-4">
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="appearance-none w-full sm:w-auto h-9 pl-9 pr-9 rounded-md border border-input bg-surface text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1 shrink-0" />
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

      {/* ================= Month summary ================= */}
      <section className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
        <MonthCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Present"
          value={counts.present}
          tone="success"
        />
        <MonthCard
          icon={<XCircle className="h-4 w-4" />}
          label="Absent"
          value={counts.absent}
          tone="danger"
        />
        <MonthCard
          icon={<Clock className="h-4 w-4" />}
          label="Late"
          value={counts.late}
          tone="warning"
        />
      </section>

      {/* ================= Records ================= */}
      <section className="rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border">
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
          <>
            {/* Column header — desktop only */}
            <div
              className="hidden sm:grid items-center gap-5 px-5 py-2.5
                         border-b border-border bg-muted/20
                         text-[11px] uppercase tracking-wider text-muted-foreground
                         sm:grid-cols-[170px_110px_minmax(0,1fr)]"
            >
              <div>Date</div>
              <div>Status</div>
              <div>Details</div>
            </div>

            <ul className="divide-y divide-border">
              {filtered.map((r) => (
                <RecordRow key={r.date} record={r} />
              ))}
            </ul>
          </>
        )}
      </section>

      <p className="mt-4 text-[11px] text-muted-foreground text-center">
        Records are kept for 2 years. Older records can be requested from the
        school office.
      </p>
    </ParentShell>
  );
}

/* =========================================================
   Sub-components
   ========================================================= */

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
      <div className={`text-lg font-semibold tabular-nums ${cls}`}>{value}</div>
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
    <div className="rounded-lg border border-border bg-surface p-3 sm:p-4">
      <div className={`flex items-center gap-1.5 text-xs ${cls}`}>
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className={`mt-1 text-xl sm:text-2xl font-semibold ${cls} tabular-nums`}>
        {value}
      </div>
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
      className={`h-8 px-3 rounded-full text-xs font-medium transition inline-flex items-center gap-1.5 shrink-0 ${
        active
          ? "bg-navy text-white"
          : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
      {typeof count === "number" && (
        <span
          className={`inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] tabular-nums ${
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
  return (
    <li
      className="
        grid items-center gap-3 px-4 sm:px-5 py-3.5
        grid-cols-[1fr_auto]
        sm:grid-cols-[170px_110px_minmax(0,1fr)] sm:gap-5
      "
    >
      {/* Col 1 — Date */}
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">
          {formatLong(record.date)}
        </div>
        <div className="text-[11px] text-muted-foreground font-mono tabular-nums">
          {record.date}
        </div>
      </div>

      {/* Col 2 — Status pill (right on mobile, left on desktop) */}
      <div className="flex justify-end sm:justify-start">
        <StatusPill status={record.status} />
      </div>

      {/* Col 3 — Details */}
      <div className="col-span-2 sm:col-span-1 text-sm text-muted-foreground truncate">
        {record.status === "Late" && record.arrivalTime ? (
          <>
            Arrived at{" "}
            <span className="text-foreground font-medium tabular-nums">
              {record.arrivalTime}
            </span>
            {record.note ? ` — ${record.note}` : ""}
          </>
        ) : record.status === "Absent" ? (
          record.note ?? "No reason recorded"
        ) : (
          "On time"
        )}
      </div>
    </li>
  );
}

function StatusPill({
  status,
}: {
  status: "Present" | "Absent" | "Late";
}) {
  const cls =
    status === "Present"
      ? "bg-success-light text-success border border-success/20"
      : status === "Absent"
      ? "bg-danger-light text-danger border border-danger/20"
      : "bg-warning-light text-warning border border-warning/20";
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${cls}`}
    >
      {status}
    </span>
  );
}