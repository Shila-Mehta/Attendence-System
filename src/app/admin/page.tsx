"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookUser,
  ChevronRight,
  GraduationCap,
  Phone,
  School,
  UserRoundCog,
  Users,
  UserX,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { students } from "@/data/mock/student";
import { classes } from "@/data/mock/classes";
import { staff } from "@/data/mock/staff";
import { contacts } from "@/data/mock/contacts";

export default function AdminDashboardPage() {
  /* ---------------- Real counts from mock data ---------------- */
  const counts = {
    students: students.length,
    activeStudents: students.filter((s) => s.status === "Active").length,
    classes: classes.length,
    activeClasses: classes.filter((c) => c.status === "Active").length,
    staff: staff.length,
    activeStaff: staff.filter((s) => s.status === "Active").length,
    contacts: contacts.length,
  };

  /* ---------------- Data hygiene checks ---------------- */
  const studentsWithoutContact = students.filter((s) => {
    const has = contacts.some(
      (c) => c.studentId === s.id && c.status === "Active"
    );
    return !has;
  });

  const classesWithoutTeacher = classes.filter((c) => {
    const t = staff.find((s) => s.id === c.teacherId);
    return !t || t.status === "Inactive";
  });

  const staffOverloaded = staff.filter(
    (s) => s.role === "Teacher" && s.assignedClassIds.length >= 3
  );

  const inactiveStudents = students.filter((s) => s.status === "Inactive");

  const issues = [
    {
      id: "no-contact",
      count: studentsWithoutContact.length,
      title: "Students without an active contact",
      description:
        "These students cannot receive absence alerts until a guardian is assigned.",
      href: "/admin/contacts",
      icon: <Phone className="h-4 w-4" />,
      tone: "danger" as const,
    },
    {
      id: "no-teacher",
      count: classesWithoutTeacher.length,
      title: "Classes without an active teacher",
      description:
        "Roll call will not reach a responsible teacher until reassigned.",
      href: "/admin/classes",
      icon: <School className="h-4 w-4" />,
      tone: "warning" as const,
    },
    {
      id: "overloaded",
      count: staffOverloaded.length,
      title: "Teachers with 3 or more classes",
      description:
        "Confirm these workloads are intentional before the term starts.",
      href: "/admin/staff",
      icon: <UserRoundCog className="h-4 w-4" />,
      tone: "warning" as const,
    },
    {
      id: "inactive",
      count: inactiveStudents.length,
      title: "Inactive student records",
      description:
        "These will not appear in roll call but remain visible in reports.",
      href: "/admin/students",
      icon: <UserX className="h-4 w-4" />,
      tone: "muted" as const,
    },
  ];

  const totalIssues = issues.reduce((sum, i) => sum + i.count, 0);

  const recentStudents = [...students]
    .sort((a, b) => (a.enrolledAt < b.enrolledAt ? 1 : -1))
    .slice(0, 5);

  return (
    <PageContainer
      title="Admin Dashboard"
      description="Roster overview and data health for your school."
    >
      {/* ================= KPI row ================= */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <KpiCard
          icon={<GraduationCap className="h-4 w-4" />}
          label="Students"
          value={counts.students}
          sub={`${counts.activeStudents} active`}
          tone="blue"
          href="/admin/students"
        />
        <KpiCard
          icon={<School className="h-4 w-4" />}
          label="Classes"
          value={counts.classes}
          sub={`${counts.activeClasses} active`}
          tone="navy"
          href="/admin/classes"
        />
        <KpiCard
          icon={<UserRoundCog className="h-4 w-4" />}
          label="Staff"
          value={counts.staff}
          sub={`${counts.activeStaff} active`}
          tone="success"
          href="/admin/staff"
        />
        <KpiCard
          icon={<BookUser className="h-4 w-4" />}
          label="Contacts"
          value={counts.contacts}
          sub="Guardians on file"
          tone="muted"
          href="/admin/contacts"
        />
      </section>

      {/* ================= Needs attention ================= */}
      <section className="rounded-lg border border-border bg-surface mb-8">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <span className="h-9 w-9 rounded-lg bg-warning-light text-warning border border-warning/20 grid place-items-center shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">Needs attention</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalIssues === 0
                  ? "Everything looks clean."
                  : `${totalIssues} item${totalIssues === 1 ? "" : "s"} across the roster`}
              </p>
            </div>
          </div>
        </div>

        {totalIssues === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            No data issues right now.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {issues
              .filter((i) => i.count > 0)
              .map((i) => (
                <li key={i.id}>
                  <Link
                    href={i.href}
                    className="group flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-muted/30 transition"
                  >
                    <span
                      className={`h-9 w-9 rounded-lg border grid place-items-center shrink-0 ${
                        i.tone === "danger"
                          ? "bg-danger-light text-danger border-danger/20"
                          : i.tone === "warning"
                          ? "bg-warning-light text-warning border-warning/20"
                          : "bg-inactive-bg text-inactive border-inactive-border"
                      }`}
                    >
                      {i.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {i.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {i.description}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-full text-xs font-semibold tabular-nums shrink-0 ${
                        i.tone === "danger"
                          ? "bg-danger-light text-danger border border-danger/20"
                          : i.tone === "warning"
                          ? "bg-warning-light text-warning border border-warning/20"
                          : "bg-inactive-bg text-inactive border border-inactive-border"
                      }`}
                    >
                      {i.count}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-blue shrink-0 transition" />
                  </Link>
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* ================= Recent students ================= */}
      <section className="rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <span className="h-9 w-9 rounded-lg bg-blue-light text-blue border border-blue/20 grid place-items-center shrink-0">
              <Users className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">Recent enrollments</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Latest students added to the roster
              </p>
            </div>
          </div>
          <Link
            href="/admin/students"
            className="text-xs text-blue hover:underline inline-flex items-center gap-1 shrink-0"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <ul className="divide-y divide-border">
          {recentStudents.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-muted/30 transition"
            >
              <div className="h-9 w-9 rounded-full bg-navy text-white grid place-items-center text-xs font-semibold shrink-0">
                {initials(s.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{s.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {s.grade} · {s.class}
                </div>
              </div>
              <div className="hidden sm:block text-xs text-muted-foreground font-mono tabular-nums shrink-0">
                {s.id}
              </div>
              <StatusPill status={s.status} />
            </li>
          ))}
        </ul>
      </section>
    </PageContainer>
  );
}

/* =========================================================
   Sub-components
   ========================================================= */

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  tone,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  tone: "blue" | "success" | "navy" | "muted";
  href: string;
}) {
  const palette =
    tone === "blue"
      ? {
          icon: "bg-blue-light text-blue border-blue/20",
          value: "text-blue",
        }
      : tone === "success"
      ? {
          icon: "bg-success-light text-success border-success/20",
          value: "text-success",
        }
      : tone === "navy"
      ? {
          icon: "bg-navy/5 text-navy border-navy/20",
          value: "text-navy",
        }
      : {
          icon: "bg-inactive-bg text-inactive border-inactive-border",
          value: "text-foreground",
        };

  return (
    <Link
      href={href}
      className="group rounded-lg border border-border bg-surface p-4 sm:p-5 hover:border-blue/40 hover:shadow-sm transition block"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`h-9 w-9 rounded-lg border grid place-items-center shrink-0 ${palette.icon}`}
        >
          {icon}
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
      <div className="mt-3">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div
          className={`mt-1 text-2xl sm:text-3xl font-semibold tabular-nums ${palette.value}`}
        >
          {value}
        </div>
        {sub && (
          <div className="mt-1 text-[11px] text-muted-foreground truncate">
            {sub}
          </div>
        )}
      </div>
    </Link>
  );
}

function StatusPill({ status }: { status: "Active" | "Inactive" }) {
  const cls =
    status === "Active"
      ? "bg-success-light text-success border border-success/20"
      : "bg-inactive-bg text-inactive border border-inactive-border";
  return (
    <span
      className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 ${cls}`}
    >
      {status}
    </span>
  );
}