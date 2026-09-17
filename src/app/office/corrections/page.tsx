"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Search,
  ShieldCheck,
  AlertTriangle,
  History,
  FileEdit,
  Trash2,
  X,
  Inbox,
} from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  ToastContainer,
  type ToastMessage,
  type ToastTone,
} from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  correctionRequests as seed,
  type CorrectionRequest,
} from "@/data/mock/office";

type StatusFilter = "all" | CorrectionRequest["status"];
type AttendanceStatus = CorrectionRequest["currentStatus"];

export default function CorrectionsPage() {
  /* ---------------- Data ---------------- */
  const [requests, setRequests] = useState<CorrectionRequest[]>(seed);

  /* ---------------- Async state slots (Phase 10) ---------------- */
  const [loading] = useState(false);
  const [error] = useState(false);

  /* ---------------- Filters ---------------- */
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  /* ---------------- Modal state ---------------- */
  const [active, setActive] = useState<CorrectionRequest | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CorrectionRequest | null>(
    null
  );

  /* ---------------- Toasts ---------------- */
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const pushToast = (tone: ToastTone, title: string, description?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, tone, title, description }]);
  };
  const dismissToast = (id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  /* ---------------- Counts ---------------- */
  const counts = useMemo(() => {
    const c = { all: requests.length, pending: 0, approved: 0, rejected: 0 };
    for (const r of requests) {
      if (r.status === "Pending") c.pending++;
      else if (r.status === "Approved") c.approved++;
      else if (r.status === "Rejected") c.rejected++;
    }
    return c;
  }, [requests]);

  /* ---------------- Filtered ---------------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((r) => {
      const matchesFilter = filter === "all" || r.status === filter;
      const matchesQuery =
        !q ||
        r.studentName.toLowerCase().includes(q) ||
        r.studentId.toLowerCase().includes(q) ||
        r.requestedBy.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [requests, filter, query]);

  const hasFilters = query.trim().length > 0 || filter !== "all";

  const clearFilters = () => {
    setQuery("");
    setFilter("all");
  };

  /* ---------------- Actions ---------------- */
  const applyDecision = (
    id: string,
    status: "Approved" | "Rejected",
    reviewerNote: string
  ) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              reviewedBy: "Junaid Akhtar",
              reason:
                reviewerNote.trim().length > 0
                  ? `${r.reason}\n\nReviewer: ${reviewerNote.trim()}`
                  : r.reason,
            }
          : r
      )
    );
    setActive(null);

    const target = requests.find((r) => r.id === id);
    pushToast(
      status === "Approved" ? "success" : "info",
      status === "Approved" ? "Correction approved" : "Correction rejected",
      target
        ? `${target.studentName} · ${target.currentStatus} → ${target.requestedStatus}`
        : undefined
    );
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const removed = pendingDelete;
    setRequests((prev) => prev.filter((r) => r.id !== removed.id));
    if (active?.id === removed.id) setActive(null);
    setPendingDelete(null);
    pushToast(
      "success",
      "Request removed",
      `${removed.studentName}'s correction request was deleted.`
    );
  };

  return (
    <PageContainer
      title="Attendance Corrections"
      description="Correct attendance records with a required reason."
    >
      {/* ================= LOADING (Phase 10) ================= */}
      {loading ? (
        <div className="rounded-lg border border-border bg-surface">
          <LoadingState
            title="Loading corrections…"
            description="Fetching correction requests from the server."
          />
        </div>
      ) : error ? (
        /* ================= ERROR (Phase 10) ================= */
        <div className="rounded-lg border border-border bg-surface">
          <ErrorState
            title="Couldn't load correction requests"
            description="The server didn't respond. Check your connection and try again."
            onRetry={() => window.location.reload()}
          />
        </div>
      ) : (
        <>
          {/* ================= KPIs ================= */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <StatCard
              icon={<Clock className="h-4 w-4" />}
              label="Pending"
              value={counts.pending}
              tone="warning"
            />
            <StatCard
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Approved"
              value={counts.approved}
              tone="success"
            />
            <StatCard
              icon={<XCircle className="h-4 w-4" />}
              label="Rejected"
              value={counts.rejected}
              tone="danger"
            />
          </div>

          {/* ================= FILTERS ================= */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-4">
            <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by student, ID or requested by…"
                className="w-full h-10 sm:h-9 rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <FilterTab
                active={filter === "all"}
                onClick={() => setFilter("all")}
                count={counts.all}
              >
                All
              </FilterTab>
              <FilterTab
                active={filter === "Pending"}
                onClick={() => setFilter("Pending")}
                count={counts.pending}
              >
                Pending
              </FilterTab>
              <FilterTab
                active={filter === "Approved"}
                onClick={() => setFilter("Approved")}
                count={counts.approved}
              >
                Approved
              </FilterTab>
              <FilterTab
                active={filter === "Rejected"}
                onClick={() => setFilter("Rejected")}
                count={counts.rejected}
              >
                Rejected
              </FilterTab>
            </div>
          </div>

          {/* ================= EMPTY ================= */}
          {filtered.length === 0 && (
            <div className="rounded-lg border border-border bg-surface">
              {requests.length === 0 ? (
                <EmptyState
                  icon={<Inbox className="h-5 w-5" />}
                  title="No correction requests"
                  description="When teachers request corrections, they'll show up here."
                />
              ) : (
                <EmptyState
                  icon={<FileEdit className="h-5 w-5" />}
                  title="No requests match your filters"
                  description="Try adjusting your search or clearing the filters."
                  action={
                    hasFilters ? (
                      <button
                        onClick={clearFilters}
                        className="h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted transition"
                      >
                        Clear filters
                      </button>
                    ) : undefined
                  }
                />
              )}
            </div>
          )}

          {/* ================= MOBILE: cards ================= */}
          {filtered.length > 0 && (
            <div className="md:hidden space-y-3">
              {filtered.map((r) => (
                <article
                  key={r.id}
                  className="rounded-lg border border-border bg-surface overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 p-4">
                    <span className="h-10 w-10 rounded-lg bg-blue-light text-blue border border-blue/20 grid place-items-center shrink-0">
                      <FileEdit className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {r.studentName}
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            {r.studentId} · {r.grade} · {r.className}
                          </div>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                    </div>
                  </div>

                  {/* Change row */}
                  <div className="px-4 pb-3">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                      Requested change
                    </div>
                    <div className="flex items-center gap-2">
                      <AttendancePill status={r.currentStatus} />
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <AttendancePill status={r.requestedStatus} />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="px-4 pb-4 space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span className="tabular-nums">{fmtDate(r.date)}</span>
                    </div>
                    <div className="truncate">
                      Requested by <span className="text-foreground">{r.requestedBy}</span>
                      {" · "}
                      <span className="tabular-nums">{r.requestedAt}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-[1fr_auto] border-t border-border">
                    <button
                      onClick={() => setActive(r)}
                      className="h-11 flex items-center justify-center gap-1.5 text-xs font-medium hover:bg-muted transition border-r border-border"
                    >
                      {r.status === "Pending" ? "Review" : "View"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setPendingDelete(r)}
                      className="h-11 px-5 flex items-center justify-center gap-1.5 text-xs font-medium text-danger hover:bg-danger-light transition"
                      aria-label={`Delete request for ${r.studentName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* ================= DESKTOP: table ================= */}
          {filtered.length > 0 && (
            <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-surface">
              <table className="w-full text-sm min-w-[980px]">
                <thead>
                  <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Change</th>
                    <th className="px-4 py-3 font-medium">Requested by</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                        {r.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="leading-tight">
                          <div className="font-medium">{r.studentName}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.grade} · {r.className}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                        {fmtDate(r.date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <AttendancePill status={r.currentStatus} small />
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <AttendancePill status={r.requestedStatus} small />
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="leading-tight">
                          <div>{r.requestedBy}</div>
                          <div className="text-xs text-muted-foreground tabular-nums">
                            {r.requestedAt}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActive(r)}
                            className="h-8 px-3 rounded-md border border-border text-xs hover:bg-muted inline-flex items-center gap-1"
                          >
                            {r.status === "Pending" ? "Review" : "View"}
                            <ArrowRight className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setPendingDelete(r)}
                            className="h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-danger hover:bg-danger-light inline-flex items-center justify-center transition-colors shrink-0"
                            aria-label={`Delete request for ${r.studentName}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-3 text-xs text-muted-foreground">
              Showing {filtered.length} of {requests.length} requests
            </div>
          )}

          {/* ================= DRAWER ================= */}
          {active && (
            <ReviewDrawer
              request={active}
              onClose={() => setActive(null)}
              onApprove={(note) => applyDecision(active.id, "Approved", note)}
              onReject={(note) => applyDecision(active.id, "Rejected", note)}
            />
          )}

          {/* ================= CONFIRM DELETE ================= */}
          <ConfirmDialog
            open={pendingDelete !== null}
            title="Delete correction request?"
            message={
              <>
                <span className="font-medium text-foreground">
                  {pendingDelete?.studentName}
                </span>
                {" · "}
                {pendingDelete?.currentStatus} → {pendingDelete?.requestedStatus}{" "}
                will be removed from the queue. This action cannot be undone.
              </>
            }
            confirmLabel="Delete request"
            cancelLabel="Keep"
            tone="danger"
            icon={<Trash2 className="h-5 w-5" />}
            onConfirm={confirmDelete}
            onCancel={() => setPendingDelete(null)}
          />

          {/* ================= TOASTS ================= */}
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </>
      )}
    </PageContainer>
  );
}

/* =========================================================
   Sub-components
   ========================================================= */

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
  tone: "warning" | "success" | "danger";
}) {
  const cls =
    tone === "warning"
      ? "text-warning"
      : tone === "success"
      ? "text-success"
      : "text-danger";
  return (
    <div className="rounded-lg border border-border bg-surface p-3 sm:p-4 min-w-0">
      <div className={`flex items-center gap-1.5 text-xs ${cls}`}>
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div
        className={`mt-1 text-2xl sm:text-3xl font-semibold tabular-nums ${cls}`}
      >
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
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-8 px-3 rounded-md text-xs font-medium transition inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
        active ? "bg-navy text-white" : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
      <span
        className={`inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] tabular-nums ${
          active ? "bg-white/20" : "bg-muted text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function StatusBadge({ status }: { status: CorrectionRequest["status"] }) {
  const cls =
    status === "Pending"
      ? "bg-warning-light text-warning border border-warning/20"
      : status === "Approved"
      ? "bg-success-light text-success border border-success/20"
      : "bg-danger-light text-danger border border-danger/20";
  const Icon =
    status === "Pending"
      ? Clock
      : status === "Approved"
      ? CheckCircle2
      : XCircle;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

function AttendancePill({
  status,
  small,
}: {
  status: AttendanceStatus;
  small?: boolean;
}) {
  const cls =
    status === "Present"
      ? "bg-success-light text-success border border-success/20"
      : status === "Absent"
      ? "bg-danger-light text-danger border border-danger/20"
      : "bg-warning-light text-warning border border-warning/20";
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${cls} ${
        small ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-xs"
      }`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   Review drawer
   ========================================================= */

function ReviewDrawer({
  request,
  onClose,
  onApprove,
  onReject,
}: {
  request: CorrectionRequest;
  onClose: () => void;
  onApprove: (note: string) => void;
  onReject: (note: string) => void;
}) {
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<"idle" | "approving" | "rejecting">("idle");

  const isPending = request.status === "Pending";

  const handleApprove = () => {
    if (mode !== "approving") {
      setMode("approving");
      return;
    }
    onApprove(note);
  };

  const handleReject = () => {
    if (mode !== "rejecting") {
      setMode("rejecting");
      return;
    }
    if (note.trim().length < 3) return;
    onReject(note);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <aside className="relative w-full sm:max-w-md h-full bg-surface sm:border-l border-border shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 sm:px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <span className="h-10 w-10 rounded-lg bg-blue-light text-blue border border-blue/20 grid place-items-center shrink-0">
              <FileEdit className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate">
                {request.studentName}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                {request.studentId} · {request.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          <div className="flex items-center justify-between">
            <StatusBadge status={request.status} />
            <span className="text-xs text-muted-foreground tabular-nums">
              {fmtDate(request.date)} · {request.requestedAt}
            </span>
          </div>

          {/* Change panel */}
          <section className="rounded-md border border-border bg-muted/20 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Requested change
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="text-center flex-1">
                <AttendancePill status={request.currentStatus} />
                <div className="text-[11px] text-muted-foreground mt-1">
                  Current
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="text-center flex-1">
                <AttendancePill status={request.requestedStatus} />
                <div className="text-[11px] text-muted-foreground mt-1">
                  Requested
                </div>
              </div>
            </div>
          </section>

          {/* Student & class */}
          <div className="grid grid-cols-2 gap-3">
            <DetailBox label="Grade" value={request.grade} />
            <DetailBox label="Class" value={request.className} />
          </div>

          {/* Requester */}
          <section className="rounded-md border border-border bg-muted/20 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Requested by
            </div>
            <div className="text-sm font-medium">{request.requestedBy}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {request.requestedAt} · {fmtDate(request.date)}
            </div>
          </section>

          {/* Reason */}
          <section>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Reason for correction
            </div>
            <p className="text-sm whitespace-pre-line">{request.reason}</p>
          </section>

          {/* Reviewer note input (only when pending & in a decision mode) */}
          {isPending && mode !== "idle" && (
            <section>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {mode === "approving"
                  ? "Approval note (optional)"
                  : "Rejection reason (required)"}
              </div>
              <textarea
                autoFocus
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder={
                  mode === "approving"
                    ? "e.g. Confirmed with teacher."
                    : "Explain why this correction is being rejected."
                }
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 resize-none"
              />
              {mode === "rejecting" && note.trim().length < 3 && (
                <p className="mt-1.5 text-xs text-danger">
                  A reason is required to reject.
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => setMode("idle")}
                  className="h-8 px-3 rounded-md border border-border text-xs hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={mode === "approving" ? handleApprove : handleReject}
                  disabled={mode === "rejecting" && note.trim().length < 3}
                  className={`h-8 px-3 rounded-md text-white text-xs font-medium transition inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                    mode === "approving"
                      ? "bg-success hover:bg-success/90"
                      : "bg-danger hover:bg-danger/90"
                  }`}
                >
                  {mode === "approving" ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Confirm approval
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" />
                      Confirm rejection
                    </>
                  )}
                </button>
              </div>
            </section>
          )}

          {/* Timeline */}
          <section>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground mb-2">
              <History className="h-3.5 w-3.5" />
              Timeline
            </div>
            <ol className="relative border-l border-border ml-2 space-y-3">
              <TimelineItem
                title="Correction requested"
                detail={`${request.requestedBy} · ${request.requestedAt}`}
                done
              />
              <TimelineItem
                title="Office review"
                detail={
                  isPending
                    ? "Pending"
                    : `${request.reviewedBy ?? "Office"} · ${request.status}`
                }
                done={!isPending}
              />
              <TimelineItem
                title="Record updated"
                detail={request.status === "Approved" ? "Applied" : "—"}
                done={request.status === "Approved"}
              />
            </ol>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 space-y-2 shrink-0">
          {isPending && mode === "idle" && (
            <>
              <button
                onClick={handleApprove}
                className="w-full h-10 rounded-md bg-success text-white text-sm font-medium hover:bg-success/90 transition inline-flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve correction
              </button>
              <button
                onClick={handleReject}
                className="w-full h-10 rounded-md border border-danger text-danger text-sm font-medium hover:bg-danger-light inline-flex items-center justify-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject correction
              </button>
            </>
          )}

          {!isPending && (
            <div
              className={`flex items-start gap-2 rounded-md border px-4 py-3 text-xs ${
                request.status === "Approved"
                  ? "border-success/30 bg-success-light text-success"
                  : "border-danger/30 bg-danger-light text-danger"
              }`}
            >
              {request.status === "Approved" ? (
                <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              )}
              <div>
                <div className="font-medium">
                  {request.status} by {request.reviewedBy}
                </div>
                <div className="mt-0.5 opacity-90">
                  {request.status === "Approved"
                    ? "The attendance record has been updated."
                    : "The original record stands."}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2.5">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  );
}

function TimelineItem({
  title,
  detail,
  done,
}: {
  title: string;
  detail: string;
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
      <div className="text-[11px] text-muted-foreground">{detail}</div>
    </li>
  );
}