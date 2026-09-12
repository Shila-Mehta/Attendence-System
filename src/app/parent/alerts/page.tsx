"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Info,
  MessageSquare,
  X,
  ShieldAlert,
} from "lucide-react";
import { ParentShell } from "@/components/layout/ParentShell";
import {
  parentAlerts as seed,
  parentChild,
  type ParentAlert,
} from "@/data/mock/parent";

type Filter = "all" | "unread" | "acknowledged";

export default function ParentAlertsPage() {
  const [alerts, setAlerts] = useState<ParentAlert[]>(seed);
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<ParentAlert | null>(null);

  const unreadCount = alerts.filter((a) => !a.read).length;
  const pendingCount = alerts.filter((a) => !a.acknowledged).length;

  const filtered = useMemo(() => {
    if (filter === "unread") return alerts.filter((a) => !a.read);
    if (filter === "acknowledged") return alerts.filter((a) => a.acknowledged);
    return alerts;
  }, [alerts, filter]);

  const openAlert = (alert: ParentAlert) => {
    setActive(alert);
    // mark as read when opened
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
  };

  return (
    <ParentShell
      childName={parentChild.name}
      childClass={`${parentChild.grade} · ${parentChild.class}`}
      alertCount={unreadCount}
    >
      <section className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Alerts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Unexplained absence notifications for {parentChild.name.split(" ")[0]}.
        </p>
      </section>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-3 mb-6">
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
          value={alerts.filter((a) => a.acknowledged).length}
          tone="success"
        />
      </section>

      {/* Pending banner */}
      {pendingCount > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger-light text-danger px-4 py-3 text-sm">
          <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <div className="font-medium">
              {pendingCount} alert{pendingCount === 1 ? "" : "s"} awaiting your
              response
            </div>
            <div className="text-xs mt-0.5 opacity-90">
              Please confirm the reason for absence to help the school keep
              accurate records.
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4">
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
          count={alerts.filter((a) => a.acknowledged).length}
        >
          Acknowledged
        </FilterTab>
      </div>

      {/* Alert list */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-6 py-16 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted grid place-items-center text-muted-foreground">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="mt-3 text-sm font-medium">You&apos;re all caught up</div>
          <div className="text-xs text-muted-foreground mt-1">
            No alerts match this filter.
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((a) => (
            <AlertCard key={a.id} alert={a} onOpen={() => openAlert(a)} />
          ))}
        </ul>
      )}

      {active && (
        <AcknowledgeModal
          alert={active}
          onClose={() => setActive(null)}
          onSubmit={(reason, notes) => acknowledge(active.id, reason, notes)}
        />
      )}
    </ParentShell>
  );
}

/* ---------------- sub-components ---------------- */

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

function AlertCard({
  alert,
  onOpen,
}: {
  alert: ParentAlert;
  onOpen: () => void;
}) {
  const tone =
    alert.severity === "danger"
      ? {
          border: "border-danger/30",
          bg: "bg-danger-light/40",
          icon: "bg-danger-light text-danger",
          label: "text-danger",
        }
      : alert.severity === "warning"
      ? {
          border: "border-warning/30",
          bg: "bg-warning-light/40",
          icon: "bg-warning-light text-warning",
          label: "text-warning",
        }
      : {
          border: "border-border",
          bg: "bg-surface",
          icon: "bg-blue-light text-blue",
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
      <div className="flex items-start gap-3">
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
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success-light text-success text-[10px] font-medium">
                <CheckCircle2 className="h-3 w-3" />
                Acknowledged
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(alert.date)} · {alert.createdAt}
            </span>
            <span className="font-mono">{alert.id}</span>
          </div>
        </div>

        <button
          onClick={onOpen}
          className={`h-8 px-3 rounded-md text-xs font-medium shrink-0 transition ${
            alert.acknowledged
              ? "border border-border hover:bg-muted"
              : "bg-blue text-white hover:bg-navy"
          }`}
        >
          {alert.acknowledged ? "View" : "Respond"}
        </button>
      </div>
    </li>
  );
}

/* ---------------- modal ---------------- */

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-lg bg-surface border border-border shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
          <div className="flex items-start gap-3 min-w-0">
            <span className="h-9 w-9 rounded-lg bg-danger-light text-danger grid place-items-center shrink-0">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate">
                {alreadyAcked ? "Alert details" : "Respond to alert"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(alert.date)} · {alert.createdAt}
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
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
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
                            className={`h-3.5 w-3.5 rounded-full border-2 transition ${
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
        <div className="flex items-center justify-end gap-2 px-5 h-16 border-t border-border">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-md border border-border text-sm hover:bg-muted"
          >
            {alreadyAcked ? "Close" : "Cancel"}
          </button>
          {!alreadyAcked && (
            <button
              onClick={handleSubmit}
              className="h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              Submit response
            </button>
          )}
        </div>
      </div>
    </div>
  );
}