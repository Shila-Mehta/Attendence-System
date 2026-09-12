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
      <Loader2 className="h-6 w-6 animate-spin text-blue" />
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

export function SkeletonRow({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/60 h-4 ${className}`}
    />
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} className="h-10" />
      ))}
    </div>
  );
}