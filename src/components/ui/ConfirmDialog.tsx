"use client";

import { ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  icon,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning" | "primary";
  icon?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  const toneCls =
    tone === "danger"
      ? {
          iconBox: "bg-danger-light text-danger border-danger/20",
          button: "bg-danger text-white hover:bg-danger/90",
        }
      : tone === "warning"
      ? {
          iconBox: "bg-warning-light text-warning border-warning/20",
          button: "bg-warning text-white hover:bg-warning/90",
        }
      : {
          iconBox: "bg-blue-light text-blue border-blue/20",
          button: "bg-blue text-white hover:bg-navy",
        };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
        aria-hidden
      />

      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-lg bg-surface border border-border shadow-xl">
        {/* Grabber (mobile) */}
        <div className="sm:hidden flex justify-center pt-2">
          <span className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="flex items-start gap-4 p-5">
          <span
            className={`h-10 w-10 rounded-lg border grid place-items-center shrink-0 ${toneCls.iconBox}`}
          >
            {icon ?? <AlertTriangle className="h-5 w-5" />}
          </span>

          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold">{title}</h2>
            <div className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {message}
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-md hover:bg-muted shrink-0 -mt-1 -mr-1"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 px-5 pb-5 pt-1 sm:py-3 sm:h-16 sm:pb-0 border-t border-border">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto h-11 sm:h-9 px-4 rounded-md border border-border text-sm hover:bg-muted transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`w-full sm:w-auto h-11 sm:h-9 px-4 rounded-md text-sm font-medium transition ${toneCls.button}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}