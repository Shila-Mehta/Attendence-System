"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  Search,
  ShieldAlert,
  TrendingUp,
  X,
  ArrowUpRight,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  unexplainedCases as seed,
  type UnexplainedCase,
} from "@/data/mock/office";

type Status = UnexplainedCase["status"];
type Filter = "all" | Status;

export default function UnexplainedAbsencePage() {
  const [cases, setCases] = useState<UnexplainedCase[]>(seed);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<UnexplainedCase | null>(null);

  const counts = useMemo(() => {
    const c = { all: cases.length, awaiting: 0, responded: 0, resolved: 0, escalated: 0 };
    for (const k of cases) {
      if (k.status === "Awaiting parent") c.awaiting++;
      else if (k.status === "Parent responded") c.responded++;
      else if (k.status === "Resolved") c.resolved++;
      else if (k.status === "Escalated") c.escalated++;
    }
    return c;
  }, [cases]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cases.filter((k) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "Awaiting parent" && k.status === "Awaiting parent") ||
        (filter === "Parent responded" && k.status === "Parent responded") ||
        (filter === "Resolved" && k.status === "Resolved") ||
        (filter === "Escalated" && k.status === "Escalated");
      const matchesQuery =
        !q ||
        k.studentName.toLowerCase().includes(q) ||
        k.studentId.toLowerCase().includes(q) ||
        k.guardianName.toLowerCase().includes(q) ||
        k.guardianPhone.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [cases, filter, query]);

  const updateCase = (id: string, patch: Partial<UnexplainedCase>) => {
    setCases((prev) =>
      prev.map((k) => (k.id === id ? { ...k, ...patch } : k))
    );
    if (active?.id === id) {
      setActive((a) => (a ? { ...a, ...patch } : a));
    }
  };

  const notifyParent = (k: UnexplainedCase) => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    updateCase(k.id, { notifiedAt: `${hh}:${mm}` });
    console.log("NOTIFY PARENT (mock):", k.studentId, k.guardianPhone);
  };

  const markResolved = (k: UnexplainedCase, note: string) => {
    updateCase(k.id, { status: "Resolved", note });
    setActive(null);
  };

  const escalate = (k: UnexplainedCase) => {
    updateCase(k.id, {
      status: "Escalated",
      note: "No response in 24 hours.",
    });
    setActive(null);
  };

  return (
    <PageContainer
      title="Unexplained Absence Queue"
      description="View and manage unexplained absences awaiting a reason."
    >
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          icon={<BellRing className="h-4 w-4" />}
          label="Awaiting parent"
          value={counts.awaiting}
          tone="danger"
        />
        <StatCard
          icon={<MessageSquare className="h-4 w-4" />}
          label="Parent responded"
          value={counts.responded}
          tone="warning"
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Resolved"
          value={counts.resolved}
          tone="success"
        />
        <StatCard
          icon={<ShieldAlert className="h-4 w-4" />}
          label="Escalated"
          value={counts.escalated}
          tone="navy"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by student, ID, guardian or phone…"
            className="w-full h-9 rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <FilterTab
            active={filter === "all"}
            onClick={() => setFilter("all")}
            count={counts.all}
          >
            All
          </FilterTab>
          <FilterTab
            active={filter === "Awaiting parent"}
            onClick={() => setFilter("Awaiting parent")}
            count={counts.awaiting}
          >
            Awaiting
          </FilterTab>
          <FilterTab
            active={filter === "Parent responded"}
            onClick={() => setFilter("Parent responded")}
            count={counts.responded}
          >
            Responded
          </FilterTab>
          <FilterTab
            active={filter === "Resolved"}
            onClick={() => setFilter("Resolved")}
            count={counts.resolved}
          >
            Resolved
          </FilterTab>
          <FilterTab
            active={filter === "Escalated"}
            onClick={() => setFilter("Escalated")}
            count={counts.escalated}
          >
            Escalated
          </FilterTab>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Absent date</th>
              <th className="px-4 py-3 font-medium">Guardian</th>
              <th className="px-4 py-3 font-medium">Notified</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  No cases match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((k) => (
                <tr
                  key={k.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                    {k.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="leading-tight">
                      <div className="font-medium">{k.studentName}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {k.studentId}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {k.grade} · {k.className}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="leading-tight">
                      <div>{fmtDate(k.date)}</div>
                      <div className="text-xs text-muted-foreground">
                        Reported {k.reportedAt}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="leading-tight">
                      <div>{k.guardianName}</div>
                      <div className="text-xs text-muted-foreground">
                        {k.guardianPhone}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">
                    {k.notifiedAt ? (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {k.notifiedAt}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={k.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button
                      onClick={() => setActive(k)}
                      className="h-8 px-3 rounded-md border border-border text-xs hover:bg-muted inline-flex items-center gap-1"
                    >
                      Open
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Showing {filtered.length} of {cases.length} cases
      </div>

      {/* Detail drawer */}
      {active && (
        <CaseDrawer
          caseItem={active}
          onClose={() => setActive(null)}
          onNotify={() => notifyParent(active)}
          onResolve={(note) => markResolved(active, note)}
          onEscalate={() => escalate(active)}
        />
      )}
    </PageContainer>
  );
}

/* ---------------- sub-components ---------------- */

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "danger" | "warning" | "success" | "navy";
}) {
  const cls =
    tone === "danger"
      ? "text-danger"
      : tone === "warning"
      ? "text-warning"
      : tone === "success"
      ? "text-success"
      : "text-navy";
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
  count: number;
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
      <span
        className={`inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] ${
          active ? "bg-white/20" : "bg-muted text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const cls =
    status === "Awaiting parent"
      ? "bg-danger-light text-danger"
      : status === "Parent responded"
      ? "bg-warning-light text-warning"
      : status === "Resolved"
      ? "bg-success-light text-success"
      : "bg-navy text-white";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {status}
    </span>
  );
}

/* ---------------- drawer ---------------- */

function CaseDrawer({
  caseItem,
  onClose,
  onNotify,
  onResolve,
  onEscalate,
}: {
  caseItem: UnexplainedCase;
  onClose: () => void;
  onNotify: () => void;
  onResolve: (note: string) => void;
  onEscalate: () => void;
}) {
  const [note, setNote] = useState(caseItem.note ?? "");
  const [resolving, setResolving] = useState(false);

  const resolved = caseItem.status === "Resolved";
  const escalated = caseItem.status === "Escalated";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <aside className="relative w-full max-w-md h-full bg-surface border-l border-border shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
          <div className="flex items-start gap-3 min-w-0">
            <span className="h-10 w-10 rounded-lg bg-danger-light text-danger grid place-items-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate">
                {caseItem.studentName}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                {caseItem.studentId} · {caseItem.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-center justify-between">
            <StatusBadge status={caseItem.status} />
            <span className="text-xs text-muted-foreground">
              {fmtDate(caseItem.date)} · {caseItem.reportedAt}
            </span>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <DetailBox label="Grade" value={caseItem.grade} />
            <DetailBox label="Class" value={caseItem.className} />
            <DetailBox
              label="Reported at"
              value={caseItem.reportedAt}
            />
            <DetailBox
              label="Parent notified"
              value={caseItem.notifiedAt ?? "Not yet"}
              muted={!caseItem.notifiedAt}
            />
          </div>

          {/* Guardian */}
          <section className="rounded-md border border-border bg-muted/20 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Guardian
            </div>
            <div className="text-sm font-medium">{caseItem.guardianName}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              {caseItem.guardianPhone}
            </div>
          </section>

          {/* Note */}
          {caseItem.note && !resolving && (
            <section className="rounded-md border border-border bg-muted/20 p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Note
              </div>
              <p className="text-sm">{caseItem.note}</p>
            </section>
          )}

          {resolving && (
            <section>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Resolution note
              </div>
              <textarea
                autoFocus
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="e.g. Parent confirmed sickness by phone."
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 resize-none"
              />
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => setResolving(false)}
                  className="h-8 px-3 rounded-md border border-border text-xs hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  disabled={note.trim().length < 3}
                  onClick={() => onResolve(note.trim())}
                  className="h-8 px-3 rounded-md bg-success text-white text-xs font-medium hover:bg-success/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm resolution
                </button>
              </div>
            </section>
          )}

          {/* Timeline */}
          <section>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Timeline
            </div>
            <ol className="relative border-l border-border ml-2 space-y-3">
              <TimelineItem
                title="Marked absent"
                time={`${fmtDate(caseItem.date)} · ${caseItem.reportedAt}`}
                done
              />
              <TimelineItem
                title="Parent notified"
                time={caseItem.notifiedAt ?? "—"}
                done={Boolean(caseItem.notifiedAt)}
              />
              <TimelineItem
                title="Parent responded"
                time={
                  caseItem.status === "Parent responded" ||
                  caseItem.status === "Resolved"
                    ? "—"
                    : "—"
                }
                done={
                  caseItem.status === "Parent responded" ||
                  caseItem.status === "Resolved"
                }
              />
              <TimelineItem
                title="Resolved"
                time={resolved ? "—" : "—"}
                done={resolved}
              />
            </ol>
          </section>
        </div>

        {/* Footer actions */}
        <div className="border-t border-border p-4 space-y-2">
          {!caseItem.notifiedAt && !resolved && !escalated && (
            <button
              onClick={onNotify}
              className="w-full h-10 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition inline-flex items-center justify-center gap-2"
            >
              <BellRing className="h-4 w-4" />
              Notify guardian
            </button>
          )}

          {!resolved && !escalated && (
            <button
              onClick={() => setResolving(true)}
              className="w-full h-10 rounded-md border border-border text-sm font-medium hover:bg-muted inline-flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark as resolved
            </button>
          )}

          {!escalated && !resolved && (
            <button
              onClick={onEscalate}
              className="w-full h-9 rounded-md text-sm text-danger hover:bg-danger-light inline-flex items-center justify-center gap-2"
            >
              <ShieldAlert className="h-4 w-4" />
              Escalate to Principal
            </button>
          )}

          {(resolved || escalated) && (
            <div className="flex items-start gap-2 rounded-md border border-border bg-muted/30 px-4 py-3 text-xs">
              <TrendingUp className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium text-foreground">
                  {resolved ? "Resolved" : "Escalated"}
                </div>
                <div className="text-muted-foreground mt-0.5">
                  {caseItem.note}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function DetailBox({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2.5">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-0.5 text-sm font-medium ${
          muted ? "text-muted-foreground" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function TimelineItem({
  title,
  time,
  done,
}: {
  title: string;
  time: string;
  done: boolean;
}) {
  return (
    <li className="ml-4">
      <span
        className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-surface ${
          done ? "bg-success" : "bg-muted-foreground/30"
        }`}
      />
      <div
        className={`text-sm ${done ? "text-foreground" : "text-muted-foreground"}`}
      >
        {title}
      </div>
      <div className="text-[11px] text-muted-foreground">{time}</div>
    </li>
  );
}