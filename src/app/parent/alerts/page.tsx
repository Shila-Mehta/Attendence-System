"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Info,
  MessageSquare,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";

import { ParentShell } from "@/components/layout/ParentShell";
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
  parentAlerts as seed,
  parentChild,
  type ParentAlert,
} from "@/data/mock/parent";

type Filter = "all" | "unread" | "acknowledged";

export default function ParentAlertsPage() {
  /* ---------------- Data ---------------- */
  const [alerts, setAlerts] = useState<ParentAlert[]>(seed);

  /* ---------------- Async state slots (Phase 10) ---------------- */
  const [loading] = useState(false);
  const [error] = useState(false);

  /* ---------------- UI state ---------------- */
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<ParentAlert | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ParentAlert | null>(null);

  /* ---------------- Toasts ---------------- */
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const pushToast = (tone: ToastTone, title: string, description?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, tone, title, description }]);
  };
  const dismissToast = (id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  /* ---------------- Derived ---------------- */
  const unreadCount = alerts.filter((a) => !a.read).length;
  const pendingCount = alerts.filter((a) => !a.acknowledged).length;
  const acknowledgedCount = alerts.filter((a) => a.acknowledged).length;

  const filtered = useMemo(() => {
    if (filter === "unread") return alerts.filter((a) => !a.read);
    if (filter === "acknowledged") return alerts.filter((a) => a.acknowledged);
    return alerts;
  }, [alerts, filter]);

  /* ---------------- Actions ---------------- */
  const openAlert = (alert: ParentAlert) => {
    setActive(alert);
    if (!alert.read) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alert.id ? { ...a, read: true } : a))
      );
    }
  };

  const acknowledge = (id: string, reason: string, notes: string) => {
    console.log("ALERT ACKNOWLEDGED (mock):", { id, reason, notes });
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, read: true, acknowledged: true } : a
      )
    );
    setActive(null);
    pushToast(
      "success",
      "Response submitted",
      `Your reply has been sent to the school office.`
    );
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const removed = pendingDelete;
    setAlerts((prev) => prev.filter((a) => a.id !== removed.id));
    if (active?.id === removed.id) setActive(null);
    setPendingDelete(null);
    pushToast(
      "success",
      "Alert removed",
      `${removed.title} was cleared from your inbox.`
    );
  };

  return (
    <>
      <ParentShell
        childName={parentChild.name}
        childClass={`${parentChild.grade} · ${parentChild.class}`}
        alertCount={unreadCount}
      >
        {loading ? (
          <div className="rounded-lg border border-border bg-surface">
            <LoadingState
              title="Loading alerts…"
              description="Fetching absence notifications."
            />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-border bg-surface">
            <ErrorState
              title="Couldn't load alerts"
              description="The server didn't respond. Check your connection and try again."
              onRetry={() => window.location.reload()}
            />
          </div>
        ) : (
          <>
            <section className="mb-5 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                Alerts
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Unexplained absence notifications for{" "}
                {parentChild.name.split(" ")[0]}.
              </p>
            </section>

            {/* ================= Summary ================= */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <SummaryCard
                icon={<Bell className="h-4 w-4" />}
                label="Total alerts"
                value={alerts.length}
                tone="blue"
              />
              <SummaryCard
                icon={<AlertTriangle className="h-4 w-4" />}
                label="Unread"
                value={unreadCount}
                tone="danger"
              />
              <SummaryCard
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Acknowledged"
                value={acknowledgedCount}
                tone="success"
              />
            </section>

            {/* ================= Pending banner ================= */}
            {pendingCount > 0 && (
              <div className="mb-4 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger-light text-danger px-4 py-3 text-sm">
                <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">
                    {pendingCount} alert{pendingCount === 1 ? "" : "s"} awaiting
                    your response
                  </div>
                  <div className="text-xs mt-0.5 opacity-90">
                    Please confirm the reason for absence to help the school
                    keep accurate records.
                  </div>
                </div>
              </div>
            )}

            {/* ================= Filter tabs ================= */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-1 mb-4 overflow-x-auto pb-1">
              <FilterTab
                active={filter === "all"}
                onClick={() => setFilter("all")}
                count={alerts.length}
              >
                All
              </FilterTab>
              <FilterTab
                active={filter === "unread"}
                onClick={() => setFilter("unread")}
                count={unreadCount}
              >
                Unread
              </FilterTab>
              <FilterTab
                active={filter === "acknowledged"}
                onClick={() => setFilter("acknowledged")}
                count={acknowledgedCount}
              >
                Acknowledged
              </FilterTab>
            </div>

            {/* ================= Alert list ================= */}
            {filtered.length === 0 ? (
              <div className="rounded-lg border border-border bg-surface">
                {alerts.length === 0 ? (
                  <EmptyState
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    title="No alerts"
                    description="You don't have any absence notifications right now."
                  />
                ) : (
                  <EmptyState
                    icon={<Bell className="h-5 w-5" />}
                    title="No alerts match this filter"
                    description="Try a different filter to see more alerts."
                    action={
                      filter !== "all" ? (
                        <button
                          onClick={() => setFilter("all")}
                          className="h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted transition"
                        >
                          Show all
                        </button>
                      ) : undefined
                    }
                  />
                )}
              </div>
            ) : (
              <ul className="space-y-3">
                {filtered.map((a) => (
                  <AlertCard
                    key={a.id}
                    alert={a}
                    onOpen={() => openAlert(a)}
                    onDelete={() => setPendingDelete(a)}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </ParentShell>

      {/* ================= ACKNOWLEDGE MODAL ================= */}
      {active && (
        <AcknowledgeModal
          alert={active}
          onClose={() => setActive(null)}
          onSubmit={(reason, notes) => acknowledge(active.id, reason, notes)}
        />
      )}

      {/* ================= CONFIRM DELETE ================= */}
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this alert?"
        message={
          <>
            <span className="font-medium text-foreground">
              {pendingDelete?.title}
            </span>{" "}
            from {pendingDelete ? formatDate(pendingDelete.date) : ""} will be
            removed from your alerts inbox. This action cannot be undone.
          </>
        }
        confirmLabel="Delete alert"
        cancelLabel="Keep"
        tone="danger"
        icon={<Trash2 className="h-5 w-5" />}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      {/* ================= TOASTS ================= */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

/* =========================================================
   Sub-components
   ========================================================= */

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

function SummaryCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "blue" | "danger" | "success";
}) {
  const cls =
    tone === "blue"
      ? "text-blue"
      : tone === "danger"
      ? "text-danger"
      : "text-success";
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
      className={`h-8 px-3 rounded-full text-xs font-medium transition inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
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

function AlertCard({
  alert,
  onOpen,
  onDelete,
}: {
  alert: ParentAlert;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const tone =
    alert.severity === "danger"
      ? {
          border: "border-danger/30",
          bg: "bg-danger-light/40",
          icon: "bg-danger-light text-danger border border-danger/20",
          label: "text-danger",
        }
      : alert.severity === "warning"
      ? {
          border: "border-warning/30",
          bg: "bg-warning-light/40",
          icon: "bg-warning-light text-warning border border-warning/20",
          label: "text-warning",
        }
      : {
          border: "border-border",
          bg: "bg-surface",
          icon: "bg-blue-light text-blue border border-blue/20",
          label: "text-blue",
        };

  const Icon =
    alert.severity === "danger"
      ? ShieldAlert
      : alert.severity === "warning"
      ? AlertTriangle
      : Info;

  return (
    <li
      className={`rounded-lg border ${tone.border} ${
        alert.read ? "bg-surface" : tone.bg
      } p-4 transition hover:shadow-sm`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Content */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span
            className={`h-9 w-9 rounded-lg ${tone.icon} grid place-items-center shrink-0`}
          >
            <Icon className="h-4 w-4" />
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-sm font-semibold ${tone.label}`}>
                {alert.title}
              </span>
              {!alert.read && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-danger text-white text-[10px] font-semibold uppercase tracking-wide">
                  New
                </span>
              )}
              {alert.acknowledged && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success-light text-success border border-success/20 text-[10px] font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  Acknowledged
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {alert.message}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Clock className="h-3 w-3" />
                {formatDate(alert.date)} · {alert.createdAt}
              </span>
              <span className="font-mono">{alert.id}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 shrink-0 border-t sm:border-0 border-border pt-3 sm:pt-0">
          <button
            onClick={onOpen}
            className={`h-9 sm:h-8 px-3 rounded-md text-xs font-medium shrink-0 transition flex-1 sm:flex-none text-center justify-center inline-flex items-center ${
              alert.acknowledged
                ? "border border-border hover:bg-muted"
                : "bg-blue text-white hover:bg-navy"
            }`}
          >
            {alert.acknowledged ? "View Details" : "Respond Now"}
          </button>
          <button
            onClick={onDelete}
            className="h-9 w-9 sm:h-8 sm:w-8 rounded-md border border-border text-muted-foreground hover:text-danger hover:bg-danger-light inline-flex items-center justify-center transition-colors shrink-0"
            aria-label="Delete alert"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}

/* =========================================================
   Acknowledge modal
   ========================================================= */

const REASONS = [
  { id: "sickness", label: "Sickness", desc: "Fever, cold, flu or illness." },
  { id: "appointment", label: "Appointment", desc: "Doctor or medical visit." },
  { id: "emergency", label: "Emergency", desc: "Family or personal urgency." },
  { id: "other", label: "Other", desc: "Something else — describe below." },
];

function AcknowledgeModal({
  alert,
  onClose,
  onSubmit,
}: {
  alert: ParentAlert;
  onClose: () => void;
  onSubmit: (reason: string, notes: string) => void;
}) {
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string>("");

  const alreadyAcked = alert.acknowledged;

  const handleSubmit = () => {
    if (alreadyAcked) {
      onClose();
      return;
    }
    if (!reason) {
      setError("Please select a reason before submitting.");
      return;
    }
    if (reason === "other" && notes.trim().length < 5) {
      setError("Please describe the reason (at least 5 characters).");
      return;
    }
    onSubmit(reason, notes.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-lg bg-surface border border-border shadow-xl flex flex-col overflow-hidden">
        {/* Grabber (mobile) */}
        <div className="sm:hidden flex justify-center pt-2">
          <span className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 sm:px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <span className="h-9 w-9 rounded-lg bg-danger-light text-danger border border-danger/20 grid place-items-center shrink-0">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate">
                {alreadyAcked ? "Alert Details" : "Respond to Alert"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                {formatDate(alert.date)} · {alert.createdAt}
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
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto">
          <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Message from school
            </div>
            {alert.message}
          </div>

          {alreadyAcked ? (
            <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success-light text-success px-4 py-3 text-sm">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">Already acknowledged</div>
                <div className="text-xs mt-0.5 opacity-90">
                  This absence has been confirmed by the office.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <div className="text-sm font-medium mb-2">
                  Reason for absence
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {REASONS.map((r) => {
                    const active = reason === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setReason(r.id);
                          setError("");
                        }}
                        className={`rounded-md border p-3 text-left transition ${
                          active
                            ? "border-blue bg-blue-light/60 ring-2 ring-blue/30"
                            : "border-border hover:border-blue/40 hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-sm font-medium">
                              {r.label}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {r.desc}
                            </div>
                          </div>
                          <span
                            className={`h-3.5 w-3.5 rounded-full border-2 transition shrink-0 ${
                              active
                                ? "border-blue bg-blue"
                                : "border-muted-foreground/40"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Notes
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <textarea
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      setError("");
                    }}
                    rows={3}
                    placeholder="Anything the school should know…"
                    className="w-full rounded-md border border-input bg-surface pl-9 pr-3 py-2 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 resize-none"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger-light text-danger px-3 py-2 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 px-4 sm:px-5 py-3 sm:py-0 sm:h-16 border-t border-border shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto h-11 sm:h-9 px-4 rounded-md border border-border text-sm hover:bg-muted transition"
          >
            {alreadyAcked ? "Close" : "Cancel"}
          </button>
          {!alreadyAcked && (
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto h-11 sm:h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition inline-flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              Submit Response
            </button>
          )}
        </div>
      </div>
    </div>
  );
}