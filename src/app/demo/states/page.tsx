"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  Info,
  Trash2,
  Users,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  ToastContainer,
  type ToastMessage,
  type ToastTone,
} from "@/components/ui/Toast";

export default function StatesDemoPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = (tone: ToastTone, title: string, description?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, tone, title, description }]);
  };

  const dismissToast = (id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <PageContainer
      title="UI States Demo"
      description="Every state component in one place. Delete this page after you've reviewed it."
    >
      {/* ================= LOADING ================= */}
      <Section
        title="1. LoadingState"
        when="When a page or section is waiting for data."
      >
        <div className="rounded-lg border border-border bg-surface">
          <LoadingState
            title="Loading students…"
            description="Fetching the roster from the server."
          />
        </div>
      </Section>

      {/* ================= ERROR ================= */}
      <Section
        title="2. ErrorState"
        when="When data failed to load. Includes a retry button."
      >
        <div className="rounded-lg border border-border bg-surface">
          <ErrorState
            title="Couldn't load students"
            description="The server didn't respond. Check your connection and try again."
            onRetry={() => pushToast("info", "Retrying…", "Mock retry.")}
          />
        </div>
      </Section>

      {/* ================= EMPTY — variations ================= */}
      <Section
        title="3. EmptyState"
        when="When data loaded fine, but the list is empty."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface">
            <EmptyState
              icon={<GraduationCap className="h-5 w-5" />}
              title="No students yet"
              description="Add your first student to get started."
              action={
                <button className="h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition">
                  Add student
                </button>
              }
            />
          </div>

          <div className="rounded-lg border border-border bg-surface">
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="No staff match your filters"
              description="Try adjusting the search or clearing filters."
              action={
                <button className="h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted transition">
                  Clear filters
                </button>
              }
            />
          </div>
        </div>
      </Section>

      {/* ================= CONFIRM DIALOG ================= */}
      <Section
        title="4. ConfirmDialog"
        when="Before a destructive action like delete."
      >
        <div className="rounded-lg border border-border bg-surface p-5">
          <button
            onClick={() => setConfirmOpen(true)}
            className="h-9 px-4 rounded-md bg-danger text-white text-sm font-medium hover:bg-danger/90 transition inline-flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Open delete confirmation
          </button>
        </div>
      </Section>

      {/* ================= TOASTS ================= */}
      <Section
        title="5. Toast"
        when="After a successful action. Auto-dismisses."
      >
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                pushToast("success", "Staff added", "Fatima Iqbal was added.")
              }
              className="h-9 px-4 rounded-md bg-success text-white text-sm font-medium hover:bg-success/90 transition inline-flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Success
            </button>

            <button
              onClick={() =>
                pushToast("danger", "Failed to save", "Please try again.")
              }
              className="h-9 px-4 rounded-md bg-danger text-white text-sm font-medium hover:bg-danger/90 transition inline-flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Error
            </button>

            <button
              onClick={() =>
                pushToast(
                  "warning",
                  "Cutoff soon",
                  "Roll call closes in 10 minutes."
                )
              }
              className="h-9 px-4 rounded-md bg-warning text-white text-sm font-medium hover:bg-warning/90 transition inline-flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Warning
            </button>

            <button
              onClick={() =>
                pushToast("info", "Syncing", "Fetching latest records…")
              }
              className="h-9 px-4 rounded-md bg-blue text-white text-sm font-medium hover:bg-navy transition inline-flex items-center gap-2"
            >
              <Info className="h-4 w-4" />
              Info
            </button>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Toasts stack in the top-right, auto-dismiss after 3.5s, and can be
            manually closed.
          </p>
        </div>
      </Section>

      {/* ================= Real-world combo ================= */}
      <Section
        title="6. How they work together"
        when="The full flow on a real page."
      >
        <div className="rounded-lg border border-border bg-surface p-5 space-y-3 text-sm">
          <Step n={1} label="Page opens" detail="Show LoadingState" />
          <Step n={2} label="If fetch fails" detail="Show ErrorState with retry" />
          <Step n={3} label="If data is empty" detail="Show EmptyState + action" />
          <Step n={4} label="If data exists" detail="Show the real content" />
          <Step n={5} label="User clicks Delete" detail="Show ConfirmDialog" />
          <Step n={6} label="Action completes" detail="Show Toast" />
        </div>
      </Section>

      {/* Actual confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete staff member?"
        message={
          <>
            <span className="font-medium text-foreground">Fatima Iqbal</span>{" "}
            will be permanently removed from the roster. This cannot be undone.
          </>
        }
        confirmLabel="Delete staff"
        cancelLabel="Keep"
        tone="danger"
        icon={<Trash2 className="h-5 w-5" />}
        onConfirm={() => {
          setConfirmOpen(false);
          pushToast("success", "Staff removed", "Fatima Iqbal was deleted.");
        }}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </PageContainer>
  );
}

/* ---------------- helpers ---------------- */

function Section({
  title,
  when,
  children,
}: {
  title: string;
  when: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="mb-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{when}</p>
      </div>
      {children}
    </section>
  );
}

function Step({
  n,
  label,
  detail,
}: {
  n: number;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-7 w-7 rounded-full bg-navy text-white grid place-items-center text-xs font-semibold shrink-0">
        {n}
      </span>
      <span className="font-medium">{label}</span>
      <span className="text-muted-foreground">→ {detail}</span>
    </div>
  );
}