"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  CircleSlash,
  Save,
  RotateCcw,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  rollCallClasses,
  rollCallStudents,
  type RollCallStatus,
  type RollCallStudent,
} from "@/data/mock/rollcall";

type Marks = Record<string, RollCallStatus | undefined>;

export default function RollCallPage() {
  const [classId, setClassId] = useState<string>(rollCallClasses[0].id);
  const [marks, setMarks] = useState<Marks>({});
  const [submitted, setSubmitted] = useState(false);

  const currentClass = useMemo(
    () => rollCallClasses.find((c) => c.id === classId)!,
    [classId]
  );

  const students = useMemo(
    () => rollCallStudents.filter((s) => s.classId === classId),
    [classId]
  );

  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    for (const s of students) {
      const m = marks[s.id];
      if (m === "Present") present++;
      else if (m === "Absent") absent++;
      else if (m === "Late") late++;
    }
    const unmarked = students.length - present - absent - late;
    return { present, absent, late, unmarked, total: students.length };
  }, [students, marks]);

  const setMark = (studentId: string, status: RollCallStatus) => {
    setMarks((m) => ({ ...m, [studentId]: status }));
    setSubmitted(false);
  };

  const markAllPresent = () => {
    setMarks((m) => {
      const next = { ...m };
      for (const s of students) next[s.id] = "Present";
      return next;
    });
    setSubmitted(false);
  };

  const clearAll = () => {
    setMarks((m) => {
      const next = { ...m };
      for (const s of students) delete next[s.id];
      return next;
    });
    setSubmitted(false);
  };

  const canSubmit = counts.unmarked === 0 && !submitted;

  const handleSubmit = () => {
    console.log("ROLL CALL SUBMITTED (mock):", {
      classId,
      className: `${currentClass.grade} · ${currentClass.name}`,
      marks,
      counts,
    });
    setSubmitted(true);
  };

  const switchClass = (id: string) => {
    setClassId(id);
    setSubmitted(false);
  };

  return (
    <PageContainer
      title="Morning Roll Call"
      description="Complete and submit the morning attendance list."
      actions={
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={clearAll}
            className="h-10 sm:h-9 px-3 rounded-md border border-border text-sm font-medium sm:font-normal hover:bg-muted inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-none transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </button>
          <button
            onClick={markAllPresent}
            className="h-10 sm:h-9 px-3 rounded-md border border-border text-sm font-medium sm:font-normal hover:bg-muted inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-none transition-colors"
          >
            <UserCheck className="h-3.5 w-3.5" />
            All present
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-10 sm:h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5 w-full sm:w-auto"
          >
            <Save className="h-4 w-4" />
            Submit
          </button>
        </div>
      }
    >
      {/* Success banner */}
      {submitted && (
        <div className="mb-4 flex items-start gap-3 rounded-md border border-success/30 bg-success-light text-success px-4 py-3">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="text-sm">
            <div className="font-medium">
              Attendance submitted for {currentClass.grade} · {currentClass.name}.
            </div>
            <div className="text-xs mt-0.5">
              {counts.present} present · {counts.absent} absent · {counts.late} late.
              Post-submit review screen is next.
            </div>
          </div>
        </div>
      )}

      {/* Class picker + meta */}
      <div className="rounded-lg border border-border bg-surface mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="h-9 w-9 rounded-lg bg-blue-light text-blue border border-blue/20 grid place-items-center shrink-0">
              <Users className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Class</div>
              <div className="text-sm font-medium truncate">
                {currentClass.grade} · {currentClass.name}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <div className="text-xs text-muted-foreground truncate">
              {currentClass.room} · {currentClass.teacher}
            </div>

            <div className="relative w-full sm:w-auto">
              <select
                value={classId}
                onChange={(e) => switchClass(e.target.value)}
                className="appearance-none w-full sm:w-auto h-10 sm:h-9 pl-3 pr-9 rounded-md border border-input bg-surface text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
              >
                {rollCallClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.grade} · {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
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
            icon={<CircleSlash className="h-4 w-4" />}
            label="Unmarked"
            value={counts.unmarked}
            tone="muted"
          />
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>
            {counts.total - counts.unmarked} of {counts.total} marked
          </span>
          <span>{Math.round(((counts.total - counts.unmarked) / counts.total) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all ${
              counts.unmarked === 0 ? "bg-success" : "bg-blue"
            }`}
            style={{
              width: `${((counts.total - counts.unmarked) / counts.total) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Student list */}
      <div className="overflow-x-auto overflow-y-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm min-w-[550px]">
          <thead>
            <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium w-12">#</th>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium w-[280px] text-right">
                Mark attendance
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <StudentRow
                key={s.id}
                index={idx + 1}
                student={s}
                mark={marks[s.id]}
                onChange={(status) => setMark(s.id, status)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground">
        <div>
          {counts.unmarked > 0
            ? `${counts.unmarked} student${counts.unmarked === 1 ? "" : "s"} still unmarked.`
            : "All students marked. Ready to submit."}
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono">
            P
          </kbd>
          Present
          <kbd className="ml-3 px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono">
            A
          </kbd>
          Absent
          <kbd className="ml-3 px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono">
            L
          </kbd>
          Late
        </div>
      </div>
    </PageContainer>
  );
}

/* ---------------- sub-components ---------------- */

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
      <div className={`mt-1 text-xl font-semibold ${cls} tabular-nums`}>{value}</div>
    </div>
  );
}

function StudentRow({
  index,
  student,
  mark,
  onChange,
}: {
  index: number;
  student: RollCallStudent;
  mark: RollCallStatus | undefined;
  onChange: (s: RollCallStatus) => void;
}) {
  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3 text-xs text-muted-foreground font-mono whitespace-nowrap">{index}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-navy text-white grid place-items-center text-xs font-semibold shrink-0">
            {initials(student.name)}
          </div>
          <div className="leading-tight min-w-0">
            <div className="font-medium truncate">{student.name}</div>
            <div className="text-xs text-muted-foreground font-mono truncate">{student.id}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          <MarkButton
            active={mark === "Present"}
            onClick={() => onChange("Present")}
            tone="success"
            label="P"
            title="Present"
          />
          <MarkButton
            active={mark === "Absent"}
            onClick={() => onChange("Absent")}
            tone="danger"
            label="A"
            title="Absent"
            withLeftBorder
          />
          <MarkButton
            active={mark === "Late"}
            onClick={() => onChange("Late")}
            tone="warning"
            label="L"
            title="Late"
            withLeftBorder
          />
        </div>
      </td>
    </tr>
  );
}

function MarkButton({
  active,
  onClick,
  tone,
  label,
  title,
  withLeftBorder,
}: {
  active: boolean;
  onClick: () => void;
  tone: "success" | "danger" | "warning";
  label: string;
  title: string;
  withLeftBorder?: boolean;
}) {
  const activeCls =
    tone === "success"
      ? "bg-success text-white"
      : tone === "danger"
      ? "bg-danger text-white"
      : "bg-warning text-white";

  const hoverCls =
    tone === "success"
      ? "hover:bg-success-light hover:text-success"
      : tone === "danger"
      ? "hover:bg-danger-light hover:text-danger"
      : "hover:bg-warning-light hover:text-warning";

  return (
    <button
      title={title}
      onClick={onClick}
      className={`h-9 sm:h-8 w-11 sm:w-10 grid place-items-center text-xs font-semibold transition shrink-0 ${
        active ? activeCls : `text-muted-foreground ${hoverCls}`
      } ${withLeftBorder ? "border-l border-border" : ""}`}
    >
      {label}
    </button>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}