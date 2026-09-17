"use client";

import { useMemo, useState } from "react";
import {
  Clock,
  Bell,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  ShieldCheck,
} from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  ToastContainer,
  type ToastMessage,
  type ToastTone,
} from "@/components/ui/Toast";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  defaultSettings,
  type AttendanceSettings,
} from "@/data/mock/settings";

export default function AttendanceSettingsPage() {
  /* ---------------- Data ---------------- */
  const [settings, setSettings] =
    useState<AttendanceSettings>(defaultSettings);
  const [saved, setSaved] = useState<AttendanceSettings>(defaultSettings);

  /* ---------------- Async state slots (Phase 10) ---------------- */
  const [loading] = useState(false);
  const [error] = useState(false);

  /* ---------------- UI state ---------------- */
  const [justSaved, setJustSaved] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  /* ---------------- Toasts ---------------- */
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const pushToast = (tone: ToastTone, title: string, description?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, tone, title, description }]);
  };
  const dismissToast = (id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  /* ---------------- Derived ---------------- */
  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(saved),
    [settings, saved]
  );

  const warnings: string[] = [];

  if (
    minutesBetween(settings.dueTime, settings.cutoffTime) <=
    settings.gracePeriodMinutes
  ) {
    warnings.push("Cutoff must be later than due time + grace period.");
  }

  if (settings.archiveAfterDays >= settings.retentionDays) {
    warnings.push("Archive threshold should be less than total retention.");
  }

  if (
    settings.notifyParentsOnAbsence &&
    settings.alertDelayMinutes < 5
  ) {
    warnings.push(
      "Alert delay should be at least 5 minutes to avoid false alarms."
    );
  }

  /* ---------------- Actions ---------------- */
  const set = <K extends keyof AttendanceSettings>(
    key: K,
    value: AttendanceSettings[K]
  ) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const handleSave = () => {
    setSaved(settings);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2200);
    pushToast(
      "success",
      "Settings saved",
      "Your attendance configuration has been updated."
    );
  };

  const doDiscard = () => {
    setSettings(saved);
    setConfirmDiscard(false);
    pushToast(
      "info",
      "Changes discarded",
      "All unsaved edits have been reverted."
    );
  };

  const doRestoreDefaults = () => {
    setSettings(defaultSettings);
    setConfirmRestore(false);
    pushToast(
      "warning",
      "Defaults restored",
      "Review the settings and click Save to apply."
    );
  };

  return (
    <>
      <PageContainer
        title="Attendance Settings"
        description="Configure due time, grace period, cutoff and retention settings."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <button
              onClick={() => setConfirmRestore(true)}
              className="h-10 w-full rounded-md border border-border px-3 text-sm hover:bg-muted inline-flex items-center justify-center gap-1.5 transition sm:w-auto"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restore defaults
            </button>

            <button
              onClick={handleSave}
              disabled={!isDirty}
              className="h-10 w-full rounded-md bg-blue px-4 text-sm font-medium text-white hover:bg-navy transition disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center justify-center gap-1.5 sm:w-auto"
            >
              <Save className="h-4 w-4" />
              Save changes
            </button>
          </div>
        }
      >
        {loading ? (
          /* ================= LOADING (Phase 10) ================= */
          <div className="rounded-lg border border-border bg-surface">
            <LoadingState
              title="Loading settings…"
              description="Fetching attendance configuration from the server."
            />
          </div>
        ) : error ? (
          /* ================= ERROR (Phase 10) ================= */
          <div className="rounded-lg border border-border bg-surface">
            <ErrorState
              title="Couldn't load settings"
              description="The server didn't respond. Check your connection and try again."
              onRetry={() => window.location.reload()}
            />
          </div>
        ) : (
          <>
            {/* ================= Status banners ================= */}
            {justSaved && (
              <div className="mb-4 flex items-start gap-2 rounded-md border border-success/30 bg-success-light px-3 py-3 text-sm text-success sm:items-center sm:px-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" />
                <span>Settings saved.</span>
              </div>
            )}

            {warnings.length > 0 && (
              <div className="mb-4 rounded-md border border-warning/30 bg-warning-light px-3 py-3 text-sm text-warning sm:px-4">
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Please review
                </div>
                <ul className="mt-2 ml-5 list-disc space-y-1">
                  {warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {isDirty && !justSaved && (
              <div className="mb-4 rounded-md bg-warning-light/40 px-3 py-2 text-xs text-muted-foreground">
                You have unsaved changes.
              </div>
            )}

            {/* ================= Settings grid ================= */}
            <div className="grid gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
              {/* ---- Timing ---- */}
              <Section
                icon={<Clock className="h-4 w-4" />}
                title="Timing"
                description="When roll call opens, is due, and closes."
              >
                <Row
                  label="Roll call due time"
                  hint="Attendance is expected by this time."
                >
                  <TimeInput
                    value={settings.dueTime}
                    onChange={(v) => set("dueTime", v)}
                  />
                </Row>

                <Row
                  label="Grace period"
                  hint="Extra minutes allowed after due time."
                >
                  <NumberInput
                    value={settings.gracePeriodMinutes}
                    onChange={(v) => set("gracePeriodMinutes", v)}
                    min={0}
                    max={120}
                    suffix="min"
                  />
                </Row>

                <Row
                  label="Cutoff time"
                  hint="Unmarked students after this time become unexplained absences."
                >
                  <TimeInput
                    value={settings.cutoffTime}
                    onChange={(v) => set("cutoffTime", v)}
                  />
                </Row>

                <ToggleRow
                  label="Allow late submission"
                  hint="Teachers can still submit after cutoff, flagged as late."
                  checked={settings.allowLateSubmission}
                  onChange={(v) => set("allowLateSubmission", v)}
                />

                <ToggleRow
                  label="Require post-submit review"
                  hint="Office must review submitted attendance before it is final."
                  checked={settings.requireReview}
                  onChange={(v) => set("requireReview", v)}
                />
              </Section>

              {/* ---- Notifications ---- */}
              <Section
                icon={<Bell className="h-4 w-4" />}
                title="Parent Notifications"
                description="When and how parents are alerted."
              >
                <ToggleRow
                  label="Notify parents on absence"
                  hint="Send an alert when a student is marked absent or unexplained."
                  checked={settings.notifyParentsOnAbsence}
                  onChange={(v) => set("notifyParentsOnAbsence", v)}
                />

                <ToggleRow
                  label="Notify parents on late arrival"
                  hint="Send an alert for students marked late."
                  checked={settings.notifyParentsOnLate}
                  onChange={(v) => set("notifyParentsOnLate", v)}
                />

                <Row
                  label="Alert delay after cutoff"
                  hint="Wait this long before alerting parents, giving time for corrections."
                >
                  <NumberInput
                    value={settings.alertDelayMinutes}
                    onChange={(v) => set("alertDelayMinutes", v)}
                    min={0}
                    max={240}
                    suffix="min"
                    disabled={
                      !settings.notifyParentsOnAbsence &&
                      !settings.notifyParentsOnLate
                    }
                  />
                </Row>
              </Section>

              {/* ---- Retention ---- */}
              <Section
                icon={<Database className="h-4 w-4" />}
                title="Data Retention"
                description="How long attendance records are kept."
              >
                <Row
                  label="Retention period"
                  hint="Total days attendance is preserved."
                >
                  <NumberInput
                    value={settings.retentionDays}
                    onChange={(v) => set("retentionDays", v)}
                    min={30}
                    max={3650}
                    suffix="days"
                  />
                </Row>

                <Row
                  label="Archive after"
                  hint="Move records to archive after this many days."
                >
                  <NumberInput
                    value={settings.archiveAfterDays}
                    onChange={(v) => set("archiveAfterDays", v)}
                    min={7}
                    max={3650}
                    suffix="days"
                  />
                </Row>

                <div className="rounded-md border border-border bg-muted/30 px-3 py-3 text-xs leading-relaxed text-muted-foreground">
                  Records older than{" "}
                  <strong>{settings.retentionDays} days</strong> are permanently
                  deleted. Records older than{" "}
                  <strong>{settings.archiveAfterDays} days</strong> are moved to
                  archive (read-only).
                </div>
              </Section>

              {/* ---- Summary ---- */}
              <Section
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Effective Daily Flow"
                description="How the system will behave on a normal teaching day."
              >
                <ol className="space-y-4 text-sm">
                  <Step
                    n={1}
                    title="Roll call opens"
                    desc="Teachers and assistants can mark attendance."
                  />
                  <Step
                    n={2}
                    title={`Due by ${settings.dueTime}`}
                    desc={`With a ${settings.gracePeriodMinutes}-minute grace period.`}
                  />
                  <Step
                    n={3}
                    title={`Cutoff at ${settings.cutoffTime}`}
                    desc={
                      settings.allowLateSubmission
                        ? "Late submissions are still accepted and flagged."
                        : "Late submissions are blocked."
                    }
                  />
                  <Step
                    n={4}
                    title={`Parent alerts ${
                      settings.alertDelayMinutes > 0
                        ? `${settings.alertDelayMinutes} min after cutoff`
                        : "immediately after cutoff"
                    }`}
                    desc={
                      settings.notifyParentsOnAbsence
                        ? "Unexplained absences trigger parent notifications."
                        : "Parent notifications are disabled."
                    }
                  />
                  <Step
                    n={5}
                    title={
                      settings.requireReview
                        ? "Office review required"
                        : "Attendance finalised automatically"
                    }
                    desc={
                      settings.requireReview
                        ? "The Office confirms before records are locked."
                        : "Submitted records become final right away."
                    }
                  />
                </ol>
              </Section>
            </div>

            {/* ================= Sticky save bar ================= */}
            {isDirty && (
              <div className="sticky bottom-2 z-30 mt-5 rounded-lg border border-border bg-surface p-3 shadow-lg sm:bottom-4 sm:mt-6 sm:px-4 sm:py-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Unsaved changes</span>
                    <span className="hidden text-muted-foreground sm:inline">
                      {" "}
                      — review and save when ready.
                    </span>
                  </div>

                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    <button
                      onClick={() => setConfirmDiscard(true)}
                      className="h-10 flex-1 rounded-md border border-border px-3 text-sm hover:bg-muted transition sm:flex-none"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSave}
                      className="h-10 flex-1 rounded-md bg-blue px-4 text-sm font-medium text-white hover:bg-navy transition inline-flex items-center justify-center gap-1.5 sm:flex-none"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </PageContainer>

      {/* ================= CONFIRM RESTORE DEFAULTS ================= */}
      <ConfirmDialog
        open={confirmRestore}
        title="Restore default settings?"
        message={
          <>
            This will replace your current settings with the system defaults.
            You can still review them before saving.
          </>
        }
        confirmLabel="Restore defaults"
        cancelLabel="Cancel"
        tone="warning"
        icon={<RotateCcw className="h-5 w-5" />}
        onConfirm={doRestoreDefaults}
        onCancel={() => setConfirmRestore(false)}
      />

      {/* ================= CONFIRM DISCARD ================= */}
      <ConfirmDialog
        open={confirmDiscard}
        title="Discard unsaved changes?"
        message={
          <>
            All edits you&apos;ve made on this page will be reverted to the last
            saved settings. This action cannot be undone.
          </>
        }
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        tone="warning"
        icon={<RotateCcw className="h-5 w-5" />}
        onConfirm={doDiscard}
        onCancel={() => setConfirmDiscard(false)}
      />

      {/* ================= TOASTS ================= */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

/* =========================================================
   Helpers
   ========================================================= */

function minutesBetween(a: string, b: string): number {
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  return bh * 60 + bm - (ah * 60 + am);
}

/* =========================================================
   Layout primitives
   ========================================================= */

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-border bg-surface">
      <div className="border-b border-border px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-blue-light text-blue border border-blue/20">
            {icon}
          </span>
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
        {description && (
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-5 p-4 sm:p-5">{children}</div>
    </section>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium leading-5">{label}</div>
        {hint && (
          <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {hint}
          </div>
        )}
      </div>
      <div className="w-full shrink-0 sm:w-auto">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium leading-5">{label}</div>
        {hint && (
          <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {hint}
          </div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue/30 ${
          checked ? "bg-blue" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`absolute left-0.5 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function TimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 sm:h-10 w-full min-w-0 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 sm:w-32"
    />
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  suffix,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative w-full sm:w-32">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 sm:h-10 w-full rounded-md border border-input bg-surface pl-3 pr-12 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 disabled:bg-muted disabled:text-muted-foreground"
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
}

function Step({
  n,
  title,
  desc,
}: {
  n: number;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy text-xs font-semibold text-white">
        {n}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-medium leading-5">{title}</div>
        <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {desc}
        </div>
      </div>
    </li>
  );
}