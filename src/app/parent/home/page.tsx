"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  FileWarning,
} from "lucide-react";
import { ParentShell } from "@/components/layout/ParentShell";
import { parentAlerts, parentChild } from "@/data/mock/parent";

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ParentHomePage() {
  const unreadAlerts = parentAlerts.filter((a) => !a.read).length;

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
      <div className="mx-auto w-full max-w-2xl">
        {/* ================= Child header ================= */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-14 w-14 rounded-full bg-navy text-white grid place-items-center text-lg font-semibold shrink-0">
            {initialsOf(parentChild.name)}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight truncate">
              {parentChild.name}
            </h1>
            <div className="text-sm text-muted-foreground mt-0.5 truncate">
              {parentChild.grade} · {parentChild.class} · Room{" "}
              {parentChild.room}
            </div>
          </div>
        </div>

        {/* ================= Alert (only if unread) ================= */}
        {unreadAlerts > 0 && (
          <Link
            href="/parent/alerts"
            className="group flex items-start gap-3 rounded-lg border border-danger/30 bg-danger-light text-danger px-4 py-3.5 mb-4 hover:bg-danger-light/80 transition"
          >
            <span className="mt-0.5 h-9 w-9 rounded-lg bg-danger text-white grid place-items-center shrink-0">
              <Bell className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">
                {unreadAlerts} alert{unreadAlerts === 1 ? "" : "s"} need your
                response
              </div>
              <div className="text-xs mt-0.5">
                Tap to confirm the reason for absence.
              </div>
            </div>
            <ArrowRight className="h-4 w-4 mt-2.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}

        {/* ================= Actions ================= */}
        <div className="space-y-3">
          <ActionTile
            href="/parent/report-absence"
            icon={<FileWarning className="h-5 w-5" />}
            title="Report an absence"
            description="Let the school know about sickness, appointments or emergencies."
          />
          <ActionTile
            href="/parent/history"
            icon={<CalendarCheck className="h-5 w-5" />}
            title="Attendance history"
            description="Every day marked for your child since enrolment."
          />
          <ActionTile
            href="/parent/alerts"
            icon={<Bell className="h-5 w-5" />}
            title="Alerts"
            description="Unexplained absence notifications that need a response."
            badge={unreadAlerts > 0 ? unreadAlerts : undefined}
          />
        </div>
      </div>
    </ParentShell>
  );
}

/* =========================================================
   Action tile
   ========================================================= */

function ActionTile({
  href,
  icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-lg border border-border bg-surface px-4 py-4 hover:border-blue/40 hover:bg-blue-light/30 transition"
    >
      <span className="h-11 w-11 rounded-lg bg-blue-light text-blue border border-blue/20 grid place-items-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium truncate">{title}</div>
          {badge !== undefined && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-danger text-white text-[10px] font-semibold">
              {badge}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {description}
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  );
}