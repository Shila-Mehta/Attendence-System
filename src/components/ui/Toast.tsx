"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";

export type ToastTone = "success" | "danger" | "warning" | "info";

export type ToastMessage = {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
};

const CONFIG: Record<
  ToastTone,
  { icon: typeof CheckCircle2; color: string; ring: string }
> = {
  success: {
    icon: CheckCircle2,
    color: "text-success",
    ring: "border-success/30 bg-success-light/60",
  },
  danger: {
    icon: XCircle,
    color: "text-danger",
    ring: "border-danger/30 bg-danger-light/60",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-warning",
    ring: "border-warning/30 bg-warning-light/60",
  },
  info: {
    icon: Info,
    color: "text-blue",
    ring: "border-blue/30 bg-blue-light/60",
  },
};

export function Toast({
  toast,
  onDismiss,
  duration = 3500,
}: {
  toast: ToastMessage;
  onDismiss: () => void;
  duration?: number;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [onDismiss, duration]);

  const c = CONFIG[toast.tone];
  const Icon = c.icon;

  return (
    <div
      className={`pointer-events-auto w-full rounded-lg border bg-surface shadow-lg p-4 flex items-start gap-3 ${c.ring}`}
    >
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${c.color}`} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{toast.title}</div>
        {toast.description && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {toast.description}
          </div>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="p-1 rounded-md hover:bg-muted shrink-0 -mt-1 -mr-1"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="
        fixed z-[70] pointer-events-none
        left-4 right-4 top-20
        sm:left-auto sm:right-4 sm:top-20 sm:w-auto
        flex flex-col gap-2
      "
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}