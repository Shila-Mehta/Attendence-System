"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronLeft,
  FileWarning,
  Phone,
  Search,
  ShieldAlert,
  Trash2,
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
  unexplainedCases as seed,
  type UnexplainedCase,
} from "@/data/mock/office";

type Filter = "open" | "closed" | "all";

export default function UnexplainedAbsencePage() {
  /* ---------------- Data ---------------- */
  const [rows, setRows] = useState<UnexplainedCase[]>(seed);

  /* ---------------- Async state slots (Phase 10) ---------------- */
  const [loading] = useState(false);
  const [error] = useState(false);

  /* ---------------- Filters ---------------- */
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("open");

  /* ---------------- Selection ---------------- */
  const [selectedId, setSelectedId] = useState<string | null>(
    seed[0]?.id ?? null
  );
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  /* ---------------- Confirm state ---------------- */
  const [pendingDelete, setPendingDelete] = useState<UnexplainedCase | null>(
    null
  );
  const [pendingEscalate, setPendingEscalate] =
    useState<UnexplainedCase | null>(null);

  /* ---------------- Toasts ---------------- */
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const pushToast = (tone: ToastTone, title: string, description?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, tone, title, description }]);
  };
  const dismissToast = (id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  /* ---------------- Derived ---------------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const isOpen =
        r.status === "Awaiting parent" || r.status === "Parent responded";
      const isClosed = r.status === "Resolved" || r.status === "Escalated";
      const matchesFilter =
        filter === "all" ||
        (filter === "open" && isOpen) ||
        (filter === "closed" && isClosed);
      const matchesQuery =
        !q ||
        r.studentName.toLowerCase().includes(q) ||
        r.studentId.toLowerCase().includes(q) ||
        r.guardianName.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [rows, query, filter]);

  const selected = useMemo(
    () => rows.find((r) => r.id === selectedId) ?? null,
    [rows, selectedId]
  );

  const openCount = rows.filter(
    (r) => r.status === "Awaiting parent" || r.status === "Parent responded"
  ).length;

  const hasFilters = query.trim().length > 0 || filter !== "open";

  const clearFilters = () => {
    setQuery("");
    setFilter("open");
  };

  /* ---------------- Actions ---------------- */
  const update = (id: string, patch: Partial<UnexplainedCase>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const notify = (r: UnexplainedCase) => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    update(r.id, { notifiedAt: `${hh}:${mm}` });
    pushToast(
      "success",
      "Guardian notified",
      `${r.guardianName} was alerted at ${hh}:${mm}.`
    );
  };

  const resolve = (r: UnexplainedCase, note: string) => {
    update(r.id, { status: "Resolved", note });
    pushToast(
      "success",
      "Case resolved",
      `${r.studentName}'s absence has been closed.`
    );
  };

  const confirmEscalate = () => {
    if (!pendingEscalate) return;
    const target = pendingEscalate;
    update(target.id, {
      status: "Escalated",
      note: "No response in 24 hours.",
    });
    setPendingEscalate(null);
    pushToast(
      "warning",
      "Escalated to Principal",
      `${target.studentName}'s case has been forwarded.`
    );
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const removed = pendingDelete;
    setRows((prev) => prev.filter((r) => r.id !== removed.id));
    if (selectedId === removed.id) {
      setSelectedId(null);
      setMobileShowDetail(false);
    }
    setPendingDelete(null);
    pushToast(
      "success",
      "Case removed",
      `${removed.studentName}'s case was deleted from the queue.`
    );
  };

  const selectRow = (id: string) => {
    setSelectedId(id);
    setMobileShowDetail(true);
  };

  return (
    <PageContainer
      title="Unexplained Absence Queue"
      description="View and manage unexplained absences."
    >
      {loading ? (
        /* ================= LOADING (Phase 10) ================= */
        <div className="rounded-lg border border-border bg-surface">
          <LoadingState
            title="Loading queue…"
            description="Fetching unexplained absences from the server."
          />
        </div>
      ) : error ? (
        /* ================= ERROR (Phase 10) ================= */
        <div className="rounded-lg border border-border bg-surface">
          <ErrorState
            title="Couldn't load the queue"
            description="The server didn't respond. Check your connection and try again."
            onRetry={() => window.location.reload()}
          />
        </div>
      ) : (
        <>
          {/* ================= Split view ================= */}
          <div className="rounded-lg border border-border bg-surface overflow-hidden">
            <div className="grid md:grid-cols-[360px_minmax(0,1fr)] min-h-[600px]">
              {/* ---------- LEFT: list ---------- */}
              <div
                className={`border-b md:border-b-0 md:border-r border-border flex flex-col ${
                  mobileShowDetail ? "hidden md:flex" : "flex"
                }`}
              >
                {/* Search + filter */}
                <div className="p-4 border-b border-border space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search student or guardian…"
                      className="w-full h-10 sm:h-9 rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div
                    className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0"
                    style={{ scrollbarWidth: "none" }}
                  >
                    <FilterTab
                      active={filter === "open"}
                      onClick={() => setFilter("open")}
                    >
                      Open ({openCount})
                    </FilterTab>
                    <FilterTab
                      active={filter === "closed"}
                      onClick={() => setFilter("closed")}
                    >
                      Closed ({rows.length - openCount})
                    </FilterTab>
                    <FilterTab
                      active={filter === "all"}
                      onClick={() => setFilter("all")}
                    >
                      All
                    </FilterTab>
                  </div>
                </div>

                {/* List */}
                <ul className="flex-1 overflow-y-auto divide-y divide-border">
                  {filtered.length === 0 ? (
                    <li>
                      {rows.length === 0 ? (
                        <EmptyState
                          icon={<FileWarning className="h-5 w-5" />}
                          title="Queue is empty"
                          description="No unexplained absences have been recorded."
                        />
                      ) : (
                        <EmptyState
                          icon={<FileWarning className="h-5 w-5" />}
                          title="No cases match"
                          description="Try adjusting your search or filter."
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
                    </li>
                  ) : (
                    filtered.map((r) => (
                      <li key={r.id}>
                        <CaseListItem
                          caseItem={r}
                          selected={r.id === selectedId}
                          onClick={() => selectRow(r.id)}
                          onDelete={() => setPendingDelete(r)}
                        />
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* ---------- RIGHT: detail ---------- */}
              <div
                className={`flex flex-col ${
                  mobileShowDetail ? "flex" : "hidden md:flex"
                }`}
              >
                {selected ? (
                  <DetailPane
                    caseItem={selected}
                    onNotify={() => notify(selected)}
                    onResolve={(note) => resolve(selected, note)}
                    onEscalate={() => setPendingEscalate(selected)}
                    onBack={() => setMobileShowDetail(false)}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center px-6 py-16 text-center">
                    <div>
                      <div className="text-sm font-medium">No case selected</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Pick a case from the list to see details.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================= CONFIRM DELETE ================= */}
          <ConfirmDialog
            open={pendingDelete !== null}
            title="Delete case?"
            message={
              <>
                <span className="font-medium text-foreground">
                  {pendingDelete?.studentName}
                </span>{" "}
                · {pendingDelete?.grade} · {pendingDelete?.className} will be
                permanently removed from the queue. This action cannot be
                undone.
              </>
            }
            confirmLabel="Delete case"
            cancelLabel="Keep"
            tone="danger"
            icon={<Trash2 className="h-5 w-5" />}
            onConfirm={confirmDelete}
            onCancel={() => setPendingDelete(null)}
          />

          {/* ================= CONFIRM ESCALATE ================= */}
          <ConfirmDialog
            open={pendingEscalate !== null}
            title="Escalate to Principal?"
            message={
              <>
                <span className="font-medium text-foreground">
                  {pendingEscalate?.studentName}
                </span>
                &apos;s case will be forwarded to the Principal because the
                guardian hasn&apos;t responded. The case will be marked as
                Escalated.
              </>
            }
            confirmLabel="Escalate"
            cancelLabel="Cancel"
            tone="warning"
            icon={<ShieldAlert className="h-5 w-5" />}
            onConfirm={confirmEscalate}
            onCancel={() => setPendingEscalate(null)}
          />

          {/* ================= TOASTS ================= */}
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </>
      )}
    </PageContainer>
  );
}

/* =========================================================
   Helpers
   ========================================================= */

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function fmtDate(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/* =========================================================
   List item
   ========================================================= */

function CaseListItem({
  caseItem,
  selected,
  onClick,
  onDelete,
}: {
  caseItem: UnexplainedCase;
  selected: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const dot =
    caseItem.status === "Awaiting parent"
      ? "bg-danger"
      : caseItem.status === "Parent responded"
      ? "bg-warning"
      : caseItem.status === "Resolved"
      ? "bg-success"
      : "bg-navy";

  return (
    <div
      className={`group w-full flex items-start gap-3 px-4 py-3.5 text-left transition relative ${
        selected
          ? "bg-blue-light/50 border-l-2 border-blue"
          : "border-l-2 border-transparent hover:bg-muted/40"
      }`}
    >
      <button
        onClick={onClick}
        className="flex items-start gap-3 flex-1 min-w-0 text-left outline-none"
      >
        <span
          className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${dot}`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate pr-6">
            {caseItem.studentName}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate">
            {caseItem.grade} · {caseItem.className} · Absent{" "}
            {fmtDate(caseItem.date)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 truncate">
            {caseItem.status}
            {caseItem.notifiedAt ? ` · Notified ${caseItem.notifiedAt}` : ""}
          </div>
        </div>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute right-3 top-3.5 p-1.5 rounded-md text-muted-foreground hover:bg-danger-light hover:text-danger transition-colors shrink-0"
        aria-label="Delete case"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

/* =========================================================
   Detail pane
   ========================================================= */

function DetailPane({
  caseItem,
  onNotify,
  onResolve,
  onEscalate,
  onBack,
}: {
  caseItem: UnexplainedCase;
  onNotify: () => void;
  onResolve: (note: string) => void;
  onEscalate: () => void;
  onBack: () => void;
}) {
  const [resolving, setResolving] = useState(false);
  const [note, setNote] = useState("");

  const closed =
    caseItem.status === "Resolved" || caseItem.status === "Escalated";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <button
          onClick={onBack}
          className="md:hidden mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to list
        </button>

        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-navy text-white grid place-items-center text-base font-semibold shrink-0">
            {initials(caseItem.studentName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-semibold truncate">
                {caseItem.studentName}
              </h2>
              <StatusBadge status={caseItem.status} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {caseItem.studentId} · {caseItem.grade} · {caseItem.className}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Absence details */}
        <section>
          <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
            Absence
          </h3>
          <div className="rounded-md border border-border bg-background px-4 py-3">
            <div className="text-sm font-medium">
              {fmtDate(caseItem.date)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 tabular-nums">
              Reported at {caseItem.reportedAt}
            </div>
          </div>
        </section>

        {/* Guardian */}
        <section>
          <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
            Guardian
          </h3>
          <div className="rounded-md border border-border bg-background px-4 py-3">
            <div className="text-sm font-medium">{caseItem.guardianName}</div>
            <a
              href={`tel:${caseItem.guardianPhone}`}
              className="mt-1 text-sm text-blue hover:underline tabular-nums inline-flex items-center gap-2"
            >
              <Phone className="h-3.5 w-3.5" />
              {caseItem.guardianPhone}
            </a>
          </div>
        </section>

        {/* Notified */}
        <section>
          <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
            Notification
          </h3>
          <div className="rounded-md border border-border bg-background px-4 py-3 flex items-center gap-2 text-sm">
            <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
            {caseItem.notifiedAt ? (
              <span>
                Parent notified at{" "}
                <span className="font-medium tabular-nums">
                  {caseItem.notifiedAt}
                </span>
              </span>
            ) : (
              <span className="text-warning font-medium">
                Parent has not been notified yet
              </span>
            )}
          </div>
        </section>

        {/* Note */}
        {(caseItem.note || resolving) && (
          <section>
            <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
              Resolution note
            </h3>
            {resolving ? (
              <>
                <textarea
                  autoFocus
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="e.g. Parent confirmed sickness by phone."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 resize-none"
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setResolving(false);
                      setNote("");
                    }}
                    className="h-9 px-3 rounded-md border border-border text-sm hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={note.trim().length < 3}
                    onClick={() => {
                      onResolve(note.trim());
                      setResolving(false);
                      setNote("");
                    }}
                    className="h-9 px-4 rounded-md bg-success text-white text-sm font-medium hover:bg-success/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm resolution
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
                {caseItem.note ?? "—"}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-border bg-muted/20 p-4 space-y-2">
        {closed ? (
          <div className="text-xs text-muted-foreground text-center py-1">
            This case is closed. No further actions.
          </div>
        ) : (
          <>
            {!caseItem.notifiedAt && (
              <button
                onClick={onNotify}
                className="w-full h-10 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition inline-flex items-center justify-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Notify guardian
              </button>
            )}
            {!resolving && (
              <button
                onClick={() => setResolving(true)}
                className={`w-full h-10 rounded-md text-sm font-medium transition inline-flex items-center justify-center gap-2 ${
                  caseItem.notifiedAt
                    ? "bg-blue text-white hover:bg-navy"
                    : "border border-border hover:bg-muted"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark as resolved
              </button>
            )}
            <button
              onClick={onEscalate}
              className="w-full h-9 rounded-md text-sm text-danger hover:bg-danger-light transition inline-flex items-center justify-center gap-2"
            >
              <ShieldAlert className="h-4 w-4" />
              Escalate to Principal
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   Sub-components
   ========================================================= */

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-8 px-3 rounded-full text-xs font-medium transition shrink-0 whitespace-nowrap ${
        active ? "bg-navy text-white" : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: UnexplainedCase["status"] }) {
  const cls =
    status === "Awaiting parent"
      ? "bg-danger-light text-danger border border-danger/20"
      : status === "Parent responded"
      ? "bg-warning-light text-warning border border-warning/20"
      : status === "Resolved"
      ? "bg-success-light text-success border border-success/20"
      : "bg-navy text-white border border-navy";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}
    >
      {status}
    </span>
  );
}