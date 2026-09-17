"use client";

import { Loader2 } from "lucide-react";

export function LoadingState({
  title = "Loading…",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="h-12 w-12 rounded-lg bg-blue-light text-blue border border-blue/20 grid place-items-center mb-3">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}