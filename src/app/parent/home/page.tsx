"use client";

import Link from "next/link";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileWarning,
  TrendingUp,
  XCircle,
  ArrowRight,
  Bell,
} from "lucide-react";
import { ParentShell } from "@/components/layout/ParentShell";
import {
  parentAlerts,
  parentChild,
  parentRecords,
} from "@/data/mock/parent";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

export default function ParentHomePage() {
  const unreadAlerts = parentAlerts.filter((a) => !a.read).length;

  const last30 = parentRecords.slice(0, 30);
  const counts = last30.reduce(
    (acc, r) => {
      if (r.status === "Present") acc.present++;
      else if (r.status === "Absent") acc.absent++;
      else if (r.status === "Late") acc.late++;
      return acc;
    },
    { present: 0, absent: 0, late: 0 }
  );
  const total = last30.length;
  const rate = total ? Math.round((counts.present / total) * 100) : 0;

  const recent = parentRecords.slice(0, 5);

  return (
    <ParentShell
      childName={parentChild.name}
      childClass={`${parentChild.grade} · ${parentChild.class}`}
      alertCount={unreadAlerts}
    >
      {/* Welcome */}
      <section className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Welcome, {parentChild.guardianName.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s {parentChild.name.split(" ")[0]}&apos;s attendance at a glance.
        </p>
      </section>

      {/* Child card */}
      <section className="rounded-lg border border-border bg-surface p-5 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-navy text-white grid place-items-center text-lg font-semibold shrink-0">
            {parentChild.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-semibold">{parentChild.name}</div>
            <div className="text-sm text-muted-foreground">
              {parentChild.grade} · {parentChild.class} · {parentChild.room}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Class teacher</div>
            <div className="text-sm font-medium">{parentChild.teacher}</div>
          </div>
        </div>
      </section>

      {/* Unread alert banner */}
      {unreadAlerts > 0 && (
        <Link
          href="/parent/alerts"
          className="mb-6 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger-light text-danger px-4 py-3 hover:bg-danger-light/80 transition"
        >
          <Bell className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium">
              {unreadAlerts} unread alert{unreadAlerts === 1 ? "" : "s"} need your response
            </div>
            <div className="text-xs mt-0.5 opacity-90">
              Tap to review and confirm the reason for absence.
            </div>
          </div>
          <ArrowRight className="h-4 w-4 mt-0.5" />
        </Link>
      )}

      {/* KPI cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <KpiCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Present (last 30)"
          value={counts.present}
          tone="success"
        />
        <KpiCard
          icon={<XCircle className="h-4 w-4" />}
          label="Absent (last 30)"
          value={counts.absent}
          tone="danger"
        />
        <KpiCard
          icon={<Clock className="h-4 w-4" />}
          label="Late (last 30)"
          value={counts.late}
          tone="warning"
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Attendance rate"
          value={`${rate}%`}
          tone="blue"
        />
      </section>

      {/* Quick actions */}
      <section className="grid gap-3 sm:grid-cols-3 mb-6">
        <QuickAction
          href="/parent/report-absence"
          icon={<FileWarning className="h-5 w-5" />}
          title="Report an absence"
          desc="Sickness, appointment or emergency."
        />
        <QuickAction
          href="/parent/history"
          icon={<CalendarCheck className="h-5 w-5" />}
          title="View full history"
          desc="See every day marked so far."
        />
        <QuickAction
          href="/parent/alerts"
          icon={<Bell className="h-5 w-5" />}
          title="Alerts"
          desc="Respond to unexplained absences."
        />
      </section>

      {/* Recent attendance */}
      <section className="rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold">Recent attendance</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Last 5 school days
            </p>
          </div>
          <Link
            href="/parent/history"
            className="text-xs text-blue hover:underline inline-flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <ul className="divide-y divide-border">
          {recent.map((r) => (
            <li
              key={r.date}
              className="flex items-center gap-4 px-5 py-3"
            >
              <div className="text-xs text-muted-foreground w-24 shrink-0">
                {formatDate(r.date)}
              </div>
              <StatusPill status={r.status} />
              <div className="flex-1 min-w-0 text-xs text-muted-foreground truncate">
                {r.status === "Late" && r.arrivalTime && (
                  <>Arrived at {r.arrivalTime}</>
                )}
                {r.status === "Absent" && r.note && <>{r.note}</>}
                {r.status === "Present" && "On time"}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </ParentShell>
  );
}

/* ---------------- sub-components ---------------- */

function KpiCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone: "success" | "danger" | "warning" | "blue";
}) {
  const cls =
    tone === "success"
      ? "text-success"
      : tone === "danger"
      ? "text-danger"
      : tone === "warning"
      ? "text-warning"
      : "text-blue";

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

function QuickAction({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-border bg-surface p-4 hover:border-blue/40 hover:shadow-sm transition group"
    >
      <div className="flex items-center gap-3">
        <span className="h-9 w-9 rounded-lg bg-blue-light text-blue grid place-items-center shrink-0 group-hover:bg-blue group-hover:text-white transition">
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
        </div>
      </div>
    </Link>
  );
}

function StatusPill({ status }: { status: "Present" | "Absent" | "Late" }) {
  const cls =
    status === "Present"
      ? "bg-success-light text-success"
      : status === "Absent"
      ? "bg-danger-light text-danger"
      : "bg-warning-light text-warning";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${cls}`}
    >
      {status}
    </span>
  );
}