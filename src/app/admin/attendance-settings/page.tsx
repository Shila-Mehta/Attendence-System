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
import {
  defaultSettings,
  type AttendanceSettings,
} from "@/data/mock/settings";

export default function AttendanceSettingsPage() {
  const [settings, setSettings] = useState<AttendanceSettings>(defaultSettings);
  const [saved, setSaved] = useState<AttendanceSettings>(defaultSettings);
  const [justSaved, setJustSaved] = useState(false);

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(saved),
    [settings, saved]
  );

  const set = <K extends keyof AttendanceSettings>(
    key: K,
    value: AttendanceSettings[K]
  ) => setSettings((s) => ({ ...s, [key]: value }));

  const handleSave = () => {
    setSaved(settings);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2200);
  };

  const handleReset = () => setSettings(saved);

  const handleRestoreDefaults = () => setSettings(defaultSettings);

  /* --- derived: due → grace → cutoff must be sequential --- */
  const warnings: string[] = [];
  if (minutesBetween(settings.dueTime, settings.cutoffTime) <= settings.gracePeriodMinutes) {
    warnings.push("Cutoff must be later than due time + grace period.");
  }
  if (settings.archiveAfterDays >= settings.retentionDays) {
    warnings.push("Archive threshold should be less than total retention.");
  }
  if (settings.notifyParentsOnAbsence && settings.alertDelayMinutes < 5) {
    warnings.push("Alert delay should be at least 5 minutes to avoid false alarms.");
  }

  return (
    <PageContainer
      title="Attendance Settings"
      description="Configure due time, grace period, cutoff and retention settings."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={handleRestoreDefaults}
            className="h-9 px-3 rounded-md border border-border text-sm hover:bg-muted inline-flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restore defaults
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
          >
            <Save className="h-4 w-4" />
            Save changes
          </button>
        </div>
      }
    >
      {/* Status banners */}
      {justSaved && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-success/30 bg-success-light text-success px-4 py-2.5 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          Settings saved. (Mock — no backend yet.)
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mb-4 rounded-md border border-warning/30 bg-warning-light text-warning px-4 py-3 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" />
            Please review
          </div>
          <ul className="mt-1.5 ml-6 list-disc space-y-0.5">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {isDirty && !justSaved && (
        <div className="mb-4 text-xs text-muted-foreground">
          You have unsaved changes.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ---- Timing ---- */}
        <Section
          icon={<Clock className="h-4 w-4" />}
          title="Timing"
          description="When roll call opens, is due, and closes."
        >
          <Row label="Roll call due time" hint="Attendance is expected by this time.">
            <TimeInput
              value={settings.dueTime}
              onChange={(v) => set("dueTime", v)}
            />
          </Row>

          <Row label="Grace period" hint="Extra minutes allowed after due time.">
            <NumberInput
              value={settings.gracePeriodMinutes}
              onChange={(v) => set("gracePeriodMinutes", v)}
              min={0}
              max={120}
              suffix="min"
            />
          </Row>

          <Row label="Cutoff time" hint="Unmarked students after this time become unexplained absences.">
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
              disabled={!settings.notifyParentsOnAbsence && !settings.notifyParentsOnLate}
            />
          </Row>
        </Section>

        {/* ---- Retention ---- */}
        <Section
          icon={<Database className="h-4 w-4" />}
          title="Data Retention"
          description="How long attendance records are kept."
        >
          <Row label="Retention period" hint="Total days attendance is preserved.">
            <NumberInput
              value={settings.retentionDays}
              onChange={(v) => set("retentionDays", v)}
              min={30}
              max={3650}
              suffix="days"
            />
          </Row>

          <Row label="Archive after" hint="Move records to archive after this many days.">
            <NumberInput
              value={settings.archiveAfterDays}
              onChange={(v) => set("archiveAfterDays", v)}
              min={7}
              max={3650}
              suffix="days"
            />
          </Row>

          <div className="rounded-md border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
            Records older than <strong>{settings.retentionDays} days</strong> are
            permanently deleted. Records older than{" "}
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
          <ol className="space-y-3 text-sm">
            <Step
              n={1}
              title={`Roll call opens`}
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

      {/* Sticky save bar */}
      {isDirty && (
        <div className="sticky bottom-4 z-30 mt-6 flex items-center justify-between gap-3 rounded-lg border border-border bg-surface shadow-lg px-4 py-3">
          <div className="text-sm">
            <span className="font-medium">Unsaved changes</span>
            <span className="hidden sm:inline text-muted-foreground">
              {" "}
              — review and save when ready.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="h-9 px-3 rounded-md border border-border text-sm hover:bg-muted"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              className="h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition inline-flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

/* ---------------- helpers ---------------- */

function minutesBetween(a: string, b: string): number {
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  return bh * 60 + bm - (ah * 60 + am);
}

/* ---------------- sub-components ---------------- */

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
    <section className="rounded-lg border border-border bg-surface">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 grid place-items-center rounded-md bg-blue-light text-blue">
            {icon}
          </span>
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="p-5 space-y-4">{children}</div>
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
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
    <div className="flex items-start sm:items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-blue" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
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
      className="h-9 w-32 rounded-md border border-input bg-surface px-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
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
    <div className="relative">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 w-32 rounded-md border border-input bg-surface pl-3 pr-12 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 disabled:bg-muted disabled:text-muted-foreground"
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
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
      <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-navy text-white grid place-items-center text-xs font-semibold">
        {n}
      </span>
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
    </li>
  );
}